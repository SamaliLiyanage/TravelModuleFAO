import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';
import { UserTypes } from '../../Selections';
import { Table, Button } from 'react-bootstrap';

function UserButton(props) {
  if (props.enabled == true) {
    return (<Button onClick={props.onClick}>Edit/Delete</Button>);
  } else {
    return (<Button bsStyle="danger" onClick={props.onClickEnable}>Enable User</Button>);
  }
}

function UserRows(props) {
  const tableContent = props.tableContent;
  return (
    <tr>
      <td>{tableContent.Full_Name}</td>
      <td>{tableContent.Username}</td>
      <td><UserTypes role={tableContent.Role} /></td>
      <td> <UserButton enabled={tableContent.Enabled} onClick={props.onClick} onClickEnable={props.onClickEnable} /></td>
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

    this.handleEnable = this.handleEnable.bind(this);
  }

  componentDidMount() {
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

  handleEnable(username) {
    const auth = this.props;
    axios.post('/users/enableUser', {
      userName: username,
    })
    .then(function (response) {
      console.log(response)
      auth.history.push('/edituser/' + username);
    })
    .catch(function (error) {
      console.log("Error start ", error, "Error end");
    }) 
  }

  renderRows(tableContents) {
    const content = tableContents.map((item, index) => {
      return (<UserRows tableContent={item} key={index} name={index} onClick={() => this.handleClick(item.Username)} onClickEnable={() => this.handleEnable(item.Username)} />);
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
