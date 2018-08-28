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
  const content = parseInt(props.type, 10) === 3 ?
    <FormGroup controlId="time">
      <Col componentClass={ControlLabel} sm={4}>Time :</Col>
      <Col sm={8}>
        <FormControl type="time" value={props.time} onChange={props.onChange} />
      </Col>
    </FormGroup> :
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
  const content = (parseInt(props.type, 10) === 2 || parseInt(props.type, 10) === 3) ?
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
    </Row> :
    null;
  return (content);
}

/**
 * 
 * @param props::: onClick - function to call when clicking button 
 * @param props::: index - index of current
 * @param props::: length - length of array
 */
function AddButton(props) {
  const content = (props.length === (props.index + 1)) ?
    <Col sm={1}>
      <FormGroup>
        <Button name="add" type="button" onClick={(e) => props.onClick(e, null)} >Add</Button>
      </FormGroup>
    </Col> :
    <Col sm={1}>
    </Col>;
  return (
    content
  );
}

/**
 * 
 * @param props::: onClick - function to call when clicking button
 * @param props::: index - index to remove
 * @param props::: length - length of array
 */
function RemoveButton(props) {
  const content = (props.length !== 1) ?
    <Col sm={1}>
      <FormGroup>
        <Button name="remove" type="button" onClick={(e) => props.onClick(e, props.index)} >Remove</Button>
      </FormGroup>
    </Col> :
    <Col sm={1}>
    </Col>;
  return (
    content
  );
}

/**
 * 
 * @param props::: indefinite - Is the time period indefinite?
 * @param props::: onClick - function to call on clicking "Add another period"
 * @param props::: length - number of this element called
 * @param props::: index - index to remove
 */
function TimeRange(props) {
  const content = (!props.indefinite) ?
    <div sm={12}>
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
      <AddButton onClick={props.onClick} index={props.index} length={props.length} />
      <RemoveButton onClick={props.onClick} index={props.index} length={props.length} />
    </div> :
    <Col sm={3} smOffset={1}>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={4}>From :</Col>
        <Col sm={8}>
          <FormControl type="date" />
        </Col>
      </FormGroup>
    </Col>
  return (content);
}

/**
 * 
 * @param props::: indefinite - Is the time period indefinite?
 * @param props::: fromDate - fromDate array
 * @param props::: onClick - function to call on clicking "Add another period"
 */
function TimePeriod(props) {
  const content = props.fromDate.map((date, index) => {
    return <TimeRange key={index} indefinite={props.indefinite} onClick={props.onClick} length={props.fromDate.length} index={index} />
  });
  return (
    content
  );
}

/**
 * 
 * @param props::: type-type of trip;  
 * @param props::: indefinite - Is the time period indefinite? call when clicked
 * @param props::: onClick - function to
 * @param props::: fromDate - fromDate array
 * @param props::: onChange - function to call on clicking "Add another period"
 */
function MultipleDays(props) {
  const content = parseInt(props.type, 10) === 1 ?
    props.fromDate.length === 1 ?
      <Row>
        <TimePeriod indefinite={props.indefinite} fromDate={props.fromDate} onClick={props.onChange} />
        <Col sm={1}>
          <FormGroup controlId="indefinite" >
            <Col>
              <Checkbox inline checked={props.indefinite} title="indefinite" onClick={props.onClick} >Indefinite</Checkbox>
            </Col>
          </FormGroup>
        </Col>
      </Row> :
      <Row>
        <TimePeriod indefinite={props.indefinite} fromDate={props.fromDate} onClick={props.onChange} />
      </Row> :
    null;
  return (content);
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
    this.handleClick = this.handleClick.bind(this);
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

    if (id === "driver") driver = value;
    if (id === "type") {
      type = value;
      if (parseInt(value, 10) === 1) {
        fromDate.push(new Date());
      }
    }
    if (id === "leaveDate") leaveDate = value;
    if (id === "time") time = value;
    if (target.parentElement.title === "indefinite") indefinite = !(indefinite);

    this.setState({
      [id]: value,
      indefinite: indefinite,
      fromDate: fromDate
    });
  }

  handleClick(event, index) {
    let fromDate = this.state.fromDate;
    if (event.target.name === "add") {
      fromDate.push(new Date());
    } else if (event.target.name === "remove") {
      fromDate.splice(index, 1)
    }

    this.setState({
      fromDate: fromDate
    });
  }

  render() {
    return (
      <Form horizontal>
        <Grid>
          <Row className="show-grid">
            <Col sm={12}>
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
              <MultipleDays type={this.state.type} indefinite={this.state.indefinite} onClick={this.handleChange} fromDate={this.state.fromDate} onChange={this.handleClick} />
              <SingleDay type={this.state.type} leaveDate={this.state.leaveDate} onChange={this.handleChange} />

            </Col>
          </Row>
          <Row className="show-grid">
            <Col sm={12}>
              Affected Trips
              <FormGroup controlId="submit">
                <Button name="submit" type="submit" onClick={(e) => { console.log(e.target.name) }} >Submit</Button>
              </FormGroup>
            </Col>
          </Row>
        </Grid>
      </Form>
    );
  }
}
