import net from "net"
const serverSocket = net.createServer()
import express from "express";
import cors from "cors"
import axios from "axios";
import socketIOClient from "socket.io-client";
import realTimeRouter from "./realtime.js";
import { loadDetails,parseDate,minDifferene, getDayDiff, compareCurrentTime } from "./helper.js";
import dotenv from "dotenv"

const app = express()

dotenv.config()

app.use(cors())
app.use("/trafo",realTimeRouter)

let topOilTemp;
let wndTemp;
let loadPower;
let loadCurrent;

let fankBank1Status
let fankBank2Status
let fankBank3Status
let fankBank4Status 

let fankBank1Current = 0;
let fankBank2Current = 0;
let fankBank3Current = 0;
let fankBank4Current = 0;

let No = process.argv[2]

//modbus port 
let modbusPort = +(50000)+(+No)

//Fan bank threshold values
let fankBank1Threshold = 60
let fankBank2Threshold = 65
let fankBank3Threshold = 70
let fankBank4Threshold = 75

// power in MVA
let loadPowerRatingofTransformer = 100

let automaticLoadGeneration = 1;
//automaticLoadGeneration 
//1 - automatic
//2 - manual
//3 - from csv


let ambientTemp = 35

//voltage regulation in perecentage
let voltageRegulation = 6

//load voltage rating in volts
let loadvoltageRatingofTransformer = 231000
let frequency = 50
let ratedCurrent = 250


let loadpecentage
let lossRatio = 6
let oilExponent = 0.9
let topOilTempRiseAtRatedLoad = 35
let wndgTempAtRatedLoad = 40

// cooling system
let FB1InletTemp;
let FB1OutletTemp;
let FB1TempDiff;
let RegMap=[];


//Oltc motor rating is 
// p = 1.1kw , i = 2.08A max , 3 ph , 220-250 volt , speed = 1500 RPM
let tapPosition;
let oltcSSCurrent = 0;
let oltcVoltage;
let oltcIRCurr = 0;
let oltcMtrPower = 0;
let oltcMtrTorque = 0;
//OLTCTags
let OLTCTopOil;
//OLTCDGA
let OLTC_C2H4;let OLTC_CH4; let OLTC_H2; let OLTC_O2; let OLTC_CO;
let OLTC_C2H6; let OLTC_MST ; let OLTC_CO2; let OLTC_C2H2; 


//Bushing tags
//capacitance
//Took the insulation resistance as 100Mohms,freq is 50
//c = 1/(wRC*tan(d))
let MVBush1Cap;let MVBush2Cap;let MVBush3Cap;
let LVBush1Cap;let LVBush2Cap;let LVBush3Cap;
let HVBush1Cap;let HVBush2Cap;let HVBush3Cap;

//tan delta
let MVBush1tand;let MVBush2tand;let MVBush3tand;
let LVBush1tand;let LVBush2tand;let LVBush3tand;
let HVBush1tand;let HVBush2tand;let HVBush3tand;


//Main tank Dga 
let C2H4;let CH4; let H2; let O2; let CO;
let C2H6; let MST ; let CO2; let C2H2; 



//Transformer name
let trafoName = `Trafo ${No}`

//reading the data of csv files and put the data for it self
let loadFromCsv = false;let topOilFromCsv = false;




axios.get(`http://api.openweathermap.org/data/2.5/weather?zip=507002,IN&appid=43aa700123b6e84a6be0c446132dd5fa`)
.then(data => {
    ambientTemp = parseFloat((+(data.data.main.temp) - 273).toFixed(2))
}).catch((err)=>console.log("cannot get the ambient temp"))



//This function converts befor giving it to holding registers
function convertValues(num){
    let firstPart = Math.floor(num/256)
    let lastPart = num%256
    return (new Buffer.from([firstPart,lastPart]))
}

