import React from "react";
import { DiasplaySide } from "../components/Trafo_comp/DiasplaySide";
import { Coniguration } from "../components/Trafo_comp/Coniguration";
import { NamePlate } from "../components/Trafo_comp/NamePlate";
import { Location } from "../components/Location";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { RealtimGraph } from "../RealtimGraph";
import { HomeButton } from "../components/HomeButton";
import { context, LoadCurve } from "../App";

export function Transformer() {
  let { id } = useParams(); id = +id;
  const nameplate = [{ value: "Asset Name", units: "", sym: "name" }, { value: "MVA", units: "MVA", sym: "lpow" }, { value: "AMPERES", units: "A", sym: "rcurr" }, { value: "LOAD VOLTAGE", units: "KV", sym: "lvol" }, { value: "Oil Temp At Rated Load", units: "°C", sym: "toTemp" }, { value: "Wdg Temp At Rated Load", units: "°C", sym: "wndTemp" }, { value: "FREQUENCY", units: "Hz", sym: "fq" }];
  return (
    <>
      <div>
        <HomeButton />
      </div>
      <Location id={id} />
      <hr className="mt-5 md:mx-20" />
      <div className='main flex flex-wrap mt-5 ml-4 md:ml-0'>
        <context.Provider value={{ status: true }}>
          <NamePlate id={id} nameplate={nameplate} />
          <Coniguration id={id} />
          <DiasplaySide id={id} />
          <div>
            <LoadCurve />
            <RealtimGraph id={id} />
          </div>
        </context.Provider>
      </div>
    </>
  );
}
