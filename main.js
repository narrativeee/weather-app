const input = document.querySelector('#cityName')
const button = document.querySelector('#searchBtn')
const resultDiv = document.querySelector('#result')

button.addEventListener('click', () => {
    const cityName = input.value.trim()
    if(cityName) {
        getCityCoordinates(cityName)
    }
})

input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        button.click();
    }
})

async function getCityCoordinates(cityName) {
    resultDiv.innerHTML = '<p class="details">ПОИСК...</p>'

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=ru&format=json`

    try {
        const response = await fetch(geoUrl)
        const data = await response.json()

        if(!data.results) {
            resultDiv.innerHTML = '<p class="details">ГОРОД НЕ НАЙДЕН</p>'
            return
        }

        const {latitude, longitude, name} = data.results[0]
        getWeather(latitude, longitude, name)
    } catch (error) {
        resultDiv.innerHTML = '<p class="details">ОШИБКА СЕРВИСА ГЕОКОДИРОВАНИЯ</p>'
    }
}

async function getWeather(lat, lon, name) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`

    try {
        const response = await fetch(url)
        const data = await response.json()
        
        const temp = Math.round(data.current_weather.temperature)
        const weatherCode = data.current_weather.weathercode
        const windSpeedMs = Math.round(data.current_weather.windspeed / 3.6 * 10) / 10

        let weatherText;
        switch(weatherCode) {
            case 0: weatherText = 'ЯСНО'; break;
            case 1: case 2: case 3: weatherText = 'ОБЛАЧНО'; break;
            case 45: case 48: weatherText = 'ТУМАН'; break;
            case 61: case 63: case 65: weatherText = 'ДОЖДЬ'; break;
            case 71: case 73: case 75: weatherText = 'СНЕГ'; break;
            case 95: weatherText = 'ГРОЗА'; break;
            default: weatherText = 'НЕИЗВЕСТНО';
        }

        // Обновленная верстка под минимализм
        resultDiv.innerHTML = `
            <h3>${name}</h3>
            <div class="temp-display">${temp}°</div>
            <p class="weather-text">${weatherText}</p>
            <div class="details">
                <p>ВЕТЕР ${windSpeedMs} М/С</p>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = '<p class="details">ОШИБКА ПОЛУЧЕНИЯ ДАННЫХ</p>'
    } finally {
        input.value = ''
    }
}