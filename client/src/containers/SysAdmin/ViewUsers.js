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
    if (this.props.isAuthenticated === false) this.props.history.push('/login');

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
      return (<UserRows tableContent={item} name={index} onClick={() => this.handleClick(item.Username)} />);
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
