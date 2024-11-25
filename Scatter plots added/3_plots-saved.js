
// Fetch data from the Flask API
fetch('http://127.0.0.1:5000/api/v1.0/demographics')  // URL of the Flask API
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
  console.log('Data from API:', data);  // Log the data to check what exactly the API returns
  //I'm filtering all the values that have null doctors per kid to make the graph look better
  let filteredData = data.filter(item => item.kids_per_doctor !== null);

  let poverty_rate = filteredData.map(item => item.poverty_rate);
  let kids_per_doctor = filteredData.map(item => item.kids_per_doctor);
  let zip_code = filteredData.map(item => item.zip_code);
  let coverage_rate = filteredData.map(item => item.insurance_coverage_rate);
  let median_income = filteredData.map(item => item.family_median_income);

  // let poverty_rate = data.map(item => item.poverty_rate);
  // let kids_per_doctor = data.map(item => item.kids_per_doctor)
  // let zip_code = data.map(item => item.zip_code)

  init();

  function init(){
    drawPlot('poverty_rate'); // Default plot
    };

  function drawPlot (variable){
    d3.select("#plot").html(""); // Clear the previous plot

      if (variable === 'poverty_rate') {
        drawPovertyRate(data.family_income);
    } else if (variable === 'family_income') {
        drawMedianIncome(data.family_income);
    } else if (variable === 'coverage_rate') {
        drawCoverageRate(data.coverage_rate);
    }
  }

  function drawPovertyRate() {
    let poverty_trace = {
      x: poverty_rate,
      y: kids_per_doctor,
      text: zip_code,
      mode: 'markers',
      type: 'scatter',
      textposition: 'top center',
      hoverinfo: 'text',
      marker: {
        size: 10,
        color: 'violet',
        line: {
          color: 'deeppink',
          width: 2
        }
      }
    };

    let poverty_layout = {
      title: "Poverty Rate vs Kids per Doctor",
      xaxis: { title: 'Poverty Rate' },
      yaxis: { title: 'Kids per Doctor' }
    };

    Plotly.newPlot("plot", [poverty_trace], poverty_layout);
  }

  function drawCoverageRate() {
    let coverage_trace = {
      x: coverage_rate,
      y: kids_per_doctor,
      text: zip_code,
      mode: 'markers',
      type: 'scatter',
      textposition: 'top center',
      hoverinfo: 'text',
      marker: {
        size: 10,
        color: 'blue',
        line: {
          color: 'lightblue',
          width: 2
        }
      }
    };

    let coverage_layout = {
      title: "Insurance Coverage vs Kids per Doctor",
      xaxis: { title: 'Insurance Coverage Rate' },
      yaxis: { title: 'Kids per Doctor' }
    };

    Plotly.newPlot("plot", [coverage_trace], coverage_layout);
  }

  function drawMedianIncome() {
    let income_trace = {
      x: median_income,
      y: kids_per_doctor,
      text: zip_code,
      mode: 'markers',
      type: 'scatter',
      textposition: 'top center',
      hoverinfo: 'text',
      marker: {
        size: 10,
        color: 'green',
        line: {
          color: 'darkgreen',
          width: 2
        }
      }
    };

    let income_layout = {
      title: "Median Income vs Kids per Doctor",
      xaxis: { title: 'Median Income' },
      yaxis: { title: 'Kids per Doctor' }
    };

    Plotly.newPlot("plot", [income_trace], income_layout);
  }

  // Event listener for dropdown menu
  d3.select("#selDataset").on("change", function() {
    const selectedPlot = d3.select(this).property("value");
    drawPlot(selectedPlot);
  });
});
