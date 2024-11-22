from flask import Flask, jsonify
import psycopg2
import pandas as pd
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import func

engine = create_engine("postgresql://postgres:postgres@localhost/Pediatric Healthcare deserts")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(autoload_with=engine)

Population = Base.classes.population

Demographics = Base.classes.demographics
app = Flask(__name__)

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/names<br/>"
        f"/api/v1.0/passengers"
    )

if __name__ == '__main__':
    app.run(debug=True)