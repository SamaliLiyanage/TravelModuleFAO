import React from 'react';
import axios from 'axios';
import { DriverName, TripTypes, TripStatus} from '../../Selections';
import { Table, Tab, FormControl, FormGroup, Nav, Row, Col, NavDropdown, MenuItem, Button, Pagination, Modal, ButtonToolbar } from 'react-bootstrap';

function DriverLeaveModal(props) {
    let showModal = props.showModal;
    let tripID = props.tripID;
    let onOk = props.onOk;

    let content = null;

    if (showModal === true) {
        content = (
            <Modal.Dialog show={showModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Driver cannot be allocated</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    This driver is on leave or has been allocated for another trip on the day of Trip ID {tripID}
                </Modal.Body>
                <Modal.Footer>
                    <ButtonToolbar>
                        <Button onClick={(e)=> onOk(e)}>Ok</Button>
                    </ButtonToolbar>
                </Modal.Footer>
            </Modal.Dialog>
        );
    } else {
        content = null;
    }

    return content;
}

function DriverAssignment(props) {
    const today = new Date();
    const tripDate = new Date(props.tripDate);
    const marginBottom = { margin: 0, height: '20pt' };
    const padding = {paddingTop:'0pt', paddingBottom: '0pt'} 

    const driverList = props.driverList.map((driverDetail) => {
        return (
            <option value={driverDetail.Username}>{driverDetail.Full_Name.split(" ")[0]}</option>
        );
    });

    if (today < tripDate) {
        return (
            <FormGroup controlId={props.TripID} bsSize="small" style={marginBottom} >
                <FormControl style={padding} componentClass="select" value={props.Driver_ID} onChange={(e) => props.onChange(e, props.TripID, props.index)} disabled={props.approved}>
                    <option value="0">Unassigned</option>
                    {driverList}
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
            return (
                <DriverName driverTuple={props.driverTuple} driverID={props.Driver_ID} />
            );
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
            <td><TripStatus tripStatus={tableContent.Trip_Status} /></td>
            <td><ViewDetails onClick={props.onClick} tripID={tableContent.TripID} /></td>
            <td>
                <DriverAssignment tripDate={warningDate} TripID={tableContent.TripID} Driver_ID={tableContent.Driver_ID} onChange={props.onChange} approved={approved} index={props.index} driverList={props.driverList} driverTuple={props.driverTuple} />
            </td>
        </tr>
    );
}

function TableRow(props) {
    //PORPS::: tableContents, onChange, onClick
    const tableContents = props.tableContents;
  
    const content = tableContents.map((item, index) => {
        return (<TripRow key={item.item.TripID} tableContent={item.item} onChange={props.onChange} index={item.index} onClick={props.onClick} driverList={props.driverList} driverTuple={props.driverTuple} />);
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
                <th>Trip Status</th>
                <th>Details</th>
                <th>Assign Driver</th>
            </tr>
            </thead>
            <tbody>
                <TableRow tableContents={tableContents} onChange={props.onChange} onClick={props.onClick} driverList={props.driverList} driverTuple={props.driverTuple} />
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
            <Pagination.Item key={i} active={i===active} onClick={(e)=>{props.onPage(e, i)}} >{i+1}</Pagination.Item>
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
              return ({item, index});
            } else if ((assigned==="assigned") && !(item.Trip_Status===1)) {
              return ({item, index});          
            } else if ((assigned==="unassigned") && (item.Trip_Status===1)) {
              return ({item, index});                    
            } else {
              return (null)
            }
        } else {
            if (type === item.Trip_Type) {
              if (assigned==="all") {
                return ({item, index});
              } else if ((assigned==="assigned") && !(item.Trip_Status===1)) {
                return ({item, index});                    
              } else if ((assigned==="unassigned") && (item.Trip_Status===1)) {
                return ({item, index});                    
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
            <TableRender tableContents={pageContentFinal.slice(10*props.currentPage,10*props.currentPage+10)||pageContentFinal.slice(10*props.currentPage)} onChange={props.onChange} onClick={props.onClick} driverList={props.driverList} driverTuple={props.driverTuple} />
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
            currentPage: 0,
            driverList: [],
            driverTuple: {},
            showOnLeaveModal: false,
            onLeaveModalTrip: null
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handlePage = this.handlePage.bind(this);
        this.handleShowModal = this.handleShowModal.bind(this);
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

        axios.get('/users/Role/3')
            .then(res => {
                let drivers = {'0': 'Unassigned', 'cab': 'Cab Assigned'};
                res.data.forEach((driverDetail) => {
                    drivers[driverDetail.Username] = driverDetail.Full_Name.split(" ")[0];
                });
                this.setState({
                    driverList: res.data,
                    driverTuple: drivers
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

        axios.get('/trips/gettrip/' + i)
        .then ((res) => {
            if (res.data.status === "success") {
                const tDate = new Date(res.data.data.Trip_Date);
                axios.post('/drivers/isonleave', {
                    driverID: driverID,
                    tripDate: tDate.getFullYear()+'-'+(tDate.getMonth()+1)+'-'+tDate.getDate(), 
                    tripStartTime: res.data.data.Trip_Time, 
                    duration: res.data.data.Duration,
                    durationMins: res.data.data.Duration_Minute
                }).then ((leaveRes) => {
                    if (leaveRes.data.status === "success") {
                        if (leaveRes.data.isOnLeave) {
                            this.setState({
                                showOnLeaveModal: true,
                                onLeaveModalTrip: i
                            });
                        } else {
                            axios.post('/trips/assigndriver', {
                                tripID: i,
                                driverID: driverID,
                                tripStatus: tripStatus,
                            })
                                .then((response) => {
                                    if (response.data.status === "success") {
                                        tableContent[index].Driver_ID = driverID;
                                        tableContent[index].Trip_Status = tripStatus;
                                        this.setState({
                                            tableContent: tableContent,
                                            showOnLeaveModal: false,
                                            onLeaveModalTrip: null
                                        });
                                    } else {
                                        alert("Ooops!!! Try again later...");
                                    }
                                })
                        }
                    }
                })
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

    handleShowModal(event) {
        let showModal = this.state.showOnLeaveModal;

        this.setState({
            showOnLeaveModal: !showModal
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
                        <Tab.Pane eventKey={0.1}><Paginator tableContents={this.state.tableContent} type={0} assigned={"all"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={0.2}><Paginator tableContents={this.state.tableContent} type={0} assigned={"assigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={0.3}><Paginator tableContents={this.state.tableContent} type={0} assigned={"unassigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={1.1}><Paginator tableContents={this.state.tableContent} type={1} assigned={"all"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={1.2}><Paginator tableContents={this.state.tableContent} type={1} assigned={"assigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={1.3}><Paginator tableContents={this.state.tableContent} type={1} assigned={"unassigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={2.1}><Paginator tableContents={this.state.tableContent} type={2} assigned={"all"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={2.2}><Paginator tableContents={this.state.tableContent} type={2} assigned={"assigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={2.3}><Paginator tableContents={this.state.tableContent} type={2} assigned={"unassigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={3.1}><Paginator tableContents={this.state.tableContent} type={3} assigned={"all"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={3.2}><Paginator tableContents={this.state.tableContent} type={3} assigned={"assigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={3.3}><Paginator tableContents={this.state.tableContent} type={3} assigned={"unassigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={4.1}><Paginator tableContents={this.state.tableContent} type={4} assigned={"all"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={4.2}><Paginator tableContents={this.state.tableContent} type={4} assigned={"assigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                        <Tab.Pane eventKey={4.3}><Paginator tableContents={this.state.tableContent} type={4} assigned={"unassigned"} onChange={this.handleChange} onClick={this.handleClick} active={this.state.currentPage} onPage={this.handlePage} currentPage={this.state.currentPage} driverList={this.state.driverList} driverTuple={this.state.driverTuple} /></Tab.Pane>
                    </Tab.Content>
                    <DriverLeaveModal showModal={this.state.showOnLeaveModal} tripID={this.state.onLeaveModalTrip} onOk={this.handleShowModal} />
                </Row>
            </Tab.Container>
        );

    }
}
