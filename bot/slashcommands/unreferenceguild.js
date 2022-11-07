

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

let commandInformations = {
    commandDatas: {
        name: "unreferenceguild",
        description: "Déréférencer le serveur.",
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

        await interaction.deferReply()

        let isReferenced = await Modules.Database.isReferencedGuild(interaction.guild.id)
        if (!isReferenced) {
            await interaction.editReply(`:x: Ce serveur n'est déjà pas référencé.`)
            return;
        }

        let initial_msg = `:warning: Vous êtes sur le point de supprimer ce Discord du référencement listant tous les Discords Listenbourgeois. Après suppression toutes les données liées seront __définitivement__ effacées (cela comprend l'activité des 7 et 31 derniers jours et tout autre statistique).\nLe Discord ne sera plus affiché sur le site et vous devrez refaire la commande de référencement.\n\nEtes vous sûr de vouloir faire ça ?`

        let buttonID = `unreferenceguild_${Modules.somef.genHex(32)}`

        let row = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
					.setCustomId(buttonID)
					.setLabel("Je comprends, supprimer le référencement.")
					.setStyle(Discord.ButtonStyle.Danger)
			);

        await interaction.editReply({
            content: initial_msg,
            components: [row]
        })

        
        const filter = i => (i.customId === buttonID) && (i.isButton());

        const collectorConfirm = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
        
        collectorConfirm.on('collect', async i => {
            if((i.message.createdTimestamp + 1000*60) < (Date.now())) return i.reply({
                content: "Cette interaction a expirée.",
                ephemeral: true
            })
            if( interaction.user.id != i.user.id ) return i.reply({
                content: "Cette interaction ne vous est pas destinée.",
                ephemeral: true
            })
            
            let hasPerm_user = botf.checkPermissions(this.commandInformations.permisionsNeeded.user, i.member)
    
            if (!hasPerm_user.havePerm && !Modules.somef.isSuperAdmin(i.user.id)) {
                return i.reply(`Vous n'avez pas la permission d'utiliser cette commande. \`ADMINISTRATOR\` or \`MANAGE_GUILD\` `)
            }
    
            let row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('unreferenceguild')
                    .setLabel("Je comprends, supprimer le référencement.")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setDisabled(true)
            );
    
            i.message.edit({
                content: i.message.content,
                components: [row]
            })
            
            /************************/
    
            Modules.Database.deleteReferencedGuild(interaction.guild.id)
    
            i.reply(`Le Discord n'est désormais plus référencé.`)
            return;

        });

        

        return;
        msg.edit(initial_msg).then(msg1 => {
            msg1.react("✅")
            msg1.react("❌")
            msg1.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '✅' || reaction.emoji.name == '❌'), { max: 1, time: 60 * 1000 })
                .then(async collected => {
                    if (collected.first().emoji.name == '✅') {
                        msg1.reactions.removeAll().catch(e => { console.log("Missing Permission to clear reactions") })

                        Database.deleteReferencedGuild(message.guild.id)

                        msg1.edit(`Le Discord n'est désormais plus référencé.`)
                        return;
                    } else {
                        msg1.reactions.removeAll().catch(e => { console.log("Missing Permission to clear reactions") })
                        msg1.edit(`${initial_msg}\n\n:x: Vous avez annulé la commande.`)
                        return;
                    }

                }).catch((e) => {
                    msg1.edit(`${initial_msg}\n\n:x: Annulé car vous avez mis trop de temps.`)
                    return;
                })
        })

    }
