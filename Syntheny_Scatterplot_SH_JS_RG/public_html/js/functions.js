/*
 * Collection of functions used in the project.
 * File will be loaded in <head> of the "index.html".
 */


/* Reads the given JSON file and pushes it to the given array.
 * Needed if more genomes are uploaded to keep the older ones.
 * 
 * @param {Array} dataset
 * @param {JSON-File} json
 * @returns {Array}
 */
function readJSON(dataset, json) {
    // dataset.push(new_arraypart);
    return dataset;
}


/* Fetches selection of genomes from inputs "genomeSelect".
 * 
 * @param {Array} dataset
 * @returns {Array} scatterplot;
 * 
 * TBD:
 * Saves each checked input. Pairwise comparison for homologouse genes.
 *  
 * Known Bugs:
 * First click deletes, second works, same behaviour after editing selection
 * Check the form/inputs/buttons
 */
function findHomologies(dataset) {
    var scatterplot = [];
    var genomeList = document.getElementsByName("genomeSelect");
    for (var i = 0; i < genomeList.length; i++) {
        if (genomeList[i].checked) {
            console.log(genomeList[i].value);
        }
        else {
            console.log("not checked");
        }
    }
    return scatterplot;
}