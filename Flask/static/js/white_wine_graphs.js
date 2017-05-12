    /**********************************
     * Step0: Load data from json file *
     **********************************/

// load data from a csv file
    d3.csv("winequalitywhite.csv", function (data) {

        // format our data

        

        data.forEach(function (d) {
            d["quality"] = +d["quality"];
            d["pH"] = +d["pH"];
            d["alcohol"] = +d["alcohol"];
            d["fixedAcidity"] = +d["fixedAcidity"];
        });

        /******************************************************
         * Step1: Create the dc.js chart objects & ling to div *
         ******************************************************/

        var typeChart = dc.rowChart("#dc-type-chart");
        var pieChart = dc.pieChart("#dc-pie1-chart");
        var monthChart = dc.barChart("#dc-month-chart");
        var timeChart = dc.lineChart("#dc-time-chart");
        var heatmap = dc.heatMap("#dc-post-heatmap-wine");
        var scatterPlot = dc.scatterPlot("#dc-scatter-plot");

        /****************************************
         *    Run the data through crossfilter    *
         ****************************************/

        var facts = crossfilter(data);  // Gets our 'facts' into crossfilter

        var post = ["", "3", "4", "5", "6","7","8","9","10"];
        /******************************************************
         * Create the Dimensions                               *
         * A dimension is something to group or filter by.     *
         * Crossfilter can filter by exact value, or by range. *
         ******************************************************/

        var qualityDimension = facts.dimension(function(d) {return d.quality;});
        // for Type
        var qualityNumbers = facts.dimension(function (d) {
                return d.quality;       // group or filter by Type
            });
        
        var qualityAcidityGroupSum = qualityNumbers.group()
            .reduceSum(function (d) {
                return d.fixedAcidity;
            }); // sums the Types per Type
        
        
         var qualitypHGroupSum = qualityNumbers.group()
            .reduceSum(function (d) {
                return d.pH;
            }); // sums the Types per Type
        
        counts = qualityAcidityGroupSum.reduceCount().all();
        countspH = qualitypHGroupSum.reduceCount().all()
        
        
        
        countByType = {}; 

        Array.prototype.slice.call(counts).forEach(function(d) { countByType[d.key] = d.value; })
        
        var paymentaverageAcidityByquality = qualityAcidityGroupSum.reduceSum(function(d, i) { 
        
        return d.fixedAcidity / countByType[d.quality]; 
        });

        
        var topTypes = paymentaverageAcidityByquality.top(1);

        //average pH
        countBypH = {}; 

        Array.prototype.slice.call(countspH).forEach(function(d) { countBypH[d.key] = d.value; })
        
        var qualitypHGroupSum = qualitypHGroupSum.reduceSum(function(d, i) { 
        
        return d.pH / countBypH[d.quality]; 
        });

        
        var topTypes = qualitypHGroupSum.top(1);    

    


        /***************************************
         *    Step4: Create the Visualisations   *
         ***************************************/

        // Magnitide Bar Graph Summed
        typeChart.width(480)
            .height(230)
            .margins({top: 10, right: 10, bottom: 20, left: 10})                // the values across the x axis
            .group(paymentaverageAcidityByquality)                          // the values on the y axis
            .dimension(qualityDimension)
            .transitionDuration(500)
            .ordinalColors(["#263961","#2d4373","#005b96","#3b5998","#7b94c9","#8b9dc3","#adbad5","#dfe3ee","#ff7f7f"])
            .renderlet(function(chart){
                var colors =d3.scale.ordinal().domain(post)
                    .range(["#263961","#2d4373","#005b96","#3b5998","#7b94c9","#8b9dc3","#adbad5","#dfe3ee","#ff7f7f"]);
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
            .innerRadius(50)
            .radius(100)
            .dimension(qualityNumbers)
            .group(qualityAcidityGroupSum)
            .legend(dc.legend())
        // workaround for #703: not enough data is accessible through .label() to display percentages
            .on('pretransition', function(chart) {
                chart.selectAll('text.pie-slice').text(function(d) {
                return 'quality:'+d.data.key + '\n ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
                })
            })
            .title(function(d){return d.value;})
            .ordinalColors(["#263961","#2d4373","#005b96","#3b5998","#7b94c9","#8b9dc3","#adbad5","#dfe3ee","#ff7f7f"])
            .externalLabels(20)

           
        // Month bar graph
        monthChart.width(500)
            .height(300)
            .x(d3.scale.ordinal().domain(post))
            .xUnits(dc.units.ordinal)
            .dimension(qualityDimension)
            .margins({top: 10, right: 10, bottom: 20, left: 50})
            .group(qualitypHGroupSum)
            .transitionDuration(500)
            .legend(dc.legend().legendText(function(d){
               
                return [+d.name];
            } ).x(500).y(0).gap(1))
            .renderlet(function(chart){
                var colors =d3.scale.ordinal().domain(post)
                    //.range(["#1abc9c","#2ecc71",
                      //  "#3498db","#9b59b6","#34495e","#16a085","#27ae60",
                        //"#2980b9", "#8e44ad","#2c3e50","#f1c40f","#d35400"]);
                    .range(["#263961","#2d4373","#005b96","#3b5998","#7b94c9","#8b9dc3","#adbad5","#dfe3ee","#ff7f7f"]);
                chart.selectAll('rect.bar').each(function(d){
                    d3.select(this).attr("style", "fill: " + colors(d.x));
                });
            })
            .yAxisLabel("Interactions per month")
            //.xAxisLabel("Month")
            .centerBar(true)
            .gap(1)                    // bar width Keep increasing to get right then back off.
            .elasticY(true);

        var legendLables= ["volatileAcidity", "sulphates","residualSugar"];

        var hourlyInteractions = facts.dimension(function (d) {
            return d.quality;       // group or filter by Month
        });
        var hourlyLikes=hourlyInteractions.group().reduceSum(function(d) {return d.volatileAcidity;});
        var hourlyShare=hourlyInteractions.group().reduceSum(function(d) {return d.sulphates;});
        var hourlyComment=hourlyInteractions.group().reduceSum(function(d) {return d.residualSugar;});
        
        var minDim = facts.dimension(function (d) {
            return d.volatileAcidity;       // group or filter by Month
        });
        var maxDim = facts.dimension(function (d) {
            return d.residualSugar;       // group or filter by Month
        });

        var runMin = minDim.bottom(1)[0];
        var runMax = maxDim.top(1)[0];
        

        // time graph
        timeChart.width(500)
            .height(300)
            .margins({top: 10, right: 10, bottom: 30, left: 50})
            .dimension(hourlyInteractions)
            .group(hourlyShare)
            .stack(hourlyLikes)
            .stack(hourlyComment)
            .transitionDuration(500)
            .ordinalColors(["#444444","#7ddc1f","#3b5998"])
            .legend(dc.legend().legendText(function(d){
                return legendLables[+d.name];
            } ).x(450).y(0).gap(1))
            .renderArea(true)
            .elasticY(true)
            .yAxisLabel("Value/1000 in grams/Litre")
            .xAxisLabel("Quality")
            .x(d3.scale.linear().domain([2, 10]))
            .y(d3.scale.linear().domain([runMin, runMax]));

        
        


        var heatDimension = facts.dimension(function(d) {return [d.citricAcid,d.quality];});
        var postCount = heatDimension.group().reduceCount(function(d) { return +d.pH; });
        
        

        heatmap.width(25 * 22.8 + 200)
            .height(35 * 5 + 40)
            .dimension(heatDimension)
            .group(postCount)

            .keyAccessor(function(d) {
                
                return d.key[0]; })
            .valueAccessor(function(d) { return d.key[1]; })
            .colorAccessor(function(d) {
                if(d.value > 3) return 3+(d.value-3)/9;
                return d.value; })
            .title(function(d) {
                return "Type:   " + d.key[1] + "\n" +
                    "Hour:  " + d.key[0]  + "\n" +
                    "quality:  " + d.value  + "\n" ;})
            //.colors(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
            .colors(["#263961","#2d4373","#355088","#005b96","#3b5998","#7b94c9","#8b9dc3","#adbad5","#dfe3ee","#ff7f7f","#ebeef4"])
            
            //.colors(["#005b96","#3b5998","#7b94c9","#8b9dc3","#adbad5","#dfe3ee","#ff7f7f"])
            
            .calculateColorDomain();
  
        var scatterDimension = facts.dimension(
            function(d) {
                    return [+d.quality, +d.totalSulfurDioxide,+d.citricAcid];
            });
        var qualDimension = facts.dimension(function(d) {return d.quality,d.totalSulfurDioxide,d.citricAcid;});
            
        var scatterGroup = scatterDimension.group();

        var postT = ["Photo", "Status", "Link", "Video"];


        scatterPlot
            
            .height(300)
            .margins({top: 10, right: 10, bottom: 30, left: 50})
            .group(scatterGroup)
            .x(d3.scale.linear().domain([1, 9]))
            .yAxisLabel("Total Sulfur Dioxide in wine")
            .xAxisLabel("quality")
            .clipPadding(10)
            .dimension(scatterDimension)
            //.legend(dc.legend().legendText(function(d){
                
              //  return legendLables[d.key[2]];
            //} ).x(700).y(0).itemHeight(13).gap(5))
            
            //.colors(["#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
            .ordinalColors(["#3b5998","#7b94c9","#8b9dc3","#adbad5","#dfe3ee","#ff7f7f"])
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