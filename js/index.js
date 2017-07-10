// 取得位置，並啟用 Popover
$(document).ready(function() {
	getLocation();
	$('[data-toggle="popover"]').popover()
});

// 使用者當下經緯度 (預設在桃園)
var d4Pos = {
	lat : 24.9951273,
	lon : 121.3176767,
	name : "桃園市",
	place_id : "ChIJS8IjmPkeaDQRF67g2Ty3XiI"
}

/////////////////////////////////////////////////////////
// 資料結繫 //////////////////////////////////////////////
////////////////////////////////////////////////////////

// 取得裝置的地理位置
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			d4Pos.lat = position.coords.latitude;
			d4Pos.lon = position.coords.longitude;
			getDarkSkyApiData(d4Pos.lat, d4Pos.lon);
		}, getIPLocation);
	} else { 
		getIPLocation();
	}
}

// 由裝置IP來取得使用者的地理位置。採用 ipinfo.io 方案 (https://ipinfo.io/developers)
function getIPLocation() {
	var url = "https://ipinfo.io"
	$.getJSON(url, function(data) {
		var loc = data.loc.split(',');
		d4Pos.lat = parseFloat(loc[0]);
		d4Pos.lon = parseFloat(loc[1]);
	})
		.fail(function() {
		alert(" Do not know where you are... \n Instead, I'll show the weather of my favorite place.");
	})
		.always(function() {
		getDarkSkyApiData(d4Pos.lat, d4Pos.lon);
	});
}

// 顯示所在地名稱，採用 Google Maps Geocoding API 方案 (https://developers.google.com/maps/documentation/geocoding/)
// 目前此方法，等同於由客戶端載入，故無法進行 Google API 的金鑰限制；暫時取消使用金鑰控制。
function showCity(lat, lon) {
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon
	$.getJSON(url, function( data ) {
		if (data.status == "OK") {
			d4Pos.name = data.results[1].formatted_address;			
			d4Pos.place_id = data.results[1].place_id;
			$("#urPlace").html(d4Pos.name);
		} else {
			console.log(data);
		}
	})
		.fail(function( data ) {
		console.log("Geocoding API not OK");
	});
}

// 顯示地圖，採用 Google Maps JavaScript API 方案 (https://developers.google.com/maps/documentation/javascript/tutorial)
function showMap(lat, lon) {
	var uluru = {lat: lat, lng: lon};
	var map = new google.maps.Map(document.getElementById('urMap'), {
		zoom: 10, center: uluru
	});
	var marker = new google.maps.Marker({
		position: uluru, map: map
	});
}

// 取得天氣資訊，採用 Dark Sky API 方案 (https://darksky.net/dev/)
// 由客戶端讀取 API 會有 CORS 問題，所以暫時採用 CORS Anywhere 方案來介接 API (https://github.com/Rob--W/cors-anywhere/)，但仍會有金鑰泄漏的問題
function getDarkSkyApiData(lat, lon) {
	var avoidCORS = "https://cors-anywhere.herokuapp.com/"; 
	var apiURL = "https://api.darksky.net/forecast";
	var secretKey = "/ad50d1432876d180d315b159c4cab22d";
	var latlon = "/" + lat + "," + lon
	var paraExclude = "&exclude=minutely,alerts,flags"
	var url = avoidCORS + apiURL + secretKey + latlon + "?" + paraExclude;
	$.getJSON(url, function( data ) {
		showNowInfo( data );
		showTodayInfo( data );
		showNextFewHoursInfo( data );
		showNextFewDaysInfo( data );
		//console.log(JSON.stringify(data, null, "\t"));
	})
		.fail(function() {
		alert("I can not show you the weather from Dark Sky API... \nLost the connection with it.");
	});
};


// 顯示當下天氣資訊
function showNowInfo( data ) {
	// 氣象資訊
	setSkycon(data.currently.icon,"iconCurrent");
	$("#nowHumidity").html(getIconHtml("wi wi-humidity",data.currently.humidity*100,1));	
	$("#nowPrecipIntensity").html(getIconHtml("wi wi-umbrella",Math.round(data.currently.precipProbability*100)));
	$("#nowFahrenheit").html(Math.round(data.currently.temperature));
	$("#nowCelsius").html(F2C(data.currently.temperature));
	// 晝夜效果
	$(".container-fluid").addClass("night");
	if (data.currently.time > data.daily.data[0].sunriseTime && data.currently.time < data.daily.data[0].sunsetTime) {
		$(".container-fluid").removeClass("night");
		$(".container-fluid").addClass("day");
	}
	// 登台
	onStage(true);
}

