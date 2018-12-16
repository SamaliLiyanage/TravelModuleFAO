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
import RequestTripFail from './containers/TravelRequester/RequestTripFail';
import ViewRequests from './containers/TravelRequester/ViewTrips';
import ViewTrips from './containers/TravelManager/ViewRequests';
import DriverSchedule from './containers/TravelManager/ViewSchedules';
import TabbedRequest from './containers/TravelManager/ViewReqTabs';
import AdminView from './containers/Adminstrator/ViewFthrRemarks';
import ViewTripDetails from './containers/TravelManager/ViewTripDetails';
import DriverAvailability from './containers/TravelManager/DriverAvailability';
import ViewDriverLeave from './containers/TravelManager/ViewDriverLeave';
import UserProfile from './containers/UserProfile';
import ViewProfile from './containers/ViewProfile';
import ThisDriverSchedule from './containers/Driver/ThisDriverSchedule';

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path='/' exact component={Home} props={childProps} />
    <AppliedRoute path='/login' exact component={Login} props={childProps} />
    <AppliedRoute path='/newuser' exact component={UserForm} props={childProps} />
    <AppliedRoute path='/viewusers' exact component={ViewUsers} props={childProps} />
    <AppliedRoute path='/edituser/:id' exact component={EditUser} props={childProps} />
    <AppliedRoute path='/requesttrip' exact component={RequestTrip} props={childProps} />
    <AppliedRoute path='/viewtrips' exact component={ViewTrips} props={childProps} />
    <AppliedRoute path='/success/:tripid' exact component={RequestTripSuccess} props={childProps} />
    <AppliedRoute path='/fail' exact component={RequestTripFail} props={childProps} />    
    <AppliedRoute path='/viewrequests' exact component={ViewRequests} props={childProps} />
    <AppliedRoute path='/viewschedules' exact component={DriverSchedule} props={childProps} />
    <AppliedRoute path='/viewtabs' exact component={TabbedRequest} />
    <AppliedRoute path='/viewfrequests' exact component={AdminView} props={childProps} />
    <AppliedRoute path='/viewtrip/:tripid' exact component={ViewTripDetails} props={childProps} />
    <AppliedRoute path='/driveravailability' exact component={DriverAvailability} props={childProps} />
    <AppliedRoute path='/viewleave' exact component={ViewDriverLeave} props={childProps} />
    <AppliedRoute path='/changepassword/:mismatch' exact component={UserProfile} props={childProps} />
    <AppliedRoute path='/viewprofile' exact component={ViewProfile} props={childProps} />
    <AppliedRoute path='/viewschedule' exact component={ThisDriverSchedule} props={childProps} />
    <Route component={NotFound} />
  </Switch>;
