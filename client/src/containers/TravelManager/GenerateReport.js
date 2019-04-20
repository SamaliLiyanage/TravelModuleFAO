import React from 'react';
import axios from 'axios';
import { Table, Col, ControlLabel, Form, FormControl, FormGroup, Modal, Checkbox, Button } from "react-bootstrap";
import { DriverName, TripTypes } from "../../Selections";

function DriverList(props) {
    const driverList = props.driverList;
    const selectedDrivers = props.selectedDrivers;

    const driverCheckList = driverList.map((driver) => {
        return(
            <Checkbox
                inline 
                checked={selectedDrivers.includes(driver.Username)} 
                title={"driver"} 
                onClick={(e) => {props.onClick(e, driver.Username)}} 
                onChange={(e) => {props.onChange(e)}}
            >
                {driver.Full_Name}
            </Checkbox> 
        );
    });

    return driverCheckList;
}

function TripTypeList(props) {
    const tripTypeList = ["City Trip", "Field Trip", "Field Day Trip", "Airport"];
    const selectedTripTypes = props.selectedTripTypes;

    const tripTypeCheckList = tripTypeList.map((tripType, index) => {
        return(
            <Checkbox 
                inline 
                checked={selectedTripTypes.includes((index + 1))} 
                title={"type"} 
                onClick={(e) => {props.onClick(e, (index + 1))}}
                onChange={(e) => {props.onChange(e)}}
            >
                {tripType}
            </Checkbox>
        );
    });

    return tripTypeCheckList;
}

function TripStatusList(props) {
    const tripStatusesList = ["Pending", "Assigned", "Started", "Completed", "Cab Assigned", "Awaiting Approval", "Cancelled"];
    const selectedTripStatuses = props.selectedTripStatuses;

    const tripStatusesCheckList = tripStatusesList.map((tripStatus, index) => {
        return(
            <Checkbox 
                inline 
                checked={selectedTripStatuses.includes((index + 1))} 
                title={"status"} 
                onClick={(e) => {props.onClick(e, (index + 1))}}
                onChange={(e) => {props.onChange(e)}}
            >
                {tripStatus}
            </Checkbox>
        );
    });

    return tripStatusesCheckList;
}

function QueryModal(props) {
    const handleDataGeneration = props.handleDataGeneration;
    const driverList = props.driverList;
    const drivers = props.drivers;
    const handleDriverSelect = props.handleDriverSelect;
    const tripTypes = props.tripTypes;
    const handleTripTypeSelect = props.handleTripTypeSelect;
    const tripStatuses = props.tripStatuses;
    const handleTripStatusSelect = props.handleTripStatusSelect;
    const startDate = props.startDate;
    const handleDateChange = props.handleDateChange;
    const endDate = props.endDate;
    const getReportData = props.getReportData;
    const handleModalShow = props.handleModalShow;
    const showModal = props.showModal;
    const handleValidation = props.handleValidation;
    const canQuery = props.canQuery;
    const driverValid = props.driverValid;
    const typeValid = props.typeValid;
    const statusValid = props.statusValid;
    const dateValid = props.dateValid;

    return (
        <Modal show={showModal}>
            <Modal.Header closeButton>
                <Modal.Title>Specify Criteria</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form horizontal onSubmit={handleDataGeneration}>
                    <FormGroup controlId="driverList" validationState={driverValid ? 'success': 'error'}>
                        <Col componentClass={ControlLabel} sm={3}> Driver List: </Col>
                        <Col sm={9} >
                            <DriverList driverList={driverList} selectedDrivers={drivers} onClick={handleDriverSelect} onChange={handleValidation} />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="tripTypeList" validationState={typeValid ? 'success': 'error'}>
                        <Col componentClass={ControlLabel} sm={3}> Trip Type List: </Col>
                        <Col sm={9} >
                            <TripTypeList selectedTripTypes={tripTypes} onClick={handleTripTypeSelect} onChange={handleValidation} />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="tripStatusList" validationState={statusValid ? 'success': 'error'}>
                        <Col componentClass={ControlLabel} sm={3}> Trip Status List: </Col>
                        <Col sm={9} >
                            <TripStatusList selectedTripStatuses={tripStatuses} onClick={handleTripStatusSelect} onChange={handleValidation} />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="startDate" validationState={dateValid? 'success': 'error'}>
                        <Col componentClass={ControlLabel} sm={3}> Report Start Date: </Col>
                        <Col sm={5} >
                            <FormControl type="date" value={startDate} onChange={(e) => {handleDateChange(e)}} />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="endDate" validationState={dateValid? 'success': 'error'}>
                        <Col componentClass={ControlLabel} sm={3}> Report End Date: </Col>
                        <Col sm={5} >
                            <FormControl type="date" value={endDate} onChange={(e) => {handleDateChange(e)}} />
                        </Col>
                    </FormGroup>
                    <Button name="submit" type="button" disabled={canQuery !== true} onClick={(e) => {getReportData(e)}}>Generate Report</Button>
                </Form>
            </Modal.Body>    
            <Modal.Footer>
				<Button onClick={(e) => handleModalShow(e)} >Close</Button>
			</Modal.Footer>
        </Modal>
    );
}

