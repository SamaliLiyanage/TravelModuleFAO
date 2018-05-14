import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './containers/Home';
import Login from './containers/Login';
import NotFound from './containers/NotFound';
import AppliedRoute from './components/AppliedRoute';
import UserForm from './containers/SysAdmin/NewUsers';
import ViewUsers from './containers/SysAdmin/ViewUsers';
import EditUser from './containers/SysAdmin/EditUser';
import RequestTrip from './containers/TravelRequester/RequestTrip';
import RequestTripSuccess from './containers/TravelRequester/RequestTripSuccess';
import ViewRequests from './containers/TravelRequester/ViewTrips';
import ViewTrips from './containers/TravelManager/ViewRequests';
import TabbedRequest from './containers/TravelManager/ViewReqTabs';

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path='/' exact component={Home} props={childProps} />
    <AppliedRoute path='/login' exact component={Login} props={childProps} />
    <AppliedRoute path='/newuser' exact component={UserForm} props={childProps}/>
    <AppliedRoute path='/viewusers' exact component={ViewUsers} props={childProps} />
    <AppliedRoute path='/edituser/:id' exact component={EditUser} props={childProps} />
    <AppliedRoute path='/requesttrip' exact component={RequestTrip} props={childProps} />
    <AppliedRoute path='/viewtrips' exact component={ViewTrips} props={childProps} />
    <AppliedRoute path='/success/:tripid' exact component={RequestTripSuccess} props={childProps} />
    <AppliedRoute path='/viewrequests' exact component={ViewRequests} props={childProps}/>
    <AppliedRoute path='/viewtabs' exact component={TabbedRequest} />
    <Route component={NotFound} />
  </Switch>;