function Modbus(data){
    let inputArray = BreakString(data.toString("hex"))
    let outputArray = inputArray.filter((val,index)=>index<=8)
    let noOfRegAsked = parseInt(inputArray[11],16)
    outputArray[5] = convertToHex(3 + noOfRegAsked*2)
    outputArray[8] = convertToHex(noOfRegAsked*2)
    let regValue = parseInt(inputArray[8]+inputArray[9],16)
    let indexOfReg=0;
    RegMap.map((reg,index)=>{
      if(reg.reg === regValue){
        indexOfReg = index;
      }
    })
    let result = []
    outputArray.forEach((ele)=>{
      result.push(parseInt(ele,16))
    })
    for(let i=1;i<=noOfRegAsked && i<=RegMap.length;i++){
      result.push(convertValues(RegMap[indexOfReg]?.val)[0]);
      result.push(convertValues(RegMap[indexOfReg]?.val)[1])
      indexOfReg++;
    }
    return result
}

function BreakString(str){
    let arr=[]
    for (let i=0;i<str.length;i+=2){
      arr.push(str.substring(i,i+2))
    }
    return(arr)
}
  
function convertToHex(num){
let result 
if(num <=15){
    result = 0+num.toString(16)
}
else{
    result = num.toString(16)
}
return result
}

function updateRegisterValues(){
   
    RegMap = [
        {
          reg:2048,
          val:topOilTemp
        },
        {
          reg:2049,
          val:wndTemp
        },
        {
          reg:2050,
          val:ambientTemp*100
        },
        {
          reg:2051,
          val:loadPower
        },
        {
            reg:2052,
            val:loadCurrent*100
        },
        {
            reg:2053,
            val:tapPosition*100
        },
        {
            reg:2054,
            val:oltcSSCurrent
        },
        {
            reg:2055,
            val:oltcVoltage*100
        },
        {
            reg:2056,
            val:fankBank1Status*100
        },
        {
            reg:2057,
            val:fankBank2Status*100
        },
        {
            reg:2058,
            val:fankBank3Status*100
        },
        {
            reg:2059,
            val:fankBank4Status*100
        },
        {
            reg:2060,
            val:fankBank1Current
        },
        {
            reg:2061,
            val:fankBank2Current
        },
        {
            reg:2062,
            val:fankBank3Current
        },
        {
            reg:2063,
            val:fankBank4Current
        },
        {
            reg:2064,
            val:FB1InletTemp   
        },
        {
            reg:2065,
            val:FB1OutletTemp
        },
        {
            reg:2066,
            val:FB1TempDiff
        },
        {
            reg:2067,
            val:MVBush1Cap
        },
        {
            reg:2068,
            val:MVBush2Cap
        },
        {
            reg:2069,
            val:MVBush3Cap
        },
        {
            reg:2070,
            val:LVBush1Cap
        },
        {
            reg:2071,
            val:LVBush2Cap
        },
        {
            reg:2072,
            val:LVBush3Cap
        },
        {
            reg:2073,
            val:HVBush1Cap
        },
        {
            reg:2074,
            val:HVBush2Cap
        },
        {
            reg:2075,
            val:HVBush3Cap
        },
        {
            reg:2076,
            val:MVBush1tand
        },
        {
            reg:2077,
            val:MVBush2tand
        },
        {
            reg:2078,
            val:MVBush3tand
        },
        {
            reg:2079,
            val:LVBush1tand
        },
        {
            reg:2080,
            val:LVBush2tand
        },
        {
            reg:2081,
            val:LVBush3tand
        },
        {
            reg:2082,
            val:HVBush1tand
        },
        {
            reg:2083,
            val:HVBush2tand
        },
        {
            reg:2084,
            val:HVBush3tand
        },
        {
            reg:2085,
            val:OLTCTopOil
        },
        {
            reg:2086,
            val:oltcIRCurr
        },
        {
            reg:2087,
            val:oltcMtrPower
        },
        {
            reg:2088,
            val:oltcMtrTorque
        },
        {
            reg:2090,
            val:C2H4
        },
        {
            reg:2091,
            val:CH4
        },
        {
            reg:2092,
            val:C2H2
        },
        {
            reg:2093,
            val:CO2
        },
        {
            reg:2094,
            val:C2H6
        },
        {
            reg:2095,
            val:O2
        },
        {
            reg:2096,
            val:CO
        },
        {
            reg:2097,
            val:MST
        },
        {
            reg:2098,
            val:H2
        },
        {
            reg:3000,
            val:OLTC_C2H4
        },
        {
            reg:3001,
            val:OLTC_CH4
        },
        {
            reg:3002,
            val:OLTC_C2H2
        },
        {
            reg:3003,
            val:OLTC_CO2
        },
        {
            reg:3004,
            val:OLTC_C2H6
        },
        {
            reg:3005,
            val:OLTC_O2
        },
        {
            reg:3006,
            val:OLTC_CO
        },
        {
            reg:3007,
            val:OLTC_MST
        },
        {
            reg:3008,
            val:OLTC_H2
        }
    ]
}

