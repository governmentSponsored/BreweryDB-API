# BreweryDB-API

Using browser geolocation, [BreweryDB API](http://www.brewerydb.com/developers), [Google Map API](https://www.google.com/work/mapsearth/products/mapsapi.html), and [Google Maps Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/) we get all breweries in your location sorted by distance and then pull in the beers at each individual brewery.

#Working Copy
Just go to https://stanleysmith.net/BreweryDB-API/index.html to see it in action.

# Instructions

You just need to add a **keys.php** file with the following:

```php
<?php
	$breweryKey = 'YOUR_BREWERYDB_KEY';
	$mapsKey = 'YOUR_GOOGLE_API_KEY';
?>
```
