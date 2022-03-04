import * as React from "react";
import ProfileShortCut from "../../../ProfileShortcut";
import '../../../../../styles/MainPage/midPanel/History/History.css'
import Nickname from "../../../../utility/utility";
import { Socket } from "socket.io-client";
import { User } from "../../../../../interfaces";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// @ts-ignore
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'


export default class ItemMatch extends React.Component<{match:string, name:any, socket:Socket, user:User},{isArcade:boolean,WinnerName:any, WinnerScore:any, LooserName:any, LooserScore:any}>{
	constructor(props:any) {
		super(props)
		var arr = this.props.match.split('/');
		this.state = {
			WinnerName: arr.at(0),
			WinnerScore: arr.at(1),
			LooserName: arr.at(2),
			LooserScore: arr.at(3),
			isArcade: (arr.at(4) === 'true' ? true:false)
		}
	};
	render(){
		return (
			<>
			{
				this.props.name === this.state.WinnerName ?
				<div className="itemMatch itemMatch-win">
					<div className="item-match-section">
						<ProfileShortCut login={this.props.name} User={this.props.user} socket={this.props.socket} />
						<div className="name">
						<Nickname login={this.state.WinnerName}/>
						</div>
						<div className="score">
							{this.state.WinnerScore}
						</div>
					</div>
					<div className="vs">
					{
						this.state.isArcade ?
						<FontAwesomeIcon className="iconBattle" icon={solid('hat-wizard')}/>
						:
						<FontAwesomeIcon className="iconBattle" icon={solid('hand-fist')}/>	
					}
					</div>
					<div className="item-match-section">
						<div className="score">
							{this.state.LooserScore}
						</div>
						<div className="name">
						<Nickname login={this.state.LooserName}/>
						</div>
						<ProfileShortCut login={this.state.LooserName} User={this.props.user} socket={this.props.socket} />
					</div>
				</div>
				:
				<div className="itemMatch itemMatch-lose">
					<div className="item-match-section">
						<ProfileShortCut login={this.props.name} User={this.props.user} socket={this.props.socket} />
						<div className="name">
						<Nickname login={this.state.LooserName}/>
						</div>
						<div className="score">
							{this.state.LooserScore}
						</div>
					</div>
					<div className="vs">
					{
						this.state.isArcade ?
						<FontAwesomeIcon className="iconBattle" icon={solid('hat-wizard')}/>
						:
						<FontAwesomeIcon className="iconBattle" icon={solid('hand-fist')}/>	
					}
					</div>
					<div className="item-match-section">
						<div className="score">
							{this.state.WinnerScore}
						</div>
						<div className="name">
						<Nickname login={this.state.WinnerName}/>
						</div>
						<ProfileShortCut login={this.state.WinnerName} User={this.props.user} socket={this.props.socket} />
					</div>
				</div>
			}
			</>
		)
	}
};
