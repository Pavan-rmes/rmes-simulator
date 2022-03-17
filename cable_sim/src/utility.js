import { RegMap } from "./index.js"


export const masterServerAddress = "http://127.0.0.1:8000/notify"

export function convertToHex(num){
    let result 
    if(num <=15){
        result = 0+num.toString(16)
    }
    else{
        result = num.toString(16)
    }
    return result
}

export function convertValues(num){
    let firstPart = Math.floor(num/256)
    let lastPart = num%256
    return (new Buffer.from([firstPart,lastPart]))
}

export function Modbus(data){
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

export function BreakString(str){
    let arr=[]
    for (let i=0;i<str.length;i+=2){
      arr.push(str.substring(i,i+2))
    }
    return(arr)
}

export function incrementalValuegen(min,max,minutes){
    return (min+(((max-min)/60)*minutes))
}
export function sleep(time){
    return new Promise(resolve=>setTimeout(resolve,time))
}
