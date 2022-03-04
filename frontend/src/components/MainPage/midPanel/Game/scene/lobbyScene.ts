import Phaser from "phaser";
import { Scene } from "phaser";
import { Socket } from "socket.io-client";

export class Lobby extends Scene {
    list = [];
    joinItem : Phaser.GameObjects.DOMElement[] = [];
    sceneGame : Phaser.Scenes.ScenePlugin | null = null;
    socket:any;

	constructor() {
	  super("Lobby");
	}

	init(data: any)
    {
        this.socket = data.SOCKET as Socket;
        this.data.set('socket', this.socket);
    }
    preload()
    {
		this.cameras.main.backgroundColor.setTo(31, 31, 31);
        this.load.html('hostform', 'http://'+window.location.href.split('/')[2].split(':')[0]+':3000/assets/html/hostForm.html');
        this.load.html('joinform', 'http://'+window.location.href.split('/')[2].split(':')[0]+':3000/assets/html/joinForm.html');
        this.load.html('joinItem', 'http://'+window.location.href.split('/')[2].split(':')[0]+':3000/assets/html/joinItem.html');
        this.load.html('specItem', 'http://'+window.location.href.split('/')[2].split(':')[0]+':3000/assets/html/specItem.html');
        this.load.image('background', 'http://'+window.location.href.split('/')[2].split(':')[0]+':3000/assets/png/background.png');
    }
    create()
    {
        this.socket = this.socket as Socket;
        var self = this;
        this.socket.emit('getUserName');
        var username: string;
	    this.add.image(400, 300, 'background');
	    this.socket.emit('waiting');
        this.add.text( 120 , 30 , 'HOST', { fontSize: '80px'}).setColor('#ecf0f1');
        this.add.text( 480 , 30 , 'JOIN', { fontSize: '80px'}).setColor('#ecf0f1');
        var element = this.add.dom(180, 300).createFromCache('hostform');
        var a = element.getChildByName('hostButton') as HTMLInputElement;
        element.addListener('click');
        var scene = this.scene;
		element.on('click', function (event : any) {
			if (event.target.name ==='hostButton' && event.target.defaultValue === 'SEARCH')
			{

				self.socket.emit('searchRoom');
                // scene.start('Waiting');
            }
			if (event.target.name ==='hostButton' && event.target.defaultValue === 'CANCEL')
			{
				self.socket.emit('cancel');
                // scene.start('Waiting');
            }
		});
        // var joinElement = this.add.dom(600, 287).createFromCache('joinform');
        // joinElement.addListener('click');
		// joinElement.on('click', function (event) {
		// 	if (event.target.name === 'joinButton'){
        //         var inputRoom = this.getChildByName('rooms').value;
        //         console.log(inputRoom);
		// 		socket.emit('joinRoom', inputRoom);
        //     }
		// });
        this.socket.on('me', function (data:any) {
            username = data;
        });
        this.socket.on('changeState', function (data:any) {
            if(data.bool)
                a.value = 'CANCEL';
            else
                a.value = 'SEARCH';
        });
        this.socket.on('updateRoom', function (data : any) {
            // joinElement.getChildByName('rooms') = '';
            var y = 80;
            var current;
            self.joinItem.forEach( item => { item.destroy()});
            data.join.forEach((room: string) =>
            {
                if (room !== username + "'s_room")
                {
                    self.joinItem.push(current = self.add.dom(600, 90 + y).createFromCache('joinItem'));
                    current.getChildByID('roomName').innerHTML = room;
                    current.addListener('click');
                    current.on('click', function(event: { target: { id: string; }; }){
                    if (event.target.id === 'join')
                    (self.socket as Socket).emit('joinRoom', room);
                });
                y += 40;
                }
            });
            // data.spec.forEach((element: string) => {
            //     if (element !== username + "'s_room"){
            //     current = self.add.dom(600, 90 + y).createFromCache('specItem');
            //     current.getChildByID('roomName').innerHTML = element;
            //     current.addListener('click');
            //     current.on('click', function(event: { target: { id: string; }; }){
            //         console.log(event);
            //         if (event.target.id === 'spec')
            //         {
            //             console.log("spec");
            //             socket.emit('joinRoom', element);
            //         }
            //     });
            //     y += 40;
            //     // joinElement.getChildByName('rooms').add(opt);
            //     }
            // });
        });
        this.socket.on('startGame', function (data:any) {
            data.socket = self.socket;
            // if (self.sceneGame !== null)
            //     self.sceneGame.remove()
            self.sceneGame = scene.launch('Game', data);
        });
    }
}

