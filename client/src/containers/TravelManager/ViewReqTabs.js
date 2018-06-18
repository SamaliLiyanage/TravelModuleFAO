import React from 'react';
import axios from 'axios';
import { TripTypes, TripStatus, DriverName } from '../../Selections';
import { Table, Tab, FormControl, FormGroup, Nav, Row, Col, NavDropdown, MenuItem, Button, Pagination } from 'react-bootstrap';


function DriverAssignment(props) {
    const today = new Date();
    const tripDate = new Date(props.tripDate);
    const marginBottom = { margin: 0, height: '20pt' };
    const padding = {paddingTop:'0pt', paddingBottom: '0pt'} 

    if (today < tripDate) {
        return (
            <FormGroup controlId={props.TripID} bsSize="small" style={marginBottom} >
                <FormControl style={padding} componentClass="select" value={props.Driver_ID} onChange={(e) => props.onChange(e, props.TripID, props.index)} disabled={props.approved}>
                    <option value="0">Unassigned</option>
                    <option value="1">Anthony</option>
                    <option value="2">Ruchira</option>
                    <option value="3">Dinesh</option>
                    <option value="cab">Cab</option>
                </FormControl>
            </FormGroup>
        );
    } else {
        if (props.Driver_ID === null || props.Driver_ID === "0") {
            return (
                <Button style={padding} bsStyle="danger" disabled>Expired</Button>
            );
        } else {
            return (<DriverName driverID={props.Driver_ID} />);
        }
    }
}

function ViewDetails(props) {
    const padding = {paddingTop:'2pt', paddingBottom: '2pt'} 
    return (<Button style={padding} onClick={(e) => props.onClick(e, props.tripID)} >Details</Button>)
}

function TripRow(props) {
    const tableContent = props.tableContent;
    const tripDate = new Date(tableContent.Trip_Date);
    const driver_ID = tableContent.Driver_ID;
    const approved = (tableContent.Trip_Status === 6) ? true : false;
    const today = new Date();

    var warningDate = new Date (tableContent.Trip_Date);
    warningDate.setDate(warningDate.getDate()+1);

    //#e47c79 ::: notice color
    var bgcolor = {};

    if (((today >= tripDate) && (today<warningDate))&&(driver_ID === null || driver_ID === "0")){
        bgcolor = {background: '#e47c79' }
    }

    return (
        <tr style={bgcolor}>
            <td>{tableContent.TripID}</td>
            <td>{tableContent.Username}</td>
            <td><TripTypes tripType={tableContent.Trip_Type} /></td>
            <td>{tripDate.getFullYear() + "-" + (tripDate.getMonth() + 1) + "-" + tripDate.getDate()}</td>
            <td>{tableContent.Trip_Time}</td>
            <td>{tableContent.Destination}</td>
            <td><TripStatus tripStatus={tableContent.Trip_Status} /></td>
            <td><ViewDetails onClick={props.onClick} tripID={tableContent.TripID} /></td>
            <td>
                <DriverAssignment tripDate={warningDate} TripID={tableContent.TripID} Driver_ID={tableContent.Driver_ID} onChange={props.onChange} approved={approved} index={props.index} />
            </td>
        </tr>
    );
}

function TableRow(props) {
    //PORPS::: tableContents, onChange, onClick
    const tableContents = props.tableContents;
  
    const content = tableContents.map((item, index) => {
        return (<TripRow key={item.TripID} tableContent={item} onChange={props.onChange} index={index} onClick={props.onClick} />);
    });
    
    return content;
}

function TableRender(props) {
    //PROPS:: tableContents, onChange, onClick
    const tableContents = props.tableContents;

    return (
        <Table striped bordered condensed hover responsive >
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
                <TableRow tableContents={tableContents} onChange={props.onChange} onClick={props.onClick} />
            </tbody>
        </Table>
    );
}

