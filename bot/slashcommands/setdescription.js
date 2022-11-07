

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "setdescription",
            description: "Changer la description du serveur sur le site.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "description",
                    "description": "La nouvelle description",
                    "type": 3,
                    "required": true
                }
            ]
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
            user: ["ADMINISTRATOR","MANAGE_GUILD"]
        },
        rolesNeeded: [],
        superAdminOnly: false,
        disabled: false,
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

        await interaction.deferReply()


        let traitement_en_cours = `${config.emojis.loading.tag} Traitement de la demande en cours...`
        let msg = await interaction.editReply(traitement_en_cours)
        setTimeout(() => {
            if (msg.content == traitement_en_cours) interaction.editReply(`${config.emojis.no.tag} La requête a pris trop de temps. Réessayez ultérieurement.`)
        }, 60 * 1000)

        let isReferenced_guildMongoDbObject = await Modules.Database.isReferencedGuild(interaction.guild.id)

        if (!isReferenced_guildMongoDbObject) {
            return interaction.editReply(`${config.emojis.no.tag} Ce discord n'est pas référencé, veuillez au préalable exécuter la commande \`/referenceguild\`.`)
        }

        let new_description = interaction.options.get("description").value
        let maxLength = 255
        if(new_description.length > maxLength) {
            interaction.editReply({
                content: "",
                embeds: [new Discord.EmbedBuilder()
                    .setColor("FF0000")
                    .setDescription(`${config.emojis.no.tag} La description doit faire au maximum ${maxLength} caractère, la votre en fait ${new_description.length} !\n${new_description.substr(0,maxLength)}__${new_description.substr(maxLength,new_description.length)}__`)
                ]
            })
            return;
        }
        await Modules.Database.set_descriptionGuildByID(interaction.guild.id, new_description)
        
        interaction.editReply({
            content: "",
            embeds: [new Discord.EmbedBuilder()
                .setColor("00FF00")
                .setDescription(`${config.emojis.check_mark.tag} La description a été changée pour \`\`\`${new_description}\`\`\` `)
            ]
        })
        return;



    }
}
