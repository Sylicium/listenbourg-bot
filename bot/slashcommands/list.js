

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

        let serverList = Modules.server.getCachedDiscords()

        let serverList_text = serverList.map((discordObject,index) => {
            return [
                `> ${index}. ${discordObject.guild.name} ${discordObject.settings.private ? '(Discord privé)' : `[(rejoindre)](${discordObject.inviteURL})`}`,
            ].join("\n")
        })


        let maxDiscordsDisplayed = 10
        

        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor("#4444FF")
                    .setDescription([
                        `${serverList.length} serveurs référencé, [consulter la liste des serveurs du Listenbourg 🌎](${config.website.url})`,
                        `${serverList_text.slice(0,maxDiscordsDisplayed).join("\n")}`,
                        `${serverList_text.length > maxDiscordsDisplayed ? `\n+ ${serverList_text.length - maxDiscordsDisplayed} autres serveurs non affichés.` : ""}`,
                    ].join("\n"))
                    .setFooter({ text: "Référencement officiel des Discords Listenbourgeois."})
                    .setTimestamp()
            ]
        })
        return


    }
}
