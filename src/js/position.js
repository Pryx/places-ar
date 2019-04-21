import { Compass } from 'compass';
import { Location } from 'location';
import { Map } from 'map';
/**
 * This makes it possible to convert number from deg to rad and vice versa
 */
Number.prototype.toRad = function () {
    return this * Math.PI / 180;
}

Number.prototype.toDeg = function () {
    return this * 180 / Math.PI;
}

export class Position{
    constructor(){
        this.compass = new Compass(document.getElementById("compass"));
        
        if (window.debug) {
            document.onmousemove = e => {
                this.compass.setAngle(e.clientX / window.innerWidth * 360);
                console.log(e.clientX / window.innerWidth * 360)
                window.requestAnimationFrame(() => this.compass.render());
            }
        }

        this.usefulLocationEventCount = 0;
        this.relativeAdjust = 0;
        this.waitForFix = true;
        this.current = new Location();
        this.selected = new Location();
        this.map = new Map(this.current, (location) => this.confirmSelect(location));
        /**
         * Geolocation watcher initialization. Uses frequency set in settings.
         */
        navigator.geolocation.watchPosition((e) => this.locationUpdate(e), this.locationUpdateFail, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 90000
        });
    }

    /**
     * 
     */
    listenerSwitch() {
        document.getElementById("compass").classList.add("isAbsoluteEvent");
        window.removeEventListener("deviceorientationabsolute", this.listenerSwitch);
        window.removeEventListener("deviceorientation", this.deviceOrientationChange);
        this.waitForFix = false;
        this.relativeAdjust = 0;
        window.addEventListener("deviceorientationabsolute", this.deviceOrientationChange);
    }

    confirmSelect(newPOI){
        this.selected = newPOI;
        this.locationUpdate(null);
    }

    locationUpdate(position) {
        if (position != null) {
            this.current.lat = position.coords.latitude;
            this.current.lng = position.coords.longitude;
            this.current.ele = position.coords.altitude;
            this.current.acc = position.coords.accuracy;
            this.current.eleAcc = position.coords.altitudeAccuracy;

            if (this.waitForFix && (isNaN(position.coords.heading) || position.coords.heading == null)) {
                this.usefulLocationEventCount = 0;
                this.relativeAdjust = 0;
            } else if (this.waitForFix) {
                this.usefulLocationEventCount++;

                if (Math.abs(this.relativeAdjust - position.coords.heading) > 10) {
                    this.usefulLocationEventCount = 0;
                }

                this.relativeAdjust = position.coords.heading;

                if (this.usefulLocationEventCount > 3) {
                    this.relativeAdjust = this.relativeAdjust - this.current.deg - 90; //+90 because of landscape adjust :)
                    this.waitForFix = false;
                }
            }

            if (!$("body").hasClass("nav-switched")) {
                this.map.setCenter({ lat: this.current.latitude, lng: this.current.longtitude });
            }
        }

        if (isNaN(this.selected.lat) || isNaN(this.selected.lng) || isNaN(this.current.lat) || isNaN(this.current.lng)) {
            return;
        }

        let distance = this.distanceFromCoords(this.current, this.selected);
        let bearing = this.absBearing(this.selected, this.current);

        jQuery("#place-info").html(`<span id="location-name">${this.selected.name}</span><br>
            <span id="place-distance">${this.formatDistance(distance)} (± ${this.formatDistance(this.current.acc)} )</span>`);

        this.compass.setMarkerPosition(bearing);
    }


    locationUpdateFail(params) {
        console.error("Location update failed!");
    }

    formatDistance(distance) {
        if (distance > 1000) {
            return (distance / 1000).toFixed(2) + " km";
        } else {
            return (distance).toFixed(2) + " m";
        }
    }

    distanceFromCoords(coords1, coords2) {
        let R = 6371e3; // m

        let x1 = coords2.lat - coords1.lat;
        let x2 = coords2.lng - coords1.lng;

        let delta = { lat: 0, lng: 0 };
        delta.lat = x1.toRad();
        delta.lng = x2.toRad();

        let a = Math.sin(delta.lat / 2) * Math.sin(delta.lat / 2) +
            Math.cos(coords1.lat.toRad()) * Math.cos(coords2.lat.toRad()) *
            Math.sin(delta.lng / 2) * Math.sin(delta.lng / 2);

        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }


    absBearing(coords1, coords2) {
        let delta = { lat: 0, lng: 0 };
        delta.lng = (coords2.lng - coords1.lng);
        let y = Math.sin(delta.lng) * Math.cos(coords2.lat);
        let x = Math.cos(coords1.lat) * Math.sin(coords2.lat) - 
            Math.sin(coords1.lat) * Math.cos(coords2.lat) * Math.cos(delta.lng);
        let bearing = Math.atan2(y, x).toDeg();
        return (bearing + 360) % 360;
    }

    /**
     * 
     * @param {Event} e event that fired this callback
     */
    deviceOrientationChange(e) {
        let adjust = 0;

        let alpha = e.alpha;
        let beta = e.beta;
        let gamma = e.gamma;

        let orientation = screen.msOrientation || (screen.orientation || screen.mozOrientation || {}).type;

        let landscape = screen.width > screen.height;

        if (this.waitForFix && !e.absolute && !jQuery("#compass").hasClass("isrelative")) {
            jQuery("#compass").addClass("isrelative");
        } else if (jQuery("#compass").hasClass("isrelative") && !this.waitForFix) {
            jQuery("#compass").removeClass("isrelative");
            if (!e.absolute) {
                jQuery("#compass").addClass("hasfix");
            }
        }

        if (orientation === "landscape-primary") {
            adjust = -90;
        } else if (orientation === "landscape-secondary") {
            adjust = -90;
        } else if (orientation === "portrait-secondary" || orientation === "portrait-primary") {
            //TODO: Please rotate to landscape
        } else if (orientation === undefined) {
            console.warn("The orientation API isn't supported in this browser");
        }

        if (typeof alpha === "undefined" || alpha === null) {
            return;
        }
        //jQuery("#place-info").html(`${alpha} ${adjust} ${this.relativeAdjust}`);
        this.current.deg = alpha + adjust + this.relativeAdjust;

        if (gamma > 0) {
            this.current.deg += 180;
        }

        while (this.current.deg < 0) {
            this.current.deg += 360;
        }

        if (this.current.deg > 360) {
            this.current.deg = this.current.deg % 360;
        }

        this.compass.setAngle(360 - this.current.deg);
    }
}