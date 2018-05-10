import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';
import { TripStatus } from '../../Selections';

function Trip(props) {
  switch(props.tripType) {
    case 1: return "Day Trip";
    case 2: return "Field Trip";
    case 3: return "Field Day Trip";
    case 4: return "Airport";
    default: break;
  }
}

function TripRow(props) {
  const tableContent = props.tableContent;

  return (
    <tr>
      <td>{tableContent.TripID}</td>
      <td>{tableContent.Username}</td>
      <td><Trip tripType={tableContent.Trip_Type} /></td>
      <td><TripStatus tripStatus={tableContent.Trip_Status} /></td>
      <td>
        <select onChange={props.onChange}>
          <option>Unassigned</option>
          <option>Driver 1</option>
          <option>Driver 2</option>
          <option>Driver 3</option>
        </select>
      </td>
    </tr>
  );
}

export default class ViewTrips extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tableContent: []
    }

    this.handleChange= this.handleChange.bind(this);
  }

  componentDidMount() {
    if(this.props.isAuthenticated===false) this.props.history.push('/login');

    axios.get('/trips/all')
    .then(res => {
      this.setState({
        tableContent: res.data
      });
    })
  }

  handleChange(i) {
    //event.preventDefault();

    console.log("changed");
  }

  renderRows(tableContents) {
    const content = tableContents.map((item, index) => {
      return (<TripRow tableContent={item} onChange={()=>this.handleChange(index)} />);
    });

    return content;
  }

  render() {
    return(
      <div className="container">
        <table>
          <thead>
            <tr>
              <th>Trip id</th>
              <th>Username</th>
              <th>Trip Type</th>
              <th>Trip Status</th>
              <th>Assign Driver</th>
            </tr>
          </thead>
          <tbody>
            {this.renderRows(this.state.tableContent)}
          </tbody>
        </table>
      </div>
    )

  }
}
