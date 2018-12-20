import React from "react";
import axios from "axios";
import { Table, Grid, Form, Row, FormGroup, Col, Button, Tab, FormControl, ControlLabel, Nav, NavItem, NavDropdown, MenuItem } from "react-bootstrap";
import { DriverName } from "../../Selections";

/**
 * @description Display if the driver has been blocked or not
 * @param {driverTuple, driverList, driverBlockStatus, changeBlockStatus} props 
 */
function BlockDriverFromSystem(props) {
    const driverTuple = props.driverTuple;
    const driverBlockStatus = props.driverBlockStatus
    const changeBlockStatus = props.changeBlockStatus;

    const content = driverBlockStatus.map((blockDetail, index) => {
        return (
            <Row>
                <FormGroup controlId={blockDetail.DriverID}>
                    <Col sm={5} componentClass={ControlLabel}><DriverName driverTuple={driverTuple} driverID={blockDetail.DriverID} /></Col>
                    <Col sm={4}>
                        <FormControl componentClass="select" value={parseInt(blockDetail.Blocked, 10)} onChange={(e)=>{changeBlockStatus(e, blockDetail.DriverID, index)}} >
                            <option value={0}>Unblocked</option>
                            <option value={1}>Blocked</option>
                        </FormControl>
                    </Col>
                </FormGroup>
            </Row>
        );
    });

    return (
        <Row className="show-grid">
            <Form horizontal>
                {content}
            </Form>
        </Row>
    );
}

/**
 * @description Display the driver currently assigned for the resident
 * @description If the driver is not assigned then the dropdown will be operational
 * @description If the driver is assigned the label will show assigned driver
 * @description Change button allows the driver to be changed 
 * @description Confirmation allows to confirm the driver
 * @param {driverTuple, driverList, driverForResident, isChanging, handleDriverForResident, handleDriverChange} props 
 */
function DriverForResident(props) {
    const driverTuple = props.driverTuple;
    const isChanging = props.isChanging;
    const handleDriverForResident = props.handleDriverForResident;
    const handleDriverChange = props.handleDriverChange;

    let driverForResident = props.driverForResident;

    if (!props.driverForResident) {
        driverForResident = "0";
    }

    const assignedDate = new Date();

    const driverList = props.driverList.map((driver) => {
        return (<option value={driver.Username}>{driver.Full_Name.split(" ")[0]}</option>);
    });

    if (driverForResident !== "0") {
        return (
            <Row className="show-grid">
                <Form horizontal>
                    <Row>
                        <FormGroup controlId="driverForResident">
                            <Col sm={5} componentClass={ControlLabel}>For the month of {(assignedDate.getMonth() + 1)}, {assignedDate.getFullYear()}</Col>
                            <Col sm={4}><DriverName driverTuple={driverTuple} driverID={driverForResident.DriverID} /></Col>
                        </FormGroup>
                    </Row>
                    <Row>
                        <Button name="submit" type="button" onClick={(e) => {handleDriverChange(e)}}>Change</Button>
                    </Row>
                </Form>
            </Row>
        );
    } else if ((driverForResident === "0") || isChanging) {
        return (
            <Row>
                <Form horizontal>
                    <Row className="show-grid">
                        <FormGroup controlId="driverForResident">
                            <Col sm={5} componentClass={ControlLabel}>For the month of {(assignedDate.getMonth() + 1)}, {assignedDate.getFullYear()}</Col>
                            <Col sm={4}>
                                <FormControl componentClass="select" value={driverForResident} onChange={(e) => {handleDriverForResident(e)}} >
                                    <option value="0">Select driver</option>
                                    {driverList}
                                </FormControl>
                            </Col>
                        </FormGroup>
                    </Row>
                </Form>
            </Row>
        );
    }
}

/**
 * @description Shows the hitory of drivers being blocked
 * @param {driverTuple, blockHistory} props 
 */
function BlockDriverHistory(props) {
    let driverTuple = props.driverTuple;
    let blockHistory = props.blockHistory;

    const content = blockHistory.map((blockDetail, index) => {
        let blockTimeStamp = new Date(blockDetail.Date);
        let hours = blockTimeStamp.getHours().toString();
        if (hours.length === 1) {
            hours = '0' + hours;
        }
        let minutes = blockTimeStamp.getMinutes().toString();
        if (minutes.length === 1) {
            minutes = '0' + minutes;
        }

        return (
            <tr key={index}>
                <td><DriverName driverTuple={driverTuple} driverID={blockDetail.DriverID} /></td>
                <td>{blockTimeStamp.getFullYear() + "-" + (blockTimeStamp.getMonth() + 1) + "-" + blockTimeStamp.getDate()}</td>
                <td>{hours + ":" + minutes}</td>
                <td>{(parseInt(blockDetail.Blocked, 10) === 0) ? "Unblocked" : "Blocked"}</td>
            </tr>
        );
    });
    return (
        <Table striped bordered condensed hover responsive >
            <thead>
                <tr>
                    <th>Driver</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {content}
            </tbody>
        </Table>
    );
}

