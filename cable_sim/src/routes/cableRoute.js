import express from "express";
import {geNameplate,setNamePlate,getConfig, setConfig} from "../index.js"

export const cableRoute = express.Router()

cableRoute.get("/nameplate",(req,res)=>{
    res.send(geNameplate())
})

cableRoute.post("/nameplate",express.json(),(req,res)=>{
    const nameplate = req.body
    const response = setNamePlate(req.body)
    res.send(response)
})

cableRoute.get("/config",(req,res)=>{
    res.send(getConfig())
})
cableRoute.post("/config",express.json(),(req,res)=>{
    const configData = req.body
    setConfig(configData)
    res.send({status:"sucess"})
})