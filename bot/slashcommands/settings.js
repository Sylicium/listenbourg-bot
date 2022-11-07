

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")
const { ThreadChannel } = require("discord.js")
const { Logger } = require("mongodb")

let commandInformations = {
    commandDatas: {
        name: "settings",
        description: "Gérer les paramètres de référencement",
        dmPermission: false,
        type: Discord.ApplicationCommandType.ChatInput,
        options: []
    },
    canBeDisabled: false,
    permisionsNeeded: {
        bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
        user: ["ADMINISTRATOR", "MANAGE_GUILD"]
    },
    rolesNeeded: [],
    superAdminOnly: false,
    disabled: false,
    indev: false,
    hideOnHelp: false
}
module.exports.commandInformations = commandInformations
    
module.exports.execute = async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

    await interaction.deferReply({ ephemeral:true })

    let CompletedRequest = false

    setTimeout(() => {
        if(!CompletedRequest) interaction.editReply(`${config.emojis.no.tag} La requête a pris trop de temps. Réessayez ultérieurement.`)
    }, 60 * 1000)
    

    
    let guildInfos = await Modules.Database.isReferencedGuild(interaction.guild.id)
    /*

        settingType:
        0 : Nothing
        1 : Boolean button
        2 : Select list
        3 : Select list radio
        4 : Text input
        5 : Textarea input
        6 : Integer input
        7 : Float input
        8 : Slider
        9 : List manager
    */
    let settingsWaterfall = [
        {
            "name": "Informations",
            "description": "Informations principales",
            "id": "informations",
            "submenu": [
                {
                    "name": "Référencer ou non le serveur",
                    "description": "Pour mettre ou retirer le serveur du référencement vous devez impérativement utiliser les commandes /referenceguild et /unreferenceguild.",
                    "id": "reference_or_not",
                    "settingType": {
                        "type": 0
                    },
                    "submenu": []
                },
                {
                    "name": "Certification",
                    "description": `Votre serveur est actuellement ${guildInfos?.settings.certified ? "certifié comme un Discord du Listenbourg 💚" : "non certifié comme un Discord du Listenbourg."}`,
                    "id": "certified",
                    "settingType": {
                        "type": 0
                    },
                    "submenu": []
                },
            ]
        },
        (guildInfos ? {
            "name": "Paramètres de référencement",
            "description": "Paramètres principaux",
            "id": "referencement",
            "submenu": [
                {
                    "name": "Mode privé",
                    "description": "Activer ou désactiver le mode privé.",
                    "id": "private",
                    "settingType": {
                        "type": 1,
                        "value": (guildInfos.settings.private || false)
                    },
                    "submenu": []
                },
                {
                    "name": "Description du serveur",
                    "description": "Ce sera la description qui sera affichée avec votre serveur sur le site.",
                    "id": "description",
                    "settingType": {
                        "type": 5,
                        "value": { placeholder: "Description du serveur", value: (guildInfos.guild.description || "")}
                    },
                    "submenu": []
                },
                {
                    "name": "Mots clé",
                    "description": "Ils permettent aux utilisateur de retrouver votre discord plus facilement sur le site.\nSéparer chaque mot clé par une virgule.",
                    "id": "keywords",
                    "settingType": {
                        "type": 5,
                        "value": { placeholder: "Projet, dibi, communauté, ...", value: (guildInfos.keywords.join(", ") || "")}
                    },
                    "submenu": []
                },
            ]
        } : {
            "name": "Paramètres de référencement",
            "description": "Paramètres principaux",
            "id": "main",
            "submenu": [
                {
                    "name": "Discord non référencé",
                    "description": "Aucun paramètre disponible à modifier.",
                    "id": "no_parameters",
                    "settingType": {
                        "type": 0
                    },
                    "submenu": []
                }
            ]
        })
    ]

    console.log("config.api.dbs_api.api_token",config.api.dbs_api.api_token.split("").map((item,index) => { 
        if(index < 10) return item
        else return "*"
    }).join(""))

    Modules.axios.post(config.api.dbs_api.endpoints.createPage.url, {
        "settingsWaterfall": settingsWaterfall,
        "pageName": "Référencement Listenbourg",
        "pageDescription": "No description",
        "backToEndpointToken": 'backToEndpointToken',
        "backToEndpointUrl": `${config.api.me.endpoints.dbsapiback.url}`,
        "oneUse": true,
        "backBody": {"guild_id": interaction.guild.id, "user_id": interaction.user.id, "refdbg_api_token":config.api.me.api_token },
        "Authorization": `${config.api.dbs_api.api_token}`,
    }).then(async (response) => {
        console.log("response:",response)
        CompletedRequest = true
        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor("00FF00")
                    .setDescription(`[Cliquez ici pour aller sur les paramètres](${response.data.json?.pageUrl || `https://dbs-api.captaincommand.repl.co/g/${response.data.json.id}`})`)
            ]
        })
    }).catch(async err => {
        CompletedRequest = true
        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor("FF0000")
                    .setDescription(`Une erreur est survenue: **${err}** \`\`\`js\n${err.stack}\`\`\` `)
            ]
        })
    })

}



