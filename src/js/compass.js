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
        this.markerPos = null;
        this.lastAngle = 0;

        this.leftside = true;
        this.pid = new PID_Controller(0.15, 0.04, 0.001);
        this.pid.setOutputLimits(-45, 45);
        window.pid = this.pid;

        /**
         * This interval samples data for the PID controller.
         */
        setInterval(() => {
            if (this.lastAngle > 270 && this.pid.target < 90) {
                console.log("Skip animation right");
                this.slider.style.transition = `none`;
                this.angle = 0;
                window.requestAnimationFrame(() => {
                    this.render();
                    setTimeout(() => {
                        this.slider.style.transition = ``;
                        setTimeout(() => {
                            this.angle += this.pid.compute(this.angle);
                            window.requestAnimationFrame(() => this.render());
                        }, 5);
                    }, 1);
                });
                this.lastAngle = 0;
                return;
            } else if (this.pid.target > 270 && this.lastAngle < 90) {
				console.log("Skip animation left");
				this.slider.style.transition = `none`;
                this.angle = 359.99;
				window.requestAnimationFrame(() => {
                    this.render();
                    setTimeout(() => {
                        this.slider.style.transition = ``;
                        setTimeout(() => {
                            this.angle += this.pid.compute(this.angle);
                            window.requestAnimationFrame(() => this.render());
                        }, 5);
                    }, 1);
				});	
                this.lastAngle = 359;
                return;
            }        

            this.angle += this.pid.compute(this.angle);
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
        //Shift to correct position... -90 for landscape adjust, -45 because north marker is in half...
        angle -= 135;
        if (angle < 0) {
            angle += 360;
        }
        this.markerPos = angle;

        // Switching north segment when rolling over
        if (!this.leftside) {
            if (this.markerPos < 90) {
                this.renderMarker(this.markerPos, 360);
            } else {
                this.renderMarker(this.markerPos, 0);
            }
        } else if (this.leftside) {
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

        if (this.markerPos != null){
            if (Math.abs(Math.min(delta, 360 - delta)) > 45)
            {
                if (delta > 180 || delta < 0) {
                    document.getElementById("compass").classList.add("right");
                } else {
                    document.getElementById("compass").classList.add("left");
                }
            }
        }

        // Switching north segment when rolling over
        if (realAngle > center && this.leftside) {
            //Marker must handle the roll over too... Switching the positions is done by offset
            if (this.markerPos != null){
                if (this.markerPos < 90) {
                    this.renderMarker(this.markerPos, 360);
                } else if (this.markerPos > 270) {
                    this.renderMarker(this.markerPos, 0);
                }
            }

            this.slider.firstElementChild.style.transform = `translateX(${-inset}px)`;
            this.slider.lastElementChild.style.transform = ``;
            this.leftside = false;
        } else if (realAngle < center && !this.leftside) {
            //Marker must handle the roll over too... Switching the positions is done by offset
            if (this.markerPos != null){
                if (this.markerPos < 90) {
                    this.renderMarker(this.markerPos, 0);
                } else if (this.markerPos > 270) {
                    this.renderMarker(this.markerPos, -360);
                }
            }
            
            this.slider.lastElementChild.style.transform = `translateX(${inset}px)`;
            this.slider.firstElementChild.style.transform = ``;
            this.leftside = true;
        }

        this.slider.style.transform = `translateX(${offset}px)`;

        this.lastOffset = offset;
    }
}