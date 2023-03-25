

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "poll",
            description: "Créer un sondage",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "title",
                    "description": "Titre du sondage",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": true
                },
                {
                    "name": "options",
                    "description": "Liste des réponses possibles séparé par une virgule. Ex: 'Chat, Chien, Cheval'",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": true
                },
                {
                    "name": "description",
                    "description": "Description du sondage",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": false
                },
                {
                    "name": "image",
                    "description": "URL de l'image du sondage",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": false
                },
                {
                    "name": "single_vote",
                    "description": "Limiter les membres à ne voter qu'une seule fois.",
                    "type": Discord.ApplicationCommandOptionType.Boolean,
                    "required": false
                },
                {
                    "name": "color",
                    "description": "Couleur hexadécimal de l'embed. random pour couleur aléatoire.",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": false
                }
            ]
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
            user: ["MANAGE_CHANNELS"]
        },
        rolesNeeded: [],
        superAdminOnly: false,
        disabled: false,
        indev: true,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

		await interaction.deferReply();


        let titre = interaction.options.get("title")?.value ?? "Sondage"
        let description = interaction.options.get("description")?.value ?? ""
        let sondage_options = interaction.options.get("options")?.value ?? "Sondage"
        let single_vote = interaction.options.getBoolean("single_vote") ?? false
        let color = interaction.options.get("color")?.value ?? "FFFFFF"
        if(color == "random") color = Modules.somef.genHex(6)


        let formatedOptions = []
        let sondage_options_parsed = sondage_options.split(",").map(x => x.trim())

        for(let i in sondage_options_parsed) {
            formatedOptions.push(``)
            formatedOptions.push(``)
        }
            
        formatedOptions = formatedOptions.join("\n")

        interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(`${titre}`)
                    .setColor(`${color}`)
                    .setDescription(`${description}\n${formatedOptions}`)   
            ]
        })


    }
}
