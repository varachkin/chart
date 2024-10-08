import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';
import { format } from 'date-fns';

const formatTimestamp = (timestamp) => {
  return format(new Date(timestamp * 1000), 'dd MMM yyyy HH:mm');
};

const formatTemperature = (value) => `${value}°`;
const formatHumidity = (value) => `${value}%`;

const ChartComponent = ({ data }) => {
  const [zoomDomain, setZoomDomain] = useState([null, null]);

  const handleBrushChange = (newDomain) => {
    if (newDomain && newDomain.length === 2) {
      setZoomDomain(newDomain);
    }
  };
  console.log(zoomDomain)

  useEffect(()=> {
    console.log('asfasfasf')
    setZoomDomain([data[0].timestamp, data[data.length - 1].timestamp])
  }, [data])
  // Find the indices based on the selected domain (timestamps)
  const startIndex = data.findIndex(d => d.timestamp === zoomDomain[0]);
  const endIndex = data.findIndex(d => d.timestamp === zoomDomain[1]);

  return (
      <ResponsiveContainer width="100%" height={600}>
        <LineChart
            data={data.slice(startIndex, endIndex + 1)}
            margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
          />
          <YAxis
              yAxisId="left"
              domain={[-100, 100]}
              tickFormatter={formatTemperature}
          />
          <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={formatHumidity}
          />
          <Tooltip labelFormatter={formatTimestamp} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" isAnimationActive={false} dot={false}/>
          <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#82ca9d" isAnimationActive={false} dot={false}/>
          <Line yAxisId="left" type="monotone" dataKey="setpoint_temperature" stroke="#ff7300" isAnimationActive={false} dot={false}/>
          <Line yAxisId="right" type="monotone" dataKey="setpoint_humidity" stroke="#387908" isAnimationActive={false} dot={false}/>
          <Brush dataKey="timestamp" onChange={handleBrushChange} baseValue='dataMin'/>
        </LineChart>
      </ResponsiveContainer>
  );
};

export default ChartComponent;