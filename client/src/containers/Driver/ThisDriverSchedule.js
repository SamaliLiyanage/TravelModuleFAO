import React from 'react';
import axios from 'axios';
import { Table, Pagination } from 'react-bootstrap';
import { TripStatus, TripTypes } from '../../Selections';

function TableRow(props) {
    const rowContent = props.rowContent;
    const tripDate = new Date(rowContent.Trip_Date);

    return (
        <tr>
            <td>{rowContent.TripID}</td>
            <td>{rowContent.Username}</td>
            <td><TripStatus tripStatus={rowContent.Trip_Status} /></td>
            <td><TripTypes tripType={rowContent.Trip_Type} /></td>
            <td>{tripDate.getFullYear() + '-' + (tripDate.getMonth() + 1) + '-' + tripDate.getDate()}</td>
        </tr>
    );
}

function RenderRows(props) {
    const rowContents = props.rowContents;
    const content = rowContents.map((row, index) => {
        return (
            <TableRow key={index} rowContent={row} />
        );
    });

    return content;
}

function TripTable(props) {
    const tableContents = props.tableContents;

    return (
        <Table striped bordered condensed hover>
            <thead>
                <tr>
                    <th>Trip ID</th>
                    <th>Requester</th>
                    <th>Trip Status</th>
                    <th>Trip Type</th>
                    <th>Trip Date</th>
                </tr>
            </thead>
            <tbody>
                <RenderRows rowContents={tableContents} />
            </tbody>
        </Table>
    );
}

function PaginationHandler(props) {
    const active = props.active;
    const size = props.size;
    const onPage = props.onPage;

    let pager = [];

    for (let i=0; i < size; i++) {
        pager.push(
            <Pagination.Item key={i} active={i===active} onClick={(e)=>{onPage(e, i)}}>
                {i+1}
            </Pagination.Item>
        );
    }

    return pager;
}

function Paginator(props) {
    const tableContents = props.tableContents;
    const active = props.active;
    const onPage = props.onPage;

    let pageContents = tableContents.slice(10*active, 10*active+10) || tableContents.slice(10*active);

    return (
        <div>
            <TripTable tableContents={pageContents} />
            <Pagination>
                <PaginationHandler active={active} size={Math.ceil(tableContents.length/10)} onPage={onPage} />
            </Pagination>
        </div>
    );
}

export default class ThisDriverSchedule extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tableContents: [],
            currentPage: 0,
        }

        this.handlePageChange = this.handlePageChange.bind(this);
    }

    componentWillMount() {
        const auth = this.props;

        axios.get('/loggedin')
            .then(res => {
                if (res.data == "") {
                    auth.userHasAuthenticated(false, null, null);
                    auth.history.push('/login');
                } else {
                    auth.userHasAuthenticated(true, res.data.Username, res.data.Role);
                    if (res.data.Role === 1) {
                        auth.history.push('/viewusers');
                    } else if (res.data.Role === 4) {
                        auth.history.push('/requesttrip');
                    } else if (res.data.Role === 5) {
                        auth.history.push('/viewfrequests');
                    }

                    axios.get('/trips/filterTrip?driverID=\'' + this.props.userName + '\'')
                        .then(tripRes => {
                            if (tripRes.data.status === "success") {
                                this.setState({
                                    tableContents: tripRes.data.result.reverse()
                                });
                            }
                        })
                }
            })
    }

    componentDidMount() {
        axios.get('/trips/filterTrip?driverID=\'' + this.props.userName + '\'')
            .then(tripRes => {
                if (tripRes.data.status === "success") {
                    this.setState({
                        tableContents: tripRes.data.result.reverse()
                    });
                }
            })
    }

    handlePageChange(event, page) {
        this.setState({
            currentPage: page
        });
    }

    render() {
        return (
            <Paginator tableContents={this.state.tableContents} active={this.state.currentPage} onPage={this.handlePageChange} />
        );
    }
}