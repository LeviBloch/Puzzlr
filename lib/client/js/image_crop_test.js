const { drawPieceWithFabric } = require("./drawing");

let fCanvas = new fabric.Canvas('canvas');

let img = new Image();

img.onload = () => {
    let canvas = new OffscreenCanvas();
    canvas.width = 50;
    canvas.height = 100;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, -200, -500);
    let blob = canvas.convertToBlob();
    
}