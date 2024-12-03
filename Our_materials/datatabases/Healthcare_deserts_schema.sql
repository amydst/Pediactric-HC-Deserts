CREATE TABLE Population(
	ZIP_Code varchar (5) NOT NULL,	
	Population_Under_18_years int NOT NULL,	
	Total_Population int NOT NULL,
	Percent_Population_Under_18_years float,
	Male_Pop_Under_18 int,	
	Female_Pop_Under_18 int,
	Population_Density_per_sq_mile float,
	PRIMARY KEY (ZIP_Code)
); 

CREATE TABLE Demographics (
    Demo_ID FLOAT NOT NULL,
    ZIP_Code VARCHAR(5) NOT NULL,
    Household_Median_Income FLOAT,
    Household_Mean_Income FLOAT,
    Family_Median_Income FLOAT,
    Family_Mean_Income FLOAT,
    Married_Couple_Family_Median_Income FLOAT,
    Married_Couple_Family_Mean_Income FLOAT,
    Nonfamily_Household_Median_Income FLOAT,
    Nonfamily_Household_Mean_Income FLOAT,
    Land_Area_sq_miles FLOAT,
    Water_Area_sq_miles FLOAT,
    Latitude FLOAT,
    Longitude FLOAT,
    Per_Capita_Income FLOAT,
    Poverty_Count FLOAT,
    Poverty_Rate FLOAT,
    Insurance_Coverage_Status FLOAT,
    Coverage_Rate FLOAT,
    Count_Of_Licensees FLOAT,
    PRIMARY KEY (Demo_ID),
    FOREIGN KEY (ZIP_Code) REFERENCES Population(ZIP_Code)
);



