
import express from "express";


import http from 'node:http'

import { authenticate, createHttp1Request } from "league-connect"

import os from 'node:os'

let prefreences = {
    "firstPreference": null,
    "secondPreference": null
}

const ips = os.networkInterfaces()
let address = 0

for(let i of Object.keys(ips)) {
    let connection = i.split(' ')[0]
    if(connection == "Ethernet") {
        for(let j of ips[i]) {
            if(j.family == "IPv4") {
                address = j.address
            }
        }
   }
}





const app = express()
const server = http.createServer(app)
const PORT = 3000
app.use(express.json())



let ddragon = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
let patch = await ddragon.json()







app.get('/' ,async (req,res) => {
    try {
       
        
       
        
        const credentials = await authenticate()
        
        const response = await createHttp1Request({
            method: "GET",
            
            url: `/lol-summoner/v1/current-summoner`,
        }, credentials)
        
        const result = await response.json()
        let summonerIcon = `https://ddragon.leagueoflegends.com/cdn/${patch[0]}/img/profileicon/${result.profileIconId}.png`
        
        let data = {...result, summonerIcon}
        
        res.send(data)

    } catch( Error ) {
        res.send("League client is not open")
    }
})

app.get('/sync', (req, res) => {
    res.sendStatus(200)
})


app.post('/createNormalGame/:id', async (req, res) => {
    try {
        const { id } = req.params
        let customGameLobby = {
                  
            "lobbyName": "Name",
            "lobbyPassword": null,
            'queueId': id,
            "isCustom": false,
            "partyType": "open"
        }
        
        //Always getting credentials?
        const credentials = await authenticate()

        const response = await createHttp1Request({
            method: "POST",
            url: "/lol-lobby/v2/lobby",
            body: customGameLobby
        }, credentials)
        const result = await response.json()
        
        res.send(result)


    } catch (Error) {
        if(Error) res.send(Error)
    }
})

app.get('/acceptGame', async (req, res) => {
    try {

       
    
        const credentials = await authenticate()

        const response = await createHttp1Request({
            method: "POST",
            url: "/lol-matchmaking/v1/ready-check/accept",
            
        }, credentials)
        const result = await response.json()
        res.send(result)


    } catch (Error) {
        if(Error) res.send(Error)
    }
})


app.get('/queueTime', async (req, res) => {

    try {

        const credentials = await authenticate()
    
        const response = await createHttp1Request({
            method: "GET",
            url: "/lol-matchmaking/v1/search",
            
            
        }, credentials)
        const result = await response.json()
      
        res.send(result)
    } catch(Error) {
        res.send(Error)
    }
})



app.get('/searchGame', async (req, res) => {

    try {

        const credentials = await authenticate()
    
        const response = await createHttp1Request({
            method: "POST",
            url: "/lol-lobby/v2/lobby/matchmaking/search",
            
            
        }, credentials)
        const result = await response.json()
        
        res.send(result)
    } catch(Error) {
        res.send(Error)
    }
})


app.get('/stopGame', async (req, res) => {

    try {

        const credentials = await authenticate()
    
        const response = await createHttp1Request({
            method: "DELETE",
            url: "/lol-lobby/v2/lobby/matchmaking/search",
            
            
        }, credentials)
        const result = await response.json()
        console.log(result)
        res.send(result)
    } catch(Error) {
        res.send(Error)
    }
})


app.get('/myLobby', async (req, res) => {

    try {

        const credentials = await authenticate()
    
        const response = await createHttp1Request({
            method: "GET",
            url: "/lol-lobby/v2/lobby/",
            
            
        }, credentials)
        const { members } = await response.json()
        
       
        for(let i in members) {
            members[i]["iconURL"] = `https://ddragon.leagueoflegends.com/cdn/${patch[0]}/img/profileicon/${members[i].summonerIconId}.png`
        }


        res.send(members)
    } catch(Error) {
        res.send(Error)
    }
})

app.get('/deleteLobby', async (req, res) => {

    try {

        const credentials = await authenticate()
    
        const response = await createHttp1Request({
            method: "DELETE",
            url: "/lol-lobby/v2/lobby/",
            
            
        }, credentials)
        
        let result = await response.json()
        res.send(result)
    } catch(Error) {
        res.send(Error)
    }
})


app.get('/friendsOnline', async (req, res) => {

    try {


        const credentials = await authenticate()
    
        const response = await createHttp1Request({
            method: "GET",
            url: "/lol-chat/v1/friends",
            
            
        }, credentials)
        let result = await response.json()
        result = result.filter(player => {
            
            return player.availability === 'chat' || player.availability === 'away'
        })

        for(let i in result) {
           result[i]['iconURL'] = `https://ddragon.leagueoflegends.com/cdn/${patch[0]}/img/profileicon/${result[i].icon}.png`

        }

        
        
        res.send(result)
    } catch(Error) {
        res.send(Error)
    }
})

app.post('/position/', async (req, res) => {
    try {
        

        prefreences[req.body.preference] = req.body.position
        // let data = `{"firstPreference": null, "secondPreference" : "TOP"}`
        
        //Always getting credentials?
        const credentials = await authenticate()

        const response = await createHttp1Request({
            method: "PUT",
            url: "/lol-lobby/v2/lobby/members/localMember/position-preferences",
            
            body: prefreences
        
        }, credentials)
        const result = await response.json()
        
       
        res.send(result)


    } catch (Error) {
        if(Error) res.send(Error)
    }
})








server.listen(PORT, address, _ => console.log(`listening at ${address}:${PORT}`))