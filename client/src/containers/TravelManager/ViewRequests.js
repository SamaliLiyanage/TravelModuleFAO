import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';
import { TripStatus } from '../../Selections';
import {Tabs, Tab} from 'react-bootstrap';

function Trip(props) {
  switch(props.tripType) {
    case 1: return "Day Trip";
    case 2: return "Field Trip";
    case 3: return "Field Day Trip";
    case 4: return "Airport";
    default: break;
  }
}

function TripRow(props) {
  const tableContent = props.tableContent;

  return (
    <tr>
      <td>{tableContent.TripID}</td>
      <td>{tableContent.Username}</td>
      <td><Trip tripType={tableContent.Trip_Type} /></td>
      <td><TripStatus tripStatus={tableContent.Trip_Status} /></td>
      <td>
        <select value={tableContent.Driver_ID} onChange={props.onChange}>
          <option value="0">Unassigned</option>
          <option value="1">Driver 1</option>
          <option value="2">Driver 2</option>
          <option value="3">Driver 3</option>
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

    this.handleChange= this.handleChange.bind(this);
    this.handleSelect= this.handleSelect.bind(this);
  }

  componentDidMount() {
    if(this.props.isAuthenticated===false) this.props.history.push('/login');

    axios.get('/trips/all')
    .then(res => {
      this.setState({
        tableContent: res.data
      });
    })
  }

  handleChange(event, i, index) {
    const tableContent = this.state.tableContent.slice();
    console.log(tableContent[index]);
    axios.post('/trips/assigndriver', {
      tripID:i,
      driverID: event.target.value,
    })
    .then((response)=> {
      axios.get('/trips/gettrip/'+i)
      .then((res)=>{
        console.log(res.data);
        tableContent[index] = res.data;
        this.setState({
          tableContent: tableContent,
        });
      });
    })
  }

  handleSelect(key) {
    this.setState({ key });
  }

  renderRows(tableContents, type) {
    const content = tableContents.map((item, index) => {
      if(type===0){
        return (<TripRow key={item.TripID} tableContent={item} onChange={(e)=>this.handleChange(e, item.TripID, index)} />);               
      } else {
        if(type===item.Trip_Type){
          return (<TripRow key={item.TripID} tableContent={item} onChange={(e)=>this.handleChange(e, item.TripID, index)} />);        
        } else {
          return null
        }
      }
    });

    return content;
  }

  renderTable(tableContents, type){
    return(
      <table>
        <thead>
          <tr>
            <th>Trip id</th>
            <th>Username</th>
            <th>Trip Type</th>
            <th>Trip Status</th>
            <th>Assign Driver</th>
          </tr>
        </thead>
        <tbody>
          {this.renderRows(tableContents, type)}
        </tbody>
      </table>
    );
  }

  render() {
    return(
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
        <Tab eventKey={3} title="Field One Days">
          {this.renderTable(this.state.tableContent, 3)}
        </Tab>
        <Tab eventKey={4} title="Airport Trips">
          {this.renderTable(this.state.tableContent, 4)}
        </Tab>
      </Tabs>
    );

  }
}
