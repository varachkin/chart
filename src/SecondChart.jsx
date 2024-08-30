import * as React from 'react';
import Paper from '@mui/material/Paper';
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  LineSeries,
  ZoomAndPan,
} from '@devexpress/dx-react-chart-material-ui';
import { scaleTime } from 'd3-scale';
import { ArgumentScale } from '@devexpress/dx-react-chart';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

// Generate mock data for both series
const generateData = (n) => {
  const ret = [];
  let y1 = 0;
  let y2 = 50; // Start the second series at a different initial value
  const dt = new Date(2017, 2, 10);
  for (let i = 0; i < n; i += 1) {
    dt.setDate(dt.getDate() + 1);
    y1 += Math.round(Math.random() * 10 - 5);
    y2 += Math.round(Math.random() * 10 - 5);
    ret.push({ x: new Date(dt), y1, y2 });
  }
  return ret;
};
const data = generateData(100);

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

const ChartRoot = (props) => (
  <Chart.Root {...props} style={chartRootStyle} />
);

export default class SecondChart extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data,
      zoomArgument: true,
      panArgument: true,
      zoomValue: false,
      panValue: false,
    };
    this.submit = (e) =>
      this.setState({
        [e.target.id]: e.target.checked,
      });
  }

  renderInput(id, label) {
    const { [id]: checked } = this.state;
    return (
      <FormControlLabel
        control={
          <Checkbox
            id={id}
            checked={checked}
            onChange={this.submit}
            value="checkedB"
            color="primary"
          />
        }
        label={label}
      />
    );
  }

  render() {
    const { data: chartData, zoomValue, panValue, zoomArgument, panArgument } = this.state;
    return (
      <Paper>
        <Chart data={chartData} rootComponent={ChartRoot}>
          <ArgumentScale factory={scaleTime} />
          <ArgumentAxis />

          {/* Left Value Axis for the first series */}
          <ValueAxis />

          {/* Right Value Axis for the second series */}
          <ValueAxis
            position="right"
            scaleName="secondScale" // Associate with the second series
          />

          {/* First Line Series associated with the left axis */}
          <LineSeries valueField="y1" argumentField="x" />

          {/* Second Line Series associated with the right axis */}
          <LineSeries valueField="y2" argumentField="x"  />

          <ZoomAndPan
            interactionWithArguments={getMode(zoomArgument, panArgument)}
            interactionWithValues={getMode(zoomValue, panValue)}
          />
        </Chart>
        <FormGroup style={inputsContainerStyle} row>
          {this.renderInput('zoomArgument', 'Zoom argument')}
          {this.renderInput('panArgument', 'Pan argument')}
          {this.renderInput('zoomValue', 'Zoom value')}
          {this.renderInput('panValue', 'Pan value')}
        </FormGroup>
      </Paper>
    );
  }
}