serverSocket.on('connection',socket=>{
    socket.on("data",data=>{
      socket.write((new Buffer.from(Modbus(data),'utf-8')))
    })
    socket.on("error", (err) =>socket.end())
})

function SocketDeactivate(){
    serverSocket.close()
}

function SocketActivation(modbusPort){
    serverSocket.listen(modbusPort,()=>{console.log("server bound")})
}

console.log(modbusPort)
SocketActivation(modbusPort)


function incrementalValuegen(min,max,minutes){
    return (min+(((max-min)/60)*minutes))
}


async function TagsGeneration(){

    if(automaticLoadGeneration === 1){
        topOilFromCsv = false;loadFromCsv = false
        //automatic load generation based on load
        while(automaticLoadGeneration === 1){
            let date =new Date().toLocaleTimeString()
            let [time,timePeriod] = date.split(" ")
            let [hr,min,sec] = time.split(":")
            //For morning the load varing will be
            if(timePeriod === "am" || timePeriod === "AM"){
                if(hr==="0"){
                    loadpecentage  = incrementalValuegen(35,40,min)
                }
            
                else if(hr==="1"){
                    loadpecentage  = incrementalValuegen(35,40,min)
                }
            
                else if(hr==="2"){
                    loadpecentage  = incrementalValuegen(37,42,min)
                }
            
                else if(hr==="3"){
                    loadpecentage  = incrementalValuegen(40,46,min)
                }
            
                else if(hr==="4"){
                    loadpecentage  = incrementalValuegen(45,50,min)
                }
            
                else if(hr==="5"){
                    loadpecentage  = incrementalValuegen(50,57,min)
                }
            
                else if(hr==="6"){
                    loadpecentage  = incrementalValuegen(50,60,min)
                }
            
                else if(hr==="7"){
                    loadpecentage  = incrementalValuegen(60,65,min)
                }
            
                else if(hr==="8"){
                    loadpecentage  = incrementalValuegen(55,62,min)
                }
            
                else if(hr==="9"){
                    loadpecentage  = incrementalValuegen(47,52,min)
                }
            
                else if(hr==="10"){
                    loadpecentage  = incrementalValuegen(42,45,min)
                }
                else if(hr==="11"){
                    loadpecentage  = incrementalValuegen(45,52,min)
                }
            }

            //For evening the load varing will be
            else{

                if(hr==="12"){
                    loadpecentage  = incrementalValuegen(50,55,min)
                }
            
                else if(hr==="1"){
                    loadpecentage  = incrementalValuegen(55,60,min)
                }
            
                else if(hr==="2"){
                    loadpecentage  = incrementalValuegen(50,55,min)
                }
            
                else if(hr==="3"){
                    loadpecentage  = incrementalValuegen(45,50,min)
                }
            
                else if(hr==="4"){
                    loadpecentage  = incrementalValuegen(53,58,min)
                }
            
                else if(hr==="5"){
                    loadpecentage  = incrementalValuegen(60,70,min)
                }
            
                else if(hr==="6"){
                    loadpecentage  = incrementalValuegen(70,75,min)
                }
            
                else if(hr==="7"){
                    loadpecentage  = incrementalValuegen(65,70,min)
                }
            
                else if(hr==="8"){
                    loadpecentage  = incrementalValuegen(55,60,min)
                }
            
                else if(hr==="9"){
                    loadpecentage  = incrementalValuegen(47,55,min)
                }
            
                else if(hr==="10"){
                    loadpecentage  = incrementalValuegen(42,47,min)
                }
                else if(hr==="11"){
                    loadpecentage  = incrementalValuegen(38,45,min)
                }
            }
            
            CalculateTags()

            //Maintank dga values
            MainTankDga()

            //Fankbank 
            FanBank(topOilTemp)

            //sleep for 1 sec
            await sleep(1000)

        }
    }
    else if(automaticLoadGeneration === 2){
        //Do not read it from the csv file
        topOilFromCsv = false;loadFromCsv = false

        //Manual load generation
        CalculateTags()
        FanBank(topOilTemp)
        updateRegisterValues()
    }
    else if(automaticLoadGeneration === 3){
        //load power
        if(loadFromCsv){
        loadDetails("load")
            .then(async (data)=>{
                let [loadData,id] = data
                while(automaticLoadGeneration === 3){
                    
                    //Total time in min is diff bewteen to consecutive times
                    const currentDate = new Date();let nextid;let totalMin
                    
                    //At the last the next id will bo=e zero
                    id == loadData.length-1?nextid = 0:nextid=id+1

                    //The time difference will be calculated for two consecutive
                    if(nextid != 0){
                        totalMin = Math.abs(loadData[nextid].date - loadData[id].date)/(1000*60)
                    }
                    
                    //At edge condition the next date will be the first row time and next day
                    else{
                        let days = getDayDiff(loadData[nextid].date,loadData[id].date)
                        let nextDay = new Date(loadData[nextid].date.getTime() + (days+1)*24*60*60*1000)
                        totalMin = Math.abs(nextDay - loadData[id].date)/(1000*60)
                    }
                    
                    //minute is claculated between the present time and the current row 
                    //which is just less than the current time
                    const minutes =  minDifferene(loadData[id].date.toLocaleTimeString(),currentDate.toLocaleTimeString())
                    loadpecentage = Math.abs(parseFloat(loadData[id].loadpower)+((parseFloat(loadData[nextid].loadpower)-parseFloat(loadData[id].loadpower))/(+totalMin))*(+minutes)).toFixed(2)
                    console.log(minutes,totalMin,id,loadpecentage,topOilTemp)
                    CalculateTags()
                    
                    //sleep for 1 sec
                    //compute whether the current time is greater than the next row time
                    //If yes it will increment by 1 index
                    compareCurrentTime(currentDate.toLocaleTimeString(),loadData[nextid].date.toLocaleTimeString())?id =nextid:await sleep(1000)
                }
            })
            .catch((e)=>{console.log(e,"of load csv");automaticLoadGeneration = 1;TagsGeneration()})
        }

        //top oil temp
        console.log(topOilFromCsv)
        if(topOilFromCsv){
            loadDetails("load")
            .then(async (data)=>{
                let [loadData,id] = data
                while(automaticLoadGeneration === 3){
                    
                    //Total time in min is diff bewteen to consecutive times
                    const currentDate = new Date();let nextid;let totalMin
                    
                    //At the last the next id will bo=e zero
                    id == loadData.length-1?nextid = 0:nextid=id+1

                    //The time difference will be calculated for two consecutive
                    if(nextid != 0){
                        totalMin = Math.abs(loadData[nextid].date - loadData[id].date)/(1000*60)
                    }
                    
                    //At edge condition the next date will be the first row time and next day
                    else{
                        let days = getDayDiff(loadData[nextid].date,loadData[id].date)
                        let nextDay = new Date(loadData[nextid].date.getTime() + (days+1)*24*60*60*1000)
                        totalMin = Math.abs(nextDay - loadData[id].date)/(1000*60)
                    }
                    
                    //minute is claculated between the present time and the current row 
                    //which is just less than the current time
                    const minutes =  minDifferene(loadData[id].date.toLocaleTimeString(),currentDate.toLocaleTimeString())
                    topOilTemp = (Math.abs(parseFloat(loadData[id].loadpower)+((parseFloat(loadData[nextid].loadpower)-parseFloat(loadData[id].loadpower))/(+totalMin))*(+minutes)).toFixed(2))*100
                    console.log(minutes,totalMin,id,loadpecentage,topOilTemp)
                    CalculateTags()
                    
                    //sleep for 1 sec
                    await sleep(1000)
                    
                    //compute whether the current time is greater than the next row time
                    //If yes it will increment by 1 index
                    compareCurrentTime(currentDate.toLocaleTimeString(),loadData[nextid].date.toLocaleTimeString())?id =nextid:null
                }
            })
            .catch((e)=>{console.log(e,"of top oil temp");topOilFromCsv = false})
        }
    }

}

