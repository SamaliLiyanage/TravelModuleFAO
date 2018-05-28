import React, { Component } from "react";
import { Form, Col, Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import axios from 'axios';

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
    };
  }

  componentDidMount() {
    const authenticate = this.props;
    axios.get('/loggedin')
    .then(function (res){
      if(res.data=="") {
        authenticate.userHasAuthenticated(false, null, null);
        authenticate.history.push('/login');
      } else {
        console.log(res.data.Username, res.data.Role)
        authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
        if(res.data.Role===1) {
          authenticate.history.push('/viewusers');
        } else if (res.data.Role===4) {
          authenticate.history.push('/requesttrip');
        } else if (res.data.Role===2) {
          authenticate.history.push('/viewtrips');
        } else if (res.data.Role===5) {
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
        if(res.data.length === 1){
          authenticate.userHasAuthenticated(true, res.data[0].Username, res.data[0].Role);
          if((res.data[0].Role)===1) {
            authenticate.history.push('/viewusers');
          }else if((res.data[0].Role)===4) {
            authenticate.history.push('/requesttrip');
          }else if((res.data[0].Role)===2) {
            authenticate.history.push('/viewtrips');
          } if((res.data[0].Role)===5) {
            authenticate.history.push('/viewfrequests');
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
        </Form>
    );
  }
}
