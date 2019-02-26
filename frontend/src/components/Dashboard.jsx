import React, {Component} from 'react';
import axios from 'axios';
import {Player} from './Player';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import ExpandLess from '@material-ui/icons/ExpandLess';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Redirect } from 'react-router-dom';
import College from './College';
import Select from 'react-select';
import { Snackbar } from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';


const styles = theme => ({
    dashboard:{
        display: 'flex'
    },
    mainContent: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
        height: '100vh',
        overflow: 'auto',
    },
    appBarSpacer: theme.mixins.toolbar,
    logOut:{
        color: 'white',
        fontSize: '20px'
    },
})

const playerLink = 'https://radiant-anchorage-94411.herokuapp.com/players/';

class Dashboard extends Component {
    constructor(props){
        super(props);
        this.state = {
            addPlayerShown: false,
            players: [],
            username: '',
            password: '',
            balance: 0,
            points: 0,
            signout: false,
            buyError: false,
            recommendedPlayer: {
                firstname: '',
                lastname: ''
            }
        };
        this.addPlayerVisibilityChange = this.addPlayerVisibilityChange.bind(this);
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.deleteHandler = this.deleteHandler.bind(this);
        this.signOutHandler = this.signOutHandler.bind(this);
        this.fetchRecommendedPlayer = this.fetchRecommendedPlayer.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }
    addPlayerVisibilityChange(){
        this.setState({
            addPlayerShown: !this.state.addPlayerShown
        });
    }
    handleTextFieldChange(e) {
        this.setState({
            textFieldValue: e.target.value
        });
    }
    submitHandler(){
        const usersLink = 'https://radiant-anchorage-94411.herokuapp.com/users/' + this.state.id + '/'; 
        
        const playersLink = 'https://radiant-anchorage-94411.herokuapp.com/players/' + this.state.textFieldValue + '/'; 

        axios.get(playersLink).then((response) => {
            const newplayercost = parseFloat(response.data.price);
            const newplayers = this.state.players.concat([parseInt(this.state.textFieldValue)]);
            const newplayersbalance = (parseFloat(this.state.balance) - parseFloat(newplayercost)).toFixed(3);
            const options = {
                username: this.state.username,
                password: this.state.password,
                points: this.state.points,
                balance: newplayersbalance,
                players: newplayers,
                favoriteTeam: this.state.favoriteTeam,

            };
            axios.put(usersLink, options).then((response2)=>{
                let data = response2.data;
                this.setState(data);
                this.fetchRecommendedPlayer();
            }).catch((error)=>{
                this.setState({
                    buyError: true
                })
            })
        })
        
    }

    deleteHandler(pid, price){
        const usersLink = 'https://radiant-anchorage-94411.herokuapp.com/users/' + this.state.id + '/'; 
        let newplayers = this.state.players;
        let index = newplayers.indexOf(pid);
        newplayers.splice(index, 1);
        let newbalance = (parseFloat(this.state.balance) + parseFloat(price)).toFixed(3);
        newbalance = newbalance.toString();
        const options = {
            "id": this.state.id,
            "username": this.state.username,
            "balance": newbalance,
            "players": newplayers,
            "points": this.state.points,
            "password": this.state.password,
            "favoriteTeam": this.state.favoriteTeam
        };
        axios.put(usersLink, options).then((response)=>{
            let data = response.data;
            this.setState(data);
        }).catch((error)=>{
            console.log(error);
        })
    }

    handleSelectChange = (selected) => {
        this.setState({ textFieldValue: selected.value });
        console.log(this.state);
    }

    handleSnackbarClose = () => {
        this.setState({
            buyError: false
        })
    }

    signOutHandler(){
        this.setState({
            signout: true
        });
    }

    fetchRecommendedPlayer(){
        axios.post('https://radiant-anchorage-94411.herokuapp.com/Recommend/',{"id": this.props.location.state.id}).then((response)=>{
            this.setState({
                recommendedPlayer: response.data
            })
        }).catch((err)=>{console.log("err ", err)});
    }