function CalculateTags(){
    // new top oil calculated from load
    !topOilFromCsv?TopOilCal(loadpecentage):null
        
    //Load power and current
    LoadPowerCurrent(loadpecentage)

    //OLTC subsystem
    OLTCTags(loadpecentage)

    //OLTC Current,Voltage and Tap-pos
    TapPos(topOilTemp)
    oltcVoltage = randomBetweenTwoNumbers(210,220)

    //Winding Temp
    wndTemp = WindingTemp(topOilTemp)

    //cooling subsystem
    CoolingTags(topOilTemp)

    //tandelta calculation
    tanDeltaCal()

    //capacitance calculation
    capacitanceCal()

    //OLTC_DGa gases
    OLTCDga()
    
    //updating the register values
    updateRegisterValues()

}

function TopOilCal(loadpecentage){
    // Top oil temp calculation
    let topOilFirstPart = Math.pow(loadpecentage*0.01,2)
    let topOilSecPart = topOilFirstPart*lossRatio*topOilFirstPart+1
    let topOilThirdPart = topOilFirstPart*lossRatio +1 
    let topOilRatio = Math.pow(topOilSecPart/topOilThirdPart,oilExponent)
    let newtopOilTemp = Math.round((ambientTemp + (loadpecentage*0.01*topOilTempRiseAtRatedLoad*topOilRatio))*100)
    if(topOilTemp){
        topOilTemp = newtopOilTemp
    }
    else{
        if(!(newtopOilTemp-topOilTemp>0.02 && topOilTemp-newtopOilTemp >0.2)){
            topOilTemp = newtopOilTemp
        }
    }

}

