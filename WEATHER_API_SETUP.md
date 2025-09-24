# OpenWeatherMap API Setup Guide

## Getting Your API Key

1. **Sign up for OpenWeatherMap**
   - Go to [OpenWeatherMap.org](https://openweathermap.org/)
   - Click "Sign Up" and create a free account
   - Verify your email address

2. **Get Your API Key**
   - Log in to your account
   - Go to the [API Keys page](https://home.openweathermap.org/api_keys)
   - Copy your default API key (it starts with letters/numbers)

3. **Update Your Code**
   - Open `script.js`
   - Find line 148: `this.apiKey = 'YOUR_API_KEY_HERE';`
   - Replace `'YOUR_API_KEY_HERE'` with your actual API key
   - Example: `this.apiKey = 'abc123def456ghi789';`

## Free Tier Limits

- **1,000 calls per day** (plenty for personal use)
- **60 calls per minute**
- **Current weather data**
- **5-day forecast** (if you want to add it later)

## Security Note

⚠️ **Important**: Since this is client-side code, your API key will be visible in the browser. For production use, consider:

1. **Rate limiting** on your API key
2. **Using a proxy server** to hide the key
3. **Implementing usage monitoring**

For a personal project like dempsey5.com, the free tier is perfect!

## Testing

After adding your API key:
1. Open the page in your browser
2. Check the browser console (F12) for any errors
3. The weather should update with real data for zip code 30075

## Troubleshooting

- **"Invalid API key"**: Double-check you copied the key correctly
- **"City not found"**: The zip code 30075 should work, but you can change it in the code
- **Network errors**: Check your internet connection
- **CORS errors**: OpenWeatherMap supports CORS for web requests

## Changing Location

To change the weather location:
1. Open `script.js`
2. Find line 147: `this.zipCode = '30075';`
3. Replace with any US zip code you want
4. Example: `this.zipCode = '90210';` (Beverly Hills)

That's it! Your weather widget will now show real, live weather data! 🌤️
