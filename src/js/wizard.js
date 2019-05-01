/**
 * Wizard class starts and handles the wizards that are displayed on first start and when location fix is needed
 */
export class Wizard{
    /**
     * Initializes the wizard, if run once is true, checks whether wizard already ran using WebStorage.
     * @param {String} selector string selector
     * @param {Boolean} runOnce whether to run wizard only once
     * @param {Object} caller caller object
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

                if (href == "#finish" || href == "./")
                {
                    wizard.finished();
                    return false;
                }

                let slide = this.closest(".slide");         

                wizard.slide++;

                let nextSlide = document.querySelector(`.slide-nr${wizard.slide}`);       

                //wizard.vibrateAlert(0);

                let action = slide.getAttribute("data-action");

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

                slide.classList.add("hide");
                nextSlide.classList.remove("hide");
            });
        });
    }

    /**
     * Hides the wizard and if it should be run only once, writes true to WebStorage.
     * @returns {undefined}
     */
    finished(){
        if (this.runOnce){
            window.localStorage.setItem(`wizard${this.selector}`, true);
        }
        
        document.querySelector("body").classList.remove("hide-controls");
        this.baseElement.classList.add("hide");
    }

    /**
     * Hides all wizards
     * @returns {undefined}
     */
    static hideAllWizards(){
        const elements = document.querySelectorAll(".wizard");
        elements.forEach(el => {
            if (!el.classList.contains("hide")){
                el.classList.add("hide");
            }
        });
    }
}