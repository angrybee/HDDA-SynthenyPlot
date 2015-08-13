/*
 * 
 * http://bl.ocks.org/mbostock/3213173
 *
 */


d3.json("files/2genomes.json", function (error, dataset) {
    if (error)
        return console.warn(error); // TBD
    console.log(dataset);

    // Scatterplot
    var width = 500;
    var height = 500;
    var padding = 35;

    // These have to iterate
    var genome1 = 0;    // ID Genom1
    var genome2 = 1;    // ID Genom2
    var gen1 = 0; // ID Gen in Genome1
    var gen2 = 0; // ID Gen in Genome2

    var startDomain = 0;
    var endDomain = 2000; // End Genom1 and Genom2

    // Scaling xAxis
    var xScale = d3.scale.linear()
            .domain([startDomain, endDomain]) // Original scaling [min, max]
            .range([padding, width - padding * 2]); // New scaling [min, max]

    // Scaling yAxis
    var yScale = d3.scale.linear()
            .domain([startDomain, endDomain]) // Original scaling [min, max]
            .range([height - padding, padding]); // New scaling [min, max] upsidedown

    // SVG
    var svg = d3.select("div#scatter")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

    // Bind data to dots
    var dots = svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle");

    // Attributes for the dots
    var dotAttr = dots
            .attr("cx", function (d) {
                // scaling the values to xAxis
                return xScale(dataset[0].Genomes[genome1].genes[gen1].start);
            })
            .attr("cy", function (d) {
                // scaling the values to yAxis
                return yScale(dataset[0].Genomes[genome2].genes[gen2].start);
            })
            .attr("r", "4") // radius
            .style("fill", "violet"); // color

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

    // xAxis as group, move
    var xAxisGroup = svg // Gruppiert alles was Achsen angeht
            .append("g")
            .attr("class", "axis") //Assign "axis" class
            .attr("transform", "translate(0," + (height - padding) + ")")
            .call(xAxis);

    // yAxis as group, move
    var yAxisGroup = svg // Gruppiert alles was Achsen angeht
            .append("g")
            .attr("class", "axis") //Assign "axis" class
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);
});