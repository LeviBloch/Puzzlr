import * as Drawing from '/static/js/drawing.js';
// import Piece from '/shared/js/piece.js';
import { FabricPiece } from '/shared/js/fabric_piece.js';

let canvas = new fabric.Canvas('canvas', {
    width: 1200,
    height: 800,
    selection: false, // disable multi select
    renderOnAddRemove: false, // massively speeds up initial loading; Must call canvas.renderAll() when we want a change to show on the canvas
});

// useful for each time we create a new group
const GROUP_PROPS = {
    perPixelTargetFind: true,
    hasControls: false,
    hasBorders: false,
};

const fullImg = new Image();

//let assemblies = [];

fullImg.onload = () => {

    console.log('image loaded');

    let pieces = getPieceArrayFromImage(fullImg, 4, 4);

    // randomly arrange pieces
    pieces.forEach(p => {
        /*  The pieces should be scattered at the most zoomed out level.
            However, we must also make sure that pieces don't hang off of the bottom and the right edges,
            hence subtracting width and height. */

        // TODO: actually use minZoomLevel
        const minZoomLevel = 0.25;
        p.left = Math.random() * (canvas.getWidth() / minZoomLevel - p.width);
        p.top = Math.random() * (canvas.getHeight() / minZoomLevel - p.height);

        // we want to wrap each piece in a group so that later on, everything in the assemblies array will be a group of pieces
        let ass = new fabric.Group([p], GROUP_PROPS);
        canvas.add(ass);
        //assemblies.push(ass);
    });

    // assemblies[0].set({left: 200, top: 500});
    // canvas.add(assemblies[0]);

    // canvas.add(new fabric.Rect({ left: 200, top: 200, width: 128, height: 128 }));

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
    let movedAss = event.target;

    joinPieces(movedAss);

    if (canvas.getObjects().length === 1) {
        console.log('You\'ve completed the puzzle!');
    }
});


// checks for an assembly that should match movedAss and joins them
// TODO: rename method to something that is more descriptive
function joinPieces(movedAss) {
    // maybe could use foreach, but this works fine
    for (const movedPiece of movedAss.getObjects()) {
        for (const targetAss of canvas.getObjects()) {
            if (movedAss != targetAss) {
                for (const targetPiece of targetAss.getObjects()) {
                    for (const hotspot of targetPiece.hotspots) {

                        if (movedPiece.id === hotspot.id && isOnHotspot(
                            hotspot,
                            //since in fabric, object coordinates are relative to the center of their group, we need to add half of the group's width or height to make it relative to the top left
                            movedAss.left + movedPiece.left + movedAss.width / 2,
                            movedAss.top + movedPiece.top + movedAss.height / 2,
                            targetAss.left + targetPiece.left + targetAss.width / 2,
                            targetAss.top + targetPiece.top + targetAss.height / 2
                        )) {

                            
                            // shift movedAss by the offset of the absolute position of movedPiece from the absolute position of the hotspot
                            // this is kinda gross, but I'm not going to touch or even simplify it because it works and its expanded form makes more sense to look at
                            movedAss.left -= (movedAss.left + movedPiece.left + movedAss.width/2) - (targetAss.left + targetPiece.left + targetAss.width/2 + hotspot.x);
                            movedAss.top -= (movedAss.top + movedPiece.top + movedAss.height/2) - (targetAss.top + targetPiece.top + targetAss.height/2 + hotspot.y);

                            // remove the two assemblies from the canvas and create a new one that encompasses both of them
                            canvas.remove(movedAss);
                            canvas.remove(targetAss);

                            // for whatever reason, fabric likes it best when you initialize a group with an array containing everything that goes in there
                            let arr = [];
                            for (const piece of movedAss.getObjects()) {
                                /*  
                                    there's no way (that I've found) to dissolve a group,
                                    so we're just going to set piece's left and top as if it's being positioned on the canvas
                                    rather than relative to the group's center. That way, when we add it to a new group,
                                    the new group's left and top will be set appropriately relative to the canvas and piece's left and top
                                    will be adjusted to be relative to the group's center. Fabric's way of dealing with groups is annoying,
                                    but their groups are super handy, so it's worthwhile.
                                */
                                piece.set({
                                    left: movedAss.left + piece.left + movedAss.width / 2,
                                    top: movedAss.top + piece.top + movedAss.height / 2,
                                });
                                arr.push(piece);
                            }
                            for (const piece of targetAss.getObjects()) {
                                piece.set({
                                    left: targetAss.left + piece.left + targetAss.width / 2,
                                    top: targetAss.top + piece.top + targetAss.height / 2,
                                });
                                arr.push(piece);
                            }

                            let group = new fabric.Group(arr, GROUP_PROPS);


                            canvas.add(group);

                            //maybe unnecessary?
                            canvas.renderAll();

                            // play click sound, animation, etc

                            return;
                        }
                    }
                }
            }
        }
    }
}

function getPieceArrayFromImage(img, numRows, numCols) {
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // a 2d array to plop the pieces in. Nothing special about the array, as the order (probably) won't be useful
    let pieces = [];

    for (let r = 0; r < numRows; r++) {
        pieces[r] = [];

        for (let c = 0; c < numCols; c++) {
            let width = imgWidth / numCols;
            let height = imgHeight / numRows;

            pieces[r][c] = new FabricPiece({
                fullImg: img,
                imgX: width * c,
                imgY: height * r,
                width: width,
                height: height,
                gridX: c,
                gridY: r,
            });
        }
    }

    // set hotspots

    const hotspotRadius = 64; // measured in px

    for (let r = 0; r < pieces.length; r++) {
        for (let c = 0; c < pieces[r].length; c++) {
            // set right hotspot
            if (c < pieces[r].length - 1) {
                let matchingPieceId = pieces[r][c + 1].id;

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

                let matchingPieceId = pieces[r][c - 1].id;

                // x and y are local coordinates relative to the origin of the piece (top left)
                let hotspot = {
                    x: -pieces[r][c - 1].width, // offset by the width of the dropped piece
                    y: 0,
                    id: matchingPieceId,
                    radius: hotspotRadius,
                }
                pieces[r][c].hotspots.push(hotspot);
            }

            // set top hotspot
            if (r > 0) {
                let matchingPieceId = pieces[r - 1][c].id;

                // x and y are local coordinates relative to the origin of the piece (top left)
                let hotspot = {
                    x: 0,
                    y: -pieces[r - 1][c].height, // offset by the height of the dropped piece
                    id: matchingPieceId,
                    radius: hotspotRadius,
                }
                pieces[r][c].hotspots.push(hotspot);
            }

            // set bottom hotspot
            if (r < pieces.length - 1) {
                let matchingPieceId = pieces[r + 1][c].id;

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

function isOnHotspot(hotspot, movedLeft, movedTop, targetLeft, targetTop) {

    let distanceFromHotspot = Math.sqrt(
        ((movedLeft - (targetLeft + hotspot.x)) ** 2) +
        ((movedTop - (targetTop + hotspot.y)) ** 2)
    );

    return (distanceFromHotspot <= hotspot.radius);
}