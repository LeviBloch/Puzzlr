// import RandomColor from 'random_color.js';

export default class Room {
    constructor() {
        this.clients = {};
    }
    addPlayer(socket) {
        this.clients[socket.id] = {
            socket: socket
        }
        //this.colors[socket.id] =
    }
    removePlayer(id) {
        delete this.clients[id];
    }
}
