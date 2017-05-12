//function draw_graphs(){
$.getJSON("/moviesdata/genres", function(data) {

    Number.prototype.formatMoney = function(c, d, t) {
        var n = this,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;
        return '$' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    function AddXAxis(chartToUpdate, displayText) {
        chartToUpdate.svg()
            .append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", chartToUpdate.width() / 2)
            .attr("y", chartToUpdate.height() + 3.5)
            .text(displayText);
    }



    // var typeChart = dc.rowChart("#dc-type-chart");
    // var monthChart = dc.barChart("#dc-month-chart");
    // var scatterPlot = dc.scatterPlot("#dc-scatter-plot");
    var cf = crossfilter(data);

    var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var year = ["1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", ];
    var ratings = [" ", "G", "NC-17", "NOT RATED", "PG", "PG-13", "R", "TV-14", "UNRATED", ""]
    // Assuming "dim" is our dimension

    //var total = cf.groupAll();
    var dataSet = data;
    var dateFormat = d3.time.format("%m/%d/%Y");
    dataSet.forEach(function(d) {
        // console.log(d.Released);
        date = new Date(d.Released);
        // 
        d.Released = d3.time.format("%m/%d/%Y")(date);

    });


    var dateReleased = cf.dimension(function(d) {
        return d.Released;
    });
    // console.log(dateReleased.group().top(3));
    var genresDimension = cf.dimension(function(d) {
        var a = d.Genre.split("[");
        // console.log(a[1]);
        var b = a[1].split("]");
        var c = b[0].split(",");

        var arrayLength = c.length;
        for (var i = 0; i < arrayLength; i++) {
            c[i] = c[i].replace(/\s/g, '');
        }
        return c;
    }, true);




    var dateReleased = cf.dimension(function(d) {
        return d.Released;
    });
    var yearReleased = cf.dimension(function(d) {
        return d.Year;
    });
    var imdbRating = cf.dimension(function(d) {
        return d.imdbRating;
    });
    var tomatoRating = cf.dimension(function(d) {
        return d.tomatoRating;
    });
    var pgRating = cf.dimension(function(d) {
        return d.Rated;
    });
    var sentimentPolarity = cf.dimension(function(d) {
        return d.sentiment_polarity;
    });
    var Runtime = cf.dimension(function(d) {
        return d.Runtime;
    });
    var tomatoImage = cf.dimension(function(d) {
        return d.tomatoImage;
    });
    var boxOffice = cf.dimension(function(d) {
        return d.BoxOffice;
    })

    var moviesByDate = dateReleased.group();
    var moviesByYear = yearReleased.group();
    var moviesByimdb = imdbRating.group();
    var moviesByCensorRating = pgRating.group();
    var moviesByPolarity = sentimentPolarity.group();
    var moviesByRuntime = Runtime.group();
    var moviesByBoxOffice = boxOffice.group();
    var genreGroup = genresDimension.group();
    var moviesBytomatoImage = tomatoImage.group();



    //GENRE BOX OFFICE collections
    var genreGroupBO = genresDimension.group();
    var genreGroupCount = genreGroup.reduceCount().all();

    var totalBOGenre = genreGroupBO.reduceSum(function(d) {
        return d.BoxOffice;
    });



    $.each(totalBOGenre.all(), function(index, value) {

        $.each(genreGroupCount, function(i, val) {
            if (val.key == value.key) {
                value.value = value.value / val.value;
            }
        });
    });
    // console.log(totalBOGenre.all());


    //Yearly BOX OFFICE collections
    var yearGroupBO = yearReleased.group();
    var yearGroupCount = moviesByYear.reduceCount().all();

    var totalBOYear = yearGroupBO.reduceSum(function(d) {
        return d.BoxOffice;
    });



    $.each(totalBOYear.all(), function(index, value) {

        $.each(yearGroupCount, function(i, val) {
            if (val.key == value.key) {
                value.value = value.value / val.value;
            }
        });
    });


    //Censor RATING BOX OFFICE COLLECTIONS
    var ratingGroupBO = pgRating.group();
    var ratingGroupCount = moviesByCensorRating.reduceCount().all();

    var totalBORating = ratingGroupBO.reduceSum(function(d) {
        return d.BoxOffice;
    });



    $.each(totalBORating.all(), function(index, value) {

        $.each(ratingGroupCount, function(i, val) {
            if (val.key == value.key) {
                value.value = value.value / val.value;
            }
        });
    });


//Average imdb Rating
    var imdbAvgGroup = imdbRating.group();
    var genreRatingCount = moviesByimdb.reduceCount().all();

    var totalRatingGenre = imdbAvgGroup.reduceSum(function(d) {
        return d.BoxOffice;
    });



    $.each(totalRatingGenre.all(), function(index, value) {

        $.each(genreRatingCount, function(i, val) {
            if (val.key == value.key) {
                value.value = value.value / 1000*val.value;

            }
        });
    });


    // console.log(totalBORating.all());

    var netTotalBoxOffice = cf.groupAll().reduceSum(function(d) {
        return d.BoxOffice;
    });




    var dateChart = dc.lineChart("#date-chart");
    var gradeLevelChart = dc.barChart("#grade-chart");
    var resourceTypeChart = dc.lineChart("#resource-chart");
    var fundingStatusChart = dc.pieChart("#funding-chart");
    var povertyLevelChart = dc.heatMap("#poverty-chart");
    var totalProjects = dc.numberDisplay("#total-projects");
    var netDonations = dc.numberDisplay("#net-donations");
    var stateDonations = dc.barChart("#state-donations");

    var allTotal = cf.groupAll();
    //selector
    selectField = dc.selectMenu('#menuselect')
        .dimension(genresDimension)
        .group(genreGroup);

    dc.dataCount("#row-selection")
        .dimension(cf)
        .group(allTotal);

    var minDate = yearReleased.bottom(1)[0].Year;
    var maxDate = yearReleased.top(1)[0].Year;

    var minRuntime = Runtime.bottom(1)[0].Runtime;
    var maxRuntime = Runtime.top(1)[0].Runtime;
    console.log(allTotal);
    totalProjects
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d) {
            return d;
        })
        .group(allTotal);

    netDonations
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d) {
            return d;
        })
        .group(netTotalBoxOffice)
        .formatNumber(d3.format(".3s"));

    dateChart
        .width(600)
        .height(220)
        .margins({
            top: 10,
            right: 50,
            bottom: 30,
            left: 50
        })
        .dimension(yearReleased)
        .group(moviesByYear)
        .renderArea(true)
        .transitionDuration(500)
        .colors("#ae0001")
        // .x(d3.time.scale().domain([minDate, maxDate]))
        // .x(d3.scale.linear().domain([0,20]))
        .x(d3.scale.linear().domain([minDate, maxDate]))
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .xAxisLabel("Year")
        .yAxis().ticks(6);



