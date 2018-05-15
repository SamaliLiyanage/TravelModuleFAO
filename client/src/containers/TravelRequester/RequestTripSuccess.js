import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

export default class RequestTripSuccess extends React.Component {
    componentDidMount() {
        if (this.props.isAuthenticated === false) this.props.history.push('/login');
    }

    render() {
        return (
            <p>Your Trip Request with Trip ID: {this.props.match.params.tripid} has been sent to the travel manager.</p>
        );
    }
}