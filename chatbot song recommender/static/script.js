
// '03350b88af18053faef0ae657b901475';

// ============================
// Weather API Configuration
// ============================
const apiKey = '03350b88af18053faef0ae657b901475';
const defaultCity = 'Kolkata';
const weatherUrl = city => 
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

// Fetch and Display Weather
function getWeather(city = defaultCity) {
    fetch(weatherUrl(city))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const temp = Math.round(data.main.temp);
            const icon = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
            
            document.getElementById('weather-temp').textContent = `${temp}°C`;
            document.getElementById('weather-icon').src = iconUrl;
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            document.getElementById('weather-temp').textContent = 'N/A';
            document.getElementById('weather-icon').src = '';
        });
}

// Detect Location and Fetch Weather
function detectLocationAndWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const locationUrl = 
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
                
                fetch(locationUrl)
                    .then(response => response.json())
                    .then(data => {
                        const city = data.name;
                        getWeather(city);
                    })
                    .catch(error => {
                        console.error('Error detecting location:', error);
                        getWeather(); // Fallback to default city
                    });
            },
            () => {
                getWeather(); // Fallback to default city if location access denied
            }
        );
    } else {
        getWeather(); // Fallback to default city if geolocation is not supported
    }
}

// Initialize Weather
detectLocationAndWeather();

// ============================
// Spotify Song Recommendation
// ============================

// Artist-Based Recommendations
document.getElementById('artist-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const artist = document.getElementById('artist-name').value;
    
    fetch('/recommendations/artist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ artist: artist })
    })
    .then(response => response.json())
    .then(data => {
        const recommendationsDiv = document.getElementById('recommendations');
        recommendationsDiv.innerHTML = '';
        
        data.songs.forEach(song => {
            const songElement = document.createElement('div');
            songElement.classList.add('song');
            songElement.innerHTML = `
                <img src="${song.image}" alt="${song.name}">
                <a href="${song.url}" target="_blank">${song.name} - ${song.artist}</a>
            `;
            recommendationsDiv.appendChild(songElement);
        });
    })
    .catch(error => console.error('Error fetching artist recommendations:', error));
});

// Mood-Based Recommendations
document.querySelectorAll('.mood-button').forEach(button => {
    button.addEventListener('click', function() {
        const mood = this.getAttribute('data-mood');
        
        fetch(`/recommendations/mood?mood=${mood}`)
            .then(response => response.json())
            .then(data => {
                const recommendationsDiv = document.getElementById('recommendations');
                recommendationsDiv.innerHTML = '';
                
                data.songs.forEach(song => {
                    const songElement = document.createElement('div');
                    songElement.classList.add('song');
                    songElement.innerHTML = `
                        <img src="${song.image}" alt="${song.name}">
                        <a href="${song.url}" target="_blank">${song.name} - ${song.artist}</a>
                    `;
                    recommendationsDiv.appendChild(songElement);
                });
            })
            .catch(error => console.error('Error fetching mood recommendations:', error));
    });
});

// ============================
// Theme Toggle
// ============================
const themeSwitch = document.getElementById('theme-switch');
const body = document.body;

// Check for saved theme in Local Storage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    themeSwitch.checked = true;
} else {
    body.classList.remove('light-mode');
}

// Toggle Theme
themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    }
});
