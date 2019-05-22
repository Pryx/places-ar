import { Location } from './location';


/**
 * This class encapsulates Google Maps and everything related to it. 
 * Meant to make it easier in case we decide to go with another provider.
 */
export class Map{
    /**
     * Constructor initializes map from the map provider (Google Maps) and ad
     * @param {Function} callback Callback for when user select different POI
     */
    constructor(callback){
        let origin = { lat: 50.0755381, lng: 14.4378005 };

        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: origin,
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false
        });

        this.map = map;
        let temporary = new Location();

        /**
         * Creates new MapEventHandler for Google Maps
         * @param {google.maps.Map} map Google Map instance
         * @param {Object} origin Location
         * @returns {undefined}
         */
        let MapEventHandler = function (map, origin) {
            this.origin = origin;
            this.map = map;
            this.placesService = new google.maps.places.PlacesService(map);
            this.elevator = new google.maps.ElevationService;

            this.infowindow = new google.maps.InfoWindow;
            this.infowindowContent = document.getElementById('infowindow-content');
            this.infowindow.setContent(this.infowindowContent);
            
            var card = document.getElementById('pac-card');
            var input = document.getElementById('pac-input');

            map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

            this.searchBox = new google.maps.places.SearchBox(input);

            this.searchBox.bindTo('bounds', map);

            this.searchBox.addListener('places_changed', () => this.placesChanged());

            // Listen for clicks on the map.
            this.map.addListener('click', this.handleClick.bind(this));
        };

        MapEventHandler.prototype.handleClick = function (event) {
            google.maps.event.trigger(this.map, "resize");
            document.getElementById("place-select").focus();
            if (event.placeId) {
                event.stop();
                this.getPlaceInformation(event.placeId);
            }
        };

        MapEventHandler.prototype.getPlaceInformation = function (placeId) {
            let me = this;
            this.placesService.getDetails({ placeId: placeId }, function (place, status) {
                if (status === 'OK') {
                    temporary.longitude = place.geometry.location.lng();
                    temporary.latitude = place.geometry.location.lat();
                    temporary.name = place.name;

                    me.infowindow.close();
                    me.infowindow.setPosition(place.geometry.location);
                    me.infowindowContent.children['place-icon'].src = place.icon;
                    me.infowindowContent.children['place-name'].textContent = place.name;
                    me.infowindowContent.children['place-address'].textContent = place.formatted_address;
                    me.infowindow.open(me.map);

                    me.elevator.getElevationForLocations({
                        'locations': [place.geometry.location]
                    }, function (results, st) {
                        if (st === 'OK') {
                            if (results[0]) {
                                temporary.ele = results[0].elevation;

                            } else {
                                console.warn('No results found');
                            }
                        } else {
                            console.error('Elevation service failed due to: ' + st);
                        }
                    });

                }
            });
        };

        MapEventHandler.prototype.placesChanged = function () {
            let me = this;
            me.infowindow.close();
            let exit = false;

            var places = this.autocomplete.getPlaces();
            places.forEach(function (place) {
                if (exit){
                    return;
                }
                if (!place.geometry) {
                    console.warn(`No geometry for ${place.name}`);
                    return;
                }

                if (place.geometry.viewport) {
                    me.map.fitBounds(place.geometry.viewport);
                } else {
                    me.map.setCenter(place.geometry.location);
                    me.map.setZoom(17);  // Why 17? Because it looks good.
                }

                temporary.longitude = place.geometry.location.lng();
                temporary.latitude = place.geometry.location.lat();
                temporary.name = place.name;

                me.infowindow.close();
                me.infowindow.setPosition(place.geometry.location);
                me.infowindowContent.children['place-icon'].src = place.icon;
                me.infowindowContent.children['place-name'].textContent = place.name;
                me.infowindowContent.children['place-address'].textContent = place.formatted_address;
                me.infowindow.open(me.map);
                google.maps.event.trigger(me.map, "resize");
                exit = true;
            });
        };

        this.mapEventHandler = new MapEventHandler(this.map, origin);
        // Disabled because the package doesn't export GeolocationMarker, so can't use that
        require('geolocation-marker');
        this.geoMarker = new GeolocationMarker(this.map);

        document.querySelector("#infowindow-content .btn").addEventListener("click", function () {
            document.querySelector("body").classList.remove("hide-controls");
            document.getElementById("close-all").classList.add("hide");
            document.getElementById("place-select").classList.add("hide");
            callback(temporary);
        }); 
    }
    
    /**
     * Moves the center of the map to keep track of the user
     * @param {Position} center Position
     * @returns {undefined}
     */
    setCenter(center){
        console.info("Setting center", center);
        this.map.setCenter(center);
    }
}