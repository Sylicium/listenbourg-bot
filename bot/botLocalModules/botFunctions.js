const Discord = require('discord.js');


module.exports.checkPermissions = checkPermissions
function checkPermissions(permissionList, Member, haveAll=false) {
    if(!Array.isArray(permissionList)) permissionList = [permissionList]
    if(permissionList.length == 0) {
        return { missingPermissions: [], havePerm: true }
    }
    let json = {
        missingPermissions: [],
        havePerm: true
    }
    for(let i in permissionList) {
        let perm = permissionList[i]
        if(Member.permissions.has(getBitFieldPermission(perm))) { if(!haveAll) return { missingPermissions: [], havePerm: true} }
        else {
            json.havePerm = false
            json.missingPermissions.push(permissionList[i])
        }
    }
    return (haveAll ? json : { missingPermissions: [], havePerm: false})
}

module.exports.checkPermissionsInChannel = checkPermissionsInChannel
function checkPermissionsInChannel(permissionList, Member, channel, haveAll=false) {
    if(!Array.isArray(permissionList)) permissionList = [permissionList]
    if(permissionList.length == 0) {
        return { missingPermissions: [], havePerm: true }
    }
    let json = {
        missingPermissions: [],
        havePerm: true
    }
    for(let i in permissionList) {
        let perm = permissionList[i]
        if(channel.permissionsFor(Member).has(getBitFieldPermission(perm))) { if(!haveAll) return { missingPermissions: [], havePerm: true} }
        else {
            json.havePerm = false
            json.missingPermissions.push(permissionList[i])
        }
    }
    return (haveAll ? json : { missingPermissions: [], havePerm: false})
}


let BitFieldPermissions_ = {
    //"CREATE_INSTANT_INVITES": PermissionsBitField.Flags.SendMessages

    "AddReactions": 64n,
    "Administrator": 8n,
    "AttachFiles": 32768n,
    "BanMembers": 4n,
    "ChangeNickname": 67108864n,
    "Connect": 1048576n,
    "CreateInstantInvite": 1n,
    "CreatePrivateThreads": 68719476736n,
    "CreatePublicThreads": 34359738368n,
    "DeafenMembers": 8388608n,
    "EmbedLinks": 16384n,
    "KickMembers": 2n,
    "ManageChannels": 16n,
    "ManageEmojisAndStickers": 1073741824n,
    "ManageEvents": 8589934592n,
    "ManageGuild": 32n,
    "ManageMessages": 8192n,
    "ManageNicknames": 134217728n,
    "ManageRoles": 268435456n,
    "ManageThreads": 17179869184n,
    "ManageWebhooks": 536870912n,
    "MentionEveryone": 131072n,
    "ModerateMembers": 1099511627776n,
    "MoveMembers": 16777216n,
    "MuteMembers": 4194304n,
    "PrioritySpeaker": 256n,
    "ReadMessageHistory": 65536n,
    "RequestToSpeak": 4294967296n,
    "SendMessages": 2048n,
    "SendMessagesInThreads": 274877906944n,
    "SendTTSMessages": 4096n,
    "Speak": 2097152n,
    "Stream": 512n,
    "UseApplicationCommands": 2147483648n,
    "UseEmbeddedActivities": 549755813888n,
    "UseExternalEmojis": 262144n,
    "UseExternalStickers": 137438953472n,
    "UseVAD": 33554432n,
    "ViewAuditLog": 128n,
    "ViewChannel": 1024n,
    "ViewGuildInsights": 524288n,
    
    "ADD_REACTIONS": 64n,
    "ADMINISTRATOR": 8n,
    "ATTACH_FILES": 32768n,
    "BAN_MEMBERS": 4n,
    "CHANGE_NICKNAME": 67108864n,
    "CONNECT": 1048576n,
    "CREATE_INSTANT_INVITE": 1n,
    "CREATE_PRIVATE_THREADS": 68719476736n,
    "CREATE_PUBLIC_THREADS": 34359738368n,
    "DEAFEN_MEMBERS": 8388608n,
    "EMBED_LINKS": 16384n,
    "KICK_MEMBERS": 2n,
    "MANAGE_CHANNELS": 16n,
    "MANAGE_EMOJIS_AND_STICKERS": 1073741824n,
    "MANAGE_EVENTS": 8589934592n,
    "MANAGE_GUILD": 32n,
    "MANAGE_MESSAGES": 8192n,
    "MANAGE_NICKNAMES": 134217728n,
    "MANAGE_ROLES": 268435456n,
    "MANAGE_THREADS": 17179869184n,
    "MANAGE_WEBHOOKS": 536870912n,
    "MENTION_EVERYONE": 131072n,
    "MODERATE_MEMBERS": 1099511627776n,
    "MOVE_MEMBERS": 16777216n,
    "MUTE_MEMBERS": 4194304n,
    "PRIORITY_SPEAKER": 256n,
    "READ_MESSAGE_HISTORY": 65536n,
    "REQUEST_TO_SPEAK": 4294967296n,
    "SEND_MESSAGES": 2048n,
    "SEND_MESSAGES_IN_THREADS": 274877906944n,
    "SEND_TTS_MESSAGES": 4096n,
    "SPEAK": 2097152n,
    "STREAM": 512n,
    "USE_APPLICATION_COMMANDS": 2147483648n,
    "USE_EMBEDDED_ACTIVITIES": 549755813888n,
    "USE_EXTERNAL_EMOJIS": 262144n,
    "USE_EXTERNAL_STICKERS": 137438953472n,
    "USE_VAD": 33554432n,
    "VIEW_AUDIT_LOG": 128n,
    "VIEW_CHANNEL": 1024n,
    "VIEW_GUILD_INSIGHTS": 524288n,
}


