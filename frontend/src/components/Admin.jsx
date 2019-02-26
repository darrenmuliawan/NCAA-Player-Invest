import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Select from 'react-select';
import axios from 'axios';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from '@material-ui/core/Snackbar';

const styles = theme => ({
    container:{
        display: 'flex'
    },
    mainContent: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
        height: '100vh',
        overflow: 'auto',
    },
    paper:{
        padding: '40px',
    },
    textField:{
        margin: '30px',
    },
    appBarSpacer: theme.mixins.toolbar,
    passwordContainer:{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)'
    }
});

const playerLink = 'https://radiant-anchorage-94411.herokuapp.com/players/';

const searchObjectById = (id, arr) => {
    for (var obj of arr) {
        if(obj.id === id){
            return obj;
        }
    }
    return -1;
}

const correctPassword = 'admin';

class Admin extends Component{
    constructor(props){
        super(props);
        this.state = {
            loggedIn: false,
            players: [],
            selectedId: '',
            selectedName: '',
            selectedPlayer: {
                id: 0,
                ppg: '0',
                spg: '0',
                apg: '0',
                bpg: '0',
                rpg: '0'
            },
            successUpdating: false,
            failUpdating: false,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.submitClickHandler = this.submitClickHandler.bind(this);
        this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
    }

    componentDidMount(){
        axios.get(playerLink).then((response)=>{
            const responseData = response.data;
            let playersName = responseData.map((obj) => {
                const val = obj['firstname'] + ' ' + obj['lastname'];
                return { value: obj.id, label: val };
            });
            this.setState({
                playersName: playersName,
                players: response.data
            });
        });
    }

    handleChange = (selected) => {
        console.log("s = ", selected);
        const player = searchObjectById(selected.value, this.state.players);
        console.log("p = ", player);

        this.setState({ selectedId: selected.value, selectedPlayer: player, selectedName: player.name });
        console.log(this.state);
    }

    handleTextFieldChange(e) {
        let newSelectedPlayer = this.state.selectedPlayer;
        let value = e.target.value;
        console.log(value);
        newSelectedPlayer[e.target.name] = value;
        
        this.setState({
            selectedPlayer: newSelectedPlayer
        });
    }

    handlePasswordChange(e) {
        console.log(this.state.password);
        this.setState({
            password: e.target.value
        },()=>{console.log(this.state.password)});
    }

    submitClickHandler() {
        console.log(this.state.selectedPlayer);
        axios.put(playerLink + this.state.selectedPlayer.id + '/', this.state.selectedPlayer).then((response)=>{
            this.setState({
                successUpdating: true
            });
        }).catch((err)=>{
            this.setState({
                failUpdating: true
            });
        })
    }

    handleSnackbarClose(){
        this.setState({
            successUpdating: false,
            failUpdating: false
        })
    }

    handleEnter(){
        if(this.state.password===correctPassword){
            this.setState({
                loggedIn: true
            });
        }
    }
    render(){
        const { classes } = this.props;
        if(!this.state.loggedIn){
            return(
                <div className={classes.passwordContainer}>
                    <TextField type="password" onChange={this.handlePasswordChange} onKeyPress={this.handleEnter} name="password" value={this.state.password} className={classes.textField} />
                </div>
            )
        } else{
            return(
                <div className={classes.container}>
                    <AppBar>
                        <Toolbar>
                            <Typography
                                variant="h3"
                            >
                                Admin Page
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <div className={classes.mainContent}>
                        <div className={classes.appBarSpacer}/>
                        <Paper className={classes.paper}>
                            <Typography variant="h4">
                                Update Player Scores
                            </Typography>
                            <Grid container spacing={24}>
                                <Grid item xs={12} style={{overflow:'visible', zIndex: 5}}>
                                    <Select className={classes.textField}
                                        isSearchable
                                        placeholder="Player name"
                                        options={this.state.playersName}
                                        onChange={this.handleChange}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField onChange={this.handleTextFieldChange} name="ppg" InputLabelProps={{ shrink: true }} variant="outlined" value={this.state.selectedPlayer.ppg} className={classes.textField} label="PPG"/>
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField onChange={this.handleTextFieldChange}  name="rpg" InputLabelProps={{ shrink: true }} variant="outlined" value={this.state.selectedPlayer.rpg} className={classes.textField} label="RPG"/>
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField onChange={this.handleTextFieldChange}  name="apg"  InputLabelProps={{ shrink: true }} variant="outlined" value={this.state.selectedPlayer.apg} className={classes.textField} label="APG"/>
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField onChange={this.handleTextFieldChange}  name="spg"  InputLabelProps={{ shrink: true }} variant="outlined" value={this.state.selectedPlayer.spg} className={classes.textField} label="SPG"/>
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField onChange={this.handleTextFieldChange}  name="bpg"  InputLabelProps={{ shrink: true }} variant="outlined" value={this.state.selectedPlayer.bpg} className={classes.textField} label="BPG"/>
                                </Grid>
    
                            </Grid>
                            <Button className={classes.textField}
                                fullWidth
                                onClick={this.submitClickHandler}
                                variant="contained"
                                color="primary">
                                Submit
                            </Button>
                            
                        </Paper>
                    </div>
                    <Snackbar 
                        open={this.state.successUpdating} 
                        onClose={this.handleSnackbarClose}
                        message={<span id="message-id">Success</span>} 
                        action={[
                            <IconButton
                                key="close"
                                color="inherit"
                                onClick={this.handleSnackbarClose}
                            >
                                <CloseIcon />
                            </IconButton>
                        ]}
                    />
                                    <Snackbar 
                        open={this.state.failUpdating} 
                        onClose={this.handleSnackbarClose}
                        message={<span id="message-id">Failed</span>} 
                        action={[
                            <IconButton
                                key="close"
                                color="inherit"
                                onClick={this.handleSnackbarClose}
                            >
                                <CloseIcon />
                            </IconButton>
                        ]}
                    />
                </div>
            )
        }
        
    }
}

export default withStyles(styles)(Admin);