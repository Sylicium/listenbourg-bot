
window.onload = () => {
    setTimeout(() => {
        a = ``
        console.log("\n"+a+`
┌─────────────┬──────────────────────────────┬────────────┐
│             └─ Bot Discord du Listenbourg ─┘    v1.0.0  │
│      ┌ This website & bot is powered by Sylicium ┐      │
├──────┴───────────────────────────────────────────┴──────┤
│          To turn on Developer mode, type 'dev'          │
└─────────────────────────────────────────────────────────┘`)
// └ ─ ┐ ┴ ┬  ┤ ├ ─ ┼ │ ┘ ┌ ¯
    }, 1000)
}


window.__defineGetter__("dev", function() { 
    _DEVMODE_ON()
});

_DEVMODE = false

_DEVMODE_ON = () => {
    _DEVMODE = true
    document.getElementById("all_discords_list").innerHTML = ""
    
    socket.emit("getAllDiscords", {
        //connectionToken: _getCookie("connectionToken")
    })
    
    _createNotification("info", "[DEV] Developer Mode activated.")
    _createNotification("info", "[DEV] Reloading discords.")
}

let lastRequestTimestamp = 0
let delayBetweenRequests = 1000

let discordSupportStack = {
    /*
    "timestamp": {
        discord_id: "",
        action: "support"
    }
    */
}
function tempHideButtonsOf(discord_id) {
    return;
    let the_buttons = document.getElementById(`buttons_discord_${discord_id}`)
    the_buttons.className += " hidden_buttons"
    setTimeout(() => {
    the_buttons.className = the_buttons.className.replace("hidden_buttons","")
    }, 1000)
}

function removeItemFromList(list, item) {
    let l = list
    while(l.indexOf(item) != -1) {
        l.splice(l.indexOf(item),1)
    }
    return l
}

function supportDiscordByID(discord_id) {
    tempHideButtonsOf(discord_id)
    if( (Date.now() - lastRequestTimestamp) < delayBetweenRequests || Object.keys(discordSupportStack).length >= 3) return _createNotification("warn","Ralentissez entre les clics!")
    lastRequestTimestamp = Date.now()
    
    discordSupportStack[Date.now()] = {
        discord_id: discord_id,
        action: "support"
    }
    if(MyElectorAccount.supportedDiscords.indexOf(discord_id) == -1) MyElectorAccount.supportedDiscords.push(discord_id)
    console.log(discordSupportStack)
    displayDiscordAs(discord_id,"supported")
    
}
function unsupportDiscordByID(discord_id) {
    tempHideButtonsOf(discord_id)
    
    if( (Date.now() - lastRequestTimestamp) < delayBetweenRequests  || Object.keys(discordSupportStack).length >= 3) return _createNotification("warn","Ralentissez entre les clics!")
    lastRequestTimestamp = Date.now()
    
    discordSupportStack[Date.now()] = {
        discord_id: discord_id,
        action: "unsupport"
    }
    MyElectorAccount.supportedDiscords = removeItemFromList(MyElectorAccount.supportedDiscords, discord_id)
    console.log(discordSupportStack)
    displayDiscordAs(discord_id,"unsupported")
}

//setInterval(_sendMyChoicesChanges, 2000)

/*
function _sendMyChoicesChanges() {
    let keys = Object.keys(discordSupportStack)
    if(keys.length == 0) return
    let infos = discordSupportStack[keys[0]]

    delete discordSupportStack[keys[0]]
    console.log(discordSupportStack)

    socket.emit("gouv_loi_search_changeDiscordSupport", {
        connectionToken: _getCookie("connectionToken"),
        discord_id: infos.discord_id,
        action: infos.action
    })
}*/

/*

    lastRequestTimestamp = Date.now()
    socket.emit("gouv_loi_search_changeDiscordSupport", {
        connectionToken: _getCookie("connectionToken"),
        discord_id: discord_id,
        action: "support"
    })
*/

