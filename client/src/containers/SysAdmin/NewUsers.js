import React from 'react';
import axios from 'axios';
import {Form, Col, FormGroup, ControlLabel, FormControl, Button, Alert} from 'react-bootstrap';

function FormErrors (props){
  let formErrors = props.formErrors;
  let fieldNames = props.fieldNames;
  return (
    <div className='formErrors'>
      {fieldNames.map((fieldName, i) => {
        if(formErrors[i].length > 0){
          return (
            <Alert bsStyle="danger"><p key={i}>{fieldName} {formErrors[i]}</p></Alert>
          );
        } else {
          return '';
        }
      })}
  </div>)
}

export default class UserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      realName: '',
      userName: '',
      passWord: '',
      telePhone: null,
      role: 0,
      tripsForFAOR: 0,
      generateReport: 0,
      formErrors: ['', '', '', '', ''],
      rnValid: false,
      unValid: false,
      pwValid: false,
      tpValid: false,
      rlValid: false,
      formValid: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const id = target.id;

    this.setState(
      {[id]: value},
      () => {this.validateField(id,value)}
    );
  }

  handleSubmit(event) {
    event.preventDefault();
    const authenticate = this.props;

    axios.post('/users/new', {
        userName: this.state.userName,
        realName: this.state.realName,
        passWord: this.state.passWord,
        telePhone: this.state.telePhone,
        role: parseInt(this.state.role, 10),
        tripsForFAOR: this.state.tripsForFAOR,
        generateReport: this.state.generateReport,
      })
      .then(function (response) {
        //console.log("Response", response);
        authenticate.history.push('/viewusers');
      })
      .catch(function (error) {
        //console.log("Response", error);
      })
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let rnValid = this.state.rnValid;
    let unValid = this.state.unValid;
    let pwValid = this.state.pwValid;
    let tpValid = this.state.tpValid;
    let rlValid = this.state.rlValid;

    switch(fieldName) {
      case 'realName':
        rnValid = (/^(?:([a-zA-Z ]+))$/).test(value);
        fieldValidationErrors[0] = rnValid ? '':' is invalid';
        break;
      case 'userName':
        unValid = (/^([\w\.0-9]+)@([\w]+)(\.)([\w]+)$/).test(value);
        fieldValidationErrors[1] = unValid ? '':' is invalid';
        break;
      case 'passWord':
        pwValid = (value.length >=6);
        fieldValidationErrors[2] = pwValid ? '': ' is too short';
        break;
      case 'telePhone':
        tpValid = !(value.length < 9);
        fieldValidationErrors[3] = tpValid ? '': ' is invalid';
        break;
      case 'role':
        rlValid = !((/^0$/).test(value));
        fieldValidationErrors[4] = rlValid ? '': ' is not selected';
        break;
      default:
        break;
    }
    this.setState({
      formErrors: fieldValidationErrors,
      rnValid: rnValid,
      unValid: unValid,
      pwValid: pwValid,
      tpValid: tpValid,
      rlValid: rlValid
    }, this.validateForm);
  }

  validateForm(){
    this.setState({formValid: this.state.rnValid && this.state.unValid && this.state.pwValid && this.state.tpValid && this.state.rlValid});
  }

  getValidationState(fieldState) {
    if (fieldState) return 'success'
    else return 'error'
  }

  componentDidMount() {
    const authenticate = this.props;

    axios.get('/loggedin')
    .then(res => {
      console.log(res, authenticate)
      if(res.data==""){
        authenticate.userHasAuthenticated(false, null, null);
        authenticate.history.push('/login')
      } else {
        authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
        if (res.data.Role===4) {
          authenticate.history.push('/requesttrip');
        } else if (res.data.Role===2) {
          authenticate.history.push('/viewtrips');
        }
      }
    })
  }

  render() {
    let fieldNames = ['Name', 'Username', 'Password', 'Telephone', 'Role'] ;
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormGroup controlId="realName" validationState={this.getValidationState(this.state.rnValid)}>
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Name: </Col> 
          <Col sm={4}>
            <FormControl type="text" value={this.state.realName} onChange={this.handleChange} />
            <FormControl.Feedback />
          </Col>
        </FormGroup>

        <FormGroup controlId="userName" validationState={this.getValidationState(this.state.unValid)}>     
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Username: </Col>
          <Col sm={4}>
            <FormControl type="text" value={this.state.userName} onChange={this.handleChange} />
            <FormControl.Feedback />
          </Col>
        </FormGroup>

        <FormGroup controlId="passWord" validationState={this.getValidationState(this.state.pwValid)}>     
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Password: </Col>
          <Col sm={4}>
            <FormControl type="password" value={this.state.passWord} onChange={this.handleChange} />
            <FormControl.Feedback />
          </Col>
        </FormGroup>

        <FormGroup controlId="telePhone" validationState={this.getValidationState(this.state.tpValid)}>
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Telephone: </Col>
          <Col sm={4}>
            <FormControl type="text" value={this.state.telePhone} onChange={this.handleChange} />
            <FormControl.Feedback />
          </Col>
        </FormGroup>

        <FormGroup controlId="role" validationState={this.getValidationState(this.state.rlValid)}>     
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Role: </Col>
          <Col sm={4}>
            <FormControl componentClass="select" placeholder={this.state.role} onChange={this.handleChange}>
              <option value="0">Select role</option>
              <option value="1">System Admin</option>
              <option value="2">Travel Manager</option>
              <option value="3">Driver</option>
              <option value="4">Requester</option>
              <option value="5">Travel Admin</option>
            </FormControl>
            <FormControl.Feedback />
          </Col>
        </FormGroup>

        <FormGroup controlId="tripsForFAOR">
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Place trips for FAOR: </Col>
          <Col sm={2}>
            <FormControl componentClass="select" placeholder={this.state.tripsForFAOR} onChange={this.handleChange}>
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </FormControl>
          </Col>
        </FormGroup>

        <FormGroup controlId="generateReport">
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Generate Reports: </Col>
          <Col sm={2}>
            <FormControl componentClass="select" placeholder={this.state.generateReport} onChange={this.handleChange}>
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </FormControl>
          </Col>
        </FormGroup>
        
        <FormGroup>
          <Col>
            <Button name="submit" type="submit" disabled={!this.state.formValid}>Add User</Button>
          </Col>
        </FormGroup>
        <div>
          <FormErrors formErrors={this.state.formErrors} fieldNames={fieldNames}/>
        </div>
      </Form>
    );
  }
}
