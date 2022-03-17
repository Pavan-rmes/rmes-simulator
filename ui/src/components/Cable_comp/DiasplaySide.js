import React, { useContext } from "react";
import { useEffect, useState } from 'react';
import cableImg from "../../images/cableModel1.jpg";
// import DgaDeviceIMg from "./images/hydrocal.png";
import { API } from "../../utility";
import socketIOClient from "socket.io-client";
import axios from "axios";
import { context } from "../../App";

function dispVal(displayValues,sub,ele){
    return multiplywithFC(displayValues?displayValues[sub]:{},ele?.symbol,ele?.decimals)
}

function Dividewithhun(displayValues,symbol,decimal=2){
  let value = displayValues?displayValues[symbol]:NaN
  let calculatedVal = !decimal?Math.round(((+value)/100).toFixed(2)):((+value)/100).toFixed(2)
  return calculatedVal
}
function multiplywithFC(displayValues,symbol,decimal=2){
  let value = displayValues?displayValues[symbol]:NaN
  if (!value){
    return "NAN"
  }
  else{
    let calculatedVal = !decimal?Math.round(((+value[0])*value[1]).toFixed(2)):((+value[0])*value[1]).toFixed(2)
    return calculatedVal
  }
}


const trafo =  {
  termination:
    [{name:"Ph A Termination",symbol:"topOilTemp",unit:"°C"},
    {name:"Ph B Termination",symbol:"wndTemp",unit:"°C"},
    {name:"Ph C Termination",symbol:"loadCurrent",unit:"°C"}],
  joints:
    [{name:"Ph A Joint",unit:"°C",symbol:"FB1InletTemp"},
    {name:"Ph B Joint",unit:"°C",symbol:"FB1OutletTemp"},
    {name:"Ph C Joint",unit:"°C",symbol:"FB1TempDiff"}
  ],
  insulation:[
    {name:"Top Oil Temp",unit:"°C",symbol:"OLTCTopOil"},
    {name:"Tap Position",unit:"",symbol:"tapPosition",decimals:0},
    {name:"Motor Voltage",unit:"V",symbol:"oltcVoltage"},
    
  ]
}


const subSystems = [{name:"Termination",id:"termination"},{name:"Joints",id:"joints"},{name:"Insulation",id:"insulation"}]

export function DiasplaySide({id}) {
  const [sub,setSub] = useState("termination")
  const [displayValues,setDisplayValues] = useState()
  console.log(sub)
  const value = useContext(context)
  useEffect(() => {
    axios.get(`${API}:${9000}/trafo?id=${id}`)
      .then((data) => {
        console.log(data.data)
      });
  }, [value.status,value.runstatus]);

  useEffect(() => {
    const ENDPOINT = `${API}:${8000}/notify${id}`;
    console.log(ENDPOINT)
    const socket = socketIOClient(ENDPOINT);
    socket.on(`FromAPI${id}`, data => {
      setDisplayValues(data)
    });
    return () => socket.disconnect();
  }, []);
  return (
    <>
      <div className='box-border display-card mr-2 relative md:ml-4 pt-5 shadow-lg mr-5 rounded-2xl md:pr-2'>
        <Displaytab sub={sub} setSub = {setSub} />
        <div className="pt-12">
          <img className='tafoimg w-56 mt-14 md:mt-0 ml-20 md:w-96 md:ml-24' src={cableImg} />
        </div>
        {/* <div 
        className={`cursor-pointer top-2 top-48 md:top-52 md:left-5 absolute border w-20 pl-5 bg-gray-500 text-white border-gray-500 hover:bg-white hover:border-gray-500 hover:text-black rounded-xl`} >
            DGA
        </div>
        <div 
        className={`cursor-pointer top-28 right-4 absolute border w-24 pl-4 border-white rounded-xl
        ${value.status?"bg-white text-white":"bg-gray-500 text-white border-gray-500 hover:bg-white hover:border-gray-500 hover:text-black"}`} >
            Bushing
        </div>
        <div 
        className={`cursor-pointer top-72 right-4  absolute border w-24 pl-3 border-white rounded-xl
        ${value.status?"bg-white text-white":"bg-gray-500 text-white border-gray-500 hover:bg-white hover:border-gray-500 hover:text-black"}`} >
            Fan Bank
        </div> */}
        <div className="text-center mt-8 text-blue-500 font-bold">
          Present Values
        </div>
        <div className='display flex md:ml-10 mt-5 gap-x-14 gap-y-10 flex-wrap'>
          {trafo[sub].map((ele,id)=>(
            <div key={id} className="flex flex-col items-center">
              <label>{ele?.name}</label>
              <p >{dispVal(displayValues,sub,ele)} {ele.unit}</p>     
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Displaytab({sub,setSub}){
  return(
    <>
    <div className="flex items-center gap-x-2 my-2 ml-10">
      {subSystems.map((ele,id)=>
      (<p 
      key={id}
      onClick={()=>setSub(ele.id)}
       className={`${sub==ele.id?"bg-blue-600 text-white":""} hover:bg-blue-600 hover:text-white rounded-xl cursor-pointer px-5`}>{ele.name}</p>))}
    </div>
    <hr></hr>
    </>
  )
}
