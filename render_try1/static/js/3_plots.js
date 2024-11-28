fetch('/api/v1.0/locations')  // URL of the Flask API
  .then(response => {
    if (!response.ok) {
      console.log('Error: Network response was not ok', response);
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Data from API:', data);  // Log the data to check what exactly the API returns

    // I'm filtering all the values that have null children_to_doctor_ratio to make the graph look better
    let filteredData = data.filter(item => item.Children_to_Doctor_Ratio !== null && item.Children_to_Doctor_Ratio !== 0);
    console.log('Filtered Data:', filteredData);  // Log filtered data to ensure correct filtering

    // Mapping the relevant data to variables
    let poverty_rate = filteredData.map(item => item.Poverty_Rate);
    let children_to_doctor_ratio = filteredData.map(item => item.Children_to_Doctor_Ratio);  
    let coverage_rate = filteredData.map(item => item.Coverage_Rate); 
    let median_income = filteredData.map(item => item.Family_Median_Income);
    let population_density = filteredData.map(item => item.Population_Density);
    let zip_codes = filteredData.map(item => item.Zip_Code);  // Added zip_codes

    console.log('Poverty Rate:', poverty_rate);
    console.log('Children to Doctor Ratio:', children_to_doctor_ratio);
    console.log('Coverage Rate:', coverage_rate);
    console.log('Median Income:', median_income);
    console.log('Population Density:', population_density);

    init();

    function init() {
      drawPlot('poverty_rate'); // Default plot
    }

    function drawPlot(variable) {
      console.log('Drawing plot for variable:', variable);  // Log which plot is being drawn
      d3.select("#plot").html(""); // Clear the previous plot
      if (variable === 'poverty_rate') {
        drawPovertyRate();  
      } else if (variable === 'family_income') {
        drawMedianIncome();
      } else if (variable === 'coverage_rate') {
        drawCoverageRate();
      } else if (variable === 'population_density') {
        drawPopulationDensity();
      } else {
        console.log('Unknown variable:', variable);  // Log if an unknown variable is passed
      }
    }

    function linearRegression(x, y) {
      console.log('Performing linear regression with x:', x, 'and y:', y);  // Log input data for regression
      let size = x.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

      // Calculate sums
      for (let i = 0; i < size; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
      }

      console.log('Sum values: sumX:', sumX, 'sumY:', sumY, 'sumXY:', sumXY, 'sumX2:', sumX2, 'sumY2:', sumY2);

      // Calculate slope (m) and intercept (b)
      let slope = (size * sumXY - sumX * sumY) / (size * sumX2 - sumX * sumX);
      let intercept = (sumY - slope * sumX) / size;

      // Calculate correlation coefficient (r)
      let r = (size * sumXY - sumX * sumY) / Math.sqrt((size * sumX2 - sumX * sumX) * (size * sumY2 - sumY * sumY));
      console.log('Linear regression results: slope:', slope, 'intercept:', intercept, 'r:', r);

      // Calculate R-squared
      let rSquared = r * r;
      console.log('R-squared:', rSquared);

      // Calculate t-statistic for correlation coefficient
      let test = r * Math.sqrt((size - 2) / (1 - r * r));

      // Calculate p-value using jStat t-distribution
      let pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(test), size - 2));
      console.log('p-value:', pValue);

      // Return slope, intercept, r, rSquared and pValue
      return {slope, intercept, r, rSquared, pValue};
    }

    function drawPovertyRate() {
      let x = poverty_rate;
      let y = children_to_doctor_ratio;

      console.log('Drawing Poverty Rate plot with x:', x, 'and y:', y);  // Log data for plot

      let poverty_trace = {
        x: x,
        y: y,
        text: zip_codes,  // Use zip codes here
        mode: 'markers',
        type: 'scatter',
        name:'Zip codes',
        textposition: 'top center',
        hoverinfo: 'text',
        marker: {
          size: 10,
          color: 'violet',
          line: {
            color: 'deeppink',
            width: 1
          }
        }
      };

      // Calculate the regression line
      let { slope, intercept, r, rSquared, pValue } = linearRegression(x, y);

      // Generate y-values for the regression line
      let regressionLine = x.map(xVal => slope * xVal + intercept);

      let line_trace = {
        x: x,
        y: regressionLine,
        mode: 'lines',
        type: 'scatter',
        name: 'Regression Line',
        line: {
          color: 'indigo'
        },
        hoverinfo: 'none',
      };

      let poverty_layout = {
        title: "Poverty Rate vs Kids per Doctor",
        xaxis: { title: 'Poverty Rate' },
        yaxis: { title: 'Kids per Doctor' }
      };

      Plotly.newPlot("plot", [poverty_trace, line_trace], poverty_layout);

      console.log(`R-squared: ${rSquared}`);
      console.log(`p-value: ${pValue}`);

      document.getElementById('rSquared').textContent = `R-squared: ${rSquared.toFixed(5)}`;
      document.getElementById('pValue').textContent = `p-value: ${pValue.toFixed(15)}`;
    }

    function drawCoverageRate() {
      let x = coverage_rate;
      let y = children_to_doctor_ratio;

      console.log('Drawing Coverage Rate plot with x:', x, 'and y:', y);  // Log data for plot
      
      let coverage_trace = {
        x: x,
        y: y,
        text: zip_codes,  // Use zip codes here
        mode: 'markers',
        type: 'scatter',
        name:'Zip codes',
        textposition: 'top center',
        hoverinfo: 'text',
        marker: {
          size: 10,
          color: 'blue',
          line: {
            color: 'lightblue',
            width: 1
          }
        }
      };

      // Calculate the regression line
      let { slope, intercept, r, rSquared, pValue } = linearRegression(x, y);

      // Generate y-values for the regression line
      let regressionLine = x.map(xVal => slope * xVal + intercept);
      
      let line_trace = {
        x: x,
        y: regressionLine,
        mode: 'lines',
        type: 'scatter',
        name: 'Regression Line',
        line: {
          color: 'indigo'
        },
        hoverinfo: 'none',
      };

      let coverage_layout = {
        title: "Insurance Coverage vs Kids per Doctor",
        xaxis: { title: 'Insurance Coverage Rate' },
        yaxis: { title: 'Kids per Doctor' }
      };

      Plotly.newPlot("plot", [coverage_trace, line_trace], coverage_layout);

      console.log(`R-squared: ${rSquared}`);
      console.log(`p-value: ${pValue}`);

      document.getElementById('rSquared').textContent = `R-squared: ${rSquared.toFixed(5)}`;
      document.getElementById('pValue').textContent = `p-value: ${pValue.toFixed(15)}`;
    }

    function drawMedianIncome() {
      let x = median_income;
      let y = children_to_doctor_ratio;

      console.log('Drawing Median Income plot with x:', x, 'and y:', y);  // Log data for plot

      let income_trace = {
        x: x,
        y: y,
        text: zip_codes,  // Use zip codes here
        mode: 'markers',
        type: 'scatter',
        name:'Zip codes',
        textposition: 'top center',
        hoverinfo: 'text',
        marker: {
          size: 10,
          color: 'limegreen',
          line: {
            color: 'darkgreen',
            width: 1
          }
        }
      };
      
      // Calculate the regression line
      let { slope, intercept, r, rSquared, pValue } = linearRegression(x, y);

      // Generate y-values for the regression line
      let regressionLine = x.map(xVal => slope * xVal + intercept);

      let line_trace = {
        x: x,
        y: regressionLine,
        mode: 'lines',
        type: 'scatter',
        name: 'Regression Line',
        line: {
          color: 'black'
        },
        hoverinfo: 'none',
      };

      let income_layout = {
        title: "Median Income vs Kids per Doctor",
        xaxis: { title: 'Median Income' },
        yaxis: { title: 'Kids per Doctor' }
      };

      Plotly.newPlot("plot", [income_trace, line_trace], income_layout);
    }

    function drawPopulationDensity() {
      let x = population_density;
      let y = children_to_doctor_ratio;

      console.log('Drawing Population Density plot with x:', x, 'and y:', y);  // Log data for plot

      let density_trace = {
        x: x,
        y: y,
        text: zip_codes,  // Use zip codes here
        mode: 'markers',
        type: 'scatter',
        name: 'Zip codes',
        textposition: 'top center',
        hoverinfo: 'text',
        marker: {
          size: 10,
          color: 'dimgray',
          line: {
            color: 'silver',
            width: 1
          }
        }
      };
      
      // Calculate the regression line
      let { slope, intercept, r, rSquared, pValue } = linearRegression(x, y);

      // Generate y-values for the regression line
      let regressionLine = x.map(xVal => slope * xVal + intercept);

      let density_layout = {
        title: "Population density vs Kids per Doctor",
        xaxis: { title: 'Population Density' },
        yaxis: { title: 'Kids per Doctor' }
      };

      let line_trace = {
        x: x,
        y: regressionLine,
        mode: 'lines',
        type: 'scatter',
        name: 'Regression Line',
        line: {
          color: 'black'
        },
        hoverinfo: 'none',
      };

      Plotly.newPlot("plot", [density_trace, line_trace], density_layout);

      console.log(`R-squared: ${rSquared}`);
      console.log(`p-value: ${pValue}`);

      document.getElementById('rSquared').textContent = `R-squared: ${rSquared.toFixed(5)}`;
      document.getElementById('pValue').textContent = `p-value: ${pValue.toFixed(15)}`;
    }

    // Event listener for dropdown menu
    d3.select("#selDataset").on("change", function() {
      const selectedPlot = d3.select(this).property("value");
      console.log('Selected plot:', selectedPlot);  // Log the selected plot
      drawPlot(selectedPlot);
    });
  });