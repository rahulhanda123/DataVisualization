function draw_graphs(){
$.getJSON( "/moviesdata/genres", function( data ) {
  //var items = [];
  //$.each( data, function( key, val ) {
   // items.push( "<li id='" + key + "'>" + val["Title"] +"<br/>"+"actors :"+val["Actors"] 
   // 	+"</li><br/><br/> " );
  //});
  //<div ><img src='"+val["Poster"]+"'></div>
  
  //$( "<ul/>", {
    //"class": "my-new-list",
   // html: items.join( "" )
 // }).appendTo( "body" );
Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return '$'+s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

 function AddXAxis(chartToUpdate, displayText)
{
    chartToUpdate.svg()
                .append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", chartToUpdate.width()/2)
                .attr("y", chartToUpdate.height()+3.5)
                .text(displayText);
}



var typeChart = dc.rowChart("#collection-chart");
var monthChart = dc.barChart("#dc-month-chart");
  // var scatterPlot = dc.scatterPlot("#dc-scatter-plot");
var cf = crossfilter(data);

var year = ["Jan", "Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var month = ["1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016",];
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


var dateReleased = cf.dimension(function(d) { return d.Released; });
// console.log(dateReleased.group().top(3));
var genresDim =  cf.dimension(function(d) {
	var a = d.Genre.split("[");
	// console.log(a[1]);
	var b = a[1].split("]");
	var c = b[0].split(",");

	var arrayLength = c.length;
	for (var i = 0; i < arrayLength; i++) {
    c[i] = c[i].replace(/\s/g, '');
}
	return c;}, true);
//var durationDimension =  cf.dimension(function(d) {return d.Runtime ;});
var genresGrouping = genresDim.group();

var genresGroupAllDim = genresGrouping.all();

genresYearlyDim = cf.dimension

genresGroupingBO = genresDim.group();

var genresGroupSum = genresGroupingBO
            .reduceSum(function (d) {
                return d.BoxOffice;
            });


$.each(genresGroupSum.all(), function(index, value) {
    
     $.each(genresGroupAllDim, function(i, val) {
      if( val.key == value.key){
      value.value = value.value/val.value;
      } 
 });
    //console.log(genresGroupAllDim.get(value.key));
});

typeChart.width(800)
            .height(600)
            .margins({top: 10, right: 10, bottom: 20, left: 10})	            // the values across the x axis
            .group(genresGroupSum)							// the values on the y axis
            .dimension(genresGroupAllDim)
            .transitionDuration(500)
            // .ordinalColors(["#D8BFD8","#BA55D3","#8A2BE2","#8B008B"])
            // .renderlet(function(chart){
            //     var colors =d3.scale.ordinal().domain(genresGroup)
            //         .range(["#D8BFD8","#BA55D3","#8A2BE2","#8B008B"]);
            //         //.range(["#259FC4","#39D0DD","#4EBAE8","#4DC1D1"]);
            //     chart.selectAll('rect.bar').each(function(d){
            //         d3.select(this).attr("style", "fill: " + colors(d.x));
            //     });
            // });
            .title(function (d) {
                return (d.value).formatMoney(2, '.', ',');
                // return d;
            });




var dateDimension = cf.dimension(function(d){
 //console.log(new Date(d.Released));
	return new Date(d.Released);
});

var groupByYear = dateDimension.group(function(date) { return d3.time.format("%Y")(date); });
var grouped = groupByYear.all();
var groupByYear1 = dateDimension.group(function(date) { return d3.time.format("%Y")(date); });
// var datesGrouping = dateDimension.group();

// var datesGroupAllDim = datesGrouping.all();

var dateDimension = cf.dimension(function(d){
 //console.log(new Date(d.Released));
	return new Date(d.Released);
});

var groupByYear = dateDimension.group(function(date) { return d3.time.format("%Y")(date); });


console.log(dateDimension.filter);
var dateGroupSum = groupByYear
            .reduceSum(function (d) {
                return d.BoxOffice;
            });


$.each(dateGroupSum.all(), function(index, value) {
    //console.log(value);
     $.each(groupByYear1.all(), function(i, val) {
      // console.log(val);
      if( val.key == value.key){
      value.value = value.value/val.value;
      } 
 });
    //console.log(genresGroupAllDim.get(value.key));
});            




//var groupedMon = groupByMon.all();
var year=document.getElementById("opt4").value;


// console.log(byDate.filter(year.toString()));
            // / Month bar graph
        monthChart.width(800)
            .height(500)
            .x(d3.scale.ordinal().domain(month))
            .xUnits(dc.units.ordinal)
            .dimension(grouped)
            .margins({top: 10, right: 10, bottom: 20, left: 100})
            .group(dateGroupSum)
            .transitionDuration(500)
            .legend(dc.legend().legendText(function(d){
                // return legendLables[+d.name];
            } ).x(500).y(0).gap(1))
            .renderlet(function(chart){
                var colors =d3.scale.ordinal().domain(month)
                    //.range(["#1abc9c","#2ecc71",
                      //  "#3498db","#9b59b6","#34495e","#16a085","#27ae60",
                        //"#2980b9", "#8e44ad","#2c3e50","#f1c40f","#d35400"]);
                    .range(["#E6E6FA","#D8BFD8","#DDA0DD","#EE82EE","#DA70D6","#BA55D3",
                        "#9370DB","#8A2BE2","#9400D3","#8B008B",
                        "#800080","#4B0082"]);
                chart.selectAll('rect.bar').each(function(d){
                    d3.select(this).attr("style", "fill: " + colors(d.x));
                });
            })
            .yAxisLabel("Average Collection")
            //.xAxisLabel("Month")
            .centerBar(true)
            .gap(1)                    // bar width Keep increasing to get right then back off.
            .elasticY(true);



var scatterDimension    =
            cf.dimension(
            function(d) {
                    return [d.Genre, d.Released];
            });
var scatterGroup = scatterDimension.group();

        // var postT = ["Photo", "Status", "Link", "Video"];


      // scatterPlot.height(300)
      //       .margins({top: 10, right: 10, bottom: 30, left: 50})
      //       .group(scatterGroup)
      //       .x(d3.scale.linear().domain([0, 24]))
      //       .yAxisLabel("Total Reach of the post")
      //       .xAxisLabel("Post Hour")
      //       .clipPadding(10)
      //       .dimension(scatterDimension)
      //       .legend(dc.legend().legendText(function(d){
                
      //       } ).x(700).y(0).itemHeight(13).gap(5))
      //       .colorAccessor(function(d) {
      //           if (typeof d != 'undefined')
      //                  return d.key[2];
      //           return 0; })
      //       //.colors(["#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
      //       .ordinalColors(["#D8BFD8","#BA55D3","#8A2BE2","#4B0082"])
      //       .calculateColorDomain()
      //       .excludedOpacity(0.4);


        dc.renderAll();
        AddXAxis(typeChart, "This is the x-axis!");
        AddXAxis(monthChart, "Year");

});
}