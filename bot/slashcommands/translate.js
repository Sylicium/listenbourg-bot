

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")
let DictionaryManager = require("../../localModules/dictionaryManager")
const { text } = require("stream/consumers")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "translate",
            description: "Traduire des phrases vers ou depuis le listenbourgeois.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "depuis",
                    "description": "La langue depuis laquelle traduire",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "choices": [
                        { name: "français -> listenbourgeois", value: "fr" },
                        { name: "listenbourgeois -> français", value: "lis" },
                    ],
                    "required": true
                },
                {
                    "name": "texte",
                    "description": "Le texte à traduire",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": true
                },
                {
                    "name": "ephemeral",
                    "description": "Afficher ou non le message uniquement pour vous",
                    "type": Discord.ApplicationCommandOptionType.Boolean,
                    "required": false
                },
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

        let isEphemeral = interaction.options.getBoolean("ephemeral") ?? false

		await interaction.deferReply({ ephemeral: isEphemeral });

        let from_language = interaction.options.get("depuis")?.value ?? "lis"
        let to_language = from_language == "fr" ? "lis" : "fr"

        
        await interaction.editReply({
            content: `${config.emojis.loading.tag} Translating...`
        })
        
        let texte_to_translate = interaction.options.get("texte")?.value ?? undefined

        if(!texte_to_translate) return interaction.editReply({
            content: `Une erreur est survenue, impossible de récupérer le texte à traduire.`
        })

        let axios_back = (await Modules.axios.post(`http://51.210.104.99:1841/translate`, {
            from: from_language,
            to: to_language,
            text: texte_to_translate,
        }))?.data

        let translation = axios_back.response ?? "<erreur de traduction>"

        let translation_text = translation.split("\n").map(x => { return x.trim() }).join("\n")

        await interaction.editReply({
            content: ``,
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor("FFFFFF")
                    .addFields([
                        { name: `**${from_language == "fr" ? "Français" : "Listenbourgeios"}**`, value:`${texte_to_translate}`, inline:true },
                        { name: `**${from_language == "fr" ? "Listenbourgeois" : "Français"}**`, value:`${translation_text}`, inline:true },
                    ])
                    .setFooter({ text: `Traduction propulsée via listenbourg.vincelinise.com/traduction/` })
                    .setTimestamp()
            ]
        })

        

    }
}


//丹书匚刀巳下呂廾工丿片乚爪冂口尸Q尺丂丁凵V山乂Y乙

