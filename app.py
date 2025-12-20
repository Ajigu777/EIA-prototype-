from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/calculate_impacts", methods=["POST"])
def calculate_impacts():
    data = request.get_json()
    lat = float(data["lat"])
    lng = float(data["lng"])

    # TEST PHASE LOGIC
    noise = 30
    water = 30
    bio = 30

    if lng > 7.0:
        noise = 65
    if lat < 7.5:
        water = 75
    if lat > 9.0:
        bio = 80

    return jsonify({
        "noise_pollution": noise,
        "water_resource": water,
        "biodiversity_sensitivity": bio
    })

@app.route("/upload_geojson", methods=["POST"])
def upload_geojson():
    file = request.files.get("geojson")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    if not file.filename.endswith(".geojson"):
        return jsonify({"error": "Invalid file type"}), 400

    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    with open(path) as f:
        data = json.load(f)

    return jsonify({
        "message": "GeoJSON uploaded successfully",
        "features": len(data.get("features", []))
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
