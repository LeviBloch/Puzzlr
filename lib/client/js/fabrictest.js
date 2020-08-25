import * as Drawing from '/static/js/drawing.js';
// import Piece from '/shared/js/piece.js';
import {FabricPiece} from '/shared/js/fabric_piece.js';

let canvas = new fabric.Canvas('canvas', {
    width: 1200,
    height: 800,
    selection: false, // disable multi select
    renderOnAddRemove: false, // massively speeds up initial loading; Must call canvas.renderAll() when we want a change to show on the canvas
});

const fullImg = new Image();

let pieces = [];

fullImg.onload = () => {

    console.log('image loaded');

    pieces = getPieceArrayFromImage(fullImg, 8, 8);

    // randomly arrange pieces
    pieces.forEach(p => {
        /*  The pieces should be scattered at the most zoomed out level.
            However, we must also make sure that pieces don't hang off of the bottom and the right edges,
            hence subtracting width and height. */

        // TODO: actually use minZoomLevel
        const minZoomLevel = 0.25;
        p.left = Math.random() * (canvas.getWidth() / minZoomLevel - p.width);
        p.top = Math.random() * (canvas.getHeight() / minZoomLevel - p.height);

        // Drawing.drawPieceWithFabric(canvas, fullImg, p);
        canvas.add(p);
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

canvas.on('object:moved', function (event) {
    let movedPiece = event.target;

    
    for (const targetPiece of pieces) {
        for (const hotspot of targetPiece.hotspots) {

            if (movedPiece.isOnHotspot(hotspot, targetPiece.left, targetPiece.top)) {
                movedPiece.left = targetPiece.left + hotspot.x;
                movedPiece.top = targetPiece.top + hotspot.y;
                //maybe unnecessary?
                // canvas.renderAll();
                // play click sound, animation, etc
                // TODO: group pieces, deal with the case of a piece being dropped between two other pieces that it fits between
            }
        }
    }
});



function getPieceArrayFromImage(img, numRows, numCols) {
    // TODO: actually calculate image dimensions and store numRows and numCols in a preferences file or something
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // a 2d array to plop the pieces in. Nothing special about the array, as the order (probably) won't be useful
    let pieces = [];

    for (let r = 0; r < numRows; r++) {
        pieces[r] = [];

        for (let c = 0; c < numCols; c++) {
            let width = imgWidth/numCols;
            let height = imgHeight/numRows;

            pieces[r][c] = new FabricPiece({
                fullImg: img,
                imgX: width*c,
                imgY: height*r,
                width: width,
                height: height,
                gridX: c,
                gridY: r,
            });
        }
    }

    // set hotspots

    const hotspotRadius = 20; // measured in px

    for (let r = 0; r < pieces.length; r++) {
        for (let c = 0; c < pieces[r].length; c++) {
            // set right hotspot
            if (c < pieces[r].length-1) {
                let matchingPieceId = pieces[r][c+1].id;

                // x and y are local coordinates relative to the origin of the piece (top left)
                let hotspot = {
                    x: pieces[r][c].width, // offset by the width of this piece
                    y: 0,
                    id: matchingPieceId,
                    radius: hotspotRadius,
                }
                pieces[r][c].hotspots.push(hotspot);
            }

            // set left hotspot
            if (c > 0) {

                let matchingPieceId = pieces[r][c-1].id;

                // x and y are local coordinates relative to the origin of the piece (top left)
                let hotspot = {
                    x: -pieces[r][c-1].width, // offset by the width of the dropped piece
                    y: 0,
                    id: matchingPieceId,
                    radius: hotspotRadius,
                }
                pieces[r][c].hotspots.push(hotspot);
            }

            // set top hotspot
            if (r > 0) {
                let matchingPieceId = pieces[r-1][c].id;

                // x and y are local coordinates relative to the origin of the piece (top left)
                let hotspot = {
                    x: 0,
                    y: -pieces[r-1][c].height, // offset by the height of the dropped piece
                    id: matchingPieceId,
                    radius: hotspotRadius,
                }
                pieces[r][c].hotspots.push(hotspot);
            }

            // set bottom hotspot
            if (r < pieces.length-1) {
                let matchingPieceId = pieces[r+1][c].id;

                // x and y are local coordinates relative to the origin of the piece (top left)
                let hotspot = {
                    x: 0,
                    y: pieces[r][c].height, // offset by the height of this piece
                    id: matchingPieceId,
                    radius: hotspotRadius,
                }
                pieces[r][c].hotspots.push(hotspot);
            }
        }
    }


    // for the rest of the code, it's easiest to work with a 1d pieces array, so I'll convert it here
    // each piece does have the gridX and gridY property if there's any need to know its position when first "cut"

    let pieces1d = [];
    
    for (let r = 0; r < pieces.length; r++) {
        for (let c = 0; c < pieces[r].length; c++) {
            pieces1d.push(pieces[r][c]);
        }
    }

    return pieces1d;

}