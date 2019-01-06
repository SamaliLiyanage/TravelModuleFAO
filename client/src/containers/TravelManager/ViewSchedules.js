import React from 'react';
import axios from 'axios';
import { Tabs, Tab, Table, Pagination } from 'react-bootstrap';
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

    const content = rowContents.map((rowItem, index) => {
        return (<DriverRow key={index} rowContent={rowItem} />);
    });

    return content;
}

function DriverTable (props) {
    const tableContents = props.tableContents;

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
                <RenderRows rowContents={tableContents} />
            </tbody>
        </Table>
    );
}

function PaginationHandler (props) {
    const numberOfPages = props.numberOfPages;
    const active = props.active;

    let pager = [];

    if (numberOfPages <= 10) {
        for (let i=0; i<numberOfPages; i++) {
            pager.push(<Pagination.Item key={i} active={active===i} onClick={(e) => {props.onPage(e, i)}}>{i+1}</Pagination.Item>);
        }
    } else {
        if (active < 5) {
            for (let i=0; i<(active+2); i++){
                pager.push(
                    <Pagination.Item key={i} active={i==active} onClick={(e)=>{props.onPage(e, i)}}>{i+1}</Pagination.Item>
                );
            }
            // Ellipses
            pager.push(<Pagination.Item disabled>...</Pagination.Item>);
            for (let j=numberOfPages-2; j<numberOfPages; j++){
                pager.push(
                    <Pagination.Item key={j} active={j==active} onClick={(e)=>{props.onPage(e, j)}}>{j+1}</Pagination.Item>
                );
            }
        } else if (active > numberOfPages-6) {
            for (let i=0; i<2; i++){
                pager.push(
                    <Pagination.Item key={i} active={i==active} onClick={(e)=>{props.onPage(e, i)}}>{i+1}</Pagination.Item>
                );
            }
            // Ellipses
            pager.push(<Pagination.Item disabled>...</Pagination.Item>);
            for (let j=active-1; j<numberOfPages; j++){
                pager.push(
                    <Pagination.Item key={j} active={j==active} onClick={(e)=>{props.onPage(e, j)}}>{j+1}</Pagination.Item>
                );
            }
        } else {
            for (let i=0; i<2; i++){
                pager.push(
                    <Pagination.Item key={i} active={i==active} onClick={(e)=>{props.onPage(e, i)}}>{i+1}</Pagination.Item>
                );
            }
            // Ellipses
            pager.push(<Pagination.Item disabled>...</Pagination.Item>);
            for (let k=active-1; k<active+2; k++){
                pager.push(
                    <Pagination.Item key={k} active={k==active} onClick={(e)=>{props.onPage(e, k)}}>{k+1}</Pagination.Item>
                );
            }
            // Ellipses
            pager.push(<Pagination.Item disabled>...</Pagination.Item>);
            for (let j=numberOfPages-2; j<numberOfPages; j++){
                pager.push(
                    <Pagination.Item key={j} active={j==active} onClick={(e)=>{props.onPage(e, j)}}>{j+1}</Pagination.Item>
                );
            }
        }
    }

    return (pager);
}

function Paginator (props) {
    const tableContents = props.tableContents;
    const type = props.type;
    const active = props.active;

    const content = tableContents.map((rowItem, index) => {
        if (rowItem.Driver_ID===type) {
            return (rowItem);
        } else {
            return null;
        }
    });

    const finalContent = content.filter((item) => {
        return item!==null;
    });

    let numberOfPages = Math.ceil(finalContent.length/10);
    
    let prevPage = (active === 0)? 0: active-1;
    let nextPage = (active === numberOfPages-1)? active: active+1;

    return (
        <div>
            <DriverTable tableContents={finalContent.slice(10*active, 10*active+10)} />
            <Pagination>
                <Pagination.First onClick={(e) => {props.onPage(e, 0)}} />
                <Pagination.Prev onClick={(e) => {props.onPage(e, prevPage)}} />
                <PaginationHandler numberOfPages={numberOfPages} active={active} onPage={props.onPage} />
                <Pagination.Next onClick={(e) => {props.onPage(e, nextPage)}} />
                <Pagination.Last onClick={(e) => {props.onPage(e, numberOfPages-1)}} />
            </Pagination>
        </div>
    );
}

export default class DriverSchedule extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
            tabKey: null,
            tableContents:[],
            driverList: [],
            active: 0
        }

        this.handleSelect = this.handleSelect.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    componentDidMount () {
        const authenticate = this.props;

        axios.get('/loggedin')
        .then(res => {
        if(res.data==""){
            authenticate.userHasAuthenticated(false, null, null, null, null);
            authenticate.history.push('/login')
        } else {
            authenticate.userHasAuthenticated(true, res.data.Username, res.data.Role, res.data.PlaceTripForFAOR, res.data.GenerateReport);
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

    handlePageChange (event, page) {
        this.setState({
            active: page
        });
    }

    render () {
        const content = this.state.driverList.map((driver) => {
            return (
                <Tab eventKey={driver.Username} title={driver.Full_Name.split(" ")[0]}>
                    <Paginator tableContents={this.state.tableContents} type={driver.Username} active={this.state.active} onPage={this.handlePageChange} />
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