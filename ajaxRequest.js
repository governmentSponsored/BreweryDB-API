$(document).ready( function() {
    $("#geolocation, #addressLocation").css('cursor','pointer');

    //kick off geolocation process
    $('#geolocation').click(function(event) {
        getGeoLocation();
        showElement($("#spinner"));
        hideElement($("#addressForm"));
    });

    //show form
    $('#addressLocation').on('click', function(event) {
        $("#addressForm").toggle();
    });
    
    $('#addressSubmit').click(function (event) {
        var locality = $("#city").val();
        var state = $("#state option:selected").text();
        var addressObj = {
            status: "yum",
            locality,
            state,
            country: "us"
        };
        console.log(addressObj);
        getBreweryFromAddress(addressObj);
        showElement($("#spinner"));
        hideElement($("#addressForm"));
    });

    //default ajax setup
    $.ajaxSetup({
      dataType: "json"
    });
});

function showElement(elem) {
    elem.show();
}

function hideElement(elem) {
    elem.hide();
}

//use browser built in geolocation
function getGeoLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        return'Guess you gotta enter an address, bummer.';
    }
}

//get the lat/long from geolocation
function showPosition(position) {
    var lat = position.coords.latitude,
        long = position.coords.longitude;
    getAddressFromLatLong(lat,long).then(getBreweryFromAddress);
}

//get all the info brewerydb needs from gmaps
function getAddressFromLatLong(lat,long) {
    //php file that does api requests to avoid XSS
    var url = `apiRequest.php?latlong=${lat},${long}&service=gmap`;
    console.log(url);
    return $.ajax({ 
        'url': url
    });
}

function getBreweryFromAddress(addressInfo) {
    var address, locality, region, country;
    if(addressInfo.status === "OK") {
            address = addressInfo.results[0].address_components;
            locality = address[3].short_name;
            region = address[4].long_name;
            country = address[5].short_name;
            console.log(locality,region,country);
    } else {
        locality = addressInfo.locality;
        region = addressInfo.state;
        country = addressInfo.country;
    }
    locality = encodeURIComponent(locality);
    region = encodeURIComponent(region);

    var url = `apiRequest.php?locality=${locality}&region=${region}&country=${country}`;
    console.log(url);
    $.ajax({ 
        'url': url
    }).done(function(data) {
        drawTable(data.data);
    });
}

function drawTable(data) {
     $("#localBreweries").empty();
    for (var i = 0; i < data.length; i++) {
        showBreweries(data[i]);
    }
    hideElement($("#spinner"));
}

function showBreweries(b) {
    console.log(b);
    //deal with undefined stuff (hopefully)
    var brewery = {
            name: b.brewery.name,
            site: "http://www.getsomebeer.com",
            icon: 'images/beer.png'
        };
    if(b.website) { brewery.site = b.website;}
    if(b.brewery.images) {brewery.icon = b.brewery.images.icon;}
    
    var panelDiv = $("<div class='media panel panel-default'/>");
    $("#localBreweries").append(panelDiv);

    var panelDivHeading = $(`<div class='panel-heading'><a href='${brewery.site}'>${brewery.name}</a></div>`),
        panelDivBody = $(`<div class='panel-body'></div>`),
        image = $(`<img height='50px' src='${brewery.icon}' />`);

    panelDiv.append(panelDivHeading, [panelDivBody]);
    panelDivBody.append(image);
}

function getDistance(origin,destination) {
    var url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=AIzaSyBEe0yXQqhIi3w805Bb-l9oV-_vfgLz8PQ`
}