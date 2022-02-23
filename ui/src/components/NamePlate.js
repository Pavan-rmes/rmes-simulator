import React from "react";
import { API } from "../utility";
import axios from "axios";
import { useEffect, useState } from 'react';


export const nameplate = [{value:"Asset Name",units:"",sym:"name"},{value:"MVA",units:"MVA",sym:"lpow"},{value:"AMPERES",units:"A",sym:"rcurr"},{value:"LOAD VOLTAGE",units:"KV",sym:"lvol"},{value:"Oil Temp At Rated Load",units:"°C",sym:"toTemp"},{value:"Wnd Temp At Rated Load",units:"°C",sym:"wndTemp"},{value:"FREQUENCY",units:"Hz",sym:"fq"}]


export function NamePlate({ id }) {
  const [rating, setRating] = useState(undefined);
  function sendRating() {
    axios.post(`${API}:${9000}/trafo/nameplate?id=${id}`, rating);
  }

  useEffect(() => {
    axios.get(`${API}:${9000}/trafo/nameplate?id=${id}`)
      .then((data) => {
        setRating(data.data);
      });
  }, []);
  return (
    <div className=" md:ml-4 shadow-lg rounded-2xl mb-4 pb-4">
      <p className=" mx-24 mt-4 font-bold">Name plate</p>
      <hr />
      <div className="mt-10">
        {/* <p>Asset Name: </p>
        <input className="border-b-2 ml-2 w-24 focus:outline-none focus:border-b-blue-500"></input> */}
        {nameplate.map((name, id) => (<NamePlateTemp setRating={setRating} id={id} rating={rating} key={id} name={name} />))}
      </div>
      <button
        onClick={() => sendRating()}
        className="border border-green-500 hover:text-white hover:bg-green-500 px-4 py-2 rounded-xl ml-32 md:ml-24 mt-5">Save</button>
    </div>
  );
}
function NamePlateTemp({ name, rating, setRating,id }) {
  const [err, setErr] = useState(false);
  let symbol = name.sym;
  let result = {};
  function Changeval(e) {
    let keys = Object.keys(rating);
    let filterKeys = keys.filter((key) => key !== symbol);
    filterKeys.map((key) => (result[key] = rating[key]));
    // if (isNaN(e.target.value)) { setErr("Give valid value"); }
    // else { setErr(false); }
    result[symbol] = e.target.value;
    setRating(result);
  }
  return (
    <>
      <div className={`${err ? "mb-2" : "mb-10"} ml-5 flex`}>
        <p className="w-28">{name.value}: </p>
        <input
          onChange={(e) => Changeval(e)}
          value={rating ? rating[symbol] : ""} className="border-b-2 ml-2 w-24 focus:outline-none focus:border-b-blue-500" />
        <p>{name.units}</p>
      </div>
      <div className={`${err ? "mb-2" : ""} ml-28 text-red-500`}>{err}</div>
    </>
  );
}
