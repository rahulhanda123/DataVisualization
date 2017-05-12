    /**********************************
     * Step0: Load data from json file *
     **********************************/


//load data from mongodb
    $.getJSON("/facebookdata/projects", function(data) {
        var month = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var post = ["", "Photo", "Status", "Link", "Video"];
        $.each(data, function(key, d) {
        
            d["Lifetime_People_who_have_liked_your_Page_and_engaged_with_your_post"] = +d["Lifetime_People_who_have_liked_your_Page_and_engaged_with_your_post"];
            d["Post_Month"] = +d["Post_Month"];
            d["Post_Hour"] = +d["Post_Hour"];
        });

        /******************************************************
         * Step1: Create the dc.js chart objects & ling to div *
         ******************************************************/

        var typeChart = dc.rowChart("#dc-type-chart");
        var pieChart = dc.pieChart("#dc-pie-chart");
        var monthChart = dc.barChart("#dc-month-chart");
        var timeChart = dc.lineChart("#dc-time-chart");
        var heatmap = dc.heatMap("#dc-post-heatmap");
        var scatterPlot = dc.scatterPlot("#dc-scatter-plot");

        /****************************************
         *    Run the data through crossfilter    *
         ****************************************/

        var facts = crossfilter(data);  // Gets our 'facts' into crossfilter

        /******************************************************
         * Create the Dimensions                               *
         * A dimension is something to group or filter by.     *
         * Crossfilter can filter by exact value, or by range. *
         ******************************************************/

        var typeDimension = facts.dimension(function(d) {return d["Type"];});
        var monthDimension = facts.dimension(function(d) { return month[d["Post_Month"]]; });
        var categoryDimension = facts.dimension(function(d) { return month[d["Category"]]; });
            // for Type
        var postInteractions = facts.dimension(function (d) {
                return d['Type'];       // group or filter by Type
            });
        var postInteractionsGroupSum = postInteractions.group()
            .reduceSum(function (d) {
                return d["Lifetime_People_who_have_liked_your_Page_and_engaged_with_your_post"];
            });	// sums the Types per Type


        var reachInteractionsGroupSum = postInteractions.group()
            .reduceSum(function (d) {
                return d["Lifetime_Engaged_Users"];
            }); // sums the Types per Type   
        // for Month
        var monthlyInteractions = facts.dimension(function (d) {
            return month[d["Post_Month"]];       // group or filter by Month
        });
        var monthlyInteractionsGroupSum = monthlyInteractions.group()
            .reduceSum(function(d) {
                return d["Lifetime_People_who_have_liked_your_Page_and_engaged_with_your_post"]; });



        // for Hour
        var hourlyInteractions = facts.dimension(function (d) {
            return d["Post_Hour"];       // group or filter by Month
        });
        var hourlyLikes=hourlyInteractions.group().reduceSum(function(d) {return d["like"];});
        var hourlyShare=hourlyInteractions.group().reduceSum(function(d) {return d["share"];});
        var hourlyComment=hourlyInteractions.group().reduceSum(function(d) {return d["comment"];});
        var hourlyInts=hourlyInteractions.group().reduceSum(function(d) {return d["Total_Interactions"];});
        





        //for category
        var categoryInteractions = facts.dimension(function (d) {
                return d['Category'];       // group or filter by Type
            });

        var category_all=hourlyInteractions.group().reduceSum(function(d) {return d["Category"];});

        var categoryInteractionsGroupSum = categoryInteractions.group()
            .reduceSum(function (d) {
                return d["Lifetime_People_who_have_liked_your_Page_and_engaged_with_your_post"];
            }); // sums the Types per Type
        /***************************************
         *    Step4: Create the Visualisations   *
         ***************************************/

        // Magnitide Bar Graph Summed
        typeChart.width(480)
            .height(230)
            .margins({top: 10, right: 10, bottom: 20, left: 10})	            // the values across the x axis
            .group(postInteractionsGroupSum)							// the values on the y axis
            .dimension(typeDimension)
            .transitionDuration(500)
            .ordinalColors(["#D8BFD8","#BA55D3","#8A2BE2","#8B008B"])
            .renderlet(function(chart){
                var colors =d3.scale.ordinal().domain(post)
                    .range(["#D8BFD8","#BA55D3","#8A2BE2","#8B008B"]);
                    //.range(["#259FC4","#39D0DD","#4EBAE8","#4DC1D1"]);
                chart.selectAll('rect.bar').each(function(d){
                    d3.select(this).attr("style", "fill: " + colors(d.x));
                });
            })
            .title(function (d) {
                return d['Type'];
            });

         //Pie chart
         //var piecolor = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
         color = d3.scale.category20(); 
         pieChart.width(480)
            .height(300)
            .slicesCap(4)
            .radius(120)
            .innerRadius(50)
            .dimension(typeDimension)
            .group(reachInteractionsGroupSum)
            .legend(dc.legend())
            
        // workaround for #703: not enough data is accessible through .label() to display percentages
            .on('pretransition', function(chart) {
           
                chart.selectAll('text.pie-slice').text(function(d) {
                return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
                })
            })
            .title(function(d){return d.value;})
            .ordinalColors(["#D8BFD8","#BA55D3","#8A2BE2","#8B008B"])
            .externalLabels(35)
        // Month bar graph
        monthChart.width(500)
            .height(300)
            .x(d3.scale.ordinal().domain(month))
            .xUnits(dc.units.ordinal)
            .dimension(monthDimension)
            .margins({top: 10, right: 10, bottom: 20, left: 50})
            .group(monthlyInteractionsGroupSum)
            .transitionDuration(500)
            .legend(dc.legend().legendText(function(d){
                return legendLables[+d.name];
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
            .yAxisLabel("Interactions per month")
            .xAxisLabel("Month")
            .centerBar(true)
            .gap(1)                    // bar width Keep increasing to get right then back off.
            .elasticY(true);

        var legendLables= ["Share", "Interactions", "Likes", "Comments"];

        // time graph
        timeChart.width(500)
            .height(300)
            .margins({top: 10, right: 10, bottom: 30, left: 50})
            .dimension(hourlyInteractions)
            .group(hourlyShare)
            .stack(hourlyInts)
            .stack(hourlyLikes)
            .stack(hourlyComment)
            .transitionDuration(500)
            .ordinalColors(["#ffdc73","#ffbf00","#BA55D3","#8A2BE2"])
            .legend(dc.legend().legendText(function(d){
                return legendLables[+d.name];
            } ).x(450).y(0).gap(1))
            .renderArea(true)
            .elasticY(true)
            .yAxisLabel("Total Interactions on the page per hour")
            .xAxisLabel("Post Hours")
            .x(d3.scale.linear().domain([0, 23]));

        typeChart.width(600)
            .height(200)
            .margins({top: 10, right: 10, bottom: 20, left: 10})	            // the values across the x axis
            .group(postInteractionsGroupSum)							// the values on the y axis
            .dimension(typeDimension)
            .transitionDuration(500)
            .renderlet(function(chart){
                var colors =d3.scale.ordinal().domain(post)
                    .range(["#D8BFD8","#BA55D3","#8A2BE2","#8B008B"]);
                chart.selectAll('rect.bar').each(function(d){
                    d3.select(this).attr("style", "fill: " + colors(d.x));
                });
            })
            .title(function (d) {
                return d['Type'];
            });

        var postType = hourlyInteractions.group().reduceCount((function (d) {
                return d['Type'];
            }));	// sums the Types per Type

        var heatDimension = facts.dimension(function(d) {return [+d["Post_Hour"],d["Type"]];});
        var postCount = heatDimension.group().reduceCount(function(d) { return d["Type"] });


        heatmap.width(25 * 22.8 + 80)
            .height(35 * 5 + 40)
            .dimension(heatDimension)
            .group(postCount)
            .legend(dc.legend())
            .keyAccessor(function(d) {
                return d.key[0]; })
            .valueAccessor(function(d) { return d.key[1]; })
            .colorAccessor(function(d) {
                if(d.value > 3) return 3+(d.value-3)/9;
                return d.value; })
            .title(function(d) {
                return "Type:   " + d.key[1] + "\n" +
                    "Hour:  " + d.key[0]  + "\n" +
                    "Number of Posts:  " + d.value  + "\n" ;})
            .colors(["#E6E6FA","#D8BFD8","#DDA0DD","#BA55D3","#9370DB","#8A2BE2","#9400D3","#8B008B","#4B0082"])
            .calculateColorDomain();
            


        var scatterDimension    =
            facts.dimension(
            function(d) {
                    return [+d["Post_Hour"], +d["Lifetime_Post_Total_Reach"], +d["Paid"]];
            });
        var scatterGroup = scatterDimension.group();

        var postT = ["Photo", "Status", "Link", "Video"];


        scatterPlot
            
            .height(300)
            .margins({top: 10, right: 10, bottom: 30, left: 50})
            .group(scatterGroup)
            .x(d3.scale.linear().domain([0, 24]))
            .yAxisLabel("Total Reach of the post")
            .xAxisLabel("Post Hour")
            .clipPadding(10)
            .dimension(scatterDimension)
            .legend(dc.legend().legendText(function(d){
                
            } ).x(700).y(0).itemHeight(13).gap(5))
            .colorAccessor(function(d) {
                if (typeof d != 'undefined')
                       return d.key[2];
                return 0; })
            //.colors(["#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
            .ordinalColors(["#D8BFD8","#BA55D3","#8A2BE2","#4B0082"])
            .calculateColorDomain()
            .excludedOpacity(0.4);


        /****************************
         * Step6: Render the Charts  *
         ****************************/

        dc.renderAll();

    });
   function updateData() {
        dc.filterAll();
        dc.renderAll();
    }
