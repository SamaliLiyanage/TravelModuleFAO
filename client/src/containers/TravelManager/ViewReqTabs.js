import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';
import {TripTypes, DriverName, TripStatus} from '../../Selections';

function TripRows(props){
  const rowContent = props.rowContent;
  const tripDate = new Date(rowContent.Trip_Date);
  const reqDate = new Date(rowContent.Requested_Date);

  return(
      <tr>
          <td>{rowContent.TripID}</td>
          <td><TripTypes tripType={rowContent.Trip_Type} /></td>
          <td><TripStatus tripStatus={rowContent.Trip_Status} /></td>
          <td>{tripDate.getFullYear()+"-"+(tripDate.getMonth()+1)+"-"+tripDate.getDate()}</td>
          <td><DriverName driverID={rowContent.Driver_ID} /></td>
          <td>{reqDate.getFullYear()+"-"+(reqDate.getMonth()+1)+"-"+reqDate.getDate()}</td>
          <td>{rowContent.Destination}</td>
      </tr>
  );
}

function TripTable(props) {
  const content = props.tableContent.map((item, index) => {
    if(props.type===0){
      return <TripRows rowContent={item} /> 
    } else {
      if(item.Trip_Type===props.type) {
        return <TripRows rowContent={item} />    
      } else {
        return null
      }
    }    
  });

  return content;
}

export default class TabbedRequest extends React.Component {
    constructor(props, context) {
        super(props, context);
    
        this.handleSelect = this.handleSelect.bind(this);
    
        this.state = {
          key: 1,
          tableContent: [],
        };
      }

      handleSelect(key) {
        //alert(`selected ${key}`);
        this.setState({ key });
      }

      componentDidMount() {

        axios.get('trips/all')
        .then(res =>{
            this.setState({
                tableContent: res.data
            });
        })
      }

      renderTabs(tableContents, tabIdx) {
        return(
          <table>
            <thead>
              <tr>
                <th>Trip ID 2222</th>
                <th>Trip Type</th>
                <th>Trip Status</th>
                <th>Trip Date</th>
                <th>Driver ID</th>
                <th>Requested Date</th>
                <th>Destination</th>
              </tr>
            </thead>
            <tbody>
              <TripTable tableContent={tableContents} type={tabIdx} />
            </tbody>
          </table>
        );
      }

      render() {
        return (
          <Tabs
            activeKey={this.state.key}
            onSelect={this.handleSelect}
            id="controlled-tab-example"
          >
            <Tab eventKey={0} title="All Trips">
              {this.renderTabs(this.state.tableContent, 0)}
            </Tab>
            <Tab eventKey={1} title="Day Trips">
              {this.renderTabs(this.state.tableContent, 1)}
            </Tab>
            <Tab eventKey={2} title="Field Trips">
              {this.renderTabs(this.state.tableContent, 2)}
            </Tab>
            <Tab eventKey={3} title="Field One Day ">
              {this.renderTabs(this.state.tableContent, 3)}
            </Tab>
            <Tab eventKey={4} title="Airport">
              {this.renderTabs(this.state.tableContent, 4)}
            </Tab>
          </Tabs>
        );
      }
}