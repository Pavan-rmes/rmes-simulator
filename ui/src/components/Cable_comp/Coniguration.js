import React, { useContext } from "react";
import {useState,useEffect } from 'react';
import { API } from "../../utility";
import axios from "axios";
import { context } from "../../App";

export function Coniguration({id}) {
  const [port, setPort] = useState(50000+id);
  const [automatic, setAutomatic] = useState("no");
  const [loadPercentage, setLoadPercentage] = useState("50");
  const value = useContext(context)
  value.runstatus = true
  value.status=automatic==="yes"?true:false
  const [loadErr, setLoadErr] = useState(false);
  console.log(loadPercentage,automatic,port)

  useEffect(()=>{
    axios.get(`${API}:${9000}/cable/config?id=${id}`)
    .then((data) => {
      console.log(data.data)
      setLoadPercentage(data.data.loadpercentage);
      setPort(data.data.modbusPort);
      if(data.data.automatic == 1){setAutomatic("yes");}
      else if(data.data.automatic == 2){setAutomatic("no")}
      else{setAutomatic("csv")}
      });
  },[])


  function checkInputValues() {
    let portResult = true;
    let loadResult = false;
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
        <input disabled style={{ width: "250px" }} value={port} className="mb-10 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-blue-500 focus:shadow-outline" type="text" placeholder="Port number above 50,000" />
        <br></br>
        <label className="block text-gray-700  mb-2" for="username">
          Load Simulation Mode
        </label>
        <select value={automatic} onChange={(event) => setSimMode(event)} className='py-2 mb-4 pr-10 pl-2 border rounded leading-tight'>
          <option value={"no"}>Manual Load set</option>
          <option value={"yes"}>LoadCurve</option>
        </select>
        <label className="block mb-2 mt-4" for="username">
          % of Loading (0-130)
        </label>
        <input onChange={(event) => setLoadPercentage(event.target.value)} style={{ width: "250px" }} value={loadPercentage} className={`${loadErr ? "mb-0" : "mb-10"} appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-blue-500 focus:shadow-outline`} type="text" placeholder="load value in percentage" />
        <p className={`${loadErr ? "block" : "hidden"} mb-8 text-red-500`}>Give a valid load percentage</p>
        <div className="relative pt-1">
          <button
            style={{ marginLeft: "30%", marginBottom: "20%" }}
            onClick={() => {
              value.runstatus = !value.runstatus;
              checkInputValues() ? SendRequest(id,loadErr, loadPercentage, port, automatic) : console.log("unexpected error");
            }}
            className="bg-transparent mt-20 hover:bg-blue-600 text-blue-600 font-semibold hover:text-white py-2 px-4 border border-blue-600 hover:border-transparent rounded">
            SET LOAD 
          </button>
        </div>
      </div>
    </>
  );
}


export function SendRequest(id,loadErr,loadPercentage,port,automatic){
    axios.post(`${API}:${9000}/cable/config?id=${id}`, {
      "port": port,
      "automatic":automatic,
      "percentage": loadPercentage})
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }