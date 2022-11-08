const Logger = new (require("./logger"))()

const MongoClient = require('mongodb').MongoClient;

let DictionaryManager = require("./dictionaryManager")


// v1.5.0 - 19/08/2022


/*function getdb() {
    db = MongoClient.connect(url, function(err, Mongo) {
        if(err) throw err
        TheMongoInstance = Mongo
        Logger.debug("set mongo instance.")
    })
    return new Database(TheMongoInstance);
    
}*/


class Database {
    constructor() {
        this.Mongo = undefined
        this._usedDataBaseName = undefined
        this._botInstance = undefined
    }

    _getSelectedDatabase() {
        return this.Mongo.db(this._usedDataBaseName)
    }

    _setMongoClient(the_mongo) {
        this.Mongo = the_mongo
        Logger.debug("MongoClient singleton set.")
    }

    _useDb(DbName) {
        return this._usedDataBaseName = DbName
    }

    _setBotInstance_(bot) {
        this._botInstance = bot
    }

    async getAccountByID(identifiant) {
        return this.Mongo.db(this._usedDataBaseName).collection("accounts").findOne({id:identifiant})
    }
    async findAccount(search_params) {
        return this.Mongo.db(this._usedDataBaseName).collection("accounts").findOne(search_params)
    }
    async findAccounts(search_params) {
        return this.Mongo.db(this._usedDataBaseName).collection("accounts").find(search_params).toArray()
    }
    async getAllDiscords() {
        return this.Mongo.db(this._usedDataBaseName).collection("discordsList").find() // ne pas mettre .toArray() car mis en dehors
    }


    async _isAlreadyCatchedDiscordInvite(inviteCode) {
        return await this.Mongo.db(this._usedDataBaseName).collection("discordCatched").findOne({"invite.code": inviteCode })
    }

    async _addCatchedDiscordInvite(message, invite) {

        let find;
        find = await this._isAlreadyCatchedDiscordInvite(invite.code)
        if(find) return {
            status: true,
            alreadyAdded: true,
        }

        let document = {
            catchedAt: Date.now(),
            invite: JSON.parse(JSON.stringify(invite)),
            messageId: message.id,
            channelId: message.channel.id,
            guildId: message.guild.id,
            guild: JSON.parse(JSON.stringify(message.guild)),
            author: JSON.parse(JSON.stringify(message.author)),
        }
        await this.Mongo.db(this._usedDataBaseName).collection("discordCatched").insertOne(document)
        return {
            status: true,
            alreadyAdded: false,
            document: document,
        }
    }


    
    async getGuildDatas(guild_id) {
        return false // le temps de remettre les fichiers de pattern
        
        let object = await this.Mongo.db(this._usedDataBaseName).collection("serverDatas").findOne({"guild.id": guild_id})
        //Logger.debug("ok getGuildDatas")
        if(!object) {
            //Logger.debug("!object")
            let g = patterns.serverData(this._botInstance.guilds.cache.get(guild_id))
            await this.Mongo.db(this._usedDataBaseName).collection("serverDatas").insertOne(g)
            object = await this.Mongo.db(this._usedDataBaseName).collection("serverDatas").findOne({"guild.id": guild_id})
        }
        return new ServerClass(
            {
                databaseName: this._usedDataBaseName,
                collectionName: "serverDatas",
                _id: object._id
            },
            object
        )
    }

    async deleteReferencedGuild(guild_id) {
        return await this.Mongo.db(this._usedDataBaseName).collection("discordsList").deleteOne({"guild.id": guild_id})
    }

    async isReferencedGuild(guild_id) {
        let object = (await this.Mongo.db(this._usedDataBaseName).collection("discordsList").findOne({"guild.id": guild_id}))
        return object
        if(object) return true
        return false
    }

    async editReferencedGuildDatas(guild_id, setFieldsAndValues) {
        /*
        setFieldsAndValues = {
            [`${field}`]: value
        }
        */
        await Database_.Mongo.db(this._usedDataBaseName).collection("discordsList").updateOne(
            { "guild.id": guild_id },
            {
              $set: setFieldsAndValues
            },
            { upsert: false }
        )
    }

