import React, { Fragment } from 'react';
import { NavItem, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './App.css';

function SetMenu(props) {
	let isAuthenticated = props.isAuthenticated;
	let userType = props.userType;

	if (isAuthenticated) {
		if (userType === 1) {
			return (
				<Fragment>
					<LinkContainer to='/viewusers'>
						<NavItem>View Users</NavItem>
					</LinkContainer>
					<LinkContainer to='/newuser'>
						<NavItem>Add User</NavItem>
					</LinkContainer>
					<LinkContainer to='/changepassword/false'>
						<NavItem>Change Password</NavItem>
					</LinkContainer>
					<NavItem onClick={props.onClick}>Log Out</NavItem>
				</Fragment>
			);
		} else if (userType === 2) {
			return (
				<Fragment>
					<LinkContainer to='/viewtrips'>
						<NavItem>View Trips</NavItem>
					</LinkContainer>
					<LinkContainer to='/viewschedules'>
						<NavItem>Driver Schedules</NavItem>
					</LinkContainer>
					<NavDropdown id="driverLeave" title="Driver Leave">
						<LinkContainer to='/driveravailability'>
							<NavItem>Record Leave</NavItem>
						</LinkContainer>
						<LinkContainer to='/viewleave'>
							<NavItem>View Leave</NavItem>
						</LinkContainer>
					</NavDropdown>
					<LinkContainer to='/changepassword/false'>
						<NavItem>Change Password</NavItem>
					</LinkContainer>
					<NavItem onClick={props.onClick}>Log Out</NavItem>
				</Fragment>
			);
		} else if (userType === 3) {
			return (
				<Fragment>
					<LinkContainer to='/changepassword/false'>
						<NavItem>Change Password</NavItem>
					</LinkContainer>
					<NavItem onClick={props.onClick}>Log Out</NavItem>
				</Fragment>
			);
		} else if (userType === 4) {
			return (
				<Fragment>
					<LinkContainer to='/requesttrip'>
						<NavItem>Request Trip</NavItem>
					</LinkContainer>
					<LinkContainer to='/viewrequests'>
						<NavItem>View Requests</NavItem>
					</LinkContainer>
					<LinkContainer to='/changepassword/false'>
						<NavItem>Change Password</NavItem>
					</LinkContainer>
					<NavItem onClick={props.onClick}>Log Out</NavItem>
				</Fragment>
			);
		} else if (userType === 5) {
			return (
				<Fragment>
					<LinkContainer to='/viewfrequests'>
						<NavItem>View Requests</NavItem>
					</LinkContainer>
					<LinkContainer to='/changepassword/false'>
						<NavItem>Change Password</NavItem>
					</LinkContainer>
					<NavItem onClick={props.onClick}>Log Out</NavItem>
				</Fragment>
			);
		}
	} else {
		return (
			<Fragment>
				<LinkContainer to='/login'>
					<NavItem>Log In</NavItem>
				</LinkContainer>
			</Fragment>
		);
	}
}

export default class MenuNavigation extends React.Component {
	render() {
		return (
			<SetMenu isAuthenticated={this.props.isAuthenticated} userType={this.props.userType} onClick={this.props.onClick} />
		);
	}
}