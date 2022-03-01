import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async validateUser(token :string, login:string): Promise<any>
    {
        let user = await this.usersService.findOneByLogin(login);
                if (user && user.token !== token) {
                    if(user.status === 1)
                        return null;
                    user = await this.usersService.changetoken(login, token);
                }
            if (!user) {
                user = await this.usersService.create(login, token);
            }
            const { ...result } = user;
            return result;
    }
}