

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "help",
            description: "Afficher l'aide des commandes.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "all",
                    "description": "Afficher toutes les commandes, même que je ne peux pas utiliser",
                    "type": Discord.ApplicationCommandOptionType.Boolean,
                    "required": false
                }
            ]
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
            user: []
        },
        rolesNeeded: [],
        superAdminOnly: false,
        disabled: false,
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {


        await interaction.deferReply({ ephemeral: true })


        let isUserSuperAdmin = Modules.somef.isSuperAdmin(interaction.user.id)

        function needAdministrativePermissions(cmd) {
            let userPerms = Modules.botf.getBitFieldPermission(cmd.commandInformations.permisionsNeeded.user)
            let perms = Modules.botf.getBitFieldPermission([ "ADMINISTRATOR", "MANAGE_GUILD" ])
            for(let i in perms) {
                if(userPerms.indexOf(perms[i]) != -1) {
                    return true
                }
            }
            return false
        }

        function getCommandIcon(cmd) {
            if(cmd.commandInformations.hideOnHelp) return "👻"
            else if(cmd.commandInformations.superAdminOnly) return "⛔"
            else if(cmd.commandInformations.disabled) return "❌"
            else if(cmd.commandInformations.indev) return "🛠"
            else if(cmd.commandInformations.permisionsNeeded.user.length == 0) return " "
            else if(cmd.havePermToUseCmd) return "🔑"
            else if(needAdministrativePermissions(cmd)) return "🔒"
            else if(!cmd.havePermToUseCmd) return "🔐"
            else return ""
        }

        let commands = bot.commands.slashCommands.filter((item, index) => {
            if(!item.commandInformations.hideOnHelp || isUserSuperAdmin) return true
            return false
        }).map((item, index) => {
            return {
                icon: "",
                name: item.commandInformations.commandDatas.name,
                description: item.commandInformations.commandDatas.description,
                commandInformations: item.commandInformations,
                havePermToUseCmd: (isUserSuperAdmin ?  true : Modules.botf.checkPermissions(item.commandInformations.permisionsNeeded.user, interaction.member).havePerm)
            }
        }).map((item, index) => {
            let temp = JSON.parse(JSON.stringify(item))
            temp.icon = getCommandIcon(item)
            return temp
        })

        commands = commands.sort((a,b) => {
            return a.name.localeCompare(b.name)
        })

        let command_string_list = [
        ]     

        if(!interaction.options.get("all") || interaction.options.get("all").value == false) {

            command_string_list = command_string_list.concat([
                `${config.emojis.check_mark.tag} Vous pouvez utiliser toutes ces commandes`,
                ``,
            ])

            commands = commands.filter((item) => {
                if(!isUserSuperAdmin && (
                        item.commandInformations.superAdminOnly
                        || item.commandInformations.indev
                        || item.commandInformations.disabled
                    )
                ) { return false } else {
                    if(item.havePermToUseCmd) {
                        return true
                    } else { return false }
                }
            })
        } else {
            command_string_list = command_string_list.concat([
                `⛔ Commande superAdmin | ❌ Commande désactivée`,
                `🛠 Commande en développement | 🔒 Requiert des permissions d'Administration`,
                `🔐 Requiert plus de permission pour utiliser | 🔑 Requiert des permissions que vous avez`,
                `${isUserSuperAdmin ? `👻 hideOnHelp = true\n` : ""}`
            ])
        }

        function getAdminDisabledCmdValue(item) {
            if(item.commandInformations.superAdminOnly) return 3
            else if(item.commandInformations.disabled) return 2
            else if(item.commandInformations.indev) return 1
            else return 0
        }

        commands = commands.sort((a,b) => {
            let t_a = getAdminDisabledCmdValue(a)
            let t_b = getAdminDisabledCmdValue(b)

            let temp = t_b - t_a

            if(temp > 0) {
                return -1
            } else if(temp < 0) {
                return 1
            } else { return 0 }
        })

        /*let commands = [
            { name: "help", description: "Afiicher cette page d'aide" },
            { name: "ping", description: "pong" },
            { name: "list", description: "Consulter la liste des Discords référencés sur le site" },
            { name: "referenceguild", description: "Référencer le Discord" },
            { name: "unreferenceguild", description: "Déréférencer le Discord" },
            { name: "setprivate", description: "Mettre ou retirer le mode privé." },
            { name: "setdescription", description: "Changer la description du serveur"},
            { name: "checkperms", description: "Affiche la liste des permissions que le bot possède." },
            { name: "info", description: ":x:ℹ Afficher des informations sur le bot et le site" },
            { name: "search", description: ":x: Rechercher un discord parmis la liste. (Pas encore disponible)" },
            { name: "certify", description: "⛔ [développeur] Permet de certifier une guilde" },
            { name: "forcerefresh", description: "⛔ [développeur] Permet de forcer la rafaîchissement des discords sur le site" }
        ]*/   
        for (let i in commands) {
            command_string_list.push(`${commands[i].icon} \`${commands[i].name}\` : *${commands[i].description}*`)
        }

        let command_string = command_string_list.join("\n")

        await interaction.editReply({
            embeds:[
                new Discord.EmbedBuilder()
                    .setTitle("Page d'aide")
                    .setColor("FFFFFD")
                    .setDescription(command_string)
                    .setFooter({ text: `${(interaction.options.get("all") ? `${
                        (interaction.options.get("all").value == true) ? "Affiche uniquement les commandes que vous pouvez faire" : "Affiche toute les commandes"
                    }` : `💡 Utilise l'option all:Trie pour afficher même les commandes auxquelles tu n'as pas accès`)}`})
                    .setTimestamp()
            ],
            ephemeral: true
        })



    }
}
