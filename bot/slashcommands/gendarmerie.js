

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

let commandInformations = {
    commandDatas: {
        name: "gendarmerie",
        description: "Ajouter un ticket sur le site de la gendarmerie",
        dmPermission: false,
        type: Discord.ApplicationCommandType.ChatInput,
        options: [
            {
                "name": "content",
                "description": "Contenu du ticket",
                "type": Discord.ApplicationCommandOptionType.String,
                "required": true,
            },
            {
                "name": "expire",
                "description": "Expire après X",
                "type": Discord.ApplicationCommandOptionType.Number,
                "required": true,
                "minimum": 1,
                "maximum": 120,
            },
            {
                "name": "multiplier",
                "description": "Format de l'expiration",
                "type": Discord.ApplicationCommandOptionType.String,
                "required": true,
                "choices": [
                    { name: "Secondes", value: "1" },
                    { name: "Minutes", value: "60" },
                    { name: "Heures", value: "3600" },
                    { name: "Jours", value: "86400" },
                    { name: "Semaines", value: "604800" },
                    { name: "Mois", value: "2592000" },
                ]
            },
            {
                "name": "highlight",
                "description": "Type de donnée",
                "type": Discord.ApplicationCommandOptionType.String,
                "required": false,
                "choices": [
                    { name: "Plain text", value: "" },
                    { name: "ABAP", value: "abap" },
                    { name: "Augmented Backus–Naur form", value: "abnf" },
                    { name: "ActionScript", value: "actionscript" },
                    { name: "Ada", value: "ada" },
                    { name: "ANTLR4", value: "antlr4" },
                    { name: "Apache Configuration", value: "apacheconf" },
                    { name: "APL", value: "apl" },
                    { name: "AppleScript", value: "applescript" },
                    { name: "AQL", value: "aql" },
                    { name: "Arduino", value: "arduino" },
                    { name: "ARFF", value: "arff" },
                    { name: "AsciiDoc", value: "asciidoc" },
                    { name: "6502 Assembly", value: "asm6502" },
                    { name: "ASP.NET (C#)", value: "aspnet" },
                    { name: "AutoHotkey", value: "autohotkey" },
                    { name: "AutoIt", value: "autoit" },
                    { name: "Bash", value: "bash" },
                    { name: "BASIC", value: "basic" },
                    { name: "Batch", value: "batch" },
                    { name: "BBcode", value: "bbcode" },
                    { name: "Bison", value: "bison" },
                    { name: "Backus–Naur form", value: "bnf" },
                    { name: "Brainfuck", value: "brainfuck" },
                    { name: "BrightScript", value: "brightscript" },
                ]
            }
        ]
    },
    canBeDisabled: false,
    permisionsNeeded: {
        bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
        user: ["MANAGE_MESSAGES"]
    },
    rolesNeeded: [],
    superAdminOnly: false,
    disabled: false,
    indev: false,
    hideOnHelp: false
}

module.exports.commandInformations = commandInformations

module.exports.execute = async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

    await interaction.deferReply({ ephemeral: false })

    let payload = {
        content: interaction.options.get("content")?.value?.toLowerCase() || undefined,
        expire: parseInt(interaction.options.get("expire")?.value || 0),
        multiplier: parseInt(interaction.options.get("multiplier")?.value || 0),
        highlight: interaction.options.get("highlight")?.value?.toLowerCase() || undefined,
    }

    if(!payload.content) {
        return interaction.editReply({
            content: "Une erreur est survenue, le contenu du ticket est invalide."
        })
    }

    let baseURL = `http://gendlis.space-creation.fr/`


    let response = await Modules.axios({
        method: "post",
        url: baseURL,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: `paste=${encodeURIComponent(payload.content)}&expire=${encodeURIComponent(payload.expire)}&multiplier=${encodeURIComponent(payload.multiplier)}${payload.multiplier}${payload.highlight ? `&highlight=${payload.highlight}` : ""}`
    })

    if(response.data.length > 100) {
        throw new Error("Response of axios was more than 100 characters which shouldn't be possible.")
    }

    interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setDescription([
                    `**Ticket créé par:** <@${interaction.user.id}>`,
                    `**Identifiant du ticket:** [${response.data.trim().split("/")[response.data.trim().split("/").length-1]}](${response.data.trim()})`,
                    `**Création:** <t:${(parseInt(Date.now()/1000))}> (<t:${(parseInt(Date.now()/1000))}:R>)`,
                    `**Expiration:** <t:${(parseInt(Date.now()/1000)) + (payload.expire*payload.multiplier)}> (<t:${(parseInt(Date.now()/1000)) + (payload.expire*payload.multiplier)}:R>)`
                ].join("\n"))
                .setColor("00FFFF")
                .setTimestamp()
                .setFooter({ text: `status=${response.status} - Gendarmerie listenbourgeoise.`})
        ]
    })

    return;


    let res = await axios({
        method: "post",
        url: url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: `paste=${encodeURIComponent('coucou')}&expire=${encodeURIComponent('2')}&multiplier=3600`
    }).then(x => {
        console.log(x)
    })
}
