const express = require('express');
const app = express();

app.use(express.urlencoded())
app.use(express.json())
const serv = require('http').createServer(app);
const io = require('socket.io')(serv)


const Database = require("./localModules/database")
const config = require("./config")
let Logger = new (require("./localModules/logger"))()

/*
app.get(`/*`, (req, res) => {

    try {
        res.sendFile(`${__dirname}/site/${req.url}`)
    } catch(e) {
        Logger.log(e)
    }

})
*/

app.get(`*`, (req, res) => {

    Logger.log("Request to url:",req.path)
    res.sendFile(`${__dirname}/site/${req.path}`)

})

app.put("/api/dbsapiback", async (req,res) => {
    try {
        Logger.warn("[API]: (PUT) api/dbsapiback -> got request:")

        if(req.body.backBody.refdbg_api_token != config.api.me.api_token) {
            Logger.warn("[API]: Invalid api_token provided")
            return res.send({ status: 401, message: "Unauthorized." })
        }

        let guildInfos = await Database.isReferencedGuild(req.body.backBody.guild_id)

        if(!guildInfos) {
            Logger.warn("[API]: Guild ID not referenced")
            return res.send({
                status: 422,
                message: "Not Acceptable"
            })
        }

        if(req.body.backBody.user_id != req.body.user.id) {
            Logger.warn("[API]: User is not the same")
            return res.send({
                status: 422,
                message: "Not Acceptable"
            })
        }

        let ref_category = req.body.settings.json.referencement


        await Database.editReferencedGuildDatas(guildInfos.guild.id, {
            [`guild.description`]: (ref_category.description || guildInfos.guild.description),
            [`settings.private`]: ((typeof ref_category.private == "boolean")? ref_category.private : guildInfos.guild.private),
            [`keywords`]: ((typeof ref_category.keywords == "string") ? ref_category.keywords.split(",").map((item,index) => { return item.trim().toLowerCase()}) : guildInfos.guild.keywords),
        })

        Logger.info("[API]: All is good on the route. (PUT) /api/dbsapiback | ref_category:",ref_category)
        
        res.send({
            status: 200
        })

    } catch(e) {
        Logger.warn("[API]: Error on request (PUT) /api/dbsapiback",e)
        Logger.warn(e.stack)
        res.send({
            status: 500,
            message: `${e}`,
            stack: e.stack
        })
    }

})



io.on('connection', (socket) => {
    Logger.log(`[sock][+] [${socket.id}] Connected.`)


    socket.on('disconnect', (socket) => {
        Logger.log(`[sock][-] [${socket.id}] Disconnected.`)
    })

    socket.on("test", datas => {
        Logger.log("test ok reveived from socket")
    })


    socket.on("getAllDiscords", datas => {

        socket.emit("Back_getAllDiscords", {
            state: true,
            all_discords: getCachedDiscords()
        })
        
    })

})


let Cache_all_discords = []


module.exports.getCachedDiscords = getCachedDiscords
function getCachedDiscords() { return JSON.parse(JSON.stringify(Cache_all_discords)) }

module.exports.refreshDiscords_cache = refreshDiscords_cache
async function refreshDiscords_cache() {
        temp = await (await Database.getAllDiscords()).toArray()
    
        for(let d in temp) {
            temp[d]._id = "none"
            let old_lastWeek = temp[d].statistics.messages.lastWeek
            let old_lastMonth = temp[d].statistics.messages.lastMonth
            
            if(temp[d].inviteURL.startsWith("http") && temp[d].inviteURL.indexOf("discord") == -1) {
                temp[d].inviteURL = ""
            }
            
            if(temp[d].settings.private) {
                temp[d].inviteURL = "private"
            }

            
            let messages_lastWeekList = old_lastWeek.filter(m => { return m.timestamp >= (Date.now() - 604800000 ) }) // 604800000 = 7 days
            let messages_lastMonthList = old_lastMonth.filter(m => { return m.timestamp >= (Date.now() - 2678400000 ) }) // 2678400000 = 31 days
            
            temp[d].statistics.messages.lastWeek = Array(messages_lastWeekList.length).fill(1)
            temp[d].statistics.messages.lastMonth = Array(messages_lastMonthList.length).fill(1)
            
            if(temp[d].guild.iconURL == null){
                temp[d].guild.iconURL = "https://referencementdbg.gouv.repl.co/files/discord_default_avatar_0.png"
            } else {
                temp[d].guild.iconURL = temp[d].guild.iconURL.replace(".webp",".png")
            }

            
        }

        Cache_all_discords = temp

        Logger.log(`Cache_all_discords: ${Cache_all_discords.length} discords recached.`)
    return JSON.parse(JSON.stringify(temp))
}

module.exports.run = () => {

    
    
    serv.listen(config.server.port, () => {
        Logger.info(`Ecoute sur le port ${config.server.port}`)
    })

    setInterval(refreshDiscords_cache, 1000*3600)

    refreshDiscords_cache()
    
}



/*


let a_day = 1000*3600*24


function getDateDaysBefore(XDaysBefore) {
    return _formatTime((Date.now() - ((new Date()).setHours(0,0,0,0) - XDaysBefore*a_day) ),"hh:mm:ss").string
}

date_7d_before = getDateDaysBefore(7)







*/
