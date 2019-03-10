import React from 'react';
import axios from 'axios';
import { Form, FormGroup, Col, ControlLabel, FormControl, Button, Modal, ButtonToolbar, Row } from 'react-bootstrap';
import { DriverName, TripTypes, TripStatus } from '../../Selections';

function StartEndChangeModal(props) {
    const start = new Date (props.start);
    const end = new Date (props.end);

    var startMonth = null;
    var endMonth = null;

    if (start.getMonth()<9) {
        startMonth = "0" + (start.getMonth() + 1).toString();
    } else {
        startMonth = (start.getMonth() + 1).toString();
    }

    if (end.getMonth()<9) {
        endMonth = "0" + (end.getMonth() + 1).toString();
    } else {
        endMonth = (end.getMonth() + 1).toString();
    }

    var startDate = start.getFullYear()+ "-" + startMonth + "-" + start.getDate();
    var endDate = end.getFullYear() + "-" + endMonth + "-" + end.getDate();

    var startTime = null;
    var endTime = null;

    if (start.getMinutes().toString() < 10) {
        startTime = start.getHours() + ":0" + start.getMinutes();
    } else {
        startTime = start.getHours() + ":" + start.getMinutes();
    }

    if (end.getMinutes().toString().length === 1) {
        endTime = end.getHours() + ":0" + end.getMinutes();
    } else {
        endTime = end.getHours() + ":" + end.getMinutes();
    }

    var content = null;

    if (props.showModal) {
        content = (
            <Modal.Dialog show={props.showModal.toString()}>
                <Modal.Header closeButton>
                    <Modal.Title>Change Start/End Time</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col sm={8}>
                            <FormGroup controlId="start_date">
                                <Col componentClass={ControlLabel} sm={4}>Start: </Col>
                                <Col sm={6}>
                                    <FormControl type="date" value={startDate} onChange={(e) => props.handleStartEndChange(e)} />                        
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col sm={4}>
                            <FormGroup controlId="start_time">
                                <Col sm={12}>
                                    <FormControl type="time" value={startTime} onChange={(e) => props.handleStartEndChange(e)} />                        
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={8}>
                            <FormGroup controlId="start_mileage">
                                <Col componentClass={ControlLabel} sm={4}>Start Mileage: </Col>
                                <Col sm={6}>
                                    <FormControl type="text" value={props.start_mileage} onChange={(e) => props.handleStartEndChange(e)} />
                                </Col>
                            </FormGroup>
                        </Col> 
                    </Row>
                    <Row>
                        <Col sm={8}>
                            <FormGroup controlId="end_date">
                                <Col componentClass={ControlLabel} sm={4}>End: </Col>
                                <Col sm={6}>
                                    <FormControl type="date" value={endDate} onChange={(e) => props.handleStartEndChange(e)} />                        
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col sm={4}>
                            <FormGroup controlId="end_time">
                                <Col sm={12}>
                                    <FormControl type="time" value={endTime} onChange={(e) => props.handleStartEndChange(e)} />                        
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={8}>
                            <FormGroup controlId="end_mileage">
                                <Col componentClass={ControlLabel} sm={4}>End Mileage: </Col>
                                <Col sm={6}>
                                    <FormControl type="text" value={props.end_mileage} onChange={(e) => props.handleStartEndChange(e)} />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonToolbar>
                        <Button onClick={(e) => props.handleConfirmTimeChange(e)}>Change</Button>
                        <Button onClick={(e) => props.handleRemoveStartEnd(e)}>Remove all data</Button>
                        <Button onClick={(e) => props.onCancel(e)}>Cancel</Button>
                    </ButtonToolbar>
                </Modal.Footer>
            </Modal.Dialog>
        );
    } else {
        content = null;
    }

    return content; 
}

