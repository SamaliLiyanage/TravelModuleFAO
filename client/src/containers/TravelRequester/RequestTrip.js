import React from 'react';
import axios from 'axios';
import { Form, Col, FormControl, FormGroup, ControlLabel, Button } from 'react-bootstrap';

function FormErrors(props) {
  let formErrors = props.formErrors;
  let fieldNames = props.fieldNames;

  return(
    <div className='formErrors'>
      {fieldNames.map((fieldName, i)=>{
        if(formErrors[i].length>0) {
          return(
            <p key={i}>{fieldName} {formErrors[i]}</p>
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
      rqstrID: this.props.userName,
      tripDate: new Date(),
      tripType: 0,
      ttypeValid: false,
      tripDtValid: false,
      formErrors: ['', ''],
      formValid:false
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
      }
    })

    axios.get('/trips/lastindex')
      .then(res => {
        this.generateTripID(res.data.TripCount);
      });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const id = target.id;

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
      default:
        break;
    }

    this.setState({
      formErrors: fieldErrors,
      ttypeValid: ttypeValid,
      tripDtValid: tripDtValid
    }, this.validateForm);
  }

  validateForm(){
    this.setState({formValid: this.state.ttypeValid && this.state.tripDtValid});
  }

  getValidationState(fieldState) {
    if (fieldState) return 'success'
    else return 'error'
  }

  render() {
    const fieldNames=['Trip Date', 'Trip Type'];

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

        <FormGroup controlId="tripDate" validationState={this.getValidationState(this.state.tripDtValid)}>
          <Col sm={2} smOffset={2} componentClass={ControlLabel}>Date of Trip:</Col>
          <Col sm={4}><FormControl type="date" value={this.state.tripDate} onChange={this.handleChange} /><FormControl.Feedback /></Col>
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

        <Button name="submit" type="submit" disabled={!this.state.formValid}>Send Request</Button>

        <div>
          <FormErrors formErrors={this.state.formErrors} fieldNames={fieldNames} />
        </div>
      </Form>
    );
  }
}
