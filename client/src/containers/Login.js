import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
    };
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault();
    const authenticate = this.props;

    axios.post('/login', {
        username: this.state.username,
        password: this.state.password,
      })
      .then(function (res) {
        console.log(res.data[0].Role);
        if(res.data.length === 1){
          authenticate.userHasAuthenticated(true, res.data[0].Username, res.data[0].Role);
          if((res.data[0].Role)===1) {
            authenticate.history.push('/viewusers');
          }else if((res.data[0].Role)===4) {
            authenticate.history.push('/requesttrip');
          }else{
            authenticate.history.push('/viewtrips');
          }
        }else{
          authenticate.userHasAuthenticated(false, null, null);
          authenticate.history.push('/login');
        }
      })
      .catch(function (error) {
        console.log("Response error::::", error);
      })


  }

  render() {
    return (
      <div className="Login">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="username" bsSize="large">
            <ControlLabel>Username</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.username}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
        </form>
      </div>
    );
  }
}
