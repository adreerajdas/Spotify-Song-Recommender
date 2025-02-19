from flask import Flask, redirect, request, render_template, session, url_for, jsonify
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Configuration
CLIENT_ID = 'd99dcf0d4b4b4d068ad93ff491a0e0a9'
CLIENT_SECRET = '4188c9ef2c9d4e8fbef1a162f22784d9'
REDIRECT_URI = 'http://127.0.0.1:5000/callback'
SCOPE = 'user-library-read playlist-read-private user-top-read'

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'
app.config['SESSION_COOKIE_NAME'] = 'spotify-login-session'

# Spotify OAuth
sp_oauth = SpotifyOAuth(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri=REDIRECT_URI,
    scope=SCOPE
)

# Home Route
@app.route('/')
def index():
    token_info = get_token()
    if not token_info:
        return redirect(url_for('login'))
    return render_template('index.html')

# Spotify Authorization
@app.route('/login')
def login():
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

# Spotify Callback
@app.route('/callback')
def callback():
    session.clear()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session['token_info'] = token_info
    return redirect(url_for('index'))

# Check Token Validity
def get_token():
    token_info = session.get('token_info', None)
    if not token_info:
        return None
    
    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
    
    session['token_info'] = token_info
    return token_info['access_token']

# Artist-Based Recommendations
@app.route('/recommendations/artist', methods=['POST'])
def get_artist_recommendations():
    token = get_token()
    if not token:
        return redirect(url_for('login'))
    
    sp = spotipy.Spotify(auth=token)
    artist_name = request.json['artist']
    results = sp.search(q=f'artist:{artist_name}', type='track', limit=5)
    recommended_tracks = []

    for item in results['tracks']['items']:
        track = {
            'name': item['name'],
            'url': item['external_urls']['spotify'],
            'artist': item['artists'][0]['name'],
            'image': item['album']['images'][0]['url']
        }
        recommended_tracks.append(track)

    return jsonify({'songs': recommended_tracks})

# Mood-Based Recommendations
@app.route('/recommendations/mood', methods=['GET'])
def get_mood_recommendations():
    token = get_token()
    if not token:
        return redirect(url_for('login'))
    
    sp = spotipy.Spotify(auth=token)
    mood = request.args.get('mood')
    
    # Define seed genres for each mood
    mood_seeds = {
        'happy': 'pop',
        'sad': 'acoustic',
        'energetic': 'rock',
        'chill': 'chill'
    }
    
    if mood in mood_seeds:
        results = sp.recommendations(seed_genres=[mood_seeds[mood]], limit=5)
    else:
        results = sp.recommendations(seed_genres=['pop'], limit=5)
    
    recommended_tracks = []

    for item in results['tracks']:
        track = {
            'name': item['name'],
            'url': item['external_urls']['spotify'],
            'artist': item['artists'][0]['name'],
            'image': item['album']['images'][0]['url']
        }
        recommended_tracks.append(track)

    return jsonify({'songs': recommended_tracks})

if __name__ == '__main__':
    app.run(debug=True)
