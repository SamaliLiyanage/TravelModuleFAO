import React from 'react';
import axios from 'axios';
import { Form, Col, FormControl, FormGroup, ControlLabel, Button, Checkbox, Alert } from 'react-bootstrap';

function TimeWarning(props) {
  const today = new Date(props.date);
  if (today.getDay()<5) {
    if (today.getHours()>=8 && today.getHours()<16) {
      return (null);
    } else {
      return (<div className="col-md-6 col-md-offset-3">
      <Alert bsStyle="warning">Please note that your requests placed outside office hours may not be processed in time or may not be seen by the driver</Alert>
    </div>);
    }
  } else {
    return (<div className="col-md-6 col-md-offset-3">
    <Alert bsStyle="warning">Please note that your requests placed outside office hours may not be processed in time or may not be seen by the driver</Alert>
  </div>);
  }
}

function FormErrors(props) {
  let formErrors = props.formErrors;
  let fieldNames = props.fieldNames;

  return(
    <div className='formErrors row' >
      {fieldNames.map((fieldName, i)=>{
        if(formErrors[i].length>0) {
          return(
            <div className='col-md-3' > 
              <Alert bsStyle="danger"><p key={i}>{fieldName} {formErrors[i]}</p></Alert>
            </div>
          );
        } else {
          return(
            null
          );
        }
      })}
    </div>
  );
}

