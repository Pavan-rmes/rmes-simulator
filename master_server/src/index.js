import net from "net"
const serverSocket = net.createServer()
import express from "express";
import { Server as socketIo } from "socket.io";
import http from "http"
import cors from "cors"
import axios from "axios";
import trafoRouter from "./trafoApi.js";
import {cableRouter} from "./cableApi.js"



const app = express()

app.listen(9000,console.log("Main Api is using the port ",9000))


app.use(cors())

app.use("/trafo",trafoRouter)
app.use("/cable",cableRouter)

function sleep(time){
    return new Promise(resolve=>setTimeout(resolve,time))
}


const server = http.createServer(app);
const io = new socketIo(server,{ cors: { origin: '*' } });

const trafoKeys = [100,101,102,103,200,201,202,203,300,301,302,303,400,401,402,403,500,501,502,503,600,601,602,603]
const cableKeys = [110,111,112,113,114]

let trafoRealTime={};
let cableRealTime = {};

io.of("/notify").on("connection", (socket) => {

  //Connected
  console.log("New client connected");

  //get the real time data ans set it to a variable
  trafoKeys.map((tx,id)=>(socket.on("Fromtx"+tx,(arg)=>{trafoRealTime["Fromtx"+tx] = arg})))
  cableKeys.map((cb,id)=>(socket.on("Fromcb"+cb,(arg)=>{cableRealTime["Fromcb"+cb] = arg})))
  //get nameplate  details
  // getNamePlate.map((np,id)=>(socket.on("Fromtx"+np,(arg)=>{namePlateData[np] = arg})))

  // trafoKeys.map((tx,id)=>sendData(tx,socket,trafoRealTime,id))

  //Send nameplate data upstream
 //socket.on("npData",socket.emit("npData",namePlateData))

  
});

class ClientConnection{
  // constructor(){}
  connect(assetkeys,assetType) {
    assetkeys.map((asset)=>{
      io.of(`/notify${asset}`).on("connection",(socket) => {
        console.log("New client connected");
        let interval;
        interval = setInterval(() => {socket.emit(`FromAPI${asset}`,trafoRealTime[`${assetType}${asset}`])}, 1000);
        //Client disconnected
        socket.on("disconnect", () => {
          console.log("Client disconnected");
          clearInterval(interval);
        });
      })
    })
  }
}

const socketServer = new ClientConnection()
socketServer.connect(trafoKeys,"Fromtx")
socketServer.connect(cableKeys,"Fromcb")



// trafoKeys.map((tx,id)=>{
//   io.of(`/notify${tx}`).on("connection",(socket) => {
//     console.log("New client connected");
//     let interval;
//     interval = setInterval(() => {socket.emit(`FromAPI${tx}`,trafoRealTime[`Fromtx${tx}`])}, 1000);
//     //Client disconnected
//     socket.on("disconnect", () => {
//       console.log("Client disconnected");
//       clearInterval(interval);
//     });
//   })
// })




server.listen(8000,()=>{console.log("socket port is",8000)})