function ReportRow(props) {
    const tripData = props.tripData;
    const driverTuple = props.driverTuple;

    let tripDate = new Date(tripData.Trip_Date);

    if(parseInt(tripData.Trip_Status, 10) === 4) {
        return (
            <tr key={tripData.TripID}>
                <td>{tripData.TripID}</td>
                <td><TripTypes tripType={tripData.Trip_Type} /></td>
                <td><DriverName driverID={tripData.Driver_ID} driverTuple={driverTuple} /></td>
                <td>{tripDate.getFullYear() + "-" + (tripDate.getMonth() + 1) + "-" + tripDate.getDate()}</td>
                <td>{(parseInt(tripData.End_Mileage, 10) - parseInt(tripData.Start_Mileage, 10)) + " km"}</td>
            </tr>
        );
    } else {
        return (
            <tr key={tripData.TripID}>
                <td>{tripData.TripID}</td>
                <td><TripTypes tripType={tripData.Trip_Type} /></td>
                <td><DriverName driverID={tripData.Driver_ID} driverTuple={driverTuple} /></td>
                <td>{tripDate.getFullYear() + "-" + (tripDate.getMonth() + 1) + "-" + tripDate.getDate()}</td>
                <td>{"N/A"}</td>
            </tr>
        );
    }
}

function ReportTable(props) {
    const reportData = props.reportData;

    const content = reportData.map((data) => {
        return(
            <ReportRow tripData = {data} driverTuple={props.driverTuple} />
        );
    });

    return(
        <Table striped bordered condensed hover responsive >
            <thead>
            <tr className="table-danger">
                <th>Trip ID</th>
                <th>Trip Type</th>
                <th>Driver</th>
                <th>Trip Date</th>
                <th>Trip Mileage</th>
            </tr>
            </thead>
            <tbody>
                {content}
            </tbody>
        </Table>
    );
}