function TripStartEnd(props) {
    const status = props.status;
    const start = new Date(props.start);
    const end = new Date(props.end);
    const start_mileage = props.start_mileage;
    const end_mileage = props.end_mileage;

    var content = null;
    var renderStart = null;
    var renderEnd = null;

    if (start.getMinutes().toString(10).length === 1) {
        renderStart = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate() + " " + start.getHours() + ":0" + start.getMinutes();
    } else {
        renderStart = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate() + " " + start.getHours() + ":" + start.getMinutes();
    }

    if (end.getMinutes().toString(10).length === 1) {
        renderEnd = end.getFullYear() + "-" + (end.getMonth() + 1) + "-" + end.getDate() + " " + end.getHours() + ":0" + end.getMinutes();
    } else {
        renderEnd = end.getFullYear() + "-" + (end.getMonth() + 1) + "-" + end.getDate() + " " + end.getHours() + ":" + end.getMinutes();
    }

    if (status === 4) {
        content = (
            <div>
            <FormGroup>
                <Col componentClass={ControlLabel} smOffset={1} sm={2}>Start:</Col>
                <Col sm={3}>
                    <FormControl.Static>{renderStart}</FormControl.Static>
                </Col>
                <Col componentClass={ControlLabel} sm={2}>Start Mileage:</Col>
                <Col sm={3}>
                    <FormControl.Static>{start_mileage + " km"}</FormControl.Static>
                </Col>
            </FormGroup>
            <FormGroup>
                <Col componentClass={ControlLabel} smOffset={1} sm={2}>End:</Col>
                <Col sm={3}>
                    <FormControl.Static>{renderEnd}</FormControl.Static>
                </Col>
                <Col componentClass={ControlLabel} sm={2}>End Mileage:</Col>
                <Col sm={3}>
                    <FormControl.Static>{end_mileage + " km"}</FormControl.Static>
                </Col>
            </FormGroup>
            </div>
        );
    } else if (status === 3){
        content = (
            <FormGroup>
                <Col componentClass={ControlLabel} smOffset={1} sm={2}>Start:</Col>
                <Col sm={3}>
                    <FormControl.Static>{renderStart}</FormControl.Static>
                </Col>
                <Col componentClass={ControlLabel} sm={2}>Start Mileage:</Col>
                <Col sm={3}>
                    <FormControl.Static>{start_mileage + " km"}</FormControl.Static>
                </Col>
            </FormGroup>
        );
    } else {
        content = null;
    }

    return content;
}

function TripDuration(props) {
    var content = null;
    if (props.fieldTrip) {
        content = (
            <div>
                <Col componentClass={ControlLabel} sm={2}>Duration:</Col>
                <Col sm={3}>
                    <FormControl.Static>{props.duration} Days</FormControl.Static>
                </Col>
            </div>
        );
    } else {
        content = (
            <div>
                <Col componentClass={ControlLabel} sm={2}>Duration:</Col>
                <Col sm={3}>
                    <FormControl.Static>{props.duration} Hours {props.durationMins} Minutes</FormControl.Static>
                </Col>
            </div>
        );
    }
    return content;
}

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