/*
socket.on("Back_gouv_loi_search_changeDiscordSupport", datas => {
    if(!datas) return console.log("[sock][Back_gouv_loi_search_changeDiscordSupport] Server responded with no data")

    console.log("[sock][Back_gouv_loi_search_changeDiscordSupport] Server responded with:",datas)

    if(datas.success) {
        _createNotification("success",`[server] ${datas.success}`)
    }
    if(datas.message) {
        _createNotification("log",`[server] ${datas.message}`)
    }
    if(datas.warn) {
        _createNotification("warn",`[server] ${datas.warn}`)
    }
    if(datas.error) {
        _createNotification("error",`[server] ${datas.error}`)
    }

    if(datas.state) {
        console.log("aaaaaaaaaaaaa aa a a a a ")
        if(datas.isDiscordNowSupported) {
            if(MySupportedDiscords_serverSide.indexOf(datas.changedDiscordId) == -1) MySupportedDiscords_serverSide.push(datas.changedDiscordId)
        } else {
            if(MySupportedDiscords_serverSide.indexOf(datas.changedDiscordId) != -1) {
                MySupportedDiscords_serverSide = removeItemFromList(MySupportedDiscords_serverSide, datas.changedDiscordId)
            }
        }
    } else {
        displayDiscordAs(datas.changedDiscordId, (MySupportedDiscords_serverSide.indexOf(datas.changedDiscordId) != -1 ? "supported" : "unsupported") )
    }

    
    // isDiscordNowSupported: ( datas.action == "support" ? true : false ),
    // changedDiscordId: datas.discord_id
    // MySupportedDiscords_serverSide
    

})
*/


let AllDiscordsElements = [
    
]
function clearAllDiscords(where) {
    let list_;
    if(where == "all_discords_list") {
        list_ = document.getElementById("all_discords_list")
    } else if(where == "my_discords_list") {
        list_ = document.getElementById("my_discords_list")
    } else {
        console.error(`Unknow option where for addDiscord(): ${where}`)
        return false
    }
    list_.innerHTML = ""
    let displayedDiscordsCountElem = document.getElementById(`displayedDiscordsCount_all_discords`)
    displayedDiscordsCountElem.textContent = `0 serveurs sur 0 affichés`
}
function addAllDiscords(where, all_discords) {
    let list_;
    if(where == "all_discords_list") {
        list_ = document.getElementById("all_discords_list")
    } else if(where == "my_discords_list") {
        list_ = document.getElementById("my_discords_list")
    } else {
        console.error(`Unknow option where for addDiscord(): ${where}`)
        return false
    }
    AllDiscordsElements = []
    for(let i in all_discords) {
        let discord = all_discords[i]
        let newDiscord_elem = createNewDiscord_element(discord)
        list_.appendChild(newDiscord_elem)
        AllDiscordsElements.push({
            object: discord,
            element: newDiscord_elem    
        })
    }
    _createNotification("success","Tous les Discords ont été chargés avec succès.")
}


socket.emit("getAllDiscords", {
    //connectionToken: _getCookie("connectionToken")
})

/*
socket.emit("gouv_loi_search_getElector_me", {
    connectionToken: _getCookie("connectionToken")
})*/

socket.on("Back_getAllDiscords", datas => {
    /*
    datas = {
        state: true,
        all_discords: [],
        message: ""
    }

    */
    if(!datas) return console.log("[sock][Back_getAllDiscords] Server responded with no datas")
    console.log("[sock][Back_getAllDiscords] Server responded", datas)
    if(datas.state) {
        addAllDiscords("all_discords_list",datas.all_discords)
        AllDiscordsObjects = JSON.parse(JSON.stringify(datas.all_discords)).map(discord => {
            if(_DEVMODE) return discord
            let new_discord = discord
            if(_formatTime(Date.now()-discord.settings.referencedAt, "DD").json.all_days > 7) { } else {
                new_discord.statistics.messages.lastWeek = []
            }
            if(_formatTime(Date.now()-discord.settings.referencedAt, "DD").json.all_days > 31) { } else {
                new_discord.statistics.messages.lastMonth = []
            }
            return new_discord
        })
        refreshSortDisplaying()
        
        try { document.getElementById("all_discords_loadingComponent").remove() } catch(e) {}
        
        //MyElectorAccount = datas.electorObject
        //MySupportedDiscords_serverSide = JSON.parse(JSON.stringify(datas.electorObject.supportedDiscords))

        //if(datas.uncheckedDiscordsCount >= 0) UncheckedDiscords_serverSide = uncheckedDiscordsCount
        
    }
    if(datas.message) {
        _createNotification("info", `[server] ${datas.message}`)
        try { document.getElementById("all_discords_loadingComponent").textContent = `[server] ${datas.message}` } catch(e) {}
    }

})

