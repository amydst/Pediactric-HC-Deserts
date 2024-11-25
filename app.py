from flask import Flask, jsonify, render_template
import psycopg2
import pandas as pd
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine, func, inspect, Integer, String, ForeignKey, case
import matplotlib.pyplot as plt
import io
import base64

app = Flask(__name__)

engine = create_engine("postgresql://postgres:postgres@localhost/Pediatric Healthcare deserts")

Session = sessionmaker(bind=engine)
session = Session()

# reflect an existing database into a new model
Base = automap_base()


# reflect the tables
Base.prepare(autoload_with=engine)

app.route("/data", methods=['GET'])
def get_data():
    # reflect the tables
    Base.prepare(autoload_with=engine)

    table_names = Base.classes.keys()
    Population = Base.classes.population
    Demographics = Base.classes.demographics

    inspector = inspect(engine)
    demo_columns = inspector.get_columns("demographics")
    pop_columns = inspector.get_columns("population")
    zip_codes = session.query(Demographics.zip_code).all()
    poverty_rate = session.query(Demographics.poverty_rate).all()
    doctors_count = session.query(Demographics.count_of_licensees).all()
    population_density = session.query(Population.population_density_per_sq_mile).all()
    total_kids = session.query(Population.population_under_18_years).all()
    kids_per_doctor = session.query(Population.zip_code,
        case(
            (Demographics.count_of_licensees == 0, None),  # Handle division by zero
            else_=Population.population_under_18_years / Demographics.count_of_licensees
        ).label('kids_per_doctor')
    ).join(Demographics, Population.zip_code == Demographics.zip_code).all()
    
    # # Flatten the list of tuples
    # zip_codes = [z[0] for z in zip_codes]
    # poverty_rate = [p[0] for p in poverty_rate]
    # doctors_count = [d[0] for d in doctors_count]
    # population_density = [p[0] for p in population_density]
    # kids_per_doctor = [k[1] for k in kids_per_doctor]

    data = [{'zip_code':zip_codes, 'doctors_count':doctors_count}]


    return (
        jsonify(data)
    )


if __name__ == '__main__':
    app.run(debug=True)