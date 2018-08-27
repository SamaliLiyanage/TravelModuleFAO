import React from 'react';
import { Form, FormControl, FormGroup, Grid, Row, Col, ControlLabel } from 'react-bootstrap';
import axios from 'axios';
import { DriverName } from '../../Selections';

export default class DriverAvailability extends React.Component {
  render() {
    return (
      <Grid>
        <Row className="show-grid">
          <Col md={12}>
            <Form horizontal>
              <FormGroup>
                <Col componentClass={ControlLabel} sm={2}>Select driver :</Col>
                <Col sm={4}>
                  <FormControl componentClass="select" >
                    <option value={0}>Select driver</option>
                    <option value={1}>Anthony</option>
                    <option value={2}>Ruchira</option>
                    <option value={3}>Dinesh</option>
                  </FormControl>
                </Col>
              </FormGroup>
              
              <FormGroup>
                <Col componentClass={ControlLabel} sm={2}>Date unavailable :</Col>
                <Col sm={2}><FormControl type="date" /></Col>
              </FormGroup>

              <FormGroup>
                <Col componentClass={ControlLabel} sm={2}>Time unavailable :</Col>
                <Col sm={2}><FormControl type="time" /></Col>
              </FormGroup>

              
            </Form>
          </Col>
        </Row>
        <Row className="show-grid">
          <Col md={12}>
          Place 2
          </Col>
        </Row>
      </Grid>
    );
  }
}
