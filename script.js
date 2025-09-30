// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.themeColor = document.getElementById('theme-color');
        this.htmlElement = document.documentElement;
        
        this.init();
    }
    
    init() {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Use system preference
            this.setThemeBasedOnSystemPreference();
        }
        
        // Add event listener for theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                this.setThemeBasedOnSystemPreference();
            }
        });
    }
    
    setThemeBasedOnSystemPreference() {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDarkMode ? 'dark' : 'light');
    }
    
    setTheme(theme) {
        // Remove both classes first
        this.htmlElement.classList.remove('light-mode', 'dark-mode');
        
        // Add the appropriate class
        if (theme === 'light') {
            this.htmlElement.classList.add('light-mode');
            this.themeIcon.textContent = '☀️';
            this.themeColor.content = '#e0e8ff';
        } else {
            this.htmlElement.classList.add('dark-mode');
            this.themeIcon.textContent = '🌙';
            this.themeColor.content = '#667eea';
        }
    }
    
    toggleTheme() {
        const currentTheme = this.htmlElement.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Add ripple effect to theme toggle button
        this.createRippleEffect(this.themeToggle);
    }
    
    createRippleEffect(element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size * 2}px;
            height: ${size * 2}px;
            left: ${-size / 2}px;
            top: ${-size / 2}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

