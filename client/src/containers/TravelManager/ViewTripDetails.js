import React from 'react';
import axios from 'axios';
import { Form, FormGroup, Col, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { TripTypes, TripStatus, DriverName } from '../../Selections';

function ApprovalButton (props) {
    if (props.userType===5){
        return (
            (props.tripStatus===6)?
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Approval:</Col>
                    <Col sm={3}>
                        <Button onClick={(e)=>props.onApprove(e, props.tripID, props.remark, true)}>Approve</Button>
                        <Button bsStyle="danger" onClick={(e)=>props.onApprove(e, props.tripID, "Further remarks have been denied", true)}>Deny</Button>
                    </Col>
                </FormGroup>:
                null
        );
    } else {
        return null;
    }
}

function StatusButton (props) {
    var type = "info";
    const tripStatus = props.tripStatus;

    if (tripStatus===1 || tripStatus===6) {
        type = "warning";
    } else if (tripStatus===2 || tripStatus===5) {
        type = "info";
    } else if (tripStatus===3 || tripStatus===4) {        
        type = "success";
    } else if (tripStatus===7) {    
        type = "danger";
    }

    return (        
        <Button bsStyle={type} disabled><TripStatus tripStatus={tripStatus} /></Button>
    );
}

function FurtherRemarks (props) {
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

function Driver (props) {
    //PROPS::: tripID, driverID, tripDate, tripStatus, onChange

    var content = null;
    var disabled = false;
    const today = new Date();

    var warningDate = new Date (props.tripDate);
    warningDate.setDate(warningDate.getDate()+1);

    if (today >= warningDate) {
        if(props.driverID==="0"){
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
                        <FormControl.Static><DriverName driverID={props.driverID} /></FormControl.Static>
                    </Col>
                </FormGroup>
            );
        }        
    } else {
        if (props.tripStatus===6) {
            disabled = true;
        }
        if (props.userType===2){
            content = (
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Driver:</Col>
                    <Col componentClass="select" value={props.driverID} onChange={(e) => props.onChange (e, props.tripID)} sm={2} disabled={disabled}>
                        <option value="0">Unassigned</option>
                        <option value="1">Anthony</option>
                        <option value="2">Ruchira</option>
                        <option value="3">Dinesh</option>
                        <option value="cab">Cab</option>
                    </Col>
                </FormGroup>
            );
        } else if (props.userType!=5) {
            content = (
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Driver:</Col>
                    <Col sm={3}>
                        <FormControl.Static><DriverName driverID={props.driverID} /></FormControl.Static>
                    </Col>
                </FormGroup>
            );
        }   
    }
    
    return content;
}

function BudgetingEntity (props) {
    //PROPS::: budgetingEntity, projectNumber
    const budgetingEntity = props.budgetingEntity;
    const projectNumber = props.projectNumber;

    return (
        (budgetingEntity===2) ? 
        <div>
            <Col sm={3}>
                <FormControl.Static>Project Funded</FormControl.Static>
            </Col>
            <Col componentClass={ControlLabel} sm={2}>Project:</Col>
            <Col sm={2}>
                <FormControl.Static>{projectNumber}</FormControl.Static>
            </Col>
        </div>:
        <div>
            <Col sm={4}>
                <FormControl.Static>Regular Program Funded</FormControl.Static>
            </Col>
        </div>
    );
}

function Destinations (props) {
    //PROPS::: destinations
    const destinations = props.destinations;
    console.log("Inside",destinations);
    const content = destinations.map((dest, index) => {
        return (
            <Col sm={2}>
                <FormControl.Static>{(index+1)+") "+dest.Destination+", "+dest.Destination_Town}</FormControl.Static>
            </Col>
        )
    })

    return content;
}

export default class ViewTripDetails extends React.Component {

    constructor (props) {
        super(props);

        this.state ={
            tripid: props.match.params.tripid,
            tripInfo: [],
            furtherRemarks: false,
            remark: "",
            budgetingEntity: 1,
            projectNumber: null,
            destinations: []
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleApproval = this.handleApproval.bind(this);
    }

    componentWillMount () {
        const auth = this.props;

        axios.get('/loggedin')
        .then(res => {
            if (res.data=="") {
                auth.userHasAuthenticated(false, null, null);
                auth.history.push('/login');
            } else {
                auth.userHasAuthenticated(true, res.data.Username, res.data.Role);
                if (res.data.Role===1) {
                    auth.history.push('/viewusers');
                } /*else if (res.data.Role===4) {
                    auth.history.push('/requesttrip');
                } else if (res.data.Role===5) {
                    auth.history.push('/viewfrequests');
                }*/
            }
        })
    }

    componentDidMount () {
        axios.get('/trips/gettrip/'+this.state.tripid)
        .then(res=>{
            if(res.data.status==="success") {
                this.setState ({
                    tripInfo: res.data.data,
                })
            } else {
                console.log(res.data.status, res.data.data);
            }
        })

        axios.get('/trips/frexists/'+this.state.tripid)
        .then(res => {
            if (res.data.exists===true) {
                this.setState({
                    furtherRemarks: true,
                    remark:res.data.data
                })
            }
        })

        axios.get('/trips/bentity/'+this.state.tripid)
        .then(res=>{
            if(res.data.exists===true) {
                this.setState({
                    budgetingEntity: 2,
                    projectNumber: res.data.data
                })
            }
        })

        axios.get('/trips/destinations/'+this.state.tripid)
        .then(res=>{
            if(res.data.success===true) {
                this.setState({
                    destinations: res.data.data
                })
            }
        })
    }

    handleChange (event, tripID) {
        const driverID = event.target.value;
        var tripStatus;
        var tripInfo = this.state.tripInfo;

        if (driverID === "0") {
            tripStatus = 1;
        } else if (driverID === "cab") {
            tripStatus = 5;
        } else {
            tripStatus = 2;
        }

        axios.post('/trips/assigndriver', {
            tripID: tripID,
            driverID: driverID,
            tripStatus: tripStatus
        })
        .then (res => {
            if (res.data.status === "success") {
                tripInfo.Driver_ID = driverID;
                tripInfo.Trip_Status = tripStatus;
                this.setState ({
                    tripInfo: tripInfo,
                })
            }
        })
    }

    handleApproval (event, tripID, comment, approve) {
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

    render () {
        const tripDate = new Date(this.state.tripInfo.Trip_Date);
        const tripDateString = tripDate.getFullYear()+"-"+(tripDate.getMonth()+1)+"-"+tripDate.getDate();
        const requestedDate = new Date(this.state.tripInfo.Requested_Date);
        const requestedDateString = requestedDate.getFullYear()+"-"+(requestedDate.getMonth()+1)+"-"+requestedDate.getDate();
        
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
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Trip Type:</Col>
                    <Col sm={3}>
                        <FormControl.Static><TripTypes tripType={this.state.tripInfo.Trip_Type} /></FormControl.Static>
                    </Col>
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
                <FormGroup>
                    <Col componentClass={ControlLabel} smOffset={1} sm={2}>Budgeting Entity:</Col>
                    <BudgetingEntity budgetingEntity={this.state.budgetingEntity} projectNumber={this.state.projectNumber} />
                </FormGroup>
                <FurtherRemarks exists={this.state.furtherRemarks} remark={this.state.remark} />
                <Driver userType={this.props.userType} tripID={this.state.tripid} driverID={this.state.tripInfo.Driver_ID} tripDate={tripDate} tripStatus={this.state.tripInfo.Trip_Status} onChange={this.handleChange} />                
                <ApprovalButton userType={this.props.userType} tripStatus={this.state.tripInfo.Trip_Status} remark={this.state.remark} tripID={this.state.tripid} onApprove={this.handleApproval} />
            </Form>
        );
    }
}