function CoolingTags(topOilTemp){
    if(topOilTemp >= fankBank1Threshold*100){
        FB1InletTemp = randomBetweenTwoNumbers(topOilTemp-100,topOilTemp+100)
        FB1OutletTemp = randomBetweenTwoNumbers(topOilTemp-300,topOilTemp-200)
        FB1TempDiff = FB1InletTemp - FB1OutletTemp
    }
    else{
        FB1InletTemp = randomBetweenTwoNumbers(topOilTemp-50,topOilTemp-10)
        FB1OutletTemp = randomBetweenTwoNumbers(topOilTemp-70,topOilTemp-50)
        FB1TempDiff = FB1InletTemp - FB1OutletTemp
    }

}

function OLTCTags(loadpecentage){
    OLTCTopOil = topOilTemp + randomBetweenTwoNumbers(100,300)
    // if(loadpecentage >65 & loadpecentage <70){
    //     tapPosition = 4
    // }
    // else if(loadpecentage >70 & loadpecentage <75){
    //     tapPosition = 3
    // }
    // else if(loadpecentage >40 & loadpecentage <50){
    //     tapPosition = 6
    // }
    // else if(loadpecentage >30 & loadpecentage <40){
    //     tapPosition = 7
    // }
    // else if(loadpecentage >40 & loadpecentage <50){
    //     tapPosition = 6
    // }
    // else if(loadpecentage >50 && loadpecentage <65){
    //     tapPosition = 5
    // }

}

function WindingTemp(topOilTemp){
    return Math.round((wndgTempAtRatedLoad/topOilTempRiseAtRatedLoad)*topOilTemp)
}

