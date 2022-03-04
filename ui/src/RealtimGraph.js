import React, { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';
import { API } from "./utility";
import socketIOClient from "socket.io-client";
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );


const options = {
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
    scales: {
        y: {
        min: 30,
        max: 60
        }
    }
    };

export function RealtimGraph({ id }) {
  const [displayValues, setDisplayValues] = useState([]);
  const [labels, setlabels] = useState([]);
  useEffect(() => {
    const ENDPOINT = `${API}:${8000}/notify`;
    console.log(ENDPOINT);
    const socket = socketIOClient(ENDPOINT);
    socket.on(`FromAPI${id}`, data => {
      setDisplayValues(data.maintank);
    });
    return () => socket.disconnect();
  }, []);
  return (
    <RealTimeData id={id} labels={labels} displayValues={displayValues} setlabels={setlabels} />
  );
}
function RealTimeData({ id, labels, displayValues, setlabels }) {
  const [data1, setData] = useState([]);
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
  useEffect(() => {
    let topoil =  displayValues.topOilTemp
    let date = new Date();
    if (topoil) {
      console.log(topoil[0])
      if (data1.length > 15) {
        setData([...data1.filter((d, id) => id != 0), (topoil[0]) / 100]);
        setlabels([...labels.filter((d, id) => id != 0), date.toLocaleTimeString()]);
      }
      else {
        setData([...data1, (+topoil[0]) / 100]);
        setlabels([...labels, date.toLocaleTimeString()]);
      }
    }
  }, [displayValues]);
  return (
    <div>
      <Line height="250" data={data} options={options} />
    </div>
  );
}
