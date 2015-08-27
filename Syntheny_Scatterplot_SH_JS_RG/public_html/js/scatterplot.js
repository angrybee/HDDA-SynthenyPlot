/* ToDo:
 * Lukas Wunschliste:
 * Matrix mit allen Daten als Übersicht, wie sein Bsp., klick drauf zur Einzelübersicht
 * Bereich ziehen in Plot zur Auswahl (wäre schick)
 *      http://bl.ocks.org/mbostock/4063663
 *      Stichwort brushing
 *      
 *      Geht nicht mit zooming gleichzeitig
 * 
 * 
 * Reparieren/Anpassen:
 * 
 * 
 * Überlegungen:
 * Grafikbreite usw. dynamisch ?    
 * fest zoomen (-bereich)  http://computationallyendowed.com/blog/2013/01/21/bounded-panning-in-d3.html
 * Auswahl in json exportieren 
 * Beispieldatei (tsv) in json umbauen
 * vllt tooltipbox und tabellenaufbau in funktion
 * bild speichern?
 * klicken in tabelle fokus in grafik?
 * fehlermeldung beim einlesen?
 * tabelle zeilenweiser farbwechsel
 * sorttable funktionsfähig machen (sortiert lexikalisch)
 *              tabelle autosort beim Hinzufügen
 * 
 * 
 * Aufräumen:
 *      Einheitlich id/class ansprechen
 *      Doku/Comments englisch
 *      
 */

/* global d3 */

