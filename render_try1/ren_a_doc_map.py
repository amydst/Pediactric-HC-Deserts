from flask import Flask, jsonify, render_template
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import sessionmaker
import os

app = Flask(__name__)


CORS(app)

# Get the DATABASE_URL environment variable set by Render
database_url = os.getenv("DATABASE_URL")

# Uncomment and replace with your local database URL if necessary:
# database_url = "postgresql://alex:5ZsVuAhs533DtUbfOOw8hVl1daKSyuIr@dpg-ct202f56l47c73bj3l50-a.oregon-postgres.render.com/healthcare_deserts_schema"

# Check if the DATABASE_URL is available, if not raise an error
if not database_url:
    raise ValueError("DATABASE_URL environment variable is not set.")

engine = create_engine(database_url)

Base = automap_base()

Base.prepare(autoload_with=engine)

# Access the 'demographics' table (automatically mapped)
Demographics = Base.classes.demographics
# Same for the 'population' table:
Population = Base.classes.population

# Route for the home page
@app.route("/")
def home():
    return render_template("home.html")  #home page with image and links

# Route for the map page (displays the map with coverage layer)
@app.route("/map")
def map_page():
    return render_template("map.html")  #coverage map will be shown

# Route for the heatmap page (displays the heatmap layer)
@app.route("/heatmap")
def heatmap_page():
    return render_template("heatmap.html")  # separate page for the heatmap

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
                # Calculate the children-to-doctor ratio
                children_to_doctor_ratio = population_under_18_years / count_of_licensees
            else:
                children_to_doctor_ratio = 0  

            #locations list
            locations.append({
                "Latitude": latitude,
                "Longitude": longitude,
                "Children_to_Doctor_Ratio": children_to_doctor_ratio,
                "Coverage_Rate": coverage_rate
            })

        # Return the data as JSON
        return jsonify(locations)

    except Exception as e:
        # If something goes wrong, return an error message in JSON format
        return jsonify({"error": str(e)})

    finally:
        # Close the session to prevent memory leaks and ensure cleanup
        session.close()

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=10000)