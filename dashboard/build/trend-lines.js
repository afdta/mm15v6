//to do: test output of metro lookup function

import card from '../../../js-modules/card-api.js';

export default function trend_lines(container, url, state){

  //chart setup
  var chart = {};
  chart.init = false

  //colors for trend lines
  chart.cols = {};
  chart.cols.us = "#aaaaaa";
  chart.cols.metro = "#0d73d6";

  //individual plot heights
  chart.plotheight = 95;
  chart.plotpad = 45;
  chart.three_chart_pad = 0;


  chart.wrap_outer = d3.select(container).classed("card-box makesans",true);
  
  chart.wrap = chart.wrap_outer.append("div").classed("content-box", true).append("div"); //.style("margin","1em 10%");
  chart.textwrap = chart.wrap_outer.append("div").style("padding","0em 0em 2em 2em");
  chart.title = chart.textwrap.append("p").classed("big-strong",true);


  //title and legend
  chart.legend = chart.textwrap.append("div").classed("c-fix",true);
  chart.legend_entries = chart.legend.selectAll("div").data(["Metro","U.S."]).enter()
          .append("div").style("float","left").style("margin","0em 1em 1.5em 1em").classed("c-fix",true);
  chart.legend_entries.append("div")
    .style("height","3px")
    .style("width","30px")
    .style("margin","7px 5px 6px 2px")
    .style("float","left")
    .style("background-color",function(d,i){
      return i===0 ? chart.cols.metro : chart.cols.us;
    });
  chart.legend_entries.append("p").text(function(d,i){
    return d;
  })
  .style("line-height","1em")
  .style("margin","0px")
  .style("float","left");

  chart.textwrap.append("p").text("Add a little text comparing the trajectory of the selected metro versus the U.S. during the chosen time period (1 yr, 5yr, 10yr.")
    .style("font-style","italic")
    ;

  //wrap to hold actual plots
  chart.label_container = chart.wrap.append("div")
                                    .classed("c-fix",true)
                                    .style("width","100%");

  chart.svg = chart.wrap.append("svg")
                    .style("height", ((chart.plotheight*3)+(chart.plotpad*2)+35+65)+"px")
                    .style("width","100%")
                    .append("g").attr("transform","translate(45,35)");


  //add a single xaxis group
  chart.xaxis = chart.svg.append("g")
                         .attr("transform","translate(0," +  ((3*chart.plotheight)+(2*chart.plotpad)+10)+")")
                         .classed("d3-axis-group",true);

  //hold vertical panels to activate mouseenter events
  chart.hover_panels = chart.svg.append("g");

  //add a chart note
  chart.note = chart.wrap.append("p")
    .text("Data unavailable for 2000–05; values are interpolated for these years.")
    .style("font-size","13px")
    .style("margin","-10px 10px 0px 45px")
    ;



 ///FROM 2016 MetroMonitor
function build(){
  var self = this;
  var json = this.get_data();
  var metro = this.get_data("cbsa");
  var metroName = state.metro_lookup(metro);
  var years = json.years;
  var indicators = json.measures;
  var category = json.category;
  
  var data = indicators.map(function(d,i,a){
    var met = json.values[d.key][metro];
    var us = json.values[d.key]['99999'];
    return {metro: !!met ? met : {values:[]},
            us: !!us ? us : {values:[]},
            indicator:d}
  });

  chart.title.html("Trends in the components of " + category.toLowerCase());

  chart.legend_entries.select("p")
                       .text(function(d,i){return i===0 ? metroName.nameshort : "United States"});
  chart.note.style("display",category==="inclusion" ? "block" : "none");

  //set chart dimensions
  try{
    var box = chart.wrap.node().getBoundingClientRect();
    var width = Math.round(box.right-box.left);
    if(width < 300){throw "BadDimensions"};
  }
  catch(e){
    var width = 500;
  }
  finally{
    var chartWidth = width-95;
    //charts.groupselect("rect.chart-back").attr("width",chartWidth);
  }

  //x-scaling
  var scaleX = d3.scaleLinear().domain(d3.extent(years)).range([0,chartWidth]);
  var axisX = d3.axisBottom(scaleX)
               .tickValues(years)
               .tickFormat(function(v){return v})
               .tickSize(6,6);

  //data mapper
  var dataMapper = function(d,i){
    var all = d.metro.values.concat(d.us.values);
    var extent = d3.extent(all, function(d,i){return d.val});
    var extent2 = [
                    extent[0]-(Math.abs(extent[0])*0.05), extent[1]+(Math.abs(extent[1])*0.05)
                  ];
    var scaleY = d3.scaleLinear().domain(extent2).range([chart.plotheight, 0]);
    var tickVals = scaleY.ticks(3);

    var axisY = d3.axisLeft(scaleY)
                 .tickValues(tickVals)
                 .tickFormat(function(v){return v})
                 .tickSize(6,6);

     var y = function(obs){return scaleY(obs.val)}
     var x = function(obs){return scaleX(obs.year)}

     var line = d3.line().x(x).y(y).defined(function(d,i){
      var badyear = typeof d.year === "undefined" || d.year === null;
      var badval = typeof d.val === "undefined" || d.val === null;
      return !(badyear || badval);
     });

     var metpath = line(d.metro.values);
     var uspath = line(d.us.values);

     return {dmet: metpath===null ? "M0,0" : metpath,
             dus: uspath===null ? "M0,0" : uspath,
             ticks:tickVals,
             yscale:scaleY,
             yaxis:axisY,
             l:d.indicator.value};
  }


  //plot groups
  var chart_groups = chart.svg.selectAll("g.plot-group").data(data.map(dataMapper));
  var chart_groups_enter = chart_groups.enter().append("g")
  .classed("plot-group", true);


  //one-time additions
    //add y-axes to each group
    chart_groups_enter.append("g").classed("d3-axis-group",true).attr("transform","translate(0,0)");

    //add the basic chart elements to each group
    chart_groups_enter.append("g").classed("grid-line-group",true);
    chart_groups_enter.append("path").classed("us-trend-line",true)
      .attr("d","M0,0").attr("stroke",chart.cols.us);
    chart_groups_enter.append("path").classed("metro-trend-line",true)
      .attr("d","M0,0")
      .attr("stroke", chart.cols.metro)
      ;
    chart_groups_enter.append("text")
                .classed("plot-title",true)
                .attr("x",0)
                .attr("y",-10)
                .attr("font-size","1em")
                .text("...")

    chart_groups_enter.append("g")
                      .style("visibility","hidden")
                      .classed("chart-hover-dot-group",true);

  chart.groups = chart_groups_enter.merge(chart_groups)
                                .attr("transform",function(d,i){
                                  return "translate(0," + i*(chart.plotheight+chart.plotpad) + ")";
                                });

chart.groups.select("path.metro-trend-line").attr("d",function(d,i){
 return d.dmet;
}).attr("fill","none")
  .attr("stroke-width","3px")
  .attr("stroke-linecap","round");
chart.groups.select("path.us-trend-line").attr("d",function(d,i){
 return d.dus;
}).attr("fill","none")
  .attr("stroke-width","2px");

chart.groups.select("text.plot-title")
      .text(function(d,i){return d.l})
      .attr({x:0, "text-anchor":"start", "font-weight":"bold"});

var gridLines = chart.groups.select("g.grid-line-group").selectAll("line").data(function(d,i){
  return d.ticks.map(function(v,i){return d.yscale(v) });
});
gridLines.exit().remove();
gridLines.enter()
         .append("line")
         .merge(gridLines)
         .attr("x1",0)
         .attr("x2",chartWidth)
         .attr("stroke","#dddddd")
         .attr("stroke-width","1")
         .attr("stroke-dasharray","2,2")
         .attr("y1",function(d,i){return d})
         .attr("y2",function(d,i){return d})
         .style("shape-rendering","crispEdges");


//build axes

 try{
   var yaxes = chart.groups.select("g.d3-axis-group").each(function(d,i){
     d3.select(this).transition().call(d.yaxis);
   });
 }catch(e){
   //console.log(e);
 }

 try{
   chart.xaxis.call(axisX)
       .selectAll("text")
       .attr("transform","rotate(-45)")
       .attr("dy","8px")
       .attr("dx","-0.2em")
       .style("font-weight","normal")
       .attr("text-anchor","end");
 }
 catch(e)
 {

 }




return null;








   //add hover panels
   var verticalBlinds = charts.hover.selectAll("rect").data(ticks);
   var vertBlindWidth = chartWidth/(ticks[ticks.length-1]-ticks[0]);
   verticalBlinds.enter().append("rect");
   verticalBlinds.exit().remove();
   verticalBlinds.attr({"height":"800px", "fill":"#ffffff", "opacity":"0", "stroke":"#ffffff", "y":-40, width:vertBlindWidth}).style("pointer-events","all")
     .attr("x",function(d,i){
       return scaleX(d)-(0.5*vertBlindWidth);
     })

   var dotGroup;
   verticalBlinds.on("mouseenter",function(d,i){
     try{
       var x = scaleX(d);
       var obs = data.filter(function(o,i,a){
         return o.year==d;
       });
       var usobs = usdata.filter(function(o,i,a){
         return o.year==d;
       });

       //each chart group (3 total) has 1 hover dot group -- we need to bind the accessors with the dot data.
       dotGroup = charts.groups.selectAll("g.chart-hover-dot-group").data(function(d,i){
         return [{acc:d, dat:[usobs[0],obs[0]], col:["#aaaaaa","#00649f"] }];
       });
       dotGroup.enter().append("g").classed("chart-hover-dot-group",true);
       dotGroup.exit().remove();

       dotGroup.attr("transform","translate("+x+",0)").style("visibility","visible");

       var backs = dotGroup.selectAll("rect").data(function(d,i){return [d,d]});
         backs.enter().append("rect");
         backs.exit().remove();
         backs.attr({"x":0,"fill":"#ffffff","opacity":0.75});

       var dots = dotGroup.selectAll("circle").data(function(d,i){return [d,d]});
         dots.enter().append("circle");
         dots.exit().remove();
         dots.attr({"cx":"0","r":"3"})
           .attr("cy",function(d, i){
             return d.acc.y(d.dat[i]);
           })
           .attr("fill",function(d,i){
             return d.col[i];
           })

       var labels = dotGroup.selectAll("text").data(function(d,i){return [d,d]});
         labels.enter().append("text");
         labels.exit().remove();
         labels.attr({"x":0})
             .text(function(d,i){
               var other = i==0 ? 1 : 0; //index of the other label
               var val = d.acc.val(d.dat[i]);
               var otherval = d.acc.val(d.dat[other]);
               return i==0 && val==otherval ? "" : d.acc.fmt(val);
             })
             .attr("text-anchor","start")
             .attr("y",function(d,i){
               var other = i==0 ? 1 : 0; //index of the other label
               var val = d.acc.val(d.dat[i]);
               var otherval = d.acc.val(d.dat[other]);
               var y = d.acc.yscale(val);
               if(val >= otherval){var yp = y-7}
               else{var yp = y+14}
               return yp;
             })
             .attr("fill",function(d,i){
               return i==0 ? "#666666" : d.col[i];
             })
             .style("fill",function(d,i){
               return i==0 ? "#666666" : d.col[i];
             });

       backs.each(function(d,i){
         try{
           var text = d3.select(this.parentNode).selectAll("text").filter(function(d,j){return i==j});
           var box = text.node().getBoundingClientRect();
           var w = box.right - box.left;;
           var y = text.attr("y");
           d3.select(this).attr({"width":box.right-box.left+6, "height":box.bottom-box.top+4, "x":-1, "y":y-13, "rx":5, "ry":5});
         }
         catch(e){
           console.log(e);
           d3.select(this).style("width","0");
         }

       });

     }
     catch(e){
       charts.groups.select("g.chart-hover-dot-group").style("visibility","hidden").selectAll("text").remove();
     }
   })
   verticalBlinds.on("mouseleave",function(d,i){
     dotGroup.attr("transform","translate(0,0)").style("visibility","hidden");
   })

 }
 ///END FROM 2016


  //initialize card object
  var co = card(container)
              .set_data(state.metro, "cbsa")
              .set_data(state.period, "period")
              .build(build);

  //activate the chart on scrolled
  function activate(){
    co.json(url);
    window.addEventListener("resize", function(){co.build()});
  }

  function updateMetro(){
    co.set_data(state.metro, "cbsa").build();
  }

  function updatePeriod(){
    co.set_data(state.period, "period").build();
  }

  //activate will actually fetch the data and run the build function
  //update will rebuild with new cbsa and/or time period selection -- build is a no-op if the default json data hasn't been loaded for the card yet
  return {
      activate:activate, 
      updateMetro:updateMetro,
      updatePeriod:updatePeriod, 
      container:container};
}
