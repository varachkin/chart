import * as React from 'react';
import Paper from '@mui/material/Paper';
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
import { connectProps } from '@devexpress/dx-react-core';
import { format } from 'd3-format';
import { scaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';
import { data } from "./constants";

const transformArray = (inputArray) => {
    return inputArray.map(obj => ({
        time: new Date(obj.timestamp * 1000),
        humidity: +obj.humidity.toFixed(),
        temperature: +obj.temperature.toFixed(),
        setpoint_temperature: +obj.setpoint_temperature.toFixed(),
        setpoint_humidity: +obj.setpoint_humidity.toFixed(),
    }));
};

const transformedData = transformArray(data);

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
    <Legend.Item {...props} style={legendItemStyle} />
);

const legendLabelStyle = {
    whiteSpace: 'nowrap',
};
const LegendLabel = props => (
    <Legend.Label {...props} style={legendLabelStyle} />
);

const formatTooltip = format('.1f');
const TooltipContent = ({
                            data, text, style, ...props
                        }) => {
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
};

const getHoverIndex = ({ target }) => (target ? target.point : -1);

export default class Demo extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            data: transformedData,
            target: null,
            scale: scaleTime()
        };

        this.changeTarget = target => this.setState({
            target: target ? { series: series.name, point: target.point } : null,
        });

        this.createComponents();
        this.createSeries();
    }

    componentDidUpdate(prevProps, prevState) {
        if (getHoverIndex(prevState) !== getHoverIndex(this.state)) {
            this.TooltipContent.update();
        }
    }

    createComponents() {
        const getHoverProps = () => ({
            hoverIndex: getHoverIndex(this.state),
        });

        this.TooltipContent = connectProps(TooltipContent, () => {
            const { data, target } = this.state;
            return { data: target ? data[target.point] : null };
        });
    }

    createSeries() {
        this.series = series.map(({
                                      name, key, color, scale,
                                  }) => {
            return (
                <LineSeries
                    key={name}
                    name={name}
                    valueField={key}
                    argumentField="time"
                    color={color}
                    scaleName={scale}
                />
            );
        });
    }

    handleClick = (e) => {
        const target = e.target.closest('circle');
        if (target) {
            const pointIndex = target.getAttribute('index');
            this.changeTarget({ point: pointIndex });
        } else {
            this.changeTarget(null);
        }
    }

    render() {
        const { data, target } = this.state;

        const tickFormat = timeFormat('%b %d, %Y %H:%M');

        return (
            <Paper>
                <Chart
                    data={data}
                    onClick={this.handleClick}
                >
                    <ValueScale name="temperature" />
                    <ValueScale name="humidity" />

                    <ArgumentAxis
                        tickFormat={() => tickFormat}
                    />
                    <ValueAxis scaleName="temperature" labelComponent={TEMPERATURE_LABEL} />
                    <ValueAxis scaleName="humidity" position="right" labelComponent={HUMIDITY_LABEL} />

                    <Title text="Temperature and Humidity Over Time" />

                    {this.series}

                    <Animation />
                    <Legend
                        position="bottom"
                        rootComponent={LegendRoot}
                        itemComponent={LegendItem}
                        labelComponent={LegendLabel}
                    />
                    <EventTracker />

                    <Tooltip
                        targetItem={target}
                        contentComponent={this.TooltipContent}
                    />
                    <ZoomAndPan />
                </Chart>
            </Paper>
        );
    }
}