$(document).ready( function() {
    getGeoLocation();
    
    //default ajax setup
    $.ajaxSetup({
      dataType: "json"
    });
});

//use browser built in geolocation
function getGeoLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        return'no geo';
    }
}

//get the lat/long from geolocation
function showPosition(position) {
    let lat = position.coords.latitude,
        long = position.coords.longitude;
    getAddressFromLatLong(lat,long).then(getBreweryFromAddress);
}

//get all the info brewerydb needs from gmaps
function getAddressFromLatLong(lat,long) {
    //php file that does api requests to avoid XSS
    let url = `apiRequest.php?latlong=${lat},${long}&service=gmap`;
    console.log(url);
    return $.ajax({ 
        'url': url
    });
}

function getBreweryFromAddress(addressInfo) {
    if(addressInfo.status === "OK") {
            var address = addressInfo.results[0].address_components,
                locality = address[3].short_name,
                region = address[4].long_name,
                country = address[5].short_name;
                console.log(locality,region,country);
        }
    let url = `apiRequest.php?locality=${locality}&region=${region}&country=${country}`,
        dataString = '';
    console.log(url);
    $.ajax({ 
        'url': url
    }).done(function(data) {
        let records = data.data,
            current;
        for(let record in records) {
            current = records[record];
            dataString += '<div>' + current.brewery.name + '</div>'
        }
        $('#localBreweries').html(dataString);
    });
}