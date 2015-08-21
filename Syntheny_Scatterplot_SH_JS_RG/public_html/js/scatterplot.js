/* ToDo
 * 
 * Punkte beim Zoom klein lassen/anpassen
 *      Tooltipbox ausrichten
 *      Markierung merken (index in dataset) und speichern? Danach weiterhovern.
 *      Merken zusätzlich via Doppelklick?
 *      Kleiner Tipp obsolet?
 *      Tooltip sperren wg. links anklicken, wie dann weiter suchen?
 * tiefer zoomen
 * 
 * Nach Reset:
 * "Unerwarteter Wert translate(undefined) scale(undefined) beim Parsen des Attributs transform."
 * 
 */

//d3.json("files/2genomes.json", function (error, dataset) {
d3.tsv("files/ArabidopsisChr1Genome.tsv", function (error, dataset) {
    if (error)
        return console.warn(error); // TBD
//    console.log(dataset);

    // Scatterplot Eckdaten
    var margin = {top: 10, right: 0, bottom: 30, left: 80}
    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var startDomain = getMinimum();
    var endDomain = getMaximum();
    
    // Where to look and link
    var dbGen = "http://www.ncbi.nlm.nih.gov/gene/?term=";
    var dbGenome = "http://www.ncbi.nlm.nih.gov/genome/?term=";
    var temp = null;

    // TBD flexibler und zusammenfassen, Puffer von 5% (*1,05)
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
            .tickFormat(d3.format("s"))
            .tickSize(-height) // grid
            .ticks(10);

    // yAxis, scaling, text left
    var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .tickFormat(d3.format("s"))
            .tickSize(-width) // grid
            .ticks(10);

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
        /*        svg.selectAll("circle")
         .transition()
         .duration(0)
         .attr("cx", function (d) {
         return xScale(d.Start1);
         })
         .attr("cy", function (d) {
         return yScale(d.Start2);
         })
         .attr("r", function() {
         return (d3.event.scale > 5) ? 5 : d3.event.scale;
         });
         */

        svg.selectAll("circle") // TBD, Punkte werden recht groß, kleiner?
                .attr("transform", function () {
                    return "translate(" + d3.event.translate + ")"
                            + " scale(" + d3.event.scale + ")"
                });
    }

    // zoomResetButton
    d3.select("body")
            .append("button")
            .attr("type", "button")
            .attr("id", "zoomReset")
            .text("Reset view")
            .on('click', function () {
                d3.event.preventDefault();
                zoom.scale(1);
                zoom.translate([0, 0]);
                zoomed();
            });

    var tooltip = d3.select("div#tooltip");
    var infowindow = d3.select("div#infowindow");

    // SVG
    var svg = d3.select("div#scatter")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left
                    + "," + margin.top + ")")
            .call(zoom);

    svg.append("rect")  // Plothintergrund, damit von überall gezoomt 
            //werden kann, nicht nur auf Punkten.
            .attr("width", width)
            .attr("height", height);

    // Gruppiert alles was Achsen angeht
    svg.append("g")
            .attr("class", "x axis") //Assign "axis" class
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis);
    // Add the text label for the X axis
    svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text(dataset[0].Genome1);

    // yAxis as group, move
    svg.append("g")
            .attr("class", "y axis") //Assign "axis" class
            .attr("transform", "translate(0,0)")
            .call(yAxis);
    // Add the text label for the Y axis
    svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(dataset[0].Genome2);

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
            .attr("r", function () {
                // return (Math.random() * 1) + 0; 
                return 1;
            }) // radius
            .on("mouseover", function (d) {
                tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                tooltip.select("#gen1").text(d.Gen1); // mit Text füllen
                tooltip.select("#gen2").text(d.Gen2);
                tooltip.style("left", (d3.event.pageX) + "px") // xPos
                        .style("top", (d3.event.pageY - 40) + "px"); // yPos              
                d3.select(this).classed("hover", true); // bunt
                this.parentNode.appendChild(this); // Redraw
            })
            .on("click", function (d, i) {
                infowindow.select("#genome1")
                        .html("<a href='" + dbGenome + d.Genome1 + "'>"
                                + d.Genome1 + "</a>");
                infowindow.select("#gen1")
                        .html("<a href='" + dbGen + d.Gen1 + "[sym]'>"
                                + d.Gen1 + "</a>");
                infowindow.select("#start1").text(d3.format(",")(d.Start1));
                infowindow.select("#end1").text(d3.format(",")(d.End1));
                infowindow.select("#length1")
                        .text(d3.format(",")(Math.abs(d.End1 - d.Start1)));
                //Update the tooltip genome2
                infowindow.select("#genome2")
                        .html("<a href='" + dbGenome + d.Genome2 + "'>"
                                + d.Genome2 + "</a>");
                infowindow.select("#gen2")
                        .html("<a href='" + dbGen + d.Gen2 + "[sym]'>"
                                + d.Gen2 + "</a>");
                infowindow.select("#start2").text(d3.format(",")(d.Start2));
                infowindow.select("#end2").text(d3.format(",")(d.End2));
                infowindow.select("#length2")
                        .text(d3.format(",")(Math.abs(d.End2 - d.Start2)));
                // Update the tooltip info
                infowindow.select("#info").text(d.Info);
                if (temp !== null) {
                    temp.classed("marked", false);  // normal
                }
                temp = d3.select(this)
                temp.classed("marked", true) // bunt

            })
            .on("mouseout", function (d) {
                tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                d3.select(this).classed("hover", false);  // normal
            });
});