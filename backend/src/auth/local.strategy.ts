import { Injectable } from "@nestjs/common"
import {PassportStrategy} from "@nestjs/passport"
import { AuthService } from "./auth.service"
import {Strategy, Profile} from "passport-42"

@Injectable()
export class FTStrategy extends PassportStrategy(Strategy, '42')
{
	constructor(private authServe: AuthService){
		super({
			clientID: 'd42d44ee8052b31b332b4eb135916c028f156dbb4d3c7e277030f3b2bc08d87c',
			clientSecret: '516c1e7a1740a373e17e3c9479a383135671934c408e191cd7aec9b0a996f10e',
			callbackURL: "http://localhost:667/auth/redirect"
		  });
	}
	async validate(accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user: any, info?: any) => void): Promise<any> {
		console.log(profile);
		const user = await this.authServe.validateUser(accessToken, profile.username);
		console.log(user);
		const payload = {
		  user,
		  accessToken,
		};
		// console.log(user);
		return user;
	  }
}

