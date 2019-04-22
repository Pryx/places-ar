import { PositionService } from 'position-service';

window.debug = false;

/**
 * Main class that handles all the basic functionality of
 * the web app like buttons and initializes other components
 * like the Compass, Settings or Map.
 */
class Main {
    /**
     * Constructor creates new Position object and initializes the app.
     */
    constructor(){
        this.positionService = new PositionService();
        this.initVideo();
    }

    /**
     * Binds event handlers to events for basic GUI operations.
     * @returns {undefined}
     */
    initEvents(){
        document.addEventListener("onfullscreenchange", this.fullScreenChange);

        document.getElementById("open-settings").addEventListener("click", function (e) {
            this.classList.toggle("animate");
            document.getElementById("navigation").classList.toggle("hide");
        });
        
        let elements = document.querySelectorAll(".nav-switch");
        elements.forEach(element => {
            element.addEventListener("click", function (e) {
                e.preventDefault();
                if (!document.querySelector("body").classList.contains("nav-switched")) {
                    document.querySelector("body").classList.add("nav-switched");
                }

                let href = this.getAttribute("href");
                document.querySelector(href).classList.remove("hide");
            });
        });

        /**
        * Click handler for the fullscreen button. Uses the JavaScript
        * FullScreen API. Basic support is present in most major browsers.
        */
        document.getElementById("open-fullscreen").addEventListener("click", function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                if (document.fullscreenEnabled) {
                    document.getElementById("main").requestFullscreen({ navigationUI: "hide" });

                    //Screen orientation lock. Works only on Progressive Web App
                    screen.lockOrientationUniversal = screen.lockOrientation || 
                        screen.mozLockOrientation || screen.msLockOrientation;

                    if (screen.lockOrientationUniversal("landscape-primary")) {
                        console.log("Screen orientation locked");
                    } else {
                        console.log("Screen orientation lock failed");
                    }
                } else {
                    console.warn("Fullscreen not supported");
                }
            }
        });
    }

    /**
     * This function initializes the video stream from the environment-facing
     * camera. Uses the getUserMedia/Stream API present in all current browsers.
     * Uses quality set in app settings. 
     * @returns {undefined}
     */
    initVideo() {
        //TODO: Screen aspect ratio
        //TODO: Save & load settings
        let video = document.getElementById('video');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

            let settings = { video: { width: 1920, height: 1080, facingMode: "environment" } };

            navigator.mediaDevices.getUserMedia(settings)
                .then(stream => video.srcObject = stream)
                .then(() => new Promise(resolve => video.onloadedmetadata = resolve))
                .then(() => {
                    video.style.display = 'block';
                    //TODO: Wizard
                    document.getElementById('insufficient-permissions').style.display = 'none'
                })
                .catch(e => {
                    console.error("Couldn't gain access to camera!");
                    //TODO: Re-run wizard
                });
        } else {
            console.warn("No media devices found!");
            //TODO Shown error
        }
    }
    /**
     * fullScreenChange handles fullscreen events and updates
     * the fullscreen toggle button accordingly.
     * @returns {undefined}
     */
    fullScreenChange() {
        let element = document.getElementById("open-fullscreen");
        if (document.fullscreenElement) {
            element.classList.add("on");
        } else {
            element.classList.remove("on");
        }
    }
}

(function (){
    let main = new Main();
    main.initEvents();  
})();