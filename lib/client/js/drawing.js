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