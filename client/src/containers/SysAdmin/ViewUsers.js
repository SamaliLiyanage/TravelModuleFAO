import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';

function Role(props) {
  switch(props.role) {
    case 1: return "System Administrator";
    case 2: return "Travel Manager";
    case 3: return "Driver";
    case 4: return "Requester";
    default: break;
  }
}

function UserRows(props) {
  const tableContent = props.tableContent;
  return (
    <tr>
      <td>{tableContent.Full_Name}</td>
      <td>{tableContent.Username}</td>
      <td><Role role={tableContent.Role} /></td>
      <td><button onClick={props.onClick}>Edit/Delete</button></td>
    </tr>
  );
}

export default class ViewUsers extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tableContent: [],
      clicked:false,
    };
  }

  componentDidMount() {
    if(this.props.isAuthenticated===false) this.props.history.push('/login');

    axios('/users/all')
    .then(res => {
      this.setState({
        tableContent: res.data
      });
    })
  }

  handleClick(username) {
    this.props.history.push('/edituser/'+username);
  }

  renderRows(tableContents) {
    const content = tableContents.map((item, index) => {
      return (<UserRows tableContent={item} name={index} onClick={()=>this.handleClick(item.Username)} />);
    });
    return content;
  }

  render() {
    return(
      <div className="container">
        <table>
          <tr>
            <th>Full Name</th>
            <th>Username</th>
            <th>Role</th>
            <th>Edit/Delete</th>
          </tr>
          {this.renderRows(this.state.tableContent)}
        </table>
      </div>
    )
  }
}
