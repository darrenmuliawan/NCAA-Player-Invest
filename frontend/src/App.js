import React, { Component } from 'react';
import './App.css';
import Login from './components/Login';
import CssBaseline from '@material-ui/core/CssBaseline';
import Signup from './components/Signup';
import Admin from './components/Admin';
import Dashboard from './components/Dashboard';
import { withTheme, createMuiTheme } from '@material-ui/core/styles';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';

const theme = createMuiTheme({
  palette: {
    primary: green,
  },
});

class App extends Component {
  render() {
    return (
        <div className="App" style={{fontFamily: 'Lato'}}>
          <CssBaseline/>
          <Router>
            <Switch>
              <Route exact path="/" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/secretadmin123" component={Admin} />
            </Switch>
          </Router>
        </div>  
    );
  }
}

export default withTheme(theme)(App);