function TapPos(topOilTemp){
    //load volatge change in kv
    let loadVolatge= LoadVoltageCal(voltageRegulation)
    console.log(loadVolatge,"load voltage")
    //OLTC Tap Position
    let newtapPosition = CalculateTapPos(loadVolatge)
    console.log(newtapPosition,"tap pos")

    OLTCTopOil = topOilTemp + randomBetweenTwoNumbers(100,150)

    if(tapPosition !== newtapPosition){
        tapPosition = newtapPosition
        setTimeout(()=>{oltcSSCurrent = 0;oltcIRCurr = 0;oltcMtrPower=0;oltcMtrTorque=0;},40000)
        oltcSSCurrent = randomBetweenTwoNumbers(200,215)
        InrushCurr()
    }
}

async function InrushCurr(){
    for(let i=0;i<=20;i++){
        oltcIRCurr = Math.round((oltcSSCurrent*10) -(9*oltcSSCurrent*(Math.pow(2.718,0.01*(i-20)))))
        oltcMtrPower = Math.round(oltcIRCurr * 1.737*oltcVoltage/1000 *0.8)
        oltcMtrTorque = ((oltcMtrPower*10/157).toFixed(2))*100
        updateRegisterValues()
        await sleep(1000)
    }
}

async function MainTankDga(){
    C2H4 = randomBetweenTwoNumbers(1073,1500)
    CH4 = randomBetweenTwoNumbers(0,90)
    C2H2 = randomBetweenTwoNumbers(0,50)
    CO2 = randomBetweenTwoNumbers(3000,6000)
    C2H6 = randomBetweenTwoNumbers(0,300)
    O2 = Math.round(randomBetweenTwoNumbers(5,15))*1000
    CO = randomBetweenTwoNumbers(7335,28554)
    MST = randomBetweenTwoNumbers(474,512)
    H2 = randomBetweenTwoNumbers(3471,6801)
}

async function OLTCDga(){
    OLTC_C2H4 = randomBetweenTwoNumbers(2,84)
    OLTC_CH4 = randomBetweenTwoNumbers(0,50)
    OLTC_C2H2 = randomBetweenTwoNumbers(200,500)
    OLTC_CO2 = randomBetweenTwoNumbers(350,470)
    OLTC_C2H6 = randomBetweenTwoNumbers(0,300)
    OLTC_O2 = Math.round(randomBetweenTwoNumbers(5,15))*1000
    OLTC_CO = randomBetweenTwoNumbers(120,420)
    OLTC_MST = randomBetweenTwoNumbers(3995,4020)
    OLTC_H2 = randomBetweenTwoNumbers(4471,7001)

}


function tanDeltaCal(){
    MVBush1tand = randomBetweenTwoNumbers(270,290);
    MVBush2tand = randomBetweenTwoNumbers(270,290);
    MVBush3tand = randomBetweenTwoNumbers(270,290);
    LVBush1tand = randomBetweenTwoNumbers(270,290);
    LVBush2tand = randomBetweenTwoNumbers(270,290);
    LVBush3tand = randomBetweenTwoNumbers(270,290);
    HVBush1tand = randomBetweenTwoNumbers(270,290);
    HVBush2tand = randomBetweenTwoNumbers(270,290);
    HVBush3tand = randomBetweenTwoNumbers(270,290);
}

function capacitanceCal(){
    MVBush1Cap = 3183.09/(0.001*MVBush1tand);
    MVBush2Cap = 3183.09/(0.001*MVBush2tand);
    MVBush3Cap = 3183.09/(0.001*MVBush3tand);
    LVBush1Cap = 3183.09/(0.001*LVBush1tand);
    LVBush2Cap = 3183.09/(0.001*LVBush2tand);
    LVBush3Cap = 3183.09/(0.001*LVBush3tand);
    HVBush1Cap = 3183.09/(0.001*HVBush1tand);
    HVBush2Cap = 3183.09/(0.001*HVBush2tand);
    HVBush3Cap = 3183.09/(0.001*HVBush3tand);
}


function CalculateTapPos(voltage){

    console.log(voltage,"voltage")
    if(voltage<203){
        return 10
    }
    else if(voltage>=203 && voltage <208){
        return 9
    }
    else if(voltage>=208 && voltage <214){
        return 8
    }
    else if(voltage>=214 && voltage <219){
        return 7
    }
    else if(voltage>=219 && voltage <225){
        return 6
    }
    else if(voltage>=225 && voltage <loadvoltageRatingofTransformer/1000){
        return 5
    }
    else if(voltage>=231 && voltage <236){
        return 4
    }
    else if(voltage>=236 && voltage <242){
        return 3
    }
    else if(voltage>=242 && voltage <248){
        return 2
    }
    else if(voltage>=248 && voltage <254){
        return 1
    }
    else{
        return 1
    }
}

