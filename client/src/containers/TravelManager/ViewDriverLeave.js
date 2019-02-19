import React from 'react';
import axios from 'axios';
import { LeaveType } from "../../Selections"
import { Row, Col, Form, FormGroup, ControlLabel, Grid, Table, Button, FormControl } from 'react-bootstrap';

/**
 *  
 * @param  props:: leaveDates - array of leave for the driver for the year 
 * @param props:: handleCancel - function to handle cancellation of leave
 * @param props:: driverID - driver ID of driver whose leave is to be cancelled
 */
function LeaveDate(props) {
	return (
		props.leaveDates.map((leave, index) => {
			let tempDate = new Date(leave.LeaveDate);
			let finalDate = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate();
			return (
				<tr key={index}>
					<td>{finalDate}</td>
					<td>{leave.LeaveTime}</td>
					<td><LeaveType leaveType={parseInt(leave.LeaveType, 10)} /></td>
					<td><Button type="button" name="cancelLeave" onClick={(e) => { props.handleCancel(e, props.driverID, finalDate, index) }}>Cancel Leave</Button></td>
				</tr>
			);
		})
	);
}

/**
 * 
 * @param props:: leaveDates - array of Leave for the driver for the given year 
 * @param props:: handleCancel - function to handle cancellation of leave
 * @param props:: driverID - driver ID of driver whose leave is to be cancelled 
 */
function LeaveTable(props) {
	return (
		<Table striped bordered condensed hover responsive >
			<thead>
				<tr>
					<td>Leave Date</td>
					<td>Leave Time</td>
					<td>Leave Type</td>
					<td>Cancel Leave</td>
				</tr>
			</thead>
			<tbody>
				<LeaveDate leaveDates={props.leaveDates} handleCancel={props.handleCancel} driverID={props.driverID} />
			</tbody>
		</Table>
	);
}

function DropdownYear(props) {
	const thisYear = new Date().getFullYear();
	let dropDown = [];

	for (let year = 2018; year <= (thisYear+1); year++) {
		dropDown.push(year);
	}

	return (
		dropDown.map((year) => {
			return (
				<option key={year} value={year}>{year}</option>
			);
		})
	);

}

export default class ViewDriverLeave extends React.Component {
	constructor(props) {
		super(props);

		var tempDate = new Date();
		this.state = {
			leaveDates: [],
			driver: 0,
			year: tempDate.getFullYear(),
			driverTuple: {},
			driverList: []
		}

		this.handleCancel = this.handleCancel.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		const authenticate = this.props;

		axios.get('/loggedin')
			.then((res) => {
				if (res.data == "") {
					authenticate.userHasAuthenticated(false, null, null);
					authenticate.history.push('/login')
				} else {
					authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
					if (res.data.Role === 4) {
						authenticate.history.push('/requesttrip');
					}
				}
			});

		axios.get('/users/Role/3')
			.then((res) => {
				let drivers ={'0': 'Select driver'}
				res.data.forEach((driver) => {
					drivers[driver.Username] = driver.Full_Name.split(" ")[0]
				});
				this.setState({
					driverList: res.data,
					driverTuple: drivers
				});
			})
	}

	handleChange(event) {
		let target = event.target;
		let id = target.id;
		let value = target.value;

		if (id === "year") {
			if (this.state.driver != 0) {
				axios.get('/drivers/getleave/' + this.state.driver + '/' + value)
					.then((res) => {
						if (res.data.status === 'success') {
							this.setState({
								leaveDates: res.data.data
							})
						}
					})
			}
			this.setState({
				year: value
			})
		} else if (id === "driver") {
			if (value != 0) {
				axios.get('/drivers/getleave/' + value + '/' + this.state.year)
					.then((res) => {
						if (res.data.status === 'success') {
							this.setState({
								leaveDates: res.data.data
							})
						}
					})
			}
			this.setState({
				driver: value
			})
		}
	}

	handleCancel(event, driverID, date, index) {
		axios.post('/drivers/deleteleave', {
			driverID: driverID,
			leaveDate: date
		}).then((res) => {
			if (res.data.status === 'success') {
				let leaveDates = this.state.leaveDates;
				leaveDates.splice(index, 1);
				this.setState({
					leaveDates: leaveDates
				})
			}
		})
	}

	render() {
		const driverList = this.state.driverList.map((driver) => {
			return (
				<option value={driver.Username}>{driver.Full_Name.split(" ")[0]}</option>
			);
		});
		return (
			<Form horizontal>
				<Grid>
					<Row>
						<Col sm={6}>
							<FormGroup controlId="driver">
								<Col sm={4} componentClass={ControlLabel}>Driver:</Col>
								<Col sm={8}>
									<FormControl componentClass="select" value={this.state.driver} onChange={(e) => this.handleChange(e)}>
										<option value={0}>Select Driver</option>
										{driverList}
									</FormControl>
								</Col>
							</FormGroup>
						</Col>

						<Col sm={6}>
							<FormGroup controlId="year">
								<Col sm={4} componentClass={ControlLabel}>Year:</Col>
								<Col sm={8}>
									<FormControl componentClass="select" value={this.state.year} onChange={(e) => this.handleChange(e)}>
										<DropdownYear />
									</FormControl>
								</Col>
							</FormGroup>
						</Col>
					</Row>
				</Grid>

				<Grid>
					<LeaveTable leaveDates={this.state.leaveDates} handleCancel={this.handleCancel} driverID={this.state.driver} />
				</Grid>
			</Form>
		);
	}
}