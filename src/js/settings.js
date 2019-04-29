/**
 * This class manages settings and applying them. 
 */
export class Settings {
    /**
     * Constructor sets the default values of member variables.
     */
    constructor() {
        if (!window.localStorage.getItem("name")){
            window.localStorage.setItem('geoMaxAge', 1000);
        }
        window.localStorage.setItem('name', 'Places AR');
        console.log(window.localStorage.getItem("name"));
        
    }

    setMaximumAge(age){
        navigator.geolocation.clearWatch();
    }
}