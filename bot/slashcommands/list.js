

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "list",
            description: "Consulter la liste des serveurs référencés.",
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
        superAdminOnly: false,
        disabled: true,
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

        await interaction.deferReply()

        console.log("Modules",Modules)

        let serverList_text = serverList.map(discordObject => {
            return [
                `> ${discordObject.guild.name}`,
                `> ${discordObject.guild.name}`,
            ].join("\n")
        })

        let serverList = Modules.server.getCachedDiscords()
        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor("#4444FF")
                    .setDescription([
                        `${serverList.length} serveurs référencé, [consulter la liste des serveurs du Listenbourg 🌎](${config.website.url})`,
                        `${serverList_text}`,
                    ].join("\n"))
                    .setFooter({ text: "Référencement officiel des Discords Listenbourgeois."})
                    .setTimestamp()
            ]
        })
        return


    }
}
