import React, {Component} from 'react';
import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import DeleteIcon from '@material-ui/icons/Delete';
import { ButtonBase } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

const formStlyes = theme => ({

});

const cardStyles = theme => ({

});

class PlayerDetail extends Component{
    handleClose = () => {
        this.props.onClose();
    };

    render(){
        const {firstname, lastname} = this.props;
        return(
            <Dialog onClose={this.handleClose}>
                <Card>
                    <DialogTitle>{firstname + lastname}</DialogTitle>
                    
                </Card>
            </Dialog>
        )
    }
}

class Player extends Component {
    constructor(props){
        super(props);
        this.state={
            firstname: '',
            lastname: '',
            ppg: 0,
            price: 0,
            openDialog: false,
            imageLink: '',
        };
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }
    componentDidMount(){
        const playerLink = 'https://radiant-anchorage-94411.herokuapp.com/players/' + this.props.pid + '/'; 
        axios.get(playerLink).then((response)=>{
            console.log(response);
            this.setState(response.data);
        }).then(()=>{
            fetch("https://api.cognitive.microsoft.com/bing/v7.0/images/search?q="+this.state.firstname+' '+this.state.lastname + ' NCAA', 
            {headers:{'Ocp-Apim-Subscription-Key': 'b720fa9c25da425d838ff66355012985'}}
            ).then((response)=>{return response.json();}).then((response)=>{
                console.log(response);
                this.setState({
                    imageLink: response.value[0]["thumbnailUrl"]
                });
            });
        });
    }

    openDialog(){
        this.setState({
            openDialog: true
        },()=>{console.log(this.state)})
    }

    closeDialog(){
        this.setState({
            openDialog: false
        })
    }

    render(){
        const {pid} = this.props;
        const {firstname, lastname, rating, ppg, rpg, apg, bpg, spg, price, college} = this.state;
        return(
            <Card>
                <ButtonBase onClick={this.openDialog}>
                    <CardContent>
                        <Typography variant="h4">
                            {firstname} {lastname}
                        </Typography>
                        <Typography>
                            Rating: {rating}
                        </Typography>
                        <Typography>
                            Price: {price}
                        </Typography>
                    </CardContent>
                </ButtonBase>
                <Dialog onClose={this.handleClose} open={this.state.openDialog} onClose={this.closeDialog}>
                    <Card style={{padding: '30px', overflow: 'visible'}}>
                        <Typography align="center" variant="h2">{firstname + ' ' + lastname}</Typography>
                        <div style={{textAlign:'center'}}>
                            <img style={{borderRadius: '20px'}} width={200} height={200}  src={this.state.imageLink}/>
                        </div>
                        <Typography align="center" variant="h5">
                            Price: {price}
                        </Typography>
                        <Typography align="center" variant="h5">
                            Rating: {rating}
                        </Typography>
                        <Typography align="center" variant="h5">
                            College: {college}
                        </Typography>
                        <Typography align="center" variant="h5">
                            PPG: {ppg}
                        </Typography>
                        <Typography align="center" variant="h5">
                            RPG: {rpg}
                        </Typography>
                        <Typography align="center" variant="h5">
                            APG: {apg}
                        </Typography>
                        <Typography align="center" variant="h5">
                            BPG: {bpg}
                        </Typography>
                        <Typography align="center" variant="h5">
                            SPG: {spg}
                        </Typography>
                        <div style={{textAlign: 'center'}}>
                            <Button variant="contained" onClick={() => {this.props.deleteHandler(pid, price)}} >
                                SELL
                            </Button>
                        </div>

                    </Card>
                </Dialog>
            </Card>
        );
    }
}


export {Player};