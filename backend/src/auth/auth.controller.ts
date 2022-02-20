import { Controller, Get, HttpStatus, Post, Redirect, Req, Request, Res, UseGuards, Response, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import querystring from 'querystring'
import { UsersService } from '../user/users.service';

@Controller('/auth')
export class AuthController {
    constructor(private readonly UsersService: UsersService) { }

	@UseGuards(AuthGuard("42"))
	@Post('login')
	login(@Request() req):any{
		return req.user;
	}

	@Get("/redirect")
	@UseGuards(AuthGuard("42"))
	async FTLoginRedirect(@Req() req: any, @Res() res:any): Promise<any> {
    	this.UsersService.create(req.user.login, req.user.token);
		return res.redirect('http://' + req.headers.host.split(":").at(0) + ':3000/auth'+ '?token='+ req.user.token);
	}

	@Get("/me")
	async me(@Query('token') token: string){
		console.log("Token pour charger l'User:" + token);
		let user = await this.UsersService.findOne(token);
		console.log('User: ' + user);
		return  user;
	}
}