module.exports.getBitFieldPermission = getBitFieldPermission
function getBitFieldPermission(permNameOrList) {
    if(Array.isArray(permNameOrList)) {
        return permNameOrList.map((item, index) => {
            return this.getBitFieldPermission(item)
        })
    } else {
        if(typeof permNameOrList != "string") return permNameOrList
        if(BitFieldPermissions_[permNameOrList] != undefined) {
            return BitFieldPermissions_[permNameOrList]
        } else {
            throw new Error(`BotFunctions.getBitFieldPermission(): Cannot found permission of string '${permNameOrList}'`)
            //return permNameOrList
        }
    }

}


/**
 * createMdodal(modalConfiguration): renvoie l'objet de modal créé avec la liste d'option fournie
 * @version: 2.0.0
 * @param {Object} modalConfiguration - La liste des options du modal
*/
function createModal(modalConfiguration) {
    /*
    {
        customId: "ccc",
        title: "titre",
        options: [
            {
                customId: "test",   // required
                label: "coucou",    // required
                style: "short",     // required
                minLength: 10,          // optionnal
                maxLength: 1000,        // optionnal
                placeholder: "coucou",  // optionnal
                value: "1",             // optionnal
                required: true          // optionnal
            }
        ]
    }
    */

    for(let op_i in modalConfiguration.options) {
        let item = modalConfiguration.options[op_i]
        if(item.value != undefined && item.minLength != undefined) {
            Logger.debug("item.value:",item.value)
            Logger.debug("item.minLength:",item.minLength)
            Logger.debug("`${item.value}`.length",`${item.value}`.length)
            Logger.debug(" `${item.value}`.length <= item.minLength", `${item.value}`.length <= item.minLength)
            if( `${item.value}`.length <= item.minLength ) throw new Error(`[botf.createModal] value length is less than minLength specified.`)
        }
    }

    function getStyleFrom(styleName) {
        if(styleName == "short") {
            return Discord.TextInputStyle.Short
        } else if(styleName == "paragraph") {
            return Discord.TextInputStyle.Paragraph
        }
    }

    let modal = new Discord.ModalBuilder()
		.setCustomId(modalConfiguration.customId)
		.setTitle(modalConfiguration.title);
    
    let allOptionsComponents = modalConfiguration.options.map((item, index) => {

        let component = new Discord.TextInputBuilder()
            .setCustomId(item.customId)
            .setLabel(item.label)
            .setStyle(getStyleFrom(item.style))
        
        if( item.maxLength != undefined ) component.setMaxLength(item.maxLength)
        if( item.minLength != undefined ) component.setMinLength(item.minLength)
        if( item.placeholder != undefined ) component.setPlaceholder(item.placeholder)
        if( item.value != undefined ) component.setValue(item.value)
        if( item.required != undefined ) component.setRequired(item.required);

        return new Discord.ActionRowBuilder().addComponents(component)
       
    })

    modal.addComponents(...allOptionsComponents)
    
    return modal

}
module.exports.createModal = createModal


