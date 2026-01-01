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
    resultDiv.innerHTML = 'Загрузка...'

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=ru&format=json`

    try {
        const response = await fetch(geoUrl)
        const data = await response.json()

        if(!data.results) {
            resultDiv.innerHTML = 'Город не найден. Попробуйте еще раз'
            return
        }

        const {latitude, longitude, name} = data.results[0]

        getWeather(latitude, longitude, name)
    } catch (error) {
        resultDiv.innerHTML = 'Ошибка при поиске города'
    }
}

async function getWeather(lat, lon, name) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`

    try {
        const response = await fetch(url)
        const data = await response.json()
        const temp = data.current_weather.temperature
        const weatherCode = data.current_weather.weathercode
        const windSpeed = data.current_weather.windspeed

        let weatherText

        switch(weatherCode) {
            case 0:
                weatherText = 'Ясно ☀️'
            break
            case 1:
            case 2:
            case 3:
                weatherText = 'Переменная облачность 🌤️'
            break
            case 45:
            case 48:
                weatherText = 'Туман 🌫️'
            break
            case 61:
            case 63:
            case 65:
                weatherText = 'Дождь 🌧️'
            break
            case 71:
            case 73:
            case 75:
                weatherText = 'Снег ❄️'
            break
            case 95:
                weatherText = 'Гроза ⛈️'
            break
            default:
                weatherText = 'Неизвестная погода'
        }

        console.log(data)

        resultDiv.innerHTML = `
        <h3>${name}</h3>
        <p style="font-size: 24px;">${temp}°C</p>
        <p>Скорость ветра: ${windSpeed} км/ч</p>
        <p>${weatherText}</p>
        `
    } catch (error) {
        resultDiv.innerHTML = 'Ошибка при получении погоды'
    } finally {
        input.value = ''
    }
}