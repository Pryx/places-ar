let debug = false;

let currentPos = {
    lat: 50.0755381,
    lng: 14.4378005,
    ele: 0,
    eleAcc: Infinity,
    acc: Infinity,
    deg: 0
};

let selectedPos = {
    name: "",
    lat: NaN,
    lng: NaN,
    ele: NaN
};

let tmpPos = {
    name: "",
    lat: NaN,
    lng: NaN,
    ele: NaN
};

let map = null;

let waitForFix = true;
let relativeAdjust = 0;

$( document ).ready(function() {
    document.onfullscreenchange = fullScreenChange;
    
    function fullScreenChange(){
        if (document.fullscreenElement) { 
            jQuery("#open-fullscreen").addClass("on");
        }else{
            jQuery("#open-fullscreen").removeClass("on");
        }
    };

    $("#open-fullscreen").click(function(e){
        if (document.fullscreenElement) { 
            document.exitFullscreen();
        }else{
            if (document.fullscreenEnabled) {
                document.getElementById("main").requestFullscreen({ navigationUI: "hide" });
                screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;

			    if (screen.lockOrientationUniversal("landscape-primary")) {
			        console.log("Screen orientation locked");
			    } else {
			        console.log("Screen orientation lock failed");
			    }
            }else{
                console.warn("Fullscreen not supported");
            }
        }
    });

	//TODO: Screen aspect ratio
	//TODO: Save & load settings
    let video = document.getElementById('video');

	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

        let settings = { video: { width: 1920, height: 1080, facingMode: "environment"}};

		navigator.mediaDevices.getUserMedia(settings)
		.then(stream => video.srcObject = stream)
		.then(() => new Promise(resolve => video.onloadedmetadata = resolve))
		.then(() => {
			$(video).show();
			$("#insufficient-permissions").hide();
		})
		.catch(e => {
			console.error("Couldn't gain access to camera!");
			console.error(e);
			//TODO	
		});
	} else {
		console.warn("No media devices found!");
		//TODO Shown warning
	}


    navigator.geolocation.watchPosition(locationUpdate, locationUpdateFail, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 90000
    });

	$("#open-nav").click(function(e){
		$(this).toggleClass("animate");
		$("#navigation").toggleClass("hide");
    });

    $(".back").click(function(e){
        e.preventDefault();
        $("body").removeClass("nav-switched");
        $(this).closest(".nav-section").addClass("hide");
    });
    
    $(".nav-switch").click(function(e){
        e.preventDefault();
        if (!$("body").hasClass("nav-switched"))
        {
            $("body").addClass("nav-switched");
        }
        let href = $(this).attr("href");
        $(href).removeClass("hide");
    });

    $("body").on("click", "#infowindow-content .btn", function(e){
        $("body").removeClass("nav-switched");
        $("#open-nav").removeClass("animate");
        $(this).closest(".nav-section").addClass("hide");
        $("#navigation").addClass("hide");

        selectedPos = tmpPos;
        locationUpdate(null);
    }); 

    function initMap() {
        let origin = { lat: currentPos.lat, lng: currentPos.lng };

        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: origin
        });
        let clickHandler = new ClickEventHandler(map, origin);
        let GeoMarker = new GeolocationMarker(map);
    }

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
                tmpPos.lng = place.geometry.location.lng();
                tmpPos.lat = place.geometry.location.lat();
                tmpPos.name = place.name;

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
                            tmpPos.ele = results[0].elevation;

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

    initMap();
});

if (debug){
	document.onmousemove = e => {
	    cp.setAngle(e.clientX / window.innerWidth * 360);
	    console.log(e.clientX / window.innerWidth * 360)
	    window.requestAnimationFrame(() => cp.render());
	}
}

class Compass {
    constructor(html) {
        this.html = html;
        this.slider = html.querySelector("#compass-slider");

        const setSliderWidth = () => this.WIDTH = this.slider.getBoundingClientRect().width;

        setSliderWidth();
        window.onresize = () => setSliderWidth();

        this.deg = 0;
        this.degLast = null;
        this.markerPos = 180;

        this.leftside = true;
    }

    setAngle(angle) {
        this.deg = angle;
        this.render();
    }