let UncheckedDiscords_serverSide = "?"
let MySupportedDiscords_serverSide = [
    
]
let MyElectorAccount = {
    "id": undefined,
    "username": undefined,
    "timestamp": undefined,
    "valid": undefined,
    "commu": undefined,
    "serverFrom": undefined,
    "supportedDiscords": [
    ]
}
/*
socket.on("Back_gouv_loi_search_getElector_me", datas => { // désactivé 
    
    // datas =  {
    //     state: true,
    //     message: "",
    //     electorObject: object
    // }
    
    if(!datas) return console.log("[sock][Back_gouv_loi_search_getElector_me] Server responded with no datas")
    console.log("[sock][Back_gouv_loi_search_getElector_me] Server responded", datas)
    if(datas.state) {
        MyElectorAccount = datas.electorObject
        MySupportedDiscords_serverSide = JSON.parse(JSON.stringify(datas.electorObject.supportedDiscords))
    }
    _refreshDisplayedButtonsForAll()
    
})
*/



async function _aaaa() {

    function setMsgIfContent_include(includes, msg) {
        try {
            let e = document.getElementById("all_discords_loadingComponent")
            console.log("e:",e)
            if(e) {
                if(e.textContent.toLowerCase().includes(includes)) {
                    e.textContent = msg
                }
            }
        } catch(e) {
            
        }
    }
    
    setTimeout(() => {
        setMsgIfContent_include("récupération", "Récupération des Discords en cours... (*--)")
    }, 5*1000)
    setTimeout(() => {
        setMsgIfContent_include("récupération", "Récupération des Discords en cours... (**-)")
    }, 10*1000)
    setTimeout(() => {
        setMsgIfContent_include("récupération", "Récupération des Discords en cours... (***)")
    }, 15*1000)
    
    setTimeout(() => {
        try {
            let e = document.getElementById("all_discords_loadingComponent")
            console.log("e:",e)
            if(e) {
                if(e.textContent.toLowerCase().includes("récupération")) {
                    e.textContent = "La récupération a échouée, essayez de recharger cette page."
                }
            }
        } catch(e) {
            
        }
    }, 20*1000)
}

_aaaa()



    /*
    options = {
        type: "div"
        id: "",
        className: "content",
        childrens: [list],
        textContent: undefined,
        text: undefined,
        value: undefined,
        href: undefined,
        onclick: undefined,
        target: undefined
    }
    */

function parseHTML(string) {
    let DOMparser = new DOMParser(); // DOMparser.parseFromString("string")
    let string2 = `<div class="ZojGHNZkjZOJzcAEJNGZACILkgjhazLCDigjhlibzdfcikbgzakCieeeeeeeeebdhbikhbfIZHKCDFikZAC">${string}</div>`
    //console.log(string2)
    let a = DOMparser.parseFromString(string2, "text/html")
    let b = a.getElementsByClassName("ZojGHNZkjZOJzcAEJNGZACILkgjhazLCDigjhlibzdfcikbgzakCieeeeeeeeebdhbikhbfIZHKCDFikZAC")[0].firstChild
    return b
}

