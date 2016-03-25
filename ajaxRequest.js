$(document).ready( function() {
    //php file that does api requests to avoid XSS
    var url = 'apiRequest.php',
	dataString = '';

	$.ajax({ 
        'url': url,
        'dataType': "json"
    }).done(function(data) {
    	var records = data.data,
        current;
        console.log(data);
    	for(var record in records) {
            current = records[record];
    		dataString += '<div>' + current.brewery.name + '</div>'
    	}
    	$('#localBreweries').html(dataString);
    })
});