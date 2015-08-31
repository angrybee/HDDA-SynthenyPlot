/* global d3, _, Infinity, tmpArray*/

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

d3.json("files/Arabidopsis.json", function (error, bigdata) {
    if (error)
        return console.warn(error);

    var genome = bigdata[0].genomes;
    var homology = bigdata[1].homology;

    var genomes = d3.keys(genome);  // List of genomes used
    var n = genomes.length; // numer of data

    var domainByGenome = {};
    genomes.forEach(function (d) {
        var tmp = genome[d];
        tmp = tmp["genes"];  // List of genes of each genome/d

        var tmpArray = [];
        tmpArray[0] = +Infinity;
        tmpArray[1] = -Infinity;

        // Workaround because d3.extent needs an array :/
        _.each(tmp, function (value) {
            if (parseInt(value.start) > tmpArray[1])
                tmpArray[1] = parseInt(value.start);
            if (parseInt(value.start) < tmpArray[0])
                tmpArray[0] = parseInt(value.start);
        });
        domainByGenome[d] = tmpArray;
    });

    var matrix = {}; // For homologydata, each comparison in single array

    // Init the matrix, workaround because of empty cells/data
    // Key with prefix to make sure it starts with a letter
    for (var i = 0; i < n; i++) {
        matrix["G" + genomes[i]] = {};
        var values = matrix["G" + genomes[i]];
        for (var j = 0; j < n; j++) {
            values["G" + genomes[j]] = [];
        }
        matrix["G" + genomes[i]] = values;
    }

    homology.forEach(function (d) {
        var values = matrix["G" + d.genome1];
        var array = values["G" + d.genome2];
        array.push(d);
        values["G" + d.genome2] = array;
        matrix["G" + d.genome1] = values;
    });

    // Grid
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
                // Outer xAxis label
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
                // Outer yAxis label
                d3.select(this).append("text")
                        .attr("class", "axis label")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0 - 2 * padding)
                        .attr("x", 0 - (size / 2))
                        .attr("dy", "1em")
                        .style("text-anchor", "middle")
                        // Name of genome
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

        // Add the individual domain
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
                        var newWindow = window.open("singleview.html",
                                "", "width=900, height=750, margin=50px auto, scrollbars=1");
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
                .attr("class", "overview")
                .attr("cx", function (d) {
                    return x(genome[d.genome1].genes[d.gen1].start);
                })
                .attr("cy", function (d) {
                    return y(genome[d.genome2].genes[d.gen2].start);
                })
                .attr("r", 0.5);
    }

    // Logic to get the genomes into a plotmatrix
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
                .text("Detailed synteny plot of " + dataset[0].genome1
                        + " and " + dataset[0].genome2 + ".");
        singleView.select("div#text").append("p")
                .text("These data points represent the position of \n\
homolog genes in the selected genomes.");

        // Divs
        var middle = singleView.append("div").attr("id", "middle");
        middle.append("div").attr("id", "plot");
        var infowindow = middle.append("div").attr("id", "infowindow");

        // Big tooltip/infowindow
        var info = [
            ["genome1", "First Genome"],
            ["genome2", "Second Genome"],
            ["info", "e-Value or something else"]
        ];
        var infoDetails = [
            ["gen", "Gen"],
            ["orientation", "Orientation"],
            ["start", "Start"],
            ["end", "End"],
            ["length", "Length"]
        ];

        var m = infoDetails.length;

        infowindow.append("ul").attr("id", "outerUl").selectAll("li")
                .data(info).enter()
                .append("li")
                .attr("class", function (d, i) {
                    if (i <= 1)
                        return "data";
                })
                .selectAll("span")
                .data(function (d) {
                    return d;
                }).enter()
                .append("span")
                .attr("class", function (d, i) {
                    if (i === 1)
                        return "key";
                    return "value";
                })
                .attr("id", function (d, i) {
                    if (i === 0)
                        return d;
                })
                .text(function (d, i) {
                    if (i === 1)
                        return d;
                });

        var j = 0; // where am I?

        infowindow.selectAll("li.data").append("ul").selectAll("li")
                .data(infoDetails)
                .enter()
                .append("li")
                .selectAll("span")
                .data(function (d) {
                    return d;
                }).enter()
                .append("span")
                .attr("class", function (d, i) {
                    if (i === 1)
                        return "key";
                    return "value";
                })
                .attr("id", function (d, i) {
                    // where am I?
                    var k = ~~(j / (2 * m)) + 1;
                    j++;
                    if (i === 0)
                        return d + k;
                })
                .text(function (d, i) {
                    if (i === 1)
                        return d;
                });

        // Divs
        singleView.append("div").attr("id", "buttons");
        var tableDiv = singleView.append("div").attr("id", "table");

        // Table for the saved information
        var tableHead = ["1st Genome", "Gen", "Orientation", "Start", "End", "Length",
            "2nd Genome", "Gen", "Orientation", "Start", "End", "Length",
            "Info", "Del"];
        var table = tableDiv.append("table").attr("id", "table").classed("hidden", true);
        var tableHeadTr = table.append("thead").append("tr");
        tableHeadTr.selectAll("th")
                .data(tableHead)
                .enter()
                .append("th").text(function (d) {
            return d;
        });
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
                .domain(domainByGenome[dataset[0].genome1]) // Original
                .range([0, width]); // New scaling [min, max]

        // Scaling yAxis
        var yScale = d3.scale.linear()
                .domain(domainByGenome[dataset[0].genome2]) // Original
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
                .scaleExtent([0.9, 100])  // "ZoomInFactor"
                .on("zoom", zoomed);

        // Zoomfunction, zoomes axis and dots
        function zoomed() {
            svg.select(".x.axis").call(xAxis);
            svg.select(".y.axis").call(yAxis);
            svg.selectAll("circle")
                    .attr("class", "single") // class for singleview dots
                    .attr("cx", function (d) {
                        return xScale(genome[d.genome1].genes[d.gen1].start);
                    })
                    .attr("cy", function (d) {
                        return yScale(genome[d.genome2].genes[d.gen2].start);
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
        // Add the label for the xAxis
        svg.append("text")
                .attr("class", "axis label")
                .attr("transform", "translate(" + (width / 2) + " ,"
                        + (height - 10 + margin.bottom) + ")")
                .style("text-anchor", "middle")
                .text(dataset[0].genome1);

        // Group the yAxis
        svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(0,0)")
                .call(yAxis);
        // Add the label for the yAxis
        svg.append("text")
                .attr("class", "axis label")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(dataset[0].genome2);

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
                    return xScale(genome[d.genome1].genes[d.gen1].start);
                })
                .attr("cy", function (d) {
                    // scaling the values to yAxis
                    return yScale(genome[d.genome2].genes[d.gen2].start);
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

                    popup.append("li")
                            .attr("id", "first")
                            .append("span").attr("class", "value")
                            .html("<a href='" + dbGenome + d.genome1
                                    + "' target='_blank'>"
                                    + d.genome1 + "</a>");
                    popup.select("li#first")
                            .append("span")
                            .attr("class", "key").text("First genome");
                    popup.select("li#first")
                            .append("ul")
                            .append("li")
                            .append("span").attr("class", "value")
                            .html("<a href='" + dbGen + d.gen1
                                    + "[sym]' target='_blank'>"
                                    + d.gen1 + "</a>");

                    popup.append("li")
                            .attr("id", "second")
                            .append("span").attr("class", "value")
                            .html("<a href='" + dbGenome
                                    + d.genome2 + "' target='_blank'>"
                                    + d.genome2 + "</a>");
                    popup.select("li#second")
                            .append("span")
                            .attr("class", "key").text("Second genome");
                    popup.select("li#second")
                            .append("ul")
                            .append("li")
                            .append("span").attr("class", "value")
                            .html("<a href='" + dbGen + d.gen2
                                    + "[sym]' target='_blank'>"
                                    + d.gen2 + "</a>");

                    popup.on("mouseleave", function () {
                        popup.remove();
                    });
                })
                .on("mouseover", function (d) {  // hover
                    d3.select(this).classed("hover", true); // change color
                    this.parentNode.appendChild(this); // redraw/foreground

                    infowindow.transition()
                            .duration(200)
                            .style("opacity", 0.7)
                            .style('display', 'inline-block');

                    infowindow.select("#genome1").text(d.genome1);
                    infowindow.select("#gen1").text(d.gen1);
                    infowindow.select("#orientation1")
                            .text(getOrientation(
                                    genome[d.genome1].genes[d.gen1].start,
                                    genome[d.genome1].genes[d.gen1].end));
                    infowindow.select("#start1")
                            .text(d3.format(",")
                                    (genome[d.genome1].genes[d.gen1].start));
                    infowindow.select("#end1")
                            .text(d3.format(",")
                                    (genome[d.genome1].genes[d.gen1].end));
                    infowindow.select("#length1")
                            .text(d3.format(",")(Math.abs(
                                    genome[d.genome1].genes[d.gen1].end -
                                    genome[d.genome1].genes[d.gen1].start)));
                    infowindow.select("#genome2").text(d.genome2);
                    infowindow.select("#gen2").text(d.gen2);
                    infowindow.select("#orientation2")
                            .text(getOrientation(
                                    genome[d.genome2].genes[d.gen2].start,
                                    genome[d.genome2].genes[d.gen2].end));
                    infowindow.select("#start2")
                            .text(d3.format(",")
                                    (genome[d.genome2].genes[d.gen2].start));
                    infowindow.select("#end2")
                            .text(d3.format(",")
                                    (genome[d.genome2].genes[d.gen2].end));
                    infowindow.select("#length2")
                            .text(d3.format(",")(Math.abs(
                                    genome[d.genome2].genes[d.gen2].end -
                                    genome[d.genome2].genes[d.gen2].start)));
                    infowindow.select("#info").text(d.info);
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
                        row.append("td")
                                .html("<a href='" + dbGenome + d.genome1
                                        + "' target='_blank'>"
                                        + d.genome1 + "</a>");
                        row.append("td")
                                .html("<a href='" + dbGen + d.gen1
                                        + "[sym]' target='_blank'>"
                                        + d.gen1 + "</a>");
                        row.append("td")
                                .text(getOrientation(
                                        genome[d.genome1].genes[d.gen1].start,
                                        genome[d.genome1].genes[d.gen1].end));
                        row.append("td")
                                .text(d3.format(",")
                                        (genome[d.genome1].genes[d.gen1].start));
                        row.append("td")
                                .text(d3.format(",")
                                        (genome[d.genome1].genes[d.gen1].end));
                        row.append("td")
                                .text(d3.format(",")(Math.abs(
                                        genome[d.genome1].genes[d.gen1].end -
                                        genome[d.genome1].genes[d.gen1].start)));
                        row.append("td")
                                .html("<a href='" + dbGenome + d.genome2
                                        + "' target='_blank'>"
                                        + d.genome2 + "</a>");
                        row.append("td")
                                .html("<a href='" + dbGen + d.gen2
                                        + "[sym]' target='_blank'>"
                                        + d.gen2 + "</a>");
                        row.append("td")
                                .text(getOrientation(
                                        genome[d.genome2].genes[d.gen2].start,
                                        genome[d.genome2].genes[d.gen2].end));
                        row.append("td")
                                .text(d3.format(",")
                                        (genome[d.genome2].genes[d.gen2].start));
                        row.append("td")
                                .text(d3.format(",")
                                        (genome[d.genome2].genes[d.gen2].end));
                        row.append("td")
                                .text(d3.format(",")(Math.abs(
                                        genome[d.genome2].genes[d.gen2].end -
                                        genome[d.genome2].genes[d.gen2].start)));
                        row.append("td").text(d.info);
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
    }
});