function FanBank(topOilTemp){
    //FanBank status
    if(topOilTemp < fankBank1Threshold*100){
        fankBank1Status = 0
        fankBank2Status = 0
        fankBank3Status = 0
        fankBank4Status = 0
    }
    else if(topOilTemp>=fankBank1Threshold*100 && topOilTemp<fankBank2Threshold*100){
        topOilTemp = 0.99*topOilTemp
        fankBank1Status = 1
        fankBank2Status = 0
        fankBank3Status = 0
        fankBank4Status = 0
    }
    else if(topOilTemp>=fankBank2Threshold*100 && topOilTemp < fankBank3Threshold*100){
        topOilTemp = 0.98*topOilTemp
        fankBank1Status = 1
        fankBank2Status = 1
        fankBank3Status = 0
        fankBank4Status = 0
    }
    else if(topOilTemp>=fankBank3Threshold*100 && topOilTemp < fankBank4Threshold*100){
        topOilTemp = 0.96*topOilTemp
        fankBank1Status = 1
        fankBank2Status = 1
        fankBank3Status = 1
        fankBank4Status = 0
    }
    else if (topOilTemp >= fankBank4Threshold*100){
        topOilTemp = 0.94*topOilTemp
        fankBank1Status = 1
        fankBank2Status = 1
        fankBank3Status = 1
        fankBank4Status = 1
    }
    fanbankCurrent()
}

function fanbankCurrent(){
    if(fankBank1Status ===1){
        fankBank1Current = randomBetweenTwoNumbers(386,396)
    }
    else{
        fankBank1Current=0;
    }
    if(fankBank2Status ===1){
        fankBank2Current = randomBetweenTwoNumbers(386,396)
    }
    else{
        fankBank2Current =0;
    }
    if(fankBank3Status ===1){
        fankBank3Current = randomBetweenTwoNumbers(386,396)
    }
    else{
        fankBank3Current=0;
    }
    if(fankBank4Status ===1){
        fankBank4Current = randomBetweenTwoNumbers(386,396)
    }
    else{
        fankBank4Current =0;
    }
}

function LoadPowerCurrent(loadpecentage){
    //Load Current and power
    if((loadpecentage*0.01) >0.11){
        let linevoltage = loadvoltageRatingofTransformer*1.737
        loadCurrent =  ((loadPowerRatingofTransformer*1000000)/(linevoltage))*(loadpecentage*0.01)
        loadPower = loadCurrent*linevoltage/10000
    }
    else{
        let linevoltage = loadvoltageRatingofTransformer*1.737
        loadCurrent =  ((loadPowerRatingofTransformer*1000000)/(linevoltage))*(0.05)
        loadPower = loadCurrent*linevoltage
    }
}

function sleep(time){
    return new Promise(resolve=>setTimeout(resolve,time))
}

function randomBetweenTwoNumbers(min,max){
    let randomBetweenZeroToOne = Math.random()
    return Math.round((min+randomBetweenZeroToOne*(max-min)))
}

function LoadVoltageCal(voltageRegulation){
    return ((loadvoltageRatingofTransformer/1000)-(2.31*voltageRegulation))
}

TagsGeneration()

async function ChangeValues(regulation,automatic,load,csvTopOil,csvLoad){
    voltageRegulation = regulation
    
    automaticLoadGeneration= "none"
    // stops the generation and will start if config changes
    await sleep(1000)
    if(automatic === "csv"){
        automaticLoadGeneration = 3;
        loadFromCsv = csvLoad
        topOilFromCsv = csvTopOil
    }
    else if(automatic === "no"){
        automaticLoadGeneration = 2;
    }
    else{
        automaticLoadGeneration = 1;
    }
    
    loadpecentage = parseFloat(load)
    TagsGeneration()
}

