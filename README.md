# Access to Pediatric Care in California: Analyzing the Socioeconomic Factors Behind Healthcare Deserts

## Amy Dos Santos, Aleksandra Kutz.

https://project-3-tbuy.onrender.com/

### **Project Overview:** 
Pediatricians are specially trained to provide optimal care for children, and research shows that pediatric care leads to better health outcomes for children compared to care provided by general or family doctors. Specialized pediatric care not only benefits children's health, but it also proves to be more cost-effective for families, insurance companies, and government programs.<sup>1,8</sup>
California is home to some of the nation's top hospitals and offers a robust Medicaid program—Medi-Cal—that provides healthcare coverage to low-income residents, individuals with disabilities, and all children under the age of 21.<sup>6,7</sup> Despite these efforts, there are still significant areas of the state where access to pediatric care is limited.
This project aims to investigate the socioeconomic factors that may contribute to the existence of pediatric healthcare deserts in California. Specifically, we seek to understand how variables such as poverty rates, family income, population density, and insurance coverage might influence the distribution of pediatricians across the state, and identify the regions where children are underserved.


### **Definitions:**
**-Pediatric care desert:** There are several ways this can be defined, for this analysis we are using the ratio of children per pediatrician of 1,200:1. We decided on this based on a review of several research papers reviewed.<sup>1</sup>

**-Number of Pediatricians:** Total number of clinicians and doctors with a current medical license, that report Pediatric Medicine as their primary area of practice.<sup>3</sup>

**-Children**: Total number of children between 0 and 18 years old.<sup>2</sup>

**-Family Income:** Total amount of money received by all family members 15 years old and over with income.<sup>2</sup>

**-Poverty Rate:** Percentage of total population with poverty status.<sup>2</sup>

**-Population Density:** Total population divided by the land area in square miles.<sup>2</sup>

**-Insurance coverage:** Percentage of the total population that was considered covered by health insurance at some time during the year.<sup>2</sup>

### **Hypothesis:**
**-Poverty Rate:** Zip codes with lower poverty levels will have less kids per doctor.
    What we found: The relationship is weak, only 5.14% of the variance of the Ratio of Kids per Doctor can be attributed to the Poverty rate but, with a p-value of 3.17 x 10⁻¹²,  it is significant. In other words,  the relationship, even though it is small, is not due to chance.

**-Family Median Income:** Zip codes with higher family median income will have less kids per doctor.
    What we found: Similar to Poverty Rate, the relationship is weak, R-squared is only 0.080, but it is not due to chance, since we got a p-value of  < 0.000

**-Population Density:** Higher density zip codes will have less kids per doctor.
    What we found: With a R-squared value of 0.00009 and a p-value of 0.770, we cannot reject the null-hypothesis, meaning the very weak relationship between these two variables is most likely due to chance.

**-Insurance coverage:**  Zip codes with higher insurance coverage will have less kids per doctor.
    What we found: Very similarly than with Population density, we cannot reject the null-hypothesis for this variable, we got a R-squared value of 0.00009 and a p-value of 0.771

### **How to use and interact with the project:**

All the data is stored in a Postgres database, which is accessed through a Flask using SQLAlchemy, all visualizations are created using Javascript and can be accessed through the links on the main page.
https://project-3-tbuy.onrender.com/


### **Ethical Considerations**

**-Data Use and Attribution:**
We reviewed the Terms of Service for both the U.S. Census Bureau and the California Health and Human Services (CalHHS) to ensure that we were in compliance with all relevant guidelines for data use.

 - U.S. Census Bureau: We found that we are permitted to search, retrieve, and display data from the Census Bureau's database via their API or by downloading CSV files. We are also allowed to use the data for analysis, provided that we do not alter or misrepresent the information. We are required to attribute the data to the Census Bureau appropriately.<sup>4</sup>

 - California Health and Human Services (CalHHS): CalHHS granted us the license to use their datasets, with the stipulation that we attribute the source to CalHHS and ensure that we do not modify or misrepresent the data in any way.<sup>5</sup>

**-Data Privacy and Protection:**
We made a conscious effort to exclude personal and identifiable information about healthcare providers (such as individual doctor names or contact information) from our analysis. Since this information was not necessary for the scope of our study, excluding it further minimizes the risk of misuse and ensures the privacy of healthcare professionals involved in the data.

**-Bias and Representation:**
We recognize that the decisions made during data preparation, cleaning, and analysis can impact the final results, and we strived to approach each step with careful thought and consideration to avoid unintentional misrepresentation of the communities and healthcare providers being studied.

### **Data sources:** 

**Pediatric Physicians:**
California Health and Human Services Open Data Portal: https://data.chhs.ca.gov/dataset/physician-survey-licensee-responses-by-address-of-record-zip-code/resource/fe1b3b37-1530-41be-86e7-eb055eb9ab2d?filters=PrimaryAreaOfPractice%3APediatrics

**All other variables:** Everything else was retrieved from the Census Bureau portal:
https://data.census.gov/advanced?g=040XX00US06$8600000.

### **Literature References:**

1. DeAngelis, C. ∙ Feigin, R. ∙ DeWitt, T. Final report of the FOPE II Pediatric Workforce Workgroup Pediatrics. 2000; 106:1245-1255
https://www.jpeds.com/article/S0022-3476(04)00908-4/pdf

2. Census Bureau - Subject Definitions: https://www.census.gov/programs-surveys/cps/technical-documentation/subject-definitions.html#

3. California Health and Human Services Open Data Portal: https://data.chhs.ca.gov/dataset/physician-survey-licensee-responses-by-address-of-record-zip-code/resource/fe1b3b37-1530-41be-86e7-eb055eb9ab2d?filters=PrimaryAreaOfPractice%3APediatrics

4. Census Bureau - Terms of Service: https://www.census.gov/data/developers/about/terms-of-service.html

5. CalHHS - Terms of Use: https://data.chhs.ca.gov/pages/terms

6. Statista Ranking Best Hospitals in the U.S. 2024 https://www.newsweek.com/rankings/worlds-best-hospitals-2024/united-states

7. What is the difference between Medicare and Medi-cal? https://www.alignmenthealthplan.com/discover-ahp/medicare-advantage-faqs/medicare-vs-medical

8. Pediatrician vs Family Doctor https://www.pediatricandadolescentmedicine.net/About-Us/Blog/June-2023/Pediatrician-vs-Family-Doctor


### **Code References:**

We used code from the different activities shown in class, used the assistance of ChatGPT and Xpert Learning Assistant.
