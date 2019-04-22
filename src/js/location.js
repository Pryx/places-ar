/**
 * The location class encapsulates all the needed identifiers for PlacesAR purposes
 */
export class Location{
    /**
     * Constructor sets the default values of member variables.
     */
    constructor(){
        this.name = "";
        this.latitude = NaN;
        this.longtitude = NaN;
        this.elevation = 0;
        this.elevationAccuracy = Infinity;
        this.accuracy = Infinity;
        this.bearing = 0;
    }
}