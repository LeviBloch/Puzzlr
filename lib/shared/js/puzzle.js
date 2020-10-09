/*
    wrapper class for a fabric.Canvas that contains all of the puzzle pieces
*/

import { Piece } from '/shared/js/piece.js';
import Sound from '/static/js/sound.js';

export const Puzzle = new fabric.util.createClass(fabric.Canvas, {

    type: 'puzzle',

    /*
        options must include:
        canvasElementId
        width
        height
        minZoomLevel
        maxZoomLevel

        can include:
        backgroundImgSrc
        clickSoundSrc
        maxNubRadius
        minNubRadius
        hotspotRadius
    */

    initialize: function(options) {
        options || (options = {});

        this.callSuper('initialize', options.canvasElementId);


        // set background to tiled texture
        // why are we setting backgroundColor instead of backgroundImage? Only way to have it be tiled. Why? No fucking clue.
        if (options.backgroundImgSrc) {
            this.backgroundColor = new fabric.Pattern({source: options.backgroundImgSrc, repeat: 'repeat'});
        }
        if (options.clickSoundSrc) {
            this.clickSound = new Sound(options.clickSoundSrc);
        }


        this.width = options.width;
        this.height = options.height;

        this.minZoomLevel = options.minZoomLevel;
        this.maxZoomLevel = options.maxZoomLevel;

        this.minNubRadius = options.minNubRadius || 0;
        this.maxNubRadius = options.maxNubRadius || 0;

        this.hotspotRadius = options.hotspotRadius || 64;


        this.selection = false; // disable multi select
        this.renderOnAddRemove = false; // massively speeds up initial loading; Must call canvas.renderAll() when we want a change to show on the canvas



        this._initZoomingAndPanning();

        this.on('object:moved', this.onPieceMoved);

        this.renderAll();

    },

    // helper method for initialize
    _initZoomingAndPanning: function() {
        // witchcraft for zooming adapted from http://fabricjs.com/fabric-intro-part-5
        this.on('mouse:wheel', function (opt) {
            var delta = opt.e.deltaY;
            var zoom = this.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > this.maxZoomLevel) zoom = this.maxZoomLevel;
            if (zoom < this.minZoomLevel) zoom = this.minZoomLevel;
            this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();

            this.renderAll();
        });

        this.on('mouse:down', function (opt) {
            var evt = opt.e;

            if (evt.altKey === true) {
                this.isDragging = true;
                this.lastPosX = evt.clientX;
                this.lastPosY = evt.clientY;
            }

        });
        this.on('mouse:move', function (opt) {
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
        this.on('mouse:up', function (opt) {
            // on mouse up we want to recalculate new interaction
            // for all objects, so we call setViewportTransform
            this.setViewportTransform(this.viewportTransform);
            this.isDragging = false;

        });
    },

    /*
        generates an array of piece objects from an image, then wraps them inside of groups to be assemblies of 1
        options must include:
        imgSrc
        nRows
        nCols

        if not already given in initialize:
        minNubRadius
        maxNubRadius
        hotspotRadius
    */
    populate: function (options) {

        this.set({
            minNubRadius: options.minNubRadius || this.minNubRadius,
            maxNubRadius: options.maxNubRadius || this.maxNubRadius,
            hotspotRadius: options.hotspotRadius || this.hotspotRadius,
        });

        let img = new Image();

        let base = this;

        img.onload = function() {
        
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            // a 2d array to plop the pieces in. Nothing special about the array, as the order (probably) won't be useful
            let pieces = [];


            for (let r = 0; r < options.nRows; r++) {
                pieces[r] = [];

                for (let c = 0; c < options.nCols; c++) {
                    let width = imgWidth / options.nCols;
                    let height = imgHeight / options.nRows;

                    let padding = {
                        left: (c == 0) ? 0 : base.maxNubRadius,
                        top: (r == 0) ? 0 : base.maxNubRadius,
                        right: (c == options.nCols-1) ? 0 : base.maxNubRadius,
                        bottom: (r == options.nRows-1) ? 0 : base.maxNubRadius,
                    };


                    pieces[r][c] = new Piece({
                        fullImg: img,

                        imgX: width * c,
                        imgY: height * r,

                        width: img.naturalWidth / options.nCols,
                        height: img.naturalHeight / options.nRows,

                        padding: padding,

                        gridX: c,
                        gridY: r,
                    });


                    /*  The pieces should be scattered at the most zoomed out level.
                        However, we must also make sure that pieces don't hang off of the bottom and the right edges,
                        hence subtracting width and height. */

                    pieces[r][c].setPos(
                        Math.random() * (base.getWidth() / (base.minZoomLevel*2) - pieces[r][c].getTrueWidth()),
                        Math.random() * (base.getHeight() / (base.minZoomLevel*2) - pieces[r][c].getTrueHeight())
                    );
                }
            }

            
            base._populatePiecesWithHotspots(pieces);

            base._populatePiecesWithNubs(pieces);


            // for the rest of the code, we don't even need to store pieces in an array, so we'll just add them to the puzzle canvas
            // each piece does have the gridX and gridY property if there's any need to know its position when first "cut"
            // the pieces are wrapped in fabric.Group objects so they each become assemblies of 1

            for (let r = 0; r < pieces.length; r++) {
                for (let c = 0; c < pieces[r].length; c++) {
                    let ass = new fabric.Group([pieces[r][c]], {
                        perPixelTargetFind: true,
                        hasControls: false,
                        hasBorders: false,
                    });
                    base.add(ass);
                }
            }

            base.renderAll();

        };

        img.src = options.imgSrc;
    },

    // helper method for populate, modifies pieces without returning anything
    // hotspot radius is measured in pixels
    _populatePiecesWithHotspots: function(pieces) {

        for (let r = 0; r < pieces.length; r++) {
            for (let c = 0; c < pieces[r].length; c++) {
                // set right hotspot
                if (c < pieces[r].length - 1) {
                    let matchingPieceId = pieces[r][c + 1].id;

                    // x and y are local coordinates relative to the origin of the piece (top left)
                    let hotspot = {
                        x: pieces[r][c].getWidth(), // offset by the width of this piece
                        y: 0,
                        id: matchingPieceId,
                        radius: this.hotspotRadius,
                    }
                    pieces[r][c].hotspots.push(hotspot);
                }

                // set left hotspot
                if (c > 0) {

                    let matchingPieceId = pieces[r][c - 1].id;

                    // x and y are local coordinates relative to the origin of the piece (top left)
                    let hotspot = {
                        x: -pieces[r][c - 1].getWidth(), // offset by the width of the dropped piece
                        y: 0,
                        id: matchingPieceId,
                        radius: this.hotspotRadius,
                    }
                    pieces[r][c].hotspots.push(hotspot);
                }

                // set top hotspot
                if (r > 0) {
                    let matchingPieceId = pieces[r - 1][c].id;

                    // x and y are local coordinates relative to the origin of the piece (top left)
                    let hotspot = {
                        x: 0,
                        y: -pieces[r - 1][c].getHeight(), // offset by the height of the dropped piece
                        id: matchingPieceId,
                        radius: this.hotspotRadius,
                    }
                    pieces[r][c].hotspots.push(hotspot);
                }

                // set bottom hotspot
                if (r < pieces.length - 1) {
                    let matchingPieceId = pieces[r + 1][c].id;

                    // x and y are local coordinates relative to the origin of the piece (top left)
                    let hotspot = {
                        x: 0,
                        y: pieces[r][c].getHeight(), // offset by the height of this piece
                        id: matchingPieceId,
                        radius: this.hotspotRadius,
                    }
                    pieces[r][c].hotspots.push(hotspot);
                }
            }
        }
    },

    // helper method for populate, modifies pieces without returning anything
    _populatePiecesWithNubs: function(pieces) {
        for (let r = 0; r < pieces.length; r++) {
            for (let c = 0; c < pieces[r].length; c++) {

                // bottom/top
                if (r < pieces.length - 1) {
                    let nubRadius = Math.random() * (this.maxNubRadius - this.minNubRadius) + this.minNubRadius;

                    // male or female
                    let inverted = Math.random() >= 0.5;

                    pieces[r][c].nubs.bottom = {
                        radius: nubRadius,
                        inverted: inverted,
                    };
                    pieces[r+1][c].nubs.top = {
                        radius: nubRadius,
                        inverted: !inverted,
                    };
                }

                // left/right
                if (c < pieces[r].length - 1) {
                    let nubRadius = Math.random() * (this.maxNubRadius - this.minNubRadius) + this.minNubRadius;

                    // male or female
                    let inverted = Math.random() >= 0.5;

                    pieces[r][c].nubs.right = {
                        radius: nubRadius,
                        inverted: inverted,
                    };
                    pieces[r][c+1].nubs.left = {
                        radius: nubRadius,
                        inverted: !inverted,
                    };
                }

                pieces[r][c].updateClipPath();
            }
        }
    },

    // checks for an assembly that should match movedAss and joins them
    combineMatchingAssemblies: function(movedAss) {


        // maybe could use foreach, but this works fine
        for (const movedPiece of movedAss.getObjects()) {
            for (const targetAss of this.getObjects()) {
                if (movedAss != targetAss) {
                    for (const targetPiece of targetAss.getObjects()) {
                        for (const hotspot of targetPiece.hotspots) {

                            let movedPieceAbsLeft = movedAss.left + movedPiece.getX() + movedAss.width / 2;
                            let movedPieceAbsTop = movedAss.top + movedPiece.getY() + movedAss.height / 2;
                            let targetPieceAbsLeft = targetAss.left + targetPiece.getX() + targetAss.width / 2;
                            let targetPieceAbsTop = targetAss.top + targetPiece.getY() + targetAss.height / 2;

                            


                            if (movedPiece.id === hotspot.id && this._isOnHotspot(
                                hotspot,
                                movedPieceAbsLeft,
                                movedPieceAbsTop,
                                targetPieceAbsLeft,
                                targetPieceAbsTop
                            )) {
                                
                                // shift movedAss by the offset of the absolute position of movedPiece from the absolute position of the hotspot
                                movedAss.left += (targetPieceAbsLeft + hotspot.x) - movedPieceAbsLeft;
                                movedAss.top += (targetPieceAbsTop + hotspot.y) - movedPieceAbsTop;

                                // remove the two assemblies from the canvas and create a new one that encompasses both of them
                                this.remove(movedAss);
                                this.remove(targetAss);

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
  

                                    piece.setPos(
                                        movedAss.left + piece.getX() + movedAss.width / 2,
                                        movedAss.top + piece.getY() + movedAss.height / 2,
                                    );

                                    arr.push(piece);
                                }
                                for (const piece of targetAss.getObjects()) {
                                    piece.setPos(
                                        targetAss.left + piece.getX() + targetAss.width / 2,
                                        targetAss.top + piece.getY() + targetAss.height / 2,
                                    );
                                    arr.push(piece);
                                }

                                let group = new fabric.Group(arr, {
                                    perPixelTargetFind: true,
                                    hasControls: false,
                                    hasBorders: false,
                                });


                                this.add(group);

                                //maybe unnecessary?
                                this.renderAll();

                                // play click sound, animation, etc
                                if (this.clickSound != null) {
                                    this.clickSound.play();
                                }

                                return;


                            }
                        }
                    }
                }
            }
        }
    },

    _isOnHotspot: function(hotspot, movedX, movedY, targetX, targetY) {

        let distanceFromHotspot = Math.sqrt(
            ((movedX - (targetX + hotspot.x)) ** 2) +
            ((movedY - (targetY + hotspot.y)) ** 2)
        );
    
        return (distanceFromHotspot <= hotspot.radius);
    },

    onPieceMoved: function(event) {
        let movedAss = event.target;

        this.combineMatchingAssemblies(movedAss);

        if (this.getObjects().length === 1) {
            console.log('You\'ve completed the puzzle!');
        }
    },

    sound: function(src) {
        this.sound
    }


});