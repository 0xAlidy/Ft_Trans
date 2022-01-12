import React from 'react'
import '../../../../styles/MainPage/midPanel/midPanel.css'
import '../../../../styles/MainPage/midPanel/Profile/Profile.css'
// import DELETE from '../../../../assets/delete.png'
// import LEAVE from '../../../../assets/exit.png'
import EditBox from './editBox';
import Gauge from './gauge';
import WinRate from './winRate';
export default class Profile extends React.Component<{},{editMode:boolean}>{
	constructor(props :any){
		super(props)
	}
	render(){
		return (
        <div className="midPanel" id="profile">
			<img src="https://cdn.intra.42.fr/users/medium_default.png" className="profileImg"/>
			<EditBox value="sass" placeHolder="nickname"/>
			<Gauge percent="56" lvl="45"/>
			<WinRate win={80} loose={45}/>			
			{/* <img src={LEAVE} alt="" width="50px"/>
			<img src={DELETE} alt="" width="50px" /> */}
		</div>
    	)
	}
};