console.log(moviesByimdb.top(3));


 resourceTypeChart
    // .width(768)
    .height(220)
    .x(d3.scale.linear().domain([0,10]))
    // .interpolate('step-before')
    // .renderArea(true)
    // .y(d3.scale.linear().domain([rMin, rMax]))
    .brushOn(false)
    .renderDataPoints(true)
    // .clipPadding(10)
    .xAxisLabel("imdb Rating")
    .yAxisLabel("Number of Movies")
    .dimension(yearReleased)
    .group(moviesByimdb);
    

    // resourceTypeChart
    //     //.width(300)
    //     .height(220)
    //     .dimension(pgRating)
    //     .group(moviesByCensorRating)
    //     .elasticX(true)
    //     .xAxis().ticks(5);

    var heatDimension = cf.dimension(function(d) {
        return [d.Year, d.Rated];
    });
    var postCount = heatDimension.group().reduceCount(function(d) {
        return d.Year
    });
    povertyLevelChart
        //.width(300)
        .width(38 * 22.8 + 80)
        .height(35 * 5 + 40)
        .dimension(heatDimension)
        .group(postCount)
        .legend(dc.legend())
        .keyAccessor(function(d) {
            return d.key[0];
        })
        .valueAccessor(function(d) {
            return d.key[1];
        })
        .colorAccessor(function(d) {
            if (d.value > 3) return 3 + (d.value - 3) / 9;
            return d.value;
        })
        .title(function(d) {
            return "Rating:   " + d.key[1] + "\n" +
                "Year:  " + d.key[0] + "\n" +
                "Count:  " + d.value + "\n";
        })
        .colors(["#adbad5","#8b9dc3","#7b94c9","#3b5998","#005b96","#355088","#2d4373","#263961"])
        // .colors(["#b22323","#ff3232","#ff4c4c","#ff6666","#ff9999","#ffcccc","#ffdbdb"])
        //.colors(["#E6E6FA", "#D8BFD8", "#DDA0DD", "#BA55D3", "#9370DB", "#8A2BE2", "#9400D3", "#8B008B", "#4B0082"])
        .calculateColorDomain();


    gradeLevelChart
        //.width(300)
        .width(950)
        .height(400)
        .dimension(Runtime)
        .group(moviesByRuntime)
        // .margins({top: 10, right: 10, bottom: 20, left: 40})
        .transitionDuration(500)
        .centerBar(true)
        .gap(1)
        .x(d3.scale.linear().domain([minRuntime, maxRuntime]))
        .elasticY(true)
        .xAxis().tickFormat(function(v) {
            return v;
        });


    // .xAxis().ticks(4);


    fundingStatusChart
      .height(220)
      //.width(350)
      .radius(90)
      .innerRadius(40)
      .transitionDuration(1000)
      .dimension(tomatoImage)
      .group(moviesBytomatoImage);

    stateDonations
        .width(950)
        .height(220)
        .transitionDuration(1000)
        .dimension(genresDimension)
        .group(genreGroup)
        .margins({
            top: 10,
            right: 50,
            bottom: 30,
            left: 50
        })
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(genresDimension))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d) {
            return d.value;
        })
        .yAxis().tickFormat(d3.format("s"));




    

    dc.renderAll();
    // AddXAxis(typeChart, "This is the x-axis!");
    // AddXAxis(monthChart, "Year");

});
// }