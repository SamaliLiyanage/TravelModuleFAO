import React from 'react';
import axios from 'axios';

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
            if(res.data.Role===1) {
            authenticate.history.push('/viewusers');
            } else if (res.data.Role===2) {
            authenticate.history.push('/viewtrips');
            }
        }
        })
    }

    render() {
        return (
            <p>Your Trip Request with Trip ID: {this.props.match.params.tripid} has been sent to the travel manager.</p>
        );
    }
}