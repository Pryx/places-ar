import { Compass } from './compass';
import { Location } from './location';
import { Map } from './map';
/**
 * This makes it possible to convert number from degrees to radians.
 * @returns {Number} Degrees converted to radians
 */
Number.prototype.toRad = function () {
    return this * Math.PI / 180;
}
/**
 * This makes it possible to convert number from radians to degrees.
 * @returns {Number} Radians converted to degrees
 */
Number.prototype.toDeg = function () {
    return this * 180 / Math.PI;
}

/**
 * This class encapsulates everything related to position. Contains
 * current position and selected POI position.
 */
export class PositionService{
    /**
     * The constructor binds device orientation events and creates the Compass and Map
     * objects. Also Geolocation watcher and Location is initialized here.
     * @see {Compass}
     * @see {Map}
     * @see {Location}
     */
    constructor(){
        this.switchHandler = () => this.listenerSwitch();
        this.orientationHandler = (e) => this.deviceOrientationChange(e);
        window.addEventListener("deviceorientationabsolute", this.switchHandler);
        window.addEventListener("deviceorientation", this.orientationHandler);

        this.compass = new Compass(document.getElementById("compass"));
        
        if (window.debug) {
            document.onmousemove = e => {
                this.compass.setAngle((e.clientX / window.innerWidth * 720) % 360);
                console.log((e.clientX / window.innerWidth * 720) % 360);
                //window.requestAnimationFrame(() => this.compass.render());
            }
        }


        document.getElementById("recenter").addEventListener("click", (e) => {
            console.log("Recenter triggered");
            this.map.setCenter({ lat: this.current.latitude, lng: this.current.longitude });
        });
        this.usefulLocationEventCount = 0;
        this.relativeAdjust = 0;
        this.waitForFix = true;
        this.current = new Location();
        this.selected = new Location();
    }

    /**
     * Initializes the geolocation watcher. Uses Max Age set in settings.
     * @returns {undefined}
     */
    initGeolocationWatcher(){
        this.locationUpdateHandler = navigator.geolocation.watchPosition(
            (e) => this.locationUpdate(e),
            this.locationUpdateFail, 
            {
                enableHighAccuracy: true, //We need high accuracy to be precise enough
                maximumAge: window.localStorage.getItem("geoMaxAge"), //Get from settings
                timeout: 60000 //1 minute
            }
        );
        this.map = new Map((location) => this.confirmSelect(location));
    }

    /**
     * Reinitializes geolocation watcher
     * @returns {undefined}
     */
    reinitGeolocationWatcher(){
        navigator.geolocation.clearWatch(this.locationUpdateHandler);

        this.locationUpdateHandler = navigator.geolocation.watchPosition(
            (e) => this.locationUpdate(e),
            this.locationUpdateFail,
            {
                enableHighAccuracy: true, //We need high accuracy to be precise enough
                maximumAge: window.localStorage.getItem("geoMaxAge"), //Get from settings
                timeout: 60000 //1 minute
            }
        );
    }

    /**
     * This function turns off the relative position deviceorientation listener if the
     * deviceorientationabsolute is provided by the browser.
     * @returns {undefined}
     */
    listenerSwitch() {
        document.getElementById("compass").classList.add("isAbsoluteEvent");
        window.removeEventListener("deviceorientationabsolute", this.switchHandler);
        window.removeEventListener("deviceorientation", this.orientationHandler);
        this.waitForFix = false;
        this.relativeAdjust = 0;
        window.addEventListener("deviceorientationabsolute", this.orientationHandler);
    }

    /**
     * This function is run after user selects new POI to update the Position
     * object with the new one and recompute all important data.
     * @param {Location} newPOI Updated POI location
     * @see {Location}
     * @returns {undefined}
     */
    confirmSelect(newPOI){
        this.selected = newPOI;
        this.locationUpdate(null);
    }

    /**
     * Event handler for the GeolocationWatcher that recomputes distance and updates bearing.
     * @param {Position} position New position provided by the watcher
     * @returns {undefined}
     */
    locationUpdate(position) {
        if (position != null) {
            this.current.latitude = position.coords.latitude;
            this.current.longitude = position.coords.longitude;
            this.current.elevation = position.coords.altitude;
            this.current.accuracy = position.coords.accuracy;
            this.current.elevationAccuracy = position.coords.altitudeAccuracy;

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
                    this.relativeAdjust = this.relativeAdjust - this.current.bearing - 90; //+90 because of landscape adjust :)
                    this.waitForFix = false;
                }
            }