export default class GenerateReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drivers: [],
            tripTypes: [],
            tripStatuses: [],
            startDate: null,
            endDate: null,
            reportData: [],
            driverList: [],
            driverTuple: {},
            showModal: true,
            driverValid: null,
            typeValid: null,
            statusValid: null,
            dateValid: null,
            messageArray: ['', '', '', ''],
            canQuery: false,
        };

        this.getReportData = this.getReportData.bind(this);
        this.handleDriverSelect = this.handleDriverSelect.bind(this);
        this.handleTripTypeSelect = this.handleTripTypeSelect.bind(this);
        this.handleTripStatusSelect = this.handleTripStatusSelect.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleModalShow = this.handleModalShow.bind(this);
        this.handlePrint = this.handlePrint.bind(this);
        this.handleValidation = this.handleValidation.bind(this);
    }

    componentDidMount() {
        axios.get('/users/Role/3').then((res) => {
            let drivers = { '0': 'Unassigned', 'cab': 'Cab Assigned' };
            res.data.forEach((driverDetail) => {
                drivers[driverDetail.Username] = driverDetail.Full_Name.split(" ")[0];
            });
            this.setState({
                driverList: res.data,
                driverTuple: drivers,
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    getReportData(event) {
        let driverQuery = "";
        const driverCount = this.state.drivers.length;
        this.state.drivers.forEach((driver, index) => {
            if (driverCount === (index + 1)) {
                driverQuery += "'" + driver + "'";    
            } else {
                driverQuery += "'" + driver + "',"
            }
        });
        axios.get('/trips/generateReportData?drivers=[' + driverQuery +
            ']&tripTypes=[' + this.state.tripTypes +
            ']&tripStatuses=[' + this.state.tripStatuses +
            ']&startDate=\'' + this.state.startDate +
            '\'&endDate=\'' + this.state.endDate + '\'',
        ).then((reportData) => {
            if (reportData.data.status === "success") {
                this.setState({
                    reportData: reportData.data.result,
                    showModal: false,
                });
            } else {
                console.log("Query failed");
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    handleDriverSelect(event, driverUName) {
        let drivers = this.state.drivers;
        if (drivers.includes(driverUName)) {
            drivers.splice(drivers.indexOf(driverUName), 1);
        } else {
            drivers.push(driverUName);
        }

        this.setState({
            drivers: drivers,
        });
    }

    handleTripTypeSelect(event, tripType) {
        let tripTypes = this.state.tripTypes;
        if (tripTypes.includes(tripType)) {
            tripTypes.splice(tripTypes.indexOf(tripType), 1);
        } else {
            tripTypes.push(tripType);
        }

        this.setState({
            tripTypes: tripTypes,
        });
    }

    handleTripStatusSelect(event, tripStatus) {
        let tripStatuses = this.state.tripStatuses;
        if (tripStatuses.includes(tripStatus)) {
            tripStatuses.splice(tripStatuses.indexOf(tripStatus), 1);
        } else {
            tripStatuses.push(tripStatus);
        }

        this.setState({
            tripStatuses: tripStatuses,
        });
    }

    handleDateChange(event) {
        const target = event.target;
		let value = target.value;
        let id = target.id;
        
        let startDate = this.state.startDate;
        let endDate = this.state.endDate;

        if(id === "startDate") {
            if (value === "") {
                startDate = null;
            } else {
                startDate = value;
            }
        } else if (id === "endDate") {
            if (value === "") {
                endDate = null;
            } else {
                endDate = value;
            }
        }

        this.handleValidation(event);

        this.setState({
            startDate: startDate,
            endDate: endDate,
        });
    }

    handleModalShow(event) {
        const showModal = !(this.state.showModal);
        
        this.setState({
            showModal:showModal,
        });
    }

    handlePrint(event) {
        this.props.history.push({
            pathname: '/printReport',
            state: this.state.reportData
        });
    }

    handleValidation(event) {
        const target = event.target;

        let drivers = this.state.drivers;
        let tripTypes = this.state.tripTypes;
        let tripStatuses = this.state.tripStatuses;
        let startDate = this.state.startDate;
        let endDate = this.state.endDate;
        
        let driverValid = this.state.driverValid;
        let typeValid = this.state.typeValid;
        let statusValid = this.state.statusValid;
        let dateValid = this.state.dateValid;
        
        let messageArray = this.state.messageArray;

        if (target.type === "checkbox") {
            switch(target.parentElement.title) {
                case 'driver':
                    driverValid = (drivers.length === 0) ? false: true;
                    messageArray[0] = driverValid ? '': 'At least one driver should be selected';
                    break;
                case 'type':
                    typeValid = (tripTypes.length === 0) ? false: true;
                    messageArray[1] = typeValid ? '': 'At least one trip type should be selected';
                    break;
                case 'status':
                    statusValid = (tripStatuses.length === 0) ? false: true;
                    messageArray[2] = statusValid ? '': 'At least one status should be selected';
                    break;
            }   
        } else {
            switch(target.id) {
                case 'startDate':
                    if (endDate === null) {
                        dateValid = null;
                    } else if (endDate <= target.value) {
                        dateValid = false;
                    } else {
                        dateValid = true;
                    }
                    break;
                case 'endDate':
                    if (startDate === null) {
                        dateValid = false;
                    } else if (target.value <= startDate) {
                        dateValid = false;
                    } else {
                        dateValid = true;
                    }
                    break;
            }  
        }

        this.setState({
            driverValid: driverValid,
            typeValid: typeValid,
            statusValid: statusValid,
            messageArray: messageArray,
            dateValid: dateValid,
            canQuery: (driverValid && typeValid && statusValid && dateValid),
        });
    }

    render() {
        return(
            <div>
                <Form horizontal>
                    <Button name="button" type="button" onClick={(e) => {this.handleModalShow(e)}}>Change Search</Button>
                    <Button name="button" type="button" onClick={(e) => {this.handlePrint(e)}}>Print Report</Button>
                </Form>
                <QueryModal 
                    handleDataGeneration = {this.handleDataGeneration}
                    driverList = {this.state.driverList}
                    drivers = {this.state.drivers} 
                    handleDriverSelect = {this.handleDriverSelect} 
                    tripTypes = {this.state.tripTypes} 
                    handleTripTypeSelect = {this.handleTripTypeSelect} 
                    tripStatuses = {this.state.tripStatuses} 
                    handleTripStatusSelect = {this.handleTripStatusSelect} 
                    startDate = {this.state.startDate} 
                    handleDateChange = {this.handleDateChange} 
                    endDate = {this.state.endDate} 
                    getReportData = {this.getReportData} 
                    handleModalShow = {this.handleModalShow}
                    showModal = {this.state.showModal}
                    handleValidation = {this.handleValidation}
                    canQuery = {this.state.canQuery}
                    driverValid = {this.state.driverValid}
                    typeValid = {this.state.typeValid}
                    statusValid = {this.state.statusValid}
                    dateValid = {this.state.dateValid}
                />
                <ReportTable reportData={this.state.reportData} driverTuple={this.state.driverTuple} />
            </div>
        );
    }
}