function formatTime(millisecondes, format) {
    /*
    Renvoie un dictionnaire avec le formatage de la durée en ms, en jour, heures, etc...
    YYYY: year
    MM: month
    DDDDD: jour de l'année
    DD: jours du mois
    hh: heure
    mm: minute
    ss: seconde
    */
    let v = { y: 31536000000, mo: 2628000000, d: 86400000, h: 3600000, m: 60000, s: 1000 }
    let la_date = {
        years: Math.floor(millisecondes/v.y),
        months: Math.floor((millisecondes%v.y)/v.mo), // value de l'année divisée en douze poue faire à peu pres
        all_days: Math.floor(millisecondes/v.d), // jours de l'année
        days: Math.floor(((millisecondes%v.y)%v.mo)/v.d), // jours du mois
        hours: Math.floor((((millisecondes%v.y)%v.mo)%v.d)/v.h),
        minutes: Math.floor(((((millisecondes%v.y)%v.mo)%v.d)%v.h)/v.m),
        seconds: Math.floor((((((millisecondes%v.y)%v.mo)%v.d)%v.h)%v.m)/v.s),
        milliseconds: (((((millisecondes%v.y)%v.mo)%v.d)%v.h)%v.m)%v.s
    }
    //console.log(la_date)

    function formatThis(thing, length=2) {
        return `0000${thing}`.substr(-length)
    }

    let return_string = format.replace("YYYY", la_date.years).replace("MM", formatThis(la_date.months)).replace("DDDDD", la_date.all_days).replace("DD", formatThis(la_date.days)).replace("hh", formatThis(la_date.hours)).replace("mm", formatThis(la_date.minutes)).replace("ss", formatThis(la_date.seconds)).replace("ms", formatThis(la_date.milliseconds, 3))

    return return_string
}



