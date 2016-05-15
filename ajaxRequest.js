$(document).ready( function() {
    //attempt to fix iOS clicking
    $("#geolocation, #addressLocation").css('cursor','pointer');

    //kick off geolocation process
    function nearMe() {
        getGeoLocation();
        showElement($("#spinner"));
        hideElement($("#addressForm"));
    }

    //launch beer search on load
    nearMe();

    //near me button
    $('#geolocation').click(function(event) {
        nearMe();
    });

    //show form
    $('#addressLocation').on('click', function(event) {
        $("#addressForm").toggle();
    });
    
    //Near an address button
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
    //console.log(position);
    var lat = position.coords.latitude,
        long = position.coords.longitude;
    getAddressFromLatLong(lat,long).then(getBreweryFromAddress);
}

//get all the info brewerydb needs from gmaps
function getAddressFromLatLong(lat,long) {
    //php file that does api requests to avoid XSS
    var url = `apiRequest.php?latlong=${lat},${long}&service=gmap`;
    
    return $.ajax({ 
        'url': url
    });
}

function getBreweryFromAddress(addressInfo) {
    var address, locality, region, country, originLatLong;
    //console.log(addressInfo);
    if(addressInfo.status === "OK") {
        address = addressInfo.results[0].address_components;
        locality = address[3].short_name;
        region = address[4].long_name;
        country = address[5].short_name;
        originLatLong = addressInfo.results[0].geometry.location.lat + ',' +  addressInfo.results[0].geometry.location.lng;
    } else {
        locality = addressInfo.locality;
        region = addressInfo.state;
        country = addressInfo.country;
        originLatLong = {
            locality, region, country
        }
    }
    locality = encodeURIComponent(locality);
    region = encodeURIComponent(region);

    var url = `apiRequest.php?locality=${locality}&region=${region}&country=${country}`;
    //console.log(url);
    $.ajax({ 
        'url': url
    }).done(function(data) {
        drawTable(data.data, originLatLong);
    });
}

function drawTable(data,origin) {
     $("#localBreweries").empty();
     var destination = '',
        current,
        latlong,
        ids = [];
    for (var i = 0; i < data.length; i++) {
        current = data[i];
        destination += current.latitude + ',' + current.longitude + '|';
        ids.push(current.breweryId);
        showBreweries(current);
    }
    $('button.see-beers').bind('click', getbeers);
    getDistance(origin,destination,ids);
}

function showBreweries(b) {
    // console.log(b);
    //deal with undefined stuff
    var brewery = {
            name: b.brewery.name,
            id: b.breweryId,
            site: "#no-website",
            icon: 'images/beer.png',
            address: 'no street address listed',
            href: '#'
        };
    if(b.website) { brewery.site = b.website;}
    if(b.brewery.images) { brewery.icon = b.brewery.images.icon; }
    if(b.streetAddress) { brewery.address = b.streetAddress, brewery.href = 'http://maps.google.com/?daddr=' + b.streetAddress; }
    
    //create divs and add data to them
    var panelDiv = $("<div class='media panel panel-default'/>");
    $("#localBreweries").append(panelDiv);

    var panelDivHeading = $(`<div id='${brewery.id}' class='panel-heading'><a href='${brewery.site}'>${brewery.name}</a></div>`),
        panelDivBody = $(`
            <div class='panel-body'>
                <a href='${brewery.href}'>${brewery.address}</a>
                <button data-brewery="${brewery.id}" class="btn btn-default pull-right see-beers">See Beers</button>
                <ul class="beer-list"></ul>
            </div>`),
        image = $(`<img height='50px' src='${brewery.icon}' />`);

    panelDiv.append(panelDivHeading, [panelDivBody]);
    panelDivBody.prepend(image);
}

function getDistance(o,d,ids) { //origin lat & long, destination lat & long
    // console.log(o,d,ids);
    var url = `apiRequest.php?service=distance&origins=${o}&destinations=${d}`,
        currentItem,
        span;
    $.ajax({ 
        'url': url
    }).done(function(data) {
        var distances = data.rows[0].elements;

        for(var a=0; a<distances.length; a++) {
            currentItem = distances[a].distance;
            span = $('<span class="distance pull-right"/>');
            span.append(currentItem.text)
                .data("sort", currentItem.value);
            $('#' + ids[a]).append(span);
        }
        sortDistances();
    });
}

function sortDistances() {
    var $breweries = $("#localBreweries"),
        $breweryDiv = $breweries.children('div.panel-default');
    $breweryDiv.sort(function(a,b) {
        var aVal = $(a).find('.distance').data('sort'),
            bVal = $(b).find('.distance').data('sort');

        if(aVal > bVal) {
            return 1;
        }
        if(aVal < bVal) { 
            return -1
        }

        return 0;
    });
    $breweryDiv.detach().appendTo($breweries);
    hideElement($("#spinner"));
}

function getbeers(e) {
    
    var $this = $(this),
        $beerList = $this.next();
        id = $this[0].getAttribute('data-brewery'),
        url = `apiRequest.php?breweryId=${id}&service=beers`;

    //clear out the list in case it already has data
    $beerList.empty();

    $.ajax({ 
        'url': url
    }).done(function(data) {
        if(data.message == 'Request Successful') {
            var beers = data.data,
            current;
            for(var i=0; i<beers.length; i++) {
                current = beers[i];
                $beerList.append(
                    $(`
                    <li>
                        ${current.nameDisplay}
                    </li>
                    `)
                )
            }
        } else {
            console.log('whoops');
        }
    });
}