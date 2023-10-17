from flask import Flask, jsonify, render_template, request
import json
import math

app = Flask(__name__)

with open('tvs_locations.json', 'r') as f:
    tvs_locations = json.load(f)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/nearest', methods=['POST'])
def get_nearest_locations():
    user_lat = request.json.get('lat')
    user_lng = request.json.get('lng')
    distances = []

    for loc in tvs_locations:
        dist = haversine(user_lat, user_lng, loc["position"]["lat"], loc["position"]["lng"])
        distances.append((loc, dist))
    
    distances.sort(key=lambda x: x[1])

    # Return the top 3 nearest locations with address and distance
    top_3 = [{"address": loc[0]["address"], "distance": loc[1], "lat": loc[0]["position"]["lat"], "lng": loc[0]["position"]["lng"]} for loc in distances[:3]]
    return jsonify({"locations": top_3})

if __name__ == '__main__':
    app.run(debug=True)
