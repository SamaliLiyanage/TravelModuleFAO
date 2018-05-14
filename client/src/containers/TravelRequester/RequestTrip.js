import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import axios from 'axios';

function FormErrors(props) {
  let formErrors = props.formErrors;

  if(formErrors.length > 0){
    return(
      <div className='formErrors'>
        <p>Trip type {formErrors}</p>
      </div>
    );
  } else {
    return(
      <div className='formErrors'>
        <p></p>
      </div>
    );
  }
}

export default class RequestTrip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      temp: 0,
      tripID: 0,
      rqstrID: this.props.userName,
      tripDate: null,
      tripType: 0,
      tripIDValid: true,
      ttypeValid: false,
      formErrors: ['', '']
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.generateTripID = this.generateTripID.bind(this);
  }

  generateTripID(nextidx) {
    var date = new Date();

    var month = "";
    var dates = "";
    var idx = "";

    if(date.getMonth().toString().length===1){
      month = '0'+(date.getMonth()+1).toString();
    }else{
      month = (date.getMonth()+1).toString();
    }

    if(date.getDate().toString().length===1){
      dates = '0'+date.getDate().toString();
    }else{
      dates = date.getDate().toString();
    }

    if(nextidx.toString().length===1){
      idx = '00'+nextidx;
    }else if (nextidx.toString().length===2) {
      idx = '0'+nextidx;
    }else{
      idx = nextidx;
    };

    const index = date.getFullYear().toString().substring(2,4)+""+month+""+dates+""+idx;

    this.setState({
      tripID: index,
    });
  }

  componentDidMount() {
    if(this.props.isAuthenticated===false) {
      this.props.history.push('/login');
    }else if(this.props.userType===1) {
      this.props.history.push('/viewusers');
    }

    axios.get('/trips/lastindex')
    .then(res => {
      this.generateTripID(res.data.TripCount);
    });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState(
      {[name]: value},
      () => {this.validateField(name, value)}
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    axios.post('/trips/new', {
      tripID: this.state.tripID,
      username: this.state.rqstrID,
      tripType: parseInt(this.state.tripType),
      tripDate: this.state.tripDate,
    })
    .then(response => {
      console.log(response);
      this.props.history.push('/success/'+this.state.tripID);
    })
    .catch(function(error) {
      console.log(error);
    })
  }

  validateField(fieldName, value) {
    let fieldErrors = this.state.formErrors;
    let tripIDValid = this.state.tripIDValid;
    let ttypeValid = this.state.ttypeValid;

    switch(fieldName) {
      case 'tripID':
        tripIDValid = (/^[0-9]+$/).test(value);
        fieldErrors[0] = tripIDValid ? '': ' is invalid';
        break;
      case 'tripType':
        ttypeValid = !((/^0$/).test(value));
        fieldErrors[1] = ttypeValid ? '': ' is not selected';
        break;
      default:
        break;
    }

    this.setState({
      formErrors: fieldErrors,
      tripIDValid: tripIDValid,
      ttypeValid: ttypeValid
    });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className='form-group'>
          <label>Trip Number:
            <input name="tripID" type="text" value={this.state.tripID} readOnly='true' />
          </label>
        </div>
        <div className='form-group'>
          <label>Requester:
            <input name="tripRequester" type="text" value={this.state.rqstrID} readOnly='true' />
          </label>
        </div>
        <div className='form-group'>
          <label>Date of Trip:
            <input name='tripDate' type="date" value={this.state.tripDate} onChange={this.handleChange} />
          </label>
        </div>
        <div className="form-group">
          <label>
            <select name="tripType" value={this.state.tripType} onChange={this.handleChange}>
              <option value="0">Select type</option>
              <option value="1">Day trip</option>
              <option value="2">Field trip</option>
              <option value="3">Field day trip</option>
              <option value="4">Airport</option>
            </select>
          </label>
        </div>
        <div>
          <input name="submit" type="submit" value="Request" disabled={!this.state.ttypeValid}/>
        </div>
        <div>
          <FormErrors formErrors={this.state.formErrors[1]} />
        </div>
      </form>
    );
  }
}
