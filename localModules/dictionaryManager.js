

const Logger = new (require("./logger"))()
const { off } = require("process");
let somef = require("./someFunctions")


// v1.5.0 - 19/08/2022


/*function getdb() {
    db = MongoClient.connect(url, function(err, Mongo) {
        if(err) throw err
        TheMongoInstance = Mongo
        Logger.debug("set mongo instance.")
    })
    return new Database(TheMongoInstance);
    
}*/


class DictionaryManager {
    constructor() {
        this.Database = undefined;
    }

    _setDatabase(Database) {
        this.Database = Database
    }


    async getAllWords() {
        return await this.Database._getSelectedDatabase().collection("dictionary").find({})
    }


    async testIfWordExists(params) {
        /*
        params = {
            french: "francais",
            listenbourgeois: "listenbourgeois",
        }*/
        
        let french = await this.Database._getSelectedDatabase().collection("dictionary").findOne({
            "french": params.french
        })
        let listenbourgeois = await this.Database._getSelectedDatabase().collection("dictionary").findOne({
            "listenbourgeois": params.listenbourgeois
        })
 
        return {
            wordExists: (french || listenbourgeois),
            french: french,
            listenbourgeois: listenbourgeois,
        }
        


    }


    getLastLogs(dbObject, amount) {
        let the_list = []
        /*
        dbObject = {
            logs: [
                {
                    timestamp: Date.now(),
                    reason: `raison`,
                    author: Discord.User,
                    before: {
                        french: "french",
                        listenbourgeois: "listenbourgeois",
                        nature: "nature",
                        description: "description"
                    },
                    before: {
                        french: "french",
                        listenbourgeois: "listenbourgeois",
                        nature: "nature",
                        description: "description"
                    }
                }
            ]
        }
        */
        if(dbObject.logs.length == 0) {
            return [`Aucun log à afficher.`]
        }
        let logs = dbObject.logs.sort((a,b) => {
            return b.timestamp - a.timestamp // plus grand timestamp au plus petit (plus récent à plus ancient)

        })
        for(let i in logs) {
            let frenchChanged = `${logs[i].before.french != logs[i].after.french ? `French:\`${logs[i].before.french}\`->\`${logs[i].after.french}\`` : ""}`
            let listenbourgeoisChanged = `${logs[i].before.listenbourgeois != logs[i].after.listenbourgeois ? `Listenbourgeois:\`${logs[i].before.listenbourgeois}\`->\`${logs[i].after.listenbourgeois}\`` : ""}`
            let natureChanged = `${logs[i].before.nature != logs[i].after.french ? `Nature:\`${logs[i].before.nature}\`->\`${logs[i].after.nature}\` ` : ""}`
            the_list.push(`[${(new Date(logs[i])).toLocaleString()}] ${logs[i].author.tag} =>`)
            if(frenchChanged.length != 0) the_list.push(`  -> ${frenchChanged}`)
            if(listenbourgeoisChanged.length != 0) the_list.push(`  -> ${listenbourgeoisChanged}`)
            if(natureChanged.length != 0) the_list.push(`  -> ${natureChanged}`)
        }
        return the_list
    }


    async addWord(params) {
        /*
        params = {
            french: "francais",
            listenbourgeois: "listenbourgeois",
            nature: "nature",
            description: "description?",
            author: Discord.User
        }
        */
       

        function getDatehash(withMilliseconds=false) {
            let d = (new Date())
            return `${d.getDate()}${d.getMonth()}${d.getFullYear()}-${d.getHours()}${d.getMinutes()}${d.getSeconds()}${withMilliseconds ? d.getMilliseconds() : ""}`
        }

        let hash = `${somef.sum((getDatehash(true)).split("").map(x => parseInt(x)))}`
        hash = getDatehash()

        let word_id = `${getDatehash()}#${somef.genHex(6)}-${somef.genHex(6)}-${somef.genHex(6)}`

        word_id = `${somef.genHex(6)}-${somef.genHex(6)}`

        let the_author = JSON.parse(JSON.stringify(params.author))

        the_author.tag = `${the_author.username}#${the_author.discriminator}`

        let new_word = {
            wordID: word_id,
            createdTimestamp: Date.now(),
            french: params.french.trim(),
            nature: params.nature.trim(),
            listenbourgeois: params.listenbourgeois.trim(),
            description: params.description.trim(),
            author: the_author,
            logs: [],
        }
        await this.Database._getSelectedDatabase().collection("dictionary").insertOne(new_word)
        return new_word
    }


