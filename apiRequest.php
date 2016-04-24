<?php
	include("keys.php");
	header('Content-Type: application/json');
	$service = $_GET['service'];
	if($service == 'gmap') {
		$latlong = $_GET['latlong'];
		$fullUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' . $latlong . '&key=' . $mapsKey;
	} else {
		$locality = $_GET['locality'];
		$region = $_GET['region'];
		$country = $_GET['country'];
		$fullUrl = 'http://api.brewerydb.com/v2/locations?locality=' . $locality . '&region=' . $region . '&countryIsoCode=' . $country . '&key=' . $breweryKey;
		#http://api.brewerydb.com/v2/locations?locality=Alexandria&region=Virginia&countryIsoCode=us&key=YOUR_KEY
	}
	
	
	$JSON = file_get_contents($fullUrl);
	echo $JSON;
?>