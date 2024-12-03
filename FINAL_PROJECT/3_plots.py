from flask import Flask, jsonify
from flask_cors import CORS  # Enabling CORS for cross-origin requests
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import sessionmaker

app = Flask(__name__)

# Enable CORS for all origins. I have to download it (CORS is needed to allow your frontend 
# (on port 5500) to access resources from your backend API (on port 5000) 
# because browsers block cross-origin requests by default for security reasons.)

CORS(app)

# Connect to the PostgreSQL database
engine = create_engine("postgresql://postgres:postgres@localhost/Pediatric Healthcare deserts")

# Prepare the database for automapping
Base = automap_base()

# Reflect the tables from the database
Base.prepare(autoload_with=engine)

# Access the 'demographics' table (automatically mapped)
Demographics = Base.classes.demographics
Population = Base.classes.population

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/demographics<br/>"
        f"/api/v1.0/locations"
    )

@app.route("/api/v1.0/locations")
def get_locations():
    # Create a new session to interact with the database
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Query the 'demographics' table to get latitude, longitude, and doctor count
        results = session.query(Demographics.latitude, Demographics.longitude, Demographics.count_of_licensees).all()

        locations = []
        # Loop through the results and structure the data as needed
        for latitude, longitude, count_of_licensees in results:
            locations.append({
                "Latitude": latitude,
                "Longitude": longitude,
                "Count_of_Licensees": count_of_licensees 
            })

        # Return the data as JSON
        return jsonify(locations)

    except Exception as e:
        return jsonify({"error": str(e)})

    finally:
        # Close the session to prevent memory leaks
        session.close()

@app.route("/api/v1.0/demographics")
def get_demographics():
    # Create a new session to interact with the database
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Query the 'demographics' table to the demographics
        query_demographics = session.query(
            Demographics.zip_code,
            Demographics.count_of_licensees,
            Demographics.poverty_rate,
            Demographics.family_median_income,
            Demographics.coverage_rate,
            Population.population_under_18_years,
            Population.population_density_per_sq_mile
            
            ).join(Population, Demographics.zip_code == Population.zip_code).all()

        data = []
        
        # Loop through the results and structure the data as needed
        for zip_code, doctor_count, poverty_rate, income, insurance, kids, density  in query_demographics:
            # Calculate the ratio of population under 18 to doctor count
            if doctor_count is not None and doctor_count > 0:
                kids_per_doctor = kids / doctor_count
            else:
                kids_per_doctor = 0  # Set to 0 or handle as needed if doctor_count is None or 0

            data.append({
                "zip_code": zip_code,
                "doctor_count": doctor_count,
                "poverty_rate": poverty_rate,
                "family_median_income": income,
                "insurance_coverage_rate":insurance,
                "population_under_18":kids,
                "population_density": density,
                "kids_per_doctor":kids_per_doctor
            })


        # Return the data as JSON
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)})

    finally:
        # Close the session to prevent memory leaks
        session.close()


if __name__ == "__main__":
    app.run(debug=True)