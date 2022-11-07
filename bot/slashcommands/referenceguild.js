

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")


let commandInformations = {
    commandDatas: {
        name: "referenceguild",
        description: "Référence votre serveur sur le site du centre de renseignement.",
        dmPermission: false,
        type: Discord.ApplicationCommandType.ChatInput,
        options: []
    },
    canBeDisabled: false,
    permisionsNeeded: {
        bot: ["SEND_MESSAGES"],
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

		await interaction.deferReply();
        
        let isReferenced = await Modules.Database.isReferencedGuild(interaction.guild.id)
        if (isReferenced) {
            interaction.editReply(`${config.emojis.check_mark.tag} Ce serveur est déjà référencé.`)
            return;
        }

        let back_msg_actions = []

        let contrat = [
            "\`Une invitation infinie pour ce serveur sera créée, et automatiquement recréée si nécessaire. Ce qui veut dire que ce serveur sera public et que n'importe qui pourra le rejoindre. (sauf si le mode privé est activé)\`",
            "**EXPULSER LE BOT N'ARRETERA PAS LE REFERENCEMENT**",
            "\`Le référencement durera jusqu'à son annulation par la commande prévue à cet effet, ou exceptionnellement l'intervention du développeur.\`",
            "\`Le Discord sera par défaut non certifié, c'est à dire qu'il n'aura pas encore été vérifié par le développeur en tant qu'un discord Listenbourgeois.\`",
            "\`Pour le principe évoqué au dessus, il est possible que le développeur rejoigne le serveur après son référencement pour le certifier.\`",
            "\`La certification assure que le serveur traite effectivement de près ou de loin au Listenbourg.\`",
            "\`Le nombre de membre total approximatif ainsi qu'actuellement en ligne sera publiquement affiché\`",
            "\`Le nombre de messages envoyés les 7 et 31 derniers jours sera également affiché publiquement. (Aucun message n'est sauvegardé, uniquement le nombre)\`"
        ]

        for (let i in contrat) {
            contrat[i] = `**${parseInt(i) + 1}/** ${contrat[i]}`
        }
        let closes_contrat = contrat.join("\n")


        let initial_msg = `Vous allez référencer ce Discord en tant que Discord autour du Listenbourg.\n**Attention** cela implique les choses suivantes:\n${closes_contrat}`


        let buttonID_confirm = `referenceguild_${Modules.somef.genHex(32)}`
        let buttonID_discard = `referenceguild_discard_${Modules.somef.genHex(32)}`

		
        let row = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
					.setCustomId(buttonID_confirm)
					.setLabel("J'accepte les conditions")
					.setStyle(Discord.ButtonStyle.Success)
			)
			.addComponents(
				new Discord.ButtonBuilder()
					.setCustomId(buttonID_discard)
					.setLabel("Annuler")
					.setStyle(Discord.ButtonStyle.Danger)
			);

        interaction.editReply({
            content: initial_msg,
            components: [row]
        })


        const filter = i => ( (i.customId == buttonID_confirm) || i.customId == buttonID_discard) && (i.isButton());
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 5*60*1000 });

        collector.on("collect", async i => {
            if((i.message.createdTimestamp + 1000*60) < (Date.now())) return i.reply({
                content: "Cette interaction a expirée.",
                ephemeral: true
            })
            if( interaction.user.id != i.user.id ) return i.reply({
                content: "Cette interaction ne vous est pas destinée.",
                ephemeral: true
            })
            
            let hasPerm_user = botf.checkPermissions(commandInformations.permisionsNeeded.user, i.member)
    
            if (!hasPerm_user.havePerm && !Modules.somef.isSuperAdmin(i.user.id)) {
                return i.reply(`Vous n'avez pas la permission d'utiliser cette commande. \`ADMINISTRATOR\` or \`MANAGE_GUILD\` `)
            }


            let row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(buttonID_confirm)
                    .setLabel("J'accepte les conditions")
                    .setStyle(Discord.ButtonStyle.Success)
                    .setDisabled(true)
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(buttonID_discard)
                    .setLabel("Annuler")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setDisabled(true)
            );

            /******************/
                
            if(i.customId == buttonID_discard) {
                i.message.edit({
                    content: `${i.message.content}\n\n:x: Vous avez annulé le référencement.\n_Ce message sera supprimé dans 10s_`,
                    components: [row]
                }).then(() => {
                    setTimeout(() => {
                        i.message.delete().catch(e => {})
                    }, 10*1000)
                })
                // i.deferUpdate()

                return;
            } else if(i.customId == buttonID_confirm) {

                i.message.edit({
                    content: i.message.content,
                    components: [row]
                })
                setTimeout(() => {
                    i.message.delete().catch(e => {})
                }, 1000)
    
                /************************/
    
                await i.reply(`${config.emojis.loading.tag} Référencement en cours... cela peut prendre un moment.`)
    
    
                back_msg_actions.push("> Création d'une invitation permanente")
                let the_invite;
                try {
                    the_invite = await interaction.channel.createInvite({
                        maxAge: 0,
                        maxUses: 0
                    })
                } catch(e) {
                    back_msg_actions.push(`   Impossible de créer l'invitation: ${e}`)
                }
                console.log("the_invite created:", the_invite)
    
                if (the_invite) {
                    back_msg_actions.push(`   Invitation créé avec le code ${the_invite.code}`)
                } else {
                    back_msg_actions.push(`   Une erreur est survenue.`)
                    back_msg_actions.push(`   Le bot tentera de réactualiser l'invitation plus tard.`)
                }
    
                let total_members = 0
                let online_members = 0
    
                back_msg_actions.push(`> Récupération du nombre approximatif de membres`)
    
                let invite = false
                try {
                    invite = await Modules.discordInv.getInv(Modules.discordInv.getCodeFromUrl(the_invite.url))
                    back_msg_actions.push(`   Récupération effectuée. ${invite.approximate_presence_count} membres connectés sur ${invite.approximate_member_count}.`)
                } catch (e) {
                    console.log("error:", e)
                    if (`${e}` == "429") {
                        back_msg_actions.push(`   Une erreur est survenue: code ${e} | RateLimited`)
                        back_msg_actions.push(`   Le bot tentera de réactualiser le nombre de membres plus tard.`)
                    } else if (`${e}` == "404") {
                        back_msg_actions.push(`   Une erreur est survenue: code ${e} | Invitation introuvable`)
                        back_msg_actions.push(`   Le bot tentera de réactualiser le nombre de membres plus tard.`)
                    } else {
                        back_msg_actions.push(`   Une erreur est survenue: code ${e}`)
                        back_msg_actions.push(`   Le bot tentera de réactualiser le nombre de membres plus tard.`)
                    }
                }
    
                if (invite) {
                    console.log("adding")
                    total_members = invite.approximate_member_count
                    online_members = invite.approximate_presence_count
                }
    
                let guildOwner = await interaction.guild.fetchOwner()
    
                back_msg_actions.push(`> Envoi des informations au serveur pour le référencement`)
                await Modules.Database.referenceGuild({
                    guild: {
                        id: interaction.guild.id,
                        name: interaction.guild.name,
                        iconURL: interaction.guild.iconURL(),
                        createdAt: interaction.guild.createdAt.getTime(),
                        description: ""
                    },
                    friendlyName: interaction.guild.name,
                    keywords: interaction.guild.name.toLowerCase().split(" "),
                    owner: {
                        id: guildOwner.id,
                        username: guildOwner.user.username,
                        tag: guildOwner.user.tag,
                        discriminator: guildOwner.user.discriminator
                    },
                    statistics: {
                        messages: {
                            lastWeek: [],
                            lastMonth: []
                        }
                    },
                    inviteURL: the_invite.url,
                    averageMembers: {
                        total: total_members,
                        online: online_members
                    },
                    settings: {
                        referencedAt: Date.now(),
                        referencedBy: {
                            id: interaction.user.id,
                            username: interaction.user.username,
                            tag: interaction.user.tag,
                            discriminator: interaction.user.discriminator
                        },
                        isBotOnGuild: true,
                        certified: false,
                        private: false
                    }
                })
                back_msg_actions.push("   Terminé")
                back_msg_actions.push("")
    
    
                let done_msg = [
                    `${config.emojis.check_mark.tag} Serveur référencé avec succès!`,
                    `Vous pouvez consulter la liste des serveurs via le lien ci dessous.`,
                    `La liste est actualisée toutes les heures alors pas de panique si votre serveur n'y est pas encore.`,
                    `Pour passer le serveur en **privé** et ne pas permettre de le rejoindre via le site, utilisez la commande \`/setprivate\` `,
                    //`Pour changer la description du serveur ou ses mots clés, utilisez la commande \`${config.bot.prefix}setdescription\` et \`${config.bot.prefix}setkeywords\` `
                ].join("\n")
    
                await i.editReply({
                    content: done_msg,
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("#4444FF")
                            .setDescription(`[Liste des serveurs du Listenbourg 🌎](${config.website.url})\n**Informations additionnelles:**\nLogs:\`\`\`\n${back_msg_actions.join('\n')}\`\`\` `)
                            .setFooter({ text: "Référencement officiel des Discords Listenbourgeois." })
                            .setTimestamp()
                    ]
                }
                    
                )
            }
        })
        


        return;


        

        interaction.editReply(initial_msg).then(async msg1 => {

            msg1.reactions.removeAll().catch(e => { console.log("Missing Permission to clear reactions") })

            await Modules["somef"].sleep(5*1000)

            msg1.edit(`${config.emojis.loading.tag} Référencement en cours... cela peut prendre un moment.`).then(async msg2 => {



                back_msg_actions.push("> Création d'une invitation permanente")
                let the_invite;
                try {
                    the_invite = await interaction.channel.createInvite({
                        maxAge: 0,
                        maxUses: 0
                    })
                } catch(e) {
                    back_msg_actions.push(`   Impossible de créer l'invitation: ${e}`)
                }
                console.log("the_invite created:", the_invite)

                if (the_invite) {
                    back_msg_actions.push(`   Invitation créé avec le code ${the_invite.code}`)
                } else {
                    back_msg_actions.push(`   Une erreur est survenue.`)
                    back_msg_actions.push(`   Le bot tentera de réactualiser l'invitation plus tard.`)
                }

                let total_members = 0
                let online_members = 0

                back_msg_actions.push(`> Récupération du nombre approximatif de membres`)

                let invite = false
                try {
                    invite = await Modules.discordInv.getInv(Modules.discordInv.getCodeFromUrl(the_invite.url))
                    back_msg_actions.push(`   Récupération effectuée. ${invite.approximate_presence_count} membres connectés sur ${invite.approximate_member_count}.`)
                } catch (e) {
                    console.log("error:", e)
                    if (`${e}` == "429") {
                        back_msg_actions.push(`   Une erreur est survenue: code ${e} | RateLimited`)
                        back_msg_actions.push(`   Le bot tentera de réactualiser le nombre de membres plus tard.`)
                    } else if (`${e}` == "404") {
                        back_msg_actions.push(`   Une erreur est survenue: code ${e} | Invitation introuvable`)
                        back_msg_actions.push(`   Le bot tentera de réactualiser le nombre de membres plus tard.`)
                    } else {
                        back_msg_actions.push(`   Une erreur est survenue: code ${e}`)
                        back_msg_actions.push(`   Le bot tentera de réactualiser le nombre de membres plus tard.`)
                    }
                }

                if (invite) {
                    console.log("adding")
                    total_members = invite.approximate_member_count
                    online_members = invite.approximate_presence_count
                }

                let guildOwner = await interaction.guild.fetchOwner()

                back_msg_actions.push(`> Envoi des informations au serveur pour le référencement`)
                await Modules.Database.referenceGuild({
                    guild: {
                        id: interaction.guild.id,
                        name: interaction.guild.name,
                        iconURL: interaction.guild.iconURL(),
                        createdAt: interaction.guild.createdAt.getTime(),
                        description: ""
                    },
                    friendlyName: interaction.guild.name,
                    keywords: interaction.guild.name.toLowerCase().split(" "),
                    owner: {
                        id: guildOwner.id,
                        username: guildOwner.user.username,
                        tag: guildOwner.user.tag,
                        discriminator: guildOwner.user.discriminator
                    },
                    statistics: {
                        messages: {
                            lastWeek: [],
                            lastMonth: []
                        }
                    },
                    inviteURL: the_invite.url,
                    averageMembers: {
                        total: total_members,
                        online: online_members
                    },
                    settings: {
                        referencedAt: Date.now(),
                        referencedBy: {
                            id: interaction.user.id,
                            username: interaction.user.username,
                            tag: interaction.user.tag,
                            discriminator: interaction.user.discriminator
                        },
                        isBotOnGuild: true,
                        certified: false,
                        private: false
                    }
                })
                back_msg_actions.push("   Terminé")
                back_msg_actions.push("")


                let done_msg = [
                    `${config.emojis.check_mark.tag} Serveur référencé avec succès!`,
                    `Vous pouvez consulter la liste des serveurs via le lien ci dessous.`,
                    `La liste est actualisée toutes les heures alors pas de panique si votre serveur n'y est pas encore.`,
                    `Pour passer le serveur en **privé** et ne pas permettre de le rejoindre via le site, utilisez la commande \`${config.bot.prefix}setprivate\` `,
                    //`Pour changer la description du serveur ou ses mots clés, utilisez la commande \`${config.bot.prefix}setdescription\` et \`${config.bot.prefix}setkeywords\` `
                ].join("\n")

                await interaction.editReply({
                    content: done_msg,
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("#4444FF")
                            .setDescription(`[Liste des serveurs du Listenbourg 🌎](${config.website.url})\n**Informations additionnelles:**\nLogs:\`\`\`\n${back_msg_actions.join('\n')}\`\`\` `)
                            .setFooter({ text: "Référencement officiel des Discords Listenbourgeois." })
                            .setTimestamp()
                    ]
                }
                    
                )


            }).catch(async err => {
                console.log(err)

                await msg1.edit(`${config.emojis.no.tag} Une erreur est survenue durant le référencement du Discord. Si l'erreur persiste contactez le développeur du bot.`)
                await interaction.followUp({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("#4444FF")
                            .setDescription(`🌎 Liste des serveurs du Listenbourg: ${config.website.url}\n**Informations additionnelles:**\nErreur: \`\`\`js\n${err}\`\`\` \nLogs:\`\`\`\n${back_msg_actions.join('\n')}\`\`\` `)
                            .setFooter({ text: "Référencement officiel des Discords Listenbourgeois." })
                            .setTimestamp()
                    ]
                }).catch(async e => {
                    back_msg_actions.push(`An error occured while handling error: Can't send embed message.`)
                    await interaction.followUp(`[Liste des serveurs du Listenbourg 🌎](${config.website.url})\n**Informations additionnelles:**\nErreur: \`\`\`js\n${err}\`\`\` \nLogs:\`\`\`\n${back_msg_actions.join('\n')}\`\`\` `)
                })


            })




        })






    }
