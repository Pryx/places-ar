import { Position } from 'position';

window.debug = false;

/**
 * Main class that handles all the basic functionality of
 * the web app like buttons and initializes other components
 * like the Compass, Settings or Map.
 */
class Main {
    constructor(){
        this.position = new Position();
        window.addEventListener("deviceorientationabsolute", this.position.listenerSwitch);
        window.addEventListener("deviceorientation", this.position.deviceOrientationChange);
        document.addEventListener("onfullscreenchange", this.fullScreenChange);
        this.initVideo();
    }

    initEvents(){
        $("#open-nav").click(function (e) {
            $(this).toggleClass("animate");
            $("#navigation").toggleClass("hide");
        });

        $(".back").click(function (e) {
            e.preventDefault();
            $("body").removeClass("nav-switched");
            $(this).closest(".nav-section").addClass("hide");
        });

        $(".nav-switch").click(function (e) {
            e.preventDefault();
            if (!$("body").hasClass("nav-switched")) {
                $("body").addClass("nav-switched");
            }
            let href = $(this).attr("href");
            $(href).removeClass("hide");
        });

        /**
        * Click handler for the fullscreen button. Uses the JavaScript
        * FullScreen API. Basic support is present in most major browsers.
        */
        $("#open-fullscreen").click(function (e) {
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
     */
    //TODO: Screen aspect ratio
    //TODO: Save & load settings
    initVideo() {
        let video = document.getElementById('video');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

            let settings = { video: { width: 1920, height: 1080, facingMode: "environment" } };

            navigator.mediaDevices.getUserMedia(settings)
                .then(stream => video.srcObject = stream)
                .then(() => new Promise(resolve => video.onloadedmetadata = resolve))
                .then(() => {
                    $(video).show();
                    //TODO: Wizard
                    $("#insufficient-permissions").hide();
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
     */
    fullScreenChange() {
        if (document.fullscreenElement) {
            jQuery("#open-fullscreen").addClass("on");
        } else {
            jQuery("#open-fullscreen").removeClass("on");
        }
    }
}

(function (){
    let main = new Main();
    main.initEvents();  
})();