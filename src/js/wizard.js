/**
 * Wizard class starts and handles the wizards that are displayed on first start and when location fix is needed
 */
export class Wizard{
    /**
     * 
     */
    constructor(selector, runOnce, caller){
        this.baseElement = document.querySelector(selector);
        this.runOnce = runOnce;
        this.caller = caller;
        if (runOnce && window.localStorage.getItem(`wizard${selector}`)){
            return null;
        }

        this.baseElement.classList.remove("hide");

        let elements = document.querySelectorAll(`${selector} .btn-next`);
        this.slide = 0;
        let wizard = this;

        elements.forEach(element => {
            element.addEventListener("click", function (e) {
                let href = this.getAttribute("href");
                console.log(href);
                if (href == "#finish")
                {
                    console.log("EEE");
                    wizard.finished();
                    return false;
                }

                wizard.slide++;
                this.closest(".slide").classList.add("hide");
                console.log(`.slide-nr${wizard.slide}`);
                document.querySelector(`.slide-nr${wizard.slide}`).classList.remove("hide");
            });
        });
    }

    /**
     * 
     */
    finished(){
        /*if (this.runOnce){
            window.localStorage.setItem(`wizard${selector}`, true);
        }*/
        console.log(this.baseElement);
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