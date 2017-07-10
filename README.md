# purpose
For the challenge of freeCodeCamp's ["Show the Local Weather"](https://www.freecodecamp.com/challenges/show-the-local-weather), and for fun of playing with something cool.

# build by

## Dark Sky API 

* [Dark Sky API](https://darksky.net/dev/) is pretty good, though it needs to register before using it.
* use [CORS Anywhere](https://github.com/Rob--W/cors-anywhere/) for avoiding the CORS problem, but thought there must be a better way.
* Hourly forecast is too detailed when I tried to show the information of next 24 hours later, so I hide the not-so-different-weather hour. Think it will be easier to understand. 

## Google Maps API

* pick up the [JavaScript API](https://developers.google.com/maps/documentation/javascript/tutorial) for showing a interactive map of user's location.  
* pick up the [Geocoding API](https://developers.google.com/maps/documentation/geocoding/) for showing the name of user's location. But there's a CORS problem when I trying to use Google API key to restrict the usage of this API, cause it was trigger by the client side. Luckly, Geocoding API can use without key, so the solution is still in the air. 

## ipinfo.io

* [ipinfo.io](http://ipinfo.io/developers) is great for lookup user's IP, and get a approximate location.
* use it as a alternative plan when Geolocation API fails.

## Bootstrap v4.0.0-alpha.6

* design a screen-center layout with mulitple component was not so easy, but I got through and have lots of fun with the [Flexbox](https://v4-alpha.getbootstrap.com/utilities/flexbox/) feature.
* [Popovers](https://v4-alpha.getbootstrap.com/components/popovers/) is lovely, but I met trouble when trying to inject a Google Map into it. So I trigger the Google Maps API after the Popover shown, and patch a function to make the Popover disapear when click outside the Popover. 

## Skycons & Weather Icons v2.0.9 & Font Awesome v4.7.0

* [Skycons](https://darkskyapp.github.io/skycons/) can pair perfectly with Dark Sky's forecast icon, and kinda cute.
* [Weather Icons](https://erikflowers.github.io/weather-icons/) has bunch of useful symbol for weather, it's a pity that it's no longer maintained.  
* [Font Awesome](http://fontawesome.io) is awesome, it benefit me this time for making a full screen loader without doing much css trick.

## Google Fonts

* [Bubbler One](https://fonts.google.com/specimen/Bubbler+One) is thin, concise,and not so formal. So that being a Flat-Design I can try . 
* tried to find a Chinese Web Font to pair with, but so hard to get one.

## uiGradients

* use [uiGradients](https://uigradients.com/) to pick up a calm background. 
* it's enjoyable when browsing the their website, so colorful and inspiring. 

## Toggle Switch

* Switching between Fahrenheit and Celsius is needed, but found no style-I-like component in HTML 5 and Bootstrap 4.
* Found [Toggle Switch](https://www.w3schools.com/howto/howto_css_switch.asp) on w3schools, and customized it to fit my style. Now it looks so unique.

## GitHub Gist

* export this CodePen to my GitHub Gist for another way of code demonstration.