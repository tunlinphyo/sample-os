import { getCSSVariable, getSchema } from "../../../utils/variable";

export function getStyles() {
    const color = {
        BLACK: getCSSVariable('--black'),
        WHITE: getCSSVariable('--white'),
    };

    const schema = getSchema();

    if (schema === 'light') {
        color.WHITE = getCSSVariable('--one-bit');
        color.BLACK = getCSSVariable('--zero-bit');
    } else if (schema === 'dark') {
        color.WHITE = getCSSVariable('--zero-bit');
        color.BLACK = getCSSVariable('--one-bit');
    }

    console.log(color, schema);

    return [
        {
            "elementType": "geometry",
            "stylers": [
                { "color": color.WHITE }
            ]
        },
        {
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off",
                    "icon": {
                        "url": '/public/marker.svg',
                        "scaledSize": new google.maps.Size(32, 32)
                    }
                }
            ]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [
                { "color": color.WHITE }
            ]
        },
        {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "administrative.country",
            "elementType": "labels.text.fill",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "administrative.land_parcel",
            "stylers": [
                { "visibility": "off" }
            ]
        },
        {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.stroke",
            "stylers": [
                { "color": color.WHITE }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "labels.text.fill",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                { "color": color.BLACK }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
                { "color": color.BLACK }
            ]
        }
    ]
}

const fullToAbbreviatedDays: { [key: string]: string } = {
    "Monday": "Mon",
    "Tuesday": "Tue",
    "Wednesday": "Wed",
    "Thursday": "Thu",
    "Friday": "Fri",
    "Saturday": "Sat",
    "Sunday": "Sun"
};

export function convertToAbbreviatedDay(day: string): string {
    return fullToAbbreviatedDays[day] || day;
}