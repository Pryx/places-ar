import { Location } from 'location';
import _ from 'geolocation-marker';

export class Map{
    constructor(currentPosition, callback){
        let origin = { lat: currentPosition.latitude, lng: currentPosition.longtitude };

        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: origin
        });
        let temporary = new Location();

        let ClickEventHandler = function (map, origin) {
            this.origin = origin;
            this.map = map;
            this.placesService = new google.maps.places.PlacesService(map);
            this.elevator = new google.maps.ElevationService;

            this.infowindow = new google.maps.InfoWindow;
            this.infowindowContent = document.getElementById('infowindow-content');
            this.infowindow.setContent(this.infowindowContent);

            // Listen for clicks on the map.
            this.map.addListener('click', this.handleClick.bind(this));
        };

        ClickEventHandler.prototype.handleClick = function (event) {
            if (event.placeId) {
                event.stop();
                this.getPlaceInformation(event.placeId);
            }
        };

        ClickEventHandler.prototype.getPlaceInformation = function (placeId) {
            let me = this;
            this.placesService.getDetails({ placeId: placeId }, function (place, status) {
                if (status === 'OK') {
                    temporary.lng = place.geometry.location.lng();
                    temporary.lat = place.geometry.location.lat();
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

        console.log(GeolocationMarker);
        this.clickHandler = new ClickEventHandler(this.map, origin);
        this.geoMarker = new GeolocationMarker(this.map);

        $("body").on("click", "#infowindow-content .btn", function (e) {
            $("body").removeClass("nav-switched");
            $("#open-nav").removeClass("animate");
            $(this).closest(".nav-section").addClass("hide");
            $("#navigation").addClass("hide");
            callback(temporary);
        }); 
    }
    

    setCenter(center){
        this.map.setCenter(center);
    }
}