    setMarkerPosition(angle){
        angle -= 135;
    	if (angle<0){
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

    renderMarker(angle, offset){
        let precision = Math.pow(10, 3); // přesnost 4 desetinná místa

        let degReal = angle % 360;
        degReal += offset;
        let pos = Math.floor((degReal / 90 * this.WIDTH) * precision) / precision;

        let marker = this.html.querySelector("#compass-icon");
        marker.style.left = pos + 'px';
        marker.style.display = 'block';
    }

    render() {
        let precision = Math.pow(10, 3); // přesnost 4 desetinná místa

        let degReal = this.deg % 360;
        let offset = Math.floor((-1 * degReal / 90 * this.WIDTH) * precision) / precision;

        if (offset == this.degLast) return;

        let inset = Math.floor((-4 * this.WIDTH) * precision) / precision;
        let center = 180;

        if (degReal > center && this.leftside) {
            if (this.markerPos<90)
            {
                this.renderMarker(this.markerPos, 360);
            } else if (this.markerPos > 270) {
                this.renderMarker(this.markerPos, 0);
            }
            this.slider.firstElementChild.style.transform = `translateX(${-inset}px)`;
            this.slider.lastElementChild.style.transform = ``;
            this.leftside = false;
        } else if (degReal < center && !this.leftside) {
            if (this.markerPos<90)
            {
                this.renderMarker(this.markerPos, 0);
            } else if (this.markerPos > 270){
                this.renderMarker(this.markerPos, -360);
            }
            this.slider.lastElementChild.style.transform = `translateX(${inset}px)`;
            this.slider.firstElementChild.style.transform = ``;
            this.leftside = true;
        }

        if (Math.abs(offset - this.degLast) > 2*this.WIDTH){
            this.slider.style.transition = `none`;
            setTimeout(() => {
                this.slider.style.transition = ``;
            }, 40);
        }

        this.slider.style.transform = `translateX(${offset}px)`;

        this.degLast = offset;
    }
}

const cp = new Compass(document.getElementById("compass"));

function locationUpdate(position) {
    if (position != null){
        currentPos.lat = position.coords.latitude;
        currentPos.lng = position.coords.longitude;
        currentPos.ele = position.coords.altitude;
        currentPos.acc = position.coords.accuracy;
        currentPos.eleAcc = position.coords.altitudeAccuracy;

        if (waitForFix && (isNaN(position.coords.heading) || position.coords.heading==null)){
            usefulLocationEventCount = 0;
            relativeAdjust = 0;
        }else if (waitForFix){
            usefulLocationEventCount++;

            if (Math.abs(relativeAdjust - position.coords.heading) > 10) {
                usefulLocationEventCount = 0;
            }

            relativeAdjust = position.coords.heading;

            if (usefulLocationEventCount > 3){
                relativeAdjust = relativeAdjust - currentPos.deg - 90; //+90 because of landscape adjust :)
                waitForFix = false;
            }
        }

        if (!$("body").hasClass("nav-switched"))
        {
            map.setCenter({lat:currentPos.lat, lng:currentPos.lng});
        }
    }

    if (isNaN(selectedPos.lat) || isNaN(selectedPos.lng) || isNaN(currentPos.lat) || isNaN(currentPos.lng)){
    	return;
    }

    let distance = distanceFromCoords(currentPos, selectedPos);
    let bearing = absBearing(selectedPos, currentPos);

    jQuery("#place-info").html(`<span id="location-name">${selectedPos.name}</span><br>
        <span id="place-distance">${formatDistance(distance)} (± ${formatDistance(currentPos.acc)} )</span>`);

	cp.setMarkerPosition(bearing);
}

function formatDistance(distance){
    if (distance>1000){
        return (distance / 1000).toFixed(2) + " km";
    }else{
        return (distance).toFixed(2) + " m";
    }
}

function locationUpdateFail(params) {
    console.error("Location update failed!");
}


Number.prototype.toRad = function () {
    return this * Math.PI / 180;
}

Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
}

function distanceFromCoords(coords1, coords2){
    let R = 6371e3; // m
    
    let x1 = coords2.lat - coords1.lat;
    let x2 = coords2.lng - coords1.lng;

    let delta = {lat:0, lng:0};
    delta.lat = x1.toRad();
    delta.lng = x2.toRad();

    let a = Math.sin(delta.lat / 2) * Math.sin(delta.lat / 2) +
        Math.cos(coords1.lat.toRad()) * Math.cos(coords2.lat.toRad()) *
        Math.sin(delta.lng / 2) * Math.sin(delta.lng / 2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
}


window.addEventListener("deviceorientationabsolute", listenerSwitch);

window.addEventListener("deviceorientation", deviceOrientationChange);

function listenerSwitch(){
	window.removeEventListener("deviceorientationabsolute", listenerSwitch);
	window.removeEventListener("deviceorientation", deviceOrientationChange);
	$("#compass").addClass("isAbsoluteEvent");
    waitForFix = false;
    relativeAdjust = 0;
	window.addEventListener("deviceorientationabsolute", deviceOrientationChange);
}

let debounce = false;

function absBearing(coords1, coords2) {
	let delta = {lat:0, lng:0};
    delta.lng = (coords2.lng - coords1.lng);
    let y = Math.sin(delta.lng) * Math.cos(coords2.lat);
    let x = Math.cos(coords1.lat)*Math.sin(coords2.lat) - Math.sin(coords1.lat)*Math.cos(coords2.lat)*Math.cos(delta.lng);
    let bearing = Math.atan2(y, x).toDeg();
    return (bearing + 360) % 360;
}

function deviceOrientationChange(e){
	if (debounce)
	{
		return;
	}

	debounce = true;

    let adjust = 0;

	setTimeout(function(){debounce = false;}, 60);

    let alpha = e.alpha;
    let beta = e.beta;
    let gamma = e.gamma;

    let orientation = screen.msOrientation || (screen.orientation || screen.mozOrientation || {}).type;

    let landscape = screen.width > screen.height;

    if (waitForFix && !e.absolute && !jQuery("#compass").hasClass("isrelative"))
    {
        jQuery("#compass").addClass("isrelative");
    } else if (jQuery("#compass").hasClass("isrelative") && !waitForFix) {
        jQuery("#compass").removeClass("isrelative");
        if (!e.absolute)
        {
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
    //jQuery("#place-info").html(`${alpha} ${adjust} ${relativeAdjust}`);
    currentPos.deg = alpha + adjust + relativeAdjust;

	if (gamma>0){
		currentPos.deg += 180;		
	}

	while (currentPos.deg < 0)
	{
		currentPos.deg += 360;
    } 
    
    if (currentPos.deg > 360){
        currentPos.deg = currentPos.deg%360;
    }

	cp.setAngle(360 - currentPos.deg);
}