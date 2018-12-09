import React from 'react';
import axios from 'axios';
import { DriverName, TripTypes, TripStatus } from '../../Selections';
import { Table, Button } from 'react-bootstrap';

function TripRows(props) {
    const rowContent = props.rowContent;
    const tripDate = new Date(rowContent.Trip_Date);
    const reqDate = new Date(rowContent.Requested_Date);

    return (
        <tr>
            <td>{rowContent.TripID}</td>
            <td><TripTypes tripType={rowContent.Trip_Type} /></td>
            <td><TripStatus tripStatus={rowContent.Trip_Status} /></td>
            <td>{tripDate.getFullYear() + "-" + (tripDate.getMonth() + 1) + "-" + tripDate.getDate()}</td>
            <td>{rowContent.Trip_Time}</td>
            <td><DriverName driverTuple={props.driverTuple} driverID={rowContent.Driver_ID} /></td>
            <td>{reqDate.getFullYear() + "-" + (reqDate.getMonth() + 1) + "-" + reqDate.getDate()}</td>
            <td><Button onClick={(e) => props.onClick(e, rowContent.TripID)}>Details</Button></td>
        </tr>
    );
}

export default class ViewRequests extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tableContent: [],
            driverTuple: {}
        }

        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        const authenticate = this.props;

        axios.get('/loggedin')
            .then(res => {
                if (res.data == "") {
                    authenticate.userHasAuthenticated(false, null, null);
                    authenticate.history.push('/login')
                } else {
                    authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
                }
            })

        axios.get('trips/all/' + this.props.userName)
            .then(res => {
                this.setState({
                    tableContent: res.data
                });
            })

        axios.get('/users/Role/3')
            .then(res => {
                let drivers = { '0': 'Unassigned', 'cab': 'Cab Assigned' };
                res.data.forEach((driverDetail) => {
                    drivers[driverDetail.Username] = driverDetail.Full_Name.split(" ")[0];
                });
                this.setState({
                    driverTuple: drivers
                });
            })
    }

    handleClick(event, tripID) {
        this.props.history.push('/viewtrip/' + tripID);
    }

    renderRows(tableContents) {
        const content = tableContents.map((item, index) => {
            return (<TripRows key={index} rowContent={item} onClick={this.handleClick} driverTuple={this.state.driverTuple} />);
        });

        return content;
    }

    render() {
        return (
            <div className="container">
                <Table striped bordered condensed hover>
                    <thead>
                        <tr>
                            <th>Trip ID</th>
                            <th>Trip Type</th>
                            <th>Trip Status</th>
                            <th>Trip Date</th>
                            <th>Trip Time</th>
                            <th>Driver ID</th>
                            <th>Requested Date</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderRows(this.state.tableContent)}
                    </tbody>
                </Table>
            </div>
        );
    }
}