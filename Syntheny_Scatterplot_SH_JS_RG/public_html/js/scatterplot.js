//d3.json("files/2genomes.json", function (error, dataset) {
d3.tsv("files/ArabidopsisChr1.tsv", function (error, dataset) {
    if (error)
        return console.warn(error); // TBD
//    console.log(dataset);

    // Scatterplot Eckdaten
    var margin = {top: 10, right: 0, bottom: 30, left: 80}
    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var startDomain = getMinimum();
    var endDomain = getMaximum();

    // flexibler und zusammenfassen, Puffer von 5% (*1,05)
    function getMinimum() {
        // parseInt, weil sonst String und lexikalisch sortiert
        var start1 = d3.min(
                dataset.map(function (d) {
                    return parseInt(d.Start1);
                }));
        var start2 = d3.min(
                dataset.map(function (d) {
                    return parseInt(d.Start2);
                }));
        if (start1 < start2)
            return start1;
        else
            return start2;
    }

    function getMaximum() {
        var end1 = d3.max(
                dataset.map(function (d) {
                    return parseInt(d.Start1);
                }));
        var end2 = d3.max(
                dataset.map(function (d) {
                    return parseInt(d.Start2);
                }));
        if (end1 > end2)
            return end1;
        else
            return end2;
    }

    // Scaling xAxis
    var xScale = d3.scale.linear()
            .domain([startDomain, endDomain]) // Original scaling [min, max]
            .range([0, width]); // New scaling [min, max]

    // Scaling yAxis
    var yScale = d3.scale.linear()
            .domain([startDomain, endDomain]) // Original scaling [min, max]
            .range([height, 0]); // New scaling [min, max] upsidedown

    // xAxis, scaling, text bottom
    var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
    //    .ticks(5);

    // yAxis, scaling, text left
    var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
    //   .ticks(5);

    // Zoom
    var zoom = d3.behavior.zoom()
            .x(xScale)  // Umskalieren
            .y(yScale)
            .scaleExtent([1, 12])  // TBD, anpassen
            .on("zoom", zoomed);

    // Zoomfunction, zoom axis and dots
    function zoomed() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        svg.selectAll("circle") // TBD, Punkte werden recht groß, kleiner?
                .attr("transform", function (d) {
                    return "translate(" + d3.event.translate + ")"
                            + " scale(" + d3.event.scale + ")"
                });
    }

    var tooltip = d3.select("div#tooltip");

    // SVG
    var svg = d3.select("div#scatter")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);

    svg.append("rect")  // Plothintergrund, damit von überall gezoomt werden kann, nicht nur auf Punkten.
            .attr("width", width)
            .attr("height", height);

    // xAxis as group, move
    // Gruppiert alles was Achsen angeht
    svg.append("g")
            .attr("class", "x axis") //Assign "axis" class
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis);

    // yAxis as group, move
    svg.append("g")
            .attr("class", "y axis") //Assign "axis" class
            .attr("transform", "translate(0,0)")
            .call(yAxis);

    var plot = svg.append("svg")
            .attr("class", "plot") // c&p, anpassen TBD
            .attr("width", width)
            .attr("height", height);

    // Bind data to dots
    plot.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function (d) { // Attributes for the dots
                // scaling the values to xAxis
                return xScale(d.Start1);
            })
            .attr("cy", function (d) {
                // scaling the values to yAxis
                return yScale(d.Start2);
            })
            .attr("r", "1") // radius
            .on("mouseover", function (d) {
                tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                tooltip.select("#gen1").text(d.Gen1);  // mit Text füllen
                tooltip.select("#gen2").text(d.Gen2);
                tooltip.style("left", (d3.event.pageX) + "px") // xPos
                        .style("top", (d3.event.pageY - 40) + "px");  // yPos              
                d3.select(this).classed("hover", true);  // bunt
                this.parentNode.appendChild(this); // Redraw
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                d3.select(this).classed("hover", false);  // normal
            });




    /*                //Update the tooltip genome1
     * ON mouseclick infofenster füllen mit näheren infos
     * 
     tooltip.select("#genome1").text(d.Genome1);
     tooltip.select("#gen1").text(d.Gen1);
     tooltip.select("#start1").text(d.Start1);
     tooltip.select("#end1").text(d.End1);
     tooltip.select("#length1").text(Math.abs(d.End1 - d.Start1));
     //Update the tooltip genome2
     tooltip.select("#genome2").text(d.Genome2);
     tooltip.select("#gen2").text(d.Gen2);
     tooltip.select("#start2").text(d.Start2);
     tooltip.select("#end2").text(d.End2);
     tooltip.select("#length2").text(Math.abs(d.End2 - d.Start2));
     // Update the tooltip info
     tooltip.select("#info").text(d.Info);*/

    /*
     // Determine whether polygon is in left/right side of screen, and alter tooltip location accordingly:
     if ($(this).attr("transform").substr(10,10)*1 > width/2) tooltip.classed("leftPos", true);
     else tooltip.classed("leftPos", false);
     
     //Show the tooltip
     if(($(this).attr('class') != 'inactive')) 
     tooltip.classed("hidden", false);
     
     })
     
     http://bl.ocks.org/richardwestenra/129f64bfa2b0d48d27c9
     
     */

});