

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "forcerefresh",
            description: "⛔ Forcer le raffraîchissement du cache de la base de donnée.",
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
        superAdminOnly: true,
        disabled: false,
        indev: false,
        hideOnHelp: true
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {
        
        await interaction.deferReply({ ephemeral: true })

        await interaction.editReply({ content: `${config.emojis.loading.tag} Rafraîchissement du cache...` }).then(async msg => {
            let started = Date.now()
            let discordCached = await Modules.server.refreshDiscords_cache()
            let duration = Date.now() - started
            interaction.editReply(`${config.emojis.check_mark.tag} Opération terminée, ${discordCached.length} discords rafraîchis en cache. (\`${(duration/1000).toFixed(3)}ms\`)`)
        }).catch(async (e) => {
            console.log(e)
            await interaction.followUp({
                content: `:x: Une erreur est survenue durant le rafraîchissement du cache: \`\`\`js\n${e}\`\`\` `
            })
        })
        return;


    }
}
