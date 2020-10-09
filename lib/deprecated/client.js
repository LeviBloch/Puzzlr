'use strict';

import * as UUID from '/shared/js/uuid.js';
import * as Drawing from '/static/js/drawing.js';
import Piece from '/shared/js/piece.js';

let socket = io();

let colorStr = 'rgb(0, 40, 0)';

let mouseState = {
    x: 0,
    y: 0,
    mousedown: false,
};

// Values that are smaller than 1.0 reduce the unit size and values above 1.0 increase the unit size.
// in this code, zoom is essentially synonymous with scale
// I know calling the most zoomed out value minZoomLevel is pretty garbage, so I'm open to better suggestions
const maxZoomLevel = 1;
const minZoomLevel = 0.25;
const zoomIncrement = 0.05;
let zoomLevel = 0.25;



let canvasTranslationX = 0;
let canvasTranslationY = 0;

let pieces = null;

let canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
let ctx = canvas.getContext('2d');
socket.on('state', function(players) {
    // ctx.clearRect(0, 0, 800, 600);

});

ctx.setTransform(zoomLevel, 0, 0, zoomLevel, 0, 0);


socket.on('color', (color) => {
    colorStr = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    //ctx.fillStyle = colorStr;
    //ctx.fillRect(0, 0, canvas.width, canvas.height);


});

socket.on('message', (data) => {
    console.log(data);
});


// update mouse position
canvas.addEventListener('mousemove', function(event) {
    mouseState.x = event.clientX;
    mouseState.y = event.clientY;
});

canvas.addEventListener('mousedown', function(event) {
    mouseState.mousedown = true;
});

canvas.addEventListener('mouseup', function(event) {
    mouseState.mousedown = false;
});

// zoom
// canvas.addEventListener('wheel', function(event) {

//     // not sure if this is necessary. I *think* it stops regular scrolling on the page, and I *think* we want that (for now)
//     event.preventDefault();

//     // event.deltaY * 0.01 will always be 1 or -1
//     zoomLevel += event.deltaY * 0.01 * zoomIncrement;

//     // restrict scale (just clamp zoomLevel between minZoomLevel and maxZoomLevel)
//     zoomLevel = Math.min(Math.max(minZoomLevel, zoomLevel), maxZoomLevel);

//     /* at the moment, this just zooms to the center of the screen. This alone was a pain in the ass to figure out.
//     It calculates the center of the most zoomed out state using the zoomed in coords, then subtracts the center of the canvas to place the origin in the top left of where to draw
//     It turns out, setTransform scales the translation values you give it based on the scale values you give it.
//     Good luck adding zoom to cursor! */
//     canvasTranslationX = -((getMousePos(event).x / minZoomLevel * zoomLevel) - (canvas.width / 2));
//     canvasTranslationY = -((canvas.height / 2 / minZoomLevel * zoomLevel) - (canvas.height / 2));


//     console.log('translationX: ' + canvasTranslationX);
//     console.log('zoomLevel: ' + zoomLevel);
//     console.log('clientX: ' + getMousePos(event).x);

//     ctx.setTransform(zoomLevel, 0, 0, zoomLevel, canvasTranslationX, 0);

// });

// // pan
// canvas.addEventListener('drag', function(event) {

// });

function getMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function drawCursor(mouseState) {

    let radius = 10;


    ctx.strokeStyle = colorStr;
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.arc(mouseState.x, mouseState.y, radius, 0, 2*Math.PI);
    ctx.stroke();

    if (mouseState.mousedown) {
        ctx.fillStyle = colorStr;
        ctx.fill();
    }
}


// testing image shennanigans

// draw test piece

const fullImg = new Image();

fullImg.onload = () => {

    console.log('image loaded');

    pieces = Piece.getPieceArrayFromImage(fullImg);

    // randomly arrange pieces
    pieces.forEach(p => {
        /*  The pieces should be scattered at the most zoomed out level.
            However, we must also make sure that pieces don't hang off of the bottom and the right edges,
            hence subtracting width and height */

        p.drawX = Math.random() * (ctx.canvas.width / minZoomLevel - p.width);
        p.drawY = Math.random() * (ctx.canvas.height / minZoomLevel - p.height);
    });

}

fullImg.src = '/shared/assets/squidDab.jpg';


// draw loop
setInterval(() => {
    // clear the canvas
    ctx.save();
    ctx.resetTransform();
    ctx.clearRect(0, 0, 800, 600);
    ctx.restore();

    /* make sure the image is finished loading.
       The only other options are to block the main thread until the image has loaded,
       or to put/start this draw loop in the image onload callback */
    if (fullImg.complete) {
        pieces.forEach(p => {
            Drawing.drawPiece(ctx, fullImg, p);
        });
    }
    // drawCursor(mouseState);
}, 1000/15);
