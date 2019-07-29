function stackedBarChart() {
  var divWidth = 760,
      divHeight = 250,
      margin = {top: 40, left: 40, bottom: 0, right: 0},
    	width = divWidth - margin.left - margin.right,
    	height = divHeight - margin.top - margin.bottom;

  // Create a genome line chart for the given selection.
  function chart(selection) {
    selection.each(function (data) {
      // Calculate the absolute differential selection for plotting.
      data.forEach(
        function (d) {
          d.absmutdiffsel = Math.abs(+d.mutdiffsel);
          return d;
        }
      )

      // Bind the data to the chart function.
      chart.data = data;

      // Create the base chart SVG object.
      var svg = d3.select(this)
        .append("svg")
        .attr("width", divWidth)
        .attr("height", divHeight);

      var sites = [...new Set(data.map(d => d.site))].sort();
      var mutations = [...new Set(data.map(d => d.mutation))].sort();
      console.log(sites);
      console.log(mutations);

    	var x = d3.scaleBand(
        sites,
    		[margin.left, width - margin.right]
      ).padding(0.1);
    	var y = d3.scaleLinear()
    		.rangeRound([height - margin.bottom, margin.top]);

    	var xAxis = svg.append("g")
    		.attr("transform", `translate(0,${height - margin.bottom})`)
    		.attr("class", "x-axis");

    	var yAxis = svg.append("g")
    		.attr("transform", `translate(${margin.left},0)`)
    		.attr("class", "y-axis");

    	var z = d3.scaleOrdinal()
    		.domain(mutations);

      // Set x-axis label.
      svg
        .append("text")
        .attr("transform", "translate(" + (divWidth / 2) + ", " + (height + 30) + ")")
        .style("text-anchor", "middle")
        .text("Site");

      // Set y-axis label.
      svg
        .append("text")
        .attr("transform", "translate(" + (12) + ", " + (height + 10) + ") rotate(-90)")
        .text("Absolute differential selection");

      // Convert long data to wide format for stacking.
      var siteMap = new Map();
      barChart.data.forEach(function (d) {
        if (siteMap.get(d.site) === undefined) {
          siteMap.set(d.site, {"site": d.site});
        }

        siteMap.get(d.site)[d.mutation] = d.absmutdiffsel;
      });

      // Convert wide data map to an array.
      var wideData = Array.from(siteMap.values());

      // Stack the wide data by mutations for plotting a stacked barchart.
      var series = d3.stack().keys(mutations)(wideData);

      // Calculate the y domain from the maximum stack position.
      y.domain([0, d3.max(series, d => d3.max(d, d => d[1]))]);

      // Calculate the color domain.
      z.range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), series.length).reverse())
       .unknown("#cccccc");

      svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
          .attr("fill", d => z(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr("x", (d, i) => x(d.data.site))
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth());

      svg.selectAll(".y-axis")
  			.call(d3.axisLeft(y).ticks(null, "s"));

  		svg.selectAll(".x-axis")
  			.call(d3.axisBottom(x).tickSizeOuter(0));

    });
  };

  return chart;
}

var barChart = stackedBarChart();
d3.csv("_data/2009-age-65-per-site-data.csv").then(data =>
  d3.select("#bar_chart")
    .data([data])
    .call(barChart)
);