function createNewDiscord_element(discord) {

    let created_at_timestamp = discord.guild.createdAt
    let referenced_at_timestamp = discord.settings.referencedAt
    try {
        created_at_timestamp = parseInt(created_at_timestamp)
        referenced_at_timestamp = parseInt(referenced_at_timestamp)
    } catch(e) {}

    let created_since_string = formatTime( (Date.now() - created_at_timestamp), "DDDDD jours")
    let referenced_since_string = formatTime( (Date.now() - referenced_at_timestamp), "DDDDD jours")

    // let old_lastWeek = discord.statistics.messages.lastWeek
    // let old_lastMonth = discord.statistics.messages.lastMonth
    
    // let messages_lastWeekList = old_lastWeek.filter(m => { return m.timestamp >= (Date.now() - 604800000 ) }) // 604800000 = 7 days
    // let messages_lastMonthList = old_lastMonth.filter(m => { return m.timestamp >= (Date.now() - 2678400000 ) }) // 2678400000 = 31 days

    let messages_lastWeekList = discord.statistics.messages.lastWeek
    let messages_lastMonthList = discord.statistics.messages.lastMonth

    console.log(_formatTime(Date.now()-discord.settings.referencedAt, "DD").json)

    let messages_lastWeek_html = (
        (_formatTime(Date.now()-discord.settings.referencedAt, "DD").json.all_days > 7 || _DEVMODE ) ?
        `<span class="stat_messages_lastWeek info">${messages_lastWeekList.length}</span> msg les 7 derniers jours`
        : `N/A No datas for last 7d`
    )
    let messages_lastMonth_html = (
        (_formatTime(Date.now()-discord.settings.referencedAt, "DD").json.all_days > 31 || _DEVMODE )?
        `<span class="stat_messages_lastMonth info">${messages_lastMonthList.length}</span> msg les 31 derniers jours`
        : `N/A No datas for last 31d`
    )


    let the_html = `<div class="guild guild_${discord.guild.id} ${_DEVMODE ? "" : "noselect"}${discord.settings.certified ? ' certified' : ''}">
    <div class="content_left">

        <div class="guild_informations">
            <div class="info">
                <div class="guild_icon_div${discord.settings.isBotOnGuild ? "" : " not_added"}">
                    <img class="guild_icon_img" src="${discord.guild.iconURL}" onerror="this.src='https://cdn.discordapp.com/embed/avatars/1.png'"/>
                </div>
            </div>
            <div class="info">
                <div class="name"><h2 class="guild_name">${discord.guild.name}</h2></div>
            </div>
        </div>
        <div class="guild_buttons">
            ${discord.settings.private ? (
                    `<div class="button button_private_guild">Discord privé</div>`
                ) : `${
                    discord.inviteURL.length < 5 ? (
                        `<div class="button button_invalidURL_guild">Lien invalide</div>`
                    ) : (
                        `<div class="button button_join_guild" onclick="join_discord('${discord.inviteURL}')">Rejoindre</div>`
                    )
                }`
            }
            
        </div>
    </div>
    <div class="content_right">
        <div class="guild_informations">
            <div class="members bold big"><span class="total mini_info">${discord.averageMembers.total}</span> membres</div>
            <div class="online_members bold big"><span class="online mini_info">${discord.averageMembers.online}</span> en ligne</div>
            <div class="created_date">Créé il y a <span class="created_since info">${created_since_string}</span></div>
            <div class="messages_lastWeek"> ${messages_lastWeek_html}</div> <!-- Pas assez de données pour le nbr de msg des 7 derniers jours -->
            <div class="messages_lastMonth"> ${messages_lastMonth_html}</div>
        </div>
        <div class="separator"></div>
        <div class="description">
            ${discord.guild.description}
        </div>
        <div class="developer_mode">
        ${
            !_DEVMODE ? "" : `
            <h3 class="title">Developer section</h3>
            <div class="owner_tag">IsBotOnGuild: ${discord.settings.isBotOnGuild} </div>
            <div class="guild_id">Guild ID: ${discord.guild.id}</div>
            <div class="owner_tag">Réf. since: <span class="total mini_info">${referenced_since_string}</span></div>
            <div class="guild_id">Réf by: ${discord.settings.referencedBy.tag} (${discord.settings.referencedBy.id})</div>
            <div class="owner_tag">Owner: ${discord.owner.tag} (${discord.owner.id})</div>`
        }
        </div>
    </div>
</div>`
    let parsed = parseHTML(the_html)
    return parsed
    /*
<div class="guild guild_2098572395 noselect">
                        <div class="content_left">
            
                            <div class="guild_informations">
                                <div class="info">
                                    <div class="guild_icon_div not_added">
                                        <img class="guild_icon_img" src="https://cdn.discordapp.com/icons/959613928961351712/5e4c485559cef7a9d6ec3122900111e8.webp?size=96"/>
                                    </div>
                                </div>
                                <div class="info">
                                    <div class="name"><h2 class="guild_name">United Factions of r/Place</h2></div>
                                </div>
                            </div>
                            <div class="guild_buttons">
                                <div class="button button_join_guild" onclick="open('308739085738590735')">Rejoindre</div>
                            </div>
                        </div>
                        <div class="content_right">
                            <div class="guild_informations">
                                <div class="members bold big"><span class="total mini_info">2</span> membres</div>
                                <div class="online_members bold big"><span class="online mini_info">1</span> en ligne</div>
                                <div class="created_date">Créé il y a <span class="created_since info">266 jours</span></div>
                                <div class="messages_lastWeek"> <span class="stat_messages_lastWeek info">19</span> msg les 7 derniers jours</div>
                                <div class="messages_lastMonth"> <span class="stat_messages_lastMonth info">192</span> msg les 31 derniers jours</div>
                            </div>
                            <div class="separator"></div>
                            <div class="developer_mode">
                                <h3 class="title">Developer section</h3>
                                <div class="guild_id">Guild ID: 398563985653</div>
                                <div class="owner_tag">Sylicium#2487</div>
                            </div>
                        </div>
                    </div>
    */
}

