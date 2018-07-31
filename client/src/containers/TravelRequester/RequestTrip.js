import React from 'react';
import axios from 'axios';
import { Form, Col, Row, FormControl, FormGroup, ControlLabel, Button, Checkbox, Alert } from 'react-bootstrap';

function TripDuration(props) {
  //PROPS::: tripType, duration, getValidationState, durationValid, onChange
  const unit = (props.tripType==="2") ? "days" : "hours"; 
  return (
    <FormGroup controlId="tripDuration" value={props.duration} validationState={props.getValidationState(props.durationValid)}>
      <Col sm={2} componentClass={ControlLabel}>Duration: </Col>
      <Col sm={1}><FormControl type="text" onChange={(e)=>props.onChange(e)} /></Col>
      <Col sm={1}>{unit}</Col>
    </FormGroup>
  );
}

function DestinationAdd(props) {
  const destinations = props.destinations;
  const destinationTowns = props.destinationTowns;
  const destsValid = props.destsValid;

  const content = destinations.map((dest, index) => {
    return (
      <FormGroup validationState={props.getValidationState(destsValid[index])}>
        <Col sm={2} componentClass={ControlLabel}>{"Destination Stop " + (index + 1)}</Col>
        <Col sm={3}><FormControl id={"destination_" + index} type="text" value={dest} onChange={(e) => props.onChange(e, index)} /></Col>
        <Col sm={2}><FormControl id={"destination_towns_" + index} type="text" value={destinationTowns[index]} onChange={(e) => props.onChange(e, index)} /></Col>
        <Col sm={1}><Button name="add" type="button" onClick={(e) => props.onClick(e, "+", null)} disabled={(destinations.length === 4)} >+</Button>
          <Button name="add" type="button" onClick={(e) => props.onClick(e, "-", index)} disabled={(destinations.length === 1)}>-</Button></Col>
      </FormGroup>
    );
  })

  return (content);
}

function BudgetingEntity(props) {
  //PROPS:: bEntity, pNumber, bEntityValid, pNumberValid, getValidationStation, onChange
  const bEntity = props.bEntity;
  const pNumber = props.pNumber;
  const bEntityValid = props.bEntityValid;
  const pNumberValid = props.pNumberValid;

  const pCode = parseInt(bEntity, 10) === 2 ?
    <div>
      <Col sm={2} componentClass={ControlLabel} >Project Code </Col>
      <Col sm={2}><FormControl id={"projectNumber"} type="text" value={pNumber} onChange={(e) => props.onChange(e)} ></FormControl></Col>
    </div> :
    null;

  return (
    <FormGroup validationState={props.getValidationState(bEntityValid)}>
      <Col sm={2} componentClass={ControlLabel} >Budgeting Entity: </Col>
      <Col sm={3}><FormControl id={"budgetingEntity"} componentClass="select" value={bEntity} onChange={(e) => props.onChange(e)} >
        <option value="0" >Select Entity</option>
        <option value="1" >Regular Program Funded</option>
        <option value="2" >Project Funded</option>
      </FormControl></Col>
      {pCode}
    </FormGroup>
  );
}

function TimeWarning(props) {
  const today = new Date(props.date);
  var colors = { color: "#a94442", 'font-weight': 'bold' };

  if (today.getDay() < 5) {
    if (today.getHours() >= 8 && today.getHours() < 16) {
      return (null);
    } else {
      return (<div className="col-md-6 col-md-offset-3">
        <Alert bsStyle="warning"> <div style={colors}>Please note that your requests placed outside office hours may not be seen on time. Will be attended the next working day.</div></Alert>
      </div>);
    }
  } else {
    return (<div className="col-md-6 col-md-offset-3">
      <Alert bsStyle="warning"><div style={colors}>Please note that your requests placed outside office hours may not be seen on time. Will be attended the next working day.</div></Alert>
    </div>);
  }
}

