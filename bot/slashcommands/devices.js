

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "devices",
            description: "Affiche les appareils sur lequels l'utilisateur est connecté.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "user",
                    "description": "L'utilisateur à regarder",
                    "type": Discord.ApplicationCommandOptionType.User,
                    "required": true,
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
        disabled: true,
        indev: false,
        hideOnHelp: true
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

        await interaction.deferReply()

        let the_user = await bot.users.fetch(interaction.options.getUser("user").id)

        console.log("the_user",the_user)
        console.log("the_user.presence",the_user.presence)
        let lines = [
            `Web: ${the_user.presence?.clientStatus?.web}`,
            `Mobile: ${the_user.presence?.clientStatus?.mobile}`,
            `Desktop: ${the_user.presence?.clientStatus?.desktop}`,
        ].join("\n")

        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("Informations sur les appareils")
                    .setColor("FFFFFF")
                    .setDescription(lines)
                    .setTimestamp()
            ]
        })
        return;


    }
}
