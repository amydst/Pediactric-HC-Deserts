from flask import Flask, jsonify, render_template
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import sessionmaker
import os

app = Flask(__name__)

CORS(app)

# Get the DATABASE_URL environment variable set by Render
engine = create_engine("postgresql://postgres:postgres@localhost:5433/Healthcare_deserts_schema")


Base = automap_base()

Base.prepare(autoload_with=engine)

Demographics = Base.classes.demographics
Population = Base.classes.population


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/map")
def map_page():
    return render_template("map.html")


@app.route("/plots")
def plots_page():
    return render_template("3_plots.html")


@app.route("/ethical_implications")
def ethical_implications():
    return render_template("ethical.html")


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
            Population.population_under_18_years,
            Demographics.poverty_rate,
            Demographics.insurance_coverage_status,  
            Demographics.family_median_income,
            Population.population_density_per_sq_mile
        ).join(
            Population, Demographics.zip_code == Population.zip_code
        ).filter(
            Demographics.coverage_rate != None,  # - coverage_rate is None
            Demographics.coverage_rate != 0,     # - coverage_rate is 0
            Demographics.count_of_licensees > 0  # - doctor count is 0
        ).all()

        locations = []
        for latitude, longitude, count_of_licensees, coverage_rate, zip_code, population_under_18_years, poverty_rate, insurance_coverage_status, family_median_income, population_density in results:
            if count_of_licensees > 0:
                # Calculate the children-to-doctor ratio
                children_to_doctor_ratio = population_under_18_years / count_of_licensees
            else:
                children_to_doctor_ratio = 0  # Set to 0 or handle as needed if doctor_count is None or 0

            # Append data for each location
            locations.append({
                "Latitude": latitude,
                "Longitude": longitude,
                "Children_to_Doctor_Ratio": children_to_doctor_ratio,
                "Coverage_Rate": coverage_rate,
                "Zip_Code": zip_code,
                "Poverty_Rate": poverty_rate,
                "Insurance_Coverage_Status": insurance_coverage_status, 
                "Family_Median_Income": family_median_income,
                "Population_Density": population_density
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
    app.run(debug=True, host='127.0.0.1', port=5000)