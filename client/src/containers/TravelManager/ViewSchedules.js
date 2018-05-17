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
            tabKey: 1,
            tableContents:[],
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
            if(res.data.Role===1) {
            authenticate.history.push('/viewusers');
            } else if (res.data.Role===4) {
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
    }

    handleSelect(key) {
        this.setState ({
            tabKey: key,
        });
    }

    render () {
        return (
            <Tabs activeKey={this.state.tabKey} onSelect={this.handleSelect} id="driver-schedules">
                <Tab eventKey={1} title="Driver 1">
                    <DriverTable tableContents={this.state.tableContents} type={'1'} />
                </Tab>
                <Tab eventKey={2} title="Driver 2">
                    <DriverTable tableContents={this.state.tableContents} type={'2'} />
                </Tab>
                <Tab eventKey={3} title="Driver 3">
                    <DriverTable tableContents={this.state.tableContents} type={'3'} />
                </Tab>
            </Tabs>
        );
    }
}