<?php
	include 'keys.php';
	header('Content-Type: application/json');
	$fullUrl = 'http://api.brewerydb.com/v2/locations?locality=Alexandria&region=Virginia&countryIsoCode=us&key='
				. $apiKey;
	
	$JSON = file_get_contents($fullUrl);
	echo $JSON;
?>