function FormErrors(props) {
  let formErrors = props.formErrors;
  let fieldNames = props.fieldNames;

  return (
    <div className='formErrors row' >
      {fieldNames.map((fieldName, i) => {
        if (formErrors[i].length > 0) {
          return (
            <div className='col-md-3' >
              <Alert bsStyle="danger"><p key={i}>{fieldName} {formErrors[i]}</p></Alert>
            </div>
          );
        } else {
          return (
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
      tripDuration: 0,
      destinations: [null],
      destinationTowns: [null],
      budgetingEntity: 0,
      projectNumber: null,
      tripPurpose: null,
      fthrRemarks: "",
      ttypeValid: false,
      tripDurValid: false,
      tripDtValid: false,
      tripTmValid: false,
      destinationsValid: [false],
      destinationTownsValid: [false],
      destsValid: [false],
      destPlaceValid: false,
      destTownValid: false,
      budgetingEntityValid: false,
      projectNumberValid: false,
      prpsValid: false,
      destDisabled: false,
      remarksAdded: false,
      formErrors: ['', '', '', '', '', '', ''],
      formValid: false
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleAddRemove = this.handleAddRemove.bind(this);
    this.handleChangeDest = this.handleChangeDest.bind(this);
    this.handleBudgetingEntity = this.handleBudgetingEntity.bind(this);
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
        if (res.data == "") {
          authenticate.userHasAuthenticated(false, null, null);
          authenticate.history.push('/login')
        } else {
          authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
          if (res.data.Role === 1) {
            authenticate.history.push('/viewusers');
          } else if (res.data.Role === 2) {
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
    if (remarksAdded === false) {
      formErrors[5] = ' will cause your request be sent first to the Administrator.';
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

    let destinations = this.state.destinations;
    let destinationTowns = this.state.destinationTowns;
    let destinationsValid = this.state.destinationsValid;
    let destinationTownsValid = this.state.destinationTownsValid;
    let destsValid = this.state.destsValid;

    if (id === "tripType") {
      if (value === "4") {
        destinations[0] = "Airport";
        destinationTowns[0] = "Katunayake";
        destinationsValid[0] = true;
        destinationTownsValid[0] = true;
        destsValid[0] = true;

        this.setState({
          destinations: destinations,
          destinationTowns: destinationTowns,
          destDisabled: true,
          destinationsValid: destinationsValid,
          destinationTownsValid: destinationTownsValid,
          destsValid: destsValid
        });
      } else {
        this.setState({
          destinations: [""],
          destinationTowns: [""],
          destDisabled: false,
          destinationsValid: [false],
          destinationTownsValid: [false],
          destsValid: [false]
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
      tripDuration: this.state.tripDuration,
      tripDate: this.state.tripDate,
      tripTime: this.state.tripTime,
      tripPurpose: this.state.tripPurpose,
      furtherRmrks: this.state.fthrRemarks,
      destinations: this.state.destinations,
      destinationTowns: this.state.destinationTowns,
      budgetingEntity: this.state.budgetingEntity,
      projectNumber: this.state.projectNumber
    })
      .then(response => {
        this.props.history.push('/success/' + this.state.tripID);
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  handleAddRemove(event, text, index) {
    console.log(text);
    let destinations = this.state.destinations.slice();
    let destinationTowns = this.state.destinationTowns.slice();
    if (text === "+") {
      destinations.push(index);
      destinationTowns.push(index);
    } else if (text === "-") {
      destinations.splice(index, 1);
      destinationTowns.splice(index, 1);
    }

    this.setState({
      destinations: destinations,
      destinationTowns: destinationTowns
    })
  }

  handleChangeDest(event, index) {
    const target = event.target;
    const id = target.id;
    const value = target.value;

    let destinations = this.state.destinations.slice();
    let destinationTowns = this.state.destinationTowns.slice();
    let destinationsValid = this.state.destinationsValid.slice();
    let destinationTownsValid = this.state.destinationTownsValid.slice();
    let destsValid = this.state.destsValid.slice();

    if (id.substring(12, 13) !== 't') {
      destinations[index] = value;
      destinationsValid[index] = value.length > 0;
    } else {
      destinationTowns[index] = value;
      destinationTownsValid[index] = value.length > 0;
    }

    destsValid[index] = destinationsValid[index] && destinationTownsValid[index];

    this.setState({
      destinations: destinations,
      destinationTowns: destinationTowns,
      destinationsValid: destinationsValid,
      destinationTownsValid: destinationTownsValid,
      destsValid: destsValid
    })

  }

  handleBudgetingEntity(event) {
    const target = event.target;
    const id = target.id;
    const value = target.value;

    console.log(id, value);
  }

  validateField(fieldName, value) {
    let fieldErrors = this.state.formErrors;
    let ttypeValid = this.state.ttypeValid;
    let tripDurValid = this.state.tripDurValid;
    let tripDtValid = this.state.tripDtValid;
    let tripTmValid = this.state.tripTmValid;
    let prpsValid = this.state.prpsValid;
    let budgetingEntityValid = this.state.budgetingEntityValid;

    let getToday = new Date();
    let today = new Date(getToday.getFullYear() + "-" + (getToday.getMonth() + 1) + "-" + getToday.getDate());

    switch (fieldName) {
      case 'tripType':
        ttypeValid = !((/^0$/).test(value));
        fieldErrors[0] = ttypeValid ? '' : ' is not selected';
        break;
      case 'tripDuration':
        tripDurValid = (/^[0-9]+$/).test(value);
        fieldErrors[6] = tripDurValid ? '' : ' is not valid';
        break;
      case 'tripDate':
        var thisDate = new Date(value);
        tripDtValid = today.getTime() <= thisDate.getTime();
        fieldErrors[1] = tripDtValid ? '' : ' is not valid';
        break;
      case 'tripTime':
        tripTmValid = (this.validateTime(value, getToday.getHours(), getToday.getMinutes(), this.state.tripDate, today) && tripDtValid);
        fieldErrors[2] = tripTmValid ? '' : ' is not valid';
        break;
      case 'tripPurpose':
        prpsValid = value.length > 0;
        fieldErrors[3] = prpsValid ? '' : ' cannot be empty';
        break;
      case 'budgetingEntity':
        budgetingEntityValid = !((/^0$/).test(value));
        fieldErrors[4] = budgetingEntityValid ? '' : ' is not selected';
        break;
      default:
        break;
    }

    this.setState({
      formErrors: fieldErrors,
      ttypeValid: ttypeValid,
      tripDtValid: tripDtValid,
      tripTmValid: tripTmValid,
      tripDurValid: tripDurValid,
      prpsValid: prpsValid,
      budgetingEntityValid: budgetingEntityValid,
    }, this.validateForm);
  }

  validateTime(timeString, hour, minute, tripRawDate, today) {
    var tripDate = new Date(tripRawDate);
    var date = new Date(tripDate.getFullYear() + "-" + (tripDate.getMonth() + 1) + "-" + tripDate.getDate());
    if (today.getTime() === date.getTime()) {
      if (parseInt(timeString.substring(0, 2), 10) === hour) {
        if (parseInt(timeString.substring(3), 10) < minute) {
          return false;
        }
        return true;
      } else if (parseInt(timeString.substring(0, 2), 10) < hour) {
        return false;
      } else {
        return true;
      }
    }
    return true;
  }

  validateForm() {
    this.setState({ formValid: this.state.ttypeValid && this.state.tripDtValid && this.state.tripTmValid && this.state.tripDurValid && this.state.prpsValid && this.state.budgetingEntityValid });
  }

  getValidationState(fieldState) {
    if (fieldState) return 'success'
    else return 'error'
  }

  render() {
    const fieldNames = ['Trip Type', 'Trip Date', 'Trip Time', 'Trip Purpose', 'Budgeting Entitiy', 'Further Remarks', 'Trip Duration'];

    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <Row>
          <Col sm={6}>
            <FormGroup controlId="tripID">
              <Col sm={4} componentClass={ControlLabel}>Trip Number:</Col>
              <Col sm={6}><FormControl type="text" value={this.state.tripID} readOnly='true' /></Col>
            </FormGroup>
          </Col>

          <Col sm={6}>
            <FormGroup controlId="tripRequester">
              <Col sm={4} componentClass={ControlLabel}>Requester:</Col>
              <Col sm={6}><FormControl type="text" value={this.state.rqstrID} readOnly='true' /></Col>
            </FormGroup>
          </Col>
        </Row>

        <FormGroup controlId="tripType" validationState={this.getValidationState(this.state.ttypeValid)}>
          <Col sm={2} componentClass={ControlLabel}>Trip Type: </Col>
          <Col sm={3}><FormControl componentClass="select" value={this.state.tripType} onChange={this.handleChange}>
            <option value="0">Select type</option>
            <option value="1">City trip</option>
            <option value="2">Field trip</option>
            <option value="3">Field day trip</option>
            <option value="4">Airport</option>
          </FormControl>
            </Col>
        </FormGroup>

        <Row>
          <Col sm={6}>
            <FormGroup controlId="tripDate" validationState={this.getValidationState(this.state.tripDtValid)}>
              <Col sm={4} componentClass={ControlLabel}>Date of Trip:</Col>
              <Col sm={6}><FormControl type="date" value={this.state.tripDate} onChange={this.handleChange} /></Col>
            </FormGroup>
          </Col>
          <Col sm={6}>
            <FormGroup controlId="tripTime" validationState={this.getValidationState(this.state.tripTmValid)}>
              <Col sm={4} componentClass={ControlLabel}>Time of Trip:</Col>
              <Col sm={6}><FormControl type="time" value={this.state.tripTime} onChange={this.handleChange} /></Col>
            </FormGroup>
          </Col>
        </Row>

        <TripDuration tripType={this.state.tripType} duration={this.state.tripDuration} getValidationState={this.getValidationState} durationValid={this.state.tripDurValid} onChange={this.handleChange} />

        <DestinationAdd getValidationState={this.getValidationState} destinations={this.state.destinations} destinationTowns={this.state.destinationTowns} destsValid={this.state.destsValid} onChange={this.handleChangeDest} onClick={this.handleAddRemove} />

        <FormGroup controlId="tripPurpose" validationState={this.getValidationState(this.state.prpsValid)}>
          <Col sm={2} componentClass={ControlLabel}>Purpose of Travel:</Col>
          <Col sm={5}><FormControl type="text" value={this.state.tripPurpose} onChange={this.handleChange} /></Col>
        </FormGroup>

        <BudgetingEntity bEntity={this.state.budgetingEntity} pNumber={this.state.projectNumber} bEntityValid={this.state.budgetingEntityValid} pNumberValid={this.state.projectNumberValid} getValidationState={this.getValidationState} onChange={this.handleChange} />

        <FormGroup controlId="remarksAdded">
          <Col sm={2} smOffset={2}><Checkbox inline checked={this.state.remarksAdded} onClick={this.handleClick}>Further Remarks:</Checkbox></Col>
        </FormGroup>

        <FormGroup controlId="fthrRemarks">
          <Col sm={5} smOffset={2}><FormControl type="textarea" rows={5} value={this.state.fthrRemarks} readOnly={!(this.state.remarksAdded)} onChange={this.handleChange} /></Col>
        </FormGroup>

        <Button name="submit" type="submit" disabled={!this.state.formValid}>Send Request</Button>

        <div>
          <Row>
            <TimeWarning date={new Date()} />
          </Row>
          <FormErrors formErrors={this.state.formErrors} fieldNames={fieldNames} />
        </div>
      </Form>
    );
  }
}
