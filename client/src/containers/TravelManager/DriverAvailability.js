import React from 'react';
import { Form, FormControl, FormGroup, Grid, Row, Col, ControlLabel, Checkbox, Button, Alert, Table, Modal } from 'react-bootstrap';
import axios from 'axios';
import { DriverName, TripTypes, TripStatus } from '../../Selections';

/**
 * 
 * @param props:::formErrors - array of errors occuring in the form
 * @param props:::fieldNames - array of field names
 */
function Errors(props) {
  const formErrors = props.formErrors;

  const content = props.fieldNames.map((fieldName, i) => {
    if (formErrors[i].length > 0) {
      return (
        <Col sm={3} key={fieldName} >
          <Alert bsStyle="danger" >
            {fieldName} {formErrors[i]}
          </Alert>
        </Col>
      );
    }
  });

  return (
    <Row>
      {content}
    </Row>
  );
}

/**
 * 
 * @param props:: modalShow - show or hide model 
 * @param props:: handleDisplay - handles the show/hide property of modals
 * @param props:: trip - trip being adjusted
 * @param props:: driverChange - function to handle driver change
 */
function TripModal(props) {
  let availableDrivers = props.availableDrivers.map((driver) => {
    console.log(driver);
    return (<option key={driver} value={driver}><DriverName driverID={driver.toString()}/></option>);    
  });
  return (
    (props.trip !== null) ?
      <Modal show={props.modalShow} onHide={(e) => props.handleDisplay(e, null, false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal>
            <FormGroup controlId="tripID">
              <Col componentClass={ControlLabel} sm={4}>Trip ID:</Col>
              <Col sm={4}>
                <FormControl.Static>{props.trip.TripID}</FormControl.Static>
              </Col>
            </FormGroup>
            <FormGroup controlId="requester">
              <Col componentClass={ControlLabel} sm={4}>Requester:</Col>
              <Col sm={4}>
                <FormControl.Static>{props.trip.Username}</FormControl.Static>
              </Col>
            </FormGroup>
            <FormGroup controlId="tripDate">
              <Col componentClass={ControlLabel} sm={4}>Trip Date:</Col>
              <Col sm={4}>
                <FormControl.Static>{props.trip.Trip_Date}</FormControl.Static>
              </Col>
            </FormGroup>
            <FormGroup controlId="tripType">
              <Col componentClass={ControlLabel} sm={4}>Trip Type:</Col>
              <Col sm={4}>
                <FormControl.Static>{props.trip.Trip_Type}</FormControl.Static>
              </Col>
            </FormGroup>
            <FormGroup controlId="changeDriver">
              <Col componentClass={ControlLabel} sm={4}>Alternative Option:</Col>
              <Col sm={4}>
                <FormControl componentClass="select" onChange={(e) => props.driverChange(e, props.trip.TripID, props.tripIndex)}>
                  <option value={0}>Select option</option>
                  {availableDrivers}
                  <option value={'cab'}>Cab</option>
                </FormControl>
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={(e) => props.handleDisplay(e, null, false)}>Close</Button>
        </Modal.Footer>
      </Modal> :
      null);
}

/**
 * 
 * @param props::trips - trips that are affected 
 * @param props::handleDisplay - show/hide modal
 */
function AffectedTrips(props) {
  const trips = props.trips;
  const content = trips.map((trip, index) => {
    const tripDate = new Date(trip.Trip_Date);
    return (
      <tr key={index}>
        <td>{trip.TripID}</td>
        <td>{tripDate.getFullYear() + '-' + (tripDate.getMonth() + 1) + '-' + tripDate.getDate()}</td>
        <td><TripStatus tripStatus={trip.Trip_Status} /></td>
        <td><TripTypes tripType={trip.Trip_Type} /></td>
        <td>{trip.Username}</td>
        <td><Button name={"modal"} onClick={(e) => props.handleDisplay(e, trip, true, index)}>Change Driver</Button></td>
      </tr>
    );
  });
  return (content);
}

/**
 * 
 * @param props::trips
 * @param props::handleDisplay - show/hide modal
 */
function AffectedTripTable(props) {
  const trips = props.trips;

  const content = (
    <Table striped bordered condensed hover responsive >
      <thead>
        <tr>
          <td>Trip ID</td>
          <td>Trip Date</td>
          <td>Trip Status</td>
          <td>Trip Type</td>
          <td>Requester</td>
          <td>Change Driver</td>
        </tr>
      </thead>
      <tbody>
        <AffectedTrips trips={trips} handleDisplay={props.handleDisplay} />
      </tbody>
    </Table>
  );

  return (content);

}

/**
 * 
 * @param props::: type - type of trip
 * @param props::: onChange - what to do on change 
 * @param props::: time - time not available
 */
function SingleDayTime(props) {
  const content = parseInt(props.type, 10) === 3 ?
    <FormGroup controlId="time">
      <Col componentClass={ControlLabel} sm={4}>Time :</Col>
      <Col sm={8}>
        <FormControl type="time" value={props.time} onChange={props.onChange} />
      </Col>
    </FormGroup> :
    null;
  return (content);
}

/**
 * 
 * @param props::: type - type of trip,
 * @param props::: leaveDate - date not available
 * @param props::: onChange - what to do on change 
 * @param props::: time - time not available
 */
function SingleDay(props) {
  const content = (parseInt(props.type, 10) === 2 || parseInt(props.type, 10) === 3) ?
    <Row>
      <Col sm={3} smOffset={1}>
        <FormGroup controlId="leaveDate">
          <Col componentClass={ControlLabel} sm={4}>Date :</Col>
          <Col sm={8}>
            <FormControl type="date" value={props.leaveDate} onChange={props.onChange} />
          </Col>
        </FormGroup>
      </Col>
      <Col sm={3}>
        <SingleDayTime type={props.type} onChange={props.onChange} time={props.time} />
      </Col>
    </Row> :
    null;
  return (content);
}

/**
 * 
 * @param props::: onClick - function to call when clicking button 
 * @param props::: index - index of current
 * @param props::: length - length of array
 */
function AddButton(props) {
  const content = (props.length === (props.index + 1)) ?
    <Col sm={1}>
      <FormGroup controlId="add">
        <Button name="add" type="button" onClick={(e) => props.onClick(e, null)} >Add</Button>
      </FormGroup>
    </Col> :
    <Col sm={1}>
    </Col>;
  return (
    content
  );
}

/**
 * 
 * @param props::: onClick - function to call when clicking button
 * @param props::: index - index to remove
 * @param props::: length - length of array
 */
function RemoveButton(props) {
  const content = (props.length !== 1) ?
    <Col sm={1}>
      <FormGroup controlId="remove">
        <Button name="remove" type="button" onClick={(e) => props.onClick(e, props.index)} >Remove</Button>
      </FormGroup>
    </Col> :
    <Col sm={1}>
    </Col>;
  return (
    content
  );
}

/**
 * 
 * @param props::: indefinite - Is the time period indefinite?
 * @param props::: onClick - function to call on clicking "Add another period"
 * @param props::: onChange - function to call when input changes
 * @param props::: onDateChange - function to call when date changes
 * @param props::: length - number of this element called
 * @param props::: index - index to remove
 */
function TimeRange(props) {
  const content = (!props.indefinite) ?
    <div sm={12}>
      <Col sm={3} smOffset={1}>
        <FormGroup controlId="fromDate">
          <Col componentClass={ControlLabel} sm={4}>From :</Col>
          <Col sm={8}>
            <FormControl type="date" onChange={(e) => props.onDateChange(e, props.index)} />
          </Col>
        </FormGroup>
      </Col>
      <Col sm={3}>
        <FormGroup controlId="toDate">
          <Col componentClass={ControlLabel} sm={4}>To :</Col>
          <Col sm={8}>
            <FormControl type="date" onChange={(e) => props.onDateChange(e, props.index)} />
          </Col>
        </FormGroup>
      </Col>
      <AddButton onClick={props.onClick} index={props.index} length={props.length} />
      <RemoveButton onClick={props.onClick} index={props.index} length={props.length} />
    </div> :
    <Col sm={3} smOffset={1}>
      <FormGroup controlId="fromDateSingle">
        <Col componentClass={ControlLabel} sm={4}>From :</Col>
        <Col sm={8}>
          <FormControl type="date" onChange={(e) => props.onDateChange(e, props.index)} />
        </Col>
      </FormGroup>
    </Col>
  return (content);
}

/**
 * 
 * @param props::: indefinite - Is the time period indefinite?
 * @param props::: fromDate - fromDate array
 * @param props::: onClick - function to call on clicking "Add another period"
 * @param props::: onChange - function to call when input changes
 * @param props::: onDateChange - function to call when 
 */
function TimePeriod(props) {
  const content = props.fromDate.map((date, index) => {
    return <TimeRange key={index} indefinite={props.indefinite} onClick={props.onClick} onChange={props.onChange} onDateChange={props.onDateChange} length={props.fromDate.length} index={index} />
  });
  return (
    content
  );
}

/**
 * 
 * @param props::: type-type of trip;  
 * @param props::: indefinite - Is the time period indefinite? call when clicked
 * @param props::: onClick - function to
 * @param props::: fromDate - fromDate array
 * @param props::: onChange - function to call on clicking "Add another period"
 * @param props::: onDateChange - function to handle mutliple dates when they are changed
 */
function MultipleDays(props) {
  const content = parseInt(props.type, 10) === 1 ?
    props.fromDate.length === 1 ?
      <Row>
        <TimePeriod indefinite={props.indefinite} fromDate={props.fromDate} onClick={props.onClick} onChange={props.onChange} onDateChange={props.onDateChange} />
        <Col sm={1}>
          <FormGroup controlId="indefinite" >
            <Col>
              <Checkbox inline checked={props.indefinite} title="indefinite" onClick={props.onChange} >Indefinite</Checkbox>
            </Col>
          </FormGroup>
        </Col>
      </Row> :
      <Row>
        <TimePeriod indefinite={props.indefinite} fromDate={props.fromDate} onClick={props.onClick} onChange={props.onChange} onDateChange={props.onDateChange} />
      </Row> :
    null;
  return (content);
}

export default class DriverAvailability extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      driver: 0,
      type: 0,
      fromDate: [],
      toDate: [],
      indefinite: false,
      leaveDate: new Date(),
      time: '0:00',
      driverValid: false,
      typeValid: false,
      fromDateValid: false,
      toDateValid: false,
      leaveDateValid: false,
      timeValid: false,
      formErrors: ['', '', '', '', '', ''],
      formValid: false,
      affectedTrips: [],
      modalTrip: null,
      modalShow: false,
      tripIndex: null,
      availableDrivers: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleDriverChange = this.handleDriverChange.bind(this);
    this.handleModalPopUp = this.handleModalPopUp.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    let value = target.value;
    let id = target.id;

    let driver = this.state.driver;
    let type = this.state.type;
    let fromDate = this.state.fromDate;
    let toDate = this.state.toDate;
    let indefinite = this.state.indefinite;
    let leaveDate = this.state.leaveDate;
    let time = this.state.time;
    let toDateValid = this.state.toDateValid;

    if (id === "driver") driver = value;
    if (id === "type") {
      type = value;
      if (parseInt(value, 10) === 1) {
        fromDate.push(new Date());
        toDate.push(new Date());
      } else {
        fromDate = [];
        toDate = [];
      }
    }
    if (id === "leaveDate") leaveDate = value;
    if (id === "time") time = value;
    if (target.parentElement.title === "indefinite") {
      id = target.parentElement.title;
      value = !(indefinite);
      toDateValid = value;
      value ? toDate = [] : toDate.push(new Date());
    };

    this.setState({
      [id]: value,
      fromDate: fromDate,
      toDate: toDate,
      toDateValid: toDateValid
    }, () => { this.validateField(id, value) }
    );
  }

  handleClick(event, index) {
    let fromDate = this.state.fromDate;
    let toDate = this.state.toDate;
    let id;

    if (event.target.name === "add") {
      fromDate.push(new Date());
      toDate.push(new Date());
      id = "add";
    } else if (event.target.name === "remove") {
      fromDate.splice(index, 1);
      toDate.splice(index, 1);
      id = "remove";
    }

    this.setState({
      fromDate: fromDate,
      toDate: toDate
    }, () => { this.validateField(id, null) }
    );
  }

  handleDateChange(event, index) {
    const target = event.target;
    let value = target.value;
    let id = target.id;

    let fromDate = this.state.fromDate;
    let toDate = this.state.toDate;

    if (id === 'fromDate') fromDate[index] = value;
    else if (id === 'toDate') toDate[index] = value;

    this.setState({
      fromDate: fromDate,
      toDate: toDate
    }, () => this.validateField(id, value, index));
  }

  handleDriverChange(event, tripID, index) {
    let driverID = event.target.value;
    let tripStatus;
    
    if (driverID === 0) {
      tripStatus = 1;
    } else if (driverID === "cab") {
      tripStatus = 5;
    } else {
      tripStatus = 2;
    }

    axios.post('/trips/assigndriver', {
      tripID: tripID,
      driverID: driverID,
      tripStatus: tripStatus,
    })
      .then((response) => {
        if (response.data.status === "success" && index !== null) {
          let trips = this.state.affectedTrips;
          trips.splice(index, 1);

          this.setState({
            affectedTrips: trips,
          });
        }
      })
  }

  handleModalPopUp(event, trip, show, index) {
    if(trip) {
      axios.post('/drivers/reassign', {
        startTime:trip.Trip_Time,
        durationHrs: trip.Duration,
        durationMins: trip.Duration_Minute,
        tripDate: trip.Trip_Date
      })
      .then((res) => {
        console.log(res.data);
        this.setState({
          modalTrip: trip,
          modalShow: show,
          tripIndex: index,
          availableDrivers: res.data
        });
      })
    } else {
      this.setState({
        modalTrip: trip,
        modalShow: show,
        tripIndex: null,
        availableDrivers: []
      });
    }
  }

  validateField(fieldName, value, index = 0) {
    let driverValid = this.state.driverValid;
    let typeValid = this.state.typeValid;
    let fromDateValid = this.state.fromDateValid;
    let toDateValid = this.state.toDateValid;
    let leaveDateValid = this.state.leaveDateValid;
    let timeValid = this.state.timeValid;
    let formErrors = this.state.formErrors;

    let tempDate = new Date();
    let today = new Date(tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate());

    switch (fieldName) {
      case 'driver':
        driverValid = !((/^0$/).test(value));
        formErrors[0] = driverValid ? '' : ' has not been selected.';
        break;
      case 'type':
        typeValid = !((/^0$/).test(value));
        formErrors[1] = typeValid ? '' : ' has not been selected.';
        break;
      case 'fromDate':
        let toDateTemp = this.state.toDate;
        let tempDate_0 = new Date(toDateTemp[index]);
        let toDate_1 = new Date(tempDate_0.getFullYear() + '-' + (tempDate_0.getMonth() + 1) + '-' + tempDate_0.getDate());
        let fromDate = new Date(value);
        fromDateValid = (today.getTime() <= fromDate.getTime());
        formErrors[2] = fromDateValid ? '' : ' is invalid.';
        toDateValid = (fromDate.getTime() < toDate_1.getTime());
        formErrors[3] = toDateValid ? '' : ' is invalid.';
        break;
      case 'toDate':
        let fromDateTemp = this.state.fromDate;
        let tempDate_1 = new Date(fromDateTemp[index]);
        let fromDate_1 = new Date(tempDate_1.getFullYear() + '-' + (tempDate_1.getMonth() + 1) + '-' + tempDate_1.getDate());
        let toDate = new Date(value);
        toDateValid = (fromDate_1.getTime() < toDate.getTime());
        formErrors[3] = toDateValid ? '' : ' is invalid.';
        break;
      case 'leaveDate':
        let leaveDate = new Date(value);
        leaveDateValid = (today.getTime() <= leaveDate.getTime());
        formErrors[4] = leaveDateValid ? '' : ' is invalid.';
        timeValid = (today.getTime() !== leaveDate.getTime());
        formErrors[5] = timeValid ? '' : ' is invalid.';
        break;
      case 'fromDateSingle':
        let fromDate_2 = new Date(value);
        fromDateValid = (today.getTime() <= fromDate_2.getTime());
        formErrors[2] = fromDateValid ? '' : ' is invalid.';
        break;
      case 'time':
        let tempDate_2 = new Date(this.state.leaveDate);
        let leaveDate_1 = new Date(tempDate_2.getFullYear() + '-' + (tempDate_2.getMonth() + 1) + '-' + tempDate_2.getDate());
        timeValid = ((today.getTime() === leaveDate_1.getTime()) && (parseInt(this.state.type, 10)===3)) ?
          (parseInt(value.substr(0, 2), 10) >= tempDate.getHours()) ?
            (parseInt(value.substr(3, 5), 10) > tempDate.getMinutes()) :
            false :
          (tempDate.getTime() < leaveDate_1.getTime());
        formErrors[5] = timeValid ? '' : ' is invalid.';
        break;
      case 'add':
        fromDateValid = false;
        toDateValid = false;
        break;
      case 'indefinite':
        fromDateValid = false;
        formErrors[3] = '';
        break;
      default:
        break;
    }

    this.setState({
      driverValid: driverValid,
      typeValid: typeValid,
      fromDateValid: fromDateValid,
      toDateValid: toDateValid,
      leaveDateValid: leaveDateValid,
      timeValid: timeValid,
      formErrors: formErrors
    }, this.validateForm);
  }

  validateForm() {
    let tempDates = [];
    let temp, endTemp;
    let datesArray;

    this.state.fromDate.map((date, index) => {
      temp = new Date(date);
      endTemp = new Date(this.state.toDate[index]);
      var dt = new Date(temp);
      while (dt <= endTemp) {
        tempDates.push(dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate());
        dt.setDate(dt.getDate() + 1);
      }
      return (tempDates);
    });

    (parseInt(this.state.type, 10) === 1) ?
      datesArray = tempDates :
      datesArray = [this.state.leaveDate];

    if (parseInt(this.state.driver, 10) !== 0 && parseInt(this.state.type, 10) !== 0) {
      axios.post('/drivers/gettrips', {
        leaveDate: datesArray,
        leaveType: this.state.type,
        driverID: this.state.driver
      })
        .then((resp) => {
          if (resp.data.status === 'success') {
            this.setState({
              affectedTrips: resp.data.data
            });
          }
        })
    }

    this.setState({
      formValid:
        this.state.driverValid &&
        this.state.typeValid &&
        ((this.state.fromDateValid && this.state.toDateValid) || this.state.leaveDateValid)
    });
  }

  render() {
    const fieldNames = ['Driver name', 'Leave type', 'Leave start date', 'Leave end date', 'Leave date', 'Time'];

    return (
      <Form horizontal>
        <Grid>
          <Row className="show-grid">
            <Col sm={12}>
              <Row>
                <Col sm={6}>
                  <FormGroup controlId="driver">
                    <Col componentClass={ControlLabel} sm={4}>Select driver :</Col>
                    <Col sm={8}>
                      <FormControl componentClass="select" value={this.state.driver} onChange={this.handleChange} >
                        <option value={0}>Select driver</option>
                        <option value={1}>Anthony</option>
                        <option value={2}>Ruchira</option>
                        <option value={3}>Dinesh</option>
                      </FormControl>
                    </Col>
                  </FormGroup>
                </Col>
                <Col sm={6}>
                  <FormGroup controlId="type">
                    <Col componentClass={ControlLabel} sm={4}>Type of unavailability :</Col>
                    <Col sm={8}>
                      <FormControl componentClass="select" value={this.state.type} onChange={this.handleChange}>
                        <option value={0}>Select type</option>
                        <option value={1}>Multiple days</option>
                        <option value={2}>Full day</option>
                        <option value={3}>Half day</option>
                      </FormControl>
                    </Col>
                  </FormGroup>
                </Col>
              </Row>
              <MultipleDays type={this.state.type} indefinite={this.state.indefinite} onClick={this.handleClick} fromDate={this.state.fromDate} onChange={this.handleChange} onDateChange={this.handleDateChange} />
              <SingleDay type={this.state.type} leaveDate={this.state.leaveDate} onChange={this.handleChange} />

            </Col>
          </Row>
          <Row className="show-grid">
            <Col sm={12}>
              Affected Trips
              <AffectedTripTable trips={this.state.affectedTrips} handleDisplay={this.handleModalPopUp} />
              <FormGroup controlId="submit">
                <Button name="submit" type="submit" onClick={(e) => { console.log(e.target.name) }} disabled={!this.state.formValid}>Submit</Button>
              </FormGroup>
              <TripModal modalShow={this.state.modalShow} handleDisplay={this.handleModalPopUp} trip={this.state.modalTrip} availableDrivers={this.state.availableDrivers} driverChange={this.handleDriverChange} tripIndex={this.state.tripIndex} />
            </Col>
          </Row>
          <Row className="show-grid">
            <Col sm={12}>
              <Errors formErrors={this.state.formErrors} fieldNames={fieldNames} />
            </Col>
          </Row>
        </Grid>
      </Form>
    );
  }
}
