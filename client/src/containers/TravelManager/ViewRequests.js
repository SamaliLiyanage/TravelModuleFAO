import React from 'react';
import axios from 'axios';
import { TripTypes, TripStatus, DriverName } from '../../Selections';
import { Table, Tab, FormControl, FormGroup, Nav, Row, Col, NavDropdown, MenuItem, Button } from 'react-bootstrap';

function DriverAssignment(props) {
    const today = new Date();
    const tripDate = new Date(props.tripDate);
    var marginBottom = { margin: 0 };

    if (today < tripDate) {
        return (
            <FormGroup controlId={props.TripID} bsSize="small" style={marginBottom} >
                <FormControl componentClass="select" value={props.Driver_ID} onChange={props.onChange} disabled={props.approved}>
                    <option value="0">Unassigned</option>
                    <option value="1">Driver 1</option>
                    <option value="2">Driver 2</option>
                    <option value="3">Driver 3</option>
                    <option value="cab">Cab</option>
                </FormControl>
            </FormGroup>
        );
    } else {
        if (props.Driver_ID === null || props.Driver_ID === "0") {
            return (
                <Button bsStyle="danger" disabled>Expired</Button>
            );
        } else {
            return (<DriverName driverID={props.Driver_ID} />);
        }
    }
}

function ViewDetails(props) {
    return (<Button onClick={(e) => props.onClick(e, props.tripID)} >Details</Button>)
}

