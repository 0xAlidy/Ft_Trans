import { Controller, Get, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosResponse } from 'axios';
import { UsersService } from './auth/user/users.service';
@Controller('/app')
export class AppController {
    constructor(private readonly httpService: HttpService, private readonly UsersService: UsersService) { }
    @Get('/token')
    async getToken(@Query('code') code: string)
    {
        let resp;
        let user;
        const headersRequest = {
            Authorization: ` Bearer`,
        };
        const data = {
            grant_type: 'authorization_code',
            client_id: 'd42d44ee8052b31b332b4eb135916c028f156dbb4d3c7e277030f3b2bc08d87c',
            client_secret: '516c1e7a1740a373e17e3c9479a383135671934c408e191cd7aec9b0a996f10e',
            code: code,
            redirect_uri: 'http://localhost:667/auth/code/'
        }
        try{
            resp = await this.httpService
            .post('https://api.intra.42.fr/oauth/token/', data)
			.toPromise();
        }
        catch(error){
            console.log("Invalid auth")
            return (null);
        }
        try{
            user = await this.httpService
            .get('https://api.intra.42.fr/v2/me', { headers: { Authorization: `Bearer ${resp.data.access_token}`}})
            .toPromise();
        }
        catch(error){
            console.log("Invalid auth")
            return (null);
        }
        var userInfo={
            pseudo : user.data.login,
            image_url: user.data.image_url,
            token: resp.data.access_token,
        }
        console.log(userInfo);
        this.UsersService.create(userInfo.pseudo, userInfo.token);
        return(userInfo.token);
    }
    @Get('/me')
    async GetMe(@Query('token') token :string)
    {
        var user;
        try{
            user = await this.httpService
            .get('https://api.intra.42.fr/v2/me', { headers: { Authorization: `Bearer ${token}`}})
            .toPromise();
        }
        catch(error){
            console.log("Invalid auth")
            return (null);
        }
        return user.data.login;
    }
}
