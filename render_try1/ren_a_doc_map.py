from flask import Flask, jsonify, render_template
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import sessionmaker
import os

app = Flask(__name__)

# Enable CORS for more ports
CORS(app)

# Get the DATABASE_URL environment variable set by Render
database_url = os.getenv("DATABASE_URL")
# database_url = "postgresql://alex:5ZsVuAhs533DtUbfOOw8hVl1daKSyuIr@dpg-ct202f56l47c73bj3l50-a.oregon-postgres.render.com/healthcare_deserts_schema"

# Check if the DATABASE_URL is available, if not raise an error
if not database_url:
    raise ValueError("DATABASE_URL environment variable is not set.")

# Connect to the PostgreSQL database using the URL from the environment variable
engine = create_engine(database_url)

# Prepare the database for automapping
Base = automap_base()

# Reflect the tables from the database
Base.prepare(autoload_with=engine)

# Access the 'demographics' table (automatically mapped)
Demographics = Base.classes.demographics
# same for population table:
Population = Base.classes.population

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
        # Query to get data from both demographics and population tables
        results = session.query(
            Demographics.latitude,
            Demographics.longitude,
            Demographics.count_of_licensees,
            Demographics.coverage_rate,
            Demographics.zip_code,
            Population.population_under_18_years
        ).join(
            Population, Demographics.zip_code == Population.zip_code
        ).filter(
            Demographics.coverage_rate != None,  # - coverage_rate is none
            Demographics.coverage_rate != 0,     # - coverage_rate is 0
            Demographics.count_of_licensees > 0 # - doctor count is 0
        ).all()
        locations = []
        for latitude, longitude, count_of_licensees, coverage_rate, zip_code, population_under_18_years in results:
            if count_of_licensees > 0:
                children_to_doctor_ratio = population_under_18_years / count_of_licensees
            else:
                children_to_doctor_ratio = 0  # Not division by 0

            locations.append({
                "Latitude": latitude,
                "Longitude": longitude,
                "Children_to_Doctor_Ratio": children_to_doctor_ratio,
                "Coverage_Rate": coverage_rate
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
    
    app.run(debug=False, host='0.0.0.0', port=10000)