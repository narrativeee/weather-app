const input = document.querySelector('#cityName');
const button = document.querySelector('#searchBtn');
const resultDiv = document.querySelector('#result');
const recentDiv = document.querySelector('#recentRequests');

// 1. Инициализация: загружаем историю при старте
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
renderRecentCities();

button.addEventListener('click', () => {
    const cityName = input.value.trim();
    if(cityName) {
        getCityCoordinates(cityName);
    }
});

input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        button.click();
    }
});

// Функция для сохранения города в историю
function saveToHistory(name) {
    // Убираем дубликаты: если город уже есть, удаляем его из старой позиции
    recentCities = recentCities.filter(city => city.toLowerCase() !== name.toLowerCase());
    
    // Добавляем в начало
    recentCities.unshift(name);
    
    // Оставляем только 3 последних
    if (recentCities.length > 3) {
        recentCities.pop();
    }
    
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    renderRecentCities();
}

// Функция для отрисовки кнопок истории
function renderRecentCities() {
    recentDiv.innerHTML = ''; // Очищаем панель
    recentCities.forEach(city => {
        const btn = document.createElement('button');
        btn.classList.add('recent-city-btn');
        btn.textContent = city;
        btn.onclick = () => {
            input.value = city;
            getCityCoordinates(city);
        };
        recentDiv.appendChild(btn);
    });
}

async function getCityCoordinates(cityName) {
    resultDiv.innerHTML = '<p class="details">ПОИСК...</p>';
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=ru&format=json`;

    try {
        const response = await fetch(geoUrl);
        const data = await response.json();

        if(!data.results) {
            resultDiv.innerHTML = '<p class="details">ГОРОД НЕ НАЙДЕН</p>';
            return;
        }

        const {latitude, longitude, name} = data.results[0];
        
        // ВАЖНО: сохраняем в историю только если поиск успешен
        saveToHistory(name); 
        
        getWeather(latitude, longitude, name);
    } catch (error) {
        resultDiv.innerHTML = '<p class="details">ОШИБКА СЕРВИСА</p>';
    }
}

async function getWeather(lat, lon, name) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const temp = Math.round(data.current_weather.temperature);
        const weatherCode = data.current_weather.weathercode;
        const windSpeedMs = Math.round(data.current_weather.windspeed / 3.6 * 10) / 10;

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

        resultDiv.innerHTML = `
            <h3>${name}</h3>
            <div class="temp-display">${temp}°</div>
            <p class="weather-text">${weatherText}</p>
            <div class="details">
                <p>ВЕТЕР ${windSpeedMs} М/С</p>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = '<p class="details">ОШИБКА ПОЛУЧЕНИЯ ДАННЫХ</p>';
    } finally {
        input.value = '';
    }
}