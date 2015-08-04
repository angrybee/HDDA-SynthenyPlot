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
 * // @param {Array} dataset
 * @returns {Array} scatterplot;
 * 
 * TBD:
 * Building new structure of gendata.
 * Pairwise comparison for homologouse genes.
 *  
 */
function findHomologies() {
    var scatterplot;
    var selectedGenomes = getSelectedItems("genomeSelect");
    if (selectedGenomes.length < 2) {
        console.warn("Mindestens 2 Genome auswählen!"); // TBD  
    }
    else {
        console.log(selectedGenomes);
    }
    return scatterplot;
}


/* Fetches selections from inputs and stores the value-attributes in an array.
 * 
 * @param {String} Name of inputset
 * @returns {Array} selectedItems
 */
function getSelectedItems(selection) {
    var selectedItems = [];
    var selectionList = document.getElementsByName(selection);
    for (var i = 0; i < selectionList.length; i++) {
        if (selectionList[i].checked) {
            selectedItems.push(selectionList[i].value);
        }
    }
    return selectedItems;
}