import React, { useContext } from "react";
import { useEffect, useState } from 'react';
import tarfoImg from "../../images/transformer3.png";
// import DgaDeviceIMg from "./images/hydrocal.png";
import { ModalDga } from "../../Subsystems/ModalDga";
import {ModalFanbank} from "../../Subsystems/ModalFanbank"
import {ModalBushing} from "../../Subsystems/ModalBushing"
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
  maintank:
    [{name:"Top Oil Temp",symbol:"topOilTemp",unit:"°C"},{name:"Winding Temp",symbol:"wndTemp",unit:"°C"},{name:"Load Current",symbol:"loadCurrent",unit:"A"},{name:"Load Power",symbol:"loadPower",unit:"MW"}],
  coolsys:
    [{name:"Inlet Temp",unit:"°C",symbol:"FB1InletTemp"},
    {name:"Outlet Temp",unit:"°C",symbol:"FB1OutletTemp"},
    {name:"Temp Diff",unit:"°C",symbol:"FB1TempDiff"},
    {name:"Fank Bank1",unit:"",symbol:"fankBank1Status",decimals:0},
    {name:"Fank Bank2",unit:"",symbol:"fankBank2Status",decimals:0},
    {name:"Fank Bank1 Current",unit:"A",symbol:"fankBank1Current"},
    {name:"Fank Bank2 Current",unit:"A",symbol:"fankBank2Current"},
  ],
  oltc:[
    {name:"Top Oil Temp",unit:"°C",symbol:"OLTCTopOil"},
    {name:"Tap Position",unit:"",symbol:"tapPosition",decimals:0},
    {name:"Motor Voltage",unit:"V",symbol:"oltcVoltage"},
    {name:"Motor SS Current",unit:"A",symbol:"oltcSSCurrent"},
    {name:"Motor IR Current",unit:"A",symbol:"oltcIRCurr"},
    {name:"Motor Torque",unit:"N-m",symbol:"oltcMtrTorque"},
    {name:"Motor Power",unit:"MW",symbol:"oltcMtrPower"},
    
  ],
  bush:[
    {name:"MV Bush1 Cap",unit:"pf",symbol:"MVBush1Cap",df:1},
    {name:"LV Bush1 Cap",unit:"pf",symbol:"LVBush1Cap",df:1},
    {name:"HV Bush1 Cap",unit:"pf",symbol:"HVBush1Cap",df:1},
    {name:"MV Bush1 tand",unit:"%",symbol:"MVBush1tand",df:0.001},
    {name:"LV Bush1 tand",unit:"%",symbol:"LVBush1tand",df:0.001},
    {name:"HV Bush1 tand",unit:"%",symbol:"HVBush1tand",df:0.001},
  ]
}


const subSystems = [{name:"MainTank",id:"maintank"},{name:"Cooling System",id:"coolsys"},{name:"OLTC",id:"oltc"},{name:"Bushing",id:"bush"}]

export function DiasplaySide({id}) {
  const [sub,setSub] = useState("maintank")
  const [displayValues,setDisplayValues] = useState()
  const [H2,setH2] = useState("73.12")
  const [C2H6,setC2H6] = useState("1.07")
  const [CH4,setCH4] =  useState("0.12")
  const [C2H4,setC2H4] = useState("17.66")
  const [C2H2,setC2H2] = useState("0.04")
  const [showDgaModal, setShowDgaModal] = React.useState(false);
  const [showFanModal, setShowFanModal] = React.useState(false);
  const [showBushModal, setShowBushModal] = React.useState(false);
  const value = useContext(context)
  useEffect(() => {
    axios.get(`${API}:${9000}/trafo?id=${id}`)
      .then((data) => {
        console.log(data.data)
        setH2(data.data.H2);setC2H6(data.data.C2H6);
        setCH4(data.data.CH4);setC2H4(data.data.C2H4);setC2H2(data.data.C2H2);
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
          <img className='tafoimg w-56 mt-14 md:mt-0 ml-20 md:w-96 md:ml-24' src={tarfoImg} />
          <ModalDga 
          H2={H2} setH2={setH2} C2H6={C2H6} setC2H6={setC2H6}
          CH4={CH4} setCH4={setCH4} C2H4={C2H4} setC2H4={setC2H4}
          C2H2={C2H2} setC2H2={setC2H2} id= {id}
          showDgaModal={showDgaModal} setShowDgaModal={setShowDgaModal} />
          <ModalFanbank setShowFanModal={setShowFanModal} showFanModal={showFanModal} id={id} />
          <ModalBushing setShowBushModal={setShowBushModal} showBushModal={showBushModal} id={id} />
        </div>
        <div onClick={() => setShowDgaModal(true)} 
        className={`cursor-pointer top-2 top-48 md:top-52 md:left-5 absolute border w-20 pl-5 bg-gray-500 text-white border-gray-500 hover:bg-white hover:border-gray-500 hover:text-black rounded-xl`} >
            DGA
        </div>
        <div onClick={() => value.status?null:setShowBushModal(true)} 
        className={`cursor-pointer top-28 right-4 absolute border w-24 pl-4 border-white rounded-xl
        ${value.status?"bg-white text-white":"bg-gray-500 text-white border-gray-500 hover:bg-white hover:border-gray-500 hover:text-black"}`} >
            Bushing
        </div>
        <div onClick={() => value.status?null:setShowFanModal(true)} 
        className={`cursor-pointer top-72 right-4  absolute border w-24 pl-3 border-white rounded-xl
        ${value.status?"bg-white text-white":"bg-gray-500 text-white border-gray-500 hover:bg-white hover:border-gray-500 hover:text-black"}`} >
            Fan Bank
        </div>
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