/**
 * @description Shows the history of drivers assigned to resident
 * @param {driverResidentHistory} props 
 */
function DriverForResidentHistory(props) {
    let driverTuple = props.driverTuple;
    let driverResidentHistory = props.driverResidentHistory;

    const content = driverResidentHistory.map((rdDetail, index) => {
        let assignedTimeStamp = new Date(rdDetail.Date);
        let hours = assignedTimeStamp.getHours().toString();
        if (hours.length === 1) {
            hours = '0' + hours;
        }
        let minutes = assignedTimeStamp.getMinutes().toString();
        if (minutes.length === 1) {
            minutes = '0' + minutes;
        }

        return (
            <tr key={index}>
                <td><DriverName driverTuple={driverTuple} driverID={rdDetail.DriverID} /></td>
                <td>{assignedTimeStamp.getFullYear() + "-" + (assignedTimeStamp.getMonth() + 1) + "-" + assignedTimeStamp.getDate()}</td>
                <td>{hours + ":" + minutes}</td>
            </tr>
        );
    });
    return (
        <Table striped bordered condensed hover responsive >
            <thead>
                <tr>
                    <th>Driver</th>
                    <th>Date</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                {content}
            </tbody>
        </Table>
    );
}

/**
 * @description This will hold the display of the current status of drivers
 * @param {driverTuple, driverList, driverBlockStatus, driverBlockStatus, driverForResident, isChanging, handleDriverForResident, handleDriverChange} props 
 */
function BlockDriverTabContent(props) {
    const driverTuple = props.driverTuple;
    const driverList = props.driverList;
    const driverBlockStatus = props.driverBlockStatus;
    const changeBlockStatus = props.changeBlockStatus;
    const driverForResident = props.driverForResident;
    const isChanging = props.isChanging;
    const handleDriverForResident = props.handleDriverForResident;
    const handleDriverChange = props.handleDriverChange;

    return (
        <Grid>
            <BlockDriverFromSystem driverTuple={driverTuple} driverBlockStatus={driverBlockStatus} changeBlockStatus={changeBlockStatus} />
            <DriverForResident driverTuple={driverTuple} driverList={driverList} driverForResident={driverForResident} isChanging={isChanging} handleDriverForResident={handleDriverForResident} handleDriverChange={handleDriverChange} />
        </Grid>
    );
}

/**
 * @description Holds the history of drivers being blocked
 * @param {blockHistory, residentDriverHistory, currentView, handleHistorySlection} props 
 */
function BlockHistoryTabContent(props) {
    let blockHistory = props.blockHistory;
    let residentDriverHistory = props.residentDriverHistory;
    let currentView = props.currentView;
    let handleHistorySelection = props.handleHistorySelection;

    <div>
        <BlockDriverHistory blockHistory={blockHistory} />
        <DriverForResidentHistory driverResidentHistory={residentDriverHistory} />
    </div>
}

