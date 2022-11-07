

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")


let commandInformations = {
    commandDatas: {
        name: "setprivate",
        description: "Activer ou désactiver le mode privé. Cache le lien d'invitation sur le site.",
        dmPermission: false,
        type: Discord.ApplicationCommandType.ChatInput,
        options: [
            {
                "name": "set_private_to",
                "description": "Activer ou désactiver le mode privé",
                "type": 5,
                "required": true
            }
        ]
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

    await interaction.deferReply()

    let traitement_en_cours = `${config.emojis.loading.tag} Traitement de la demande en cours...`
    let msg = await interaction.editReply(traitement_en_cours)
    setTimeout(async () => {
        if (msg.content == traitement_en_cours) await interaction.editReply(`${config.emojis.no.tag} La requête a pris trop de temps. Réessayez ultérieurement.`)
    }, 60 * 1000)

    let guild_id = interaction.guild.id

    let isReferenced_guildMongoDbObject = await Modules.Database.isReferencedGuild(guild_id)

    if (!isReferenced_guildMongoDbObject) {
        return interaction.editReply({ content: `${config.emojis.no.tag} Ce discord n'est pas référencé, veuillez au préalable exécuter la commande \`/referenceguild\`.`})
    }

    if(interaction.options.get("set_private_to").value == true) {
        Modules.Database.set_privateGuildByID(guild_id, true)
        await interaction.editReply({
            content:"",
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(`⛔ Mode privé activé`)
                    .setColor("FF0000")
                    .setDescription(`Le Discord **${isReferenced_guildMongoDbObject.guild.name}** est maintenant privé, il n'est donc plus possible de le rejoindre par le [site web](${config.website.url}).\nAttention, le lien d'invitation continuera à être actualisé si besoin, même si il ne servira pas.`)
                    .setFooter({ text: "L'actualisation sur le site peut prendre jusqu'à 1h." })
            ]
        })
        return;
    } else {
        Modules.Database.set_privateGuildByID(guild_id, false)
        await interaction.editReply({
            content:"",
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(`🌎 Mode privé désactivé`)
                    .setColor("00FF00")
                    .setDescription(`Le Discord **${isReferenced_guildMongoDbObject.guild.name}** est désormais public. Un lien d'invitation permanent vers ce Discord est disponible sur le [site web](${config.website.url}).`)
                    .setFooter({ text: "L'actualisation sur le site peut prendre jusqu'à 1h." })
            ]
        })
        return;
    }

}
