import React, {Component} from 'react';
import axios from 'axios';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { Link, Redirect } from 'react-router-dom';
import Select from 'react-select';
import HomeIcon from '@material-ui/icons/Home';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

const nbaTeams = [{'value': 'UIUC', 'label': 'UIUC'}, {'value': 'Kentucky', 'label': 'Kentucky'}, {'value': 'Louisiana State ', 'label': 'Louisiana State '}, {'value': 'Duke', 'label': 'Duke'}, {'value': 'Oklahoma', 'label': 'Oklahoma'}, {'value': 'Texas', 'label': 'Texas'}, {'value': 'Irvine', 'label': 'Irvine'}, {'value': 'Purdue', 'label': 'Purdue'}, {'value': 'Arizona State ', 'label': 'Arizona State '}, {'value': 'Davidson', 'label': 'Davidson'}, {'value': 'Virginia', 'label': 'Virginia'}, {'value': 'Michigan', 'label': 'Michigan'}, {'value': 'Northwestern', 'label': 'Northwestern'}, {'value': 'Stanford', 'label': 'Stanford'}, {'value': 'Berkeley', 'label': 'Berkeley'}, {'value': 'Harvard', 'label': 'Harvard'}, {'value': 'Georgia Tech', 'label': 'Georgia Tech'}, {'value': 'Kansas', 'label': 'Kansas'}];
const styles = theme => ({
    paper:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `70px`,
    },
    container:{
        display: 'block',
        margin: '150px',
    },
    form: {
        marginTop: theme.spacing.unit,
    },
})

const usersLink = 'https://radiant-anchorage-94411.herokuapp.com/users/';

class Signup extends Component {
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            favoriteTeam: '',
            redirect: false,
            id: undefined,
            loginErrorSnackbarOpen: false
        }
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
    }

    handleTextFieldChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleSelectChange = (selected) => {
        this.setState({ favoriteTeam: selected.value });
    }

    submitHandler() {
        const options = {
            username: this.state.username,
            password: this.state.password,
            favoriteTeam: this.state.favoriteTeam,
            balance: '5000',
            players: [],
            points: 0
        };
        console.log("opt = ", options);
        axios.post("https://radiant-anchorage-94411.herokuapp.com/users/", options).then((response)=>{
            this.setState({
                id: response.data.id,
                redirect: true
            });
        }).catch((errors)=>{
            this.setState({
                loginErrorSnackbarOpen: true
            });
        })
    }

    handleSnackbarClose() {
        this.setState({
            loginErrorSnackbarOpen: false
        });
    }

    handleEnter(ev){
        if (ev.key === 'Enter') {
            this.loginButtonHandler();
            ev.preventDefault();
        }
    }

    render(){
        const { classes } = this.props;
        const {favoriteTeam} = this.state
        if (this.state.redirect) {
            return (
                <Redirect to= {{ pathname: '/dashboard', state: { id: this.state.id } }} />
            )
        }
        return(
            <div className={classes.container}>
                <Link to="/">
                    <Button>
                        <HomeIcon fontSize="large"/>
                    </Button>
                </Link>
                <Paper className={classes.paper}>
                    <Typography variant="h4">
                        Sign Up
                    </Typography>
                    <form className={classes.form}>  
                        <TextField style={{margin: '20px 0'}} name="username" label="Username" fullWidth onChange={this.handleTextFieldChange} />
                        <TextField style={{margin: '20px 0'}} name="password" type="password" label="Password" fullWidth onChange={this.handleTextFieldChange}/>
                        <Select
                            style={{margin: '20px 0'}}
                            isSearchable
                            placeholder="Favorite Team"
                            options={nbaTeams}
                            onChange={this.handleSelectChange}
                        />
                        <Button
                            className={classes.form}
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={this.submitHandler}
                            >
                            Register
                        </Button>
                    </form>
                </Paper>
                <Snackbar 
                    open={this.state.loginErrorSnackbarOpen} 
                    onClose={this.handleSnackbarClose}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }} 
                    message={<span id="message-id">Signup failed</span>} 
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.handleSnackbarClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    ]}
                />
            </div>
        );
    }
}

export default withStyles(styles)(Signup);