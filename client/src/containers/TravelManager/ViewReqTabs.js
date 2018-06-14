import React from 'react';
import axios from 'axios';
import { TripTypes, TripStatus } from '../../Selections';
import { Table, Tab, FormControl, FormGroup, Nav, Row, Col, NavDropdown, MenuItem } from 'react-bootstrap';

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
        <FormGroup controlId={tableContent.TripID}>
        <FormControl componentClass="select" value={tableContent.Driver_ID} onChange={props.onChange}>
          <option value="0">Unassigned</option>
          <option value="1">Driver 1</option>
          <option value="2">Driver 2</option>
          <option value="3">Driver 3</option>
          <option value="cab">Cab</option>
        </FormControl>
        </FormGroup>
      </td>
    </tr>
  );
}

export default class TabbedRequest extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      key: 0.1,
      tableContent: [],
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    //if (this.props.isAuthenticated === false) this.props.history.push('/login');

    axios.post('/trips/testmobile/')
    .then(
      console.log('Hi!')
    )
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

  renderRows(tableContents, type, assigned) {
    const content = tableContents.map((item, index) => {
      if (type === 0) {
        if (assigned==="all"){
          return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} />);
        } else if ((assigned==="assigned") && !(item.Trip_Status===1)) {
          return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} />);          
        } else if ((assigned==="unassigned") && (item.Trip_Status===1)) {
          return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} />);                    
        } else {
          return null
        }
      } else {
        if (type === item.Trip_Type) {
          if (assigned==="all") {
            return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} />);
          } else if ((assigned==="assigned") && !(item.Trip_Status===1)) {
            return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} />);                    
          } else if ((assigned==="unassigned") && (item.Trip_Status===1)) {
            return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} />);                    
          } else {
            return null
          }
        } else {
          return null
        }
      }
    });

    return content;
  }

  renderTable(tableContents, type, assigned) {
    return (
      <Table striped bordered condensed hover>
        <thead>
          <tr>
            <th>Trip id 22222</th>
            <th>Username</th>
            <th>Requested Date</th>
            <th>Trip Type</th>
            <th>Trip Date</th>
            <th>Trip Status</th>
            <th>Assign Driver</th>
          </tr>
        </thead>
        <tbody>
          {this.renderRows(tableContents, type, assigned)}
        </tbody>
      </Table>
    );
  }

  render() {
    return (
      <Tab.Container
        activeKey={this.state.key}
        onSelect={this.handleSelect}
        id="request-view"
      >
        <Row className="clearfix">
          <Col>
            <Nav bsStyle="tabs">
              <NavDropdown eventKey={0} title="All Trips" id="all-trips">
                <MenuItem eventKey={0.1}>All</MenuItem>
                <MenuItem eventKey={0.2}>Assigned</MenuItem>
                <MenuItem eventKey={0.3}>Unassigned</MenuItem>
                </NavDropdown>
              <NavDropdown eventKey={1} title="Day Trips" id="day-trips">
                <MenuItem eventKey={1.1}>All</MenuItem>
                <MenuItem eventKey={1.2}>Assigned</MenuItem>
                <MenuItem eventKey={1.3}>Unassigned</MenuItem>
                </NavDropdown>
              <NavDropdown eventKey={2} title="Field Trips" id="field-trips">
                <MenuItem eventKey={2.1}>All</MenuItem>
                <MenuItem eventKey={2.2}>Assigned</MenuItem>
                <MenuItem eventKey={2.3}>Unassigned</MenuItem>
              </NavDropdown>
              <NavDropdown eventKey={3} title="Field Day Trips" id="field-day-trips">
                <MenuItem eventKey={3.1}>All</MenuItem>
                <MenuItem eventKey={3.2}>Assigned</MenuItem>
                <MenuItem eventKey={3.3}>Unassigned</MenuItem>
              </NavDropdown>
              <NavDropdown eventKey={4} title="Airport Trips" id="airport-trips">
                <MenuItem eventKey={4.1}>All</MenuItem>
                <MenuItem eventKey={4.2}>Assigned</MenuItem>
                <MenuItem eventKey={4.3}>Unassigned</MenuItem>                
              </NavDropdown>
            </Nav>
          </Col>
            <Tab.Content animation>
              <Tab.Pane eventKey={0.1}>{this.renderTable(this.state.tableContent, 0, "all")}</Tab.Pane>              
              <Tab.Pane eventKey={0.2}>{this.renderTable(this.state.tableContent, 0, "assigned")}</Tab.Pane>
              <Tab.Pane eventKey={0.3}>{this.renderTable(this.state.tableContent, 0, "unassigned")}</Tab.Pane>
              <Tab.Pane eventKey={1.1}>{this.renderTable(this.state.tableContent, 1, "all")}</Tab.Pane>              
              <Tab.Pane eventKey={1.2}>{this.renderTable(this.state.tableContent, 1, "assigned")}</Tab.Pane>
              <Tab.Pane eventKey={1.3}>{this.renderTable(this.state.tableContent, 1, "unassigned")}</Tab.Pane>
              <Tab.Pane eventKey={2.1}>{this.renderTable(this.state.tableContent, 2, "all")}</Tab.Pane>              
              <Tab.Pane eventKey={2.2}>{this.renderTable(this.state.tableContent, 2, "assigned")}</Tab.Pane>
              <Tab.Pane eventKey={2.3}>{this.renderTable(this.state.tableContent, 2, "unassigned")}</Tab.Pane>
              <Tab.Pane eventKey={3.1}>{this.renderTable(this.state.tableContent, 3, "all")}</Tab.Pane>              
              <Tab.Pane eventKey={3.2}>{this.renderTable(this.state.tableContent, 3, "assigned")}</Tab.Pane>
              <Tab.Pane eventKey={3.3}>{this.renderTable(this.state.tableContent, 3, "unassigned")}</Tab.Pane>
              <Tab.Pane eventKey={4.1}>{this.renderTable(this.state.tableContent, 4, "all")}</Tab.Pane>              
              <Tab.Pane eventKey={4.2}>{this.renderTable(this.state.tableContent, 4, "assigned")}</Tab.Pane>
              <Tab.Pane eventKey={4.3}>{this.renderTable(this.state.tableContent, 4, "unassigned")}</Tab.Pane>
            </Tab.Content>
          <Col>
          </Col>
        </Row>
      </Tab.Container>
    );

  }
}
