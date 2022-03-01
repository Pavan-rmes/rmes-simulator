import React,{createContext, useContext, useEffect, useReducer, useState} from "react";
import './App.css';
import { DiasplaySide } from "./components/DiasplaySide";
import { Coniguration } from "./components/Coniguration";
import { NamePlate } from "./components/NamePlate";
import { Location } from "./components/Location";
import {Login} from "./components/Login"
import { Redirect, Route, Switch } from "react-router-dom";
import {AuthRoute} from "./Authroute"
import tarfoImg from "./images/transformerModel1.jpg";
import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import loadcurve from "./images/load_Curve1.jpg"
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { API } from "./utility";
import socketIOClient from "socket.io-client";


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
          <AuthRoute path="/trafo">
            <Assets />
          </AuthRoute>
          <Redirect from="/" to="/login" />
        </Switch>
      </div>
  );
}

const assetData=[{name:"Transformer-1",port:1},{name:"Transformer-2",port:2},{name:"Transformer-3",port:3},{name:"Transformer-4",port:4}]

function Assets(){
  return(
    <div className=" md:ml-20 flex gap-x-20 flex-wrap gap-y-10">
      {assetData.map((asset,id)=>(<AssetTemp key={id} asset={asset} /> ))}
    </div>
  )
}
function AssetTemp({asset}){
  const history = useHistory()
  return(
    <div
    onClick={()=>(history.push(`/trafo/${asset.port}`))}
    className="flex cursor-pointer flex-col">
      <img className="w-32" src={tarfoImg} />
      <p>{asset.name}</p>
    </div>
  )
}

export const context = createContext()

function Transformer(){
  let {id} = useParams();id = +id
  const history = useHistory()
  return(
    <>
      <div>
        <button 
        onClick={()=>history.push("/trafo")}
        className="mt-5 md:ml-5 text-3xl border border-blue-500 rounded-full px-2 bg-blue-500 text-white "> &lt; </button>
      </div>
        <Location id = {id} />
        <hr className="mt-5 md:mx-20" />
        <div className='main flex flex-wrap mt-5 ml-4 md:ml-16'>
          <context.Provider value={{status:true}}>
          <NamePlate id={id} />
          <Coniguration id={id}  />
          <DiasplaySide id={id} />
          <div >
          <LoadCurve />
          <RealtimGraph id={id} />
          </div>
        </context.Provider>
      </div>
    </>
  )
}


export default App;

function LoadCurve(){
  return(
    <div>
    <div className="rounded-2xl mt-4 mb-20 object-fill">
      <img className="h-56" src={loadcurve} />
    </div>
    </div>
  )
}




ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'real time chart',
    },
  },
};


function RealtimGraph({id}){
  const [displayValues,setDisplayValues] = useState([])
  const [labels,setlabels] = useState([])
  useEffect(() => {
    const ENDPOINT = `${API}:${8000}/notify`;
    console.log(ENDPOINT)
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", data => {
      setDisplayValues(data[`Fromtx${id}`])
    });
    return () => socket.disconnect();
  }, []);
  return(
    <RealTimeData id ={id} labels={labels} displayValues={displayValues} setlabels={setlabels} />
  )
}

function RealTimeData({id,labels,displayValues,setlabels}){
  const [data1,setData] = useState([])
  // setData([...data1],()=>console.log(data1))
  const data = {
    labels,
    datasets: [
      {
        lineTension: 0.2,
        label: 'top_oil_temp',
        data: data1,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
      
    ],
  };
  console.log(data1,displayValues.topOilTemp)
  useEffect(()=>{
    let date = new Date()
      if(displayValues.topOilTemp !=NaN){
        if(data1.length>15){
          setData([...data1.filter((d,id)=> id !=0),(displayValues.topOilTemp)/100])
          setlabels([...labels.filter((d,id)=> id !=0),date.toLocaleTimeString()])
        }
        else{
          setData([...data1,(+displayValues.topOilTemp)/100])
          setlabels([...labels,date.toLocaleTimeString()])
        }
      }
  },[displayValues])
  return(
    <div >
      <Line height="250" data={data} options={options} />
    </div>
  )
}