export default class RequestTrip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      temp: 0,
      tripID: 0,
      rqstrID: null,
      tripDate: new Date(),
      tripTime: "--:--",
      tripType: 0,
      destination: null,
      tripPurpose: null,
      fthrRemarks: "",
      ttypeValid: false,
      tripDtValid: false,
      tripTmValid: false,
      destValid: false,
      prpsValid: false,
      destDisabled: false,
      remarksAdded: false,
      formErrors: ['', '', '', '', '', ''],
      formValid:false
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.generateTripID = this.generateTripID.bind(this);
  }

  generateTripID(nextidx) {
    var date = new Date();

    var month = "";
    var dates = "";
    var idx = "";

    if (date.getMonth().toString().length === 1) {
      month = '0' + (date.getMonth() + 1).toString();
    } else {
      month = (date.getMonth() + 1).toString();
    }

    if (date.getDate().toString().length === 1) {
      dates = '0' + date.getDate().toString();
    } else {
      dates = date.getDate().toString();
    }

    if (nextidx.toString().length === 1) {
      idx = '00' + nextidx;
    } else if (nextidx.toString().length === 2) {
      idx = '0' + nextidx;
    } else {
      idx = nextidx;
    };

    const index = date.getFullYear().toString().substring(2, 4) + "" + month + "" + dates + "" + idx;

    this.setState({
      tripID: index,
    });
  }

  componentDidMount() {
    const authenticate = this.props;
    
    axios.get('/loggedin')
    .then(res => {
      if(res.data==""){
        authenticate.userHasAuthenticated(false, null, null);
        authenticate.history.push('/login')
      } else {
        authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
        if(res.data.Role===1) {
          authenticate.history.push('/viewusers');
        } else if (res.data.Role===2) {
          authenticate.history.push('/viewtrips');
        }
        this.setState({
          rqstrID: res.data.Username,
        });
      }
    })

    axios.get('/trips/lastindex')
    .then(res => {
      this.generateTripID(res.data.TripCount);
    });
  }

  handleClick(event) {
    const remarksAdded = this.state.remarksAdded;
    const formErrors = this.state.formErrors;
    if (remarksAdded===false) {
      formErrors[5]= ' will first cause your request be sent first to the Administrator.';
    } else {
      formErrors[5] = '';
    }

    this.setState({
      remarksAdded: !(remarksAdded),
      formErrors: formErrors
    })
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const id = target.id;

    if (id==="tripType") {
      if(value==="4"){
        this.setState({
          destination: "Airport",
          destDisabled: true,
          destValid: true
        });
      } else {
        this.setState({
          destination: "",
          destDisabled: false,
          destValid:false
        });
      }
    }

    this.setState(
      { [id]: value },
      () => { this.validateField(id, value) }
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    axios.post('/trips/new', {
      tripID: this.state.tripID,
      username: this.state.rqstrID,
      tripType: parseInt(this.state.tripType, 10),
      tripDate: this.state.tripDate,
      tripTime: this.state.tripTime,
      destination: this.state.destination,
      tripPurpose: this.state.tripPurpose,
      furtherRmrks: this.state.fthrRemarks,
    })
      .then(response => {
        this.props.history.push('/success/' + this.state.tripID);
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  validateField(fieldName, value) {
    let fieldErrors = this.state.formErrors;
    let ttypeValid = this.state.ttypeValid;
    let tripDtValid = this.state.tripDtValid;
    let tripTmValid = this.state.tripTmValid;
    let destValid = this.state.destValid;
    let prpsValid = this.state.prpsValid;

    let getToday = new Date();
    let today = new Date(getToday.getFullYear()+"-"+(getToday.getMonth()+1)+"-"+getToday.getDate());

    switch (fieldName) {
      case 'tripType':
        ttypeValid = !((/^0$/).test(value));
        fieldErrors[0] = ttypeValid ? '' : ' is not selected';
        break;
      case 'tripDate':
        var thisDate = new Date(value);
        tripDtValid = today.getTime()<=thisDate.getTime();
        fieldErrors[1] = tripDtValid ? '' : ' is not valid';
        break;
      case 'tripTime':
        tripTmValid = this.validateTime(value, getToday.getHours(), getToday.getMinutes(), this.state.tripDate, today);
        fieldErrors[2] = tripTmValid ? '' : ' is not valid';
        break;
      case 'destination':
        destValid = value.length>0;
        fieldErrors[3] = destValid ? '' : ' cannot be empty';
        break;
      case 'tripPurpose':
        prpsValid = value.length>0;
        fieldErrors[4] = prpsValid ? '' : ' cannot be empty'
        break;
      default:
        break;
    }

    this.setState({
      formErrors: fieldErrors,
      ttypeValid: ttypeValid,
      tripDtValid: tripDtValid,
      tripTmValid: tripTmValid,
      destValid: destValid,
      prpsValid: prpsValid,
    }, this.validateForm);
  }

  validateTime(timeString, hour, minute, tripRawDate, today){
    var tripDate = new Date(tripRawDate);
    var date = new Date(tripDate.getFullYear()+"-"+(tripDate.getMonth()+1)+"-"+tripDate.getDate());
    if(today.getTime()===date.getTime()){
      if(parseInt(timeString.substring(0,2), 10)===hour){
        if(parseInt(timeString.substring(3), 10)<minute){
          return false;
        }
        return true;
      } else if (parseInt(timeString.substring(0,2), 10)<hour){
        return false;
      } else {
        return true;
      }
    }
    return true;
  }

  validateForm(){
    this.setState({formValid: this.state.ttypeValid && this.state.tripDtValid && this.state.tripTmValid && this.state.destValid && this.state.prpsValid });
  }

  getValidationState(fieldState) {
    if (fieldState) return 'success'
    else return 'error'
  }

  render() {
    const fieldNames=['Trip Type', 'Trip Date', 'Trip Time', 'Destination', 'Trip Purpose', 'Further Remarks'];

    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormGroup controlId="tripID">
          <Col sm={2} smOffset={2} componentClass={ControlLabel}>Trip Number:</Col>
          <Col sm={4}><FormControl type="text" value={this.state.tripID} readOnly='true' /></Col>
        </FormGroup>

        <FormGroup controlId="tripRequester">
          <Col sm={2} smOffset={2} componentClass={ControlLabel}>Requester:</Col>
          <Col sm={4}><FormControl type="text" value={this.state.rqstrID} readOnly='true' /></Col>
        </FormGroup>

        <FormGroup controlId="tripType" validationState={this.getValidationState(this.state.ttypeValid)}>
          <Col sm={2} smOffset={2} componentClass={ControlLabel}>Trip Type: </Col>
          <Col sm={4}><FormControl componentClass="select" value={this.state.tripType} onChange={this.handleChange}>
            <option value="0">Select type</option>
            <option value="1">Day trip</option>
            <option value="2">Field trip</option>
            <option value="3">Field day trip</option>
            <option value="4">Airport</option>
          </FormControl>
          <FormControl.Feedback /></Col>
        </FormGroup>

        <FormGroup controlId="tripDate" validationState={this.getValidationState(this.state.tripDtValid)}>
          <Col sm={2} smOffset={2} componentClass={ControlLabel}>Date of Trip:</Col>
          <Col sm={4}><FormControl type="date" value={this.state.tripDate} onChange={this.handleChange} /><FormControl.Feedback /></Col>
        </FormGroup>

        <FormGroup controlId="tripTime" validationState={this.getValidationState(this.state.tripTmValid)}>
          <Col sm={2} smOffset={2} componentClass={ControlLabel}>Time of Trip:</Col>          
          <Col sm={4}><FormControl type="time" value={this.state.tripTime} onChange={this.handleChange} /><FormControl.Feedback /></Col>
        </FormGroup>

        <FormGroup controlId="destination" validationState={this.getValidationState(this.state.destValid)}>
          <Col sm={2} smOffset={2} componentClass={ControlLabel}>Destination:</Col>
          <Col sm={4}><FormControl type="text" value={this.state.destination} onChange={this.handleChange} readOnly={this.state.destDisabled} /><FormControl.Feedback /></Col>
        </FormGroup>

        <FormGroup controlId="tripPurpose" validationState={this.getValidationState(this.state.prpsValid)}>
          <Col sm={2} smOffset={2} componentClass={ControlLabel}>Purpose of Travel:</Col>
          <Col sm={4}><FormControl type="text" value={this.state.tripPurpose} onChange={this.handleChange} /><FormControl.Feedback /></Col>
        </FormGroup>

        <FormGroup controlId="remarksAdded">
          <Col sm={2} smOffset={4}><Checkbox inline checked={this.state.remarksAdded} onClick={this.handleClick}>Further Remarks:</Checkbox></Col>
        </FormGroup>

        <FormGroup controlId="fthrRemarks">
          <Col sm={4} smOffset={4}><FormControl type="textarea" rows={5} value={this.state.fthrRemarks} readOnly={!(this.state.remarksAdded)} onChange={this.handleChange} /></Col>
        </FormGroup>

        <Button name="submit" type="submit" disabled={!this.state.formValid}>Send Request</Button>

        <div>
          <TimeWarning date={new Date()} />
          <FormErrors formErrors={this.state.formErrors} fieldNames={fieldNames} />
        </div>
      </Form>
    );
  }
}
