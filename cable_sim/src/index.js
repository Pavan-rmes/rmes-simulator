import net from "net"
const serverSocket = net.createServer()
import express from "express";
import {Modbus,incrementalValuegen,sleep} from "./utility.js"
import cors from "cors"
import {cableRoute} from "./routes/cableRoute.js"
// import axios from "axios";
// import socketIOClient from "socket.io-client";
// import realTimeRouter from "./realtime.js";

export let RegMap=[];


//id of the asset which is passed as a command line parameter
let No = process.argv[2]

//setting load generation to automatic at the starting.
let automaticLoadGeneration =1;

//starting the load with 60 percentage
let loadpercentage =60;


//Termination tags
let phATerm;
let phBTerm;
let phCTerm;

//Name plate details
let MVA_Rating = 200;
let ampereRating = 523.36;
let VoltageRating = 220;
let crossSectionArea = 400;
let assetName = `Cable ${No}`


//modbus port 
let modbusPort = +(50000)+(+No)

const app = express()

app.use(cors())
app.use("/cable",cableRoute)

app.listen((9000)+(+No),console.log("app is listening on ",(9000)+(+No)))


//modbus server listening
serverSocket.on('connection',socket=>{
    socket.on("data",data=>{
      socket.write((new Buffer.from(Modbus(data),'utf-8')))
    })
    socket.on("error", (err) =>socket.end())
})

function SocketActivation(modbusPort){
    serverSocket.listen(modbusPort,()=>{console.log("server bound")})
}


SocketActivation(modbusPort)


function SocketDeactivate(){
    serverSocket.close()
}

export function updateRegisterValues(){
   
    RegMap = [
        {
          reg:2048,
          val:phATerm
        },
        {
            reg:2049,
            val:phBTerm
        },
        {
            reg:2050,
            val:phCTerm
        }
    ]
}


async function TagsGeneration(){
    if(automaticLoadGeneration === 1){
        //automatic load generation based on load
        while(automaticLoadGeneration === 1){
            let date =new Date().toLocaleTimeString()
            let [time,timePeriod] = date.split(" ")
            let [hr,min,sec] = time.split(":")
            //For morning the load varing will be
            if(timePeriod === "am" || timePeriod === "AM"){
                if(hr==="0"){
                    loadpercentage  = incrementalValuegen(35,40,min)
                }
            
                else if(hr==="1"){
                    loadpercentage  = incrementalValuegen(35,40,min)
                }
            
                else if(hr==="2"){
                    loadpercentage  = incrementalValuegen(37,42,min)
                }
            
                else if(hr==="3"){
                    loadpercentage  = incrementalValuegen(40,46,min)
                }
            
                else if(hr==="4"){
                    loadpercentage  = incrementalValuegen(45,50,min)
                }
            
                else if(hr==="5"){
                    loadpercentage  = incrementalValuegen(50,57,min)
                }
            
                else if(hr==="6"){
                    loadpercentage  = incrementalValuegen(50,60,min)
                }
            
                else if(hr==="7"){
                    loadpercentage  = incrementalValuegen(60,65,min)
                }
            
                else if(hr==="8"){
                    loadpercentage  = incrementalValuegen(55,62,min)
                }
            
                else if(hr==="9"){
                    loadpercentage  = incrementalValuegen(47,52,min)
                }
            
                else if(hr==="10"){
                    loadpercentage  = incrementalValuegen(42,45,min)
                }
                else if(hr==="11"){
                    loadpercentage  = incrementalValuegen(45,52,min)
                }
            }

            //For evening the load varing will be
            else{

                if(hr==="12"){
                    loadpercentage  = incrementalValuegen(50,55,min)
                }
            
                else if(hr==="1"){
                    loadpercentage  = incrementalValuegen(55,60,min)
                }
            
                else if(hr==="2"){
                    loadpercentage  = incrementalValuegen(50,55,min)
                }
            
                else if(hr==="3"){
                    loadpercentage  = incrementalValuegen(45,50,min)
                }
            
                else if(hr==="4"){
                    loadpercentage  = incrementalValuegen(53,58,min)
                }
            
                else if(hr==="5"){
                    loadpercentage  = incrementalValuegen(60,70,min)
                }
            
                else if(hr==="6"){
                    loadpercentage  = incrementalValuegen(70,75,min)
                }
            
                else if(hr==="7"){
                    loadpercentage  = incrementalValuegen(65,70,min)
                }
            
                else if(hr==="8"){
                    loadpercentage  = incrementalValuegen(55,60,min)
                }
            
                else if(hr==="9"){
                    loadpercentage  = incrementalValuegen(47,55,min)
                }
            
                else if(hr==="10"){
                    loadpercentage  = incrementalValuegen(42,47,min)
                }
                else if(hr==="11"){
                    loadpercentage  = incrementalValuegen(38,45,min)
                }
            }
            
            CalculateTags()

            //sleep for 1 sec
            await sleep(1000)

        }
    }
}

TagsGeneration()


function CalculateTags(){
    phATerm = 20;
    phBTerm = 30;
    phCTerm = 40;
    updateRegisterValues();
}

//nameplate api details 

export function geNameplate(){
    return({assetName,MVA_Rating,ampereRating,VoltageRating,crossSectionArea})
}

export function setNamePlate(nameplateData){
    assetName = nameplateData.assetName;MVA_Rating = nameplateData.MVA_Rating;ampereRating= nameplateData.ampereRating;
    VoltageRating = nameplateData.VoltageRating; crossSectionArea = nameplateData.crossSectionArea;
    return {status:"success"}
}

//Configuration details 

export function getConfig(){
    return({automatic:automaticLoadGeneration,modbusPort,loadpercentage:loadpercentage.toFixed(2)})
}

export function setConfig(configData){

    if(automaticLoadGeneration ===1){
        if(configData.automatic === "yes"){
            console.log('no need to chnage the generation')
        }
        else{
            automaticLoadGeneration = 0;
            loadpercentage = parseFloat(configData.percentage);
            TagsGeneration()
        }
    }
    else{
        if(configData.automatic === "yes"){
            automaticLoadGeneration = 1
        }
        loadpercentage = parseFloat(configData.percentage);
        TagsGeneration()
    }
}