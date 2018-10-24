import React from 'react';
import axios from 'axios';
import { Form, FormGroup, ControlLabel, FormControl, Button, Col, Alert } from 'react-bootstrap';

function FormErrors(props) {
    let formErrors = props.formErrors;

    return (
        <div className='fromErrors'>
            {
                formErrors.map((error, i) => {
                    if (error.length > 0) {
                        return (
                            <Alert bsStyle="danger"><p key={i}>{error}</p></Alert>
                        );
                    } else {
                        return '';
                    }
                })
            }
        </div>
    );
}

export default class UserProfile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userName: null,
            oldPassWord: null,
            newPassWord: null,
            repeatPassWord: null,
            npwValid: false,
            rpwValid: false,
            formErrors: ['', '', ''],
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        let formErrors = this.state.formErrors;

        axios.post('/users/changepword', {
            userName: this.state.userName,
            oldPassWord: this.state.oldPassWord,
            newPassWord: this.state.newPassWord
        }).then(response => {
            console.log("Response ", response);
            if (response.status === 'fail') {
                if (response.result === 'Password mismatch') {
                    this.props.history.push('/changepassword/'+true);
                }
            } else {
                this.props.history.push('/viewtrips');   
            }
        })
    }

    componentDidMount() {
        const authenticate = this.props;
        let formErrors = this.state.formErrors;
        formErrors[2] = this.props.match.params.mismatch === 'true'? 'Old password is incorrect': '';

        axios.get('/loggedin')
            .then(res => {
                console.log(res, authenticate)
                if (res.data == "") {
                    authenticate.userHasAuthenticated(false, null, null);
                    authenticate.history.push('/login')
                } else {
                    authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
                    this.setState(
                        {
                            userName: res.data.Username,
                            formErrors: formErrors
                        }
                    )
                }
            })
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const id = target.id;

        this.setState(
            { [id]: value },
            () => { this.validatePassword(id, value) },
        )
    }

    validatePassword(fieldName, fieldValue) {
        let fieldErrors = this.state.formErrors;
        let npwValid = this.state.npwValid;
        let rpwValid = this.state.rpwValid;

        switch (fieldName) {
            case 'newPassWord':
                npwValid = (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/).test(fieldValue);
                fieldErrors[0] = npwValid ? '' : 'Password is not strong enough';
                break;
            case 'repeatPassWord':
                rpwValid = (this.state.newPassWord === this.state.repeatPassWord);
                fieldErrors[1] = rpwValid ? '' : 'Passwords do not match';
                break;
            case 'oldPassWord':
                fieldErrors[2] = '';
                break;
        }

        this.setState({
            formErrors: fieldErrors,
            npwValid: npwValid,
            rpwValid: rpwValid
        })
    }

    render() {
        return (
            <Form horizontal onSubmit={this.handleSubmit}>
                <FormGroup controlId="oldPassWord">
                    <Col componentClass={ControlLabel} smOffset={2} sm={2}>Old Password: </Col>
                    <Col sm={4}>
                        <FormControl type="password" value={this.state.oldPassWord} onChange={this.handleChange} />
                    </Col>
                </FormGroup>

                <FormGroup controlId="newPassWord">
                    <Col componentClass={ControlLabel} smOffset={2} sm={2}>New Password: </Col>
                    <Col sm={4}>
                        <FormControl type="password" value={this.state.newPassWord} onChange={this.handleChange} />
                    </Col>
                </FormGroup>

                <FormGroup controlId="repeatPassWord">
                    <Col componentClass={ControlLabel} smOffset={2} sm={2}>Re-enter Password: </Col>
                    <Col sm={4}>
                        <FormControl type="password" value={this.state.repeatPassWord} onChange={this.handleChange} />
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col>
                        <Button name="submit" type="submit">Submit</Button>
                    </Col>
                </FormGroup>

                <div>
                    <FormErrors formErrors={this.state.formErrors} />
                </div>
            </Form>
        );
    }
}