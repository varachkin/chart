import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';
import { format } from 'date-fns';

const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp * 1000), 'dd MMM yyyy HH:mm');
};

const formatTemperature = (value) => `${value}°`;
const formatHumidity = (value) => `${value}%`;

const ChartComponent = ({ data = [] }) => {
    const [zoomDomain, setZoomDomain] = useState({ startIndex: 0, endIndex: data.length - 1 });

    const handleBrushChange = (newDomain) => {
        if (newDomain) {
            setZoomDomain(newDomain);
        }
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={data.slice(zoomDomain.startIndex, zoomDomain.endIndex + 1)}
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
                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#82ca9d" />
                <Line yAxisId="left" type="monotone" dataKey="setpoint_temperature" stroke="#ff7300" />
                <Line yAxisId="right" type="monotone" dataKey="setpoint_humidity" stroke="#387908" />
                <Brush dataKey="timestamp" onChange={handleBrushChange} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ChartComponent;