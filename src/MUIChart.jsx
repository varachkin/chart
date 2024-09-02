import React, { useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

const Example = ({ data }) => {
  const initialState = {
    left: 'dataMin',
    right: 'dataMax',
    refAreaLeft: '',
    refAreaRight: '',
    top: 'dataMax+1',
    bottom: 'dataMin',
    top2: 'dataMax',
    bottom2: 'dataMin',
  };

  const [state, setState] = useState(initialState);

  const getAxisYDomain = useCallback((from, to, ref, offset) => {
    const refData = data.slice(data.findIndex((el) => el.timestamp === from), data.findIndex((el) => el.timestamp === to) + 1);
    let [bottom, top] = [refData[0][ref], refData[0][ref]];

    refData.forEach((d) => {
      if (ref === 'temperature') {
        top = Math.max(d.temperature, top, d.setpoint_temperature);
        bottom = Math.min(d.temperature, bottom, d.setpoint_temperature);
      } else {
        top = Math.max(d.humidity, top, d.setpoint_humidity);
        bottom = Math.min(d.humidity, bottom, d.setpoint_humidity);
      }
    });
    return [(bottom | 0) - offset, (top | 0) + offset];
  }, [data]);

  const zoom = useCallback(() => {
    let { refAreaLeft, refAreaRight } = state;

    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setState((prevState) => ({
        ...prevState,
        refAreaLeft: '',
        refAreaRight: '',
      }));
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    // yAxis domain
    const [bottom, top] = getAxisYDomain(refAreaLeft, refAreaRight, 'temperature', 1);
    const [bottom2, top2] = getAxisYDomain(refAreaLeft, refAreaRight, 'humidity', 1);

    setState((prevState) => ({
      ...prevState,
      refAreaLeft: '',
      refAreaRight: '',
      left: refAreaLeft,
      right: refAreaRight,
      bottom,
      top,
      bottom2,
      top2,
    }));
  }, [getAxisYDomain, state]);

  const zoomOut = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      left: 'dataMin',
      right: 'dataMax',
      top: 'dataMax+1',
      bottom: 'dataMin',
      top2: 'dataMax',
      bottom2: 'dataMin',
      refAreaLeft: '',
      refAreaRight: '',
    }));
  }, []);

  const formatTimestamp = useCallback((timestamp) => {
    return format(new Date(timestamp * 1000), 'dd MMM yyyy HH:mm');
  }, []);

  const { left, right, refAreaLeft, refAreaRight, top, bottom, top2, bottom2 } = state;

  return (
    <div className="highlight-bar-charts" style={{ userSelect: 'none', width: '100%' }}>
      <button type="button" className="btn update" onClick={zoomOut}>
        Zoom Out
      </button>

      <ResponsiveContainer width="100%" height={600}>
        <LineChart
          width={800}
          height={800}
          data={data}
          onMouseDown={(e) => setState((prevState) => ({ ...prevState, refAreaLeft: e.activeLabel }))}
          onMouseMove={(e) => refAreaLeft && setState((prevState) => ({ ...prevState, refAreaRight: e.activeLabel }))}
          onMouseUp={zoom}
        >
          <CartesianGrid strokeDasharray="2 5" />
          <XAxis allowDataOverflow dataKey="timestamp" domain={[left, right]} type="number" tickFormatter={formatTimestamp} tickCount={10}/>
          <YAxis allowDataOverflow domain={[bottom, top]} type="number" yAxisId="temperature" tickCount={10}/>
          <YAxis orientation="right" allowDataOverflow domain={[bottom2, top2]} type="number" yAxisId="humidity" tickCount={10}/>
          <Tooltip />
          <Line yAxisId="temperature" type="natural" dataKey="setpoint_temperature" stroke="red" strokeWidth={3} dot={false} isAnimationActive={false}/>
          <Line yAxisId="humidity" type="natural" dataKey="setpoint_humidity" stroke="blue" strokeWidth={3} dot={false}  isAnimationActive={false}/>
          <Line yAxisId="temperature" type="natural" dataKey="temperature" stroke="orange" strokeWidth={3} dot={false}  isAnimationActive={false}/>
          <Line yAxisId="humidity" type="natural" dataKey="humidity" stroke="green" strokeWidth={3} dot={false}  isAnimationActive={false}/>
          <Legend />
          {refAreaLeft && refAreaRight ? (
            <ReferenceArea yAxisId="temperature" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.8} />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Example;