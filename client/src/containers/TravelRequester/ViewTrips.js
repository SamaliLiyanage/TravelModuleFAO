import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

export default class ViewRequests extends React.Component {
    componentDidMount(){
        if(this.props.isAuthenticated===false) this.props.history.push('/login');
    }

    render() {
        return (
            <p>Still Working on This</p>
        );
    }
}