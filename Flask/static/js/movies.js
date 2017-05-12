    /**********************************
     * Step0: Load data from json file *
     **********************************/


//load data from mongodb
    $.getJSON("/moviesdata/movies", function(data) {
        var items = [];
        $.each(data, function(key, val) {
                  //alert(d["Post_Month"]);
         alert(val["tomatoMeter"]);
             val["tomatoMeter"] = +val["tomatoMeter"];
             val["imdbRating"] = +val["imdbRating"];
             val["tomatoFresh"] = +val["tomatoFresh"];
        

        
  
    items.push( "<li id='" + key + "'>" + val["Title"] +"<br/>"+"actors :"+val["Actors"] 
        +"</li><br/><div ><img src='"+val["Poster"]+"'></div><br/> " );
  });
 
  $( "<ul/>", {
    "class": "my-new-list",
    html: items.join( "" )
  }).appendTo( "body" );
});