import React, { Component, Fragment } from 'react';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './App.css';
import { Link, withRouter } from 'react-router-dom';
import Routes from './Routes';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      userType: null,
      userName: null,
    };
  }

  userHasAuthenticated = (authenticated, username, type) => {
    this.setState({
      isAuthenticated: authenticated,
      userName: username,
      userType: type,
    });
    //console.log("Inside userhasauthentiated", authenticated);
  }

  handleLogout = event => {
    this.userHasAuthenticated(false, null, null);
    this.props.history.push('/login');
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userName: this.state.userName,
      userType: this.state.userType,
      userHasAuthenticated: this.userHasAuthenticated,
    };

    return (
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to='/'>Travel Module | Home</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              {(this.state.isAuthenticated && !(this.state.userType === null)) ?
                <Fragment>
                  <LinkContainer to='/viewusers'>
                    <NavItem>View Users</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/newuser'>
                    <NavItem>Add Users</NavItem>
                  </LinkContainer>
                  <NavItem onClick={this.handleLogout}>Logout</NavItem> 
                </Fragment>:
                <Fragment>
                  <LinkContainer to='/login'>
                    <NavItem>Login</NavItem>
                  </LinkContainer>
                </Fragment>}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes childProps={childProps} />
      </div>
    );
  }
}

export default withRouter(App);
