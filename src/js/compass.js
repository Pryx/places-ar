import { PID_Controller } from "./pid-controller"

/**
 * The compass class encapsulates logic around rendering the actual Compass
 * based on device orientation data.
 */
export class Compass {
    /**
     * Creates a compass from a HTML element
     * @param {Element} html HTML element
     */
    constructor(html) {
        this.html = html;
        this.slider = html.querySelector(".compass-slider");
        /**
         * Gets slider width
         * @returns {Number} width
         */
        const setSliderWidth = () => this.WIDTH = this.slider.getBoundingClientRect().width;

        setSliderWidth();
        window.onresize = () => setSliderWidth();

        this.angle = 0;
        this.lastOffset = null;
        this.markerPos = 180;
        this.lastAngle = 0;

        this.leftside = true;
        this.pid = new PID_Controller(0.15, 0.04, 0.001);
        this.pid.setOutputLimits(-45, 45);
        window.pid = this.pid;
        setInterval(() => {
            this.angle += this.pid.compute(this.angle);
            //console.log(`Angle: ${this.angle} Deg last: ${this.lastAngle}`);
            if (this.lastAngle > 270 && this.pid.target < 90 ||
				this.pid.target > 270 && this.lastAngle < 90)
            {
				console.log("Trying to skip the animation!");
				this.slider.style.transition = `none`;
				this.angle = this.pid.target;
				window.requestAnimationFrame(() => {
					this.render();
					setTimeout(() => {
						this.slider.style.transition = ``;
					}, 40);
				});	
				this.lastAngle = this.pid.target;
				return;
			}
            window.requestAnimationFrame(() => this.render());
            this.lastAngle = this.angle;
        }, 40);
    }

    /**
     * Sets rotation of the compass
     * @param {Number} angle rotation (Degrees)
     * @returns {undefined}
     */
    setAngle(angle) {
        this.pid.setTarget(angle);
    }

    /**
     * Sets the POI marker position on the compass
     * @param {Number} angle position (Degrees)
     * @returns {undefined}
     */
    setMarkerPosition(angle) {
        //Shift to correct position
        angle -= 135;
        if (angle < 0) {
            angle += 360;
        }
        this.markerPos = angle;

        if (!this.leftside) {
            if (this.markerPos < 90) {
                this.renderMarker(this.markerPos, 360);
            } else {
                this.renderMarker(this.markerPos, 0);
            }
        } else if (!this.leftside) {
            if (this.markerPos > 270) {
                this.renderMarker(this.markerPos, -360);
            } else {
                this.renderMarker(this.markerPos, 0);
            }
        }
    }

    /**
     * Renders the POI marker on the compass. Offset is used in case compass is near 0°
     * @param {Number} angle position (Degrees)
     * @param {Number} offset offset (Degrees)
     * @returns {undefined}
     */
    renderMarker(angle, offset) {
        let precision = Math.pow(10, 3);

        let realAngle = angle % 360;
        realAngle += offset;
        let pos = Math.floor((realAngle / 90 * this.WIDTH) * precision) / precision;

        let marker = this.html.querySelector("#compass-icon");
        marker.style.left = pos + 'px';
        marker.style.display = 'block';
    }

    /**
     * Renders the compass
     * @returns {undefined}
     */
    render() {
        let precision = Math.pow(10, 3);

        let realAngle = this.angle % 360;
        let offset = Math.floor((-1 * realAngle / 90 * this.WIDTH) * precision) / precision;

        if (offset == this.lastOffset) {
            return;
        }

        let inset = Math.floor((-4 * this.WIDTH) * precision) / precision;
        let center = 180;

        document.getElementById("compass").classList.remove("right");
        document.getElementById("compass").classList.remove("left");
        
        let delta = this.angle - this.markerPos + 45;
        console.log(`DELTA ${delta} ${this.markerPos}`);
        if (Math.abs(delta) > 45)
        {
            //if (this.markerPos <= 180){
                console.log("closer to left");
                if (delta > 180 || delta < 0) {
                    document.getElementById("compass").classList.add("right");
                } else {
                    document.getElementById("compass").classList.add("left");
                }
            /*} else {
                console.log("closer to right");
                //console.log(this.angle, this.markerPos, delta, this.markerPos - 180, this.markerPos - 45);
                if (delta > 180 || delta < 0) {
                    document.getElementById("compass").classList.add("left");
                } else {
                    document.getElementById("compass").classList.add("right");
                }
            }*/
        }

        
        

        /*if (realAngle > (360 + (180 - this.markerPos - 45) % 360)){
            document.getElementById("compass").classList.add("left");
        } else if (realAngle < (360 + (90 - this.markerPos - 45) % 360)){
            document.getElementById("compass").classList.add("right");
        }*/


        if (realAngle > center && this.leftside) {
            if (this.markerPos < 90) {
                console.log("this.markerPos < 90 leftside");
                this.renderMarker(this.markerPos, 360);
            } else if (this.markerPos > 270) {
                console.log("this.markerPos > 270 leftside");
                this.renderMarker(this.markerPos, 0);
            }
            this.slider.firstElementChild.style.transform = `translateX(${-inset}px)`;
            this.slider.lastElementChild.style.transform = ``;
            this.leftside = false;
        } else if (realAngle < center && !this.leftside) {
            if (this.markerPos < 90) {
                console.log("this.markerPos < 90 !leftside");
                this.renderMarker(this.markerPos, 0);
            } else if (this.markerPos > 270) {
                console.log("this.markerPos > 270 !leftside");
                this.renderMarker(this.markerPos, -360);
            }
            this.slider.lastElementChild.style.transform = `translateX(${inset}px)`;
            this.slider.firstElementChild.style.transform = ``;
            this.leftside = true;
        }

        this.slider.style.transform = `translateX(${offset}px)`;

        this.lastOffset = offset;
    }
}