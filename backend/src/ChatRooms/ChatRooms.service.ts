import { Injectable, Logger} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "src/user/users.service";
import {Repository} from "typeorm";
import { ChatRooms } from './ChatRooms.entity';
import { createCipheriv, randomBytes} from 'crypto';
import { createDecipheriv } from 'crypto';

 @Injectable()
 export class ChatRoomsService
 {
	password = "";
	iv:Buffer= null;
	key:string;

	private logger: Logger = new Logger('UsersService');
	constructor(@InjectRepository(ChatRooms) private ChatRoomsRepository: Repository<ChatRooms>, private userService:UsersService){
		this.iv = randomBytes(16);
		this.key = "ceci est une phrase de 32 charac"
	}

	async create(name :string, owner:string, password:string) {
		if( await this.findRoomByName(name) === undefined){
			var match = new ChatRooms(name, owner, password)
			await this.ChatRoomsRepository.save(match);
		}
		return await this.getAllRoomName();
	}

	async addMessage(data:any)
	{
		var room = await this.findRoomByName(data.dest)
		room.messages.push(data)
		this.ChatRoomsRepository.save(room)
	}

	async addUser(userName:string, roomName:string)
	{
		var room = await this.findRoomByName(roomName)
		room.users.push(userName)
		this.ChatRoomsRepository.save(room)
	}

	async findRoomByName(name:string){
		return await this.ChatRoomsRepository.findOne(
			{ where:
				{ name: name }
			})
	}
	async getMessagesByRoom(name:string)
	{
		var room = await this.findRoomByName(name)
		if(room)
			return room.messages
		else
			return []
	}

	async getAllRoomName(){
		var all = await this.ChatRoomsRepository.find()
		var ret:string[]= [];
		all.forEach(element => {
			ret.push(element.name)
		});
		return ret;
	}
	async isAuthorized(token:string, name:string){
		var room = await this.findRoomByName(name)
		var user = await this.userService.findOne(token)
		if(room.IsPassword === false)
			return true
		room.users.forEach(element => {
			if(user.name == element)
				return true
		});
		return false
	}


	
	async encrypt(toEncrypt:string) {
		this.password = 'password';
		const cipher = createCipheriv('aes256', this.key, this.iv);
		const encryptedText = cipher.update(toEncrypt, 'utf8', 'hex') + cipher.final('hex');
		// console.log("encrypted :                     " + encryptedText)
		return encryptedText;
	}

	async decrypt(toDecrypt:string){
		const decipher = createDecipheriv('aes256', this.key, this.iv);
		const decryptedText = decipher.update(toDecrypt, 'hex', 'utf8') + decipher.final('utf8');
		// console.log("decrypted :                     " + decryptedText);
		return decryptedText;
	}

	// async changePass(msg:string, dest:string){
	// 	var newPass = this.encrypt(msg.slice(6))
	// 	var room = await this.findRoomByName(dest)
	// 	room.setPass(await newPass)
	// 	console.log(room)
	// }

	async systemMsg(data:any){
		var help = "/help will help you to know the command you can use from the library for multiple line and other shit like this for long text so cute "
		var ban = "/ban will ban someone"
		var unknow = "/ unknow command / try again..."
		// var pass = "/ your password has been change"
		if (data.message === "/help")
			data.message = help
		else if (data.message === "/ban")
			data.message = ban
		// else if (data.message.beginWidth("/pass")){
		// 	// this.changePass(data.message, data.dest)
		// 	data.message = pass;
		// }
		else 
			data.message = unknow

	}
}