function changeDgaValues(dgaValues){
    console.log(dgaValues)
    H2 = (+dgaValues.H2)*100;C2H6=(+dgaValues.C2H6)*100;CH4=(+dgaValues.CH4)*100;C2H4=(+dgaValues.C2H4)*100;C2H2=(+dgaValues.C2H2)*100
    automaticLoadGeneration===2?TagsGeneration():null
}

function ChangeAmbTemp(ambTemp){
    ambientTemp = parseFloat(ambTemp)
    updateRegisterValues() 
}

function GetValues(){
    return({regulation:voltageRegulation,
        port:modbusPort,
        automatic:automaticLoadGeneration,
        loadpercentage:loadpecentage,
        C2H4:C2H4/100,CH4:CH4/100,C2H2:C2H2/100,CO2:CO2/100,C2H6:C2H6/100,O2:O2,CO:CO/100,MST:MST/100,H2:H2/100,
        loadFromCsv,topOilFromCsv
    })
}

function getPresentPort(){
    return modbusPort
}

function GetNameplateValues(){
    return({
        name:trafoName,
        lpow:loadPowerRatingofTransformer,
        lvol:loadvoltageRatingofTransformer/1000,
        toTemp:topOilTempRiseAtRatedLoad,
        wndTemp:wndgTempAtRatedLoad,
        fq:frequency,
        rcurr:ratedCurrent
    })
}

function changeNameplate(rating){
    trafoName = rating?.name;
    loadPowerRatingofTransformer=rating?.lpow;
    loadvoltageRatingofTransformer = rating?.lvol*1000;
    topOilTempRiseAtRatedLoad = rating?.toTemp;
    frequency= rating?.fq;
    ratedCurrent = rating?.rcurr
    wndgTempAtRatedLoad = rating?.wndTemp
    automaticLoadGeneration === 2?TagsGeneration():null
}

export function getFanbankStatus(){
    return ({Fb1status:fankBank1Status,Fb2status:fankBank2Status})
}

export function ChangeFanbankStatus(status){
    fankBank1Status= status.Fb1Status
    fankBank2Status = status.Fb2Status
    updateRegisterValues()
}


const socket  = socketIOClient("http://127.0.0.1:8000/notify")
socket.on("success",(arg)=>socket.disconnect())

export {ChangeValues,SocketActivation,SocketDeactivate,GetValues,changeDgaValues,getPresentPort,ChangeAmbTemp,GetNameplateValues,changeNameplate}

const getApiAndEmit = socket => {
    const response = {
        maintank:{topOilTemp:[topOilTemp,0.01],wndTemp:[wndTemp,0.01],loadCurrent:[loadCurrent,1],loadPower:[loadPower,0.01]},
        coolsys:{FB1InletTemp:[FB1InletTemp,0.01],FB1OutletTemp:[FB1OutletTemp,0.01],FB1TempDiff:[FB1TempDiff,0.01],
                fankBank1Status:[fankBank1Status,1],fankBank1Current:[fankBank1Current,0.01],
                fankBank2Status:[fankBank2Status,1],fankBank2Current:[fankBank2Current,0.01]},
        oltc:{oltcIRCurr:[oltcIRCurr,0.01],oltcMtrPower:[oltcMtrPower,0.01],OLTCTopOil:[OLTCTopOil,0.01],
                oltcVoltage:[oltcVoltage,1],oltcSSCurrent:[oltcSSCurrent,0.01],tapPosition:[tapPosition,1],oltcMtrTorque:[oltcMtrTorque,0.01]},
        bush:{MVBush1Cap:[MVBush1Cap,1],LVBush1Cap:[LVBush1Cap,1],HVBush1Cap:[HVBush1Cap,1],
                MVBush1tand:[MVBush1tand,0.001],LVBush1tand:[LVBush1tand,0.001],HVBush1tand:[HVBush1tand,0.001]}
}
    socket.emit(`Fromtx${No}`, response);
};
const interval = setInterval(()=>getApiAndEmit(socket),1000)

// getApiAndEmit(socket)

app.listen((9000)+(+No),console.log("app is listening on ",(9000)+(+No)))



