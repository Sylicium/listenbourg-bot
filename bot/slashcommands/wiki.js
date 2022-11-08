

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")
let axios = require("axios")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "wiki",
            description: "Rechercher une page sur le wiki",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: [
                {
                    "name": "search",
                    "description": "Rechercher une page sur le wiki",
                    "type": Discord.ApplicationCommandOptionType.Subcommand,
                    "options": [ // <français> <listenbourgeois> <?description> <F:silent:Boolean>
                        {
                            "name": "query",
                            "description": "La recherche à effectuer",
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
            user: []
        },
        rolesNeeded: [],
        superAdminOnly: false,
        disabled: false,
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

        await interaction.deferReply()

        let query = interaction.options.get("query")?.value ?? undefined

        if(!query) return interaction.editReply({
            content: `Vous devez spécifier une page à rechercher.`
        })

        query = somef._normalize(query)

        if(!query || query.length < 2) return interaction.editReply({
            content: [
                `Le texte à rechercher doit faire minimum 2 caractère et peu ou pas contenir de caractères spéciaux.`,
                `Chaine actuelle invalide: \`${query || "<aucun texte>"}\` `
            ].join("\n")
        })

        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor("320985")
                    .setDescription(`${config.emojis.loading.tag} Recherche de \`${query}\` `)
                    .setThumbnail(`https://static.wikia.nocookie.net/listenbourg-offi/images/b/b6/Drapeau_du_Listenbourg.png/revision/latest/scale-to-width-down/273?cb=20221031232109&path-prefix=fr`)
                    .setFooter({ text: `Recherche de ${interaction.member.nickname || interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
            ]
        })

        function getStringSizeWithCharsCount(count) {
            let text_page_size = ""
            if(count <= 2000) {
                text_page_size = `petite page (${count})`
            } else if(count <= 10000) {
                text_page_size = `page de taille moyenne (${count})`
            } else if(count <= 20000) {
                text_page_size = `page de taille conséquente (${count})`
            }
            return text_page_size
        }
        let _timestamp_start = Date.now()

        let the_url = process.env["WIKI_API_URL"].replace("{{query}}", query)

        axios.get(the_url).then(async resp => {
            
            let all_pages = resp.data.query.pages

            let text_list = []
            let _c = 0
            let max_pages = 10
            for(let page_id in all_pages) {
                if(_c == max_pages) break;
                _c++
                let p = all_pages[page_id]
                
                text_list.push(`> [**${p.title}** (#${p.pageid})](${p.fullurl})`)
                text_list.push(`> Touched: ${p.touched} | ${getStringSizeWithCharsCount(p.length)}`)
                text_list.push("> ")
            }

            let recommended_embed_lareadywritten = false
            function _writeRecommendedLabel() {
                if(recommended_embed_lareadywritten) return;
                text_list.push(`> __Autres liens que vous cherchez peut être:__`)
                text_list.push("> ")
                recommended_embed_lareadywritten = true
                return;
            }

            if(query == "oru") {
                _writeRecommendedLabel()
                let _pages = [
                    /*{
                        title: "Organisation de Régions Unie",
                        pageid: 179,
                        fullurl: "https://dirtybiologistan.fandom.com/fr/wiki/Organisation_des_R%C3%A9gions_Unies",
                        touched: "2022-03-05T14:59:57Z",
                        length: 2200
                    },
                    {
                        title: "Bot ORU",
                        pageid: 1008,
                        fullurl: "https://dirtybiologistan.fandom.com/fr/wiki/Bot_ORU",
                        touched: "2022-02-27T20:12:39Z",
                        length: 4223
                    }*/
                ]
                for(let i in _pages) {
                    let p = _pages[i]
                    text_list.push(`> [**${p.title}** (#${p.pageid})](${p.fullurl})`)
                    text_list.push(`> Touched: ${p.touched} | ${getStringSizeWithCharsCount(p.length)}`)
                    text_list.push("> ")
                }
            }
            
            if(text_list[text_list.length-1] == "> ") text_list.pop()
            
            let _timestamp_end = Date.now()

            let text = text_list.join("\n")
            text = text.substr(0,3800)

            await interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor("FFFFFD")
                        .setDescription(`Résultats de la recherche de \`${query}\`\n(Took ${somef.formatTime(_timestamp_end-_timestamp_start, "mmm ss,mss")})\n${text}`)
                        .setThumbnail(`https://static.wikia.nocookie.net/listenbourg-offi/images/b/b6/Drapeau_du_Listenbourg.png/revision/latest/scale-to-width-down/273?cb=20221031232109&path-prefix=fr`)
                        .setFooter({ text: `Recherche de ${interaction.member.nickname || interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                    ]
            })
            
        }).catch(e => {
            console.log(e)
            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor("FF0000")
                    .setDescription(`La recherche a échouée: \`\`\`js\n${e}\`\`\` `)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({ text: `recherche de ${interaction.member.nickname || interaction.user.username}` })
                    .setTimestamp()
                ]
            })
            return;
        })


    }
}



/*
// Dependencies
const { Client, MessageEmbed, Collection } = require('discord.js');
const fs = require('fs');
const config = require('../config');
const axios = require('axios')
let somef = require('../some_functions')
Object.size = function(arr) {
    var size = 0;
    for (var key in arr) {
        if (arr.hasOwnProperty(key)) size++;
    }
    return size;
};
const singleton = require('../singleton_json')
let bot = require('../singleton_bot').getInstance()
let Global_datas = singleton.useInstance("GlobalDatas", `./datas/datas.json`)
let Members = singleton.useInstance("Members", `./datas/members.json`)


module.exports = {
    name: "wiki", //nom de la commande ici
    async execute(message) {
        let data;
        if(!singleton.isInstance(`${message.guild.id}`)) {
            data = singleton.createInstance(`${message.guild.id}`, `./datas/serveurs/${message.guild.id}.json`)
        } else {
            data = singleton.getInstance(`${message.guild.id}`)
        }
        const prefix = data.json.prefix
        if (!message.guild) return;   
        let args = message.content.slice(data.json.prefix.length).split(' ');
        let command = args.shift().toLowerCase();
        function save() {
            data.save()
        }


        if(command === "wiki") { //nom de la commande ici

            if(!somef.allowCommand(message, {
                superAdminOnly: false,
                everyone: true,
                beta_testers: false,
                roles: [],
                error: {
                    maintenance: false,
                    in_dev: false,
                    update: false,
                    disabled: false
                }
            }) ) return;
            


            if(args[0] == "search") {
                
                
                
                
            } else {
                return message.inlineReply(somef.incorrectArgument({
                        "search": "Rechercher une pag sur le wiki"
                    }, message, 0)
                )
            }
            
        }


    }
}
*/