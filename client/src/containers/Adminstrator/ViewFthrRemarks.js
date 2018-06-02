import React from 'react';
import axios from 'axios';
import { Table, Button, FormGroup } from 'react-bootstrap';
import { TripStatus } from '../../Selections'

function ApprovalButton (props) {
    const tripStatus = props.tripStatus;
    const tripID = props.tripID;

    return (
        (tripStatus===6) ?
            <FormGroup >
            <Button name="submit" type="button" onClick={(e)=>props.onSubmit(e, tripID, props.comment, props.index)}>Approve</Button>
            <Button name="delete" type="button" bsStyle="danger" onClick={(e)=>props.onClick(e, tripID, props.index)}> Deny  </Button>
            </FormGroup>:
            "N/A"
    )
}

function TableRow (props) {
    const rowContent = props.rowContent;
    const tripDate = new Date(rowContent.Trip_Date);

    return(
        <tr>
            <td>{rowContent.TripID}</td>
            <td>{rowContent.Username}</td>
            <td>{tripDate.getFullYear()+"-"+(tripDate.getMonth()+1)+"-"+tripDate.getDate()}</td>
            <td>{rowContent.Destination}</td>
            <td>{rowContent.Remark}</td>
            <td><TripStatus tripStatus={rowContent.Trip_Status} /></td>
            <td><ApprovalButton tripStatus={rowContent.Trip_Status} tripID={rowContent.TripID} onClick={props.onClick} onSubmit={props.onSubmit} comment={rowContent.Remark} index={props.index} /></td>
        </tr> 
    )
}

function TableRender (props) {
    const tableContents = props.tableContents;

    const content = tableContents.map((rowContent, index) => {
        return <TableRow key={index} rowContent = {rowContent} onClick={props.onClick} onSubmit={props.onSubmit} index={index} />
    })

    return content;
}

export default class AdminView extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
            tableContents: [],
        }

        this.handleDeny = this.handleDeny.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleDeny (event, tripID, index) {
        const tableContents = this.state.tableContents.slice();
        axios.post('/trips/approval', {
            tripID: tripID,
            comment: "Further Requests have been denied", 
            approve: false,
        })
        .then((response) => {
            console.log(tableContents);
            tableContents[index].Trip_Status = 1;
            this.setState({
                tableContents: tableContents,
            })
        })
        
    }

    handleSubmit (event, tripID, comment, index) {
        const tableContents = this.state.tableContents.slice();
        axios.post('/trips/approval', {
            tripID: tripID,
            comment: comment,
            approve: true,
        })
        .then((response) => {
            console.log(response);
            if (response.data.success) {
                console.log(tableContents)
                tableContents[index].Trip_Status = 1
                this.setState({
                    tableContents: tableContents,
                })
            }
        })
        
    }

    componentWillMount () {
        const infor = this.props;
        console.log("Hello");

        axios.get('/loggedin')
        .then(res => {
            if (res.data=="") {
                infor.userHasAuthenticated(false, null, null);
                infor.history.push('/login');
            } else {
                infor.userHasAuthenticated(true, res.data.Username, res.data.Role);
                if (res.data.Role==1) {
                    infor.history.push('/viewusers');
                } else if (res.data.Role==2) {
                    infor.history.push('/viewtrips');
                } else if (res.data.Role==4) {
                    infor.history.push('/requesttrip');
                }
            }
        })
    }

    componentDidMount () {
        axios.get('/trips/allfthrrq')
        .then(res => {
            if(res.data.success){
                //console.log(res.data.data[0]);            
                this.setState ({
                    tableContents: res.data.data,
                })
            }
        })
    }

    render () {
        return (
            <Table condensed striped bordered hover>
                <thead>
                    <tr>
                        <th>Trip ID</th>
                        <th>Username</th>
                        <th>Trip Date</th>
                        <th>Destination</th>
                        <th>Further Remarks</th>
                        <th>Driver Assignment</th>
                        <th>Approved</th>
                    </tr>
                </thead>
                <tbody>
                    <TableRender tableContents={this.state.tableContents} onClick={this.handleDeny} onSubmit={this.handleSubmit} />
                </tbody>
            </Table>
        );
    }
}