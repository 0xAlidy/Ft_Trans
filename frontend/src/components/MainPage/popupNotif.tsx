import React from 'react';
import Popup from 'reactjs-popup';
import { Socket } from 'socket.io-client';
import { User } from '../../interfaces';
import ProfileShortCut from "./ProfileShortcut";
import '../../styles/MainPage/popupNotif.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// @ts-ignore 
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

interface popupInfo {
    win:boolean,
    adv:string,
    arcade:boolean,
    scoreLose:number
}

export default class PopupNotif extends React.Component<{socket:Socket, User:User}, {popupInfo:popupInfo|null}>
{
    _isMounted = false;
    constructor(props :any) {
		super(props);
		this.state = {
			popupInfo:null,
		};
	}

    componentDidMount(){
        this._isMounted = true;
        this.props.socket.on('popupScore', (data:any) => {
            if (this._isMounted)
                this.setState({popupInfo:{win:data.win, adv:data.adv, arcade:data.arcade, scoreLose: data.scoreLose}})
        });
    }
    
    componentWillUnmount(){
		this._isMounted = false;
	}

    open = async () => {
		let page = document.getElementById("MainPage");
		if (page)
			page.classList.add("blur");
	}

	close = () => {
		let page = document.getElementById("MainPage");
		if (page)
			page.classList.remove("blur");
            this.setState({popupInfo:null})
	}

    resize = () => {
        this.close();
        let popup = document.querySelector(".popupNotif");
		if(popup)
            popup.classList.add("invisible");
    }

    render(){
        return (
            <Popup open={this.state.popupInfo ? true : false} closeOnEscape={false}  closeOnDocumentClick={true} onOpen={this.open} onClose={this.close} >
                {
                    this.state.popupInfo &&
                    <div className='popupNotif'>
                        {
                             this.state.popupInfo.arcade ?
                             <FontAwesomeIcon className="iconGameNotif" icon={solid('hat-wizard')}/>
                             :
                             <FontAwesomeIcon className="iconGameNotif" icon={solid('hand-fist')}/>
                        }
                        <div className='bodyPopupNotif'>
                            <div className='elemBody'>
                                <h3>Opponent</h3>
                                <ProfileShortCut login={this.state.popupInfo.adv} User={this.props.User} socket={this.props.socket} />
                            </div>
                            <div className='elemBody'>
                                {
                                    this.state.popupInfo.win ? 
                                    <FontAwesomeIcon className="iconNotif" icon={solid('trophy')}/>
                                    :
                                    <FontAwesomeIcon className="iconNotif" icon={solid('skull-crossbones')}/>
                                }
                            </div>
                            <div className='elemBody'>
                                <h3>Score</h3>
                                {
                                    this.state.popupInfo.win ?
                                    <h4 style={{color:"var(--win-color)"}}>5 / {this.state.popupInfo.scoreLose}</h4>
                                    :
                                    <h4 style={{color:"var(--lose-color)"}}>{this.state.popupInfo.scoreLose} / 5</h4>
                                }
                            </div>
                           
                            
                        </div>   
                    </div>
                }
            </Popup>
        )
    }
}