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
        this.width = options.width;
        this.height = options.height;
        this.gridX = options.gridX;
        this.gridY = options.gridY;

        this.left = options.drawX || 0;
        this.top = options.drawY || 0;

        this.hotspots = options.hotspots || [];

        this.hasControls = false;
        this.hasBorders = false;
        this.perPixelTargetFind = true;
    },

    toString: function () {
        return this.callSuper('toString') +
            ' (id: ' + this.id + ')';
    },

    isOnHotspot: function (hotspot, targetPieceX, targetPieceY) {
        if (this.id !== hotspot.id) {return false};

        let distanceFromHotspot = Math.sqrt(((this.left - (targetPieceX + hotspot.x)) ** 2) + ((this.top - (targetPieceY + hotspot.y)) ** 2));
        console.log(distanceFromHotspot);
        return (distanceFromHotspot <= hotspot.radius);
    },
});