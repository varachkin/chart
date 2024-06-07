import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  Legend,
  Tooltip,
  LineSeries,
} from '@devexpress/dx-react-chart-bootstrap4';
import '@devexpress/dx-react-chart-bootstrap4/dist/dx-react-chart-bootstrap4.css';
import {
  ValueScale,
  Stack,
  Animation,
  EventTracker,
  HoverState,
  ZoomAndPan,
  ArgumentScale,
} from '@devexpress/dx-react-chart';
import { format } from 'd3-format';
import { scaleTime } from 'd3-scale';

const getMode = (zoom, pan) => {
  if (zoom && pan) {
    return 'both';
  }
  if (zoom && !pan) {
    return 'zoom';
  }
  if (!zoom && pan) {
    return 'pan';
  }
  return 'none';
};

const humidityColor = '#41c0f0';
const temperatureColor = '#fcd45a';
const setpointTemperatureColor = '#ffb222';
const setpointHumidityColor = '#535bf2';

const transformArray = (inputArray) => {
  return inputArray.map(obj => ({
    time: new Date(obj.timestamp * 1000),
    humidity: +obj.humidity.toFixed(),
    temperature: +obj.temperature.toFixed(),
    setpoint_temperature: +obj.setpoint_temperature.toFixed(),
    setpoint_humidity: +obj.setpoint_humidity.toFixed(),
  }));
};

const makeLabel = (symbol, color) => ({ text, style, ...restProps }) => (
  <ValueAxis.Label
    text={`${text} ${symbol}`}
    style={{
      fill: color,
      ...style,
    }}
    {...restProps}
  />
);

const TEMPERATURE_LABEL = makeLabel('°C', temperatureColor);
const HUMIDITY_LABEL = makeLabel('%', humidityColor);

const BarPoint = (props) => (
  <LineSeries.Point {...props} />
);

const pointOptions = { size: 7 };
const getPointOptions = (state) => (state ? { size: 7 } : { size: 0 });

const AreaPoint = (props) => (
  <LineSeries.Point point={getPointOptions(props.state)} {...props} />
);

const series = [
  { name: 'Temperature', key: 'temperature', color: temperatureColor },
  { name: 'Humidity', key: 'humidity', color: humidityColor, scale: 'humidity' },
  { name: 'Setpoint Temperature', key: 'setpoint_temperature', color: setpointTemperatureColor, scale: 'temperature' },
  { name: 'Setpoint Humidity', key: 'setpoint_humidity', color: setpointHumidityColor, scale: 'humidity' },
];

const legendRootStyle = {
  display: 'flex',
  margin: 'auto',
  flexDirection: 'row',
};
const LegendRoot = (props) => (
  <Legend.Root {...props} style={legendRootStyle} />
);

const legendItemStyle = {
  flexDirection: 'column',
  marginLeft: '-2px',
  marginRight: '-2px',
};
const LegendItem = (props) => (
  <Legend.Item {...props} style={legendItemStyle} />
);

const legendLabelStyle = {
  whiteSpace: 'nowrap',
};
const LegendLabel = (props) => (
  <Legend.Label {...props} style={legendLabelStyle} />
);

const formatTooltip = format('.1f');

const TooltipContent = ({ data, targetItem, text, style, ...props }) => {
  const targetData = data[targetItem?.point];
  const items = series.map(({ name, key, color }) => {
    const val = targetData ? targetData[key] : null;
    return (
      <tr key={key}>
        <td>
          <svg width="10" height="10">
            <circle cx="5" cy="5" r="5" fill={color} />
          </svg>
        </td>
        <td>
          <Tooltip.Content text={name} {...props} />
        </td>
        <td align="right">
          <Tooltip.Content text={val ? formatTooltip(val) : 'N/A'} {...props} />
        </td>
      </tr>
    );
  });
  return <table>{items}</table>;
};

const stacks = [
  { series: series.filter((obj) => !obj.type).map((obj) => obj.name) },
];

const modifyTemperatureDomain = (domain) => {
  console.log(domain)
  return [0, domain[1]]
};
const modifyHumidityDomain = (domain) => {
  console.log(domain)
  return [0, domain[1]]
};

const Demo = ({ arr }) => {
  const [data, setData] = useState(transformArray(arr));
  const [target, setTarget] = useState(null);
  const [viewport, setViewport] = useState(null);
  console.log(transformArray(data))
  const changeHover = useCallback((targetItem) => {
    setTarget(targetItem);
  }, []);

  const handleViewportChange = useCallback((newViewport) => {
    setViewport(newViewport);
  }, []);

  const memoizedSeries = useMemo(() => {
    return series.map(({ name, key, color, scale }) => (
      <LineSeries
        key={name}
        name={name}
        valueField={key}
        argumentField="time"
        color={color}
        scaleName={scale || 'temperature'}
        pointComponent={BarPoint}
      />
    ));
  }, []);

  return (
    <div className="card">
      <Chart data={data}>
        <ArgumentScale factory={scaleTime} />
        <ValueScale name="temperature" modifyDomain={modifyTemperatureDomain} argumentField="date" />
        <ValueScale name="humidity" modifyDomain={modifyHumidityDomain} argumentField="date" />
        <ArgumentAxis/>
        <ValueAxis scaleName="temperature" labelComponent={TEMPERATURE_LABEL} argumentField="date" />
        <ValueAxis scaleName="humidity" position="right" labelComponent={HUMIDITY_LABEL} argumentField="date" />

        {memoizedSeries}

        <Animation />
        <Legend
          position="bottom"
          rootComponent={LegendRoot}
          itemComponent={LegendItem}
          labelComponent={LegendLabel}
        />
        <Stack stacks={stacks} />
        <EventTracker />
        {data?.length && (
          <ZoomAndPan
            viewport={viewport}
            onViewportChange={handleViewportChange}
            interactionWithArguments={getMode(true, true)}
            interactionWithValues={getMode(false, false)}
          />
        )}
        <HoverState hover={target} onHoverChange={changeHover} />
        <Tooltip
          targetItem={target}
          contentComponent={(props) => <TooltipContent data={data} targetItem={target} {...props} />}
        />
      </Chart>
    </div>
  );
};

export default Demo;