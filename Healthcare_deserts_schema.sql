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

CREATE TABLE Demographics(
	Demo_ID float NOT NULL,
	ZIP_Code varchar(5) NOT NULL,
	Household_Median_Income float,
	Household_Mean_Income float,
	Family_Median_Income float,
	Family_Mean_Income float,
	Couple_Family_Median_Income float,
	Couple_Family_Mean_Income float,
	Nonfamily_Household_Median_Income float,
	Nonfamily_Household_Mean_Income float,
	Land_Area_sq_miles float,
	Water_Area_sq_miles float,
	Poverty_Count float,
	Poverty_Rate float,
	Latitude float,	
	Longitude float,
	Per_Capita_Income float,
	Insurance_coverage_status float,
	Insurance_coverage_Rate float,
	Doctor_Count float,
	PRIMARY KEY (Demo_ID),
	FOREIGN KEY (ZIP_Code) REFERENCES Population(ZIP_Code)
);



