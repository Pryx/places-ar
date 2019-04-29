/**
 * Wizard class starts and handles the wizards that are displayed on first start and when location fix is needed
 */
export class Wizard{
    /**
     * 
     */
    constructor(selector, runOnce, caller){
        this.selector = selector;
        this.baseElement = document.querySelector(selector);
        this.runOnce = runOnce;
        this.caller = caller;
        if (runOnce && window.localStorage.getItem(`wizard${selector}`)){
            this.wasRun = false;
            return;
        }

        this.wasRun = true;
        this.baseElement.classList.remove("hide");

        let elements = document.querySelectorAll(`${selector} .btn-next`);
        this.slide = 0;
        let wizard = this;

        document.querySelector("body").classList.add("hide-controls");

        elements.forEach(element => {
            element.addEventListener("click", function (e) {
                let href = this.getAttribute("href");

                if (href == "#finish")
                {
                    wizard.finished();
                    return false;
                }

                let slide = this.closest(".slide");         

                wizard.slide++;
                slide.classList.add("hide");

                let nextSlide = document.querySelector(`.slide-nr${wizard.slide}`);       

                nextSlide.classList.remove("hide");

                //wizard.vibrateAlert(0);

                let action = nextSlide.getAttribute("data-action");

                switch (action) {
                    case "camera":
                        caller.initVideo();
                        break;

                    case "location":
                        caller.positionService.initGeolocationWatcher();
                        break;

                    default:
                        break;
                }
            });
        });
    }

    /**
     * 
     */
    finished(){
        if (this.runOnce){
            window.localStorage.setItem(`wizard${this.selector}`, true);
        }
        
        document.querySelector("body").classList.remove("hide-controls");
        this.baseElement.classList.add("hide");
    }

    /**
     * Vibrates phone to notify user of location fix
     * @param {Number} count Couns how many vibrations took place
     * @returns {undefined}
     */
    vibrateAlert(count){
        if (count == 4){
            return;
        }

        window.navigator.vibrate(400);

        setTimeout(() => {
            this.vibrateAlert(count + 1);
        }, 600);
    }
}