// Particle System
class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        
        this.init();
        this.resize();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    init() {
        const particlesContainer = document.getElementById('particles');
        particlesContainer.appendChild(this.canvas);
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Regenerate particles with new dimensions
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Get current theme for particle color
        const isDarkMode = document.documentElement.classList.contains('dark-mode') || 
                          (!document.documentElement.classList.contains('light-mode') && 
                           window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        const particleColor = isDarkMode ? 'rgba(255, 255, 255, ' : 'rgba(0, 0, 0, ';
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `${particleColor}${particle.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Digital Clock Widget
class DigitalClock {
    constructor() {
        this.timezone = 'America/New_York'; // EST timezone
        this.init();
    }
    
    init() {
        this.updateTime();
        // Update every second
        setInterval(() => this.updateTime(), 1000);
    }
    
    updateTime() {
        const now = new Date();
        const timeOptions = {
            timeZone: this.timezone,
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        
        const dateOptions = {
            timeZone: this.timezone,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const timeString = now.toLocaleTimeString('en-US', timeOptions);
        const dateString = now.toLocaleDateString('en-US', dateOptions);
        
        // Split time and AM/PM
        const [time, ampm] = timeString.split(' ');
        
        // Update time display
        const timeEl = document.getElementById('currentTime');
        const ampmEl = document.getElementById('ampm');
        const dateEl = document.getElementById('currentDate');
        const dayEl = document.getElementById('currentDay');
        
        if (timeEl) timeEl.textContent = time;
        if (ampmEl) ampmEl.textContent = ampm;
        if (dateEl) dateEl.textContent = dateString.split(',')[0] + ', ' + dateString.split(',')[2];
        if (dayEl) dayEl.textContent = dateString.split(',')[0];
        
        // Update timezone info
        this.updateTimezoneInfo();
    }
    
    updateTimezoneInfo() {
        const now = new Date();
        const timezoneName = this.getTimezoneName();
        const utcOffset = this.getUTCOffset();
        
        const timezoneNameEl = document.getElementById('timezoneName');
        const utcOffsetEl = document.getElementById('utcOffset');
        
        if (timezoneNameEl) timezoneNameEl.textContent = timezoneName;
        if (utcOffsetEl) utcOffsetEl.textContent = utcOffset;
    }
    
    getTimezoneName() {
        const timezoneMap = {
            'America/New_York': 'Eastern Time',
            'America/Chicago': 'Central Time',
            'America/Denver': 'Mountain Time',
            'America/Los_Angeles': 'Pacific Time',
            'America/Phoenix': 'Arizona Time',
            'America/Anchorage': 'Alaska Time',
            'Pacific/Honolulu': 'Hawaii Time'
        };
        return timezoneMap[this.timezone] || 'Local Time';
    }
    
    getUTCOffset() {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const hours = Math.floor(Math.abs(offset) / 60);
        const minutes = Math.abs(offset) % 60;
        const sign = offset <= 0 ? '+' : '-';
        return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
}

// Weather Widget
class WeatherWidget {
    constructor() {
        this.zipCode = '30075';
        this.apiKey = '383e62529ccfeb4e0000a004f7f807fc'; // OpenWeatherMap API key
        this.init();
    }
    
    async init() {
        await this.fetchWeather();
        // Update weather every 10 minutes
        setInterval(() => this.fetchWeather(), 600000);
    }
    
    async fetchWeather() {
        try {
            // Check if API key is set
            if (this.apiKey === 'YOUR_API_KEY_HERE') {
                console.log('OpenWeatherMap API key not set, using demo data');
                this.showDemoWeather();
                return;
            }
            
            // Using OpenWeatherMap API
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${this.zipCode},us&appid=${this.apiKey}&units=imperial`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Invalid API key');
                    this.showErrorWeather('Invalid API key');
                } else if (response.status === 404) {
                    console.error('City not found');
                    this.showErrorWeather('City not found');
                } else {
                    console.error('Weather API error:', response.status);
                    this.showErrorWeather('API Error');
                }
                return;
            }
            
            const data = await response.json();
            this.updateWeatherDisplay(data);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showErrorWeather('Network Error');
        }
    }
    
    showDemoWeather() {
        const demoData = {
            main: {
                temp: 72,
                feels_like: 75,
                humidity: 65
            },
            weather: [{
                main: 'Clear',
                description: 'clear sky',
                icon: '01d'
            }],
            wind: {
                speed: 8
            }
        };
        this.updateWeatherDisplay(demoData);
    }
    
    showErrorWeather(errorMessage) {
        const errorData = {
            main: {
                temp: '--',
                feels_like: '--',
                humidity: '--'
            },
            weather: [{
                main: 'Error',
                description: errorMessage,
                icon: '50d'
            }],
            wind: {
                speed: '--'
            }
        };
        this.updateWeatherDisplay(errorData);
    }
    
    updateWeatherDisplay(data) {
        const tempEl = document.querySelector('.temp');
        const feelsLikeEl = document.querySelector('.detail:nth-child(1) .value');
        const humidityEl = document.querySelector('.detail:nth-child(2) .value');
        const windEl = document.querySelector('.detail:nth-child(3) .value');
        const descEl = document.querySelector('.weather-desc');
        const iconEl = document.querySelector('.weather-icon');
        
        if (tempEl) tempEl.textContent = Math.round(data.main.temp) + '°';
        if (feelsLikeEl) feelsLikeEl.textContent = Math.round(data.main.feels_like) + '°F';
        if (humidityEl) humidityEl.textContent = data.main.humidity + '%';
        if (windEl) windEl.textContent = Math.round(data.wind.speed) + ' mph';
        if (descEl) descEl.textContent = data.weather[0].description;
        
        // Update weather icon based on conditions
        if (iconEl) {
            const icon = this.getWeatherIcon(data.weather[0].main, data.weather[0].icon);
            iconEl.textContent = icon;
        }
    }
    
    getWeatherIcon(main, icon) {
        const iconMap = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
        
        // Check for specific icon codes for more accuracy
        if (icon.includes('01')) return '☀️'; // clear sky
        if (icon.includes('02') || icon.includes('03')) return '⛅'; // few clouds
        if (icon.includes('04')) return '☁️'; // broken clouds
        if (icon.includes('09') || icon.includes('10')) return '🌧️'; // rain
        if (icon.includes('11')) return '⛈️'; // thunderstorm
        if (icon.includes('13')) return '❄️'; // snow
        if (icon.includes('50')) return '🌫️'; // mist/fog
        
        return iconMap[main] || '🌤️';
    }
}

