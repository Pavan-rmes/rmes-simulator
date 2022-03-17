import React, { useContext } from "react";
import {useState,useEffect } from 'react';
import { API } from "../../utility";
import axios from "axios";
import { context } from "../../App";

export function Coniguration({id}) {

  const [regulation, setRegulation] = useState(5);
  const [port, setPort] = useState(50002);
  const [automatic, setAutomatic] = useState("no");
  const [loadPercentage, setLoadPercentage] = useState("50");
  const value = useContext(context)
  value.runstatus = true
  value.status=automatic==="yes"?true:false
  const [portErr, setPortErr] = useState(false);
  const [loadErr, setLoadErr] = useState(false);
  const [csvLoad,setCsvLoad] = useState(false)
  const [csvTopOil,setCsvTopOil] = useState(false)

  useEffect(()=>{
    axios.get(`${API}:${9000}/trafo?id=${id}`)
    .then((data) => {
      setRegulation(data.data.regulation);
      setLoadPercentage(data.data.loadpercentage);
      setPort(data.data.port);
      if(data.data.automatic == 1){setAutomatic("yes");}
      else if(data.data.automatic == 2){setAutomatic("no")}
      else{setAutomatic("csv")}
      setCsvLoad(data.data.loadFromCsv);
      setCsvTopOil(data.data.topOilFromCsv)
      console.log(data)
      });
  },[])

  function checkInputValues() {
    let portResult = false;
    let loadResult = false;
    if (+port < 50000) { setPortErr(true); portResult = false; } else { setPortErr(false); portResult = true; }
    if (+loadPercentage > 0 && +loadPercentage < 130) { setLoadErr(false); loadResult = true; } else { setLoadErr(true); loadResult = false; }
    return portResult && loadResult ? true : false;
  }

  function setSimMode(event){
    // setCsvTopOil(false);setCsvLoad(false);
    setAutomatic(event.target.value)
  }
  return (
    <>
      <div className='config shadow-lg rounded-2xl ml-4 pl-4 pr-4 pt-4'>
        <p className=" mx-24 mt- font-bold">Load Setting</p>
        <hr />
        <label className="block mt-8 mb-2" for="username">
          MODBUS PORT
        </label>
        <input disabled onChange={(event) => setPort(event.target.value)} style={{ width: "250px" }} value={port} className={`${portErr ? "mb-0" : "mb-10"} appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-blue-500 focus:shadow-outline`} type="text" placeholder="Port number above 50,000" />
        <br></br>
        <p className={`${portErr ? "block" : "hidden"} mb-8 text-red-500`}>Port Should be greater than 50,000</p>
        <label className="block text-gray-700  mb-2" for="username">
          Load Simulation Mode
        </label>
        <select value={automatic} onChange={(event) => setSimMode(event)} className='py-2 mb-4 pr-10 pl-2 border rounded leading-tight'>
          <option value={"no"}>Manual Load set</option>
          <option value={"yes"}>LoadCurve</option>
          <option value={"csv"}>From csv</option>
        </select>
        <div className="mb-8">
          <div className={`flex gap-x-5 ${automatic === "csv"?"block":"hidden"}`}>
            <div onClick={(e)=>setCsvLoad(!(csvLoad))}>
              <input checked={csvLoad}  type="checkbox"></input>
              <label className="ml-2" for="username">load</label>
            </div>
            <div onClick={(e)=>{setCsvTopOil(!csvTopOil)}}>
              <input checked={csvTopOil}  type="checkbox"></input>
              <label className="ml-2" for="username">top oil</label>
            </div>
          </div>
        </div>
        <label className="block mb-2" for="username">
          % of Loading (0-130)
        </label>
        <input onChange={(event) => setLoadPercentage(event.target.value)} style={{ width: "250px" }} value={loadPercentage} className={`${loadErr ? "mb-0" : "mb-10"} appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-blue-500 focus:shadow-outline`} type="text" placeholder="load value in percentage" />
        <p className={`${loadErr ? "block" : "hidden"} mb-8 text-red-500`}>Give a valid load percentage</p>
        <div className="relative pt-1">
          <label for="customRange1" className="form-label"> Voltage Regulation Set Point </label>
          <div className='flex'>
            <label>-10%</label>
            <label className='ml-auto'>12%</label>
          </div>
          <input
            onChange={(event) => setRegulation(event.target.value)}
            min="-10" max="12"
            type="range"
            value={regulation}
            className="form-range mb-4 appearance-none w-full h-2 p-0 bg-transparent bg-gray-100 rounded focus:outline-none focus:ring-0 focus:shadow-none" />
          <p className='mb-4'> Configured Value: {regulation} %</p>

          <button
            style={{ marginLeft: "30%", marginBottom: "20%" }}
            onClick={() => {
              value.runstatus = !value.runstatus;
              console.log(csvLoad,csvTopOil);
              checkInputValues() ? SendRequest(id,csvTopOil,csvLoad,loadErr,regulation, loadPercentage, port, automatic) : console.log("unexpected error");
            }}
            className="bg-transparent mt-20 hover:bg-blue-600 text-blue-600 font-semibold hover:text-white py-2 px-4 border border-blue-600 hover:border-transparent rounded">
            SET LOAD 
          </button>
        </div>
      </div>
    </>
  );
}


export function SendRequest(id,csvTopOil,csvLoad,loadErr,regulation,loadPercentage,port,automatic){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
      "regulation": regulation,
      "port": port,
      "automatic":automatic,
      "percentage": loadPercentage,
      csvLoad,csvTopOil
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
  
    fetch(`${API}:${9000}/trafo?id=${id}`, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }