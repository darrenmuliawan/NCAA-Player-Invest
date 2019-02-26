import React, {Component} from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Snackbar from '@material-ui/core/Snackbar';
import LockIcon from '@material-ui/icons/LockOutlined';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
    paper:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `70px`,
    },
    container:{
        display: 'block',
        margin: '100px',
        textAlign: 'center',
    },
    form: {
        marginTop: theme.spacing.unit,
    },
})

const apiLink = 'https://radiant-anchorage-94411.herokuapp.com/login/';

class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            redirect: false,
            id: undefined,
            loginErrorSnackbarOpen: false
        }
        this.loginButtonHandler = this.loginButtonHandler.bind(this);
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
        this.handleEnter = this.handleEnter.bind(this);
    }

    loginButtonHandler(){
        const options = {
            username: this.state.username,
            password: this.state.password
        }
        axios.post(apiLink, options).then((response)=>{
            this.setState({
                id: response.data.id,
                redirect: true
            })
        }).catch((error)=>{
            this.setState({
                loginErrorSnackbarOpen: true
            });
        });
    }

    handleTextFieldChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
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
        if (this.state.redirect){
            return (
                <Redirect to= {{ pathname: '/dashboard', state: { id: this.state.id } }} />
            )
        }
        const {classes} = this.props;
        return(
            <div className={classes.container}>
                <Typography variant="h2">
                🏀 TBD 🏀
                </Typography>
                <Paper className={classes.paper}>
                    <Avatar>
                        <LockIcon />
                    </Avatar>
                    <Typography  variant="h4">
                        Sign In
                    </Typography>
                    <form className={classes.form}>  
                        <TextField 
                            name="username" 
                            onChange={this.handleTextFieldChange} 
                            label="Username" 
                            fullWidth
                            onKeyPress={this.handleEnter}
                            />
                        <TextField 
                            name="password" 
                            type="password" 
                            onChange={this.handleTextFieldChange} 
                            label="Password" 
                            fullWidth
                            onKeyPress={this.handleEnter}
                            />
                        <Button
                        className={classes.form}
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={this.loginButtonHandler}
                            >
                            Sign In
                        </Button>

                        <Typography className={classes.form}>
                            Don't have an account yet?
                        </Typography>
                        <Link to="/signup">
                            <Button
                                className={classes.form}
                                fullWidth
                                variant="contained"
                                color="primary"
                                >
                                Sign Up
                            </Button>
                        </Link>
                    </form>
                </Paper>
                <Link to="/secretadmin123">
                    <Button variant="contained" style ={{margin:'50px', top: '100px'}}  color="primary">
                        Admin
                    </Button>
                </Link>
                
                <Snackbar 
                    open={this.state.loginErrorSnackbarOpen} 
                    onClose={this.handleSnackbarClose}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }} 
                    message={<span id="message-id">Wrong username or password</span>} 
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
        )
    }
}

export default withStyles(styles)(Login);