            if (!document.querySelector("body").classList.contains("hide-controls")) {
                this.map.setCenter({ lat: this.current.latitude, lng: this.current.longitude });
            }
        }

        if (isNaN(this.selected.latitude) || isNaN(this.selected.longitude) || 
            isNaN(this.current.latitude) || isNaN(this.current.longitude)) {
            return;
        }

        let distance = PositionService.distanceFromCoords(this.current, this.selected);
        let bearing = PositionService.absBearing(this.selected, this.current);

        document.getElementById("place-info").innerHTML = `<span id="location-name">${this.selected.name}</span><br>
            <span id="place-distance">
                ${PositionService.formatDistance(distance)} (± ${PositionService.formatDistance(this.current.accuracy)})
            </span>`;

        this.compass.setMarkerPosition(bearing);
    }

    /**
     * Location error handler
     * @param {PositionError} error Object describing the error
     * @returns {undefined}
     */
    locationUpdateFail(error) {
        console.error(`Location update failed! ID: ${error.code} Message: ${error.message}`);
    }

    /**
     * Makes a formatted string (metric system) from a number representing the distance in meters.
     * @param {Number} distance Distance in meters
     * @returns {String} formatted string
     */
    static formatDistance(distance) {
        if (distance >= 1000) {
            return `${parseFloat((distance / 1000).toFixed(2))} km`;
        } else {
            return `${parseFloat((distance).toFixed(2))} m`;
        }
    }

    /**
     * Computes distance between two locations using the Haversine formula
     * @param {Location} coords1 First location
     * @param {Location} coords2 Second location
     * @see {Location}
     * @returns {Number} Distance in meters
     */
    static distanceFromCoords(coords1, coords2) {
        let R = 6371e3; // m

        let x1 = coords2.latitude - coords1.latitude;
        let x2 = coords2.longitude - coords1.longitude;

        let delta = { latitude: 0, longitude: 0 };
        delta.latitude = x1.toRad();
        delta.longitude = x2.toRad();

        let a = Math.sin(delta.latitude / 2) * Math.sin(delta.latitude / 2) +
            Math.cos(coords1.latitude.toRad()) * Math.cos(coords2.latitude.toRad()) *
            Math.sin(delta.longitude / 2) * Math.sin(delta.longitude / 2);

        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Computes bearing between two locations
     * @param {Location} coords1 First location (from)
     * @param {Location} coords2 Second location (where)
     * @see {Location}
     * @returns {Number} Bearing (counterclockwise from north)
     */
    static absBearing(coords1, coords2) {
        let delta = { latitude: 0, longitude: 0 };

        delta.longitude = (coords2.longitude - coords1.longitude);

        let y = Math.sin(delta.longitude.toRad()) * Math.cos(coords2.latitude.toRad());

        let x = (Math.cos(coords1.latitude.toRad()) * Math.sin(coords2.latitude.toRad())) - 
            (Math.sin(coords1.latitude.toRad()) * Math.cos(coords2.latitude.toRad()) * Math.cos(delta.longitude.toRad()));
        let bearing = Math.atan2(y, x).toDeg();
        return (bearing + 360) % 360;
    }

    /**
     * Device orientation change event handler. Normalizes the values and updates compass accordingly.
     * If position is relative, then it displays warning.
     * @param {DeviceMotionEvent} e DeviceMotionEvent
     * @returns {undefined}
     */
    deviceOrientationChange(e) {
        let adjust = 0;

        let alpha = e.alpha;
        let beta = e.beta;
        let gamma = e.gamma;

        let orientation = screen.msOrientation || (screen.orientation || screen.mozOrientation || {}).type;

        let landscape = screen.width > screen.height;

        

        if (this.waitForFix && !e.absolute && !document.getElementById("compass").classList.contains("isrelative")) {
            document.getElementById("compass").classList.add("isrelative");
        } else if (document.getElementById("compass").classList.contains("isrelative") && !this.waitForFix) {
            document.getElementById("compass").classList.remove("isrelative");
            if (!e.absolute) {
                document.getElementById("compass").classList.add("hasfix");
            }
        }

        if (orientation === "landscape-primary") {
            adjust = -90;
        } else if (orientation === "landscape-secondary") {
            adjust = -90;
        } else if (orientation === undefined) {
            console.warn("The orientation API isn't supported in this browser");
        }

        if (typeof alpha === "undefined" || alpha === null) {
            return;
        }
        //document.getElementById("place-info").innerHTML = `${alpha} ${adjust} ${this.relativeAdjust}`;
        this.current.bearing = alpha + adjust + this.relativeAdjust;

        if (gamma > 0) {
            this.current.bearing += 180;
        }

        while (this.current.bearing < 0) {
            this.current.bearing += 360;
        }

        if (this.current.bearing > 360) {
            this.current.bearing = this.current.bearing % 360;
        }

        this.compass.setAngle(360 - this.current.bearing);
    }
}