// 顯示當日概況
function showTodayInfo( data ) {
	// 氣象資訊
	setSkycon(data.daily.data[0].icon,"iconToday");
	$("#todaySummary").html(data.daily.data[0].summary);
	$("#todayHumidity").html(getIconHtml("wi wi-humidity",data.daily.data[0].humidity*100,1));
	$("#todayPrecipIntensity").html(getIconHtml("wi wi-umbrella",Math.round(data.daily.data[0].precipProbability*100)));
	$("#todayFahrenheit").html(Math.round(data.daily.data[0].temperatureMin) + " ~ " + Math.round(data.daily.data[0].temperatureMax));
	$("#todayCelsius").html(F2C(data.daily.data[0].temperatureMin) + " ~ " + F2C(data.daily.data[0].temperatureMax));
	// 晝夜資訊
	var sunrise = to24Time(toDate(data.daily.data[0].sunriseTime));	
	var sunset = to24Time(toDate(data.daily.data[0].sunsetTime));	
	$("#todaySunTime").html(getIconHtml("wi wi-sunrise",sunrise,1) + " " + sunset);
}

// 顯示未來24小時內之氣象資訊，但氣象變化不大之時段，會選擇性地不顯示
function showNextFewHoursInfo( data ) {
	var howManyHours = 24
	var dataHourly = data.hourly.data;
	var lastInfo = {
		te: data.currently.temperature,
		pi: data.currently.precipProbability,
		ic: data.currently.icon
	}
	for (i = 1; i <= howManyHours; i ++) {
		if (i == 1 || i == howManyHours 
				|| Math.abs(F2C(lastInfo.te) - F2C(dataHourly[i].temperature)) > 1
				|| Math.abs(lastInfo.pi-dataHourly[i].precipProbability) > 0.09
				|| lastInfo.ic != dataHourly[i].icon) 
		{
			lastInfo.te = dataHourly[i].temperature;			
			lastInfo.pi = dataHourly[i].precipProbability;
			lastInfo.ic = dataHourly[i].icon;
			var hour = toDate(dataHourly[i].time).getHours();
			var html = "<div class='lead col-4 col-sm-3 col-md-2 col-lg-2 col-xl-1 pb-4'>" 
			+ "<div class='h2'>" + (hour%12 == 0 ? 12 : hour%12) + (hour>=12 ? 'PM' : 'AM') + "</div>"
			+ "<canvas id='iconHourly" + i +"' width='75%' height='75%'></canvas>"
			+ "<div>" + getIconHtml("wi wi-umbrella",Math.round(lastInfo.pi*100)) + "</div>" 
			+ "<div>"
			+ "<span class='h2 celsius'>" + F2C(lastInfo.te) + "</span>"
			+ "<span class='h2 fahrenheit' hidden>" + Math.round(lastInfo.te) + "</span>"
			+ "</div>"
			+ "</div>";
			$("#nextFewHours").append(html);
			setSkycon(lastInfo.ic,"iconHourly" + i);
		}
	}
}


// 顯示未來6天之氣象
function showNextFewDaysInfo( data ) {
	var howManyDays = 6
	$("#weekSummary").html(data.daily.summary);
	var dataDaily = data.daily.data;
	var inf = {
		tn: dataDaily[0].temperatureMin,
		tx: dataDaily[0].temperatureMax,
		pi: dataDaily[0].precipProbability,
		ic: dataDaily[0].icon
	}
	for (i = 1; i <= howManyDays; i ++) {
		inf.tn = dataDaily[i].temperatureMin;			
		inf.tx = dataDaily[i].temperatureMax;			
		inf.pi = dataDaily[i].precipProbability;
		inf.ic = dataDaily[i].icon;
		var days = toDate(dataDaily[i].time).getDate();
		var html = "<div class='lead col-4 col-sm-3 col-md-2 pb-4'>" 
		+ "<div class='h2'>" + days + toWeekDay(toDate(dataDaily[i].time)) + "</div>"
		+ "<canvas id='iconDaily" + i +"' width='100%' height='100%'></canvas>"
		+ "<div>" + getIconHtml("wi wi-umbrella",Math.round(inf.pi*100)) + "</div>"
		+ "<div>"
		+ "<span class='h2 celsius'>" + F2C(inf.tn) + "~" + F2C(inf.tx) + "</span>"
		+ "<span class='h2 fahrenheit' hidden>" + Math.round(inf.tn) + "~" + Math.round(inf.tx) + "</span>"
		+ "</div>"
		+ "</div>";
		$("#nextFewDays").append(html);
		setSkycon(inf.ic,"iconDaily" + i);
	}
}


