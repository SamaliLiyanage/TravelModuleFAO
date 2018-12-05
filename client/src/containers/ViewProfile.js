import React from 'react';
import axios from 'axios';
import { Col, ControlLabel, Form, FormControl, FormGroup } from 'react-bootstrap';
import { UserTypes } from '../Selections'

export default class ViewProfile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fullName: null,
            userName: null,
            telephone: null,
            role: null
        }
    }

    componentDidMount() {
        const authenticate = this.props;

        axios.get('/loggedin')
            .then(res => {
                console.log(res, authenticate)
                if (res.data == "") {
                    authenticate.userHasAuthenticated(false, null, null);
                    authenticate.history.push('/login')
                } else {
                    authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
                    this.setState({
                        fullName: res.data.Full_Name,
                        userName: res.data.Username,
                        telephone: res.data.Mobile_No,
                        role: res.data.Role
                    });
                }
            });
    }

    render() {
        console.log(this.state);
        return (
            <Form horizontal>
                <FormGroup controlId="fullName">
                    <Col componentClass={ControlLabel} smOffset={2} sm={2}>Full Name: </Col>
                    <Col sm={3}>
                        <FormControl.Static>{this.state.fullName}</FormControl.Static>
                    </Col>
                </FormGroup>
                <FormGroup controlId="role">
                    <Col componentClass={ControlLabel} smOffset={2} sm={2}>Role: </Col>
                    <Col sm={3}>
                        <FormControl.Static><UserTypes role={this.state.role} /></FormControl.Static>
                    </Col>
                </FormGroup>
                <FormGroup controlId="userName">
                    <Col componentClass={ControlLabel} smOffset={2} sm={2}>Username: </Col>
                    <Col sm={3}>
                        <FormControl.Static>{this.state.userName}</FormControl.Static>
                    </Col>
                </FormGroup>
                <FormGroup controlId="telephone">
                    <Col componentClass={ControlLabel} smOffset={2} sm={2}>Telephone: </Col>
                    <Col sm={3}>
                        <FormControl.Static>{this.state.telephone}</FormControl.Static>
                    </Col>
                </FormGroup>
            </Form>
        );
    }
}