import { Logger } from "@nestjs/common";
import {OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { User } from "src/auth/user/user.entity";
import { UsersService } from "src/auth/user/users.service";
import { clientClass } from "./class/client.class";
import { roomClass } from "./class/room.class";

@WebSocketGateway({cors: true})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private userService: UsersService){
    }
    private logger: Logger = new Logger('WS-game');
    rooms = new Map<string, roomClass>() ;
    i : number;
    clients = new Map<string, clientClass>();
    clientsOnWaitingRoom = new Map();
    @WebSocketServer()
    server: Server;


    afterInit(server: any) {
        this.logger.log('Initialized!');
        this.logger.log('Waiting for incoming connection...');
    }
    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log("Connection:    " + client.id.slice(0, 4));
        this.clients.set(client.id,new clientClass(client));
    }
    handleDisconnect(client: Socket) {
        this.logger.log("Disconnect:    "+ client.id.slice(0, 4));
        var keys : string[] = Array.from( this.clients.keys());

        if (this.clients.get(client.id))
        {
            this.userService.changeWSId(this.clients.get(client.id)._pseudo, 'null');
            this.userService.setIsActive(this.clients.get(client.id)._pseudo, false);
            var roomtoleave : string = this.clients.get(client.id)._room;
            this.rooms.forEach(element => {
                this.logger.log(element._name);
                if(element._name === roomtoleave)
                {
                    if (element.close(client) === true)
                    {
                        this.logger.log('deleting ' + roomtoleave)
                        client.leave(roomtoleave);
                        client.join('lobby');
                        this.rooms.delete(roomtoleave);
                        this.updateRoom();
                    }
                }
        });
        }
        this.clients.delete(client.id);
        this.server.emit('updateUser', keys);
    }

    @SubscribeMessage('setID')
    async setID(client: Socket, data: any){
        this.logger.log(data.token +" " + client.id);
        this.userService.changeWSId( data.name, client.id);
        var user: User;
        await this.userService.findOneByName(data.name).then(res => {this.clients.get(client.id).setToken(data.token);this.setPlayerName(client, res.name)});
    }

    @SubscribeMessage('setPlayerName')
    setPlayerName(client: Socket, message: string){
        this.logger.log(client.id + " is " + message);
        this.clients.get(client.id).setName(message);
    }
    @SubscribeMessage('createRoom')
    createRoom(client: Socket): void {
        if (this.clients.get(client.id)._room !== this.clients.get(client.id)._pseudo + "'s_room"){
            var formated : string = this.clients.get(client.id)._pseudo + "'s_room";
            this.clients.get(client.id).setRoom(formated);
            this.rooms.set(formated, new roomClass(formated, this.clients.get(client.id), this.server.to(formated)));
            this.updateRoom();
        }
        else{

        }
    }
    @SubscribeMessage('getUserName')
    userName(client: Socket): void {
        var formated : string = this.clients.get(client.id)._pseudo + "'s_room";
        var ret = this.clients.get(client.id)._pseudo;
        client.emit('username', {username: ret})
        this.updateRoom();
    }
    @SubscribeMessage('specRoom')
    specRoom(client: Socket, room: string ): void {
        this.rooms.forEach(element => {
            if(element._name == room)
            {
                element._player._socket.leave('lobby');
                element._player._socket.join(element._name);
                client.leave('lobby');
                client.join(element._name);
                element.addGuest(this.clients.get(client.id));
                this.clients.get(client.id).setRoom(room);
                client.emit('startGame', {id: 3, room: room, nameA: element._player._pseudo, nameB: element._guest._pseudo,  bool: this.clients.get(client.id)._nbOfGames != 0 ? true : false});
                this.updateRoom();
            }
        });
    }
    @SubscribeMessage('joinRoom')
    joinRoom(client: Socket, room: string ): void {
        this.rooms.forEach(element => {
            if (element._name == room && !element._isJoinable)
            {
                element._player._socket.leave('lobby');
                element._player._socket.join(element._name);
                client.leave('lobby');
                client.join(element._name);
                element.addSpec(this.clients.get(client.id));
                this.clients.get(client.id).setRoom(room);
                client.emit('startGame', {id: 3, room: room, nameA: element._player._pseudo, nameB: element._guest._pseudo,  bool: this.clients.get(client.id)._nbOfGames != 0 ? true : false});
                this.updateRoom();
            }
            if(element._name == room && element._isJoinable)
            {
                element._player._socket.leave('lobby');
                element._player._socket.join(element._name);
                client.leave('lobby');
                client.join(element._name);
                element.addGuest(this.clients.get(client.id));
                this.clients.get(client.id).setRoom(room);
                element._player._socket.emit('startGame', {id: 1, room: room, nameA: element._player._pseudo, nameB: element._guest._pseudo, bool: element._player._nbOfGames != 0 ? true : false })
                client.emit('startGame', {id: 2, room: room, nameA: element._player._pseudo, nameB: element._guest._pseudo,  bool: this.clients.get(client.id)._nbOfGames != 0 ? true : false});
                element._isJoinable = false;
                this.updateRoom();
            }
        });
    }
    @SubscribeMessage('leaveRoom')
    leaveRoom(client: Socket): void {
        this.rooms.forEach(element => {
            if(element._name == this.clients.get(client.id)._room)
            {
                if (element.close(client) == true)
                {
                    this.logger.log('deleting ' + this.clients.get(client.id)._room)
                    client.leave(this.clients.get(client.id)._room);
                    client.join('lobby');
                    this.rooms.delete(this.clients.get(client.id)._room);
                    this.clients.get(client.id)._room = 'lobby';
                    this.updateRoom();
                }
            }
        });
    }
    @SubscribeMessage('waiting')
        waitingMsg(client: Socket): void {
            client.emit('me', this.clients.get(client.id)._pseudo)
            this.userService.setIsActive(this.clients.get(client.id)._token, true);
            this.clients.get(client.id)._room = 'lobby'
            client.join('lobby');
            this.logger.log('salut');
            this.updateRoom();
    }
    @SubscribeMessage('ready')
        ready(client: Socket, data : any): void {
            this.rooms.forEach(element => {
                if(element._name == data.room)
                {
                    this.logger.log("ready!"+ data.id);
                    element.setReady(data.id);
                }
            });
    }
    @SubscribeMessage('playerMovement')
    PlayerMovement(client: Socket, data: any): void {
        this.rooms.forEach(element => {
            if(element._name == data.room)
                element.UpdatePos(data.id, data.y);
        });
    }
    @SubscribeMessage('ball')
    ballUpdate(client: Socket, data: any): void {
        this.rooms.forEach(element => {
            if(element._name == data.room){
                element.ballUpdate(data);
            }
        });
    }

    @SubscribeMessage('score')
    Score(client: Socket, data: any): void {
        this.rooms.forEach(element => {
            if(element._name == data.room){
                var res = element.goal(data.goalID);
                if(res!= 0)
                {
                    if(res == 1)
                    {
                        this.userService.win(element._player._token);
                        this.userService.xp(element._player._token, 50);
                        this.userService.xp(element._guest._token, 25);
                        this.userService.loose(element._guest._token);
                    }
                    if(res == 2)
                    {
                        this.userService.win(element._guest._token);
                        this.userService.xp(element._player._token, 25);
                        this.userService.xp(element._guest._token, 50);
                        this.userService.loose(element._player._token);
                    }
                }
            }
        });
    }


    updateRoom(){
        var join : string[] = [];
        var spec : string[] = [];

        this.rooms.forEach(element => {
            if (element._isJoinable == false)
                spec.push(element._name);
            else
                join.push(element._name);
        });
        this.clients.forEach(client => {
            if(client._room == 'lobby')
                client._socket.emit('changeState', {bool : false})
            else
                client._socket.emit('changeState', {bool : true})
        });
        this.server.to('lobby').emit('updateRoom', { join: join, spec: spec});
    }
    //GAME-PART

}
