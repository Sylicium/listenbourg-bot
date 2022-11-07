module.exports = {
    inDev: false,
    bot: {
        prefix: "lis!",
        id: "",
        token: process.env["TOKEN"],
        setApplicationCommandsOnStart: true,
        setApplicationCommandsInLocal: true,
        setApplicationCommandsInLocal_guilds: [
            "792139282831507467",
            "1038439456828559370" // assistance listenbourg
        ],
        inviteURL: "https://discord.com/api/oauth2/authorize?client_id=1038426349066526750&permissions=8&scope=bot%20applications.commands"
    },
    server: {
        port: 3005,
    },
    api: {
        me: {
            api_token: process.env.API_TOKEN,
            endpoints: {
                dbsapiback: {
                    url: "https://google.com",
                    method: "PUT"
                }
            }
        },
        dbs_api: {
            api_token: process.env.DBS_API_TOKEN,
            endpoints: {
                createPage: {
                    url: "https://dbs-api.captaincommand.repl.co/api/createSettingPage",
                    method: "POST"
                }
            }
        }
    },
    superAdminList: [
        "774003919625519134", // compte principal
        "770334301609787392", // dc
    ],
    website: {
        url: "https://google.com"
    },
    emojis: {
        "loading": {
            id: "867530470438731827",
            tag: "<a:loading:867530470438731827>"
        },
        "check_mark": {
            id: "905859187580485662",
            tag: "<:check:905859187580485662>"
        },
        "no": {
            id: "",
            tag: "❌"
        },
        "bluebutton": {
            id:"",
            tag: "<:bluebutton:1009964954608214197>"
        },
        "whitebutton": {
            id:"",
            tag: "<:whitebutton:1009964968571043880>"
        },
        "whitebarleft": {
            id: "",
            tag: "<:whitebarleft:1009965122409730109>"
        },
        "whitebar": {
            id: "",
            tag: "<:whitebar:1009965136179642498>"
        },
        "whitebarright": {
            id: "",
            tag: "<:whitebarright:1009965128772493394>"
        }
    }
}