function PaginationHandler(props) {
    //PROPS:: active, size, onPage
    let active = props.active;
    let pager = [];
    const pageLimit = Math.ceil(props.size/10);

    for (let i=0; i<pageLimit; i++){
        pager.push(
            <Pagination.Item active={i===active} onClick={(e)=>{props.onPage(e, i)}} >{i+1}</Pagination.Item>
        );
    }

    return (pager);
}

function Paginator(props) {
    //PROPS:: tableContents, type, assigned, onChange, onClick, active, onPage, currentPage
    const tableContents = props.tableContents;
    const type = props.type;
    const assigned = props.assigned;

    const pageContent = tableContents.map((item, index) => {
        if (type === 0) {
            if (assigned==="all"){
              return (item);
            } else if ((assigned==="assigned") && !(item.Trip_Status===1)) {
              return (item);          
            } else if ((assigned==="unassigned") && (item.Trip_Status===1)) {
              return (item);                    
            } else {
              return (null)
            }
        } else {
            if (type === item.Trip_Type) {
              if (assigned==="all") {
                return (item);
              } else if ((assigned==="assigned") && !(item.Trip_Status===1)) {
                return (item);                    
              } else if ((assigned==="unassigned") && (item.Trip_Status===1)) {
                return (item);                    
              } else {
                return (null)
              }
            } else {
              return (null)
            }
        }
    });

    const pageContentFinal = pageContent.filter((item, index) => {
        return item!==null;
    })

    return (
        <div>
            <TableRender tableContents={pageContentFinal.slice(10*props.currentPage,10*props.currentPage+10)||pageContentFinal.slice(10*props.currentPage)} onChange={props.onChange} onClick={props.onClick} />
            <Pagination>
                <PaginationHandler active={props.active} size={pageContentFinal.length} onPage={props.onPage} />
            </Pagination>
        </div>
    );
}

export default class TabbedRequest extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            key: 0.1,
            tableContent: [],
            driver: [],
            currentPage: 0
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handlePage = this.handlePage.bind(this);
    }

    componentDidMount() {
        axios.get('/trips/all')
        .then(res => {
            this.setState({
                tableContent: res.data
            });
        })

        axios.get('/users/Role/3')
        .then(res => {
            this.setState({
                driver: res
            })
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
        this.setState({ 
            key: key, 
            currentPage: 0
        });
    }

    handleClick(event, tripID) {
        this.props.history.push('/viewtrip/'+tripID);
    }

    handlePage(event, page) {
        this.setState({
            currentPage: page
        });
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
                        <Tab.Pane eventKey={0.1}><Paginator tableContents={this.state.tableContent} type={0} assigned={"all"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={0.2}><Paginator tableContents={this.state.tableContent} type={0} assigned={"assigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={0.3}><Paginator tableContents={this.state.tableContent} type={0} assigned={"unassigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={1.1}><Paginator tableContents={this.state.tableContent} type={1} assigned={"all"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={1.2}><Paginator tableContents={this.state.tableContent} type={1} assigned={"assigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={1.3}><Paginator tableContents={this.state.tableContent} type={1} assigned={"unassigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={2.1}><Paginator tableContents={this.state.tableContent} type={2} assigned={"all"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={2.2}><Paginator tableContents={this.state.tableContent} type={2} assigned={"assigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={2.3}><Paginator tableContents={this.state.tableContent} type={2} assigned={"unassigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={3.1}><Paginator tableContents={this.state.tableContent} type={3} assigned={"all"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={3.2}><Paginator tableContents={this.state.tableContent} type={3} assigned={"assigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={3.3}><Paginator tableContents={this.state.tableContent} type={3} assigned={"unassigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={4.1}><Paginator tableContents={this.state.tableContent} type={4} assigned={"all"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={4.2}><Paginator tableContents={this.state.tableContent} type={4} assigned={"assigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                        <Tab.Pane eventKey={4.3}><Paginator tableContents={this.state.tableContent} type={4} assigned={"unassigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} /></Tab.Pane>
                    </Tab.Content>
                </Row>
            </Tab.Container>
        );

    }
}
