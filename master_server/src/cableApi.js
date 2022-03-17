import express from "express";
import axios from "axios";
import { cableApiAddress } from "./utility.js";

export const cableRouter = express.Router();

cableRouter.get("/nameplate",async (req,res)=>{
    const {id} = req.query
    axios.get(`${cableApiAddress}:${9000+(+id)}/cable/nameplate`)
    .then((data) => res.send(data.data))
    .catch((err)=>res.send(err))
})

cableRouter.post("/nameplate",express.json(),async (req,res)=>{
    const {id} = req.query
    axios.post(`${cableApiAddress}:${9000+(+id)}/cable/nameplate`,req.body)
    .then((data) => res.send(data.data))
    .catch((err)=>res.send(err))
})

cableRouter.get("/config",(req,res)=>{
    const {id} = req.query
    axios.get(`${cableApiAddress}:${9000+(+id)}/cable/config`)
    .then((data)=>res.send(data.data))
    .catch((err)=>res.send(err))
})

cableRouter.post("/config",express.json(),(req,res)=>{
    const {id} = req.query
    axios.post(`${cableApiAddress}:${9000+(+id)}/cable/config`,req.body)
    .then((data) => res.send(data.data))
    .catch((err)=>res.send(err))
})