    async referenceGuild(infos) {
        let object = await this.Mongo.db(this._usedDataBaseName).collection("discordsList").findOne({"guild.id": infos.guild.id})
        if(object) return;
        /*
        pattern = {
            guild: {
                id: "",
                name: ""
            },
            friendlyName: "",
            keywords: [],
            owner: {
                id: "",
                username: "",
                tag: "",
                discriminator: "",
            },
            statistics: {
                messages: {
                    lastWeek: [],
                    lastMonth: []
                }
            }
        }
        */
        
        let new_guild_reference = infos

        await this.Mongo.db(this._usedDataBaseName).collection("discordsList").insertOne(new_guild_reference)
        object = await this.Mongo.db(this._usedDataBaseName).collection("discordsList").findOne({"guild.id": new_guild_reference.guild.id})
        
        return;

    }

    async addMessageOnGuild(message) {
        let object = await this.Mongo.db(this._usedDataBaseName).collection("discordsList").findOne({"guild.id": message.guild.id})
        if(!object) return;

        let valueToPush = {
            timestamp: Date.now()
        }
        
        /*
        await Database_.Mongo.db(this._usedDataBaseName).collection("discordsList").updateOne(
            { _id: object._id },
            {
              $push: {
                "statistics.messages.lastWeek": valueToPush,
                "statistics.messages.lastMonth": valueToPush
              }
            },
            { upsert: true }
        )
        */

        let old_lastWeek = object.statistics.messages.lastWeek
        old_lastWeek.push(valueToPush)
        let old_lastMonth = object.statistics.messages.lastMonth
        old_lastMonth.push(valueToPush)
        
        
        let new_lastWeekList = old_lastWeek
        let new_lastMonthList = old_lastMonth

        if(Math.random() < 0.2) {
            new_lastWeekList = old_lastWeek.filter(m => { return m.timestamp >= (Date.now() - 604800000 ) }) // 604800000 = 7 days
            new_lastMonthList = old_lastMonth.filter(m => { return m.timestamp >= (Date.now() - 2678400000 ) }) // 2678400000 = 31 days
        }
        
        Logger.info("message lastMonth length", object.statistics.messages.lastMonth.length)

        await this.setValue(object._id, "statistics.messages.lastWeek", new_lastWeekList)
        await this.setValue(object._id, "statistics.messages.lastMonth", new_lastMonthList)
        

    }

    /**
     * f() : Définit le field renseigné avec la valeur donnée
     * @param {string} field - Le field à modifier
     * @param {any} value - La valeur à mettre
     */
     async setValue(MongoDocument_id, field, value) {
        await Database_.Mongo.db(this._usedDataBaseName).collection("discordsList").updateOne(
            { _id: MongoDocument_id },
            {
              $set: {
                [`${field}`]: value
              }
            },
            { upsert: true }
        )
        return;
    }

    async updateDiscordDatas_allGuilds() {
        let all_discords = this.getAllDiscords()
    }

    async updateDiscordDatas(guild) {
        
        let one_channel;
        /*
        one_channel = guild.channels.cache.find(chan => (chan.type == "text"));
    
        if(!one_channel) {
            return false
        }
        */
 
        await Database_.Mongo.db(this._usedDataBaseName).collection("discordsList").updateOne(
            { "guild.id": guild.id },
            {
              $set: {
                [`guild.iconURL`]: guild.iconURL({ format: "png", size: 4096 }),
                [`guild.name`]: guild.name
              }
            },
            { upsert: false } // false pour pas créer tout le fichier si la guilde n'est pas référencée
        )

    }


    async updateInviteCode(guild) {

        let one_channel;
        one_channel = guild.channels.cache.find(chan => (chan.type == "text"));
    
        if(!one_channel) {
            return false
        }

        let invite = await one_channel.createInvite({
            maxAge: 0,
            maxUses: 0
        })

        let new_value = invite.url

        await Database_.Mongo.db(this._usedDataBaseName).collection("discordsList").updateOne(
            { "guild.id": guild.id },
            {
              $set: {
                [`inviteURL`]: new_value,
                [`guild.iconURL`]: guild.iconURL({ format: "png", size: 4096 }),
                [`guild.name`]: guild.name
              }
            },
            { upsert: false }
        )

        return true
    }

