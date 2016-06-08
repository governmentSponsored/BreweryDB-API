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
        getBreweryFromLatLong(addressObj);
        showElement($("#spinner"));
        hideElement($("#addressForm"));
    });

    //default ajax setup
    $.ajaxSetup({
      dataType: "json"
    });
    $(document).on('click','.showScore',function(){
        $this = $(this);
        $this.text('Loading...')
        var name = encodeURI($this[0].getAttribute('data-beerName'));
        console.log(name);
        //doing this one click at a time because I don't want to piss off Beer Advocate :X
        $.ajax({ 
            'url': 'apiRequest.php?service=score&beerName=' + name
        }).done(function(data) {
            var score = data[0];
            $this.next().text(score);
            $this.text('Done!');
            console.log(score);

        });
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
        return 'Guess you gotta enter an address, bummer.';
    }
}

//get the lat/long from geolocation
function showPosition(position) {
    console.log(position);
    var lat = position.coords.latitude,
        long = position.coords.longitude;
    getBreweryFromLatLong(lat,long);
}

function getBreweryFromLatLong(lat,lng) {
    // lat = 35.1495
    // lng = 90.0490
    var originLatLong = lat + ',' + lng,
        url = `apiRequest.php?lat=${lat}&lng=${lng}`;

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
        ids = [];
    if(typeof data == 'undefined') {
        $("#localBreweries").append('<p>Sorry, no breweries near you :/</p>');
        hideElement($("#spinner"));
    } else {
        for (var i = 0; i < data.length; i++) {
            current = data[i];
            destination += current.latitude + ',' + current.longitude + '|';
            ids.push(current.id);
            showBreweries(current);
        }
        $('button.see-beers').bind('click', getbeers);
        getDistance(origin,destination,ids);
    }
}

function showBreweries(b) {
    console.log(b);
    //deal with undefined stuff
    var brewery = {
            name: b.brewery.name,
            id: b.id,
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
                <a href='${brewery.href}'>${brewery.address}</a><br />
                <button data-brewery="${brewery.id}" class="btn btn-success see-beers">See Beers</button>
                <ul class="beer-list list-group"></ul>
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

    //show with ajax req and hide
    if($this.text() == 'Hide Beers') {
        $this.text('See Beers')
            .addClass('btn-success')
            .removeClass('btn-info btn-danger');
        $beerList.hide();
    } else {
        //hopefully people don't keep clicking
        $this.text('Please wait...')
            .addClass('btn-info')
            .removeClass('btn-success btn-danger');
        $beerList.show();
        //do ajax request
        $.ajax({ 
            'url': url
        }).done(function(data) {
            //make sure request went through and it has results
            if(data.message == 'Request Successful' && data.data) {
                var beers = data.data,
                current;
                for(var i=0; i<beers.length; i++) {
                    current = beers[i];
                    if(!current.abv) {current.abv = '???' }
                    $beerList.append(
                        $(`
                        <li class="list-group-item">
                            <p>${current.nameDisplay} (${current.style.shortName})</p>
                            <p>${current.abv} ABV</p>
                            <p>
                                <button data-beerName="${current.nameDisplay}" class="showScore btn btn-success">See Score</button>
                                <span class="score"></span>
                            </p>
                        </li>
                        `)
                    )
                }
            //show user that results aren't available
            } else {
                $beerList.append(
                        $(`
                        <li class="list-group-item">
                            No beers, sorry my thirsty friend :/
                        </li>
                        `)
                    )
            }
        });
        
        //after ajax is done, change button name
        $this.text('Hide Beers')
            .addClass('btn-danger')
            .removeClass('btn-info btn-success');
    }
}