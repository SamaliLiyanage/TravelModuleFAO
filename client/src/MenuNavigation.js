import React, {Fragment} from 'react';
import { NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './App.css';

export default class MenuNavigation extends React.Component {
    render() {
        return (
            (this.props.isAuthenticated && !(this.props.userType===null))?
                <Fragment>
                    <LinkContainer to='/viewusers'>
                        <NavItem>View Users</NavItem>
                    </LinkContainer>
                    <LinkContainer to='/newuser'>
                        <NavItem>Add User</NavItem>
                    </LinkContainer>
                    <NavItem onClick={this.props.onClick}>Log Out</NavItem>
                </Fragment>:
                <Fragment>
                    <LinkContainer to='/login'>
                        <NavItem>Log In</NavItem>
                    </LinkContainer>
                </Fragment>
            
        );
    }
}