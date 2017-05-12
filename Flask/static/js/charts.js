queue()
    .defer(d3.json, "/facebookdata/projects")
    .await(makeGraphs);

function makeGraphs(error, projectsJson, statesJson) {
	
	//Clean projectsJson data
	var donorschooseProjects = projectsJson;
	//var dateFormat = d3.time.format("%Y-%m-%d");
	donorschooseProjects.forEach(function(d) {
		//d["date_posted"] = dateFormat.parse(d["date_posted"]);
		//d["date_posted"].setDate(1);
		d["Page_total_likes"] = +d["Page_total_likes"];
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(donorschooseProjects);

	//Define Dimensions
	var CategoryDim = ndx.dimension(function(d) { return d["Category"]; });
	var resourceTypeDim = ndx.dimension(function(d) { return d["resource_type"]; });
	var povertyLevelDim = ndx.dimension(function(d) { return d["poverty_level"]; });
	var totalLikesDim  = ndx.dimension(function(d) { return d["Page_total_likes"]; });
	var stateDim = ndx.dimension(function(d) { return d["school_state"]; });


	//Calculate metrics
	var numLikesByCategory = CategoryDim.group(); 
	var numProjectsByResourceType = resourceTypeDim.group();
	var numProjectsByPovertyLevel = povertyLevelDim.group();
	var totalLikesByState = stateDim.group().reduceSum(function(d) {
		return d["Page_total_likes"];
	});

	var all = ndx.groupAll();
	var totalLikes = ndx.groupAll().reduceSum(function(d) {return d["Page_total_likes"];});

	//var max_state = totalLikesByState.top[0].value;

	//Define values (to be used in charts)
	var minDate = CategoryDim.bottom(1)[0]["Category"];
	var maxDate = CategoryDim.top(1)[0]["Category"];

    //Charts
	var timeChart = dc.barChart("#time-chart");
	var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
	var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
	var usChart = dc.geoChoroplethChart("#us-chart");
	var numberProjectsND = dc.numberDisplay("#number-projects-nd");
	var totalLikesND = dc.numberDisplay("#total-donations-nd");

	numberProjectsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	totalLikesND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(totalLikes)
		.formatNumber(d3.format(".3s"));

	timeChart
		.width(600)
		.height(160)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(CategoryDim)
		.group(numLikesByCategory)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.xAxisLabel("Year")
		.yAxis().ticks(4);

	resourceTypeChart
        .width(300)
        .height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .xAxis().ticks(4);

	povertyLevelChart
		.width(300)
		.height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .xAxis().ticks(4);


	/*usChart.width(1000)
		.height(330)
		.dimension(stateDim)
		.group(totalLikesByState)
		.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
		.colorDomain([0, max_state])
		.overlayGeoJson(statesJson["features"], "state", function (d) {
			return d.properties.name;
		})
		.projection(d3.geo.albersUsa()
    				.scale(600)
    				.translate([340, 150]))
		.title(function (p) {
			return "State: " + p["key"]
					+ "\n"
					+ "Total Donations: " + Math.round(p["value"]) + " $";
		})*/

    dc.renderAll();

};