<?php
	include("keys.php");
	header('Content-Type: application/json');
	$service = $_GET['service'];
	$lat = $_GET['lat'];
	$lng = $_GET['lng'];
	$destinations = $_GET['destinations'];
	$origins = $_GET['origins'];
	$breweryId = $_GET['breweryId'];
	$beerName = $_GET['beerName'];

	if($service == 'distance') {
		$fullUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' . $origins . '&destinations=' . $destinations . '&key=' . $mapsKey;
	} else if($service == 'beers') {
		$fullUrl = 'http://api.brewerydb.com/v2/brewery/' . $breweryId . '/beers?key=' . $breweryKey;
	} else if($service == 'score') {
		$fullUrl = $serverScorePHPFileLocation . '?beer=' . $beerName;
	} else {
		if(!$lat || !$lng) {#if lat or long is missing
			echo 'no lat or long';
			return;
		} else {
			$fullUrl = 'http://api.brewerydb.com/v2/search/geo/point?radius=25&lat=' . $lat . '&lng=' . $lng . '&key=' . $breweryKey;
		}		
	}	
	
	$JSON = file_get_contents($fullUrl);
	echo $JSON;

	function encodeURIComponent($str) {
	    $revert = array('%21'=>'!', '%2A'=>'*', '%27'=>"'", '%28'=>'(', '%29'=>')');
	    return strtr(rawurlencode($str), $revert);
	}
?>