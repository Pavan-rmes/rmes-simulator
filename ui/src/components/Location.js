import React, { useEffect, useState } from "react";
import { CountryCodes, API } from "../utility";
import axios from "axios";
import rmes from "../images/rmes-logo1.png"

export function Location({ id }) {
  const [code, setCode] = useState("IN");
  const [zip, setZip] = useState(507002); 
  const [ambTemp,setAmbTemp] = useState(35)
  setInterval(()=>{
    getLocation()
  },1000*60)
  function getLocation() {
    axios.get(`http://api.openweathermap.org/data/2.5/weather?zip=${zip},${code}&appid=43aa700123b6e84a6be0c446132dd5fa`)
      .then(data => {
        axios.post(`${API}:${9000 + id}/trafo/ambtemp`, {
          ambTemp: (+(data.data.main.temp) - 273).toFixed(2)
        });
        setAmbTemp((+(data.data.main.temp) - 273).toFixed(2))
      }).catch((err)=>console.log("cannot get the ambient temp"));
  }
  useEffect(()=>{getLocation()},[])
  return (
    <div className="flex flex-wrap">
      <div>
      <div className="ml-8 md:ml-20">
      <div className="flex flex-wrap md:gap-x-4 items-center">
        <p>Location:</p>
        <select
          onChange={(e) => setCode(e.target.value)}
          className="border border-black md:w-32 mr-4 w-2/4 rounded focus:border-blue-500">
          {CountryCodes.map((country, id) => (<option key={id} selected={country.code === "IN" ? true : false} value={country.code}>{country.name}</option>))}
        </select>
      </div>
      <div className="flex flex-wrap mt-4 md:gap-x-4 items-center" >
        <p>Zip Code:</p>
        <input
          onChange={(e) => setZip(e.target.value)}
          value={zip} className="outline-none w-24 md:w-auto border-b-2 focus:border-b-blue-500" placeholder="zipcode" />
        </div>
      <button
        onClick={() => getLocation()}
        className="border border-green-500 mt-4 hover:text-white hover:bg-green-500 rounded-xl px-4 ">Save</button>
      </div>
      </div>
      <p className=" border rounded-2xl py-4 md:pt-10 px-2 ml-8 mr-20">Ambient Temp:- {ambTemp}</p>
      <img className="ml-auto mr-32" src={rmes} />
    </div>
  );
}
