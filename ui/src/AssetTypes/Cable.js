import React from "react";
import { DiasplaySide } from "../components/Cable_comp/DiasplaySide";
import { Coniguration } from "../components/Cable_comp/Coniguration";
import { NamePlate } from "../components/Cable_comp/NamePlate";
import { Location } from "../components/Location";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { RealtimGraph } from "../RealtimGraph";
import { HomeButton } from "../components/HomeButton";
import { context, LoadCurve } from "../App";

export function Cable() {
  let { id } = useParams(); id = +id;
  return (
    <>
      <div>
        <HomeButton />
      </div>
      <Location id={id} />
      <hr className="mt-5 md:mx-20" />
      <div className='main flex flex-wrap mt-5 ml-4 md:ml-0'>
        <context.Provider value={{ status: true }}>
          <NamePlate id={id} />
          <Coniguration id={id} />
          <DiasplaySide id={id} />
          <div className="w-1/4">
            {/* <LoadCurve /> */}
          <RealtimGraph id={id} />
          </div>
        </context.Provider>
      </div>
    </>
  );
}
