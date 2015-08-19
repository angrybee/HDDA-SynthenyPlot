/*
 * 
 * http://bl.ocks.org/mbostock/3213173
 *
 */


//d3.json("files/2genomes.json", function (error, dataset) {
d3.tsv("files/ArabidopsisChr1.tsv", function (error, dataset) {
    if (error)
        return console.warn(error); // TBD
//    console.log(dataset);

    // Scatterplot
    var width = 500;
    var height = 500;
    var padding = 65;  // flexibel, wegen Zahlenlänge links?

    var startDomain = getMinimum();
    var endDomain = getMaximum();
 //   console.log(endDomain);


// flexibler und zusammenfassen?
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
            .range([padding, width - padding * 2]); // New scaling [min, max]

    // Scaling yAxis
    var yScale = d3.scale.linear()
            .domain([startDomain, endDomain]) // Original scaling [min, max]
            .range([height - padding, padding]); // New scaling [min, max] upsidedown

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
            .scaleExtent([1, 2])  // TBD
            .on("zoom", zoomed);

    // Zoomfunction, zoom axis and dots
    function zoomed() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        svg.selectAll("circle") // TBD, verschiebt nach unten rechts/oben links
                .attr("transform", function (d) {
                    return "translate(" + xScale(d.Start1)
                            + "," + yScale(d.Start2) + ")";
                });
    }

    // SVG
    var svg = d3.select("div#scatter")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoom)
            .append("g");

    // Bind data to dots
    var dots = svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle");

    // Attributes for the dots
    var dotAttr = dots
            .attr("cx", function (d) {
                // scaling the values to xAxis
                return xScale(d.Start1);
            })
            .attr("cy", function (d) {
                // scaling the values to yAxis
                return yScale(d.Start2);
            })
            .attr("r", "2") // radius
            .style("fill", "blue"); // color

    // xAxis as group, move
    var xAxisGroup = svg // Gruppiert alles was Achsen angeht
            .append("g")
            .attr("class", "x axis") //Assign "axis" class
            .attr("transform", "translate(0," + (height - padding) + ")")
            .call(xAxis);

    // yAxis as group, move
    var yAxisGroup = svg // Gruppiert alles was Achsen angeht
            .append("g")
            .attr("class", "y axis") //Assign "axis" class
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);
});