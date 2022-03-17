import React,{createContext, useContext, useReducer} from "react";
import './App.css';
import {Login} from "./components/Login"
import { Redirect, Route, Switch } from "react-router-dom";
import {AuthRoute} from "./Authroute"
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import loadcurve from "./images/load_Curve1.jpg"
import {assetTypes} from "./Authroute"
import { Transformer } from "./AssetTypes/Transformer";
import { Cable } from "./AssetTypes/Cable";
import {filterAsset} from "./utility"

function App() {
  // const location = useLocation()
  const id = +window.location.href.split("=")[1]
  //socket
  return (
      <div>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <AuthRoute path="/trafo/:id">
              <Transformer id={id} />
          </AuthRoute>
          <AuthRoute path="/cable/:id">
              <Cable id={id} />
          </AuthRoute>
          <AuthRoute path="/assets">
            <Assets />
          </AuthRoute>
          <Redirect from="/" to="/login" />
        </Switch>
      </div>
  );
}

function Assets(){
  const assetData= assetTypes()
  return(
    <div>
      {assetData.map((assetType)=>{return(
      <div className=" md:ml-20 md:mt-16 flex gap-x-20 flex-wrap gap-y-10">
          {assetType.assets.map((asset,id)=>(<AssetTemp key={id} assetType={assetType.assetType} asset={asset} /> ))}
      </div>)})}
    </div>
  )
}


function AssetTemp({asset,assetType}){
  const history = useHistory()
  const [link,img] = filterAsset(assetType)
  return(
    <div
    onClick={()=>(history.push(`/${link}/${asset.port}`))}
    className="flex cursor-pointer flex-col">
      <img className="w-32" src={img} />
      <p>{asset.name}</p>
    </div>
  )
}

export const context = createContext()

export default App;

export function LoadCurve(){
  return(
    <div>
    <div className="rounded-2xl mt-4 mb-20 object-fill">
      <img className="h-56" src={loadcurve} />
    </div>
    </div>
  )
}