function aaaa__createNewDiscord_element(discord) {
    console.log("create new element with discord:",discord)
    return _createNewElement({
        type: "div",
        className: `discord`, //${discord.isChecked ? "" : " unchecked_discord"}${discord.isValidated ? " validated_discord" : ""}`,
        id: discord.guild.id,
        childrens: [
            _createNewElement({
                type: "div",
                className: "content",
                childrens: [
                    _createNewElement({
                        type: "div",
                        className: "banner",
                        childrens: [
                            _createNewElement({
                                type: "div",
                                className: "identifier",
                                textContent: discord.guild.id
                            }),/*
                            _createNewElement({
                                type: "div",
                                className: "title",
                                childrens: [
                                    _createNewElement({
                                        type: "h3",
                                        className: "depositaire",
                                        textContent: discord.guild.name
                                    })
                                ]
                            }),*/
                            _createNewElement({
                                type: "div",
                                className: `depositaire`,
                                childrens: [
                                    _createNewElement({
                                        type: "p",
                                        textContent: "Dépositaire:"
                                    }),
                                    _createNewElement({
                                        type: "p",
                                        className: "depositaire_name",
                                        textContent: discord.owner.tag
                                    })
                                ]
                            })
                        ]
                    }),
                    _createNewElement({
                        type: "div",
                        className: "title",
                        childrens: [
                            _createNewElement({
                                type: "h3",
                                className: "depositaire",
                                textContent: discord.guild.name
                            })
                        ]
                    }),
                    _createNewElement({
                        type: "div",
                        className: "description",
                        childrens: [
                            ( discord.guild.name.startsWith("http") ? _createNewElement({
                                type: "p",
                                className: "discord_description",
                                childrens: [
                                    _createNewElement({
                                        type: "a",
                                        className: "discord_description_link",
                                        textContent: discord.guild.name,
                                        href: `${discord.guild.name.split(" ")[0]}`,
                                        target: "_BLANK"
                                    }) 
                                ]
                            }) : _createNewElement({
                                    type: "p",
                                    className: "discord_description",
                                    textContent: discord.guild.name
                                })
                            )
                        ]
                    }),
                    _createNewElement({
                        type: "div",
                        className: "footer",
                        childrens: [
                            _createNewElement({
                                type: "div",
                                className: "support_count",
                                textContent: `${discord.guild.id} sur ${discord.guild.id} en ligne `
                            }),
                            _createNewElement({
                                type: "div",
                                className: "timestamp",
                                textContent: `${discord.settings.isBotOnGuild ? "Le bot est sur ce serveur" : "Le bot n'est pas sur ce serveur"}`
                            })
                        ]
                    }),
                    _createNewElement({
                        type: "div",
                        className: `buttons noselect`,
                        id: `buttons_discord_${discord.identifier}`,
                        childrens: [
                            _createNewElement({
                                type: "div",
                                className: "button joinserver",
                                textContent: "Rejoindre",
                                onclick: () => { join_discord(discord.inviteURL) }
                            })
                        ]
                    })
                ]
            })
        ]
    })
}

function join_discord(url) {
    open(url, "_blank")
}

function reverseInclude(a, b) {
    return ( a.includes(b) || b.includes(a) )
}


function refreshSearchSettings() {
    Search_settings = {
        filter: {
            certified: document.getElementById("filter_settings_show_certified").checked,
            uncertified: document.getElementById("filter_settings_show_uncertified").checked,
            private: document.getElementById("filter_settings_show_private").checked,
            invalid: document.getElementById("filter_settings_show_invalid").checked,
            botless: document.getElementById("filter_settings_show_botless").checked,
            createdAfter: {
                checked: document.getElementById("filter_settings_show_createdAfter_checkbox").checked,
                value: document.getElementById("filter_settings_show_createdAfter_value").valueAsNumber
            },
            createdBefore: {
                checked: document.getElementById("filter_settings_show_createdBefore_checkbox").checked,
                value: document.getElementById("filter_settings_show_createdBefore_value").valueAsNumber,
            },
            recensedAfter: {
                checked: document.getElementById("filter_settings_show_recensedAfter_checkbox").checked,
                value: document.getElementById("filter_settings_show_recensedAfter_value").valueAsNumber,
            },
            recensedBefore: {
                checked: document.getElementById("filter_settings_show_recensedBefore_checkbox").checked,
                value: document.getElementById("filter_settings_show_recensedBefore_value").valueAsNumber,
            },

        },
        search: {
            guildname: document.getElementById("search_settings_ischecked_guildname").checked,
            description: document.getElementById("search_settings_ischecked_description").checked,
            keywords: document.getElementById("search_settings_ischecked_keywords").checked,
            ownername: document.getElementById("search_settings_ischecked_ownername").checked,
            guildid: document.getElementById("search_settings_ischecked_guildid").checked,
            ownerid: document.getElementById("search_settings_ischecked_ownerid").checked,
            inviteURL: document.getElementById("search_settings_ischecked_inviteURL").checked,
            caseSensitive: document.getElementById("search_settings_ischecked_caseSensitive").checked,
        }
    }
}

