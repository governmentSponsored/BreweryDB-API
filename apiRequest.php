<?php
	include("keys.php");
	header('Content-Type: application/json');
	$service = $_GET['service'];
	$latlong = $_GET['latlong'];
	$locality = $_GET['locality'];
	$region = $_GET['region'];
	$country = $_GET['country'];
	
	if($service == 'gmap') {
		if (!$latlong) { #if there is no lat or long info
			echo 'sorry, no latlong';
			return;
		} else {
			$fullUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' . $latlong . '&key=' . $mapsKey;
		}		
	} else {
		if(!$locality || !$region || !$country) {#if one of the location pieces of data is missing
			echo 'no locality or region or country';
			return;
		} else {
			$fullUrl = 'http://api.brewerydb.com/v2/locations?locality=' . $locality . '&region=' . $region . '&countryIsoCode=' . $country . '&key=' . $breweryKey;
		}		
	}	
	
	$JSON = file_get_contents($fullUrl);
	echo $JSON;
?>