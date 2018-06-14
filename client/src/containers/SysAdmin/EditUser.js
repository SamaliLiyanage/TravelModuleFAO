import React from 'react';
import axios from 'axios';
import { Form, FormControl, FormGroup, ControlLabel, Col, Button, Alert } from 'react-bootstrap';

function FormErrors(props) {
  let formErrors = props.formErrors;
  let fieldNames = props.fieldNames;

  return (
    <div className='formErrors'>
      {fieldNames.map((fieldName, i) => {
        if (formErrors[i].length > 0) {
          return (
            <Alert bsStyle="danger"><p key={i}>{fieldName} {formErrors[i]}</p></Alert>
          );
        } else {
          return '';
        }
      })}
    </div>
  );
}

export default class EditUser extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.id,
      user: [],
      userName: '',
      realName: '',
      passWord: '',
      telePhone: null,
      role: '',
      formErrors: ['', '', '', '', ''],
      rnValid: true,
      unValid: true,
      pwValid: true,
      tpValid: true,
      rlValid: true,
      formValid: true
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const authenticate = this.props;

    axios.post('/users/update', {
      oldUsername: this.state.id,
      userName: this.state.userName,
      realName: this.state.realName,
      passWord: this.state.passWord,
      telePhone: this.state.telePhone,
      role: parseInt(this.state.role, 10),
    })
      .then(function (response) {
        console.log("Response start", response, "Response end");
        authenticate.history.push('/viewusers');
      })
      .catch(function (error) {
        console.log("Error start ", error, "Error end");
      })
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

  handleClick(event) {
    console.log("click");
    axios.delete('/users/' + this.state.id)
      .then(response => {
        console.log(response);
        this.props.history.push('/viewusers');
      })
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let rnValid = this.state.rnValid;
    let unValid = this.state.unValid;
    let pwValid = this.state.pwValid;
    let tpValid = this.state.tpValid;
    let rlValid = this.state.rlValid;

    switch (fieldName) {
      case 'realName':
        rnValid = (/^(?:([a-zA-Z ]+))$/).test(value);
        fieldValidationErrors[0] = rnValid ? '' : ' is invalid';
        break;
      case 'userName':
        unValid = (/^([\w]+)@fao(\.)org$/).test(value);
        fieldValidationErrors[1] = unValid ? '' : ' is invalaid';
        break;
      case 'passWord':
        pwValid = (value.length >= 6);
        fieldValidationErrors[2] = pwValid ? '' : ' is too short';
        break;
      case 'telePhone':
        tpValid = !(value.length < 10);
        fieldValidationErrors[3] = tpValid ? '' : ' is invalid';
        break;
      case 'role':
        rlValid = !((/^0$/).test(value));
        fieldValidationErrors[4] = rlValid ? '' : ' is not selected';
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

  validateForm() {
    this.setState({ formValid: this.state.rnValid && this.state.unValid && this.state.pwValid && this.state.tpValid && this.state.rlValid });
  }

  getValidationState(fieldState) {
    if (fieldState) return 'success'
    else return 'error'
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
        if (res.data.Role===4) {
          authenticate.history.push('/requesttrip');
        } else if (res.data.Role===2) {
          authenticate.history.push('/viewtrips');
        }
      }
    })

    axios.get('/users/' + this.state.id)
      .then(res => {
        this.setState({
          user: res.data[0],
          realName: res.data[0].Full_Name,
          userName: res.data[0].Username,
          passWord: res.data[0].Password,
          telePhone: res.data[0].Mobile_No,
          role: res.data[0].Role
        });
      });
  }

  render() {
    let fieldNames = ['Name', 'Username', 'Password', 'Telephone', 'Role'];

    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormGroup controlId="realName" validationState={this.getValidationState(this.state.rnValid)}>
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Name: </Col>
          <Col sm={4}>
            <FormControl type="text" value={this.state.realName} onChange={this.handleChange} />
          </Col>
        </FormGroup>

        <FormGroup controlId="userName" validationState={this.getValidationState(this.state.unValid)}>
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Username:</Col>
          <Col sm={4}>
            <FormControl type="text" value={this.state.userName} onChange={this.handleChange} />
          </Col>
        </FormGroup>

        <FormGroup controlId="passWord" validationState={this.getValidationState(this.state.pwValid)}>
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Password:</Col>
          <Col sm={4}>
            <FormControl type="password" value={this.state.passWord} onChange={this.handleChange} />
          </Col>
        </FormGroup>

        <FormGroup controlId="telePhone" validationState={this.getValidationState(this.state.tpValid)}>
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Telephone:</Col>
          <Col sm={4}>
            <FormControl type="text" value={this.state.telePhone} onChange={this.handleChange} />
          </Col>
        </FormGroup>

        <FormGroup controlId="role" validationState={this.getValidationState(this.state.rlValid)}>
          <Col componentClass={ControlLabel} smOffset={2} sm={2}> Role: </Col>
          <Col sm={4}>
            <FormControl componentClass="select" value={this.state.role} onChange={this.handleChange}>
              <option value="0">Select role</option>
              <option value="1">System Admin</option>
              <option value="2">Travel Manager</option>
              <option value="3">Driver</option>
              <option value="4">Requester</option>
              <option value="5">Travel Admin</option>
            </FormControl>
          </Col>
        </FormGroup>

        <FormGroup>
          <Col sm={1} smOffset={4}>
            <Button name="submit" type="submit" disabled={!this.state.formValid}>Edit</Button>
          </Col>
          <Col  sm={1}>
            <Button name="delete" type="button" bsStyle="danger" onClick={this.handleClick}>Delete</Button>
          </Col>
        </FormGroup>

        <div>
          <FormErrors formErrors={this.state.formErrors} fieldNames={fieldNames} />
        </div>
      </Form>
    );
  }

}
