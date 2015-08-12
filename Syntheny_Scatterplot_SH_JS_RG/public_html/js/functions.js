/*
 * Collection of functions used in the project.
 * File will be loaded in <head> of the "index.html".
 */

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