// Dad Jokes Widget
class DadJokesWidget {
    constructor() {
        this.jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "I told my wife she was drawing her eyebrows too high. She looked surprised.",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What do you call a fake noodle? An impasta!",
            "Why did the scarecrow win an award? He was outstanding in his field!",
            "What do you call a bear with no teeth? A gummy bear!",
            "Why don't skeletons fight each other? They don't have the guts!",
            "What do you call a fish wearing a bowtie? So-fish-ticated!",
            "Why did the math book look so sad? Because it had too many problems!",
            "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks!",
            "Why don't scientists trust stairs? Because they're always up to something!",
            "What do you call a cow with no legs? Ground beef!",
            "Why did the coffee file a police report? It got mugged!",
            "What do you call a belt made of watches? A waist of time!",
            "Why don't oysters donate to charity? Because they are shellfish!"
        ];
        this.currentJokeIndex = 0;
        this.init();
    }
    
    init() {
        this.showRandomJoke();
        this.bindEvents();
    }
    
    bindEvents() {
        const newJokeBtn = document.getElementById('newJokeBtn');
        if (newJokeBtn) {
            newJokeBtn.addEventListener('click', () => this.showRandomJoke());
        }
    }
    
    showRandomJoke() {
        const jokeText = document.getElementById('jokeText');
        if (jokeText) {
            // Fade out
            jokeText.style.opacity = '0';
            
            setTimeout(() => {
                // Get random joke
                const randomIndex = Math.floor(Math.random() * this.jokes.length);
                jokeText.textContent = this.jokes[randomIndex];
                
                // Fade in
                jokeText.style.opacity = '1';
            }, 200);
        }
    }
}

// Interactive Elements
class InteractiveElements {
    constructor() {
        this.initMouseEffects();
    }
    
    initMouseEffects() {
        let mouseTrail = [];
        const maxTrailLength = 20;
        
        document.addEventListener('mousemove', (e) => {
            mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
            
            if (mouseTrail.length > maxTrailLength) {
                mouseTrail.shift();
            }
            
            this.createMouseTrail(e.clientX, e.clientY);
        });
        
        setInterval(() => {
            mouseTrail = mouseTrail.filter(point => Date.now() - point.time < 1000);
        }, 100);
    }
    
    createMouseTrail(x, y) {
        if (Math.random() > 0.7) {
            const trail = document.createElement('div');
            
            // Get current theme for trail color
            const isDarkMode = document.documentElement.classList.contains('dark-mode') || 
                              (!document.documentElement.classList.contains('light-mode') && 
                               window.matchMedia('(prefers-color-scheme: dark)').matches);
            
            const trailColor = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)';
            
            trail.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 6px;
                height: 6px;
                background: ${trailColor};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: trail-fade 1s ease-out forwards;
            `;
            
            document.body.appendChild(trail);
            
            setTimeout(() => {
                trail.remove();
            }, 1000);
        }
    }
}

// CSS for animations
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes sparkle-animation {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes notification-animation {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        20% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
        }
        80% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
    }
    
    @keyframes trail-fade {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Menu Management - Simplified (no menu links)
class MenuManager {
    constructor() {
        this.init();
    }
    
    init() {
        // No menu functionality needed - just theme toggle
    }
    
    scrollToSection(sectionId) {
        if (sectionId === '#home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // Note: Email and external links are handled by browser, no scrolling needed
    }
    
    updateActiveLink() {
        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Simple logic to determine active section based on scroll position
        if (scrollPos < windowHeight * 0.5) {
            // No active link needed since logo is not clickable
        }
        // Note: Email and external links don't need active state based on scroll
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new ParticleSystem();
    new InteractiveElements();
    new WeatherWidget();
    new DigitalClock();
    new DadJokesWidget();
    new MenuManager();
    
    // Logo click effect
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', () => {
            logo.style.animation = 'none';
            setTimeout(() => {
                logo.style.animation = 'gradientShift 3s ease-in-out infinite, logoGlow 2s ease-in-out infinite alternate';
            }, 100);
        });
    }
});