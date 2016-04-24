# BreweryDB-API

Testing out the [BreweryDB API](http://www.brewerydb.com/developers)
Example working API url for all breweries in Alexandria, VA: http://api.brewerydb.com/v2/locations?locality=Alexandria&region=Virginia&countryIsoCode=us&key=YOUR_KEY

You just need to add a keys.php file with the following:

<?php
	$breweryKey = 'YOUR_BREWERYDB_KEY;
	$mapsKey = 'YOUR_GOOGLE_API_KEY';
?>