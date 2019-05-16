/**
 * This class manages settings and applying them. 
 */
export class Settings {
    /**
     * Constructor sets the default values of member variables.
     */
    constructor(caller) {
        this.caller = caller;
        this.setDefaults();
        this.init();

        let elements = document.querySelectorAll(".slider input[type=range]")
        elements.forEach(el => {    
            el.addEventListener("input", (e) =>{
                e.currentTarget.closest(".slider").querySelector("input[type=number]").value = e.currentTarget.value;
            });
        });
        
        elements = document.querySelectorAll(".slider input[type=number]")
        elements.forEach(el => {
            el.addEventListener("change", (e) => {
                e.currentTarget.closest(".slider").querySelector("input[type=range]").value = e.currentTarget.value;
            });
        });

        document.getElementById("save").addEventListener("click", (e) =>{
            this.saveSettings();
            document.querySelector("body").classList.remove("hide-controls");
            document.getElementById("close-all").classList.add("hide");
            document.getElementById("settings").classList.add("hide");
        });
    }

    /**
     * If not defined yet, set the default values of settings
     * @returns {undefined}
     */
    setDefaults(){
        if (!window.localStorage.getItem("geoMaxAge")) {
            window.localStorage.setItem('geoMaxAge', 1);
        }

        if (!window.localStorage.getItem("videoQuality")) {
            window.localStorage.setItem('videoQuality', 1);
        }
    }

    /**
     * 
     */
    init(){
        let elements = document.querySelectorAll(".slider input[type=range]")
        elements.forEach(el => {
            let value = window.localStorage.getItem(el.name);
            el.value = value;
            el.closest(".slider").querySelector("input[type=number]").value = value;
        });
    }

    /**
     * Saves settings and does all actions needed to apply them.
     * @returns {undefined}
     */
    saveSettings(){
        let elements = document.querySelectorAll(".slider input[type=range]")
        elements.forEach(el => {
            if (window.localStorage.getItem(el.name) != el.value)
            {
                window.localStorage.setItem(el.name, el.value);
            } else {
                return;
            }

            console.info(`Updating ${el.name} to ${el.value}`);

            switch (el.name) {
                case "videoQuality":
                    this.caller.initVideo();        
                    break;
                
                case "geoMaxAge":
                    this.caller.positionService.reinitGeolocationWatcher();
                    break;
            
                default:
                    break;
            }
            
            
        });
    }

    /*setMaximumAge(age){
        navigator.geolocation.clearWatch();
    }*/
}