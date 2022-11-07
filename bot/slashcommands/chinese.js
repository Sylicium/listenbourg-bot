

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "chinese",
            description: "Stylise votre texte en lettres chinoises.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "texte",
                    "description": "Le texte en français",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": true
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
        
        let texte = interaction.options.get("texte")?.value || undefined

        if(!texte) {
            return interaction.reply({
                content: `Impossible de récupérer le texte à transformer. Veuillez réessayer.`
            })
        }

        let all_list = []
        let letters = "abcdefghijklmnopqrstuvwxyz".split("")
        let chinese = "丹书匚刀巳下呂廾工丿片乚爪冂口尸Q尺丂丁凵V山乂Y乙".split("")
        for(let i in letters) {
            all_list.push({ s: letters[i], j: chinese[i]})
        }

        return interaction.reply({
            content: somef.replaceAllInText(texte, all_list)
        })


    }
}
