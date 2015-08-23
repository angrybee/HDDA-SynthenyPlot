/* ToDo
 * 
 *      Tooltipbox ausrichten
 *      Tooltip sperren wg. links anklicken
 *      
 * Grafikbreite usw. dynamisch ?    
 * fest zoomen (-bereich)  http://computationallyendowed.com/blog/2013/01/21/bounded-panning-in-d3.html
 * Auswahl in json exportieren 
 * Beispieldatei (tsv) in json umbauen
 * vllt tooltipbox und tabellenaufbau in funktion
 * 
 * klicken in tabelle fokus in grafik?
 * 
 * fehlermeldung beim einlesen?
 * TBD im script
 * 
 * tabelle autosort beim hinzufügen
 *      hervorheben neuer eintrag
 * 
 * Nach Reset:
 * "Unerwarteter Wert translate(undefined) scale(undefined) beim Parsen des Attributs transform."
 * 
 * 
 * Aufräumen:
 *      Einheitlich id/class ansprechen
 *      Doku/Comments englisch
 *      tabelle zeilenweiser farbwechsel
 *      
 */

/* global d3 */

//d3.json("files/2genomes.json", function (error, dataset) {
d3.tsv("files/ArabidopsisChr1Genome.tsv", function (error, dataset) {
    if (error)
        return console.warn(error); // TBD
//    console.log(dataset);

    // Scatterplot, the technical data
    var margin = {top: 10, right: 0, bottom: 40, left: 70};
    var width = 550 - margin.left - margin.right;
    var height = 550 - margin.top - margin.bottom;
    var domain = getDomainData();
    var minRadius = 1;
    var maxRadius = 5;

    // Where to look and link
    var dbGen = "http://www.ncbi.nlm.nih.gov/gene/?term=";
    var dbGenome = "http://www.ncbi.nlm.nih.gov/genome/?term=";

    function getDomainData() {
        var o = {};
        // Make an array and push another
        // parseInt() if data stored as strings
        var startData = dataset.map(function (d) {
            return parseInt(d.Start1);
        });
        // d3.merge didn't work
        Array.prototype.push.apply(startData,
                function () {
                    return dataset.map(function (d) {
                        return parseInt(d.Start2);
                    });
                });
        o.min = d3.min(startData);
        o.max = d3.max(startData);
        return  o;
    }

    // Scaling xAxis
    var xScale = d3.scale.linear()
            .domain([domain.min, domain.max]) // Original scaling [min, max]
            .range([0, width]); // New scaling [min, max]

    // Scaling yAxis
    var yScale = d3.scale.linear()
            .domain([domain.min, domain.max]) // Original scaling [min, max]
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
            .x(xScale)  // Set new scales
            .y(yScale)
            .scaleExtent([1, 100])  // ZoomInFactor
            .on("zoom", zoomed);

    // Zoomfunction, zoomes axis and dots
    function zoomed() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        svg.selectAll("circle")
                .attr("cx", function (d) {
                    return xScale(d.Start1);
                })
                .attr("cy", function (d) {
                    return yScale(d.Start2);
                })
                .attr("r", function () {
                    /* Use new scale or the maxRadius to get "normal" sized
                     * dots. Reset needs the original minRadius.
                     */
                    if (d3.event.scale !== null) {
                        if (d3.event.scale > maxRadius) {
                            return maxRadius;
                        }
                        return d3.event.scale;
                    }
                    return minRadius;
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

    var infowindow = d3.select("div#infowindow");

    // Outer SVG
    var svg = d3.select("div#scatter")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left
                    + "," + margin.top + ")")
            .call(zoom);

    // Plotbackground
    svg.append("rect")
            .attr("width", width)
            .attr("height", height);

    // Group the xAxis, move it to the bottom
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis);
    // Add the text label for the xAxis
    svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text(dataset[0].Genome1);

    // Group the yAxis
    svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(0,0)")
            .call(yAxis);
    // Add the text label for the yAxis
    svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(dataset[0].Genome2);

    // Inner SVG
    var plot = svg.append("svg")
            .attr("class", "plot")
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
            .attr("r", minRadius) // radius
            .attr("id", function (d, i) {
                return "ID" + i;
            })
            .on("mouseover", function (d) {
                /*               tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
                 tooltip.select("#gen1").text(d.Gen1); // mit Text füllen
                 tooltip.select("#gen2").text(d.Gen2);
                 tooltip.style("left", (d3.event.pageX) + "px") // xPos
                 .style("top", (d3.event.pageY - 40) + "px"); // yPos  */
                d3.select(this).classed("hover", true); // bunt
                this.parentNode.appendChild(this); // Redraw

                infowindow.transition()
                        .duration(200)
                        .style("opacity", .9);

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
            })
            .on("click", function (d, i) {
                if (d3.select(this).attr("class").indexOf("saved") !== -1) {
                    removeSaved(i);
                }
                else {
                    // Mark the spot as clicked
                    d3.select(this).classed("saved", true);
                    // Remove the sortable tags (classes/elements)
                    d3.select("th.sorttable_sorted").classed("sorttable_sorted", false);
                    d3.select("span#sorttable_sortrevind").remove();
                    d3.select("span#sorttable_sortfwdind").remove();

                    // make/get row
                    var row = d3.select("table#table").select("tbody")
                            .append("tr")
                            .attr("id", "ID" + i);

                    // add stuff 
                    row.append("td").html("<a href='" + dbGenome + d.Genome1 + "'>"
                            + d.Genome1 + "</a>");
                    row.append("td").html("<a href='" + dbGen + d.Gen1 + "[sym]'>"
                            + d.Gen1 + "</a>");
                    row.append("td").text(d3.format(",")(d.Start1));
                    row.append("td").text(d3.format(",")(d.End1));
                    row.append("td").text(d3.format(",")(Math.abs(d.End1 - d.Start1)));
                    row.append("td").html("<a href='" + dbGenome + d.Genome2 + "'>"
                            + d.Genome2 + "</a>");
                    row.append("td").html("<a href='" + dbGen + d.Gen2 + "[sym]'>"
                            + d.Gen2 + "</a>");
                    row.append("td").text(d3.format(",")(d.Start2));
                    row.append("td").text(d3.format(",")(d.End2));
                    row.append("td").text(d3.format(",")(Math.abs(d.End2 - d.Start2)));
                    row.append("td").text(d.Info);
                    row.append("button")
                            .attr("type", "button")
                            .attr("id", i)
                            .text("X")
                            .on('click', function () {
                                removeSaved(d3.select(this).attr("id"));
                            });
                }
            })
            .on("mouseout", function (d) {
                infowindow.transition()
                        .duration(500)
                        .style("opacity", 0);
                d3.select(this).classed("hover", false); // normal
            });

    // Get and remove row und mark (Problems with id=int => id=IDint)
    function removeSaved(i) {
        d3.select("tr#ID" + i).remove();
        d3.select("circle#ID" + i).classed("saved", false);
    }
});