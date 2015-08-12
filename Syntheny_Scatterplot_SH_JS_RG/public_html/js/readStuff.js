d3.json("files/2genomes.json", function (error, dataset) {
    if (error)
        return console.warn(error); // TBD
    // speaking variable names for the both parts of dataset
    var genomes = dataset[0];
    var homology = dataset[1];
    
    console.log(genomes);
    console.log(homology);
    
    // Scatterplot
    
});