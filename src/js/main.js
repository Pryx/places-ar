import { PositionService } from './position-service';
import { Settings } from './settings';
import { Wizard } from './wizard';

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
        if (typeof (Storage) !== "undefined") {
            this.settings = new Settings();
        } else {
            this.settings = null;
            // Old browser... Show warning and crash.
        }
        this.runSetupWizard();
        //this.initVideo();
    }

    /**
     * Runs setup wizard if setup hasn't been completed yet
     * @returns {undefined}
     */
    runSetupWizard(){
        this.setupWizard = new Wizard("#wizard", true, this);
        
        if (!this.setupWizard.wasRun){
            this.initVideo();
            this.positionService.initGeolocationWatcher();
        }
    }

    /**
     * Binds event handlers to events for basic GUI operations.
     * @returns {undefined}
     */
    initEvents(){
        document.addEventListener("onfullscreenchange", this.fullScreenChange);

        document.getElementById("open-settings").addEventListener("click", function (e) {
            this.classList.toggle("animate");
            document.getElementById("settings").classList.toggle("hide");
            document.querySelector("body").classList.add("hide-controls");
            document.querySelector("#close-all").classList.remove("hide");
        });

        document.getElementById("open-map").addEventListener("click", function (e) {
            this.classList.toggle("animate");
            document.getElementById("place-select").classList.toggle("hide");
            document.querySelector("body").classList.add("hide-controls");
            document.querySelector("#close-all").classList.remove("hide");
        });

        document.getElementById("close-all").addEventListener("click", function (e) {
            document.querySelector("body").classList.remove("hide-controls");
            document.querySelector(".fs-modal:not(.hide)").classList.add("hide");
            document.querySelector("#close-all").classList.add("hide");
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
            let height = screen.height * window.devicePixelRatio;
            let width = screen.width * window.devicePixelRatio;
            console.log(`Screen: ${width}x${height}  Multiplier: ${window.devicePixelRatio}`);
            let settings = { video: { width: width, height: height, facingMode: "environment" } };

            navigator.mediaDevices.getUserMedia(settings)
                .then(stream => video.srcObject = stream)
                .then(() => new Promise(resolve => video.onloadedmetadata = resolve))
                .then(() => {
                    video.style.display = 'block';
                    document.getElementById("insufficient-permissions").classList.add("hide");
                })
                .catch(e => {
                    console.error("Couldn't gain access to camera!", e);
                    Wizard.hideAllWizards();
                    new Wizard("#permission_error");
                    //TODO: Re-run wizard
                });
        } else {
            console.warn("No media devices found!");
            Wizard.hideAllWizards();
            new Wizard("#no_media");
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