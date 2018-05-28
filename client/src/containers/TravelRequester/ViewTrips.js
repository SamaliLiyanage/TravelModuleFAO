import React from 'react';
import axios from 'axios';
import { TripTypes, DriverName, TripStatus } from '../../Selections';
import { Table } from 'react-bootstrap';

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
            <td><DriverName driverID={rowContent.Driver_ID} /></td>
            <td>{reqDate.getFullYear() + "-" + (reqDate.getMonth() + 1) + "-" + reqDate.getDate()}</td>
            <td>{rowContent.Destination}</td>
        </tr>
    );
}

export default class ViewRequests extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tableContent: [],
        }
    }

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

        axios.get('trips/all/' + this.props.userName)
            .then(res => {
                this.setState({
                    tableContent: res.data
                });
            })
    }

    renderRows(tableContents) {
        const content = tableContents.map((item, index) => {
            return (<TripRows key={index} rowContent={item} />);
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
                            <th>Destination</th>
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