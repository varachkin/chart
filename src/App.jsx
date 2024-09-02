import { useState, useEffect } from 'react';
import './App.css';
import MUIChart from './MUIChart';
import { data as initialData } from './constants';
import ChartTemp from './Demo';
import Demo from './Demo';
import SecondChart from './SecondChart';

function App() {
  const [data, setData] = useState([ {
    "step": 1,
    "temperature": -100,
    "humidity": 100,
    "setpoint_temperature": 30.9,
    "setpoint_humidity": 10,
    "time_h": 0,
    "time_m": 36.9,
    "timestamp": 1716283671
  },]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newData = {
        step: data.length + 1,
        temperature: +(Math.random() * 10 + 30).toFixed(),
        humidity: +(Math.random() * 50).toFixed(1),
        setpoint_temperature: +(Math.random() * 10 + 20).toFixed(),
        setpoint_humidity: +(Math.random() * 10).toFixed(),
        time_h: Math.floor(Math.random() * 24),
        time_m: Math.random() * 60,
        timestamp: data[data.length - 1].timestamp + 3,
      };

      setData((prevData) => [...prevData, newData]);
    }, 3000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [data]);

  return (
    <>
       {/*<ChartTemp />*/}
      <Demo arr={data} />
       <MUIChart data={data} />
       {/*<SecondChart data={data}/>*/}
    </>
  );
}

export default App;