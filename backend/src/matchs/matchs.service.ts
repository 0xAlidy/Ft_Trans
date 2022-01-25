import { forwardRef, Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "src/user/users.service";
import {getRepository, Repository} from "typeorm";
import {Match} from "./match.entity";

 // you can also get it via getConnection().getRepository() or getManager().getRepository()

@Injectable()
export class MatchsService
{
	private logger: Logger = new Logger('UsersService');
	constructor(@InjectRepository(Match) private MatchRepository: Repository<Match>, private usersService: UsersService){
	}
	async create(WinnerName :string, WinnerScore:number, LooserName:string, LooserScore:number) {
		var match = new Match(WinnerName , WinnerScore, LooserName, LooserScore)
		this.MatchRepository.save(match);
	}

	async MatchsByName(name:string, token:string)
	{
		if(await this.usersService.findOne(token))
		{
			var array = await this.MatchRepository.find();
			var askerMatchs:Match[] = [];
			var ret:string[] = [];
			array.forEach(element => {
				if (element.WinnerName === name || element.LooserName === name)
					askerMatchs.push(element);
			});
			askerMatchs.forEach(element => {
				ret.push(element.WinnerName +'/'+ element.WinnerScore	+'/'+ element.LooserName +'/'+ element.LooserScore + '/' + name + '/' + token);
			});
			return ret;
		}
		return null;
	}
}
