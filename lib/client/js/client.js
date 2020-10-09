import { Puzzle } from '/shared/js/puzzle.js';

let socket = io();

// let canvas = document.getElementById("canvas");
// canvas.width = document.body.clientWidth;
// canvas.height = document.body.clientHeight;

let puzzle = new Puzzle({
    canvasElementId: 'canvas',

    width: 1200,
    height: 800,

    minZoomLevel: 0.2,
    maxZoomLevel: 4,

    backgroundImgSrc: '/static/assets/wood.png',
    
    clickSoundSrc: 'static/assets/zapsplat_multimedia_button_press_plastic_click_002_36869.mp3',
});

puzzle.populate({
    imgSrc: '/shared/assets/UVCheckerMap01-1024.png',

    nRows: 4,
    nCols: 4,

    minNubRadius: 20,
    maxNubRadius: 40,

    hotspotRadius: 64,
});


