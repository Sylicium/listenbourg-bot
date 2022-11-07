

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "checkperms",
            description: "Renvoie la liste des permission qu'a et devrait avoir le bot.",
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
        disabled: false,
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

		await interaction.deferReply({
            ephemeral: true
        });

        let checkedPerms = botf.checkPermissionList(interaction.guild.me_())
        await interaction.editReply({
            content: `Le bot necessite la permission | le bot a la permission\n${checkedPerms.list.join("\n")}`,
            ephemeral: true
        })
        if(checkedPerms.permissions_missing.length > 0) {
            await interaction.followUp({
                content: `_${interaction.member.nickname || interaction.user.tag} a utilisé /checkperms_\nListe des permissions manquantes au bot: \`${checkedPerms.permissions_missing.join("\`, \`")}\` `
            })
        }
        return;


    }
}
