from flask import Flask, jsonify, render_template
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import sessionmaker
import os

app = Flask(__name__)

# Enable CORS for all origins (only for development or specific cases)
CORS(app)

# Get the DATABASE_URL environment variable set by Render
database_url = os.getenv("DATABASE_URL")
# database_url = "postgresql://alex:5ZsVuAhs533DtUbfOOw8hVl1daKSyuIr@dpg-ct202f56l47c73bj3l50-a.oregon-postgres.render.com/healthcare_deserts_schema"

# Check if the DATABASE_URL is available, if not raise an error
if not database_url:
    raise ValueError("DATABASE_URL environment variable is not set. Please check the configuration.")

# Connect to the PostgreSQL database using the URL from the environment variable
engine = create_engine(database_url)

# Prepare the database for automapping
Base = automap_base()

# Reflect the tables from the database
Base.prepare(autoload_with=engine)

# Access the 'demographics' table (automatically mapped)
Demographics = Base.classes.demographics

# Route for the home page (displays a welcome message and image)
@app.route("/")
def home():
    return render_template("home.html")  # This renders the home page with image and links

# Route for the map page (displays the map)
@app.route("/map")
def map_page():
    return render_template("map.html")  # This renders the map page, where map will be shown

# API route to return data in JSON format
@app.route("/api/v1.0/locations")
def get_locations():
    # Create a new session to interact with the database
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Query the 'demographics' table to get latitude, longitude, doctor count, and coverage rate
        results = session.query(
            Demographics.latitude,
            Demographics.longitude,
            Demographics.count_of_licensees,
            Demographics.coverage_rate 
        ).filter(
            Demographics.coverage_rate != None,  # Exclude rows with None in coverage_rate
            Demographics.coverage_rate != 0,     # Exclude rows where coverage_rate is 0
            Demographics.count_of_licensees > 0 # Exclude rows where doctor count is 0
        ).all()  # Apply the filters

        locations = []
        # Loop through the results and structure the data as needed
        for latitude, longitude, count_of_licensees, coverage_rate in results:
            locations.append({
                "Latitude": latitude,
                "Longitude": longitude,
                "Count_of_Licensees": count_of_licensees,
                "Coverage_Rate": coverage_rate  # Add coverage_rate to the result
            })

        # Return the data as JSON
        return jsonify(locations)

    except Exception as e:
        # If something goes wrong, return an error message
        return jsonify({"error": str(e)})

    finally:
        # Close the session to prevent memory leaks
        session.close()

if __name__ == "__main__":
    # In production, do not set debug to True.
    app.run(debug=False, host='0.0.0.0', port=10000)