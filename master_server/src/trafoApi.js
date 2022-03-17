import { Router } from "express";
import express from "express";
import axios from "axios";
import { trafoApiAddress } from "./utility.js";


const trafoRouter = Router();

trafoRouter.post("/",express.json(),(req,res)=>{
    const {id} = req.query
    axios.post(`${trafoApiAddress}:${9000+(+id)}/trafo`,req.body)
    .then(()=>res.send({status:"success"}))
    
})

trafoRouter.get("/",(req,res)=>{
    const {id} = req.query
    axios.get(`${trafoApiAddress}:${9000+(+id)}/trafo`)
    .then((data) => res.send(data.data))
    .catch((err)=>res.send(err))

})

trafoRouter.get("/location",(req,res)=>{
    const {id} = req.query
    axios.get(`${trafoApiAddress}:${9000+(+id)}/trafo/location`)
    .then((data) => res.send(data.data))
    .catch((err)=>res.send(err))
})

trafoRouter.post("/location",express.json(),(req,res)=>{
    const {id} = req.query
    axios.post(`${trafoApiAddress}:${9000+(+id)}/trafo/location`,req.body)
    .then(()=>res.send({status:"success"}))
})


trafoRouter.post("/dga",express.json(),(req,res)=>{
    const {id} = req.query
    axios.post(`${trafoApiAddress}:${9000+(+id)}/trafo/dga`,req.body)
    .then(()=>res.send({status:"success"}))
    
})

trafoRouter.get("/nameplate",async(req,res)=>{
    const {id} = req.query
    axios.get(`${trafoApiAddress}:${9000+(+id)}/trafo/nameplate`)
    .then((data) => res.send(data.data))
    .catch((err)=>res.send(err))

})

trafoRouter.post("/nameplate",express.json(),async(req,res)=>{
    const {id} = req.query
    const rating = req.body
    axios.post(`${trafoApiAddress}:${9000+(+id)}/trafo/nameplate`, rating)
    .then((data)=>res.send({stats:"success"}))
    // changeNameplate(req.body)
})

trafoRouter.post("/ambtemp",express.json(),(req,res)=>{
    const {id} = req.query
    axios.post(`${trafoApiAddress}:${9000+(+id)}/trafo/ambtemp`,req.body)
    .then(()=>res.send({status:"success"}))
})

trafoRouter.get("/fanbank",(req,res)=>{
    const {id} = req.query
    axios.get(`${trafoApiAddress}:${9000+(+id)}/trafo/fanbank`)
    .then((data) => res.send(data.data))
    .catch((err)=>res.send(err))
})

trafoRouter.post("/fanbank",express.json(),(req,res)=>{
    const {id} = req.query
    axios.post(`${trafoApiAddress}:${9000+(+id)}/trafo/fanbank`,req.body)
    .then(()=>res.send({status:"success"}))
    .catch((err)=>res.send(err))

})



export default trafoRouter;