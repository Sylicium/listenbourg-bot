

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "test",
            description: "⛔ Testing command",
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

		await interaction.deferReply({
            ephemeral: true,
        });


        let guildListFormated = ["a"]

        let all_guilds = await interaction.guild.members.cache.map(x => x)

        console.log("all_guilds",all_guilds)
        for(let i in all_guilds) {
            console.log(`all_guilds[${i}] : `,all_guilds[i])
        }

        guildListFormated = guildListFormated.join("\n")

        interaction.user.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(`Liste des guildes où est le bot`)
                    .setColor("FFFFFF")
                    .setDescription([
                        `${guildListFormated}`
                    ].join("\n"))
                    .setTimestamp()
            ]
        }).then(msg => {
            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`[Cliquez pour consulter vos mp](${somef.getMessageLink(msg)})`)
                ]
            })
        }).catch(e => {
            logger.warn(e)
        })





        return;


        const row = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
					.setCustomId('testbutton')
					.setLabel("Je comprends, supprimer le référencement.")
					.setStyle(Discord.ButtonStyle.Danger)
			);

        await interaction.editReply({
            content: "testing command",
            components: [row]
        })


        const filter = i => i.customId === 'testbutton' && i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
        
        collector.on('collect', async i => {
            console.log("GOOOOOOOOOOOOOOOTTTTTTTTTTTTT",i)
            if (i.customId === 'id_1') {
                row.addComponents(
                    but_1.setLabel('Click Registered!')
                        .setCustomId('id_1_clicked')
                        .setDisabled(true)
               )
               interaction.editReply({ content: "Click a button", components: [row] });
            }
        });
    }
}