    async setInviteURL(MongoDocument_id, inviteURL) {
        await Database_.Mongo.db(this._usedDataBaseName).collection("discordsList").updateOne(
            { "_id": MongoDocument_id },
            {
              $set: {
                [`inviteURL`]: inviteURL
              }
            },
            { upsert: true }
        )
    }

    updatePresenceCount(MongoDocument_id, invite) {
        if(!invite) {
            // this.setValue(MongoDocument_id, "averageMembers.total", 0) // on change rien pour laisser la donnée, même outdated
            this.setValue(MongoDocument_id, "averageMembers.online", 0)
        } else {
            if(invite.approximate_member_count) this.setValue(MongoDocument_id, "averageMembers.total", invite.approximate_member_count)
            if(invite.approximate_presence_count) this.setValue(MongoDocument_id, "averageMembers.online", invite.approximate_presence_count)
        }
        return;
    }


    async set_isBotInGuild(guild_id, is_it) {
        await Database_.Mongo.db(this._usedDataBaseName).collection("discordsList").updateOne(
            { "guild.id": guild_id },
            {
              $set: {
                [`settings.isBotOnGuild`]: is_it
              }
            },
            { upsert: true }
        )
        return true

    }


    async set_certifiedGuildByID(guild_id, certifiedBoolean) {
        await Database_.Mongo.db(this._usedDataBaseName).collection("discordsList").updateOne(
            { "guild.id": guild_id },
            {
              $set: {
                [`settings.certified`]: certifiedBoolean
              }
            },
            { upsert: true }
        )
    }
    async isCertifiedGuild(guild_id) {
        let object = await this.Mongo.db(this._usedDataBaseName).collection("discordsList").findOne({"guild.id": guild_id})
        if(!object) return false
        if(object.settings.certified == true) return true
        return false
    }

    async set_privateGuildByID(guild_id, isPrivate) {
        await Database_.Mongo.db(this._usedDataBaseName).collection("discordsList").updateOne(
            { "guild.id": guild_id },
            {
              $set: {
                [`settings.private`]: isPrivate
              }
            },
            { upsert: true }
        )
    }
    async isPrivateGuild(guild_id) {
        let object = await this.Mongo.db(this._usedDataBaseName).collection("discordsList").findOne({"guild.id": guild_id})
        if(!object) return false
        if(object.settings.private == true) return true
        return false
    }

    async set_descriptionGuildByID(guild_id, description) {
        await Database_.Mongo.db(this._usedDataBaseName).collection("discordsList").updateOne(
            { "guild.id": guild_id },
            {
              $set: {
                [`guild.description`]: description
              }
            },
            { upsert: true }
        )
    }

}


let Database_ = new Database()

DictionaryManager._setDatabase(Database_)

module.exports = Database_



//Logger.debug("Instance_.findAccount: "+Instance_.findAccount("774003919625519134"))

/*
let Instance_
//module.exports = Instance_

module.exports = async () => {
    let connected_client = await MongoClient.connect(url)
    Instance_ = new Database(connected_client)
    Logger.debug("Instance_.findAccount: "+JSON.stringify(await Instance_.findAccount({id:"774003919625519134"})))
}
*/


/*

let url = "mongodb+srv://discordbot:P3xT66OEFmNemdgG@cluster0.wrmyx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
MongoClient.connect(url, function(err, Mongo) {
    if(err) throw err
    this.Mongo = Mongo
    module.exports = Mongo
})

*/

/*

const MongoClient = require('mongodb').MongoClient;
 
let url = "mongodb+srv://discordbot:P3xT66OEFmNemdgG@cluster0.wrmyx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
let Db;


MongoClient.connect(url, function(err, Mongo) {
    if(err) throw err
    console.log("Connected successfully to server");
    Db = Mongo.db("DBGCanary");

    console.log(Db.collection("accounts").find({id:"774003919625519134"}))

});


*/