/////////////////////////////////////////////////////////
// 人工觸發 //////////////////////////////////////////////
////////////////////////////////////////////////////////

// 點擊 Popover，並形成 map 所需 DOM 後，再載入地理資訊
$('[data-toggle="popover"]').on('shown.bs.popover', function () {
	showMap(d4Pos.lat, d4Pos.lon);
	showCity(d4Pos.lat, d4Pos.lon);
})

// 點擊 Popover 外部時，隱藏 Popover
$('body').on('click', function (e) {
	$('[data-toggle=popover]').each(function () {
		if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
			$(this).popover('hide');
		}
	});
});

// 切換華氏<->攝氏資訊
function switchFoC(checked) {
	if (checked) {
		$(".fahrenheit").removeAttr("hidden");	
		$(".celsius").attr("hidden","true");			
	} else {
		$(".celsius").removeAttr("hidden");	
		$(".fahrenheit").attr("hidden","true");	
	}
}


/////////////////////////////////////////////////////////
// 方便功能 //////////////////////////////////////////////
////////////////////////////////////////////////////////

// loader 登台效果
function onStage(tf) {
	document.getElementById("loader").style.display = "none";
	if (tf == true) {
		// 登場
		$("#nowInfo").removeAttr("hidden");
		$("#detailInfo").removeAttr("hidden");
	} else {
		// 銘謝惠顧
		$("#noData").removeAttr("hidden");
	}
}

// 將華氏度換算為攝氏
function F2C(degree) {
	return Math.round((degree - 32) * 5 / 9);
}

// 產生帶圖示的 html 詞塊
// 基礎圖示方案為 Font Awesome (http://fontawesome.io)
// 氣象圖示方案為 Weather Icons (https://erikflowers.github.io/weather-icons/)
function getIconHtml(icon,content,suffix) {
	var iconExplain = '';
	switch(icon) {
		case 'wi wi-humidity':
			iconExplain = 'Humidity(%)'
			break;
		case 'wi wi-umbrella':
			iconExplain = 'The probability of precipitation occurring (%)'
			break;
		case 'wi wi-sunrise':
			iconExplain = 'Sunrise & Sunset'
			break;
						 }
	var i = "<i class='fa-fw " + icon + "' data-toggle='tooltip' aria-label='" + iconExplain + "'  title='" + iconExplain + "'></i>"
	return (suffix == 1 ? content + " " + i : i + " " + content)
}

// 產生氣象動圖，方案為 Skycons (https://darkskyapp.github.io/skycons/)，並利用 RawGit 來載入其 GitHub 的 js 檔 (https://rawgithub.com)
function setSkycon(iconName,targetID) {
	var skycons = new Skycons({"color": "white"});
	skycons.set(targetID, iconName);
	skycons.play();
}

// 產生日期物件
function toDate( data ) {
	var d = new Date(data * 1000);
	return d
}

// 產出 24 小時制之時間字串
function to24Time( datetime ) {
	function addZero(i) {
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	}
	var h = addZero(datetime.getHours());
	var m = addZero(datetime.getMinutes());
	return h + ':' + m
}

// 產出星期標示
function toWeekDay( datetime ) {
	var weekday = new Array(7);
	weekday[0] = "SUN";
	weekday[1] = "MON";
	weekday[2] = "TUE";
	weekday[3] = "WEN";
	weekday[4] = "THU";
	weekday[5] = "FRI";
	weekday[6] = "SAT";
	return weekday[datetime.getDay()];
}