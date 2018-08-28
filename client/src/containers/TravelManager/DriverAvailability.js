import React from 'react';
import { Form, FormControl, FormGroup, Grid, Row, Col, ControlLabel, Checkbox, Button } from 'react-bootstrap';
import axios from 'axios';
import { DriverName } from '../../Selections';

/**
 * 
 * @param props::: type - type of trip
 * @param props::: onChange - what to do on change 
 * @param props::: time - time not available
 */
function SingleDayTime(props) {
  const content = parseInt(props.type,10)===3 ?
  <FormGroup controlId="time">
    <Col componentClass={ControlLabel} sm={4}>Time :</Col>
    <Col sm={8}>
      <FormControl type="time" value={props.time} onChange={props.onChange} />
    </Col>
  </FormGroup>:
  null;
  return (content);    
}

/**
 * 
 * @param props::: type - type of trip,
 * @param props::: leaveDate - date not available
 * @param props::: onChange - what to do on change 
 * @param props::: time - time not available
 */
function SingleDay(props) {
  const content = (parseInt(props.type,10)===2 || parseInt(props.type,10)===3)?
    <Row>
      <Col sm={3} smOffset={1}>
        <FormGroup controlId="leaveDate">
          <Col componentClass={ControlLabel} sm={4}>Date :</Col>
          <Col sm={8}>
            <FormControl type="date" value={props.leaveDate} onChange={props.onChange} />
          </Col>
        </FormGroup>
      </Col>
      <Col sm={3}>
        <SingleDayTime type={props.type} onChange={props.onChange} time={props.time} />
      </Col>
    </Row>:
    null;
  return (content);
}

function TimePeriod(props) {
  return (
    <div>
      <Col sm={3} smOffset={1}>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>From :</Col>
          <Col sm={8}>
            <FormControl type="date" />
          </Col>
        </FormGroup>
      </Col>
      <Col sm={3}>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>To :</Col>
          <Col sm={8}>
            <FormControl type="date" />
          </Col>
        </FormGroup>
      </Col>
      <Col sm={2}>
        <FormGroup>
          <Button name="add" type="button" >Add another period</Button>
        </FormGroup>
      </Col>
    </div>
  );
}

/**
 * 
 * @param props::: type-type of trip;  
 */
function MultipleDays(props) {
  const content = parseInt(props.type, 10)===1 ?
    <Row>
      <TimePeriod />
      <Col sm={1}>
        <FormGroup>
          <Col>
            <Checkbox>Indefinite</Checkbox>
          </Col>
        </FormGroup>
      </Col>
    </Row>:
    null;
  return(content);
}

export default class DriverAvailability extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      driver: 0,
      type: 0,
      fromDate: [],
      toDate: [],
      indefinite: false,
      leaveDate: new Date(),
      time: '0:00',
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const id = target.id;

    let driver = this.state.driver;
    let type = this.state.type;
    let fromDate = this.state.fromDate;
    let toDate = this.state.toDate;
    let indefinite = this.state.indefinite;
    let leaveDate = this.state.leaveDate;
    let time = this.state.time;

    if(id==="driver") driver = value;
    if(id==="type") type = value;
    if(id==="leaveDate") leaveDate = value;
    if(id==="time") time = value;

    this.setState({
      [id]:value
    });
  }

  render() {
    return (
      <Grid>
        <Row className="show-grid">
          <Col sm={12}>
            <Form horizontal>
              <Row>
                <Col sm={6}>
                  <FormGroup controlId="driver">
                    <Col componentClass={ControlLabel} sm={4}>Select driver :</Col>
                    <Col sm={8}>
                      <FormControl componentClass="select" value={this.state.driver} onChange={this.handleChange} >
                        <option value={0}>Select driver</option>
                        <option value={1}>Anthony</option>
                        <option value={2}>Ruchira</option>
                        <option value={3}>Dinesh</option>
                      </FormControl>
                    </Col>
                  </FormGroup>
                </Col>
                <Col sm={6}>
                  <FormGroup controlId="type">
                    <Col componentClass={ControlLabel} sm={4}>Type of unavailability :</Col>
                    <Col sm={8}>
                      <FormControl componentClass="select" value={this.state.type} onChange={this.handleChange}>
                        <option value={0}>Select type</option>
                        <option value={1}>Multiple days</option>
                        <option value={2}>Full day</option>
                        <option value={3}>Half day</option>
                      </FormControl>
                    </Col>
                  </FormGroup>
                </Col>
              </Row>
              <MultipleDays type={this.state.type} />
              <SingleDay type={this.state.type} leaveDate={this.state.leaveDate} onChange={this.handleChange} />
            </Form>
          </Col>
        </Row>
        <Row className="show-grid">
          <Col sm={12}>
            Affected Trips
          </Col>
        </Row>
      </Grid>
    );
  }
}
