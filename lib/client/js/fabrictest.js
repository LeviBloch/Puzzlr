import * as Drawing from '/static/js/drawing.js';
import Piece from '../../shared/js/piece.js';

let canvas = new fabric.Canvas('canvas', {
    width: 1200,
    height: 800,
    selection: false, // disable multi select
    renderOnAddRemove: false, // massively speeds up initial loading; Must call canvas.renderAll() when we want a change to show on the canvas
});

const fullImg = new Image();

fullImg.onload = () => {

    console.log('image loaded');

    let pieces = Piece.getPieceArrayFromImage(fullImg);

    // randomly arrange pieces
    pieces.forEach(p => {
        /*  The pieces should be scattered at the most zoomed out level.
            However, we must also make sure that pieces don't hang off of the bottom and the right edges,
            hence subtracting width and height. */

        // TODO: actually use minZoomLevel
        const minZoomLevel = 0.25;
        p.drawX = Math.random() * (canvas.getWidth() / minZoomLevel - p.width);
        p.drawY = Math.random() * (canvas.getHeight() / minZoomLevel - p.height);

        Drawing.drawPieceWithFabric(canvas, fullImg, p);
    });

    // Drawing.drawPieceWithFabric(canvas, fullImg, pieces[0]);
    // Drawing.drawPieceWithFabric(canvas, fullImg, pieces[12]);

    canvas.renderAll();

}

fullImg.src = '/shared/assets/UVCheckerMap01-1024.png';

// witchcraft for zooming yoinked from http://fabricjs.com/fabric-intro-part-5
canvas.on('mouse:wheel', function (opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 4) zoom = 4;
    if (zoom < 0.1) zoom = 0.1;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();

    canvas.renderAll();
});

canvas.on('mouse:down', function (opt) {
    var evt = opt.e;

    if (evt.altKey === true) {
        this.isDragging = true;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
    }

});
canvas.on('mouse:move', function (opt) {
    if (this.isDragging) {
        var e = opt.e;
        var vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
    }
});
canvas.on('mouse:up', function (opt) {
    // on mouse up we want to recalculate new interaction
    // for all objects, so we call setViewportTransform
    this.setViewportTransform(this.viewportTransform);
    this.isDragging = false;

});