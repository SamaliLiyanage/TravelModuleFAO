import React, { Component } from "react";
import { Form, Col, Button, FormGroup, FormControl, ControlLabel, Alert } from "react-bootstrap";
import axios from 'axios';

function LoginError(props){
  if(props.display){
    return (
      <Col smOffset={4}>
        <Alert className='col-sm-6' bsStyle="danger" >Invalid username or password...</Alert>
      </Col>
    );
  } else {
    return null;
  }
} 

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      loginFail: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const authenticate = this.props;
    axios.get('/loggedin')
      .then(function (res) {
        if (res.data == "") {
          authenticate.userHasAuthenticated(false, null, null);
          authenticate.history.push('/login');
        } else {
          console.log(res.data.Username, res.data.Role)
          authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
          if (res.data.Role === 1) {
            authenticate.history.push('/viewusers');
          } else if (res.data.Role === 4) {
            authenticate.history.push('/requesttrip');
          } else if (res.data.Role === 2) {
            authenticate.history.push('/viewtrips');
          } else if (res.data.Role === 5) {
            authenticate.history.push('/viewfrequests');
          }
        }
      })
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
        console.log(res);
        var data = res.data.result;
        if (res.data.status === "success") {
          authenticate.userHasAuthenticated(true, data[0].Username, data[0].Role);
          if ((data[0].Role) === 1) {
            authenticate.history.push('/viewusers');
          } else if ((data[0].Role) === 4) {
            authenticate.history.push('/requesttrip');
          } else if ((data[0].Role) === 2) {
            authenticate.history.push('/viewtrips');
          } if ((data[0].Role) === 5) {
            authenticate.history.push('/viewfrequests');
          }
        } else if (res.data.status === "fail") {
          console.log("In here");
          this.setState({
            username: "",
            password: "",
            loginFail: true
          });
          authenticate.userHasAuthenticated(false, null, null);
        } else {
          console.log("In here");
          this.setState({
            username: "",
            password: "",
            loginFail: true,
            message: res.data.info
          });
          authenticate.userHasAuthenticated(false, null, null);
        }
      })
      .catch((error) => {
        console.log("Response error::::", error);
        this.setState({
          username: "",
          password: "",
          loginFail: true
        });
        authenticate.userHasAuthenticated(false, null, null);
      })


  }

  render() {
    return (
        <Form horizontal onSubmit={this.handleSubmit}>
          <FormGroup controlId="username" >
            <Col sm={2} smOffset={2}><ControlLabel>Username</ControlLabel></Col>
            <Col sm={4}>
              <FormControl autoFocus type="email" value={this.state.username} onChange={this.handleChange} />
            </Col>
          </FormGroup>
          <FormGroup controlId="password" >
            <Col sm={2} smOffset={2}><ControlLabel>Password</ControlLabel></Col>
            <Col sm={4}>
              <FormControl value={this.state.password} onChange={this.handleChange} type="password" />
            </Col>
          </FormGroup>
          <Button disabled={!this.validateForm()} type="submit"> Login </Button>
          <LoginError display={this.state.loginFail} />
        </Form>
    );
  }
}
