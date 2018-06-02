import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';
import { UserTypes } from '../../Selections';
import { Table } from 'react-bootstrap';

function UserRows(props) {
  const tableContent = props.tableContent;
  return (
    <tr>
      <td>{tableContent.Full_Name}</td>
      <td>{tableContent.Username}</td>
      <td><UserTypes role={tableContent.Role} /></td>
      <td><button onClick={props.onClick}>Edit/Delete</button></td>
    </tr>
  );
}

export default class ViewUsers extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tableContent: [],
      clicked: false,
    };
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
        if (res.data.Role===4) {
          authenticate.history.push('/requesttrip');
        } else if (res.data.Role===2) {
          authenticate.history.push('/viewtrips');
        }
      }
    })

    axios('/users/all')
      .then(res => {
        this.setState({
          tableContent: res.data
        });
      })
  }

  handleClick(username) {
    this.props.history.push('/edituser/' + username);
  }

  renderRows(tableContents) {
    const content = tableContents.map((item, index) => {
      return (<UserRows tableContent={item} key={index} name={index} onClick={() => this.handleClick(item.Username)} />);
    });
    return content;
  }

  render() {
    return (
      <div className="container">
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Edit/Delete</th>
            </tr>
          </thead>
          <tbody>
            {this.renderRows(this.state.tableContent)}
          </tbody>
        </Table>
      </div>
    )
  }
}