let Search_settings;
refreshSearchSettings()

function checkFilter(discord_object) {
    if(!Search_settings.filter.certified) {
        if(discord_object.settings.certified) return false
    }
    if(!Search_settings.filter.uncertified) {
        if(!discord_object.settings.certified) return false
    }
    if(!Search_settings.filter.private) {
        if(discord_object.settings.private) return false
    }
    if(!Search_settings.filter.invalid) {
        if( (discord_object.inviteURL.length < 5) ) return false
    }
    if(!Search_settings.filter.botless) {
        if( !discord_object.settings.isBotOnGuild ) return false
    }

    let checkCount = {
        count: 0,
        total: 0
    }

    if(Search_settings.filter.createdAfter.checked) {
        checkCount.total ++
        if(Search_settings.filter.createdAfter.value < discord_object.guild.createdAt) checkCount.count++
    }
    if(Search_settings.filter.createdBefore.checked) {
        checkCount.total ++
        if(discord_object.guild.createdAt < Search_settings.filter.createdBefore.value) checkCount.count++
    }
    if(Search_settings.filter.recensedAfter.checked) {
        checkCount.total ++
        if(Search_settings.filter.recensedAfter.value < discord_object.settings.referencedAt) checkCount.count++
    }
    if(Search_settings.filter.recensedBefore.checked) {
        checkCount.total ++
        if(discord_object.settings.referencedAt < Search_settings.filter.recensedBefore.value) checkCount.count++
    }
    
    if(checkCount.count != checkCount.total) return false


    return true
}

function letAppearDiscord(query, discord_object) {

    if(!checkFilter(discord_object)) return false

    function _tempAB(text) {
        if(!Search_settings.search.caseSensitive) {
            return _normalize(text).toLowerCase()
        } else { return text }
    }
    query = _tempAB(query)


    if(Search_settings.search.guildname) if(_tempAB(discord_object.guild.name).includes(query)) return true
    if(Search_settings.search.description) if(_tempAB(discord_object.guild.description).includes(query)) return true
    if(Search_settings.search.keywords) if(_tempAB(discord_object.keywords.join(" ")).includes(query)) return true
    if(Search_settings.search.ownername) if(_tempAB(discord_object.owner.tag).includes(query)) return true
    if(Search_settings.search.guildid) if(_tempAB(discord_object.guild.id).includes(query)) return true
    if(Search_settings.search.ownerid) if(_tempAB(discord_object.owner.id).includes(query)) return true
    if(Search_settings.search.inviteURL) {
        let _temp_to_check = discord_object.inviteURL || ""
        if(_temp_to_check.toLowerCase() == "private") _temp_to_check = ""
        if(_tempAB(_temp_to_check).includes(query)) return true
    }
  
    return false
}



function letAppearSort(mode, query, discord) {
    //console.log("MyElectorAccount",MyElectorAccount)
    /*
    all_discords, myDiscords, mySupports, noSupport
    */

    /*
allDiscords
certifiedDiscords
min100members
min1000members
    */
    if(mode == "allDiscords") return true
    else if(mode == "certifiedDiscords") {
        if(discord.settings.certified) return true
        else return false
    } else if(mode == "min100members") {
        if(discord.averageMembers.total >= 100) return true
        else return false
    } else if(mode == "min1000members") {
        if(discord.averageMembers.total >= 1000) return true
        else return false
    }

    console.warn(`Invalide mode set in letAppearSort(): ${mode}`)
    return true
}


function refreshSortDisplaying() {
    let by_what = document.getElementById("all_discords_sort_selector_by").value
    let way = document.getElementById("all_discords_sort_selector_way").value

    resortDiscord(by_what, (way == "down"))
}

