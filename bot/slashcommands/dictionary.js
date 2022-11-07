

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")
let DictionaryManager = require("../../localModules/dictionaryManager")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "dictionary",
            description: "Gérer le dictionnaire listenbourgeois.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "addword",
                    "description": "Ajouter un mot au dictionnaire",
                    "type": Discord.ApplicationCommandOptionType.Subcommand,
                    "options": [ // <français> <listenbourgeois> <?description> <F:silent:Boolean>
                        {
                            "name": "french",
                            "description": "Le mot en français",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "listenbourgeois",
                            "description": "Le mot en listenbourgeois",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "nature",
                            "description": "Nature/classe grammaticale du mot",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "choices": [
                                { name:"indéfinit", value: "not_defined" },
                                { name:"à définir", value: "to_define" },
                                { name:"Ne sais pas", value: "dont_know" },
                                { name:"nom", value: "nom" },
                                { name:"adjectif", value: "adjectif" },
                                { name:"déterminant", value: "déterminant" },
                                { name:"verbe", value: "verbe" },
                                { name:"pronom", value: "pronom" },
                                { name:"adverbe", value: "adverbe" },
                                { name:"préposition", value: "préposition" },
                                { name:"conjonction", value: "conjonction" },
                                { name:"interjection", value: "interjection" },
                            ],
                            "required": true
                        },
                        {
                            "name": "description",
                            "description": "Description du mot",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "silent",
                            "description": "Ajout silencieux dans les logs public",
                            "type": Discord.ApplicationCommandOptionType.Boolean,
                            "required": false
                        }
                    ]
                },
                {
                    "name": "removeword",
                    "description": "Supprimer un mot du dictionnaire.",
                    "type": Discord.ApplicationCommandOptionType.Subcommand,
                    "options": [ // <français> <listenbourgeois> <?description> <F:silent:Boolean>
                        {
                            "name": "word_id",
                            "description": "L'ID du mot ou le mot en listenbourgeois",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "reason",
                            "description": "Raison de la suppression",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "silent",
                            "description": "Suppresion silencieuse dans les logs public",
                            "type": Discord.ApplicationCommandOptionType.Boolean,
                            "required": false
                        }
                    ]
                },
                {
                    "name": "editword",
                    "description": "Modifier un mot du dictionnaire.",
                    "type": Discord.ApplicationCommandOptionType.Subcommand,
                    "options": [ // <français> <listenbourgeois> <?description> <F:silent:Boolean>
                        {
                            "name": "word_id",
                            "description": "L'ID du mot ou le mot en listenbourgeois",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "reason",
                            "description": "Raison de la suppression",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "modif_french",
                            "description": "Modifier le français du mot",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "modif_listenbourgeois",
                            "description": "Modifier le listenbourgeois du mot",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "modif_nature",
                            "description": "Nature/classe grammaticale du mot",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "choices": [
                                { name:"indéfinit", value: "not_defined" },
                                { name:"à définir", value: "to_define" },
                                { name:"Ne sais pas", value: "dont_know" },
                                { name:"nom", value: "nom" },
                                { name:"adjectif", value: "adjectif" },
                                { name:"déterminant", value: "déterminant" },
                                { name:"verbe", value: "verbe" },
                                { name:"pronom", value: "pronom" },
                                { name:"adverbe", value: "adverbe" },
                                { name:"préposition", value: "préposition" },
                                { name:"conjonction", value: "conjonction" },
                                { name:"interjection", value: "interjection" },
                            ],
                            "required": false
                        },
                        {
                            "name": "modif_description",
                            "description": "Modifier la description du mot",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "silent",
                            "description": "Suppresion silencieuse dans les logs public",
                            "type": Discord.ApplicationCommandOptionType.Boolean,
                            "required": false
                        }
                    ]
                },
                {
                    "name": "searchword",
                    "description": "Recherche un mot du dictionnaire",
                    "type": Discord.ApplicationCommandOptionType.Subcommand,
                    "options": [ // <français> <listenbourgeois> <?description> <F:silent:Boolean>
                        {
                            "name": "query",
                            "description": "Le mot en français",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": true
                        }
                    ]
                },
                {
                    "name": "translate",
                    "description": "Recherche un mot du dictionnaire",
                    "type": Discord.ApplicationCommandOptionType.Subcommand,
                    "options": [ // <français> <listenbourgeois> <?description> <F:silent:Boolean>
                        {
                            "name": "from",
                            "description": "La langue depuis laquelle traduire",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "choices": [
                                { name: "français -> listenbourgeois", value: "french" },
                                { name: "listenbourgeois -> français", value: "listenbourgeois" },
                            ],
                            "required": true
                        },
                        {
                            "name": "texte",
                            "description": "Le texte à traduire",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": true
                        }
                    ]
                },
            ]
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
            user: ["ADMINISTRATOR"]
        },
        rolesNeeded: [],
        superAdminOnly: true,
        disabled: false,
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

		await interaction.deferReply();

        let subCommand = interaction.options.getSubcommand()

        let silentAction = (interaction.options.getBoolean("silent")) ?? false

        console.log("subCommand",subCommand)


        if(subCommand == "addword") {

            let french = interaction.options.get("french")?.value || "<erreur>"
            let listenbourgeois = interaction.options.get("listenbourgeois")?.value || "<erreur>"
            let nature = interaction.options.get("nature")?.value || "<erreur>"
            let description = interaction.options.get("description")?.value || "Aucune description"

            if(description.length >= 255)

            if([french,listenbourgeois,nature,description].includes("<erreur>")) {
                return interaction.editReply({
                    content: `Une erreur est survenue au parsing des options:\nfrench: ${french}\nlistenbourgeois: ${listenbourgeois}\nnature: ${nature}\ndescription:^${description}`
                })
            }

            let wordExists = await DictionaryManager.testIfWordExists({
                french: french,
                listenbourgeois: listenbourgeois
            })
            logger.debug("wordExists:",wordExists)

            if(wordExists.wordExists) {
                await interaction.editReply({
                    content: "",
                    embeds: [

                        (
                            new Discord.EmbedBuilder()
                                .setTitle(`⚠ Impossible d'ajouter le mot suivant au dictionnaire`)
                                .setColor("FF0000")
                                .setDescription([
                                    `Français: \`${french}\` ${wordExists.french ? `<= ⚠` : ""} `,
                                    `Listenbourgeois: \`${listenbourgeois}\` ${wordExists.listenbourgeois ? `<= ⚠` : ""}`,
                                    `Nature: \`${nature}\``,
                                    `Description: \`${description}\``,
                                    `Ajout silencieux: **${silentAction ? "Oui" : "Non"}**`,
                                    `Ajout par: <@${interaction.user.id}> (\`${interaction.user.tag}\`) `,
                                ].join("\n"))
                        ),
                        (new Discord.EmbedBuilder()
                            .setTitle("⚠ Des collisions ont été trouvées:")
                            .setColor("FFA500")
                            .setDescription([
                                `**Mot identique en __français__**: ${wordExists.french ? [
                                    ``,
                                    `> wordID: \`${wordExists.french.wordID}\``,
                                    `> Français: \`${wordExists.french.french}\` <= ⚠`,
                                    `> Listenbourgeois: \`${wordExists.french.listenbourgeois}\``,
                                    `> Nature: \`${wordExists.french.nature}\``,
                                    `> Description: \`${wordExists.french.description}\``,
                                    `> Ajouté le: \`${(new Date(wordExists.french.createdTimestamp)).toLocaleString()}\``,
                                    `> Ajouté par: \`${wordExists.french.author.tag}\` `,
                                    `> Derniers logs: `,
                                    `${DictionaryManager.getLastLogs(wordExists.french, 3).map(x => { return `>     ${x}` }).join("\n")}`,
                                ].join("\n") : `Non`}`,
                                ``,
                                `**Mot identique en __listenbourgeois__**: ${wordExists.listenbourgeois ? [
                                    ``,
                                    `> wordID: \`${wordExists.listenbourgeois.wordID}\``,
                                    `> Français: \`${wordExists.listenbourgeois.french}\``,
                                    `> Listenbourgeois: \`${wordExists.listenbourgeois.listenbourgeois}\` <= ⚠`,
                                    `> Nature: \`${wordExists.listenbourgeois.nature}\``,
                                    `> Description: \`${wordExists.listenbourgeois.description}\``,
                                    `> Ajouté le: \`${(new Date(wordExists.listenbourgeois.createdTimestamp)).toLocaleString()}\``,
                                    `> Ajouté par: \`${wordExists.listenbourgeois.author.tag}\` `,
                                    `> Derniers logs:`,
                                    `${DictionaryManager.getLastLogs(wordExists.listenbourgeois, 3).map(x => { return `> ....${x}` }).join("\n")}`,
                                ].join("\n") : `Non`}`,
                            ].join("\n"))
                        )
                    ]
                })
                return;
            }

            DictionaryManager.addWord({
                french: french,
                listenbourgeois: listenbourgeois,
                nature: nature,
                description: description ?? "<Aucune description>",
                author: interaction.user,
            }).then((added_word) => {
                interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setTitle(`✅ Le mot a bien été ajouté au dictionnaire`)
                            .setColor("00FF00")
                            .setDescription([
                                `WordID: \`${added_word.wordID}\` `,
                                `Français: \`${added_word.french}\` `,
                                `Listenbourgeois: \`${added_word.listenbourgeois}\` `,
                                `Nature: \`${added_word.nature}\` `,
                                `Description: \`${added_word.description}\` `,
                                `Ajout silencieux: **${silentAction ? "Oui" : "Non"}**`,
                                `Ajouté le: \`${(new Date(added_word.createdTimestamp)).toLocaleString()}\` `,
                                `Ajouté par: <@${interaction.user.id}> (\`${interaction.user.tag}\`) `,
                            ].join("\n"))
                            .setFooter({ text: `wordID: ${added_word.wordID}` })
                            .setTimestamp()
                    ]
                })
            }).catch((e) => {
                logger.debug(e)
                interaction.editReply({
                    content: `Une erreur est survenue: **${e}** \`\`\`js\n${e.stack}\`\`\``
                })
            })

        } else if(subCommand == "removeword") {


            let word_id = interaction.options.get("word_id")?.value ?? undefined

            if(!word_id) {
                return interaction.editReply({
                    content: `Word ID ou mot listenbourgeois invalide.` 
                })
            }

            let raison = interaction.options.get("reason")?.value ?? "Aucune raison fournie"

            DictionaryManager.removeWord({
                wordID: word_id,
                listenbourgeois: word_id,
                reason: raison,
            }).then((removedWord) => {
                if(removedWord.removed) {
                    interaction.editReply({
                        embeds: [
                            (
                                new Discord.EmbedBuilder()
                                    .setTitle(`🗑 Le mot a été supprimé du dictionaire`)
                                    .setColor("FFFFFF")
                                    .setDescription([
                                        `> *️⃣ wordID: \`${removedWord.oldObject.wordID}\``,
                                        `> 💙 Français: \`${removedWord.oldObject.french}\``,
                                        `> 🦅 Listenbourgeois: \`${removedWord.oldObject.listenbourgeois}\``,
                                        `> 🅰 Nature: \`${removedWord.oldObject.nature}\``,
                                        `> ❔ Description: \`${removedWord.oldObject.description}\``,
                                        `> ➕ Ajouté le: \`${(new Date(removedWord.oldObject.createdTimestamp)).toLocaleString()}\``,
                                        `> ➕ Ajouté par: \`${removedWord.oldObject.author.tag}\` `,
                                        ``,
                                        `❌ Mot supprimé par: <@${interaction.user.id}> (\`${interaction.user.tag}\`) `,
                                    ].join("\n"))
                                    .setFooter({ text: "Ce mot a été supprimé." })
                                    .setTimestamp()
                            )
                        ]
                    })
                } else {
                    interaction.editReply({
                        embeds: [
                            (
                                new Discord.EmbedBuilder()
                                    .setTitle(`❌ Le mot n'a pas pu être supprimé du dictionaire`)
                                    .setColor("FFFFFF")
                                    .setDescription([
                                        `Une erreur est survenue et a empêcher la suppresion, voici les données brute récoltées:`,
                                        `\`\`\`js\n${JSON.stringify(removedWord,null,4)}\`\`\` `
                                    ].join("\n"))
                                    .setTimestamp()
                            )
                        ]
                    })
                }
            }).catch(e => {
                logger.debug(e)
                interaction.editReply({
                    content: `Une erreur est survenue: **${e}** \`\`\`js\n${e.stack}\`\`\``
                })
            })

            
        } else if(subCommand == "editword") {
            interaction.editReply({
                content: "Modifier un mot. En développement"
            })

            let wordID = interaction.options.get("word_id")?.value || undefined
            let reason = interaction.options.get("reason")?.value || undefined
            let modif_french = interaction.options.get("modif_french")?.value || undefined
            let modif_listenbourgeois = interaction.options.get("modif_listenbourgeois")?.value || undefined
            let modif_nature = interaction.options.get("modif_nature")?.value || undefined
            let modif_description = interaction.options.get("modif_description")?.value || undefined



            DictionaryManager.editWord({
                wordID: wordID,
                reason: reason,
                new_french: modif_french,
                new_listenbourgeois: modif_listenbourgeois,
                new_nature: modif_nature,
                new_description: modif_description,
            }).then(editedWord => {
                if(!editedWord.edited) {
                    interaction.editReply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setTitle(`Impossible de modifier le mot`)
                                .setColor("FF0000")
                                .setDescription([
                                    `Données renvoyées: \`\`\`js\n${JSON.stringify(editedWord,null,4)}\`\`\` `,
                                ].join("\n"))
                        ]
                    })
                    return;
                }
                logger.debug("editedWord:",editedWord)
                isEdited_french = editedWord.before.french != editedWord.after.french
                isEdited_listenbourgeois = editedWord.before.listenbourgeois != editedWord.after.listenbourgeois
                isEdited_nature = editedWord.before.nature != editedWord.after.nature
                isEdited_description = editedWord.before.description != editedWord.after.description
                interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setTitle(`Mot modifié avec succès`)
                            .setColor("FFFFFF")
                            .setDescription([
                                `Les modifications sont en gras:`,
                                `> ${isEdited_french ? "✏" : "▪"}__Français:__ ${isEdited_french ? "**" : ""} ${editedWord.before.french} -> ${editedWord.after.french}${isEdited_french ? "**" : ""}`,
                                `> ${isEdited_listenbourgeois ? "✏" : "▪"}__Listenbourgeois:__ ${isEdited_listenbourgeois ? "**" : ""} ${editedWord.before.listenbourgeois} -> ${editedWord.after.listenbourgeois}${isEdited_listenbourgeois ? "**" : ""}`,
                                `> ${isEdited_nature ? "✏" : "▪"}__Nature:__ ${isEdited_nature ? "**" : ""} ${editedWord.before.nature} -> ${editedWord.after.nature}${isEdited_nature ? "**" : ""}`,
                                `> ${isEdited_description ? "✏" : "▪"}__Description:__ ${isEdited_description ? "**" : ""} ${editedWord.before.description} -> ${editedWord.after.description}${isEdited_description ? "**" : ""}`,
                            ].join("\n"))
                            .setTimestamp()
                    ]
                })
            }).catch(e => {
                logger.debug(e)
                interaction.editReply({
                    content: `Une erreur est survenue: **${e}** \`\`\`js\n${e.stack}\`\`\``
                })
            })

            /*

                        {
                            "name": "word_id",
                            "description": "L'ID du mot ou le mot en listenbourgeois",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "reason",
                            "description": "Raison de la suppression",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": true
                        },
                        {
                            "name": "modif_french",
                            "description": "Modifier le français du mot",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "modif_listenbourgeois",
                            "description": "Modifier le listenbourgeois du mot",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "modif_nature",
                            "description": "Nature/classe grammaticale du mot",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "choices": [
                                { name:"indéfinit", value: "not_defined" },
                                { name:"à définir", value: "to_define" },
                                { name:"Ne sais pas", value: "dont_know" },
                                { name:"nom", value: "nom" },
                                { name:"adjectif", value: "adjectif" },
                                { name:"déterminant", value: "déterminant" },
                                { name:"verbe", value: "verbe" },
                                { name:"pronom", value: "pronom" },
                                { name:"adverbe", value: "adverbe" },
                                { name:"préposition", value: "préposition" },
                                { name:"conjonction", value: "conjonction" },
                                { name:"interjection", value: "interjection" },
                            ],
                            "required": false
                        },
                        {
                            "name": "modif_description",
                            "description": "Modifier la description du mot",
                            "type": Discord.ApplicationCommandOptionType.String,
                            "required": false
                        },
                        {
                            "name": "silent",
                            "description": "Suppresion silencieuse dans les logs public",
                            "type": Discord.ApplicationCommandOptionType.Boolean,
                            "required": false
                        }
            */
            
        } else if(subCommand == "searchword") {

            let query = interaction.options.get("query")?.value || undefined 

            if(!query) return interaction.editReply({
                content: `Veuillez spécifier une recherche de mot.`
            })


            let all_words = await (await DictionaryManager.getAllWords()).toArray()



            function getBestScore(word) {
                let scores = []
                scores.push(somef.compareString(query, word.french))
                scores.push(somef.compareString(query, word.listenbourgeois))
                scores.push(somef.compareString(query, word.description))
                return scores.sort((a,b)=> b-a)[0] || 0
            }

            let all_words_scored = all_words.map(x => {
                return {
                    score: getBestScore(x),
                    word: x,
                }
            })
            let all_words_scored_sorted = all_words_scored.sort((a,b) => {
                return b.score-a.score
            })
            let all_words_scored_sorted_pageText = all_words_scored_sorted.map(x => {
                return [
                    `ID: \`${x.word.wordID}\` `,
                    `> Français: \`${x.word.french}\` `,
                    `> Listenbourgeois: \`${x.word.listenbourgeois}\` `,
                    `> Nature: \`${x.word.nature}\` `,
                ].join("\n")
            })
            let pageManager = new bot.botf.pageManager(all_words_scored_sorted_pageText, 5)

            console.log("all_words", all_words)

            interaction.editReply({
                content: "searching..."
            })


                    
            let buttonID_before = `search_before_${Modules.somef.genHex(32)}`
            let buttonID_after = `search_after_${Modules.somef.genHex(32)}`

            let row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                    .setCustomId(buttonID_before)
                    .setLabel("◀")
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setDisabled(true)
                )
                .addComponents(
                    new Discord.ButtonBuilder()
                    .setCustomId(buttonID_after)
                    .setLabel("▶")
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setDisabled( (pageManager.getInfos().pageCount == 1) )
                )
                .addComponents(
                    new Discord.ButtonBuilder()
                    .setLabel("Recherche affinée")
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL(config.website.url)
                );
            
            let wordCount = all_words.length

            
            let pInfos = pageManager.getInfos()
            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor("#4444FF")
                        .setDescription([
                            `\`${wordCount}\` mots enregistrés • \`${query}\``,
                            `Survolez les (?) pour afficher des infos`,
                            ``,
                            `${pageManager.getSelectedPage().join("\n")}`,
                            ``].join("\n"))
                        .setFooter({ text: `${pInfos.selectedPage}/${pInfos.maxPageInt} • Listenbourg`})
                        .setTimestamp()
                ],
                components: [row]
            })

            const filter = i => ( (i.customId == buttonID_before) || i.customId == buttonID_after) && (i.isButton());
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
                
                i.deferUpdate()

                function getNewRows(options={
                    before: false,
                    after: false,
                    website: false
                }) {
                    let row = new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                            .setCustomId(buttonID_before)
                            .setLabel("◀")
                            .setStyle(Discord.ButtonStyle.Primary)
                            .setDisabled( ( ((options.before == true) || (options.before == false)) ? options.before : false ) )
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                            .setCustomId(buttonID_after)
                            .setLabel("▶")
                            .setStyle(Discord.ButtonStyle.Primary)
                            .setDisabled( ( ((options.after == true) || (options.after == false)) ? options.after : false ) )
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                            .setLabel("Site")
                            .setStyle(Discord.ButtonStyle.Link)
                            .setURL(config.website.url)
                            .setDisabled( ( ((options.website == true) || (options.website == false)) ? options.website : false ) )
                        );
                    return row
                }

                if(i.customId == buttonID_before) {
                    let switched = pageManager.switchPage(-1)
                    pInfos = pageManager.getInfos()
                    await interaction.editReply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor("#4444FF")
                                .setDescription([
                                    `\`${wordCount}\` mots enregistrés • \`${query}\``,
                                    `Survolez les (?) pour afficher des infos`,
                                    ``,
                                    `${pageManager.getSelectedPage().join("\n")}`,
                                    ``].join("\n"))
                                .setFooter({ text: `${pInfos.selectedPage}/${pInfos.maxPageInt} • Référencement officiel des Discords DirtyBiologistanais.`})
                                .setTimestamp()
                        ],
                        components: [getNewRows({before: switched.edge})]
                    })
                } else if(i.customId == buttonID_after) {
                    let switched = pageManager.switchPage(1)
                    pInfos = pageManager.getInfos()
                    await interaction.editReply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor("#4444FF")
                                .setDescription([
                                    `\`${wordCount}\` mots enregistrés • \`${query}\``,
                                    `Survolez les (?) pour afficher des infos`,
                                    ``,
                                    `${pageManager.getSelectedPage().join("\n")}`,
                                    ``,
                                    `_💡 Recherche plus affinées et personnalisables sur [le site](${config.website.url})_`,
                                    ``].join("\n"))
                                .setFooter({ text: `${pInfos.selectedPage}/${pInfos.maxPageInt} • Référencement officiel des Discords DirtyBiologistanais.`})
                                .setTimestamp()
                        ],
                        components: [getNewRows({after: switched.edge})]
                    })
                }

            })



        } else if(subCommand == "translate") {

            let from = interaction.options.get("from")?.value || undefined
            let texte = interaction.options.get("texte")?.value || undefined


            await interaction.editReply({
                content: `Traduire \`${texte}\` de ${from == "french" ? "Français vers listenbourgeois": "Listenbourgeois vers Français"}`
            })


            let all_words = JSON.parse(`[{"french":"famille","listenbourgeois":"famlià","nature":"famille"},{"french":"tu","listenbourgeois":"peer","nature":"pronom personnel"},{"french":"nous","listenbourgeois":"kar","nature":"pronom personnel"},{"french":"ils","listenbourgeois":"ils","nature":"pronom personnel"},{"french":"une","listenbourgeois":"ope","nature":"determinant"},{"french":"de","listenbourgeois":"deer","nature":"determinant"},{"french":"notre","listenbourgeois":"kird","nature":"determinant"},{"french":"les","listenbourgeois":"lyrs","nature":"determinant"},{"french":"leur","listenbourgeois":"lird","nature":"determinant"},{"french":"des","listenbourgeois":"dyrs","nature":"determinant"},{"french":"son","listenbourgeois":"faar","nature":"determinant"},{"french":"leurs","listenbourgeois":"lys","nature":"determinant"},{"french":"sa","listenbourgeois":"feer","nature":"determinant"},{"french":"t'es","listenbourgeois":"vyrs","nature":"determinant"},{"french":"ta","listenbourgeois":"veer","nature":"determinant"},{"french":"cet","listenbourgeois":"yors","nature":"determinant"},{"french":"aux","listenbourgeois":"apehn","nature":"determinant"},{"french":"long","listenbourgeois":"lònguoan","nature":"adjectif qualificatif"},{"french":"mais","listenbourgeois":"meg","nature":"conjonction de coordination"},{"french":"car","listenbourgeois":"quaèr","nature":"conjonction de coordination"},{"french":"donc","listenbourgeois":"dom","nature":"conjonction de coordination"},{"french":"ni","listenbourgeois":"næc","nature":"conjonction de coordination"},{"french":"dans","listenbourgeois":"dorl","nature":"préposition"},{"french":"par","listenbourgeois":"pæt","nature":"préposition"},{"french":"sans","listenbourgeois":"rebs","nature":"préposition"},{"french":"contre","listenbourgeois":"nyt","nature":"préposition"},{"french":"en","listenbourgeois":"inhc","nature":"préposition"},{"french":"avoir","listenbourgeois":"haver","nature":"verbe"},{"french":"dire","listenbourgeois":"diger","nature":"verbe"},{"french":"pouvoir","listenbourgeois":"posser","nature":"verbe"},{"french":"savoir","listenbourgeois":"sager","nature":"verbe"},{"french":"aller","listenbourgeois":"irer","nature":"verbe"},{"french":"passer","listenbourgeois":"passær","nature":"verbe"},{"french":"donner","listenbourgeois":"donær","nature":"verbe"},{"french":"rire","listenbourgeois":"rider","nature":"verbe"},{"french":"partir","listenbourgeois":"partier","nature":"verbe"},{"french":"sourire","listenbourgeois":"subrider","nature":"verbe"},{"french":"rendre","listenbourgeois":"render","nature":"verbe"},{"french":"boire","listenbourgeois":"bòver","nature":"verbe"},{"french":"état","listenbourgeois":"ystat","nature":"nom commun"},{"french":"téléphone","listenbourgeois":"tèlehfon","nature":"nom commun"},{"french":"clavier","listenbourgeois":"cleviyr","nature":"nom commun"},{"french":"fenêtre","listenbourgeois":"fineste","nature":"nom commun"},{"french":"chambre","listenbourgeois":"dußemsal","nature":"nom commun"},{"french":"maison","listenbourgeois":"caßà","nature":"nom commun"},{"french":"toilettes","listenbourgeois":"preßiarsal","nature":"nom commun"},{"french":"salle de bain","listenbourgeois":"linßemsal","nature":"nom commun"},{"french":"fourchette","listenbourgeois":"forcæ","nature":"nom commun"},{"french":"table","listenbourgeois":"planst","nature":"nom commun"},{"french":"verre","listenbourgeois":"vèr","nature":"nom commun"},{"french":"voiture","listenbourgeois":"caromobìl","nature":"nom commun"},{"french":"train","listenbourgeois":"tram","nature":"nom commun"},{"french":"camion","listenbourgeois":"poromobìl","nature":"nom commun"},{"french":"cour","listenbourgeois":"cùrt","nature":"nom commun"},{"french":"vélo","listenbourgeois":"cycla","nature":"nom commun"},{"french":"fierté","listenbourgeois":"lhir","nature":"nom commun"},{"french":"constitution","listenbourgeois":"coßitutio","nature":"nom commun"},{"french":"non","listenbourgeois":"né","nature":"politesse"},{"french":"nonmerci","listenbourgeois":"nénansia","nature":"politesse"},{"french":"derien","listenbourgeois":"deernahs","nature":"politesse"},{"french":"merci","listenbourgeois":"nansia","nature":"politesse"},{"french":"sud","listenbourgeois":"sòl","nature":"directions"},{"french":"ouest","listenbourgeois":"òest","nature":"directions"},{"french":"gauche","listenbourgeois":"gòß","nature":"directions"},{"french":"bas","listenbourgeois":"behælt","nature":"directions"},{"french":"france","listenbourgeois":"franß","nature":"pays"},{"french":"états-unis","listenbourgeois":"ystaten-unys","nature":"pays"},{"french":"allemagne","listenbourgeois":"alhmañird","nature":"pays"},{"french":"royaume-uni","listenbourgeois":"ònys-reño","nature":"pays"},{"french":"nord","listenbourgeois":"nort","nature":"pays"},{"french":"portugal","listenbourgeois":"pœrtugyel","nature":"pays"},{"french":"pays-bas","listenbourgeois":"bahs-layd ","nature":"pays"},{"french":"norvège","listenbourgeois":"norvaßia","nature":"pays"},{"french":"suisse","listenbourgeois":"ßwaishen","nature":"pays"},{"french":"finland","listenbourgeois":"fihnlayd","nature":"pays"},{"french":"brésil","listenbourgeois":"bresil","nature":"pays"},{"french":"autriche","listenbourgeois":"auhtryash","nature":"pays"},{"french":"équateur","listenbourgeois":"ekòator","nature":"pays"},{"french":"suriname","listenbourgeois":"sòrin","nature":"pays"},{"french":"guyane française","listenbourgeois":"dyan franßès","nature":"pays"},{"french":"chili","listenbourgeois":"tchilè","nature":"pays"},{"french":"paraguay","listenbourgeois":"payagòalh","nature":"pays"},{"french":"listenbourg","listenbourgeois":"listenbourg","nature":"pays"},{"french":"elles","listenbourgeois":"ells","nature":"pronom personnel"},{"french":"génant","listenbourgeois":"cringè","nature":"adjectif qualificatif"},{"french":"duc","listenbourgeois":"dòq","nature":"nom commun"},{"french":"raclette","listenbourgeois":"reclat","nature":"nom commun"},{"french":"fondue","listenbourgeois":"fodœ","nature":"nom commun"},{"french":"continent","listenbourgeois":"cœtinet","nature":"nom commun"},{"french":"république tchèque","listenbourgeois":"respablyk chechia","nature":"pays"},{"french":"fier","listenbourgeois":"lhiran ","nature":"pronom personnel"},{"french":"dialecte","listenbourgeois":"dialæcte","nature":"nom commun"},{"french":"du","listenbourgeois":"dòr","nature":"determinant"},{"french":"aéroport","listenbourgeois":"avaòplaßa","nature":"nom commun"},{"french":"planète","listenbourgeois":"planæta","nature":"nom commun"},{"french":"autoroute","listenbourgeois":"alßròßad","nature":"nom commun"},{"french":"grand","listenbourgeois":"alßan","nature":"adjectif qualificatif"},{"french":"chemin de fer","listenbourgeois":"trilhoßad","nature":"nom commun"},{"french":"cerveau","listenbourgeois":"cœrvœ","nature":"nom commun"},{"french":"oreille","listenbourgeois":"œril","nature":"nom commun"},{"french":"campagne","listenbourgeois":"cæopaña","nature":"nom commun"},{"french":"sourcil","listenbourgeois":"sòrœcili","nature":"nom commun"},{"french":"cheveu","listenbourgeois":"xær","nature":"nom commun"},{"french":"bonsoir","listenbourgeois":"bòensæ","nature":"politesse"},{"french":"bonnenuit","listenbourgeois":"bòenhaxhs","nature":"politesse"},{"french":"pistolet","listenbourgeois":"pistòl","nature":"nom commun"},{"french":"bouclier","listenbourgeois":"barkaß","nature":"nom commun"},{"french":"militaire","listenbourgeois":"milidar","nature":"nom commun"},{"french":"bon appetit","listenbourgeois":"bòen apætut ","nature":"politesse"},{"french":"joue","listenbourgeois":"jœ","nature":"nom commun"},{"french":"oeil","listenbourgeois":"æyi","nature":"nom commun"},{"french":"menton","listenbourgeois":"metœhn","nature":"nom commun"},{"french":"jour","listenbourgeois":"dæ","nature":"nom commun"},{"french":"semaine","listenbourgeois":"semæña","nature":"nom commun"},{"french":"minute","listenbourgeois":"menœta","nature":"nom commun"},{"french":"bien","listenbourgeois":"bianò","nature":"adverbe"},{"french":"avant","listenbourgeois":"anter","nature":"adverbe"},{"french":"maintenant","listenbourgeois":"noy","nature":"adverbe"},{"french":"ami","listenbourgeois":"æme","nature":"nom commun"},{"french":"plaine","listenbourgeois":"plañad","nature":"nom commun"},{"french":"forêt","listenbourgeois":"forad","nature":"nom commun"},{"french":"taïga","listenbourgeois":"taja","nature":"nom commun"},{"french":"longue","listenbourgeois":"lònguoan","nature":"adjectif qualificatif"},{"french":"longues","listenbourgeois":"lònguoanen","nature":"adjectif qualificatif"},{"french":"fière","listenbourgeois":"lhiran","nature":"adjectif qualificatif"},{"french":"fièrs","listenbourgeois":"lhiranen","nature":"adjectif qualificatif"},{"french":"îles fidji","listenbourgeois":"fitsij ißle","nature":"pays"},{"french":"îles marshall","listenbourgeois":"marzal ißle","nature":"pays"},{"french":"nauru","listenbourgeois":"naruò","nature":"pays"},{"french":"papouasie-nouvelle-guinée","listenbourgeois":"papòsia-nœvò-gyòne","nature":"pays"},{"french":"îles salamon","listenbourgeois":"salemòn ißle ","nature":"pays"},{"french":"timor-oriental","listenbourgeois":"æstan-tiñor","nature":"pays"},{"french":"tuvalu","listenbourgeois":"tavòla","nature":"pays"}]`)


            for(let i in all_words) {
                let word = all_words[i]
                logger.debug(`Added: ${JSON.stringify(word)}`)
                DictionaryManager.addWord({
                    french: word.french,
                    listenbourgeois: word.listenbourgeois,
                    nature: word.nature,
                    description: (word.description || "Aucune description"),
                    author: interaction.user
                })
            }
            logger.debug("Terminé.")

        } else {
            interaction.editReply({
                content: "default"
            })
        }
        

    }
}


//丹书匚刀巳下呂廾工丿片乚爪冂口尸Q尺丂丁凵V山乂Y乙

