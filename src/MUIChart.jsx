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
    HoverState,
    ZoomAndPan,
} from '@devexpress/dx-react-chart';
import { connectProps } from '@devexpress/dx-react-core';
import { format } from 'd3-format';
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

const series = [
    { name: 'Temperature', key: 'temperature', color: '#ff0000', scale: 'temperature' },
    { name: 'Humidity', key: 'humidity', color: '#0034ff', scale: 'humidity' },
    { name: 'Setpoint Temperature', key: 'setpoint_temperature', color: '#f7ff00', scale: 'temperature' },
    { name: 'Setpoint Humidity', key: 'setpoint_humidity', color: '#00fff3', scale: 'humidity' },
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
            data: data,
            target: null,
        };

        this.changeHover = target => this.setState({
            target: target ? { series: series.name, point: target.point } : null,
        });

        this.createComponents();
        this.createSeries();
    }

    componentDidUpdate(prevProps, prevState) {
        // if (getHoverIndex(prevState) !== getHoverIndex(this.state)) {
        //     this.TooltipContent.update();
        // }
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
                    argumentField="timestamp"
                    color={color}
                    scaleName={scale}
                />
            );
        });
    }

    render() {
        const { data, target } = this.state;

        return (
            <Paper>
                <Chart
                    data={data}
                >
                    <ValueScale name="temperature" />
                    <ValueScale name="humidity" />

                    <ArgumentAxis />
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

                    <HoverState
                        hover={target}
                        onHoverChange={this.changeHover}
                    />
                    {/*<Tooltip*/}
                    {/*    targetItem={target}*/}
                    {/*    contentComponent={this.TooltipContent}*/}
                    {/*/>*/}
                    <ZoomAndPan />
                </Chart>
            </Paper>
        );
    }
}