import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  LineSeries,
  ZoomAndPan,
  Title,
  Legend,
} from '@devexpress/dx-react-chart-material-ui';
import { scaleTime } from 'd3-scale';
import { ArgumentScale } from '@devexpress/dx-react-chart';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { timeFormat } from 'd3-time-format';

const darkTheme = createTheme({ palette: { mode: 'dark' } });


const handleSizeBasedOnLength = (arr) => {
  let returnValue;
  if (arr.length > 999) {
    returnValue = 250;
  } else if (arr.length > 499 && arr.length <= 999) {
    returnValue = 300;
  } else if (arr.length > 299 && arr.length <= 499) {
    returnValue = 250;
  } else if (arr.length > 199 && arr.length <= 299) {
    returnValue = 225;
  } else if (arr.length > 99 && arr.length <= 199) {
    returnValue = 250;
  } else if (arr.length > 49 && arr.length <= 99) {
    returnValue = 225;
  } else if (arr.length > 4 && arr.length <= 49) {
    returnValue = 225;
  } else {
    returnValue = 175;
  }
  return returnValue;
}

const transformArray = (inputArray) => {
  const convertToTimestamp = (timeString) => (Math.floor(new Date(timeString).getTime() / 1000))
  return inputArray.map(obj => ({
    time: typeof (obj.timestamp) === 'string' ? convertToTimestamp(obj.timestamp) : new Date(obj.timestamp * 1000),
    humidity: +obj.humidity.toFixed(1),
    temperature: +obj.temperature.toFixed(1),
    setpoint_temperature: +obj.setpoint_temperature.toFixed(1),
    setpoint_humidity: +obj.setpoint_humidity.toFixed(1),
  }));
};

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

const chartRootStyle = { marginRight: '20px' };
const inputsContainerStyle = { justifyContent: 'center' };
const legendRootStyle = { display: 'flex', margin: 'auto', flexDirection: 'row' };
const legendItemStyle = { flexDirection: 'column', marginLeft: '-2px', marginRight: '-2px' };
const legendLabelStyle = { whiteSpace: 'nowrap' };

const ChartRoot = (props) => (
  <Chart.Root {...props} style={chartRootStyle} />
);

const LegendRoot = props => (
  <Legend.Root {...props} style={legendRootStyle} />
);

const LegendItem = props => (
  <Legend.Item {...props} style={legendItemStyle} />
);

const LegendLabel = props => (
  <Legend.Label {...props} style={legendLabelStyle} />
);

export default function Demo({ arr }) {
  const [data, setData] = useState(arr);
  const [viewport, setViewport] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [zoomArgument, setZoomArgument] = useState(true);
  const [panArgument, setPanArgument] = useState(true);
  const [zoomValue, setZoomValue] = useState(true);
  const [panValue, setPanValue] = useState(true);

  const handleShowDescription = () => {
    setShowDescription(prevState => !prevState);
  };

  const modifyValueDomain = (domain) => {
    console.log(domain)
    return [20, domain[1]]
  }

  const handleViewportChange = (newViewport) => {
    setViewport(newViewport);
};

  const series = [
    { name: 'Temperature', key: 'temperature', color: 'red', scale: 'temperature' },
    { name: 'Humidity', key: 'humidity', color: 'dodgerblue', scale: 'humidity' },
    { name: 'Setpoint Temperature', key: 'setpoint_temperature', color: 'rgba(255,0,0,0.56)', scale: 'temperature' },
    { name: 'Setpoint Humidity', key: 'setpoint_humidity', color: '#72bcd4', scale: 'humidity' },
  ];

  const makeLabel = (symbol, color) => ({ text, style, ...restProps }) => (
    <ValueAxis.Label
      text={`${text} ${symbol}`}
      style={{
        fill: color || 'black', // Set default color if none is provided
        fontWeight: 'bold', // Add other styles as needed
        ...style,
      }}
      {...restProps}
    />
  );

  const TEMPERATURE_LABEL = makeLabel('°C', '#ffffffde');
  const HUMIDITY_LABEL = makeLabel('%', '#ffffffde');

  const renderInput = (id, label, checked) => {
    const handleCheckboxChange = (event) => {
      const { id, checked } = event.target;
      switch (id) {
        case 'zoomArgument':
          setZoomArgument(checked);
          break;
        case 'panArgument':
          setPanArgument(checked);
          break;
        case 'zoomValue':
          setZoomValue(checked);
          break;
        case 'panValue':
          setPanValue(checked);
          break;
        default:
          break;
      }
    };
    return (
      <FormControlLabel
        control={
          <Checkbox
            id={id}
            checked={checked}
            onChange={handleCheckboxChange}
            value="checkedB"
            color="primary"
          />
        }
        label={label}
      />
    )
  };
  const labelHalfWidth = handleSizeBasedOnLength(data);
  let lastLabelCoordinate;
  const ArgumentLabel = props => {
    const { x } = props;
    // filter Labels
    if (
      lastLabelCoordinate &&
      lastLabelCoordinate < x &&
      x - lastLabelCoordinate <= labelHalfWidth
    ) {
      return null;
    }
    lastLabelCoordinate = x;
    return <ArgumentAxis.Label {...props} />;
  };

  useEffect(() => {
    setData(transformArray(arr))
  }, [arr]);

  const tickFormat = timeFormat('%b %d, %Y %H:%M');

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="form-check form-switch" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row-reverse', gap: '1rem', padding: '1rem' }}>
        <label className="form-check-label ms-2" htmlFor="customSwitch1">Info</label>
        <input
          type="checkbox"
          className="form-check-input"
          id="customSwitch1"
          value={showDescription}
          onChange={handleShowDescription}
        />
        <button
          type="button"
          className="btn btn-info btn-sm w-10"
          style={{ marginRight: '3rem' }}
          onClick={handleViewportChange}
        >
          RESET
        </button>
      </div>
      <Paper>
        <Chart data={data} rootComponent={ChartRoot}>
          <ArgumentScale
            factory={scaleTime}
          />
          <ArgumentAxis tickFormat={() => tickFormat} labelComponent={ArgumentLabel} />
          <ValueAxis labelComponent={TEMPERATURE_LABEL} modifyDomain={modifyValueDomain} />

          {series.map(({ name, key, color, scale }) => (
            <LineSeries
              key={name}
              name={name}
              valueField={key}
              argumentField="time"
              color={color}
            // scaleName={scale}
            />
          ))}
          <ValueAxis position="right" labelComponent={HUMIDITY_LABEL} modifyDomain={modifyValueDomain} />
          <ZoomAndPan
            viewport={viewport}
            onViewportChange={handleViewportChange}
            interactionWithArguments={getMode(zoomArgument, panArgument)}
            interactionWithValues={getMode(zoomValue, panValue)}
          />
          {showDescription && <Legend
            position="bottom"
            rootComponent={LegendRoot}
            itemComponent={LegendItem}
            labelComponent={LegendLabel}
          />}
        </Chart>
        <FormGroup style={inputsContainerStyle} row>
          {renderInput('zoomArgument', 'Zoom argument', zoomArgument)}
          {renderInput('panArgument', 'Pan argument', panArgument)}
          {renderInput('zoomValue', 'Zoom value', zoomValue)}
          {renderInput('panValue', 'Pan value', panValue)}
        </FormGroup>
      </Paper>
    </ThemeProvider>
  );
}