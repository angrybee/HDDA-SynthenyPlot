//=============================================================================
//
//         FILE:    scattermatrix.index
//
//        USAGE: 
//
//  DESCRIPTION:    Performance for M-BS2-S4B SS2015
//                  Visualization of synteny with Javascript and the
//                  library D3.js (http://d3js.org)
//
//      OPTIONS:    ---
// REQUIREMENTS:    datafile in json-format: TBD
// 
//         BUGS:    Click to open new window only works if not clicked on dots.
//                  If drawing a frame (class=frame) only a click on the frame 
//                  opens a new window.
//
//
//        NOTES:    
//
// ORGANIZATION:    Justus-Liebig-University Giessen
//      VERSION:    1.0
//      CREATED:    08.2015
//     REVISION:    ---
//=============================================================================

/*
 * ToDo:
 * individuelle domaingrößen und die dann mitgeben/speichern
 * 
 * Anpassen und vereinheitlichen
 * 
 */
/* global d3 */

var size = 150;
var padding = 25.5;

var x = d3.scale.linear()
        .range([padding / 2, size - padding / 2]);

var y = d3.scale.linear()
        .range([size - padding / 2, padding / 2]);

var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
//    .ticks(5);

var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
//   .ticks(5);

d3.tsv("files/Arabidopsis.tsv", function (error, data) {
    if (error)
        return console.warn(error);
    //console.log(dataset);

    var genomes = ["1", "2", "3", "4", "5"];  // bekommen wir aus
    //erstem teil der struktur = anzahl genome
    var n = genomes.length; // numer of data // 5

    var domainByGenome = {};
    genomes.forEach(function (genome) {
        domainByGenome[genome] = d3.extent(data, function (d) {
            // selbe domain für alle erstmal, muss individuell aus erstem teil
            // der struktur,
            // einfach drüberiterieren und d3.extent
            // im ersten Teil alle anfänge durchgehen als daten
            return parseInt(d.Start1);
        });
    });

    var matrix = {}; // homologydata, each compared genomes in 1 array

    // Workaround for empty cells/data
    function initMatrix() {
        for (var i = 0; i < n; i++) {
            matrix["G" + genomes[i]] = {};
            var values = matrix["G" + genomes[i]];
            for (var j = 0; j < n; j++) {
                values["G" + genomes[j]] = [];
            }
            matrix["G" + genomes[i]] = values;
        }
    }
    initMatrix();

    data.forEach(function (d) {
        var values = matrix["G" + d.Genome1];
        var array = values["G" + d.Genome2];
        array.push(d);
        values["G" + d.Genome2] = array;
        matrix["G" + d.Genome1] = values;
    });

    // Grids
    xAxis.tickSize(size * n)
            .tickFormat(d3.format("s"));
    yAxis.tickSize(-size * n)
            .tickFormat(d3.format("s"));

    var svg = d3.select("body")
            .append("svg")
            .attr("width", size * n + 2 * padding)
            .attr("height", size * n + 2 * padding)
            .append("g")
            .attr("transform",
                    "translate(" + 2 * padding + "," + padding + ")");

    svg.selectAll(".x.axis")
            .data(genomes)
            .enter()
            .append("g")
            .attr("class", "x axis")
            .attr("transform", function (d, i) {
                return "translate(" + (n - i - 1) * size + ",0)";
            })
            .each(function (d) {
                x.domain(domainByGenome[d]);
                d3.select(this).call(xAxis);
                d3.select(this).append("text")
                        .attr("class", "axis label")
                        .attr("transform", function () {
                            var tmp = padding + (size * n);
                            return "translate(" + size / 2 + "," + tmp + ")";
                        })
                        .style("text-anchor", "middle")
                        .text(d.substring(0, size / 8)); // not to long titels
            });

    svg.selectAll(".y.axis")
            .data(genomes)
            .enter()
            .append("g")
            .attr("class", "y axis")
            .attr("transform", function (d, i) {
                return "translate(0," + i * size + ")";
            })
            .each(function (d) {
                y.domain(domainByGenome[d]);
                d3.select(this).call(yAxis);
                d3.select(this).append("text")
                        .attr("class", "axis label")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0 - 2 * padding)
                        .attr("x", 0 - (size / 2))
                        .attr("dy", "1em")
                        .style("text-anchor", "middle")
                        .text(d.substring(0, size / 8)); // not to long titels
            });

    svg.selectAll(".cell")
            .data(cross(genomes, genomes))
            .enter()
            .append("g")
            .attr("class", "cell")
            .attr("transform", function (d) {
                return "translate(" + (n - d.i - 1) * size
                        + "," + d.j * size + ")";
            })
            .each(plot);

    function plot(p) {
        var cell = d3.select(this);

        // +fehlende Domain x=> scale für x, aus daten ziehen, wenn vorhanden
        x.domain(domainByGenome[p.x]);
        y.domain(domainByGenome[p.y]);

        cell.append("rect")
//                .attr("class", "frame")
                .attr("x", padding / 2)
                .attr("y", padding / 2)
                .attr("width", size - padding)
                .attr("height", size - padding)
                .on("click", function () {
                    // Open new window with the single plot if there are data
                    var array = getNeededData();
                    if (array.length > 0) {
                        var newWindow = window.open("singleview.html", "", "width=900, height=750, margin=50px auto, scrollbars=1");
                        newWindow.document.write("<html><head><link rel='stylesheet' href='css/styles.css' type='text/css'/></head><body></body></html>");
                        newWindowRoot = d3.select(newWindow.document.body);
                        return singleView(array, newWindowRoot);
                    }
                });

        // Gets the data from matrix
        function getNeededData() {
            var tmp = matrix["G" + p.x];
            var array = tmp["G" + p.y];
            return array;
        }

        cell.selectAll("circle")
                .data(function () {
                    // Data for drawing a small single plot
                    var neededData = getNeededData();
//                    // Frame only when data seen
//                    if (neededData.length === 0)
//                        cell.select("rect").classed("frame", false);
                    return neededData;
                })
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return x(d.Start1);
                })
                .attr("cy", function (d) {
                    return y(d.Start2);
                })
                .attr("r", 0.5)
                .style("fill", "blue");

    }

    // Logic to get the genomes into a matrix
    function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (i = - 1; ++i < n; )
            for (j = - 1; ++j < m; )
                c.push({x: a[i], i: i, y: b[j], j: j});
        return c;
    }

    // Draw the single plot with the given data in the given window
    function singleView(dataset, newWindow) {

        // Define everything static needed
        var singleView = newWindow;

        singleView.append("div").attr("id", "text")
                .append("h1")
                .text("Detailed synteny plot of " + dataset[0].Genome1
                        + " and " + dataset[0].Genome2 + ".");
        singleView.select("div#text").append("p")
                .text("These data points represent the position of \n\
homolog genes in the selected genomes.");

        // Divs
        var middle = singleView.append("div").attr("id", "middle");
        middle.append("div").attr("id", "plot");
        var infowindow = middle.append("div").attr("id", "infowindow");

        // Big tooltip
        infowindow.append("ul").attr("id", "outerUl");
        infowindow.select("ul#outerUl")
                .append("li").attr("id", "firstGenome")
                .append("span").attr("class", "value").attr("id", "genome1");
        infowindow.select("li#firstGenome")
                .append("span").attr("class", "key").text("First Genome");
        infowindow.select("li#firstGenome")
                .append("ul").attr("id", "innerUlG1");

        var innerUlG1 = infowindow.select("ul#innerUlG1");
        innerUlG1.append("li").attr("id", "firstGen")
                .append("span").attr("class", "value").attr("id", "gen1");
        infowindow.select("li#firstGen")
                .append("span").attr("class", "key").text("Gen");

        innerUlG1.append("li").attr("id", "firstOrientation")
                .append("span").attr("class", "value")
                .attr("id", "orientation1");
        infowindow.select("li#firstOrientation")
                .append("span").attr("class", "key").text("Orientation");

        innerUlG1.append("li").attr("id", "firstStart")
                .append("span").attr("class", "value").attr("id", "start1");
        infowindow.select("li#firstStart")
                .append("span").attr("class", "key").text("Start position");

        innerUlG1.append("li").attr("id", "firstEnd")
                .append("span").attr("class", "value").attr("id", "end1");
        infowindow.select("li#firstEnd")
                .append("span").attr("class", "key").text("End position");

        innerUlG1.append("li").attr("id", "firstlength")
                .append("span").attr("class", "value").attr("id", "length1");
        infowindow.select("li#firstlength")
                .append("span").attr("class", "key").text("Length");

        infowindow.select("ul#outerUl")
                .append("li").attr("id", "SecondGenome")
                .append("span").attr("class", "value").attr("id", "genome2");
        infowindow.select("li#SecondGenome")
                .append("span").attr("class", "key").text("Second Genome");
        infowindow.select("li#SecondGenome")
                .append("ul").attr("id", "innerUlG2");

        var innerUlG2 = infowindow.select("ul#innerUlG2");
        innerUlG2.append("li").attr("id", "secondGen")
                .append("span").attr("class", "value").attr("id", "gen2");
        infowindow.select("li#secondGen")
                .append("span").attr("class", "key").text("Gen");

        innerUlG2.append("li").attr("id", "secondOrientation")
                .append("span").attr("class", "value")
                .attr("id", "orientation2");
        infowindow.select("li#secondOrientation")
                .append("span").attr("class", "key").text("Orientation");

        innerUlG2.append("li").attr("id", "secondStart")
                .append("span").attr("class", "value").attr("id", "start2");
        infowindow.select("li#secondStart")
                .append("span").attr("class", "key").text("Start position");

        innerUlG2.append("li").attr("id", "secondEnd")
                .append("span").attr("class", "value").attr("id", "end2");
        infowindow.select("li#secondEnd")
                .append("span").attr("class", "key").text("End position");

        innerUlG2.append("li").attr("id", "secondlength")
                .append("span").attr("class", "value").attr("id", "length2");
        infowindow.select("li#secondlength")
                .append("span").attr("class", "key").text("Length");

        infowindow.select("ul#outerUl")
                .append("li").attr("id", "Information")
                .append("span").attr("class", "value").attr("id", "info");
        infowindow.select("li#Information")
                .append("span").attr("class", "key")
                .text("e-Value or something else");

        // Divs
        singleView.append("div").attr("id", "buttons");
        var tableDiv = singleView.append("div").attr("id", "table");

        // Das sind die keys + paar zusätze, manipulieren und selbst
        // erstellen lassen?
        // Table for the saved information
        var table = tableDiv.append("table").attr("id", "table")
                .attr("class", "hidden");
        var tableHeadTr = table.append("thead").append("tr");
        tableHeadTr.append("th").text("1st Genome");
        tableHeadTr.append("th").text("Gen");
        tableHeadTr.append("th").text("Orientation");
        tableHeadTr.append("th").text("Start");
        tableHeadTr.append("th").text("End");
        tableHeadTr.append("th").text("Length");
        tableHeadTr.append("th").text("2nd Genome");
        tableHeadTr.append("th").text("Gen");
        tableHeadTr.append("th").text("Orientation");
        tableHeadTr.append("th").text("Start");
        tableHeadTr.append("th").text("End");
        tableHeadTr.append("th").text("Length");
        tableHeadTr.append("th").text("Info");
        tableHeadTr.append("th").text("Del");
        table.append("tbody");

        // Technical stuff
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
                    return parseInt(d.Start1); // Original scaling [min, max]
                }))
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
                .scaleExtent([1, 100])  // "ZoomInFactor"
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
                        // Use new scale or the maxRadius to get "normal" sized
                        // dots. 
                        if (d3.event.scale > maxRadius)
                            return maxRadius;
                        if (d3.event.scale > 1)
                            return d3.event.scale;
                        // Reset needs the original minRadius.
                        return minRadius;
                    });
        }

        // zoomResetButton
        singleView.select("div#buttons")
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

        // Outer SVG
        var svg = singleView.select("div#plot")
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
                .attr("transform", "translate(" + (width / 2) + " ,"
                        + (height - 10 + margin.bottom) + ")")
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
                .attr("cx", function (d) {
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
                .attr("class", "single") // class for singleview dots
                .on("contextmenu", function (d, i) {  // Rightclick
                    d3.event.preventDefault();  // Disable normal mennu
                    var popup = singleView.append("ul")
                            .attr("id", "context-menu")
                            .style('position', 'absolute')
                            .style("left", (d3.event.pageX) + "px") // xPos
                            .style("top", (d3.event.pageY) + "px"); // yPos

                    popup.append("li").html("<a href='" + dbGenome + d.Genome1
                            + "' target='_blank'>"
                            + d.Genome1 + "</a>");
                    popup.append("li")
                            .html("<a href='" + dbGen + d.Gen1
                                    + "[sym]' target='_blank'>"
                                    + d.Gen1 + "</a>");
                    popup.append("li").html("<a href='" + dbGenome + d.Genome2
                            + "' target='_blank'>"
                            + d.Genome2 + "</a>");
                    popup.append("li")
                            .html("<a href='" + dbGen + d.Gen2
                                    + "[sym]' target='_blank'>"
                                    + d.Gen2 + "</a>");

                    popup.on("mouseleave", function () {
                        popup.remove();
                    });
                })
                .on("mouseover", function (d) {  // hover
                    d3.select(this).classed("hover", true); // change color
                    this.parentNode.appendChild(this); // redraw/foreground

                    infowindow.transition()
                            .duration(200)
                            .style("opacity", 0.9)
                            .style('display', 'inline-block');

                    infowindow.select("#genome1").text(d.Genome1);
                    infowindow.select("#gen1").text(d.Gen1);
                    infowindow.select("#orientation1")
                            .text(getOrientation(d.Start1, d.End1));
                    infowindow.select("#start1").text(d3.format(",")(d.Start1));
                    infowindow.select("#end1").text(d3.format(",")(d.End1));
                    infowindow.select("#length1")
                            .text(d3.format(",")(Math.abs(d.End1 - d.Start1)));
                    infowindow.select("#genome2").text(d.Genome2);
                    infowindow.select("#gen2").text(d.Gen2);
                    infowindow.select("#orientation2")
                            .text(getOrientation(d.Start2, d.End2));
                    infowindow.select("#start2").text(d3.format(",")(d.Start2));
                    infowindow.select("#end2").text(d3.format(",")(d.End2));
                    infowindow.select("#length2")
                            .text(d3.format(",")(Math.abs(d.End2 - d.Start2)));
                    infowindow.select("#info").text(d.Info);
                })
                .on("click", function (d, i) { // mouseclick
                    if (d3.select(this).attr("class").indexOf("saved") !== -1) {
                        removeSaved(i); // remove if again clicked on spot
                    }
                    else {
                        // Mark the spot as clicked
                        d3.select(this).classed("saved", true);

                        // remove newAdded
                        if (tempRow !== null)
                            tempRow.classed("newAdded", false);

                        // make/get row
                        var row = singleView.select("table#table")
                                .classed("hidden", false) // table visible
                                .select("tbody")
                                .append("tr")
                                .attr("id", "ID" + i)
                                .classed("newAdded", true);

                        tempRow = row; // save it for later to remove mark

                        // add stuff to the table
                        row.append("td").html("<a href='" + dbGenome + d.Genome1
                                + "' target='_blank'>"
                                + d.Genome1 + "</a>");
                        row.append("td").html("<a href='" + dbGen + d.Gen1
                                + "[sym]' target='_blank'>"
                                + d.Gen1 + "</a>");
                        row.append("td").text(getOrientation(d.Start1, d.End1));
                        row.append("td").text(d3.format(",")(d.Start1));
                        row.append("td").text(d3.format(",")(d.End1));
                        row.append("td").text(d3.format(",")
                                (Math.abs(d.End1 - d.Start1)));

                        row.append("td").html("<a href='" + dbGenome + d.Genome2
                                + "' target='_blank'>"
                                + d.Genome2 + "</a>");
                        row.append("td").html("<a href='" + dbGen + d.Gen2
                                + "[sym]' target='_blank'>"
                                + d.Gen2 + "</a>");
                        row.append("td").text(getOrientation(d.Start2, d.End2));
                        row.append("td").text(d3.format(",")(d.Start2));
                        row.append("td").text(d3.format(",")(d.End2));
                        row.append("td").text(d3.format(",")
                                (Math.abs(d.End2 - d.Start2)));
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
                .on("mouseout", function (d) { // mouse leaves spot
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

        // Get and remove row und mark
        function removeSaved(i) {
            singleView.select("tr#ID" + i).remove();
            singleView.select("circle#ID" + i).classed("saved", false);
            // Hide table
            if (singleView.select("circle.saved")[0][0] === null)
                singleView.select("table#table").classed("hidden", true);
        }

        // Change every link to target=_blank to open in new window/tab
        singleView.selectAll("a").attr("target", "_blank");
    }
});