function CancelModal(props) {
    var showModal = props.showModal;
    //var handleDisplay = props.handleDisplay;
    var onYes = props.onYes;
    var onNo = props.onNo;
    var tripNumber = props.tripNumber;

    let content = null;

    if (showModal == true) {
        content = (
            <Modal.Dialog show={showModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Cancellation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to cancel this trip with Trip No. {tripNumber}?
                </Modal.Body>
                <Modal.Footer>
                    <ButtonToolbar>
                        <Button onClick={(e)=> onYes(e)}>Yes</Button>
                        <Button onClick={(e)=> onNo(e)}>No</Button>
                    </ButtonToolbar>
                </Modal.Footer>
            </Modal.Dialog>
        );
    }
 
    return (content);
}

function CancelTrip(props) {
    //PROPS::: userType, onClick, onCancel, tripStatus, showModal, tripNumber, onTimeCancel, showTimeModal

    if(props.tripStatus===1||props.tripStatus===2||props.tripStatus===5||props.tripStatus===6) {
        return(
            <div>
                <FormGroup>
                    <Col sm={3} smOffset={9}>
                        <Button bsStyle="danger" onClick={(e)=> props.onClick(e)}>Cancel Trip</Button>
                    </Col>
                </FormGroup>
                <CancelModal showModal={props.showModal} tripNumber={props.tripNumber} onYes={props.onCancel} onNo={props.onClick} />
            </div>
        );
    } else {
        return (
            <div>
                <FormGroup>
                    <Col sm={3} smOffset={9}>
                        <Button bsStyle="info" onClick={(e) => props.onTimeCancel(e)}>Change Start/End</Button>
                    </Col>
                </FormGroup>
                <StartEndChangeModal onCancel={props.onTimeCancel} showModal={props.showTimeModal} start={props.start} end={props.end} start_mileage={props.start_mileage} end_mileage={props.end_mileage} handleStartEndChange={props.handleStartEndChange} handleConfirmTimeChange={props.handleConfirmTimeChange} handleRemoveStartEnd={props.handleRemoveStartEnd} />
            </div>
        );
    }
}

/**
 * 
 * @param {onBehalf} props 
 */
function OnBehalfOf(props) {
    // PROPS::: onBehalf
    const onBehalf = props.onBehalf;
    return (
        (props.onBehalf !== null) ?
        <div>
            <FormGroup>
                <Col componentClass={ControlLabel} smOffset={1} sm={2}>On Behalf Of:</Col>
                <Col sm={3}>
                    <FormControl.Static>{onBehalf.Traveller_Name}</FormControl.Static>
                </Col>
            </FormGroup>
            <FormGroup>
                <Col componentClass={ControlLabel} smOffset={1} sm={2}>Phone:</Col>
                <Col sm={3}>
                    <FormControl.Static>{onBehalf.Traveller_Mobile}</FormControl.Static>
                </Col>
                <Col componentClass={ControlLabel} sm={2}>Email:</Col>
                <Col sm={2}>
                    <FormControl.Static>{onBehalf.Traveller_Email}</FormControl.Static>
                </Col>
            </FormGroup>
        </div>:
        null
    );
}
 
function ApprovalButton(props) {
    if (props.userType === 5) {
        return (
            (props.tripStatus === 6) ?
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Approval:</Col>
                    <Col sm={3}>
                        <Button onClick={(e) => props.onApprove(e, props.tripID, props.remark, true)}>Approve</Button>
                        <Button bsStyle="danger" onClick={(e) => props.onApprove(e, props.tripID, "Further remarks have been denied", true)}>Deny</Button>
                    </Col>
                </FormGroup> :
                null
        );
    } else {
        return null;
    }
}

function StatusButton(props) {
    var type = "info";
    const tripStatus = props.tripStatus;

    if (tripStatus === 1 || tripStatus === 6) {
        type = "warning";
    } else if (tripStatus === 2 || tripStatus === 5) {
        type = "info";
    } else if (tripStatus === 3 || tripStatus === 4) {
        type = "success";
    } else if (tripStatus === 7) {
        type = "danger";
    }

    return (
        <Button bsStyle={type} disabled><TripStatus tripStatus={tripStatus} /></Button>
    );
}

function FurtherRemarks(props) {
    var content = null;
    if (props.exists) {
        content = (
            <FormGroup>
                <Col componentClass={ControlLabel} smOffset={1} sm={2}>Further Remarks:</Col>
                <Col sm={3}>
                    <FormControl.Static>{props.remark}</FormControl.Static>
                </Col>
            </FormGroup>
        )
    }
    return content;
}

/**
 * @description generates the driver list or other relevant placeholder
 * @param {tripID, driverID, tripDate, tripStatus, onChange, driverList, driverTuple} props 
 */
function Driver(props) {
    //PROPS::: tripID, driverID, tripDate, tripStatus, onChange, driverList, driverTuple

    var content = null;
    var disabled = false;
    const today = new Date();

    var warningDate = new Date(props.tripDate);
    warningDate.setDate(warningDate.getDate() + 1);

    const driverList = props.driverList.map((driverDetail) => {
        return (
            <option value={driverDetail.Username}>{driverDetail.Full_Name.split(" ")[0]}</option>
        );
    });

    if (today >= warningDate) {
        if (props.driverID === "0") {
            content = (
                <FormGroup>
                    <Col smOffset={3} sm={2}><Button bsStyle="danger" disabled>Trip Request Expired</Button></Col>
                </FormGroup>
            );
        } else {
            content = (
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Driver:</Col>
                    <Col sm={3}>
                        <FormControl.Static><DriverName driverTuple={props.driverTuple} driverID={props.driverID} /></FormControl.Static>
                    </Col>
                </FormGroup>
            );
        }
    } else {
        if (props.tripStatus === 1 || props.tripStatus === 2 || props.tripStatus === 5) {
            disabled = false;
        } else {
            disabled = true;
        }
        if (props.userType === 2) {
            content = (
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Driver:</Col>
                    <Col componentClass="select" value={props.driverID} onChange={(e) => props.onChange(e, props.tripID)} sm={2} disabled={disabled}>
                        <option value="0">Unassigned</option>
                        {driverList}
                        <option value="cab">Cab</option>
                    </Col>
                </FormGroup>
            );
        } else if (props.userType != 5) {
            content = (
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Driver:</Col>
                    <Col sm={3}>
                        <FormControl.Static><DriverName driverTuple={props.driverTuple} driverID={props.driverID} /></FormControl.Static>
                    </Col>
                </FormGroup>
            );
        }
    }

    return content;
}

function BudgetingEntity(props) {
    //PROPS::: budgetingEntity, projectNumber
    const budgetingEntity = props.budgetingEntity;
    const projectNumber = props.projectNumber;

    return (
        (budgetingEntity === 2) ?
            <div>
                <Col sm={3}>
                    <FormControl.Static>Project Funded</FormControl.Static>
                </Col>
                <Col componentClass={ControlLabel} sm={2}>Project:</Col>
                <Col sm={2}>
                    <FormControl.Static>{projectNumber}</FormControl.Static>
                </Col>
            </div> :
            <div>
                <Col sm={2}>
                    <FormControl.Static>Regular Program Funded</FormControl.Static>
                </Col>
            </div>
    );
}

function Destinations(props) {
    //PROPS::: destinations
    const destinations = props.destinations;
    const content = destinations.map((dest, index) => {
        return (
            <Col sm={2} key={index}>
                <FormControl.Static>{(index + 1) + ") " + dest.Destination + ", " + dest.Destination_Town}</FormControl.Static>
            </Col>
        )
    })

    return content;
}

export default class ViewTripDetails extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tripid: props.match.params.tripid,
            tripInfo: [],
            furtherRemarks: false,
            remark: "",
            budgetingEntity: 1,
            projectNumber: null,
            destinations: [],
            onBehalf: null,
            showModal: false,
            driverList: [],
            driverTuple: {},
            showOnLeaveModal: false,
            showTimeChangeModal: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleApproval = this.handleApproval.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleStartEndChange = this.handleStartEndChange.bind(this);
        this.handleShowModal = this.handleShowModal.bind(this);
        this.handleShowLeaveModal = this.handleShowLeaveModal.bind(this);
        this.handleTimeChangeModal = this.handleTimeChangeModal.bind(this);
        this.handleConfirmTimeChange = this.handleConfirmTimeChange.bind(this);
        this.handleRemoveStartEnd = this.handleRemoveStartEnd.bind(this);
    }

    componentWillMount() {
        const auth = this.props;

        axios.get('/loggedin')
            .then(res => {
                if (res.data == "") {
                    auth.userHasAuthenticated(false, null, null, null, null);
                    auth.history.push('/login');
                } else {
                    auth.userHasAuthenticated(true, res.data.Username, res.data.Role, res.data.PlaceTripForFAOR, res.data.GenerateReport);
                    /*if (res.data.Role === 1) {
                        auth.history.push('/viewusers');
                    } /*else if (res.data.Role===4) {
                    auth.history.push('/requesttrip');
                } else if (res.data.Role===5) {
                    auth.history.push('/viewfrequests');
                }*/
                }
            })
    }

    componentDidMount() {
        axios.get('/trips/gettrip/' + this.state.tripid)
            .then(res => {
                if (res.data.status === "success") {
                    this.setState({
                        tripInfo: res.data.data,
                    })
                } else {
                    console.log(res.data.status, res.data.data);
                }
            })

        axios.get('/trips/frexists/' + this.state.tripid)
            .then(res => {
                if (res.data.exists === true) {
                    this.setState({
                        furtherRemarks: true,
                        remark: res.data.data
                    })
                }
            })

        axios.get('/trips/bentity/' + this.state.tripid)
            .then(res => {
                if (res.data.exists === true) {
                    this.setState({
                        budgetingEntity: 2,
                        projectNumber: res.data.data
                    })
                }
            })

        axios.get('/trips/destinations/' + this.state.tripid)
            .then(res => {
                if (res.data.success === true) {
                    this.setState({
                        destinations: res.data.data
                    })
                }
            })
        
        axios.get('/users/onbehalf/' + this.state.tripid)
            .then(res=>{
                console.log("On behalf ",res);
                if (res.data.status === "success") {
                    this.setState({
                        onBehalf: res.data.result,
                    });
                }
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

    handleChange(event, tripID) {
        const driverID = event.target.value;
        const tDate = new Date(this.state.tripInfo.Trip_Date);
        var tripStatus;
        var tripInfo = this.state.tripInfo;

        if (driverID === "0") {
            tripStatus = 1;
        } else if (driverID === "cab") {
            tripStatus = 5;
        } else {
            tripStatus = 2;
        }

        axios.post('/drivers/isonleave', {
            driverID: driverID,
            tripDate: tDate.getFullYear()+'-'+(tDate.getMonth()+1)+'-'+tDate.getDate(),
            tripStartTime: this.state.tripInfo.Trip_Time, 
            duration: this.state.tripInfo.Duration,
            durationMins: this.state.tripInfo.Duration_Minute
        }).then((leaveRes) => {
            console.log(leaveRes.data);
            if (leaveRes.data.status === "success") {
                if (leaveRes.data.isOnLeave) {
                    this.setState({
                        showOnLeaveModal: true
                    });
                } else {
                    axios.post('/trips/assigndriver', {
                        tripID: tripID,
                        driverID: driverID,
                        tripStatus: tripStatus
                    })
                        .then(res => {
                            if (res.data.status === "success") {
                                tripInfo.Driver_ID = driverID;
                                tripInfo.Trip_Status = tripStatus;
                                this.setState({
                                    tripInfo: tripInfo,
                                })
                            }
                        })
                }
            }
        })
    }

    handleApproval(event, tripID, comment, approve) {
        var tripInfo = this.state.tripInfo;

        axios.post('/trips/approval', {
            approve: approve,
            comment: comment,
            tripID: tripID
        })
            .then(response => {
                if (response.data.success) {
                    tripInfo.Trip_Status = 1;
                    this.setState({
                        remark: comment,
                        tripInfo: tripInfo
                    })
                }
            })
    }

    handleCancel(event) {
        var tripInfo = this.state.tripInfo;

        axios.post('/trips/canceltrip', {
            tripID: this.state.tripid
        })
            .then(response => {
                if (response.data.status === "success") {
                    tripInfo.Trip_Status = 7;
                    tripInfo.Driver_ID = 0;
                    this.setState({
                        tripInfo: tripInfo,
                        showModal: false
                    });
                }
            })
    }

    handleStartEndChange(event) {
        var tripInfo = this.state.tripInfo;
        var start = null;
        var end = null;

        if (tripInfo.Start === null) {
            start = new Date();
        } else {
            start = new Date(tripInfo.Start)
        }

        if (tripInfo.End === null) {
            end = new Date();
        } else {
            end = new Date(tripInfo.End);
        }

        switch (event.target.id) {
            case 'start_date':
                var newStart = new Date(event.target.value);
                start.setFullYear(newStart.getFullYear());
                start.setMonth(newStart.getMonth());
                start.setDate(newStart.getDate());
                tripInfo.Start = new Date(start);
                break;
            case 'start_time':
                var newStart = event.target.value;
                start.setHours(parseInt(newStart.slice(0, 2), 10));
                start.setMinutes(parseInt(newStart.slice(3,5), 10));
                tripInfo.Start = new Date(start);
                break;
            case 'start_mileage':
                tripInfo.Start_Mileage = event.target.value;
                break;
            case 'end_date':
                var newEnd = new Date(event.target.value);
                end.setFullYear(newEnd.getFullYear());
                end.setMonth(newEnd.getMonth());
                end.setDate(newEnd.getDate());
                tripInfo.End = new Date(end);
                break;
            case 'end_time':
                var newEnd = event.target.value;
                end.setHours(parseInt(newEnd.slice(0, 2)), 10);
                end.setMinutes(parseInt(newEnd.slice(3,5), 10));
                tripInfo.End = new Date(end);
                break;
            case 'end_mileage':
                tripInfo.End_Mileage = event.target.value;
                break;
            default:
                break;
        }

        if (end !== null) {
            tripInfo.Trip_Status = 4;
        } else {
            if (start !== null) {
                tripInfo.Trip_Status = 3;
            } else {
                tripInfo.TripStatus = 2;
            }
        }

        this.setState({
            tripInfo: tripInfo
        });
    }

    handleShowModal(event) {
        let showModal = this.state.showModal;

        this.setState({
            showModal: !showModal
        });
    }

    handleShowLeaveModal(event) {
        let showModal = this.state.showOnLeaveModal;

        this.setState({
            showOnLeaveModal: !showModal
        })
    }

    handleTimeChangeModal(event) {
        let showTimeChangeModal = this.state.showTimeChangeModal;

        axios.get('/trips/gettrip/' + this.state.tripid)
            .then(res => {
                if (res.data.status === "success") {
                    this.setState({
                        tripInfo: res.data.data,
                        showTimeChangeModal: !showTimeChangeModal
                    })
                } else {
                    console.log(res.data.status, res.data.data);
                }
            });
    }

    handleConfirmTimeChange(event) {
        var tripDate = new Date(this.state.tripInfo.Trip_Date);
        var requestedDate = new Date(this.state.tripInfo.Requested_Date);
        var startDate = new Date(this.state.tripInfo.Start);
        var endDate = new Date(this.state.tripInfo.End);

        axios.post('/trips/updateTrip', {
            tripID: this.state.tripInfo.TripID,
            username: this.state.tripInfo.Username,
            trip_Status: this.state.tripInfo.Trip_Status,
            driver_ID: this.state.tripInfo.Driver_ID,
            trip_Type: this.state.tripInfo.Trip_Type,
            requested_Date: requestedDate.getFullYear() + "-" + (requestedDate.getMonth() + 1) + "-" + requestedDate.getDate(),
            trip_Date: tripDate.getFullYear() + "-" + (tripDate.getMonth() + 1) + "-" + tripDate.getDate(),
            trip_Time: this.state.tripInfo.Trip_Time,
            duration: this.state.tripInfo.Duration,
            duration_Minute: this.state.tripInfo.Duration_Minute,
            purpose: this.state.tripInfo.Purpose,
            onBehalf: this.state.tripInfo.OnBehalf,
            start: startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate() + " " + startDate.getHours() + ":" + startDate.getMinutes(),
            end: endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate() + " " + endDate.getHours() + ":" + endDate.getMinutes(),
            start_Mileage: this.state.tripInfo.Start_Mileage,
            end_Mileage: this.state.tripInfo.End_Mileage
        }).then((result) => {
            if (result.data.status === "success") {
                let showTimeChangeModal = this.state.showTimeChangeModal;
                this.setState({
                    showTimeChangeModal: !showTimeChangeModal
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    handleRemoveStartEnd(event) {
        var tripDate = new Date(this.state.tripInfo.Trip_Date);
        var requestedDate = new Date(this.state.tripInfo.Requested_Date);

        axios.post('/trips/updateTrip', {
            tripID: this.state.tripInfo.TripID,
            username: this.state.tripInfo.Username,
            trip_Status: 2,
            driver_ID: this.state.tripInfo.Driver_ID,
            trip_Type: this.state.tripInfo.Trip_Type,
            requested_Date: requestedDate.getFullYear() + "-" + (requestedDate.getMonth() + 1) + "-" + requestedDate.getDate(),
            trip_Date: tripDate.getFullYear() + "-" + (tripDate.getMonth() + 1) + "-" + tripDate.getDate(),
            trip_Time: this.state.tripInfo.Trip_Time,
            duration: this.state.tripInfo.Duration,
            duration_Minute: this.state.tripInfo.Duration_Minute,
            purpose: this.state.tripInfo.Purpose,
            onBehalf: this.state.tripInfo.OnBehalf,
            start: null,
            end: null,
            start_Mileage: null,
            end_Mileage: null
        }).then((result) => {
            console.log(result)
            if (result.data.status === "success") {
                let showTimeChangeModal = this.state.showTimeChangeModal;
                this.setState({
                    showTimeChangeModal: !showTimeChangeModal
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        const tripDate = new Date(this.state.tripInfo.Trip_Date);
        const tripDateString = tripDate.getFullYear() + "-" + (tripDate.getMonth() + 1) + "-" + tripDate.getDate();
        const requestedDate = new Date(this.state.tripInfo.Requested_Date);
        const requestedDateString = requestedDate.getFullYear() + "-" + (requestedDate.getMonth() + 1) + "-" + requestedDate.getDate();

        return (
            <Form horizontal>
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Trip ID:</Col>
                    <Col sm={3}>
                        <FormControl.Static>{this.state.tripInfo.TripID}</FormControl.Static>
                    </Col>
                    <Col componentClass={ControlLabel} sm={2}>Username:</Col>
                    <Col sm={2}>
                        <FormControl.Static>{this.state.tripInfo.Username}</FormControl.Static>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Trip Date:</Col>
                    <Col sm={3}>
                        <FormControl.Static>{tripDateString}</FormControl.Static>
                    </Col>
                    <Col componentClass={ControlLabel} sm={2}>Trip Time:</Col>
                    <Col sm={2}>
                        <FormControl.Static>{this.state.tripInfo.Trip_Time}</FormControl.Static>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1}  sm={2}>Trip Type:</Col>
                    <Col sm={3}>
                        <FormControl.Static><TripTypes tripType={this.state.tripInfo.Trip_Type} /></FormControl.Static>
                    </Col>
                    <TripDuration fieldTrip={parseInt(this.state.tripInfo.Trip_Type, 10) === 2} duration={this.state.tripInfo.Duration} durationMins={this.state.tripInfo.Duration_Minute} />
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Destinations:</Col>
                    <Destinations destinations={this.state.destinations} />
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Requested Date:</Col>
                    <Col sm={3}>
                        <FormControl.Static>{requestedDateString}</FormControl.Static>
                    </Col>
                    <Col componentClass={ControlLabel} sm={2}>Trip Status:</Col>
                    <Col sm={2}>
                        <StatusButton tripStatus={this.state.tripInfo.Trip_Status} />
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Purpose:</Col>
                    <Col sm={3}>
                        <FormControl.Static>{this.state.tripInfo.Purpose}</FormControl.Static>
                    </Col>
                </FormGroup>
                <OnBehalfOf onBehalf={this.state.onBehalf} />
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Budgeting Entity:</Col>
                    <BudgetingEntity budgetingEntity={this.state.budgetingEntity} projectNumber={this.state.projectNumber} />
                </FormGroup>
                <FurtherRemarks exists={this.state.furtherRemarks} remark={this.state.remark} />
                <Driver userType={this.props.userType} tripID={this.state.tripid} driverID={this.state.tripInfo.Driver_ID} tripDate={tripDate} tripStatus={this.state.tripInfo.Trip_Status} onChange={this.handleChange} driverList={this.state.driverList} driverTuple={this.state.driverTuple} />
                <TripStartEnd status={this.state.tripInfo.Trip_Status} start={this.state.tripInfo.Start} end={this.state.tripInfo.End} start_mileage={this.state.tripInfo.Start_Mileage} end_mileage={this.state.tripInfo.End_Mileage} />
                <ApprovalButton userType={this.props.userType} tripStatus={this.state.tripInfo.Trip_Status} remark={this.state.remark} tripID={this.state.tripid} onApprove={this.handleApproval} />
                <CancelTrip userType={this.props.userType} onClick={this.handleShowModal} onCancel={this.handleCancel} tripStatus={this.state.tripInfo.Trip_Status} showModal={this.state.showModal} tripNumber={this.state.tripid} onTimeCancel={this.handleTimeChangeModal} showTimeModal={this.state.showTimeChangeModal} start={this.state.tripInfo.Start} end={this.state.tripInfo.End} start_mileage={this.state.tripInfo.Start_Mileage} end_mileage={this.state.tripInfo.End_Mileage} handleStartEndChange={this.handleStartEndChange} handleConfirmTimeChange={this.handleConfirmTimeChange} handleRemoveStartEnd={this.handleRemoveStartEnd} />
                <DriverLeaveModal showModal={this.state.showOnLeaveModal} tripID={this.state.tripInfo.TripID} onOk={this.handleShowLeaveModal} />
            </Form>
        );
    }
}