export default class BlockDriver extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            driverTuple: {},
            driverList: [],
            driverBlockStatus: [],
            residentDriver: null,
            residentDriverHistory: [],
            blockHistory: [],
            activeKey: 0,
            isChanging: false
        }

        this.changeBlockStatus = this.changeBlockStatus.bind(this);
        this.handleDriverForResident = this.handleDriverForResident.bind(this);
        this.handleDriverChange = this.handleDriverChange.bind(this);
        this.handleTabSelection = this.handleTabSelection.bind(this);
    }

    // componentDidMount() {
    //     const loggedUser = this.props;

    //     axios.post('/loggedin')
    //         .then((res) => {
    //             if (res.data == "") {
    //                 loggedUser.userHasAuthenticated(false, null, null);
    //                 loggedUser.history.push('/login');
    //             } else {
    //                 console.log("SSSSSS ", res.data);
    //                 loggedUser.userHasAuthenticated(true, res.data.Username, res.data.Role);
    //                 if (res.data.Role === 1) {
    //                     loggedUser.history.push('/viewusers');
    //                 } else if (res.data.Role === 4) {
    //                     loggedUser.history.push('/requesttrip');
    //                 } else if (res.data.Role === 3) {
    //                     loggedUser.history.push('/viewschedule');
    //                 }
    //             }
    //         }).catch(err => {
    //             console.log("Error ", err);
    //         });
    // }

    componentWillMount() {
        axios.get('/users/Role/3')
            .then((driverRes) => {
                let driverTuple = {};
                let tempBlockStatus = {};
                let finalBlockStatus = [];

                driverRes.data.map((driver) => {
                    driverTuple[driver.Username] = driver.Full_Name.split(" ")[0];
                    tempBlockStatus[driver.Username] = 0;
                });

                this.setState({
                    driverTuple: driverTuple,
                    driverList: driverRes.data
                })

                axios.get('/drivers/blockStatus')
                .then((status) => {
                    if (status.data.result) {
                        status.data.result.forEach((driver) => {
                            tempBlockStatus[driver.DriverID] = driver.Blocked;
                        });
                    }
                    let keys = Object.keys(tempBlockStatus);
                    keys.forEach((key) => {
                        finalBlockStatus.push({
                            DriverID: key,
                            Blocked: tempBlockStatus[key]
                        });
                    }); 
                    this.setState({
                        driverBlockStatus: finalBlockStatus
                    });
                })
            });

        axios.get('/drivers/blockStatus')
            .then((status) => {
                this.setState({
                    driverBlockStatus: status.data.result
                });
            })

        axios.get('/drivers/residentDriver')
            .then((status) => {
                this.setState({
                    residentDriver: status.data.result
                })
            })

        axios.get('/drivers/residentHistory')
            .then((status) => {
                this.setState({
                    residentDriverHistory: status.data.result
                })
            })

        axios.get('/drivers/blockHistory')
            .then((status) => {
                this.setState({
                    blockHistory: status.data.result
                })
            })
    }

    changeBlockStatus(event, driverID, index) {
        const target = event.target;
        let status = target.value;
        
        let driverBlockStatus = this.state.driverBlockStatus;
        driverBlockStatus[index].Blocked = parseInt(status, 10);

        axios.post('/drivers/blockDriver', {
            driverID: driverID,
            blocked: status
        })
            .then((result) => {
                if (result.data.result.affectedRows === 1) {
                    this.setState({
                        driverBlockStatus: driverBlockStatus
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });


    }

    handleDriverForResident(event) {
        const target = event.target;
        let driverID = target.value;

        axios.post('/drivers/currentResidentDriver', {
            driverID: driverID
        })
            .then((result) => {
                if (result.data.result.affectedRows === 1) {
                    this.setState({
                        residentDriver: { DriverID: driverID, Date: new Date()},
                        isChanging: false
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

    handleDriverChange(event) {
        this.setState({
            residentDriver: null,
            isChanging: true
        });
    }

    handleTabSelection(activeKey) {
        this.setState({
            activeKey: activeKey
        })
    }

    render() {
        return (
            <Tab.Container activeKey={this.state.activeKey} id="block-drivers" onSelect={this.handleTabSelection} >
                <Row className="clearfix">
                    <Col sm={12}>
                        <Nav bsStyle="tabs">
                            <NavItem eventKey={0}>Block Driver</NavItem>
                            <NavDropdown eventKey={1} title="History" id="block-history">
                                <MenuItem eventKey={1.1}>Block History</MenuItem>
                                <MenuItem eventKey={1.2}>Resident History</MenuItem>
                            </NavDropdown>
                        </Nav>
                    </Col>
                    <Col sm={12}>
                        <Tab.Content animation>
                            <Tab.Pane eventKey={0}><BlockDriverTabContent driverTuple={this.state.driverTuple} driverList={this.state.driverList} driverBlockStatus={this.state.driverBlockStatus} changeBlockStatus={this.changeBlockStatus} driverForResident={this.state.residentDriver} isChanging={this.state.isChanging} handleDriverForResident={this.handleDriverForResident} handleDriverChange={this.handleDriverChange} /></Tab.Pane>
                            <Tab.Pane eventKey={1.1}><BlockDriverHistory driverTuple={this.state.driverTuple} blockHistory={this.state.blockHistory} /></Tab.Pane>
                            <Tab.Pane eventKey={1.2}><DriverForResidentHistory driverTuple={this.state.driverTuple} driverResidentHistory={this.state.residentDriverHistory} /></Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        );
    }
}