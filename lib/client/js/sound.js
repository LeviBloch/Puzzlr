// handy class for creating sound effects
// NOTE: there is a bug in chrome where every time a sound plays, it tries to GET favicon.ico, which doesn't exist.
export default class Sound {
    constructor(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
    }
        
    play() {
        this.sound.play();
    }

    stop() {
        this.sound.pause();
    }

};