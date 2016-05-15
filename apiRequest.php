<?php
	include("keys.php");
	header('Content-Type: application/json');
	$service = $_GET['service'];
	$latlong = $_GET['latlong'];
	$locality = encodeURIComponent($_GET['locality']);
	$region = encodeURIComponent($_GET['region']);
	$country = $_GET['country'];
	$destinations = $_GET['destinations'];
	$origins = $_GET['origins'];
	$breweryId = $_GET['breweryId'];

	if($service == 'gmap') {
		if (!$latlong) { #if there is no lat or long info
			echo 'sorry, no latlong';
			return;
		} else {
			$fullUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' . $latlong . '&key=' . $mapsKey;
		}		
	} else if($service == 'distance') {
		$fullUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' . $origins . '&destinations=' . $destinations . '&key=' . $mapsKey;
	} else if($service == 'beers') {
		$fullUrl = 'http://api.brewerydb.com/v2/brewery/' . $breweryId . '/beers?key=' . $breweryKey;
	} else {
		if(!$locality || !$region || !$country) {#if one of the location pieces of data is missing
			echo 'no locality or region or country';
			return;
		} else {
			$fullUrl = 'http://api.brewerydb.com/v2/locations?isClosed=N&locality=' . $locality . '&region=' . $region . '&countryIsoCode=' . $country . '&key=' . $breweryKey;
		}		
	}	
	
	$JSON = file_get_contents($fullUrl);
	echo $JSON;

	function encodeURIComponent($str) {
	    $revert = array('%21'=>'!', '%2A'=>'*', '%27'=>"'", '%28'=>'(', '%29'=>')');
	    return strtr(rawurlencode($str), $revert);
	}
?>