    componentDidMount(){
        const usersLink = 'https://radiant-anchorage-94411.herokuapp.com/users/' + this.props.location.state.id + '/'; 
        axios.get(usersLink).then((response)=>{
            console.log(response);
            let data = response.data;
            //data.players = JSON.parse(data.players);
            this.setState(data);

        });
        axios.get(playerLink).then((response)=>{
            const responseData = response.data;
            let playersName = responseData.map((obj) => {
                const val = obj['firstname'] + ' ' + obj['lastname'];
                return { value: obj.id, label: val };
            });
            this.setState({
                playersName: playersName,
                playersList: response.data
            });
        });
        this.fetchRecommendedPlayer();
    }
    render(){
        const {classes} = this.props;
        const {id, username, balance, points, players} = this.state;
        if(this.state.signout){
            return(
              <Redirect to="/"/>  
            );
        } 
        return(
            <React.Fragment>
                <div className={classes.dashboard}>
                    <AppBar>
                        <Toolbar>
                            <Grid justify="space-between" container spacing={24}>
                                <Grid item>
                                    <Typography
                                        variant="h3"
                                        style={{color:'white'}}
                                    >
                                        {username}
                                    </Typography>
                                </Grid>
                                <Grid item style={{alignItems: 'center'}}>
                                    <Button variant="contained" color="secondary" onClick={this.signOutHandler} className={classes.logOut}>
                                        Log Out
                                    </Button>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    <div className={classes.appBarSpacer}/>
                    <Grid container spacing={16} >
                        <Grid item xs={12} style={{margin: '90px 10px 10px',}}>
                            <College/>
                        </Grid>
                        <Grid item xs={12}>
                            <div className={classes.mainContent}>
                                <Card style={{padding: '20px'}}>
                                    <Typography
                                        variant="h6"
                                        align="center"
                                    >
                                            Balance 💵
                                    </Typography>
                                    <Typography
                                        variant="h3"
                                        align="center"
                                    >
                                            {balance} 
                                    </Typography>
                                </Card>

                                <Card style={{padding: '20px', marginTop: '20px'}}>
                                    <Typography
                                        variant="h6"
                                        align="center"
                                    >
                                            Points 
                                    </Typography>
                                    <Typography
                                        variant="h3"
                                        align="center"
                                    >
                                            {points} 
                                    </Typography>
                                </Card>
                                
                                <Card style={{marginTop: '15px', padding: '20px'}}>
                                    <Typography
                                        variant="h6"
                                        align="center"
                                    >
                                            Owned Players 
                                    </Typography>
                                    <div style={{margin: '15px'}}>
                                        <Button variant="fab" color="primary" aria-label="Add" onClick={this.addPlayerVisibilityChange}>
                                            <AddIcon />
                                        </Button>
                                    </div>
                                    <Collapse in={this.state.addPlayerShown}>
                                        <Card style={{ zIndex: 100, bottom: "35px!important", margin: '15px', padding: '20px', overflow: 'visible'}}>
                                            <Button onClick={this.addPlayerVisibilityChange}>
                                                <ExpandLess/>
                                            </Button>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                <Typography align="center" noWrap variant="h6">
                                                    We recommend you to buy
                                                </Typography>
                                                <Typography style={{margin: '30px'}} align="center" noWrap variant="h4">
                                                    {this.state.recommendedPlayer.firstname + ' ' + this.state.recommendedPlayer.lastname}
                                                </Typography>
                                            </div>
                                            
                                            <CardContent>
                                                <form>

                                                    <Select className={classes.textField}
                                                        isSearchable
                                                        placeholder="Player name"
                                                        options={this.state.playersName}
                                                        onChange={this.handleSelectChange}
                                                        style={{}}
                                                    />
                                                    <Button style={{margin: '30px'}} variant="contained" onClick={this.submitHandler}>
                                                        BUY
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </Collapse>
                                    <Grid container spacing={16}>
                                            {
                                                players.map(
                                                    (pid) => {
                                                        return(
                                                            <Grid item key={pid}>
                                                                <Player key={pid} pid={pid} deleteHandler={this.deleteHandler}/>
                                                            </Grid>
                                                        );
                                                    }
                                                )
                                            }
                                    </Grid>
                                </Card>

                            </div>
                        </Grid>
                    </Grid>
                    <Snackbar
                        open={this.state.buyError} 
                        onClose={this.handleSnackbarClose}
                        message={<span id="message-id">Failed to buy player</span>} 
                        action={[
                            <IconButton
                                onClick={this.handleSnackbarClose}
                                color="inherit"
                            >
                                <CloseIcon />
                            </IconButton>
                        ]}
                    />
                </div>
            </React.Fragment>
            
        );
    }
}

export default withStyles(styles)(Dashboard);