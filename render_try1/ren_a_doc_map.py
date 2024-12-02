from flask import Flask, jsonify, render_template
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import sessionmaker
import os

# Creating Flask aplication
app = Flask(__name__)

# CORS (Cross-Origin Resource Sharing) -  making API available form different domens
CORS(app)

# Get the DATABASE_URL environment variable set by Render. (Databases are saved on server)
database_url = os.getenv("DATABASE_URL")

# Uncomment and replace with your local database URL if necessary:
# database_url = "postgresql://alex:5ZsVuAhs533DtUbfOOw8hVl1daKSyuIr@dpg-ct202f56l47c73bj3l50-a.oregon-postgres.render.com/healthcare_deserts_schema"

# Check if the DATABASE_URL is available, if not raise an error
if not database_url:
    raise ValueError("DATABASE_URL environment variable is not set.")

# Create connection with database
engine = create_engine(database_url)

# Automatic maping of tables form database
Base = automap_base()

# Preparing databases to use them later in aplication
Base.prepare(autoload_with=engine)

# Making access to tables in database
Demographics = Base.classes.demographics
Population = Base.classes.population

# Making routes 

@app.route("/")
def home():
    return render_template("home.html")


@app.route("/map")
def map_page():
    return render_template("map.html")


@app.route("/plots")
def plots_page():
    return render_template("3_plots.html")

# Making route for API, whitch is giving datas in JSON for GET request
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
        # Close the session to prevent memory leaks. Finally will close the session even if error will occured. 
        session.close()


# Run the Flask app
if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=10000)