/* 
 * ToDo:
 * individuelle domaingrößen und die dann mitgeben/speichern
 * workaround mit fehlenden daten lösen
 * klicken geht nur auf freien flächen
 * 
 * Anpassen und vereinheitlichen
 * 
 */
/* global d3 */



//var width = 600;
        var size = 100,
        padding = 25.5;

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

    d3.select("body").append("div").attr("id", "overview")
            .style("display", "flex");
    d3.select("body").append("div").attr("id", "singleview")
            .style("display", "flex");

    var matrix = {};

    data.forEach(function (d) {
        var value = {};
        var array = [];
        // Get current array if exists
        if (typeof matrix["G" + d.Genome1] !== "undefined") {
            value = matrix["G" + d.Genome1];
            if (typeof value["G" + d.Genome2] !== "undefined") {
                array = value["G" + d.Genome2];
                array.push(d);
            }
            else {
                array.push(d);
                value["G" + d.Genome2] = array;
            }
            value["G" + d.Genome2] = array;
            matrix["G" + d.Genome1] = value;
        }
        else {
            array.push(d);
            value["G" + d.Genome2] = array;
            matrix["G" + d.Genome1] = value;
        }
    });

    // dirty workaround
    matrix.G2.G1 = [];
    matrix.G3.G1 = [];
    matrix.G3.G2 = [];
    matrix.G4.G1 = [];
    matrix.G4.G2 = [];
    matrix.G4.G3 = [];
    matrix.G5.G1 = [];
    matrix.G5.G2 = [];
    matrix.G5.G3 = [];
    matrix.G5.G4 = [];
    //  console.log(matrix);

    var domainByTrait = {};
    traits = ["1", "2", "3", "4", "5"];  // bekommen wir aus erstem teil der struktur
    n = traits.length; // numer of data // 5

    // selbe domain für alle erstmal
    traits.forEach(function (trait) {
        domainByTrait[trait] = d3.extent(data, function (d) {
            return parseInt(d.Start1);
        });
        //     console.log(domainByTrait); // Grenzen holen für plot für jede daten über gesamte menge
    });

    // gitternetzlinien
    xAxis.tickSize(size * n)
            .tickFormat(d3.format("s"));
    yAxis.tickSize(-size * n)
            .tickFormat(d3.format("s"));

    var svg = d3.select("div#overview")
            .append("svg")
            .attr("width", size * n + padding)
            .attr("height", size * n + padding)
            .append("g")
            .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    svg.selectAll(".x.axis")
            .data(traits)
            .enter()
            .append("g")
            .attr("class", "x axis")
            .attr("transform", function (d, i) {
                return "translate(" + (n - i - 1) * size + ",0)";
            })
            .each(function (d) {
                x.domain(domainByTrait[d]);
                d3.select(this).call(xAxis);
            });

    svg.selectAll(".y.axis")
            .data(traits)
            .enter().append("g")
            .attr("class", "y axis")
            .attr("transform", function (d, i) {
                return "translate(0," + i * size + ")";
            })
            .each(function (d) {
                y.domain(domainByTrait[d]);
                d3.select(this).call(yAxis);
            });

    var cell = svg.selectAll(".cell")
            .data(cross(traits, traits))
            .enter()
            .append("g")
            .attr("class", "cell")
            .attr("transform", function (d) {
                return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")";
            })
            .each(plot);

    // Titles for the diagonal.
    cell.filter(function (d) {
        return d.i === d.j;
    }).append("text")
            .attr("x", padding)
            .attr("y", padding)
            .attr("dy", ".71em")
            .text(function (d) {
                return d.x;
            });

    function plot(p) {
        var cell = d3.select(this);

        // +fehlende Domain x=> scale für x
        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);

        cell
                /*         .append("a")
                 .attr("xlink:href", function () {
                 return "singleview.html?G1=" + p.x + "&G2=" + p.y;
                 })
                 .attr("target", "_blank") */
                .append("rect")
                .attr("class", "frame")
                .attr("x", padding / 2)
                .attr("y", padding / 2)
                .attr("width", size - padding)
                .attr("height", size - padding)
                .on("click", function () {
                    var array = getNeededData();
                    if (array.length > 0) {
                        return singleView(array);
                    }
                });


        function getNeededData() {
            var tmp = matrix["G" + p.x];
            var array = tmp["G" + p.y];
            return array;
        }
        // Hier is der Wurm ab 2.1, weil keine Daten mehr vorhanden
        cell.selectAll("circle")
                .data(getNeededData()) // data, die für genomX gegen genomY plot notwendig
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return x(d.Start1);
                })
                .attr("cy", function (d) {
                    return y(d.Start2);
                })
                .attr("r", 1)
                .style("fill", "blue");

    }

    function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (i = - 1; ++i < n; )
            for (j = - 1; ++j < m; )
                c.push({x: a[i], i: i, y: b[j], j: j});
        //       console.log(c);
        return c;
    }
    d3.select(this.frameElement).style("height", size * n + padding + 20 + "px");


    function singleView(dataset) {
        d3.select("div#singleview").select("svg").remove();
//        console.log(dataset);
        // Scatterplot, the technical data
        var margin = {top: 10, right: 10, bottom: 45, left: 30};
        var width = 500 - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

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

        // Outer SVG
        var svg = d3.select("div#singleview")
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
                .on("mouseover", function (d) {
                    d3.select(this).classed("hover", true); // bunt
                    this.parentNode.appendChild(this); // Redraw

                })
                .on("click", function (d, i) {
                    if (d3.select(this).attr("class").indexOf("saved") !== -1) {
                        removeSaved(i);
                    }
                    else {
                        // Mark the spot as clicked
                        d3.select(this).classed("saved", true);

                    }

                })
    /*            .on("mouseout", function (d) {
                    infowindow.transition()
                            .duration(500)
                            .style("opacity", 0);
                    d3.select(this).classed("hover", false); // normal
                })*/;

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
    }

});