function TripRow(props) {
    const tableContent = props.tableContent;
    const tripDate = new Date(tableContent.Trip_Date);
    const reqDate = new Date(tableContent.Requested_Date);
    const approved = (tableContent.Trip_Status === 6) ? true : false;

    return (
        <tr>
            <td>{tableContent.TripID}</td>
            <td>{tableContent.Username}</td>
            <td><TripTypes tripType={tableContent.Trip_Type} /></td>
            <td>{tripDate.getFullYear() + "-" + (tripDate.getMonth() + 1) + "-" + tripDate.getDate()}</td>
            <td>{tableContent.Trip_Time}</td>
            <td>{tableContent.Destination}</td>
            <td><TripStatus tripStatus={tableContent.Trip_Status} /></td>
            <td><ViewDetails onClick={props.onClick} tripID={tableContent.TripID} /></td>
            <td>
                <DriverAssignment tripDate={tripDate} TripID={tableContent.TripID} Driver_ID={tableContent.Driver_ID} onChange={props.onChange} approved={approved} />
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
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        const authenticate = this.props;

        axios.get('/loggedin')
            .then(res => {
                if (res.data == "") {
                    authenticate.userHasAuthenticated(false, null, null);
                    authenticate.history.push('/login')
                } else {
                    authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
                    if (res.data.Role === 1) {
                        authenticate.history.push('/viewusers');
                    } else if (res.data.Role === 4) {
                        authenticate.history.push('/requesttrip');
                    }
                }
            })

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

    handleClick(event, tripID) {
        this.props.history.push('/viewtrip/'+tripID);
    }

    renderRows(tableContents, type, assigned, onClick) {
        const content = tableContents.map((item, index) => {
            if (type === 0) {
                if (assigned === "all") {
                    return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} onClick={onClick} />);
                } else if ((assigned === "assigned") && !(item.Trip_Status === 1 || item.Trip_Status===6)) {
                    return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} onClick={onClick} />);
                } else if ((assigned === "unassigned") && (item.Trip_Status === 1 || item.Trip_Status===6)) {
                    return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} onClick={onClick} />);
                } else {
                    return null
                }
            } else {
                if (type === item.Trip_Type) {
                    if (assigned === "all") {
                        return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} onClick={onClick} />);
                    } else if ((assigned === "assigned") && !(item.Trip_Status === 1 || item.Trip_Status===6)) {
                        return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} onClick={onClick} />);
                    } else if ((assigned === "unassigned") && (item.Trip_Status === 1 || item.Trip_Status===6)) {
                        return (<TripRow key={item.TripID} tableContent={item} onChange={(e) => this.handleChange(e, item.TripID, index)} onClick={onClick} />);
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

    renderTable(tableContents, type, assigned, onClick) {
        return (
            <Table striped bordered condensed hover responsive>
                <thead>
                    <tr className="table-danger">
                        <th>Trip ID</th>
                        <th>Username</th>
                        <th>Trip Type</th>
                        <th>Trip Date</th>
                        <th>Trip Time</th>
                        <th>Destination</th>
                        <th>Trip Status</th>
                        <th>Details</th>
                        <th>Assign Driver</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderRows(tableContents, type, assigned, onClick)}
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
                            <NavDropdown eventKey={0} title="All Trips" >
                                <MenuItem eventKey={0.1}>All</MenuItem>
                                <MenuItem eventKey={0.2}>Assigned</MenuItem>
                                <MenuItem eventKey={0.3}>Unassigned</MenuItem>
                            </NavDropdown>
                            <NavDropdown eventKey={1} title="Day Trips" >
                                <MenuItem eventKey={1.1}>All</MenuItem>
                                <MenuItem eventKey={1.2}>Assigned</MenuItem>
                                <MenuItem eventKey={1.3}>Unassigned</MenuItem>
                            </NavDropdown>
                            <NavDropdown eventKey={2} title="Field Trips" >
                                <MenuItem eventKey={2.1}>All</MenuItem>
                                <MenuItem eventKey={2.2}>Assigned</MenuItem>
                                <MenuItem eventKey={2.3}>Unassigned</MenuItem>
                            </NavDropdown>
                            <NavDropdown eventKey={3} title="Field Day Trips" >
                                <MenuItem eventKey={3.1}>All</MenuItem>
                                <MenuItem eventKey={3.2}>Assigned</MenuItem>
                                <MenuItem eventKey={3.3}>Unassigned</MenuItem>
                            </NavDropdown>
                            <NavDropdown eventKey={4} title="Airport Trips">
                                <MenuItem eventKey={4.1}>All</MenuItem>
                                <MenuItem eventKey={4.2}>Assigned</MenuItem>
                                <MenuItem eventKey={4.3}>Unassigned</MenuItem>
                            </NavDropdown>
                        </Nav>
                    </Col>
                    <Tab.Content animation>
                        <Tab.Pane eventKey={0.1}>{this.renderTable(this.state.tableContent, 0, "all", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={0.2}>{this.renderTable(this.state.tableContent, 0, "assigned", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={0.3}>{this.renderTable(this.state.tableContent, 0, "unassigned", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={1.1}>{this.renderTable(this.state.tableContent, 1, "all", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={1.2}>{this.renderTable(this.state.tableContent, 1, "assigned", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={1.3}>{this.renderTable(this.state.tableContent, 1, "unassigned", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={2.1}>{this.renderTable(this.state.tableContent, 2, "all", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={2.2}>{this.renderTable(this.state.tableContent, 2, "assigned", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={2.3}>{this.renderTable(this.state.tableContent, 2, "unassigned", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={3.1}>{this.renderTable(this.state.tableContent, 3, "all", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={3.2}>{this.renderTable(this.state.tableContent, 3, "assigned", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={3.3}>{this.renderTable(this.state.tableContent, 3, "unassigned", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={4.1}>{this.renderTable(this.state.tableContent, 4, "all", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={4.2}>{this.renderTable(this.state.tableContent, 4, "assigned", this.handleClick)}</Tab.Pane>
                        <Tab.Pane eventKey={4.3}>{this.renderTable(this.state.tableContent, 4, "unassigned", this.handleClick)}</Tab.Pane>
                    </Tab.Content>
                    <Col>
                    </Col>
                </Row>
            </Tab.Container>
        );

    }
}
