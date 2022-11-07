

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")
const server = require("../../server")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "certify",
            description: "⛔ Certifier un discord comme faisant partie du Listenbourg",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "guild_id",
                    "description": "L'ID de la guilde a traiter",
                    "type": Discord.ApplicationCommandOptionType.String,
                    "required": true
                },
                {
                    "name": "certify",
                    "description": "Activer/Désactiver la certification",
                    "type": Discord.ApplicationCommandOptionType.Boolean,
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
        superAdminOnly: true,
        disabled: false,
        indev: false,
        hideOnHelp: true
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {
        
        await interaction.deferReply({ ephemeral: true })

        let guild_id = ( (interaction.options.get("guild_id").value == "here" || interaction.options.get("guild_id").value == "this") ? 
            interaction.guild.id :
            interaction.options.get("guild_id").value
        )
        
        let guild = bot.guilds.cache.get(guild_id)

        let isReferenced_guildMongoDbObject = (guild ? await Modules.Database.isReferencedGuild(guild.id) : false)

        if (isReferenced_guildMongoDbObject) {
            let isCertified = await Modules.Database.isCertifiedGuild(guild_id)
            if (isCertified) {
                Modules.Database.set_certifiedGuildByID(guild_id, false)
                interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("FF0000")
                            .setDescription(`La guilde **${isReferenced_guildMongoDbObject.guild.name}** n'est désormais plus certifiée.`)
                    ]
                })
                return;
            } else {
                Modules.Database.set_certifiedGuildByID(guild_id, true)
                interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("00FF00")
                            .setDescription(`La guilde **${isReferenced_guildMongoDbObject.guild.name}** est maintenant certifiée ${config.emojis.check_mark.tag}.`)
                    ]
                })
                return;
            }
        } else {
            return interaction.editReply(`:x: La guilde avec l'ID \`${guild_id}\` n'est pas référencée ou l'ID est invalide.`)
        }


    }
}
