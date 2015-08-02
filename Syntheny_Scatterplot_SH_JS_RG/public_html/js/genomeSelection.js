/* 
 * Creates a list with each uploaded genome. Checkboxes allow to select them for
 * comparison.
 * Buttons: Reset, Submit, Upload
 * 
 */

/*   
 var dataset = [];
 window.onload = function () { // on start and new upload
 dataset = readJSON(dataset);
 }; 
 */

d3.json("files/example_5.json", function (dataset) {
    var i = 0; // id/value genome
    var genomeSelect = d3.select("div#list")
            .append("form")
            .append("fieldset");
    // Building inputelements
    genomeSelect.selectAll("p")
            .data(dataset)
            .enter()
            .append("p")
            .append("label")
            .append("input")
            .attr("type", "checkbox")
            .attr("name", "genomeSelect")
            .attr("value", function () {
                return i++;
            });
    // Text of label after inputelement
    genomeSelect.selectAll("label")
            .append("text")
            .text(function (d) {
                return d.Name;
            });
    // Setting Buttons
    genomeSelect.append("button")
            .attr("type", "reset")
            .text("Reset");
    genomeSelect.append("button")
            .attr("type", "submit")
            .attr("onclick", "findHomologies()")
            .text("Submit");
    genomeSelect.append("button")
            .attr("type", "submit")
            .attr("disabled", "true")
            // .attr("onclick", "uploadGenome()")
            // .attr("formtarget", "_blank")
            .text("Upload");
});