    isWordIDCode(text) {
        if(text.length != 13) return false        
        let all_list = []
        let letters = "0123456789abcdef".split("")
        for(let i in letters) {
            all_list.push({ s: letters[i], j: ""})
        }
        let t = somef.replaceAllInText(text, all_list)
        t = t.replace("-","")
        if(t == "") return true
        else return false
    }


    async getWordByWordID(wordID) {
        return await this.Database._getSelectedDatabase().collection("dictionary").findOne({
            "wordID": wordID
        })
    }
    async getWordByListenbourgWord(listenbourgWord) {
        return await this.Database._getSelectedDatabase().collection("dictionary").findOne({
            "listenbourgeois": listenbourgWord
        })
    }

    async editWord(params) {
        /*
        params = {
            wordID: "id", // l'id à modifier
            reason: reason,
            new_french: modif_french,
            new_listenbourgeois: modif_listenbourgeois,
            new_nature: modif_nature,
            new_description: modif_description,
        }
        */

        let editBy;

        let word_byID = await this.getWordByWordID(params.wordID)
        let word_byListenbourgeois = this.getWordByListenbourgWord(params.wordID)

        if(word_byID) {
            editBy = "wordID"
        } else if(word_byListenbourgeois) {
            editBy = "listenbourgeois"
        } else {
            return {
                edited: false,
                message: `Aucun mot trouvé dans le dictionnaire correspondant à la requête donnée. [Error#1]`,
            }
        }

        let actualDocument;
        if(editBy == "wordID") {
            actualDocument = await this.Database._getSelectedDatabase().collection("dictionary").findOne({
                "wordID": params.wordID
            })
        } else {
            actualDocument = await this.Database._getSelectedDatabase().collection("dictionary").findOne({
                "listenbourgeois": params.wordID
            })
        }

        if(!actualDocument) {
            return {
                edited: false,
                message: `Aucun mot trouvé dans le dictionnaire correspondant à la requête donnée. [Error#2]`,
            }
        }

        
        let setFieldsAndValues = {
            [`french`]: (params.new_french ?? actualDocument.french),
            [`listenbourgeois`]: (params.new_listenbourgeois ?? actualDocument.listenbourgeois),
            [`nature`]: (params.new_nature ?? actualDocument.nature),
            [`description`]: (params.new_description ?? actualDocument.description),
        }
        
        if(editBy == "wordID") {
            await this.Database._getSelectedDatabase().collection("dictionary").updateOne(
                { "wordID": params.wordID },
                {
                  $set: setFieldsAndValues
                },
                { upsert: false }
            )
        } else {
            await this.Database._getSelectedDatabase().collection("dictionary").updateOne(
                { "listenbourgeois": params.wordID },
                {
                  $set: setFieldsAndValues
                },
                { upsert: false }
            )
        }

        let after_document = JSON.parse(JSON.stringify(actualDocument))
        after_document.french = (params.new_french ?? actualDocument.french)
        after_document.listenbourgeois = (params.new_listenbourgeois ?? actualDocument.listenbourgeois)
        after_document.nature = (params.new_nature ?? actualDocument.nature)
        after_document.description = (params.new_description ?? actualDocument.description)

        return {
            edited: true,
            before: actualDocument,
            after: after_document,
        }

    }
    
    async removeWord(params) {
        /*
        params = {
            wordID: "id",
            listenbourgeois: "listenbourgeois",
            reason: "raison"
        }
        */
        // this.isWordIDCode()
        try {
            let oldObject;

            if(this.isWordIDCode(params.wordID)) {
                oldObject = await this.getWordByWordID(params.wordID)
                if(oldObject) {
                    await this.Database._getSelectedDatabase().collection("dictionary").deleteOne({
                        "wordID": params.wordID
                    })
                    return {
                        removed: true,
                        removedBy: "wordID",
                        message: "",
                        oldObject: oldObject,
                    }
                }
            }

            oldObject = (await this.getWordByListenbourgWord(params.wordID)) || undefined

            if(oldObject) {
                await this.Database._getSelectedDatabase().collection("dictionary").deleteOne({
                    "listenbourgeois": params.listenbourgeois
                })
                return {
                    removed: true,
                    removedBy: "listenbourgeois",
                    message: "",
                    oldObject: oldObject,
                }
            }

            return {
                removed: false,
                message: "Aucun mot trouvé dans le dictionnaire avec la requete donnée.",
            }

        } catch(e) {
            return {
                removed: false,
                error: `${e}`,
                stack: e.stack.split("\n")
            }
        }

    }

}


let Manager = new DictionaryManager()

module.exports = Manager