function resortDiscord(method, invert) {
    console.log(AllDiscordsObjects)
    AllDiscordsObjects = AllDiscordsObjects.sort((a,b) => {

        if(method == "creationDate") {
            if(a.guild.createdAt > b.guild.createdAt) return (invert ? -1 : 1)
            else return (invert ? 1 : -1)
        }
        if(method == "recensementDate") {
            if(a.settings.referencedAt > b.settings.referencedAt) return (invert ? -1 : 1)
            else return (invert ? 1 : -1)
        }
        if(method == "memberCount_total") {
            if(a.averageMembers.total > b.averageMembers.total) return (invert ? -1 : 1)
            else return (invert ? 1 : -1)
        }
        if(method == "memberCount_online") {
            if(a.averageMembers.online > b.averageMembers.online) return (invert ? -1 : 1)
            else return (invert ? 1 : -1)
        }
        
        if(method == "messageCount_7days") {
            if(a.statistics.messages.lastWeek.length > b.statistics.messages.lastWeek.length) return (invert ? -1 : 1)
            else return (invert ? 1 : -1)
        }
        if(method == "messageCount_31days") {
            if(a.statistics.messages.lastMonth.length > b.statistics.messages.lastMonth.length) return (invert ? -1 : 1)
            else return (invert ? 1 : -1)
        }

    })
    console.log("after")
    console.log(AllDiscordsObjects)
    clearAllDiscords("all_discords_list")
    addAllDiscords("all_discords_list", AllDiscordsObjects)
    searchDiscord("all_discords")
}


setInterval(function() {
    refreshSearchSettings()
    searchDiscord("all_discords")
}, 300)


function searchDiscord(discord_mode) {
    
    let query = document.getElementById(`${discord_mode}_query`).value
    query = _normalize(query)
    //console.log(query)
    //displayedDiscordsCount_all_discords
    //
    let displayedDiscordsCountElem = document.getElementById(`displayedDiscordsCount_${discord_mode}`)

    // let sorting_select_value = document.getElementById(`${discord_mode}_sort_selector`).value


    let displayedCount = 0

    for(let i in AllDiscordsElements) {
        let discord_object = AllDiscordsElements[i].object
        let discord_element = AllDiscordsElements[i].element
        let return_letAppear = letAppearDiscord(query, discord_object)
        //console.log("return_letAppear",return_letAppear)
        //console.log("discord object:",discord_object)
        discord_element.className = discord_element.className.replace(" hidden_discord","")
        
        //let return_letAppearSort = letAppearSort(sorting_select_value, query, discord_object)
        let return_letAppearSort = true
        //console.log("return_letAppearSort:", return_letAppearSort, discord_object)
        if(return_letAppear && return_letAppearSort) {
            displayedCount += 1
        } else {
            discord_element.className += " hidden_discord"
        }
        
    }

    displayedDiscordsCountElem.textContent = `${displayedCount} serveurs sur ${AllDiscordsElements.length} affichés` // (${UncheckedDiscords_serverSide} lois en vérification)
    
    //AllDiscordsElements
}



function _refreshDisplayedButtonsForAll() {
    for(let i in AllDiscordsElements) {
        if(MySupportedDiscords_serverSide.indexOf(AllDiscordsElements[i].object.identifier) != -1) {
            displayDiscordAs(AllDiscordsElements[i].object.identifier, "supported")
        } else {
            displayDiscordAs(AllDiscordsElements[i].object.identifier, "unsupported")
        }
    }
}

function displayDiscordAs(discord_id, as_what) {
    /*
    discord_id: discord_id,
    as_what: "supported"/"unsupported"

    */

    let e = document.getElementById(`buttons_discord_${discord_id}`)

    console.log("discord_id:",discord_id,"\ne:",e,"\nclassName:",e.className)
    if(e.className.includes("unChecked")) return;
    console.log("aaaaaaa")
    
    if(e) {
        console.log("bbbbb")
        let support_button = e.getElementsByClassName("support")[0]
        let unsupport_button = e.getElementsByClassName("unsupport")[0]
        support_button.className = support_button.className.split(" is_supported").join("")
        unsupport_button.className = unsupport_button.className.split(" is_unsupported").join("")
        
        if(as_what == "supported") {
            support_button.className += " is_supported"
        } else if(as_what == "unsupported") {
            unsupport_button.className += " is_unsupported"
        }
    }
}
