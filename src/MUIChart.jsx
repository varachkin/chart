import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Paper from '@mui/material/Paper';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {
    Chart,
    LineSeries,
    ArgumentAxis,
    ValueAxis,
    Title,
    Legend,
    Tooltip,
} from '@devexpress/dx-react-chart-material-ui';
import {
    ValueScale,
    Animation,
    EventTracker,
    ZoomAndPan,
} from '@devexpress/dx-react-chart';
import {
    Crosshair,
} from 'devextreme-react/chart';
import Button from 'devextreme-react/button';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { connectProps } from '@devexpress/dx-react-core';
import { format } from 'd3-format';
import { scaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';

const transformArray = (inputArray) => {
    console.log(inputArray)
    return inputArray.map(obj => ({
        time: new Date(obj.timestamp * 1000),
        humidity: +obj.humidity.toFixed(),
        temperature: +obj.temperature.toFixed(),
        setpoint_temperature: +obj.setpoint_temperature.toFixed(),
        setpoint_humidity: +obj.setpoint_humidity.toFixed(),
    }));

};



const darkTheme = createTheme({ palette: { mode: 'dark' } });
const series = [
    { name: 'Temperature', key: 'temperature', color: 'rgba(255,0,0,0.56)', scale: 'temperature' },
    { name: 'Humidity', key: 'humidity', color: 'rgba(0,52,255,0.5)', scale: 'humidity' },
    { name: 'Setpoint Temperature', key: 'setpoint_temperature', color: 'rgba(247,255,0,0.51)', scale: 'temperature' },
    { name: 'Setpoint Humidity', key: 'setpoint_humidity', color: 'rgba(0,255,243,0.55)', scale: 'humidity' },
];

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

const TEMPERATURE_LABEL = makeLabel('°C', null);
const HUMIDITY_LABEL = makeLabel('%', null);

const legendRootStyle = {
    display: 'flex',
    margin: 'auto',
    flexDirection: 'row',
};
const LegendRoot = props => (
    <Legend.Root {...props} style={legendRootStyle} />
);

const legendItemStyle = {
    flexDirection: 'column',
    marginLeft: '-2px',
    marginRight: '-2px',
};
const LegendItem = props => (
    <Legend.Item {...props} style={legendItemStyle} onClick={(e) => console.log(props)} />
);

const legendLabelStyle = {
    whiteSpace: 'nowrap',
};
const LegendLabel = props => (
    <Legend.Label {...props} style={legendLabelStyle} />
);

const formatTooltip = format('.1f');
const TooltipContent = React.memo(({ data, text, style, ...props }) => {
    const alignStyle = {
        ...style,
        paddingLeft: '10px',
    };
    const items = series.map(({ name, key, color }) => {
        const val = data[key];
        return (
            <tr key={key}>
                <td>
                    <svg width="10" height="10">
                        <circle cx="5" cy="5" r="5" fill={color} />
                    </svg>
                </td>
                <td>
                    <Tooltip.Content style={alignStyle} text={name} {...props} />
                </td>
                <td align="right">
                    <Tooltip.Content style={alignStyle} text={val ? formatTooltip(val) : 'N/A'} {...props} />
                </td>
            </tr>
        );
    });
    return (
        <table>
            {items}
        </table>
    );
});

const Demo = React.memo(({ data }) => {
    const [target, setTarget] = useState(null);
    const [showDescription, setShowDescription] = useState(false);
    const [viewport, setViewport] = useState(null);
    const chartRef = React.useRef(null);
    const [zoomPanConfig, setZoomPanConfig] = useState({
        zoomArgument: true,
        panArgument: true,
        zoomValue: false,
        panValue: false,
    })

    const submit = (e) => setZoomPanConfig(prev => ({ ...prev, [e.target.id]: e.target.checked }));

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

    const renderInput = (id, label) => {
        const { [id]: checked } = zoomPanConfig;
        return (
            <FormControlLabel
                control={(
                    <Checkbox
                        id={id}
                        checked={checked}
                        onChange={submit}
                        value="checkedB"
                        color="primary"
                    />
                )}
                label={label}
            />
        );
    }
    const inputsContainerStyle = { justifyContent: 'center' };
    const transformedData = transformArray(data);

    const handleShowDescription = () => {
        setShowDescription(prevState => !prevState);
    };

    const handleViewportChange = (newViewport) => {
        setViewport(newViewport);
    };

    const resetZoom = useCallback(() => {
        console.log(chartRef.current.instance())

        chartRef.current.instance().resetVisualRange();
    }, []);


    // const TooltipContentConnected = useMemo(() => connectProps(TooltipContent, () => ({
    //     data: target ? transformedData[target.point] : null,
    // })), [target]);
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

    const labelHalfWidth = handleSizeBasedOnLength(transformedData);
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

    const seriesComponents = useMemo(() => series.map(({ name, key, color, scale }) => (
        <LineSeries
            key={name}
            name={name}
            valueField={key}
            argumentField="time"
            color={color}
            // scaleName={scale}
        />
    )), []);

    const handleClick = useCallback((e) => {
        const targetElement = e.target.closest('circle');
        if (targetElement) {
            const pointIndex = targetElement.getAttribute('index');
            setTarget({ point: pointIndex });
        } else {
            setTarget(null);
        }
    }, []);

    // useEffect(() => {
    //     TooltipContentConnected.update();
    // }, [target, TooltipContentConnected]);

    const tickFormat = timeFormat('%b %d, %Y %H:%M');
    console.log(chartRef)
    return (

        <ThemeProvider theme={darkTheme}>
            <div
                className="form-check form-switch"
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    flexDirection: 'row-reverse',
                    gap: '1rem',
                    padding: '1rem'
                }}
            >
                <label className="form-check-label ms-2" htmlFor="customSwitch1">Info</label>

                <input
                    type="checkbox"
                    className="form-check-input"
                    id="customSwitch1"
                    value={showDescription}
                    onChange={handleShowDescription}
                />
                <button id="reset-zoom" text="Reset" onClick={resetZoom}></button>
            </div>
            <Chart
                ref={chartRef}
                data={transformedData}
                onClick={handleClick}
            >
                <ValueScale name="temperature" />
                <ValueScale name="humidity" />

                <ArgumentAxis tickFormat={() => tickFormat} labelComponent={ArgumentLabel} />
                <ValueAxis scaleName="temperature" labelComponent={TEMPERATURE_LABEL} />
                <ValueAxis scaleName="humidity" position="right" labelComponent={HUMIDITY_LABEL} />

                {seriesComponents}

                <Animation />
                {showDescription && <Legend
                    position="bottom"
                    rootComponent={LegendRoot}
                    itemComponent={LegendItem}
                    labelComponent={LegendLabel}
                />}
                <FormGroup style={inputsContainerStyle} row>
                        {renderInput('zoomArgument', 'Zoom argument')}
                        {renderInput('panArgument', 'Pan argument')}
                        {renderInput('zoomValue', 'Zoom value')}
                        {renderInput('panValue', 'Pan value')}
                    </FormGroup>
                <EventTracker />
                {/* <Tooltip
                    targetItem={target}
                    contentComponent={TooltipContentConnected}
                /> */}
                 <ZoomAndPan
                        viewport={viewport}
                        onViewportChange={handleViewportChange}
                        interactionWithArguments={getMode(zoomPanConfig.zoomArgument, zoomPanConfig.panArgument)}
                        interactionWithValues={getMode(zoomPanConfig.zoomValue, zoomPanConfig.panValue)}
                    />
                <Crosshair enabled={true}>
                    {/* <Label visible={true} /> */}
                </Crosshair>
            </Chart>
        </ThemeProvider>

    );
});

export default Demo;