import React from 'react';
import axios from 'axios';
import { Tabs, Tab, Table } from 'react-bootstrap';
import { TripTypes } from '../../Selections';

function DriverRow (props) {
    const rowContent = props.rowContent;
    const tripDate = new Date(rowContent.Trip_Date);

    return(
        <tr>
            <td>{rowContent.TripID}</td>
            <td>{rowContent.Username}</td>
            <td><TripTypes tripType={rowContent.Trip_Type} /></td>
            <td>{tripDate.getFullYear()+'-'+(tripDate.getMonth()+1)+'-'+tripDate.getDate()}</td>
        </tr>
    );
}

function RenderRows (props) {
    const rowContents = props.rowContents;
    const type = props.type;

    const content = rowContents.map((rowItem, index) => {
        if (rowItem.Driver_ID===type) {
            return (<DriverRow key={index} rowContent={rowItem} />);
        } else {
            return null;
        }
    });

    return content;
}

function DriverTable (props) {
    const tableContents =props.tableContents;
    const type = props.type;

    return (
        <Table striped bordered condensed hover>
            <thead>
                <tr>
                    <th>Trip ID</th>
                    <th>User</th>
                    <th>Trip Type</th>
                    <th>Trip Date</th>
                </tr>
            </thead>
            <tbody>
                <RenderRows rowContents={tableContents} type={type} />
            </tbody>
        </Table>
    );
}

export default class DriverSchedule extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
            tabKey: null,
            tableContents:[],
            driverList: []
        }

        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount () {
        const authenticate = this.props;

        axios.get('/loggedin')
        .then(res => {
        if(res.data==""){
            authenticate.userHasAuthenticated(false, null, null);
            authenticate.history.push('/login')
        } else {
            authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role);
            if (res.data.Role===4) {
                authenticate.history.push('/requesttrip');
            } 
        }
        })

        axios.get('/trips/all')
        .then( res => {
            this.setState({
                tableContents: res.data,
            });
        });

        axios.get('/users/Role/3')
            .then(driverRes => {
                this.setState({
                    driverList: driverRes.data,
                    tabKey: driverRes.data[0].Username
                });
            });
    }

    handleSelect(key) {
        this.setState ({
            tabKey: key,
        });
    }

    render () {
        const content = this.state.driverList.map((driver) => {
            return (
                <Tab eventKey={driver.Username} title={driver.Full_Name.split(" ")[0]}>
                    <DriverTable tableContents={this.state.tableContents} type={driver.Username} />
                </Tab>
            );
        });

        return (
            <Tabs activeKey={this.state.tabKey} onSelect={this.handleSelect} id="driver-schedules">
                {content}
            </Tabs>
        );
    }
}