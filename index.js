

try {
    require("dotenv").config()
} catch(e) {}

let config = require('./config')

let inDev = config.inDev


function writeUncaughException(e, title) {
    console.error("[BOT] Uncaught Exception or Rejection", e.stack)
    console.error(e.stack.split("\n"))
    const fs = require('fs')

    let date = (new Date).toLocaleString("fr-FR")

    if (!title) title = "/!\\ UNCAUGH ERROR /!\\"

    let log_text = `${title} ${e.stack.split("\n").join("\n")}\n`

    //console.log(`[${date} ERROR] (unknown): /!\\ UNCAUGH ERROR /!\\ ${e.stack}`)
    if (!fs.existsSync("./logs/mainUncaugh.log")) {
        fs.writeFileSync("./logs/mainUncaugh.log", `File created on ${date}\n\n`)
    }
    let log_text_split = log_text.split("\n")
    for (let i in log_text_split) {
        fs.appendFileSync("./logs/mainUncaugh.log", `[${date} ERROR] (unknown): ${log_text_split[i]}\n`, 'utf8');
    }

    try {
        let bot = new Discord.Client()

        bot.on("ready", ready => {
            bot.channels.cache.get("1008343948093313076").send(`@everyone **${e}** \`\`\`js\n${e.stack}\`\`\` `)
        })
    } catch (err) {
        //console.log(err)
    }
    
}


process
    .on('unhandledRejection', (reason, p) => {
        console.log(reason, '[BOT] Unhandled Rejection at Promise', p);
        writeUncaughException(reason, "Unhandled Rejection (process.on handle)")
    })
    .on('uncaughtException', err => {
        console.log(err, '[BOT] Uncaught Exception thrown BBBBBBBBBB');
        writeUncaughException(err, "Uncaught Exception (process.on handle)")
    });

const Discord = require("discord.js")
const discordInv = require('discord-inv');
let _normalize = require('normalize-strings');
let Intents = Discord.Intents
let EmbedBuilder = Discord.EmbedBuilder
const fs = require("fs");
//const { SlashCommandBuilder } = require("discordjs/builders")
let somef = require('./localModules/someFunctions')
let botf = require('./bot/botLocalModules/botFunctions')
const axios = require("axios")


/*
https://discord.com/api/oauth2/authorize?client_id=968799075686289409&permissions=2147601409&scope=bot%20applications.commands

ADMIN:
https://discord.com/api/oauth2/authorize?client_id=968799075686289409&permissions=8&scope=bot%20applications.commands
*/

let Logger = new (require("./localModules/logger"))()
const Database = require("./localModules/database");
const MongoClient = require('mongodb').MongoClient;

let url = process.env.MONGODB_URL


Logger.info("=======================================")
Logger.info("========== [Starting script] ==========")
Logger.info("=======================================")


const server = require("./server")

const Modules = {
    "config": config,
    "somef": somef,
    "botf": botf,
    "_normalize": _normalize,
    "Database": Database,
    "Discord": Discord,
    "discordInv": discordInv,
    "server": server,
    "axios": axios
}


let bot = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.DirectMessageReactions,
        Discord.GatewayIntentBits.DirectMessageTyping,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.GuildBans,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
        Discord.GatewayIntentBits.GuildIntegrations,
        Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildMessageTyping,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildScheduledEvents,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildWebhooks,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.MessageContent
    ],
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
        Discord.Partials.GuildScheduledEvent,
        Discord.Partials.Message,
        Discord.Partials.Reaction,
        Discord.Partials.ThreadMember,
        Discord.Partials.User
    ],
    presence: {
      status: 'idle',
      activity: {
        name: `le démarrage...`,
        type: 'WATCHING'
      }
    }
})

bot.botf = botf

function isSuperAdmin(id) {
    if (config.superAdminList.indexOf(id) != -1) return true
    return false
}

