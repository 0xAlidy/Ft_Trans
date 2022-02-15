import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService) {}

	async validateUser(token :string, login:string): Promise<any>
	{
		const user = await this.usersService.findOneByLogin(login);
		if (user && user.token !== token) {
			this.usersService.changetoken(login, token);
			const { ...result } = user;
			return result;
	  	}
	  	if (user && user.token === token) {
			const { ...result } = user;
			return result;
	  	}
	  	if (!user) {
			const ret = await this.usersService.create(login, token);
			const { ...result } = ret;
			return result;
	  	}
	 	return null;
	}
}