//d3.json("files/2genomes.json", function (error, dataset) {
d3.tsv("files/ArabidopsisChr1Genome.tsv", function (error, dataset) {
    if (error)
        return console.warn(error);
//    console.log(dataset);

    // Scatterplot, the technical data
    var margin = {top: 10, right: 10, bottom: 45, left: 70};
    var width = 550 - margin.left - margin.right;
    var height = 550 - margin.top - margin.bottom;

    var minRadius = 1;
    var maxRadius = 5;

    // Where to look and link
    var dbGen = "http://www.ncbi.nlm.nih.gov/gene/?term=";
    var dbGenome = "http://www.ncbi.nlm.nih.gov/genome/?term=";

    var tempRow = null;

    // Scaling xAxis
    var xScale = d3.scale.linear()
            .domain(d3.extent(dataset, function (d) {
                return parseInt(d.Start1);
            })) // Original scaling [min, max]
            //            .domain([domain.min, domain.max]) // Original scaling [min, max]
            .range([0, width]); // New scaling [min, max]

    // Scaling yAxis
    var yScale = d3.scale.linear()
            .domain(d3.extent(dataset, function (d) {
                return parseInt(d.Start2);
            }))
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
                    /* 
                     * Use new scale or the maxRadius to get "normal" sized
                     * dots. Reset needs the original minRadius.
                     */
                    if (d3.event.scale > maxRadius)
                        return maxRadius;
                    if (d3.event.scale > 1)
                        return d3.event.scale;
                    return minRadius;
                });
    }

    // zoomResetButton
    d3.select("div#buttons")
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
    var svg = d3.select("div#plot")
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
            .attr("class", "axis label")
            .attr("transform", "translate(" + (width / 2) + " ," + (height - 10 + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text(dataset[0].Genome1);

    // Group the yAxis
    svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(0,0)")
            .call(yAxis);
    // Add the text label for the yAxis
    svg.append("text")
            .attr("class", "axis label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(dataset[0].Genome2);

    // Inner SVG with data
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
            .on("contextmenu", function (d, i) {
                d3.event.preventDefault();
                var popup = d3.select("#context-menu")
                        .style('position', 'absolute')
                        .style('display', 'inline-block')
                        .style("left", (d3.event.pageX) + "px") // xPos
                        .style("top", (d3.event.pageY) + "px"); // yPos

                popup.select("#genome1").html("<a href='" + dbGenome + d.Genome1
                        + "' target='_blank'>"
                        + d.Genome1 + "</a>");
                popup.select("#gen1")
                        .html("<a href='" + dbGen + d.Gen1
                                + "[sym]' target='_blank'>"
                                + d.Gen1 + "</a>");
                popup.select("#genome2").html("<a href='" + dbGenome + d.Genome2
                        + "' target='_blank'>"
                        + d.Genome2 + "</a>");
                popup.select("#gen2")
                        .html("<a href='" + dbGen + d.Gen2
                                + "[sym]' target='_blank'>"
                                + d.Gen2 + "</a>");
                popup.on("mouseleave", function () {
                    d3.select('#context-menu').style('display', 'none');
                });

            })
            .on("mouseover", function (d) {
                d3.select(this).classed("hover", true); // bunt
                this.parentNode.appendChild(this); // Redraw

                infowindow.transition()
                        .duration(200)
                        .style("opacity", 0.9)
                        .style('display', 'inline-block');

                infowindow.select("#genome1").text(d.Genome1);
                infowindow.select("#gen1").text(d.Gen1);
                infowindow.select("#orientation1").text(getOrientation(d.Start1, d.End1));
                infowindow.select("#start1").text(d3.format(",")(d.Start1));
                infowindow.select("#end1").text(d3.format(",")(d.End1));
                infowindow.select("#length1")
                        .text(d3.format(",")(Math.abs(d.End1 - d.Start1)));
                //Update the tooltip genome2
                infowindow.select("#genome2").text(d.Genome2);
                infowindow.select("#gen2").text(d.Gen2);
                infowindow.select("#orientation2").text(getOrientation(d.Start2, d.End2));
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
                    /*
                     // Remove the sortable tags (classes/elements)
                     d3.select("th.sorttable_sorted").classed("sorttable_sorted", false);
                     d3.select("span#sorttable_sortrevind").remove();
                     d3.select("span#sorttable_sortfwdind").remove();
                     */

                    // remove newAdded
                    if (tempRow !== null)
                        tempRow.classed("newAdded", false);

                    // make/get row
                    var row = d3.select("table#table")
                            .classed("hidden", false) // table surely visible
                            .select("tbody")
                            .append("tr")
                            .attr("id", "ID" + i)
                            .classed("newAdded", true);

                    tempRow = row; // save it for later to remove mark

                    // add stuff 
                    row.append("td").html("<a href='" + dbGenome + d.Genome1
                            + "' target='_blank'>"
                            + d.Genome1 + "</a>");
                    row.append("td").html("<a href='" + dbGen + d.Gen1
                            + "[sym]' target='_blank'>"
                            + d.Gen1 + "</a>");
                    row.append("td").text(getOrientation(d.Start1, d.End1));
                    row.append("td").text(d3.format(",")(d.Start1));
                    row.append("td").text(d3.format(",")(d.End1));
                    row.append("td").text(d3.format(",")(Math.abs(d.End1 - d.Start1)));

                    row.append("td").html("<a href='" + dbGenome + d.Genome2
                            + "' target='_blank'>"
                            + d.Genome2 + "</a>");
                    row.append("td").html("<a href='" + dbGen + d.Gen2
                            + "[sym]' target='_blank'>"
                            + d.Gen2 + "</a>");
                    row.append("td").text(getOrientation(d.Start2, d.End2));
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
                        .style("opacity", 0)
                        .style('display', 'none');
                d3.select(this).classed("hover", false); // normal
            });

    // Get the orientation with given start and end of a gen
    function getOrientation(firstValue, secondValue) {
        if (secondValue > firstValue)
            return "forward";
        return "reverse";
    }

    // Get and remove row und mark (Problems with id=int => id=IDint)
    function removeSaved(i) {
        d3.select("tr#ID" + i).remove();
        d3.select("circle#ID" + i).classed("saved", false);
        // Hide table
        if (d3.select("circle.saved")[0][0] === null)
            d3.select("table#table").classed("hidden", true);
    }

    d3.selectAll("a").attr("target", "_blank");
    /*
     d3.select("div#buttons")
     .append("button")
     .attr("type", "button")
     .attr("id", "save")
     .text("Save")
     .on("click", function () {
     });
     */
});