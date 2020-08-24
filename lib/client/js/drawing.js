import RandomColor from '/shared/js/random_color.js';

export function drawPiece(ctx, fullImg, piece) {
    ctx.drawImage(
        // source image
        fullImg,
        piece.imgX,
        piece.imgY,
        piece.width,
        piece.height,
        // destination canvas
        piece.drawX,
        piece.drawY,
        piece.width,
        piece.height
    );

    // console.log(piece.imgX);
    // console.log(piece.imgY);
    // console.log(piece.width);
    // console.log(piece.height);
    // console.log(piece.drawX);
    // console.log(piece.drawY);


    // console.log("Piece has been drawn");
}

/**
 * @param {fabric.Canvas} canvas 
 * @param {Image} fullImg original, full image from which to cut out the piece. Note that this is an Image and not a fabric.Image
 * @param {Piece} piece 
 */
export function drawPieceWithFabric(canvas, fullImg, piece) {

    //note that clipPath is from the center of the object being clipped
    let clipPath = new fabric.Rect({
        width: piece.width,
        height: piece.height,
        left: piece.imgX - fullImg.width/2,
        top: piece.imgY - fullImg.height/2,
    });

    // perhaps a better name would be maskedImg?
    let croppedImg = new fabric.Image(fullImg, {
        left: piece.drawX,
        top: piece.drawY,
        hasControls: false,
        hasBorders: false,
        cropX: piece.imgX,
        cropY: piece.imgY,
        width: piece.width,
        height: piece.height,
        // clipPath: clipPath, // basically a mask. The image is only drawn on clipPath
        perPixelTargetFind: true, // limits clickable region to opaque parts of the object, which in this case is clipPath
    })

    canvas.add(croppedImg);

    // testing
    
    // let group = new fabric.Group([croppedImg], {
    //     // left: 0,
    //     // right: 0,
    //     hasBorders: true,
    //     hasControls: false,
    // });


    // add hotspots
    let col = getColorStringFromArray(RandomColor.getRandomColor());
    piece.hotspots.forEach(hotspot => {
        let circle = new fabric.Circle({
            left: hotspot.x + piece.drawX - hotspot.radius,
            top: hotspot.y + piece.drawY - hotspot.radius,
            radius: hotspot.radius,
            fill: col,
            perPixelTargetFind: true,
        });

        canvas.add(circle);
    });


    // canvas.add(group);


}

//helper function
function getColorStringFromArray(color) {
    return 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
}