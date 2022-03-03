import React from "react";
import { Socket } from "socket.io-client";
import '../../../../styles/MainPage/midPanel/midPanel.css'
import '../../../../styles/MainPage/midPanel/MatchMaking/MatchMaking.css'
import { User } from "../../../../interfaces";
import ItemSpec from "./itemSpec";
import { specRooms } from "../../../../interfaces";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// @ts-ignore 
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'


export default class MatchMaking extends React.Component<{socket:Socket, user:User},{Searching:boolean, select:number, rooms:specRooms[]}>{
	constructor(props :any) {
		super(props);
		this.state = {
			Searching:false,
			select: 0,
			rooms:[]
		}
	}
	
	componentDidMount(){
		this.props.socket.emit("getRooms")
		this.props.socket.on('SpecRooms', (data:any) => {
			data.spec.token = this.props.user.token
			this.setState({rooms: data.spec})
		})
		this.props.socket.on('SearchStatus', (data:any) => {
			this.setState({Searching: data.bool})
		})
		/* CHANGE SEARCH BY BACK NOT BY STATE */

		const box = document.getElementById("spectatePanel");
		const shadow = document.getElementById("shadow");
		const title = document.getElementById("vsPanelMenu");
		if (box !== null && shadow !== null && title !== null)
			box.addEventListener("scroll", function() {
				if (this.scrollTop > 5)
				{
					shadow.style.boxShadow= "0px -11px 20px 13px var(--main-color)";
					title.style.boxShadow= "none";
				}
				else
					title.style.boxShadow= "0px 16px 13px 0px hsl(0deg 0% 7%)";
			});
	}

	OpenSpectate = () =>{
		this.setState({ select:1 });
		let spectate = document.querySelector(".spectate");
		let versus = document.querySelector(".versus");
        if (spectate && versus)
		{
            spectate.classList.add('active');
			versus.classList.remove('active');
		}
	}

	OpenVersus = () =>{
		this.setState({ select:0 });
		let spectate = document.querySelector(".spectate");
		let versus = document.querySelector(".versus");
        if (spectate && versus)
		{
            spectate.classList.remove('active');
			versus.classList.add('active');
		}
	}

	onSpecClick = (room:string) =>
	{
		this.props.socket.emit('specRoom', {room: room});
	}

	render(){
		return (
			<div className="midPanel">
				<div id="matchmakingPanel">
					<div id='vsPanelMenu'>
						<div className="title versus active" onClick={this.OpenVersus}>Versus</div>
						<div className="title spectate" onClick={this.OpenSpectate}>Spectate</div>
					</div>
					<span id="shadow"></span>
					{	this.state.select === 0 ?
					 	<div id="vsPanel">
							{	!this.state.Searching ?
								<>
									<h2>Select your game mode</h2>
									<div className="gameButtonBox">
										<button className="gameButton" value='SEARCH'  onClick={() => {this.props.socket.emit('searchRoom'); this.setState({Searching:true})}}>
											<FontAwesomeIcon icon={solid('hand-fist')}/>
											<h3>Normal</h3>
										</button>
										<button className="gameButton" value='SEARCH'  onClick={() => {this.props.socket.emit('searchArcade'); this.setState({Searching:true})}}>
											<FontAwesomeIcon icon={solid('hat-wizard')}/>
											<h3>Arcade</h3>
										</button>
									</div>
								</>
								:
								<>
									<h2>Looking for a game . . .</h2>
									<button className="gameButton cancelButton" value='CANCEL' onClick={() => {this.props.socket.emit('cancel'); this.setState({Searching:false})}}>
										<h4>Cancel</h4>
									</button>
								</>
							}
						</div>
						:
						<div id="spectatePanel">
							{	this.state.rooms.map((item :specRooms) => {
									return <ItemSpec data={item} onSpecCLick={this.onSpecClick} user={this.props.user} socket={this.props.socket} key={item.name}/>;		
								})
							}
						</div>
					}
				</div>	
			</div>
    	)
	}
};
