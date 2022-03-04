import React from 'react'
import Chat from './Chat/Chat'
import '../../styles/MainPage/MainPage.css'
import '../../styles/MainPage/utility.css'
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { io, Socket} from "socket.io-client";
import Menu from './Menu/Menu';
import IGame from './midPanel/Game/Game';
import Profile from './midPanel/Profile/Profile';
import History from './midPanel/History/History';
import AdminPanel from './midPanel/AdminPanel/AdminPanel';
import axios from 'axios';
import PopupStart from './PopupStart';
import FriendPanel from './midPanel/FriendsPanel/FriendPanel';
import MatchMaking from './midPanel/MatchMaking/MatchMaking';
import { User } from '../../interfaces'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {DuelButton, DuelNotif, InviteButton, InviteNotif, PendingInviteButton, PendingInviteNotif, PendingSearchButton, PendingSearchNotif} from '../utility/utility';
import PopupNotif from './popupNotif';

interface popupScore{open:boolean, win:boolean, adv:string}

export default class MainPage extends React.Component<{ token: string, invite:boolean },{inGame:boolean, loginHistory:string|null, lastSelect:string, gameOpen:false, token:string, selector: string, socket: Socket|null, User:User|null, popupOpen:boolean, popupInfo:popupScore | null, searching:boolean}>{

	menuState: any
	selector : any;
	ref:any;
	constructor(props :any) {
		super(props);
		this.state = {
			loginHistory: null,
			popupInfo:null,
			lastSelect:'game',
			gameOpen:false,
			selector: 'game',
			socket: null,
			User: null,
			popupOpen: false,
			inGame:false,
			token: this.props.token,
			searching: false
		};
		this.ref = React.createRef();
	}
	async componentDidMount() {
		if (this.state.token)
		{
			await axios.get("HTTP://" + window.location.host.split(":").at(0) + ":667/auth/me?token=" + this.state.token).then(res => {
				this.setState({ User: res.data })
			})
			window.onpopstate = (event:any) => {
				if(event){
					console.log(window.history.state)
					if (window.history.state)
					{
						if (window.history.state.loginHistory)
							this.setState({loginHistory: window.history.state.loginHistory})
						else
							this.setState({loginHistory:null})
						if (window.history.state.selector)
							this.setState({selector: window.history.state.selector})
					}
					else
					{
						window.location.href = "HTTP://" + window.location.host.split(":").at(0) + ":3000";
					}
				}
			}
			if (this.state.User)
			{
					window.history.pushState({selector: this.state.selector}, '', "/");
					if (this.state.User.color)
						document.documentElement.style.setProperty('--main-color', this.state.User.color);
					this.setState({socket: io('http://' + window.location.href.split('/')[2].split(':')[0] + ':667',{query:{token:this.props.token}})})
					if (this.state.socket)
					{
						this.state.User.waitingFriends.forEach(element => {
							this.notify(element);
						});
						this.state.socket.on('kickConnect', () => {
							window.location.href = "HTTP://" + window.location.host.split(":").at(0) + ":3000";
						});
						this.state.socket.on('openHistoryOf', (data:any) => {
							this.setState({loginHistory: data.login, selector:'history'},() => window.history.pushState({selector: this.state.selector, loginHistory:this.state.loginHistory}, '', "/"))
						});
						this.state.socket.on('startGame', () => {
							this.openGame();
						});
						this.state.socket.on('closeGame', () => {
							this.closeGame();
						});
						this.state.socket.on('pendingSearch', () => {
							this.pendingSearch();
						});
						this.state.socket.on('pendingInvite', (data:any) => {
							this.pendingInvite(data.login);
						});
						this.state.socket.on('chatNotif', (data:any) => {
							this.chatNotify(data.msg);
						});
						this.state.socket.on('chatNotifError', (data:any) => {
							this.chatNotifyError(data.msg);
						});
						this.state.socket.on('inviteNotif', (data:any) => {
							this.notify(data.login);
						});
						this.state.socket.on('inviteDuel', (data:any) => {
							this.notifyDuel(data.adv, data.room);
						});
						this.state.socket.on('SearchStatus', (data:any) => {
							this.setState({searching: data.bool});
						})
						this.state.socket.on('refreshUser', async (data:any) =>
						{
							if (this.state.User && this.state.User.login === data.login)
							{
								await axios.get("HTTP://" + window.location.host.split(":").at(0) + ":667/auth/me?token=" + this.state.token).then(res => {
									this.setState({ User: res.data })
								})
							}
						});
					}
					else
						console.log("ERROR socket")
			}
		}
	}
	chatNotifyError = (msg:string) => {
		toast.error(msg, {
			position: "top-left",
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: true,
			progress: undefined,
		});
	}
	chatNotify = (msg:string) =>{
		toast(msg, {
			position: "top-left",
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: true,
			progress: undefined,
		});
	}
	notify = (login:string) => {
		if (this.state.socket && this.state.User)
		{
			var ret: JSX.Element = <InviteNotif user={this.state.User} socket={this.state.socket} login={login}/>
			var er: JSX.Element = <InviteButton login={login} socket={this.state.socket}/>
			toast(ret, { className: 'notif', bodyClassName: "bodyNotif", closeButton:er });

			// onCLose refreshUser ?
			// toast.dark(<DuelNotif token={this.props.token} login={login} socket={this.state.socket}/>); PAS TOUCHE JE VAIS OUBLIER SINON
		}
	}
	pendingSearch = () => {
		if (this.state.socket && this.state.User)
		{
			var ret: JSX.Element = <PendingSearchNotif />
			var er: JSX.Element =  <PendingSearchButton socket={this.state.socket}/>
			toast(ret, { className: 'notif', bodyClassName: "bodyNotif", closeButton:er });

			// onCLose refreshUser ?
			// toast.dark(<DuelNotif token={this.props.token} login={login} socket={this.state.socket}/>); PAS TOUCHE JE VAIS OUBLIER SINON
		}
	}
	pendingInvite = (login:string) => {
		if (this.state.socket && this.state.User)
		{
			var ret: JSX.Element = <PendingInviteNotif user={this.state.User} socket={this.state.socket} login={login}/>
			var er: JSX.Element =  <PendingInviteButton login={login} socket={this.state.socket}/>
			toast(ret, { className: 'notif', bodyClassName: "bodyNotif", closeButton:er });

			// onCLose refreshUser ?
			// toast.dark(<DuelNotif token={this.props.token} login={login} socket={this.state.socket}/>); PAS TOUCHE JE VAIS OUBLIER SINON
		}
	}
	notifyDuel = (login:string, room:string) => {
		if(this.state.socket && this.state.User && this.state.inGame === false)
		{
			var ret: JSX.Element = <DuelNotif user={this.state.User} login={login} socket={this.state.socket}/>
			var er: JSX.Element = <DuelButton room={room} login={login} socket={this.state.socket}/>
			toast(ret, { className: 'notif', bodyClassName: "bodyNotif", closeButton:er });
			// onCLose refreshUser ?
			// toast.dark(<DuelNotif token={this.props.token} login={login} socket={this.state.socket}/>); PAS TOUCHE JE VAIS OUBLIER SINON
		}
	}

