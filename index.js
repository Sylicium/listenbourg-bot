

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
        if (!message.guild) return;

        message.guild.me_ = () => { return message.guild.members.cache.get(bot.user.id) }
        
        if (inDev) {
            Logger.log(`[message] message got, but in local dev so dont add it | [${message.guild.name.substr(0,15)}] <${message.author.tag}> ${message.content.substr(0,20)}`)
        } else {
            Database.addMessageOnGuild(message)
        }

        if(Math.random() < 0.1) { Database.updateDiscordDatas(message.guild) }

        if (message.mentions.has(bot.user) && !message.mentions.everyone) {
            return message.reply(`✨ Hey! I use slash commands. Type \`${config.bot.prefix}help\` or \`/help\` to see the help panel. `).then(msg => { setTimeout(() => { msg.delete() }, 10 * 1000) })
        }

        //if(message.author.id != "770334301609787392") return;


        if (!message.content.startsWith(config.bot.prefix)) return;
        
        /********************/
        let temp_lines = [
            `Si oui alors sache que toutes les commandes viennent de passer en commande slash !`,
            `Tape / pour afficher la liste des commandes.`,
            ``,
            `Si tu ne vois pas le bot dans les commandes slash demande à un administrateur de réinviter le bot par [ce lien](${config.bot.inviteURL} "Inviter le bot avec l'autorisation de créer des slash commandes").`,
            `Un problème avec le bot ? Ping Sylicium sur le [serveur d'assistance](https://discord.gg/S7TpwBrP4g "Assitance")`
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

        let args = message.content.slice(config.bot.prefix.length).split(' ');
        let command = args.shift().toLowerCase();

        // Logger.log("command:",command)
        // Logger.log("args:",args)




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
                .setTitle(`Référencement des Discords Listenbourgeois`)
                .setColor("#4444FF")
                .setDescription(`Merci d'avoir ajouté le bot.\n\n__**Configurer le bot:**__\n\nLe préfix est \`${config.bot.prefix}\`. Faites \`${config.bot.prefix}help\` pour afficher les commandes.
            > 1) Pour référencer ce serveur faites \`${config.bot.prefix}referenceguild\`. Le serveur deviendra alors public sur le site web qui liste les Discords.
            > 2) Pour dé-référencer le Discord faites \`${config.bot.prefix}unreferenceguild\`, ou dans un cas urgent ou exceptionnel, contactez le développeur sur le [serveur d'assistance](https://discord.gg/S7TpwBrP4g).

            **:warning: ATTENTION, EXPULSER LE BOT DU SERVEUR N'ARRETERA PAS LE RÉFÉRENCEMENT DE CELUI CI SUR LE SITE; voir 2.**
            La certification est donnée après que le développeur ai vérifié que le Discord traite bien du Listenbourg. Pour toute autre question allez sur le serveur d'assistance.

            Ce bot a été développé par \`Sylicium#3980\` (<@770334301609787392>) / \`Sylicium#2487\` (<@774003919625519134>)

            ${subtext.join("\n")}

            __**Autres liens:**__
            🌎 Sites: [Liste des serveurs du Listenbourg](${config.website.url}) • [site du Listenbourg](https://DirtyBiology.captaincommand.repl.co) • [listenbourg.com](https://listenbourg.com)
            🔵 Discords: [Assistance des bots](https://discord.gg/S7TpwBrP4g) • [Listenbourg](https://discord.gg/gaspardooo) • [Listenbourgeois (langue)](https://discord.gg/6bGUN2Jtfw)
            `)
                .setFooter({ text: "Référencement officiel des Discords Listenbourgeois."})
                .setTimestamp()
                )
            ]
        })




    });




} // AllCode


bot.login(config.bot.token)
