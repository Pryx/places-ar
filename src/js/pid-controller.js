
/**
 * PID Controller implementation in JavaScript
 * Adapted from https://github.com/br3ttb/Arduino-PID-Library
 * Based on https://codepen.io/sbrekken/pen/juxzs
 */
export class PID_Controller {
    /**
     * Creates a PID controller
     * @param {Number} p proportional
     * @param {Number} i integral
     * @param {Number} d derivative
     */
    constructor(p, i, d) {
        this.sampleTime = 40;
        this.p = p;
        this.i = i * 0.04;
        this.d = d / 0.04;

        this.target = 0;
        this.output = 0;

        this.errorSum = 0;
        this.lastInput = 0;
        this.lastTime = 0;
    }

    /**
     * Sets output limits so the PID controller doesn't go crazy
     * @param {Number} min Minimum
     * @param {Number} max Maximum
     * @returns {undefined}
     */
    setOutputLimits(min, max) {
        this.min = min
        this.max = max
    }

    /**
     * Sets the desired value
     * @param {Number} value Desired value
     * @returns {undefined}
     */
    setTarget(value) {
        this.target = value
    }

    /**
     * Computes the controller output based on what the current value is. Is sampled
     * based on the sample time set in constrictor.
     * @param {Number} input Current value
     * @returns {Number} Computed controller output
     */
    compute(input) {
        let now = Date.now();
        if (Date.now() - this.lastTime >= this.sampleTime) {
            let error = this.target - input;
            let inputDiff = input - this.lastInput;

            //If error is close to 0, why do anything?
            if (Math.floor(error) == 0)
            {
                this.output = 0;
                this.errorSum = 0;
                if (window.debug){
                    console.log(input, error, this.errorSum, this.output, this.lastInput);
                }
                return 0;
            }

            this.errorSum = Math.max(this.min, Math.min(this.max, this.errorSum + (this.i * error)));
            this.output = Math.max(this.min, Math.min(this.max, (this.p * error) + this.errorSum - (this.d * inputDiff)));
            this.lastInput = input;
            this.lastTime = now;

            if (window.debug){
                console.log(input, error, this.errorSum, this.output, this.lastInput);
            }
        }

        return this.output;
    }
}