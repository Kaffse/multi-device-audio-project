// MDRS - JavaScript for Map
// Author - Gordon Adam
// Please Make sure to do debugging if changes are made

// Variables 
var myLatLng = new google.maps.LatLng(55.873657, -4.292474);
var map;
var mySound;
var syncSounds = [];


// Funuction to start map
function initialize() {
    
    // Sets the options on the map
    var mapOptions = {
	center: myLatLng,
	zoom: 3,
	mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    // Calls the div on the webpage and binds the map to that div
    map = new google.maps.Map(document.getElementById("map-content"), mapOptions);
    
    boundsTest();
}


// Loads the Map
google.maps.event.addDomListener(window, 'load', initialize);


// Test function to test the possibility of retrieving the bounds of the map
function boundsTest() {
    
    // adds a listener to the map that is activated when the bounds change
    google.maps.event.addListener(map, 'bounds_changed', function() {

	// fetches the bounds of the map at a specific time until they change again
	var bounds = map.getBounds();
	var swLat = bounds.getSouthWest().lat();
	var swLng = bounds.getSouthWest().lng();
	var neLat = bounds.getNorthEast().lat();
	var neLng = bounds.getNorthEast().lng();

	// attempts to get data from the backend
	$.get(
	    "/webapp/getdata:" + swLat + ":" + swLng + ":" + neLat + ":" + neLng,

	    function(data) {

		// map objects
		var infoWindow = new google.maps.InfoWindow();
		var pin;

		// json data variables
		var jsonArraySize = data.length;
		var recordings = eval("(" + data + ")");
		var lat = new Array();
		var lng = new Array();
		
		// individual file attributes
		var fileName;
		var description;
		var lngLat;
		var filePath;

		// iterator over each file
		for (var i=0; i<jsonArraySize; i++) {
		    
		    // sets the attributes of each file 
		    lat = recordings[i].fields.lat;
		    lng = recordings[i].fields.lon;
		    fileName = recordings[i].fields.file_name;
		    description = recordings[i].fields.description;
		    lngLat = new google.maps.LatLng(lat,lng);
		    filePath = recordings[i].fields.rec_file;
		    filePath = "../" + filePath;


		    // places a pin on the map at the lat and lng specified
		    pin = new google.maps.Marker({
			position: lngLat,
			icon: '/static/images/marker.png',
			map: map
		    });
		    

		    
		    // creates a listener for a click action on that pin
		    google.maps.event.addListener(pin, 'click', (function(pin, fileName, description, infoWindow, filePath, lat, lng) {
			return function() {

			    mySound = new buzz.sound(filePath);
			    // opens an info window with the title and description of that file
			    infoWindow.setContent('<div><h3>' + 
						  fileName + 
						  '</h3><p>' + 
						  description + 
						  '</p>' +
						  '<input id="play" type="button" value="Play" class="pure-button pure-button-primary" onclick="playAudio();"/>' +
						  '&nbsp' +
						  '<input id="pause" type="button" value="Pause" class="pure-button pure-button-primary" onclick="pauseAudio();" />' +
						  '&nbsp' +
						  '<input id="stop" type="button" value="Stop" class="pure-button pure-button-primary" onclick="stopAudio();" />' +
						  '</div>');
			    infoWindow.open(map, pin);
			    var route = drawRoute(lat, lng);
			     
			     
			}
		    })(pin, fileName, description, infoWindow, filePath, lat, lng));
		}
	    }
	    
	);
    });
    
}

function playAudio() {
    mySound.play()
	.bind( "timeupdate", function() {
	    var timer = buzz.toTimer( this.getTime() );
	    document.getElementById( "timer" ).innerHTML = timer;
	});
}

function pauseAudio() {
    mySound.pause();
}

function stopAudio() {
    mySound.stop();
}

function playSync(){
    mySound.play();
}

function drawRoute(lat, lng) {
    var latLngs = new Array();
    for(var j=0; j<1; j++) {
	latLngs[j] = new google.maps.LatLng(lat[j], lng[j]);
    }
    var route = new google.maps.Polyline({
	path: latLngs,
	geodesic: true,
	strokeColor: '#1F8DD6',
	strokeOpacity: 0.6,
	strokeWeight: 4
    })
    route.setMap(map);
    return route;
}

function deleteRoute(route) {
    route.setMap(null);
}
    
