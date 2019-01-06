import React from 'react';
import axios from 'axios';
import { Table, Button, FormGroup, Pagination } from 'react-bootstrap';
import { TripStatus } from '../../Selections';

function CancelTrip (props) {
    const tripID = props.tripID;
    const deleteTrip = props.deleteTrip;
    const index = props.index;

    return (
        <Button name="delete" type="button" onClick={(e)=>deleteTrip(e, tripID, index)}>Cancel</Button>
    );
}

function ViewDetails (props) {
    return (
        <Button onClick={(e) => props.onDetails(e, props.tripID)}>Details</Button>
    )
}

function ApprovalButton (props) {
    const tripStatus = props.tripStatus;
    const tripID = props.tripID;

    return (
        (tripStatus===6) ?
            <FormGroup >
            <Button name="submit" type="button" onClick={(e)=>props.onSubmit(e, tripID, props.comment, props.index)}>Approve</Button>
            <Button name="delete" type="button" bsStyle="danger" onClick={(e)=>props.onClick(e, tripID, props.comment, props.index)}> Deny  </Button>
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
            <td>{rowContent.Remark}</td>
            <td><TripStatus tripStatus={rowContent.Trip_Status} /></td>
            <td><ViewDetails tripID={rowContent.TripID} onDetails={props.onDetails} /></td>
            <td><ApprovalButton tripStatus={rowContent.Trip_Status} tripID={rowContent.TripID} onClick={props.onClick} onSubmit={props.onSubmit} comment={rowContent.Remark} index={props.index} /></td>
            <td><CancelTrip tripID={rowContent.TripID} deleteTrip={props.onDelete} index={props.index} /></td>
        </tr> 
    )
}

function TableRender (props) {
    const tableContents = props.tableContents;

    const content = tableContents.map((rowContent, index) => {
        return <TableRow key={index} rowContent = {rowContent} onClick={props.onClick} onSubmit={props.onSubmit} onDetails={props.onDetails} index={index} onDelete={props.onDelete} />
    })

    return (
        <Table condensed striped bordered hover>
            <thead>
                <tr>
                    <th>Trip ID</th>
                    <th>Username</th>
                    <th>Trip Date</th>
                    <th>Further Remarks</th>
                    <th>Driver Assignment</th>
                    <th>Details</th>
                    <th>Approved</th>
                    <th>Cancel Trip</th>
                </tr>
            </thead>
            <tbody>
                {content}
            </tbody>
        </Table>
    );
}

function PaginationHandler (props) {
    let active = props.active;
    let numberOfPages = props.numberOfPages;

    let pager = [];

    if (numberOfPages <= 10) {
        for (let i=0; i<numberOfPages; i++) {
            pager.push(<Pagination.Item key={i} active={i===active} onClick={(e) => {props.onPage(e, i)}} >{i+1}</Pagination.Item>);
        }
    } else {
        if (active < 5) {
            for (let i=0; i<(active+2); i++) {
                pager.push(<Pagination.Item key={i} active={i===active} onClick={(e) => {props.onPage(e, i)}} >{i+1}</Pagination.Item>);
            }
            pager.push(<Pagination.Item disabled>...</Pagination.Item>)
            for (let j=numberOfPages-2; j<numberOfPages; j++) {
                pager.push(<Pagination.Item key={j} active={j===active} onClick={(e) => {props.onPage(e, j)}} >{j+1}</Pagination.Item>);
            }
        } else if (active > numberOfPages-6) {
            for (let i=0; i<2; i++) {
                pager.push(<Pagination.Item key={i} active={i===active} onClick={(e) => {props.onPage(e, i)}} >{i+1}</Pagination.Item>);
            }
            pager.push(<Pagination.Item disabled>...</Pagination.Item>)
            for (let j=active-1; j<numberOfPages; j++) {
                pager.push(<Pagination.Item key={j} active={j===active} onClick={(e) => {props.onPage(e, j)}} >{j+1}</Pagination.Item>);                
            }
        } else {
            for (let i=0; i<2; i++) {
                pager.push(<Pagination.Item key={i} active={i===active} onClick={(e) => {props.onPage(e, i)}} >{i+1}</Pagination.Item>);
            }
            pager.push(<Pagination.Item disabled>...</Pagination.Item>);
            for (let j=active-1; j<active+2; j++) {
                pager.push(<Pagination.Item key={j} active={j===active} onClick={(e) => {props.onPage(e, j)}} >{j+1}</Pagination.Item>)
            }
            pager.push(<Pagination.Item disabled>...</Pagination.Item>);
            for (let k=numberOfPages-2; k<numberOfPages; k++) {
                pager.push(<Pagination.Item key={k} active={k===active} onClick={(e) => {props.onPage(e, k)}} >{k+1}</Pagination.Item>)
            }
        }
    }
    return pager;
}

function Paginator (props) {
    const tableContents = props.tableContents;
    const active = props.active;

    let numberOfPages = Math.ceil(tableContents.length/10);

    let prevPage = (active===0)? 0: active-1;
    let nextPage = (active===(numberOfPages-1))? active: active+1;

    return (
        <div>
            <TableRender tableContents={tableContents.slice(10*active, 10*active+10)} onClick={props.onClick} onSubmit={props.onSubmit} onDetails={props.onDetails} onDelete={props.onDelete} />
            <Pagination>
                <Pagination.First onClick={(e)=>{props.onPage(e, 0)}} />
                <Pagination.Prev onClick={(e)=>{props.onPage(e, prevPage)}} />
                <PaginationHandler active={active} numberOfPages={numberOfPages} onPage={props.onPage} />
                <Pagination.Next onClick={(e)=>{props.onPage(e, nextPage)}} />
                <Pagination.Last onClick={(e)=>{props.onPage(e, numberOfPages-1)}} />
            </Pagination>
        </div>
    );
}

export default class AdminView extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
            tableContents: [],
            active: 0
        }

        this.handleDeny = this.handleDeny.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDetails = this.handleDetails.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    handleDelete (event, tripID, index) {
        const tableContents = this.state.tableContents.slice()
        axios.post('/trips/canceltrip', {
            tripID: tripID
        })
        .then((response) => {
            tableContents[index].Trip_Status = 7;
            this.setState({
                tableContents: tableContents,
            })
        })
    }

    handleDeny (event, tripID, comment, index) {
        const userName = this.props.userName
        const tableContents = this.state.tableContents.slice();
        axios.post('/trips/approval', {
            tripID: tripID,
            comment: comment + "[Denied by "+userName+"]", 
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
        const userName = this.props.userName;
        const tableContents = this.state.tableContents.slice();
        axios.post('/trips/approval', {
            tripID: tripID,
            comment: comment+" [Approved by "+userName+"]",
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

    handleDetails (event, tripID) {
        this.props.history.push('/viewtrip/'+tripID);
    }

    handlePageChange (event, page) {
        this.setState({
            active: page
        })
    }

    componentWillMount () {
        const infor = this.props;
        //console.log("Hello");

        axios.get('/loggedin')
        .then(res => {
            if (res.data=="") {
                infor.userHasAuthenticated(false, null, null);
                infor.history.push('/login');
            } else {
                infor.userHasAuthenticated(true, res.data.Username, res.data.Role);
                if (res.data.Role==2) {
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
            <Paginator active={this.state.active} tableContents={this.state.tableContents} onClick={this.handleDeny} onSubmit={this.handleSubmit} onDetails={this.handleDetails} onDelete={this.handleDelete} onPage={this.handlePageChange} />
        );
    }
}