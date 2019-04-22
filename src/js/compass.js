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

        this.deg = 0;
        this.degLast = null;
        this.markerPos = 180;

        this.leftside = true;
    }

    /**
     * Sets rotation of the compass
     * @param {Number} angle rotation (Degrees)
     * @returns {undefined}
     */
    setAngle(angle) {
        this.deg = angle;
        this.render();
    }

    /**
     * Sets the POI marker position on the compass
     * @param {Number} angle position (Degrees)
     * @returns {undefined}
     */
    setMarkerPosition(angle) {
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

        let degReal = angle % 360;
        degReal += offset;
        let pos = Math.floor((degReal / 90 * this.WIDTH) * precision) / precision;

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

        let degReal = this.deg % 360;
        let offset = Math.floor((-1 * degReal / 90 * this.WIDTH) * precision) / precision;

        if (offset == this.degLast) {
            return;
        }

        let inset = Math.floor((-4 * this.WIDTH) * precision) / precision;
        let center = 180;

        if (degReal > center && this.leftside) {
            if (this.markerPos < 90) {
                this.renderMarker(this.markerPos, 360);
            } else if (this.markerPos > 270) {
                this.renderMarker(this.markerPos, 0);
            }
            this.slider.firstElementChild.style.transform = `translateX(${-inset}px)`;
            this.slider.lastElementChild.style.transform = ``;
            this.leftside = false;
        } else if (degReal < center && !this.leftside) {
            if (this.markerPos < 90) {
                this.renderMarker(this.markerPos, 0);
            } else if (this.markerPos > 270) {
                this.renderMarker(this.markerPos, -360);
            }
            this.slider.lastElementChild.style.transform = `translateX(${inset}px)`;
            this.slider.firstElementChild.style.transform = ``;
            this.leftside = true;
        }

        if (Math.abs(offset - this.degLast) > 2 * this.WIDTH) {
            this.slider.style.transition = `none`;
            setTimeout(() => {
                this.slider.style.transition = ``;
            }, 40);
        }

        this.slider.style.transform = `translateX(${offset}px)`;

        this.degLast = offset;
    }
}