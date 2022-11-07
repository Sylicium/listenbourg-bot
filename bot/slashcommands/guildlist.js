

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")
const { FindOperators } = require("mongodb")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "guildlist",
            description: "Liste les guildes et si elle sont référencée.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: []
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
            user: []
        },
        rolesNeeded: [],
        superAdminOnly: true,
        disabled: false,
        indev: false,
        hideOnHelp: true
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

        await interaction.deferReply({ ephemeral: true })

        let allGuilds = await (await Modules.Database.getAllDiscords()).toArray()

        //logger.debug("allGuilds",allGuilds)

        let ico = {
            on: config.emojis.bluebutton.tag,
            off: config.emojis.whitebutton.tag,
            bar_l: config.emojis.whitebarleft.tag,
            bar: config.emojis.whitebar.tag,
            bar_r: config.emojis.whitebarright.tag,
        }

        function getB(boolean) { return (boolean ? ico.on : ico.off) }

        let GlobalInfos = {
            referencedGuilds: 0,
            unreferencedGuilds: 0,
            privateGuilds: 0,
            certifiedGuilds: 0,
            referencedWithoutBot: 0
        }

        let txtfile_lines = [
            `Référencée | Certifiée | privée | Le bot est dessus`,
            "",
            "////////////////////////////    All guilds with bot    ////////////////////////////",
        ]

        let lines = [
            `Référencée | Certifiée | privée | Le bot est dessus`,
            "",
            `${ico.bar_l}${ico.bar}${ico.bar}${ico.bar} **All guilds with bot** ${ico.bar}${ico.bar}${ico.bar}${ico.bar_r}`,
        ]

        function get_guildDbObject(id) {
            let temp = allGuilds.filter((item) => {
                if(item.guild.id == id) return true
                return false
            })
            if(temp.length > 0) return temp[0]
            else return undefined
        }

        let allGuildIDsBotIsOn = bot.guilds.cache.map(guild => guild.id)
        function isBotOnGuild(id) { return (allGuildIDsBotIsOn.indexOf(id) != -1) }


        let guild_list = bot.guilds.cache.map((guild) => {
            let DBObject = get_guildDbObject(guild.id)
            return {
                guild: guild,
                referenced: (!!DBObject),
                private: (DBObject ? DBObject.settings.private : false),
                certified: (DBObject ? DBObject.settings.certified : false)
            }
        })
        
        function isThereWordsInto(text) {
            let l = ["général", "general", "discussion", "discussions", "géneral"]
            for (let i in l) {
                if (text.toLowerCase().indexOf(l[i]) != -1) return true
            }
            return false
        }
        
        function getOneChannelInGuild(guild) {
            let one_channel;
            one_channel = guild.channels.cache.find(chan => (chan.type == "text" && isThereWordsInto(chan.name)));

            if (!one_channel) {
                guild.channels.cache.forEach(channel => {
                    if (!one_channel) {
                        if (channel.type == "text" || channel.type == 0) {
                            one_channel = channel
                        }
                    }
                });
            }
            return one_channel
        }

        let guild_list_stringlist = await Promise.all(guild_list.map(async (item,index) => {

            txtfile_lines.push(`${(item.referenced ? "✅" : "❌")} ${(item.certified ? "💚" : "❌")} ${(item.referenced ? (item.private ? "⛔" : "🌎") : "❌")} ${(item.guild ? "🤖" : "✖")} ${item.guild.name} (ID:${item.guild.id})`)

            if(item.referenced) { GlobalInfos.referencedGuilds++ } else { GlobalInfos.unreferencedGuilds++ }
            if(item.certified) { GlobalInfos.certifiedGuilds++ }
            if(item.private) { GlobalInfos.privateGuilds++ }
            if(true) {} else { GlobalInfos.referencedWithoutBot ++ } // cause bot is on all those guild because of bot.guild.cache lol

            if(!item.referenced) {
                try {
                    let one_channel = getOneChannelInGuild(item.guild)
                    let invite = await one_channel.createInvite(
                        {
                            maxAge: 60*15, // maximum time for the invite, in milliseconds
                            maxUses: 100 // maximum times it can be used
                        },
                        `Invitation automatique créé par le bot ${bot.user.tag}.`
                    )

                    return `[${getB(item.referenced)} ${getB(item.certified)} ${getB(item.private)} ${getB(item.guild)} ${item.guild.name}](https://discord.gg/${invite.code} "Rejoindre le serveur")`
                    /*
                        logger.warn(e)
                        return `[${getB(item.referenced)} ${getB(item.certified)} ${getB(item.private)} ${getB(item.guild)} ${item.guild.name}](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id} "Error while creating invite")`
                    })*/
                } catch(e) {
                    logger.warn(e)
                    return `[${getB(item.referenced)} ${getB(item.certified)} ${getB(item.private)} ${getB(item.guild)} ${item.guild.name}](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id} "Error while creating invite")`
                }
            } else {
                return `${getB(item.referenced)} ${getB(item.certified)} ${getB(item.private)} ${getB(item.guild)} ${item.guild.name}`
            }
        }))

        for(let i in guild_list_stringlist) {
            lines.push(guild_list_stringlist[i])
        }

        lines.push("\n")
        lines.push(`${ico.bar_l}${ico.bar}${ico.bar}${ico.bar} **Referenced without bot** ${ico.bar}${ico.bar}${ico.bar}${ico.bar_r}`)
        lines.push("")
        txtfile_lines.push("\n")
        txtfile_lines.push(`////////////////////////////    Referenced without bot    ////////////////////////////`)
        txtfile_lines.push("")

        let guild_list2 = allGuilds.filter((object) => {
            return !(isBotOnGuild(object.guild.id))
        }).map((object) => {
            let isOnGuild = isBotOnGuild(object.guild.id)
            txtfile_lines.push(`${(object ? "✅" : "❌")} ${(object.settings.certified ? "💚" : "❌")} ${(object ? (object.settings.private ? "⛔" : "🌎") : "❌")} ${(isOnGuild ? "🤖" : "✖")} ${object.guild.name} (ID:${object.guild.id})`)

            if(object) { GlobalInfos.referencedGuilds++ } else { GlobalInfos.unreferencedGuilds++ }
            if(object.settings.certified) { GlobalInfos.certifiedGuilds++ }
            if(object.settings.private) { GlobalInfos.privateGuilds++ }
            if(isOnGuild) {} else { GlobalInfos.referencedWithoutBot ++ }

            return {
                guild: object.guild,
                isBotOnGuild: isOnGuild,
                referenced: (!!object),
                private: (object ? object.settings.private : false),
                certified: (object ? object.settings.certified : false)
            }
        })
        let guild_list2_stringlist = guild_list2.map((item,index) => {
            return `${getB(item.referenced)} ${getB(item.certified)} ${getB(item.private)} ${getB(item.isBotOnGuild)} ${item.guild.name}`
        }) 
        //lines.concat(guild_list2_stringlist)
        for(let i in guild_list2_stringlist) {
            lines.push(guild_list2_stringlist[i])
        }
        

        lines = lines.concat([
            "\n",
            `**${GlobalInfos.referencedGuilds}** total referenced guilds`,
            `**${GlobalInfos.unreferencedGuilds}** total unreferenced guilds with bot on it`,
            `**${GlobalInfos.referencedWithoutBot}** guilds referenced without bot.`,
            `\`${GlobalInfos.certifiedGuilds}\`/\`${GlobalInfos.referencedGuilds}\` certified guilds`,
            `\`${GlobalInfos.privateGuilds}\`/\`${GlobalInfos.referencedGuilds}\` private referenced guilds with bot on it`,
        ])
        
        let embeds = []

        function splitArrayIntoChunksOfLen(arr, len) {
            var chunks = [], i = 0, n = arr.length;
            while (i < n) {
              chunks.push(arr.slice(i, i += len));
            }
            return chunks;
        }

        //logger.debug("guildlist 0 lines:",lines)

        let all_lines = splitArrayIntoChunksOfLen(lines, 20)
        all_lines = all_lines.map((chunk) => { return chunk.join("\n")})

        //logger.debug("guildlist 1 all_lines:",all_lines)
        //logger.debug("guildlist 2 lengths of all_lines:", all_lines.map((x) => { return x.length}))


        embeds = all_lines.map((item,index) => {
            if(index == 0) {
                return (
                    new Discord.EmbedBuilder()
                        .setTitle("Liste des guilde")
                        .setColor("FFFFFF")
                        .setDescription(item)
                        .setFooter({ text: "Réf? | ✅? | ⛔? | 🤖?" })
                )
            } else {

                return (
                    new Discord.EmbedBuilder()
                        .setColor("FFFFFF")
                        .setDescription(item)
                        .setFooter({ text: "Réf? | ✅? | ⛔? | 🤖?" })
                )
            }
        })



        for(let i in embeds) {
            if(i == 0) {
                await interaction.editReply({
                    embeds: [ embeds[i] ],
                    ephemeral: true
                })
            } else {

                await interaction.followUp({
                    embeds: [ embeds[i] ],
                    ephemeral: true
                })
            }
        }


        
        let the_date = (new Date()).toLocaleString("fr")
        let the_date_filename = ((new Date()).toLocaleString("fr")).split("/").join("-")
        .split(",").join("").split(" ").join("_").replace(":","h").replace(":","m") + "s"



        let all_txtfile_text = [
            `Referenced guild list of @${bot.user.tag} (${bot.user.id}) at ${the_date}`,
            `${GlobalInfos.referencedGuilds} total referenced guilds`,
            `${GlobalInfos.unreferencedGuilds} total unreferenced guilds with bot on it`,
            `${GlobalInfos.referencedWithoutBot} guilds referenced without bot.`,
            `${GlobalInfos.certifiedGuilds} / ${GlobalInfos.referencedGuilds} certified guilds`,
            `${GlobalInfos.privateGuilds} / ${GlobalInfos.referencedGuilds} private referenced guilds with bot on it`,
            `\n\n`,
        ].join("\n") + txtfile_lines.join("\n")

        await interaction.followUp({
            content: "List at txt format:",
            files: [
                new Discord.AttachmentBuilder(Buffer.from(all_txtfile_text, 'utf-8'), { name: `ReferencedGuilds_Listenbourg_${the_date_filename}.txt`})
            ],
            ephemeral: true
        })
        
        
        return;


    }
}
