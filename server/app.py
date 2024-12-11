import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

TOURS_FILE = "./tours.txt"

def load_tours():
    if os.path.exists(TOURS_FILE):
        with open(TOURS_FILE, "r") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return []
    return []

def save_tours(tours):
    with open(TOURS_FILE, "w") as file:
        json.dump(tours, file)

tours_data = load_tours()
print(tours_data)

@app.route('/api/tours', methods=['GET'])
@cross_origin()
def get_tours(): 
    return jsonify(tours_data), 200


@app.route('/api/tours', methods=['POST'])
@cross_origin()
def add_tours():
    data = request.json
    if not all(k in data for k in ("country", "duration", "price")):
        return jsonify({"error": "Missing data"}), 400

    tours = {
        "country": data["country"],
        "duration": data["duration"],
        "price": data["price"],
    }

    tours_data.append(tours)
    save_tours(tours_data)
    return jsonify({"message": "tours saved successfully", "tours": tours}), 201

@app.route('/api/tours/<string:country>', methods=['GET'])
@cross_origin()
def get_tour(country):
    tour = next((h for h in tours_data if h['country'] == country), None)
    if tour:
        return jsonify(tour)
    else:
        return jsonify({"error": "tour not found"}), 404

@app.route('/api/tours/<string:country>', methods=['DELETE'])
@cross_origin()
def delete_tour(country):
    global tours_data
    tours_data = [tour for tour in tours_data if tour['country'] != country]
    save_tours(tours_data)
    return jsonify({"message": f"tour with country '{country}' deleted successfully"}), 200

@app.route('/api/tours', methods=['DELETE'])
@cross_origin()
def clear_all_tours():
    global tours_data
    tours_data.clear()
    save_tours(tours_data)
    return jsonify({"message": "All tours deleted successfully"}), 200

@app.route('/api/tours/<string:country>', methods=['PUT'])
@cross_origin()
def update_tour(country):
    tour = next((h for h in tours_data if h['country'] == country), None)
    if not tour:
        return jsonify({"error": "tour not found"}), 404

    data = request.json
    tour['country'] = data.get('country', tour['country'])
    tour['duration'] = data.get('duration', tour['duration'])
    tour['price'] = data.get('price', tour['price'])

    save_tours(tours_data)
    return jsonify({"message": "tour updated successfully", "tour": tour}), 200

if __name__ == '__main__':
    app.run(debug=True, port=8080)
