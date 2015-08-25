/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* Creating variables for defining the scatterplot on the canvas */

var w = 940;
h = 300;
pad = 20;
left_pad = 100;
Data_url = '../2genomes.json';

/* Creating a svg */

var svg = d3.select("#scatterzoom")
        .append("svg")
        .attr("width", w)
        .attr("height", h);


/* Set up axes for later use. Domain needs to be dynamic, do not forget! */

var x = d3.scale.linear().domain([0, 23]).range([left_pad, w - pad]),
        y = d3.scale.linear().domain([0, 6]).range([pad, h - pad * 2]);

/* Label axes for better recognition. Labels need to be dynamic. */

var xAxis = d3.svg.axis().scale(x).orient("Genome 1"),
        yAxis = d3.svg.axis().scale(y).orient("Genome 2");


/* Transform axes to fit labels to axis sizes */

svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (h - pad) + ")")
        .call(xAxis);

svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (left_pad - pad) + ", 0)")
        .call(yAxis);

/* Set up orientation of Axes */

var xAxis = d3.svg.axis().scale(x).orient("bottom");
var xAxis = d3.svg.axis().scale(y).orient("left");


/* Tell the user that data is loading atm */

svg.append("text")
        .attr("class", "loading")
        .text("Loading ...")
        .attr("x", function () {
            return w / 2;
        })
        .attr("y", function () {
            return h / 2 - 5;
        });

/* Loading Data */

d3.json(Data_url, function (scatterplot_data) {


    /* Scale circle radius */

    var r = d3.scale.linear()
            .domain(0, 5)
            .range([0, 12]);

    /* Tell d3 to load in data */

    svg.selectAll(".loading").remove();

    svg.selectAll("circle")
            .data(scatterplot_data)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", 5)
            .attr("cy", 5)
            .transition()
            .duration("800")
            .attr("r");
});