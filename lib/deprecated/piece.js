/* Some terminology (feel free to change):
imgX and imgY refer to pixels on the input image
gridX and gridY refer to the location of the piece relative to the other pieces, immediately after the puzzle is "cut"
drawX and drawY refer to where the piece is drawn on the client side, relative to the final canvas. (not the screen, though!)
*/

import * as UUID from '../shared/js/uuid.js';

export default class Piece {
    constructor(imgX, imgY, width, height, gridX, gridY) {
        this.id = UUID.generateUUID();
        this.imgX = imgX;
        this.imgY = imgY;
        this.width = width;
        this.height = height;
        this.gridX = gridX;
        this.gridY = gridY;

        this.drawX = 0;
        this.drawY = 0;

        // if another piece is dragged on or near a hotspot and has the correct ID, it means the pieces match
        // x and y are local coords relative to the piece's origin (top left)
        // the dropped piece's origin relative to the hotspot will be calculated
        // example of what this.hotspots will look like:
        // this.hotspots = [
        //     {
        //         x: 150,
        //         y: 280,
        //         id: 'E81ED549-D64B-4593-864B-295F6A47221F',
        //         radius: 50,
        //     }
        // ];

        this.hotspots = [];
    }
    static getPieceArrayFromImage(img) {
        // TODO: actually calculate image dimensions and store numRows and numCols in a preferences file or something
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const numRows = 8;
        const numCols = 8;

        // a 2d array to plop the pieces in. Nothing special about the array, as the order (probably) won't be useful
        let pieces = [];

        for (let r = 0; r < numRows; r++) {
            pieces[r] = [];

            for (let c = 0; c < numCols; c++) {
                let width = imgWidth/numCols;
                let height = imgHeight/numRows;

                let piece = new Piece(width*c, height*r, width, height, c, r);

                pieces[r][c] = piece;
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
    // the this method belongs to is the dropped piece, and the hotspot being passed in belongs to the target piece
    isOnHotspot(target) {
        if (this.id != hotspot.id) {return false;}

        // how far off from the hotspot a piece can be dropped; Note that tolerance is used as a radius
        const tolerance = 8;

        // TODO: fill the rest in lol
    }
}