module.exports.checkPermissionList = checkPermissionList
function checkPermissionList(member, perm_list=undefined) {

    if(!perm_list) perm_list = [
{ name: "CREATE_INSTANT_INVITE", shouldHave: true },
{ name: "KICK_MEMBERS", shouldHave: false },
{ name: "BAN_MEMBERS", shouldHave: false },
{ name: "ADMINISTRATOR", shouldHave: false },
{ name: "MANAGE_CHANNELS", shouldHave: false },
{ name: "MANAGE_GUILD", shouldHave: false },
{ name: "ADD_REACTIONS", shouldHave: true },
{ name: "VIEW_AUDIT_LOG", shouldHave: false },
{ name: "PRIORITY_SPEAKER", shouldHave: false },
{ name: "STREAM", shouldHave: false },
{ name: "VIEW_CHANNEL", shouldHave: true },
{ name: "SEND_MESSAGES", shouldHave: true },
{ name: "SEND_TTS_MESSAGES", shouldHave: true },
{ name: "MANAGE_MESSAGES", shouldHave:true },
{ name: "EMBED_LINKS", shouldHave: true },
{ name: "ATTACH_FILES", shouldHave: true },
{ name: "READ_MESSAGE_HISTORY", shouldHave: true },
{ name: "MENTION_EVERYONE", shouldHave: false },
{ name: "USE_EXTERNAL_EMOJIS", shouldHave: true },
{ name: "USE_EXTERNAL_STICKERS", shouldHave: true },
{ name: "VIEW_GUILD_INSIGHTS", shouldHave: false },
{ name: "CONNECT", shouldHave: false },
{ name: "SPEAK", shouldHave: false },
{ name: "MUTE_MEMBERS", shouldHave: false },
{ name: "DEAFEN_MEMBERS", shouldHave: false },
{ name: "MOVE_MEMBERS", shouldHave: false },
{ name: "USE_VAD", shouldHave: false },
{ name: "CHANGE_NICKNAME", shouldHave: false },
{ name: "MANAGE_NICKNAMES", shouldHave: false },
{ name: "MANAGE_ROLES", shouldHave: false },
{ name: "MANAGE_WEBHOOKS", shouldHave: false },
{ name: "MANAGE_EMOJIS_AND_STICKERS", shouldHave: false },
{ name: "USE_APPLICATION_COMMANDS", shouldHave: true },
{ name: "REQUEST_TO_SPEAK", shouldHave: false },
{ name: "MANAGE_EVENTS", shouldHave: false },
{ name: "MANAGE_THREADS", shouldHave: false },
{ name: "CREATE_PUBLIC_THREADS", shouldHave: false },
{ name: "CREATE_PRIVATE_THREADS", shouldHave: false },
{ name: "SEND_MESSAGES_IN_THREADS", shouldHave: true },
{ name: "USE_EMBEDDED_ACTIVITIES", shouldHave: false },
{ name: "MODERATE_MEMBERS", shouldHave: false },
]
    let permissions_got = []
    let permissions_required = []
    let permissions_missing = []
    let text_list = []
    for(let i in perm_list) {
        let mini_em;
        let required = false
        if(perm_list[i].shouldHave) {
            mini_em = ":white_check_mark:"
            permissions_required.push(perm_list[i].name)
            required = true
        } else {
            mini_em = ":x:"
        }
        try {
            let permissionChecked = this.checkPermissions([perm_list[i].name], member)
            if(permissionChecked.havePerm) { //member.hasPermission(perm_list[i].name)
                text_list.push(`${mini_em} :white_check_mark: ${perm_list[i].name}`)
                permissions_got.push(perm_list[i].name)
            } else {
                text_list.push(`${mini_em} :x: ${perm_list[i].name}`)
                if(required) permissions_missing.push(perm_list[i].name)
            }
        } catch(e) {
            text_list.push(`${mini_em} :warning: ${perm_list[i].name}`)
            if(required) permissions_missing.push(perm_list[i].name)
        }
    }
    return {
        list: text_list,
        permissions: permissions_got,
        permissions_required: permissions_required,
        permissions_missing: permissions_missing,
    }

}



function listToChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}
module.exports.listToChunks = listToChunks

function _lenOfLastInArray(arr) {
    return arr[arr.length-1].length
}
module.exports._lenOfLastInArray = _lenOfLastInArray

/**
 * @version 1.0.0
 */
class pageManager {
    constructor(pageList, pageLength=10) {
        this.pageList = pageList
        this.pageLength = pageLength
        this.selectedPage = 0
    }

    selectPage(int) { this.selectedPage = int }
    getSelectedPage() { return this.getPage(this.selectedPage) }
    switchPage(int) {
        let temp = this.selectedPage + Math.round(int)
        let maxPageInt = this.getInfos().maxPageInt
        if(temp <= 0) temp = 0
        if(temp >= maxPageInt) temp = maxPageInt
        this.selectedPage = temp
        return {
            pageInt: this.selectedPage,
            edge: (temp == 0 || temp == maxPageInt)
        }
    }

    setPageLength(int) {
        this.pageLength = int
    }

    autoSetPageLength(fromInt=2,toInt=Infinity) {
        let temp1 = []
        if(fromInt > Math.floor(this.pageList.length/2+1)) throw new Error(`PageManager: Cannot find ideal page length with range [${fromInt} to ${toInt}] because the possible range is [1, ${Math.floor(this.pageList.length/2+1)}] (half length of list +1)`)
        for(let i=fromInt; ( (i < this.pageList.length/2+1) && (i < toInt)) ;i++) {
            let test = listToChunks(this.pageList,i)
            if(_lenOfLastInArray(test) == i) {
                this.pageLength = i
                //console.log(`Set page length to ${i}, making last array size of ${_lenOfLastInArray(test)} [perfect result found]`)
                return;
            }
            temp1.push({
                i: i,
                lenOfLast: _lenOfLastInArray(test)
            })
        }

        //console.log("temp1",temp1)

        let temp2 = temp1.sort((a,b) => {
            return a.lenOfLast - b.lenOfLast
        })
        //console.log("temp2",temp2)
        let minLenOfLast = temp2[0].lenOfLast
        let temp3 = temp2.filter(item => {
            return item.lenOfLast == minLenOfLast
        })
        //console.log("temp3",temp3)
        let temp4 = temp3.sort((a,b) => {
            return a.i - b.i
        })
        //console.log("temp4",temp4)

        let bestResult = temp4[0]

        this.pageLength = bestResult.i
        //console.log(`Set page length to ${bestResult.i}, making last array size of ${bestResult.lenOfLast} [best result found]`)
    }

    _getPageChunks() {
    return listToChunks(this.pageList, this.pageLength)
    }

    getPage(int) {
        let pages = this._getPageChunks()
        if( !((int >= 0) && (int < pages.length)) ) throw new Error(`PageManager: Cannot get page ${int} when pages are 0 to ${pages.length-1}`)
        return pages[int]
    }
    
    getInfos() {
        let pages = this._getPageChunks()
        return {
            pageList: this.pageList,
            pageLength: this.pageLength,
            pageCount: pages.length,
            selectedPage: this.selectedPage,
            maxPageInt: pages.length-1
        }
    }


}

module.exports.pageManager = pageManager



module.exports.getMessageLink = getMessageLink
function getMessageLink(message) {
    return `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`
}
module.exports.getChannelLink = getChannelLink
function getChannelLink(channelOrMessage) {
    if(channelOrMessage.content) channelOrMessage = channelOrMessage.channel
    return `https://discord.com/channels/${channelOrMessage.guild.id}/${channelOrMessage.id}`
}