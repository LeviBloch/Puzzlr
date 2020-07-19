'use strict';

let socket = io();

let canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
let context = canvas.getContext('2d');
socket.on('state', function(players) {
    // context.clearRect(0, 0, 800, 600);

});

socket.on('message', (data) => {
    console.log(data);
});
