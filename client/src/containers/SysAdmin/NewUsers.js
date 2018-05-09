import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';

function FormErrors (props){
  let formErrors = props.formErrors;
  let fieldNames = props.fieldNames;
  return (
    <div className='formErrors'>
      {fieldNames.map((fieldName, i) => {
        if(formErrors[i].length > 0){
          return (
            <p key={i}>{fieldName} {formErrors[i]}</p>
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
      role: 0,
      formErrors: ['', '', '', ''],
      rnValid: false,
      unValid: false,
      pwValid: false,
      rlValid: false,
      formValid: false
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState(
      {[name]: value},
      () => {this.validateField(name,value)}
    );
  }

  handleSubmit(event) {
    event.preventDefault();
    const authenticate = this.props;

    axios.post('/users/new', {
        userName: this.state.userName,
        realName: this.state.realName,
        passWord: this.state.passWord,
        role: parseInt(this.state.role),
      })
      .then(function (response) {
        console.log("Response", response);
        authenticate.history.push('/viewusers');
      })
      .catch(function (error) {
        console.log("Response", error);
      })
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let rnValid = this.state.rnValid;
    let unValid = this.state.unValid;
    let pwValid = this.state.pwValid;
    let rlValid = this.state.rlValid;

    switch(fieldName) {
      case 'realName':
        rnValid = (/^(?:([a-zA-Z ]+))$/).test(value);
        fieldValidationErrors[0] = rnValid ? '':' is invalid';
        break;
      case 'userName':
        unValid = (/^([\w]+)@fao(\.)org$/).test(value);
        fieldValidationErrors[1] = unValid ? '':' is invalid';
        break;
      case 'passWord':
        pwValid = (value.length >=6);
        fieldValidationErrors[2] = pwValid ? '': ' is too short';
        break;
      case 'role':
        rlValid = !((/^0$/).test(value));
        fieldValidationErrors[3] = rlValid ? '': ' is not selected';
        break;
      default:
        break;
    }
    this.setState({
      formErrors: fieldValidationErrors,
      rnValid: rnValid,
      unValid: unValid,
      pwValid: pwValid,
      rlValid: rlValid
    }, this.validateForm);
  }

  validateForm(){
    this.setState({formValid: this.state.rnValid && this.state.unValid && this.state.pwValid && this.state.rlValid});
  }

  componenetDidMount() {
    console.log("Painful");
    if(this.props.isAuthenticated===false){ 
      this.props.history.push('/login');
      console.log("Are we here?????");
    } else {
      console.log("No :(");
    }
  }

  render() {
    let fieldNames = ['Name', 'Username', 'Password', 'Role'] ;
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label> Name: 
            <input name="realName" type="text" value={this.state.realName} onChange={this.handleChange} />
          </label>
        </div>
        <div className="form-group">     
          <label> Username: 
            <input name="userName" type="text" value={this.state.userName} onChange={this.handleChange} />
          </label>
        </div>
        <div className="form-group">     
          <label> Password: 
            <input name="passWord" type="password" value={this.state.passWord} onChange={this.handleChange} />
          </label>
        </div>
        <div className="form-group">     
          <label> Role: 
            <select name="role" value={this.state.role} onChange={this.handleChange}>
              <option value="0">Select role</option>
              <option value="1">System Admin</option>
              <option value="2">Travel Manager</option>
              <option value="3">Driver</option>
              <option value="4">Requester</option>
            </select>
          </label>
        </div>
        <div>
          <input name="submit" type="submit" value="Add User" disabled={!this.state.formValid}/>
        </div>
        <div className="panel panel-default">
          <FormErrors formErrors={this.state.formErrors} fieldNames={fieldNames}/>
        </div>
      </form>
    );
  }
}
