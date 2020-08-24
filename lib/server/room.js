//believe it or not, I couldn't find a cleaner way to get the import file paths
import RandomColor from '../shared/js/random_color.js';


export default class Room {
    constructor() {
        this.clients = {};
    }
    addPlayer(socket) {
        this.clients[socket.id] = {
            socket: socket,
            color: RandomColor.getRandomColor(),
        }
    }
    removePlayer(id) {
        delete this.clients[id];
    }
    updateClients() {
        Object.keys(this.clients).forEach((id) => {
            let client = this.clients[id];
            client.socket.emit('color', client.color);
        });

    }
    startGame() {
        // in the future, this should be check programmatically. At the moment, the only way I've found to do that
        // is to load the image and then use .naturalWidth and .naturalHeight
        // this code is assuming you're using squidDab.jpg
        const imgWidth = 3840;
        const imgHeight = 2160;

        const pieceWidth = 30;
        const pieceHeight = 30;

        for (let i = 0; i < imgHeight; i += pieceHeight) {
            for (let j = 0; j < imgWidth; j += pieceWidth) {
                let piece = new Piece(i, j, pieceWidth, pieceHeight);
            }
        }


    }
}
