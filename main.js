function appel_position(position)
{
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var meteo = new XMLHttpRequest();
    //      bigdatacloud : api for geolocation
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`) // api pour afficher la ville
    .then(response => response.json())
    .then(data =>{
        console.log("data: ",data);
        const ville = data.locality;
        const codePays = data.countryCode;
        document.getElementById("ville").innerText = ville;
        document.getElementById("codePays").innerText = codePays;
        console.log("ville : ", ville);
    })
    //      open-meteo : api for meteo
    meteo.open('get','https://api.open-meteo.com/v1/forecast?latitude='+latitude+'&longitude='+longitude+'&current=temperature_2m,relative_humidity_2m,wind_gusts_10m,apparent_temperature,is_day,precipitation,cloud_cover&hourly=temperature_2m,is_day,precipitation_probability,precipitation,cloud_cover,is_day&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,precipitation_hours');
    meteo.onload = function()
    {
        var data = JSON.parse(meteo.response);
        console.log(latitude);
        console.log(longitude);
        console.log(data);

        //     current DATA

        const currentCloudCover = data.current.cloud_cover;
        const currentIsDay = data.current.is_day == 1;
        let classIcone = "";
        if(currentCloudCover < 20)  classIcone = currentIsDay ? "fa-solid fa-sun jaune_icone" : "fa-solid fa-moon bleu_icone";
        else if (currentCloudCover >= 20 && currentCloudCover < 60)     classIcone = currentIsDay ? "fa-solid fa-cloud-sun jaune_icone" : "fa-solid fa-cloud-moon bleu_icone";
        else classIcone = currentIsDay ? "fa-solid fa-cloud jaune_icone" : "fa-solid fa-cloud bleu_icone";

        document.getElementById("current_is_day").className = classIcone; // current is_cloudy and is_day
               
        document.getElementById("degre").innerHTML = data.current.apparent_temperature+"°"; // current temperature

        var degre = data.current.apparent_temperature;
        var wind_gust = data.current.wind_gusts_10m;
        var time = data.current.time.slice(-5);

        console.log(degre);
        console.log(wind_gust);
        console.log(time);

        document.getElementById("temperature_vent").innerText = degre+"° / "+wind_gust;
        document.getElementById("temperature_temps").innerText = " Feels like "+degre+"° "+" Tod, "+time;

        //     hourly DATA

        for(i=0;i<24;i++)
        {
            document.getElementById("time"+i).innerHTML = data.hourly.time[i].slice(-5); // hourly time

            let cloudCover = data.hourly.cloud_cover[i];
            let is_day_hourly = data.hourly.is_day[i];
            let classIcone = "";
            let rainPrecipitation = data.hourly.precipitation_probability[i];
            if(cloudCover < 20)     classIcone = is_day_hourly ? "fa-solid fa-sun jaune_icone icone_left" : "fa-solid fa-moon bleu_icone icone_left";
            else if(cloudCover >= 20 && cloudCover < 60)    classIcone = is_day_hourly ? "fa-solid fa-cloud-sun jaune_icone icone_left" : "fa-solid fa-cloud-moon bleu_icone icone_left";
            else if(cloudCover >= 60 && cloudCover <= 100 && rainPrecipitation < 20)    classIcone = is_day_hourly ? "fa-solid fa-cloud jaune_icone icone_left" : "fa-solid fa-cloud bleu_icone icone_left";
            else if(cloudCover >= 60 && cloudCover <= 100 && rainPrecipitation >= 20 && rainPrecipitation < 60)     classIcone = is_day_hourly ? "fa-solid fa-cloud-sun-rain jaune_icone icone_left" : "fa-solid fa-cloud-moon-rain bleu_icone icone_left";
            else if(cloudCover >= 60 && cloudCover <= 100 && rainPrecipitation >= 60 && rainPrecipitation <= 100)    classIcone = is_day_hourly ? "fa-solid fa-cloud-showers-heavy jaune_icone icone_left" : "fa-solid fa-cloud-showers-heavy bleu_icone icone_left";

            document.getElementById("is_day_section"+i).className = classIcone; // is cloudy and is day

            document.getElementById("temperature_section"+i).innerHTML = data.hourly.temperature_2m[i]+"°"; // hourly temperature
            document.getElementById("pluie_percent_section"+i).innerHTML = rainPrecipitation+"%"; // hourly rain precipitation
        }

        //     weekdays DATA since the current day

        const joursDeSemaine = [];
        const dates = data.daily.time;

        dates.forEach(date => {
            const dayOfWeek = new Date(date).toLocaleString('en-EN', { weekday: 'long' });
            joursDeSemaine.push(dayOfWeek);
        });

        console.log("jour de semaine : ", joursDeSemaine);

        //     daily DATA

        // get DATA for the current day
        document.getElementById("joursDeSemaine0").innerHTML = "Today";
        document.getElementById("%_jour0").innerHTML = data.daily.precipitation_sum[0]+"%";
        document.getElementById("temperature_max0").innerHTML = data.daily.temperature_2m_max[0]+"°";
        document.getElementById("temperature_min0").innerHTML = data.daily.temperature_2m_min[0]+"°";
        // get DATA for the rest of the days
        for(i=1;i<7;i++)
        {
            document.getElementById("joursDeSemaine"+i).innerHTML = joursDeSemaine[i]; // days of the week

            document.getElementById("%_jour"+i).innerHTML = data.daily.precipitation_sum[i]+"%"; // daily rain precipitation
            document.getElementById("temperature_max"+i).innerHTML = data.daily.temperature_2m_max[i]+"°"; // daily min precipitation
            document.getElementById("temperature_min"+i).innerHTML = data.daily.temperature_2m_min[i]+"°"; // daily max temperature
        }

        document.getElementById("time_sunrise").innerHTML = data.daily.sunrise[0].slice(11, -3)+" : "+data.daily.sunrise[0].slice(-2); // current sunrise
        document.getElementById("time_sunset").innerHTML = data.daily.sunset[0].slice(11, -3)+" : "+data.daily.sunrise[0].slice(-2); // current sunset
    }
    meteo.onerror = function()
    {
        console.log("l'operation a echoué");
    }
    meteo.send();
}
navigator.geolocation.getCurrentPosition(appel_position);