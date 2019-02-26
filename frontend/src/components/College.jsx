import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from "@material-ui/core/Typography";
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import './styles/College.css';
import Card from '@material-ui/core/Card';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { Button } from '@material-ui/core';


const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
});

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

class CustomizedTable extends React.Component {
  constructor() {
    super();

    this.state = {
      tableData: [{
        id: 0,
        firstname: '',
        lastname: '',
        position: '',
        college: '',
        price: 0,
        ppg: 0,
        rpg: 0,
        apg: 0,
        bpg: 0,
        spg: 0,
        open: false,
      }],
      selectedValue: {},
      ratings: [],
    };
  }

  componentDidMount() {
    axios.get('https://radiant-anchorage-94411.herokuapp.com/players/').then((response)=> {
      response.data.sort((a,b) => b.rating - a.rating);
      response.data = response.data.slice(0, 25)

      this.setState( {tableData: response.data} );
      console.log(response.data);
    });
  }
  
  handleClickOpen = (row) => {

    const f = ()=>{
      console.log(row.id);

      axios.post('https://radiant-anchorage-94411.herokuapp.com/playerPercentages/', {
        "id": row.id
      }).then((response)=> {
        console.log(response.data);
        this.setState( {ratings: response.data} );
      })
    
      this.setState({
        open: true,
        selectedValue: row
      }, ()=>{console.log(this.state);}); 
    }
    
    return f;
  };

  handleClose = value => {
    this.setState({ selectedValue: value, open: false });
  };

  render() {
    const { tableData } = this.state;
    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <CustomTableCell>ID</CustomTableCell>
              <CustomTableCell>Name</CustomTableCell>
              <CustomTableCell>Position</CustomTableCell>
              <CustomTableCell>College</CustomTableCell>
              <CustomTableCell numeric>Points</CustomTableCell>
              <CustomTableCell numeric>Rebounds</CustomTableCell>
              <CustomTableCell numeric>Assists</CustomTableCell>
              <CustomTableCell numeric>Blocks</CustomTableCell>
              <CustomTableCell numeric>Steals</CustomTableCell>
              <CustomTableCell numeric>Rating</CustomTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableData.map(row => {
              return (
                <TableRow onClick={this.handleClickOpen(row)}>
                  <CustomTableCell>{row.id}</CustomTableCell>
                  <CustomTableCell component="th" scope="row">
                    {row.firstname} {row.lastname}
                  </CustomTableCell>
                  <CustomTableCell>{row.position}</CustomTableCell>
                  <CustomTableCell>{row.college}</CustomTableCell>
                  <CustomTableCell numeric>{row.ppg}</CustomTableCell>
                  <CustomTableCell numeric>{row.rpg}</CustomTableCell>
                  <CustomTableCell numeric>{row.apg}</CustomTableCell>
                  <CustomTableCell numeric>{row.bpg}</CustomTableCell>
                  <CustomTableCell numeric>{row.spg}</CustomTableCell>
                  <CustomTableCell numeric>{row.rating}</CustomTableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <PlayerDetailsDialog
            selectedValue={this.state.selectedValue}
            open={this.state.open}
            onClose={this.handleClose}
            ratings={this.state.ratings}
          />
        </Table>
      </Paper>
    );
  }
}

class UserTable extends React.Component {
  constructor() {
    super();

    this.state = {
      tableData: [{
        username: '',
        points: 0,
      }],
    };
  }

  componentDidMount() {
    axios.get('https://radiant-anchorage-94411.herokuapp.com/users/').then((response)=> {
      response.data.sort((a,b) => b.points - a.points);
      response.data = response.data.slice(0, 25)
      console.log(response.data);

      this.setState( {tableData: response.data} );
    });
  }

  render() {
    const { tableData } = this.state;

    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <CustomTableCell>ID</CustomTableCell>
              <CustomTableCell>Username</CustomTableCell>
              <CustomTableCell>Points</CustomTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableData.map(row => {
              return (
                <TableRow>
                  <CustomTableCell>{row.id}</CustomTableCell>
                  <CustomTableCell component="th" scope="row">
                    {row.username}
                  </CustomTableCell>
                  <CustomTableCell>{row.points}</CustomTableCell>
                </TableRow>
              );
            })}
          </TableBody>

        </Table>
      </Paper>
    );
  }
}

CustomizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

class SimpleTabs extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange}>
            <Tab label="College Leaderboard" />
            <Tab label="User Leaderboard" />
          </Tabs>
        </AppBar>
        {value === 0 && <TabContainer>
          <CustomizedTable/>
        </TabContainer>}
          
        {value === 1 && <TabContainer>
          <UserTable/>
        </TabContainer>}
      </div>
    );
  }
}

SimpleTabs.propTypes = {
  classes: PropTypes.object.isRequired,
};

const Bar = ({percent}) => {
  return (
    <div className = "bar" style = {{ width: `${percent}%` }}/>
  )
}


const BarTextContent = () => {
  return (
    <div className = "bar-text-content">
      <Typography>
        Points<br></br>
        Assists<br></br>
        Steals<br></br>
        Blocks<br></br>
        Rebounds<br></br>
      </Typography>
    </div>
  )
}

// GRAPH
class Graph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tableData: [],
      selectedValue: {},
      loading: true
    };
  }

  componentDidMount() {
    axios.post('https://radiant-anchorage-94411.herokuapp.com/playerPercentages/', {
      "id": this.props.selectedValue.id
    }).then((response)=> {
      console.log(response.data);
      this.setState( {loading: false, tableData: response.data} );
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  
  render() {
    const { tableData } = this.state;
    for (let i = 0; i < 5; i++) {
      if (tableData[i] < 0) {
        tableData[i] = 0;
      } 
    }
    if(this.state.loading){
      return(
        <div style={{textAlign: 'center'}}>
          <CircularProgress/>
        </div>
      )
    }
    else{
      return (
      
        <div className = "graph-wrapper">
          <div className = "graph">
            <BarTextContent/>
            <div className = "bar-lines-container">
              <Bar percent={tableData[0]}/>
              <Bar percent={tableData[1]}/>
              <Bar percent={tableData[2]}/>
              <Bar percent={tableData[3]}/>
              <Bar percent={tableData[4]}/>
            </div>
          </div>
        </div>
      ) 
    }
    
  }
}

// DIALOG
class PlayerDetailsDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tableData: [],
      selectedValue: {}
    };
  }

  componentDidMount() {
    console.log(this.props);
    console.log("asdf = ", this.props.selectedValue);
    axios.post('https://radiant-anchorage-94411.herokuapp.com/playerPercentages/', {
      "id": this.props.selectedValue.id
    }).then((response)=> {
      console.log(response.data);
      this.setState( {tableData: response.data} );
    })
    .catch(function (error) {
      console.log(error);
    });
  }

   handleClose = () => {
     this.props.onClose(this.props.selectedValue);
   };


   handleListItemClick = value => {
     this.props.onClose(value);
   };
  
  render() {
    const { classes, onClose, selectedValue, ratings,...other } = this.props;
    const { tableData } = this.state;

    if (ratings[5] == 0) {
      ratings[5] = 1;
    }

    return (
      <div>
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" {...other}>
        <DialogTitle className="simple-dialog-title">Player Details</DialogTitle>
        <Card className = "details" style={{padding: '20px'}}>

        <div>
          <Typography className = "text" variant = "h8" >
            {selectedValue.firstname} {selectedValue.lastname}, {selectedValue.position}
            <br></br>
            {selectedValue.college}
          </Typography>
          
          <Typography className = "text2" variant = "h8">
            <br></br>
            Price: {selectedValue.price}
            <br></br>
            Rating: {selectedValue.rating}
          </Typography>

          <Typography>            
            <br></br>
          </Typography>

          <Graph selectedValue = {selectedValue}/>

          <Typography>
            * Improved rating by college (x{ratings[5]}) and popularity (x{ratings[6]})
          </Typography>

          <Typography>
            <br></br>
          </Typography>

          <Typography>
            <br></br>
          </Typography>
          
        </div>
        </Card>

      </Dialog>
      </div>  
    );
  }
}

class abc extends React.Component {
  render(){
    return(
      <div>
        <SimpleTabs/>
      </div>
    );
  }
}

export default withStyles(styles)(abc);