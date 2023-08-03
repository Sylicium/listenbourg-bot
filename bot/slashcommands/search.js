

const Discord = require("discord.js")
const logger = new (require("../../localModules/logger"))("BotCMD:ping.js")
let config = require("../../config")
let botf = require("../botLocalModules/botFunctions")
let somef = require("../../localModules/someFunctions")

let commandInformations = {
    commandDatas: {
        name: "search",
        description: "Rechercher des discords",
        dmPermission: false,
        type: Discord.ApplicationCommandType.ChatInput,
        options: [
            {
                "name": "query",
                "description": "Recherche à effectuer",
                "type": Discord.ApplicationCommandOptionType.String,
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
    superAdminOnly: false,
    disabled: false,
    indev: false,
    hideOnHelp: false
}

module.exports.commandInformations = commandInformations

module.exports.execute = async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

    await interaction.deferReply({ ephemeral: false })

    let query = interaction.options.get("query")?.value?.toLowerCase() || undefined

    if(!query) {
        return interaction.editReply({
            content: "Une erreur est survenue, la recherche est invalide."
        })
    }


    let all_discords = Modules.server.getCachedDiscords()
    let serverCount = all_discords.length


    let thisChanUrl = `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`

    function getGuild_textBloc(guildObject) {
        let t = ""
        if(guildObject.inviteURL) {
            let the_url = guildObject.inviteURL
            if(guildObject.settings.private) {
                t = `**_${guildObject.guild.name}_ [(?)](${thisChanUrl} "Serveur privé")**`
            } else if(!the_url || the_url == "none" || the_url == "expired" || the_url == "" || the_url.length < 10) {
                t = `${guildObject.guild.name} [(?)](${thisChanUrl} "Invitation invalide #C-01")`
            } else {
                t = `**${guildObject.guild.name} ${guildObject.settings.private ? '(Discord privé)' : `[(rejoindre)](${guildObject.inviteURL})`}**`
            }
        } else {
            t = `${guildObject.guild.name} [(?)](${thisChanUrl} "Invitation invalide #C-02")`
        }
        //let t = `> ${guildObject.inviteURL ? `**[${guildObject.guild.name}${nameAddon}](${the_url} "${guildObject.inviteURL}")**` : `${guildObject.guild.name}[(?)](${thisChanUrl} "Invitation invalide")`}`
        //console.log("t:",t)
        return t
    }


    function checkQuery(q, DiscordObject) {
        q = q.toLowerCase()
        if(DiscordObject.guild.name.includes(q)) return true
        if(DiscordObject.guild.description.includes(q)) return true
        if(DiscordObject.guild.id.includes(q)) return true
        if(DiscordObject.owner.username?.includes(q)) return true
        if(DiscordObject.owner.tag?.includes(q)) return true
        if(DiscordObject.owner.id?.includes(q)) return true
        if(DiscordObject.keywords?.includes(q)) return true
        return false
    }


    let discords = all_discords.filter((item, index) => {
        return checkQuery(query, item)
    })

    let all_discords_lines = discords.map((item) => {
        return getGuild_textBloc(item)
    })
    //console.log("all_discords_lines",all_discords_lines)


    let pageManager = new botf.pageManager(all_discords_lines,10)
    pageManager.selectPage(0)

    //console.log("pageManager.getSelectedPage()",pageManager.getSelectedPage())

    if(all_discords_lines.length == 0) {
        interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor("#4444FF")
                    .setDescription([`\`${serverCount}\` serveurs référencé • \`${query}\``,
                    `Survolez les (?) pour afficher des infos`,
                    ``,
                    `Aucun serveur trouvé avec la recherche.`,
                    ``,
                    `_💡 Recherche plus affinées et personnalisables sur [le site](${config.website.url})_`,
                    ``].join("\n"))
                    .setFooter({ text: `Référencement officiel des Discords Listenbourgeois.`})
                    .setTimestamp()
            ]
        })
        return;
    }


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

    /*interaction.editReply({
        content: ,
        components: [row]
    })*/
    let pInfos = pageManager.getInfos()
    interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setColor("#4444FF")
                .setDescription([
                    `\`${serverCount}\` serveurs référencé • \`${query}\``,
                    `Survolez les (?) pour afficher des infos`,
                    ``,
                    `${pageManager.getSelectedPage().join("\n")}`,
                    ``,
                    `_💡 Recherche plus affinées et personnalisables sur [le site](${config.website.url})_`,
                    ``].join("\n"))
                .setFooter({ text: `${pInfos.selectedPage}/${pInfos.maxPageInt} • Référencement officiel des Discords Listenbourgeois.`})
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
        
        let hasPerm_user = botf.checkPermissions(commandInformations.permisionsNeeded.user, i.member)

        i.deferUpdate()


        /*
        let row = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setLabel("⬅")
                .setStyle(Discord.ButtonStyle.Success)
                .setDisabled(true)
        )
        .addComponents(
            new Discord.ButtonBuilder()
                .setLabel("➡")
                .setStyle(Discord.ButtonStyle.Danger)
                .setDisabled(true)
        );
        */

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
                        .setDescription([`\`${serverCount}\` serveurs référencé • \`${query}\``,
                        `Survolez les (?) pour afficher des infos`,
                        ``,
                        `${pageManager.getSelectedPage().join("\n")}`,
                        ``,
                        `_💡 Recherche plus affinées et personnalisables sur [le site](${config.website.url})_`,
                        ``].join("\n"))
                        .setFooter({ text: `${pInfos.selectedPage}/${pInfos.maxPageInt} • Référencement officiel des Discords Listenbourgeois.`})
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
                        .setDescription([`\`${serverCount}\` serveurs référencé • \`${query}\``,
                        `Survolez les (?) pour afficher des infos`,
                        ``,
                        `${pageManager.getSelectedPage().join("\n")}`,
                        ``,
                        `_💡 Recherche plus affinées et personnalisables sur [le site](${config.website.url})_`,
                        ``].join("\n"))
                        .setFooter({ text: `${pInfos.selectedPage}/${pInfos.maxPageInt} • Référencement officiel des Discords Listenbourgeois.`})
                        .setTimestamp()
                ],
                components: [getNewRows({after: switched.edge})]
            })
        }

        

    })

    /*
    let msg = await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setColor("#4444FF")
                .setDescription(`${pageManager.getPage(0).join("\n")}`)
                .setFooter({ text: "Référencement officiel des Discords Listenbourgeois."})
                .setTimestamp()
        ]
    })
    msg.react("⬅")
    msg.react("➡")
    */
    


    return;


}