	CompleteProfile = (User:User) => {
		this.setState({ User: User });
	}

	openGame(){
		this.ref.current.openGame();
		this.setState({lastSelect: this.state.selector, inGame:true})
		this.setState({selector:'none'})
	}

	closeGame(){
		this.ref.current.closeGame();
		this.setState({selector:this.state.lastSelect, inGame:false})
	}

	closePopup(){

	}

	menuChange = (selector: string) => {
		this.setState({selector: selector, loginHistory:null}, () => {window.history.pushState({selector: this.state.selector}, '', "/")});
	}

	render(){
		return (
		<>
			<ToastContainer
				className="notifContainer"
				position="top-left"
				autoClose={false}
				hideProgressBar={false}
				newestOnTop
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				draggable
			/>
			<div id="MainPage">
				{this.state.User && this.state.socket &&
				<>
					<div className="logo">
						<Logo className="mainLogo"/>
					</div>
					<Menu blocked={this.state.inGame} forceHistory={this.state.loginHistory? true: false} User={this.state.User} selector={this.state.selector} onChange={this.menuChange} socket={this.state.socket}/>
					<Chat socket={this.state.socket} User={this.state.User} />
					<div className="game" id="game">
						{this.state.selector === 'profile' && <Profile token={this.props.token} socket={this.state.socket}/>}
						{this.state.selector === 'history' && <History login={this.state.loginHistory} User={this.state.User} socket={this.state.socket}/>}
						{this.state.selector === 'admin' && <AdminPanel/>}
						{this.state.selector === 'game' && <MatchMaking user={this.state.User} socket={this.state.socket} searching={this.state.searching}/>}
						{this.state.selector === 'friends' && <FriendPanel User={this.state.User} socket={this.state.socket}/>}
						{this.state.selector === 'rules' && <p>RULES</p>}
						<IGame ref={this.ref} socket={this.state.socket}/>
					{/* <button onClick={this.notify}>oui</button> */}
					</div>
					<PopupNotif User={this.state.User} socket={this.state.socket}/>
					{/*this.state.popupInvite && <Popup open={this.state.popupInvite.open} closeOnEscape={false}  onClose={() => this.setState({popupInfo:{open:false, win:true, adv:''}})} closeOnDocumentClick={true}>{this.state.popupInfo.win ? 'You win against ': 'You loose against'}{this.state.popupInfo.adv}<br/>{this.state.popupInfo.win && 'xp + 50'}</Popup>*/}
					<PopupStart User={this.state.User} onChange={this.CompleteProfile} invite={this.props.invite}/>
				</>
				}
			</div>
		</>
    	)
	}
};
