import React from 'react';
import axios from 'axios';
import { DriverName, TripTypes, TripStatus } from '../../Selections';
import { Table, Button, Pagination } from 'react-bootstrap';

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

function TableContentRender(props) {
    let tableContents = props.tableContents;
    let driverTuple = props.driverTuple;

    const content = tableContents.map((item, index) => {
        return (
            <TripRows key={index} rowContent={item} onClick={props.onClick} driverTuple={driverTuple} />
        );
    });

    return content;
}

function TableRender(props) {
    return (
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
                <TableContentRender tableContents={props.tableContent} driverTuple={props.driverTuple} onClick={props.onClick} />
            </tbody>
        </Table>
    );
}

function PaginationHandler(props) {
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

function Paginator(props) {
    let tableContent = props.tableContent;
    let driverTuple = props.driverTuple;
    let active = props.active;

    let numberOfPages = Math.ceil(tableContent.length/10);

    let prevPage = (active===0)? 0: active - 1;
    let nextPage = (active===(numberOfPages-1))? active: active + 1;

    return (
        <div>
            <TableRender tableContent={tableContent.slice(10*active, 10*active+10)} driverTuple={driverTuple} onClick={props.onClick}/>
            <Pagination>
                <Pagination.First onClick={(e) => {props.onPage(e, 0)}} />
                <Pagination.Prev onClick={(e) => {props.onPage(e, prevPage)}} />
                <PaginationHandler active={active} numberOfPages={numberOfPages} onPage={props.onPage} />
                <Pagination.Next onClick={(e) => {props.onPage(e, nextPage)}} />
                <Pagination.Last onClick={(e) => {props.onPage(e, numberOfPages-1)}} />
            </Pagination>
        </div>
    );
}

export default class ViewRequests extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tableContent: [],
            driverTuple: {},
            active: 0
        }

        this.handleClick = this.handleClick.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
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

    handlePageChange(event, page) {
        this.setState({
            active: page
        });
    }

    render() {
        return (
            <div className="container">
                <Paginator active={this.state.active} tableContent={this.state.tableContent} driverTuple={this.state.driverTuple} onClick={this.handleClick} onPage={this.handlePageChange} />
            </div>
        );
    }
}