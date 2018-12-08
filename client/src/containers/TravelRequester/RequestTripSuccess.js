import React from 'react';
import axios from 'axios';
import { Alert } from 'react-bootstrap';

export default class RequestTripSuccess extends React.Component {
    componentDidMount() {
        const authenticate = this.props;

        axios.get('/loggedin')
        .then(res => {
        if(res.data==""){
            authenticate.userHasAuthenticated(false, null, null);
            authenticate.history.push('/login')
        } else {
            authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
        }
        })
    }

    render() {
        return (
            <div className='col-md-10 col-md-offset-1'>
                <Alert bsStyle='success'>Your Trip Request with Trip ID: {this.props.match.params.tripid} has been sent to the travel manager.</Alert>
            </div>
        );
    }
}