Object.size = function(arr) {
    var size = 0;
    for (var key in arr) {
        if (arr.hasOwnProperty(key)) size++;
    }
    return size;
};



Logger.info("Tentative de connection à MongoDB...")
MongoClient.connect(url, function(err, Mongo) {
    if (err) throw err
    Database._setMongoClient(Mongo)
    Database._useDb("ListenbourgDev")
    Logger.info("  Mongo instance connected.")
    _allCode()
})


function _allCode() {
    /*
    */

    bot.on("debug", (...args) => {
        Logger.debug("[BOT.debug]",...args)
    })


    bot.commands = {}
    bot.commands.slashCommands = new Discord.Collection();

    let SlashCommandsCollection = []
    
    fs.readdirSync("./bot/slashcommands").forEach(file => {
        if(file.endsWith(".js")) {
            try {
                let fileName = file.split(".")
                fileName.pop()
                fileName.join(".")

                temp = require(`./bot/slashcommands/${fileName}`)
                SlashCommandsCollection.push({
                    commandInformations: temp.commandInformations,
                    require: temp
                });
                bot.commands.slashCommands.set(temp.commandInformations.commandDatas.name, {
                    commandInformations: temp.commandInformations,
                    require: temp
                });
                Logger.info(`✔ Successfully loaded command ${temp.commandInformations.commandDatas.name}`)
            } catch(e) {
                Logger.warn(`❌ Failed loading command of file /slashcommands/${file}`,e)
            }
        }
    });
 
    bot.on("ready", () => {
        Logger.info(`[BOT]: Bot démarré en tant que ${bot.user.tag}`)
        //console.log(`Bot démarré en tant que ${bot.user.tag} | ${Object.size(bot.guilds.cache)} serveurs rejoints`)

        checkAnRecreateInvites()
        setInterval(checkAnRecreateInvites, 1000 * 3600 * 1)
        
        
        try {

            if(config.bot.setApplicationCommandsOnStart) {
                Logger.warn("❕ Penser à désactiver le config.bot.setApplicationCommandsOnStart pour ne pas recharger les commandes à chaque démarrage.")
                let commandDatas_ = SlashCommandsCollection.map(x => { return x.commandInformations.commandDatas })
                if(config.bot.setApplicationCommandsInLocal) {
                    for(let i in config.bot.setApplicationCommandsInLocal_guilds) {
                        let guild = bot.guilds.cache.get(config.bot.setApplicationCommandsInLocal_guilds[i])
                        try {
                            guild.commands.set(commandDatas_)
                            Logger.info(`✔ Successfully reloaded guild commands for ${guild.name} (${guild.id})`)
                        } catch(e) {
                            try {
                                Logger.warn(`❌ Failed to reload guild commands for ${guild.name} (${guild.id})`,e)
                            } catch(err) {
                                Logger.warn(`❌❌ Failed to reload guild commands for UNKNOW guild`,e)
                            }
                        }
                    }
                } else {
                    try {
                        bot.application.commands.set(commandDatas_)
                        Logger.info(`✔ Successfully reloaded global application commands.`)
                    } catch(e) {
                        Logger.warn(`❌ Failed to reload global application commands.`,e)
                    }
                }
            }
            Logger.info("✅ Chargement des slash commandes terminé")

        } catch(e) {
            Logger.debug(e)
        }
    })



    bot.on("interactionCreate", async (interaction) => {

        if(!interaction.guild) return;
        if(interaction.user.bot) return;

        interaction.guild.me_ = () => { return interaction.guild.members.cache.get(bot.user.id) }

        Logger.debug("interaction [command]",interaction)
    
        let data = await Database.getGuildDatas(interaction.guild.id)
    
        Logger.debug("Got interaction: "+interaction)
    
        if(!interaction.isCommand()) return;

        console.log("interaction.command",interaction.command)

       



        let cmd = bot.commands.slashCommands.get(interaction.commandName)

        if(!cmd) {
            return interaction.reply({
                content: ":x: Commande inconnue. [code#01]",
                ephemeral: true
            })
        }

        let hasPerm_bot1 = botf.checkPermissionsInChannel(
            [ "VIEW_CHANNEL", "SEND_MESSAGES" ].concat(cmd.require.commandInformations.permisionsNeeded.bot),
            interaction.guild.me_(),
            interaction.channel,
            true
        )
        
        let hasPerm_bot2 = botf.checkPermissions(cmd.require.commandInformations.permisionsNeeded.bot, interaction.guild.me_(), true)
        let hasPerm_bot = {
            havePerm: hasPerm_bot1.havePerm && hasPerm_bot2.havePerm,
            missingPermissions: somef.removeDuplicates(hasPerm_bot1.missingPermissions.concat(hasPerm_bot2.missingPermissions))
        }

        //Logger.debug(`BOT checking perms: ${cmd.require.commandInformations.permisionsNeeded.bot} : `,hasPerm_bot)
        let hasPerm_user = botf.checkPermissions(cmd.require.commandInformations.permisionsNeeded.user, interaction.member)
        //Logger.debug(`BOT checking perms: ${cmd.require.commandInformations.permisionsNeeded.user} : `,hasPerm_user)

        if(!hasPerm_bot.havePerm) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("FF0000")
                        .setTitle(`🤖 Aie.. Le bot manque de permissions!`)
                        .setDescription(`Il a besoin des permissions suivantes:\n${hasPerm_bot.missingPermissions.map((x) => {
                            return `\`${x}\``
                        }).join(", ")}`)
                        .setFooter({ text: `Essayez de contacter un administrateur.` })
                ],
                ephemeral: false
            }).then(() => { }).catch(e => {
                interaction.reply({
                    content: [
                        `**🤖 Aie.. Le bot manque de permissions!**`,
                        `Il a besoin des permissions suivantes:`,
                        `${hasPerm_bot.missingPermissions.map((x) => {
                            return `\`${x}\``
                        }).join(", ")}`,
                        ``,
                        `_Essayez de contacter un administrateur._`
                    ].join("\n")
                })
            })
        }
        if(!hasPerm_user.havePerm && !somef.isSuperAdmin(interaction.user.id)) {
            return interaction.reply({
                content: `⛔ Halte! Tu n'a pas la permission d'utiliser cette commande.\nIl te manque une de ces permissions: ${cmd.require.commandInformations.permisionsNeeded.user.map((x) => {
                    return `\`${x}\``
                }).join(", ")}`,
                ephemeral: true
            })
        }
    
        /*
        let filtered = SlashCommandsCollection.filter(x => {
            return x.commandInformations.commandDatas.name == interaction.command.name
        })
        */
    
        
    
        if(cmd.require.commandInformations.superAdminOnly && !somef.isSuperAdmin(interaction.user.id)) {
            return interaction.reply({
                content: `⛔ Commande SUPER_ADMIN uniquement.`,
                ephemeral: true
            }) 
        }
        if(cmd.require.commandInformations.disabled && !somef.isSuperAdmin(interaction.user.id)) {
            return interaction.reply({
                content: `⛔ Commande désactivée.`,
                ephemeral: true
            }) 
        }
        if(cmd.require.commandInformations.indev && !somef.isSuperAdmin(interaction.user.id)) {
            return interaction.reply({
                content: `🛠 Commande en développement`,
                ephemeral: true
            }) 
        }


        if(!cmd || !cmd.require) {
            return interaction.reply({
                content: `:x: Commande non prise en charge.`,
                ephemeral: true
            })
        }

        
        cmd.require.execute(Modules, bot, interaction, data).catch(async err => {
            Logger.warn(`Command crashed`,err)
            let the_error_msg = {
                content: "",
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle(`:x: Woops, looks like the command crashed.`)
                        .setColor("FF0000")
                        .setDescription(`\`\`\`js\n${err.stack}\`\`\``)
                ]
            }
            try {
                await interaction.reply(the_error_msg)
            } catch(e) {
                await interaction.editReply(the_error_msg)
            }
        })

    })


    bot.on('interactionCreate', async interaction => {

        if (!interaction.isButton()) return;
        
        if(!interaction.guild) return;
        if(interaction.user.bot) return;

        interaction.guild.me_ = () => { return interaction.guild.members.cache.get(bot.user.id) }

        Logger.debug("Got interaction button: "+interaction)

        let data = await Database.getGuildDatas(interaction.guild.id)



        //console.log(interaction);
    });



    /* SPECIAL EVENT CODE FOR 15/02/2023 00h00 to 15/02/2023 23h59 : ONLY CAPSLOCK EVENT*/

    bot.on('messageCreate', async message => {
        console.log("message:",message)
        if(!message.guild) return;
        if(message.author.bot) return;

        console.log("Date.now()",Date.now())

        if(Date.now() < 1676415600734) {
            return console.log("CAPSLOCK EVENT: pas commencé")
        }
        if(1676501999734 < Date.now() ) {
            return console.log("CAPSLOCK EVENT: terminé")
        }

        function isEventBetaTester(id) {
            let beta_testers = [
                ""
            ]
            return beta_testers.includes(id)
        }

        if(!somef.isSuperAdmin(message.author.id) && !isEventBetaTester(message.author.id)) return;

        if(message.guild.id != "1037794097894797442") return;

        let isWhitelisted = false

        let whitelist = {
            users: [
                "746435557198135297", // drako - Admin
                "770334301609787392", // Sylicium - Developer
                "655393934796914707", // Konect - Admin
                "702155370054811658", // Tris - Admin
                "709467384674779208", // EdPims - Admin
                "AAAAAAAAAAAAAAAAAAAA", // AAAAAAAAAAAAAAAA
                "AAAAAAAAAAAAAAAAAAAA", // AAAAAAAAAAAAAAAA

            ],
            roles: [

            ],
            channels: [

            ]
        }
        
        function anyHitIn(list, func) {
            for(let i in list) {
                if(func(list[i])) return true
            }
            return false
        }

        if(anyHitIn(whitelist.channels, (id) => { // check if channel if whitelisted
            return id == message.channel.id
        })) isWhitelisted = true

        if(anyHitIn(whitelist.users, (id) => { // check if user id is whitelisted
            return id == message.author.id
        })) isWhitelisted = true

        if(anyHitIn(whitelist.roles, (id) => { // check if has a whitelisted role
            return message.member.roles.has(id)
        })) isWhitelisted = true


        let nor = `${message.content}`
        nor = nor.replace(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/gi, "")
        let che = nor.toUpperCase()

        if(nor != che) {
            console.log("debug1")
            let checkedMessageString = ""

            for(let i in nor) {
                if(nor[i] != che[i]) {
                    checkedMessageString += `__${nor[i]}__`
                } else {
                    checkedMessageString += `${nor[i]}`
                }
            }
            checkedMessageString = checkedMessageString.split("____").join("")

            message.react("⚠")
            setTimeout(() => {
                if(!isWhitelisted) {
                    message.delete()
                }
            }, 3*1000)


            if(Math.random() > 0.9) {
                message.reply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription([
                                `Aie.. on est en plein __**évent capslock**__ ! Tous tes messages doivent être écrits en **MAJUSCULES** !`,
                                `**Voici ce qui cloche avec ton message:**`,
                                ``,
                                `${checkedMessageString.split("\n").join("\n> ")}`,
                            ].join("\n"))
                            .setColor("FF0000")
                        
                    ],
                    ephemeral: true, // marche pas lol
                }).then(m => {
                    setTimeout(() => {
                        m.delete()
                    }, 15*1000)
                })
            }
        }

    })

    /******************************/







    server.run(bot)

    async function checkAnRecreateInvites() {

        let discordsList = await (await Database.getAllDiscords()).toArray()

        console.log("discordsList: (mapped prévisualisation) ", discordsList.map(discordObj => {
            return {
                _id: discordObj._id,
                guild: {
                    name: discordObj.guild.name,
                    id: discordObj.guild.id
                },
                owner: {
                    tag: discordObj.owner.tag,
                    id: discordObj.owner.id
                },
                settings: discordObj.settings
            }
        }))

        let maxCount = discordsList.length
        for (let i in discordsList) {
            let d = discordsList[i]

            let count = `(${parseInt(i)+1}/${maxCount})`


            Logger.debug("inviteURL", d.inviteURL)
            await somef.sleep(300)


            async function after_got_the_invite(invite, httpcode) {
                let validInvite = false
                if (invite) {
                    if (invite.expires_at == null) validInvite = true
                }

                Logger.info(`${count} ${d.guild.id} -> : ${validInvite ? "Valid invitation." : `Invalid:${httpcode}`} (${d.guild.name})`)

                let the_guild = bot.guilds.cache.get(d.guild.id)

                /*if(the_guild) {
                    Database.setValue(d._id, `averageMembers.total`)
                } else {
                    Database.set_isBotInGuild(d.guild.id, false)
                }*/
                if (the_guild && validInvite) {
                    Database.set_isBotInGuild(d.guild.id, true)
                    Database.updatePresenceCount(d._id, invite) // invite.approximate_presence_count
                } else {
                    if (!validInvite && httpcode == "429") {
                        Logger.info(`${count} ${d.guild.id} -> :   429 Rate Limited. No action. is a guild: ${!!the_guild} | validInvite: ${validInvite}`)
                        return;
                    } else if (the_guild && !validInvite) {
                        Database.updateInviteCode(the_guild)
                        Database.set_isBotInGuild(d.guild.id, true)
                        Logger.info(`${count} ${d.guild.id} -> :   Updated invite.`)
                    } else if (!the_guild && !validInvite) {
                        Database.set_isBotInGuild(d.guild.id, false)
                        Database.setInviteURL(d._id, "")
                        Logger.info(`${count} ${d.guild.id} -> :   Cannot update invite, bot is no longer on guild.`)
                    } else if (!the_guild && validInvite) {
                        Logger.info(`${count} ${d.guild.id} -> :   Bot is not on guild but invite is valid.`)
                        Database.updatePresenceCount(d._id, invite)
                    } else {
                        Logger.info(`${count} ${d.guild.id} -> :   Wtf i dont know. is a guild: ${!!the_guild} | validInvite: ${validInvite}`)
                    }
                }



            }


            discordInv.getInv(discordInv.getCodeFromUrl(d.inviteURL)).then(async invite => {

                await after_got_the_invite(invite, "200")

            }).catch(e => {

                after_got_the_invite(false, `${e}`)

            })

        }



    }


    bot.on("messageCreate", async (message) => {
        //if (inDev) return Logger.log("Message got, but in local dev")

        if (message.author.bot) return;

        let discordInviteRegex = /discord(?:\.com|app\.com|\.gg)[\/invite\/]?(?:[a-zA-Z0-9\-]{2,32})/g
        let links = `${message.content}`.match(discordInviteRegex) ?? []

        console.log("links",links)

        if(links.length != 0) {


            let Sylicium = await bot.users.fetch("770334301609787392")

            for(let i in links) {
                try {
                    let inviteCode = `${links[i]}`.split("/")[`${links[i]}`.split("/").length-1]
                    if(await Database._isAlreadyCatchedDiscordInvite(inviteCode)) {
                        continue;
                        Sylicium.send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setTitle(`Invite Catcher v1 [MSG#1]`)
                                    .setColor(`FFA500`)
                                    .setDescription([
                                        `Did not get invite of new discord link in message: [${links[i]}](${links[i].startsWith("http") ? links[i] : `https://${links[i]}`})`,
                                        `**[${message.guild.name}](${botf.getChannelLink(message)})** > **[#${message.channel.name}](${botf.getChannelLink(message)})** > **[@${message.author.tag}](${botf.getMessageLink(message)})** `,
                                        `🆗 Déjà ajouté à la base de donnée`,
                                    ].join("\n"))
                            ]
                        })
                        continue;
                    }
                    let invite = await discordInv.getInv(discordInv.getCodeFromUrl(links[i]))
                    
                    let response = await Database._addCatchedDiscordInvite(message, invite)

                    console.log("invite:",invite)
                    
                    if(response.alreadyAdded) continue;
                    
                    if(response.status) {
                        Sylicium.send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setTitle(`Invite Catcher v1 [MSG#2]`)
                                    .setColor(`${response.alreadyAdded ? "FFA500" : "00FF00"}`)
                                    .setDescription([
                                        `Successfully got invite of new discord link in message: [${links[i]}](${links[i].startsWith("http") ? links[i] : `https://${links[i]}`})`,
                                        `**[${message.guild.name}](${botf.getChannelLink(message)})** > **[#${message.channel.name}](${botf.getChannelLink(message)})** > **[@${message.author.tag}](${botf.getMessageLink(message)})** `,
                                        `${response.alreadyAdded ? `🆗 Déjà ajouté à la base de donnée` : `✅ Ajouté à la base de donnée`} : **${response.document.guild.name}**`,
                                    ].join("\n"))
                            ]
                        })
                    } else {
                        Sylicium.send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setTitle(`Invite Catcher v1 [MSG#3]`)
                                    .setColor("FF0000")
                                    .setDescription([
                                        `! Failed to get invite of new discord link in message: [${links[i]}](${links[i].startsWith("http") ? links[i] : `https://${links[i]}`})`,
                                        `Adding invite with no invite key`,
                                        `**[${message.guild.name}](${botf.getChannelLink(message)})** > **[#${message.channel.name}](${botf.getChannelLink(message)})** > **[@${message.author.tag}](${botf.getMessageLink(message)})** `,
                                        `${response.alreadyAdded ? `🆗 Déjà ajouté à la base de donnée` : `✅ Ajouté à la base de donnée avec aucune donnée pour la clé invite.`} : **${response.document.guild.name}**`,
                                    ].join("\n"))
                            ]
                        })
                        await Database._addCatchedDiscordInvite(message, { code: "none" })
                    }
                } catch(e) {
                    Logger.warn(`Could't fetch invite of code ${links[i]}`,e)
                }
            }
            
        }

        if (!message.guild) return;

        message.guild.me_ = () => { return message.guild.members.cache.get(bot.user.id) }


        
        if (inDev) {
            Logger.log(`[message] message got, but in local dev so dont add it | [${message.guild.name.substr(0,15)}] <${message.author.tag}> ${message.content.substr(0,20)}`)
        } else {
            Database.addMessageOnGuild(message)
        }

        if(Math.random() < 0.1) { Database.updateDiscordDatas(message.guild) }

        if (message.mentions.has(bot.user) && !message.mentions.everyone && !message.reference) {
            return message.reply(`✨ Hey! I use slash commands. Type \`${config.bot.prefix}help\` or \`/help\` to see the help panel. `).then(msg => { setTimeout(() => { msg.delete() }, 10 * 1000) })
        }

        //if(message.author.id != "770334301609787392") return;


        if (!message.content.startsWith(config.bot.prefix)) return;

        let args = message.content.slice(config.bot.prefix.length).split(' ');
        let command = args.shift().toLowerCase();

        console.log("log1", message)
        console.log("log2",command)
        console.log("log3",args)

        if(command == "translate") {

            if(!message.reference) {
                return message.reply({ content: `Veuillez répondre à un message pour le traduire` })
            }

            

            let from_language = (args[0]?.toLowerCase() == "lis" ? "fr" : "lis")
            let to_language = (args[0]?.toLowerCase() == "lis" ? "lis" : "fr")

            
            message.reply({
                content: `${config.emojis.loading.tag} Translating...`
            }).then(async msg => {

                let ref_msg = await message.channel.messages.fetch(message.reference.messageId)

                let texte_to_translate = ref_msg.content.split("\n").join(" \n ")

                console.log("-2",texte_to_translate)

                let axios_back = (await axios.post(`http://51.210.104.99:1841/translate`, {
                    from: from_language,
                    to: to_language,
                    text: texte_to_translate,
                }))?.data

                console.log("-1",axios_back)
                
                let translation = axios_back.response ?? "<erreur de traduction>"

                console.log("0",ref_msg.content)
                console.log("1",translation)
                console.log("2",translation.split("\n"))
                console.log("3",translation.split("\n").map(x => { return `> ${x}`}))
                console.log("4",translation.split("\n").map(x => { return `> ${x}`}).join("\n"))
    
                let translation_text = translation.split("\n").map(x => { return `> ${x.trim()}`}).join("\n")

                msg.edit({
                    content: `_\`Translation from Listenbourgeois to Français\nRajoutez lis pour traduire vers le listenbourgeois\`_\n${translation_text}`
                })

            }).catch(e => {
                Logger.warn(e)
                message.reply({
                    content: `Une erreur est survenue: **${e}** \`\`\`js\n${e.stack}\`\`\` `
                })
            })

        } else {
            /********************/
            let temp_lines = [
                `Si oui alors sache que toutes les commandes viennent de passer en commande slash !`,
                `Tape / pour afficher la liste des commandes.`,
                ``,
                `Si tu ne vois pas le bot dans les commandes slash demande à un administrateur de réinviter le bot par [ce lien](${config.bot.inviteURL} "Inviter le bot avec l'autorisation de créer des slash commandes").`,
                `Un problème avec le bot ? [serveur d'assistance](https://discord.gg/S7TpwBrP4g "Assitance")`
            ].join("\n")
            return message.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle(`Hey, essais-tu d'éxécuter une commande ?`)
                        .setColor("FF9800")
                        .setDescription(temp_lines)
                        .setFooter({ text: "Bot de référencement officiel des Discords Listenbourgeois." })
                ]
            }).then(msg => {
                setTimeout(() => { msg.delete()}, 60*1000)
            })
            /********************/
        }
        



    });



    bot.on("guildCreate", async guild => {
        if (inDev) return Logger.log("[GuildCreate] but in local dev")

        function isThereWordsInto(text) {
            let l = ["général", "general", "discussion", "discussions", "géneral", "bienvenue"]
            for (let i in l) {
                if (text.toLowerCase().indexOf(l[i]) != -1) return true
            }
            return false
        }

        let bot_in_guild = await guild.members.cache.get(bot.user.id)

        let one_channel;
        one_channel = guild.channels.cache.find(chan => ((chan.type == "text" || chan.type == 0) && isThereWordsInto(chan.name)));

        if (!one_channel) {
            one_channel = guild.channels.cache.find(chan => (chan.type == "text" || chan.type == 0));
        }
        console.log(guild.channels.cache.map(x => x))
        if (!one_channel) {
            Logger.warn(`Can't found a channel to send the auto join message on guild ${guild.id} (${guild.name})`)
            return;
        }

        let subtext = []
        
        let checkedPerms = botf.checkPermissionList(bot_in_guild)

        if(checkedPerms.permissions_missing.length > 0) {
            subtext.push(`:warning: Attention, le bot ne possède pas toutes les permissions necessaire, celà peut empêcher son fonctionnement, merci de lui donner les permissions spécifiées dans la commande \`${config.bot.prefix}checkperms\` `)
        }

        one_channel.send({
            embeds: [
                (new EmbedBuilder()
                .setTitle(`Bot Discord Listenbourgeois`)
                .setColor("#4444FF")
                .addFields([
                    { name: "Recenser le Discord", value: [
                        `> 1) Pour référencer ce serveur faites </referenceguild:1038804091347931158>. Le serveur deviendra alors public sur le site web qui liste les Discords.`,
                        `> 2) Pour dé-référencer le Discord faites </unreferenceguild:1038804091347931164>, ou dans un cas urgent ou exceptionnel, dirigez vous sur le [serveur d'assistance](https://discord.gg/S7TpwBrP4g).`,
                        `> **:warning: ATTENTION, EXPULSER LE BOT DU SERVEUR N'ARRETERA PAS LE RÉFÉRENCEMENT DE CELUI CI SUR LE SITE; voir 2.**`,
                        `> ${config.emojis.check_mark.tag} La certification est donnée après uniquement si le Discord traite bien du Listenbourg. Pour toute autre question allez sur le serveur d'assistance.`,
                    ].join("\n"), inline: true },
                    { name: "Traduire en Listenbourgeois", value: [
                        `> Utilisez la commande </translate:1039314144668684378> pour traduire des phrases.`,
                        `> Utilisez la commande \`${config.bot.prefix}translate (lis)\` en répondant à un message pour le traduire.`,
                        `> [🌎 Consultez le traducteur en ligne](https://listenbourg.vincelinise.com/traduction/ "Traducteur en ligne") de listenbourgeois.`,
                        `> Ou [Cliquez ici](https://discord.gg/6bGUN2Jtfw "Rejoindre l'académie listenbourgeoise") pour rejoindre le Discord de l'académie.`
                    ].join("\n"), inline: true }
                ])
                .setDescription([
                    `Merci d'avoir ajouté le bot.`,
                    ``,
                    `Le préfix hors commandes slash est \`${config.bot.prefix}\`. Faites </help:1038804091306004609> pour afficher les commandes.`,
                    `${subtext.length > 0 ? `\n${subtext.join("\n")}\n` : ""}`,
                    `__**Autres liens:**__`,
                    `🌎 Sites: [Liste des serveurs du Listenbourg](${config.website.url}) • [site du Listenbourg](https://google.com) • [listenbourg.com](https://listenbourg.com)`,
                    `🔵 Discords: [Assistance des bots](https://discord.gg/S7TpwBrP4g) • [Listenbourg](https://discord.gg/gaspardooo) • [Listenbourgeois (langue)](https://discord.gg/6bGUN2Jtfw)`,
                    `\`\`\`\n \`\`\` `,
                ].join("\n"))
                .setFooter({ text: "Référencement officiel des Discords Listenbourgeois."})
                .setTimestamp()
                )
            ]
        }).catch(e => {
            Logger.warn(e)
            
                /*
                
                Ce bot a été développé par \`Sylicium#3980\` (<@770334301609787392>) / \`Sylicium#2487\` (<@774003919625519134>)`}
                
                .addFields([
                    { name: "Recenser le Discord", value: [
                        `> 1) Pour référencer ce serveur faites </referenceguild:1038804091347931158>. Le serveur deviendra alors public sur le site web qui liste les Discords.`,
                        `> 2) Pour dé-référencer le Discord faites </unreferenceguild:1038804091347931164>, ou dans un cas urgent ou exceptionnel, dirigez vous sur le [serveur d'assistance](https://discord.gg/S7TpwBrP4g).`
                    ].join("\n"), inline: true },
                    { name: "Traduire en Listenbourgeois", value: [
                        `> Utilisez la commande </translate:1039314144668684378>`,
                        `> [Rejoindre le Discord de l'académie](https://discord.gg/6bGUN2Jtfw "Rejoindre l'académie listenbourgeoise")`
                    ].join("\n"), inline: true }
                ])*/
        })




    });




} // AllCode


bot.login(config.bot.token)
