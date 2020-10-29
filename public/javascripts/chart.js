function makeChart(data){

    console.log(data)

    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([0, data.length])
        .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // text label for the x axis
    svg.append("text")             
        .attr("transform",
            "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Frame #");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));


     // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of bats in Frame"); 


    var line = d3.line()
      // assign the X function to plot our line as we wish
      .x(function(d,i) { 
          // verbose logging to show what's actually being done
          console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
          // return the X coordinate where we want to plot this datapoint
          return x(i); 
      })
      .y(function(d) { 
          // verbose logging to show what's actually being done
          console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
          // return the Y coordinate where we want to plot this datapoint
          return y(d); 
      })
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line(data))

}