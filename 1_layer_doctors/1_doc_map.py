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
engine = create_engine("postgresql://postgres:postgres@localhost:5433/Healthcare_deserts_schema")

# Prepare the database for automapping
Base = automap_base()

# Reflect the tables from the database
Base.prepare(autoload_with=engine)

# Access the 'demographics' table (automatically mapped)
Demographics = Base.classes.demographics

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

if __name__ == "__main__":
    app.run(debug=True)