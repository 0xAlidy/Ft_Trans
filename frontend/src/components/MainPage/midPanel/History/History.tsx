import React from 'react'
import '../../../../styles/MainPage/midPanel/midPanel.css'
import '../../../../styles/MainPage/midPanel/History/History.css'
import ItemMatch from './itemMatch/itemMatch'
import axios from "axios";
import { user } from '../../MainPage';
import { Socket } from 'socket.io-client';


export default class History extends React.Component<{User:user, socket:Socket},{matchs:string[]}>{
	MatchList: any = [];
	constructor(props:any) {
		super(props)
		this.state={
				matchs:[],
			}
	};

	async componentDidMount() {
		var data = (await axios.get("http://" + window.location.host.split(":").at(0) + ":667/matchs?name="+ this.props.User.login +"&token="+ this.props.User.token)).data;
		this.setState({matchs: data});
		const box = document.getElementById("boxMatchs");
		const shadow = document.getElementById("shadow");
		const title = document.getElementById("title");
		if (box !== null && shadow !== null && title !== null)
			box.addEventListener("scroll", function() { 
				if (this.scrollTop > 40)
				{
					shadow.style.boxShadow= "0px -11px 20px 13px var(--main-color)";
					title.style.boxShadow= "none";
				}
				else
					title.style.boxShadow= "0px 16px 13px 0px hsl(0deg 0% 7%)";
			});
	}

	render(){
		return (
        <div className="midPanel">
			<div id="history">
				<h1 id="title">History</h1>
				<span id="shadow"></span>
				<div id="boxMatchs">
				{
					this.state.matchs.map((item, idx) => {
<<<<<<< HEAD
						console.log(item , idx)
						return <ItemMatch match={item} token={this.props.User.token} socket={this.props.socket} user={this.props.User} name={this.props.User.login} key={idx}/>;
=======
						return <ItemMatch match={item} token={this.props.User.token} socket={this.props.socket} name={this.props.User.login} key={idx}/>;
>>>>>>> b948ac6d80c97fe769d364e3006bcf52478ddcd2
					})
				}
				</div>
			</div>
		</div>
    	)
	}
};
