import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';
import { TripTypes, TripStatus } from '../../Selections';
import { Table, Tabs, Tab } from 'react-bootstrap';

function TripRow(props) {
  const tableContent = props.tableContent;
  const tripDate = new Date(tableContent.Trip_Date);
  const reqDate = new Date(tableContent.Requested_Date);

  return (
    <tr>
      <td>{tableContent.TripID}</td>
      <td>{tableContent.Username}</td>
      <td>{reqDate.getFullYear() + "-" + (reqDate.getMonth() + 1) + "-" + reqDate.getDate()}</td>
      <td><TripTypes tripType={tableContent.Trip_Type} /></td>
      <td>{tripDate.getFullYear() + "-" + (tripDate.getMonth() + 1) + "-" + tripDate.getDate()}</td>
      <td><TripStatus tripStatus={tableContent.Trip_Status} /></td>
      <td>
        <select value={tableContent.Driver_ID} onChange={props.onChange}>
          <option value="0">Unassigned</option>
          <option value="1">Driver 1</option>
          <option value="2">Driver 2</option>
          <option value="3">Driver 3</option>
          <option value="cab">Cab</option>
        </select>
      </td>
    </tr>
  );
}

export default class ViewTrips extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      key: 0,
      tableContent: [],
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    if (this.props.isAuthenticated === false) this.props.history.push('/login');

    axios.get('/trips/all')
      .then(res => {
        this.setState({
          tableContent: res.data
        });
      })
  }

  handleChange(event, i, index) {
    const tableContent = this.state.tableContent.slice();
    const driverID = event.target.value;
    var tripStatus = 1;

    if ((event.target.value) === "0") {
      tripStatus = 1;
    } else if ((event.target.value) === "cab") {
      tripStatus = 5;
    } else {
      tripStatus = 2;
    }

    axios.post('/trips/assigndriver', {
      tripID: i,
      driverID: event.target.value,
      tripStatus: tripStatus,
    })
      .then((response) => {
        if (response.data.status === "success") {
          tableContent[index].Driver_ID = driverID;
          tableContent[index].Trip_Status = tripStatus;
          this.setState({
            tableContent: tableContent,
          });
        } else {
          alert("Ooops!!! Try again later...");
        }
      })
  }

  handleSelect(key) {
    this.setState({ key });
  }

  renderRows(tableContents, type) {
    const content = tableContents.map((item, index) => {
      if (type === 0) {
        return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} />);
      } else {
        if (type === item.Trip_Type) {
          return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} />);
        } else {
          return null
        }
      }
    });

    return content;
  }

  renderTable(tableContents, type) {
    return (
      <Table striped bordered condensed hover>
        <thead>
          <tr>
            <th>Trip id</th>
            <th>Username</th>
            <th>Requested Date</th>
            <th>Trip Type</th>
            <th>Trip Date</th>
            <th>Trip Status</th>
            <th>Assign Driver</th>
          </tr>
        </thead>
        <tbody>
          {this.renderRows(tableContents, type)}
        </tbody>
      </Table>
    );
  }

  render() {
    return (
      <Tabs
        activeKey={this.state.key}
        onSelect={this.handleSelect}
        id="request-view"
      >
        <Tab eventKey={0} title="All Trips">
          {this.renderTable(this.state.tableContent, 0)}
        </Tab>
        <Tab eventKey={1} title="Day Trips">
          {this.renderTable(this.state.tableContent, 1)}
        </Tab>
        <Tab eventKey={2} title="Field Trips">
          {this.renderTable(this.state.tableContent, 2)}
        </Tab>
        <Tab eventKey={3} title="Field Day Trip">
          {this.renderTable(this.state.tableContent, 3)}
        </Tab>
        <Tab eventKey={4} title="Airport Trips">
          {this.renderTable(this.state.tableContent, 4)}
        </Tab>
      </Tabs>
    );

  }
}
