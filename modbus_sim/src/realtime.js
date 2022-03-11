import { Router } from "express";
import { SocketActivation,SocketDeactivate,changeLocation,getLocation,changeDgaValues,ChangeValues,GetValues,getPresentPort,ChangeAmbTemp,changeNameplate,GetNameplateValues,getFanbankStatus,ChangeFanbankStatus } from "./index.js";
import express from "express";

const realTimeRouter = Router();

realTimeRouter.post("/",express.json(),async (req,res)=>{
    const filter = req.body
    console.log(filter)
    const {regulation,port,automatic,percentage,csvTopOil,csvLoad} = filter
    let load = percentage
    if(getPresentPort() === +port) {
        'pass'
    }
    else{
        SocketDeactivate()
        SocketActivation(+port)
    }
    await ChangeValues(regulation,automatic,load,csvTopOil,csvLoad)
    res.send(GetValues())
})

realTimeRouter.get("/",(req,res)=>{
    res.send(GetValues())
})

realTimeRouter.get("/location",(req,res)=>{
    res.send(getLocation())
})

realTimeRouter.post("/location",express.json(),(req,res)=>{
    res.send(changeLocation(req.body))
})

realTimeRouter.post("/dga",express.json(),(req,res)=>{
    changeDgaValues(req.body)
    console.log(req.body)
    res.send({status:"success"})
    
})

realTimeRouter.get("/nameplate",(req,res)=>{
    res.send(GetNameplateValues())
})

realTimeRouter.post("/nameplate",express.json(),(req,res)=>{
    changeNameplate(req.body)
    res.send({stats:"success"})
})

realTimeRouter.post("/ambtemp",express.json(),(req,res)=>{
    ChangeAmbTemp(req.body.ambTemp)
    res.send({status:"success"})
})

realTimeRouter.get("/fanbank",(req,res)=>{
    res.send(getFanbankStatus())
})

realTimeRouter.post("/fanbank",express.json(),(req,res)=>{
    ChangeFanbankStatus(req.body)
    res.send({status:"success"})
})

realTimeRouter.get("/trafoname",(req,res)=>{
    res.send(getTrafoName())
})

realTimeRouter.post("/trafoname",(req,res)=>{
    ChangeTrafoName(req.body)
    res.send({status:"Success"})
})


export default realTimeRouter;