import React from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

function FormErrors(props) {
  let formErrors = props.formErrors;
  let fieldNames = props.fieldNames;

  return(
    <div className='formErrors'>
      {fieldNames.map((fieldName, i) => {
        if(formErrors[i].length > 0){
          return (
            <p key={i}>{fieldName} {formErrors[i]}</p>
          );
        }else{
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
      role: '',
      formErrors: ['', '', '', ''],
      rnValid: true,
      unValid: true,
      pwValid: true,
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
      role: parseInt(this.state.role),
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
    const name = target.name;

    this.setState (
      {[name]:value},
      () => {this.validateField(name, value)}
    );
  }

  handleClick(event) {
    console.log("click");
    axios.delete('/users/'+this.state.id)
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
    let rlValid = this.state.rlValid;

    switch(fieldName) {
      case 'realName':
        rnValid = (/^(?:([a-zA-Z ]+))$/).test(value);
        fieldValidationErrors[0] = rnValid ? '': ' is invalid';
        break;
      case 'userName':
        unValid = (/^([\w]+)@fao(\.)org$/).test(value);
        fieldValidationErrors[1] = unValid ? '': ' is invalaid';
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

  validateForm() {
    this.setState({formValid: this.state.rnValid && this.state.unValid && this.state.pwValid && this.state.rlValid});
  }

  componentDidMount() {
    if(this.props.isAuthenticated === false) this.props.history.push('/login');

    axios.get('/users/'+this.state.id)
    .then( res => {
      console.log(res);
      this.setState({
        user: res.data[0],
        realName: res.data[0].Full_Name,
        userName: res.data[0].Username,
        passWord: res.data[0].Password,
        role: res.data[0].Role
      });
    });
  }

  render() {
    let fieldNames = ['Name', 'Username', 'Password', 'Role'];

    return (
      <div className="Edit">
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
            <label>
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
            <input name="submit" type="submit" value="Edit" disabled={!this.state.formValid}/>
            <input name="delete" type="button" value="Delete" onClick={this.handleClick} />
          </div>
          <div>
            <FormErrors formErrors={this.state.formErrors} fieldNames={fieldNames} />
          </div>
        </form>
      </div>
    );
  }

}
