/*
Some notes about importing fabric.js:
Apparently, the only way to get fabric.js on the client side is with a <script> tag in the html file.
I used a CDN, and the only CDN available was fabric 4.0.0.
Why can't you just import it like any other library? https://stackoverflow.com/a/57719494/3055043
Luckily, these restrictions are not the case on the server side, since there's nowhere to put a <script> tag
Therefore, it can be imported on the server side with: import {fabric} from 'fabric';
Since I'm a good boy, I made sure that both of the fabrics being used are version 4.0.0, at least to the best of my knowledge.
At the moment, I can't think of any good way to deal with imports in shared files. TODO: fix it, I guess.
*/

import * as UUID from './uuid.js';

export const FabricPiece = fabric.util.createClass(fabric.Image, {
    type: 'piece',

    initialize: function (options) {
        options || (options = {});

        this.callSuper('initialize', options.fullImg);

        this.id = UUID.generateUUID();
        this.cropX = options.imgX;
        this.cropY = options.imgY;
        // main rectangle of the piece
        this.rectWidth = options.rectWidth || options.width;
        this.rectHeight = options.rectHeight || options.height;
        // dimensions of the imaginary outer rectangle that encompasses the whole piece
        this.width = options.width;
        this.height = options.height;
        this.gridX = options.gridX;
        this.gridY = options.gridY;

        this.padding = options.padding;

        // position of the main rectangle
        this.rectLeft = options.drawX || 0;
        this.rectTop = options.drawY || 0;
        this.left = options.drawX || 0;
        this.top = options.drawY || 0;

        this.hotspots = options.hotspots || [];

        // {
        //     left: {
        //         radius: 30,
        //         inverted: false,
        //     },
        //     right:
        //     top:
        //     bottom:
        // }

        this.nubs = options.nubs || {};

        this.hasControls = false;
        this.hasBorders = false;
        this.perPixelTargetFind = true;

        
    },

    toString: function () {
        return this.callSuper('toString') +
            ' (id: ' + this.id + ')';
    },

    // deprecated
    isOnHotspot: function (hotspot, targetPieceX, targetPieceY) {
        if (this.id !== hotspot.id) {return false};

        let distanceFromHotspot = Math.sqrt(((this.left - (targetPieceX + hotspot.x)) ** 2) + ((this.top - (targetPieceY + hotspot.y)) ** 2));
        console.log(distanceFromHotspot);
        return (distanceFromHotspot <= hotspot.radius);
    },

    updateClipPath: function () {
        
        let circles = [];

        // double check if this is necessary
        let base = this;
        //shorthand
        let nubs = this.nubs;

        if (nubs.hasOwnProperty('left')) {
            circles.push(new fabric.Circle({
                left: -base.rectWidth / 2 - nubs.left.radius,
                top: -nubs.left.radius,
                radius: nubs.left.radius,
                inverted: nubs.left.inverted,
            }));
        }
        if (nubs.hasOwnProperty('right')) {
            circles.push(new fabric.Circle({
                left: base.rectWidth / 2 - nubs.right.radius,
                top: -nubs.right.radius,
                radius: nubs.right.radius,
                inverted: nubs.right.inverted,
            }));
        }
        if (nubs.hasOwnProperty('top')) {
            circles.push(new fabric.Circle({
                left: -nubs.top.radius,
                top: -base.rectHeight / 2 - nubs.top.radius,
                radius: nubs.top.radius,
                inverted: nubs.top.inverted,
            }));
        }
        if (nubs.hasOwnProperty('bottom')) {
            circles.push(new fabric.Circle({
                left: -nubs.bottom.radius,
                top: base.rectHeight / 2 - nubs.bottom.radius,
                radius: nubs.bottom.radius,
                inverted: nubs.bottom.inverted,
            }));
        }
        

        let femaleNubs = [];
        let maleNubs = [];

        for (const circle of circles) {
            if (circle.inverted) {
                femaleNubs.push(circle);
            } 
            else {
                maleNubs.push(circle);
            }

        }

        let invertedClipPath = new fabric.Group(femaleNubs, {
            inverted: true,
            // width: base.width,
            // height: base.height,
        });

        // add the piece's main rectangle to the clipPath
        let innerRect = new fabric.Rect({
            left: -base.rectWidth/2,
            top: -base.rectHeight/2,
            width: base.rectWidth,
            height: base.rectHeight,
        });

        // for some reason, innerRect has to be inside of an array to work
        let clipPath = new fabric.Group([innerRect], {
            clipPath: invertedClipPath,
            inverted: false,

            left: -base.rectWidth/2 - base.padding.right,
            top: -base.rectHeight/2 - base.padding.bottom,
            width: base.width,
            height: base.height,
        });

        maleNubs.forEach((nub) => clipPath.add(nub));

        
        this.clipPath = clipPath;
    },

    setPosFromRectPos: function (left, top) {
        this.rectLeft = left;
        this.rectTop = top;
        this.left = left - ((this.width - this.rectWidth) / 2);
        this.top = top - ((this.height - this.rectHeight) / 2);
    }
});