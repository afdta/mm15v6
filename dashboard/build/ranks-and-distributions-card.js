//to do: json data for this chart type needs metadata for each indicator/measure. specifically: var name and format
//also z-score ranges to use -- or should that be calculated below?
//incorporate metro highlighting, test update method
//pass in the state/scope object that sets initial selections and update selections for metro/time period/etc/
//methods need to gracefully handle missing state properties

//to do: consider ditching card api and simpifying update procedure: 
// 1) update data (binding -- expensive, often involves data fetching/manipulation),
// 2) update state (e.g. metro selection, color -- soft update, no data rebind)
// 3) update size (resize)

import card from '../../../js-modules/card-api.js';
import metroData from '../../../js-modules/metro-data.js';
import format from '../../../js-modules/formats.js';
import metro_select from '../../../js-modules/metro-select.js';
import definitions from './definitions.js';

export default function ranks_and_distributions(container, url, state){

  var colors = {};
  colors.dot = "#0d73d6";
  colors.stroke = "#033CED";

  var metname = metro_select().lookup;

  //chart setup
  var chart = {};
  chart.init = false
  chart.width = 320;
  chart.height = 550;
  chart.wrap_outer = d3.select(container).classed("card-box makesans",true);
  chart.textwrap = chart.wrap_outer.append("div").style("padding","0em 1em");
  chart.wrap = chart.wrap_outer.append("div").classed("content-box", true).append("div"); //.style("margin","1em 10%");
  chart.label_container = chart.wrap.append("div")
                                    .classed("c-fix",true)
                                    .style("display","table")
                                    .style("width","100%")
                                    .append("div")
                                    .style("display","table-row")
                                    

  chart.svg = chart.wrap.append("svg")
                    .style("height", chart.height+"px")
                    .style("width","100%");

  chart.main_group = chart.svg.append("g");
  chart.anno_group = chart.svg.append("g");
	chart.axis_label = chart.svg.append("g");
	chart.sub_svg = chart.svg.append("svg")
                       .style("width","48%")
                       .style("height","50%")
                       .attr('x',"52%")
                       .attr("y","0");

  chart.anno_dot = chart.anno_group.append("circle").attr("stroke-width","2px");

  chart.xaxis = chart.main_group.append("line")
                                .attr("stroke","#999999")
                                .style("shape-rendering","crispEdges")
                                .attr("stroke-width","1px");

  var metro_data = metroData();

  //build the actual chart
  function build(){
    var self = this;
    var period = this.get_data("period");
    var cbsa = this.get_data("cbsa");

    //to do -- build data based on metadata
    var indicators = this.get_data().measures;

    var data = indicators.map(function(d,i,a){
      var D = self.get_data().values[period][d.key];
      var Z = metro_data.zip(D, "cbsa", "geo"); //bind to official names
      var I = d;
      return {variable:d, data:Z}
    });

    var thisBox = container.getBoundingClientRect();
    var width = Math.round(thisBox.right - thisBox.left);

    //to do: figure this out -- build from metadata?
    var cat = data[0].data.concat(data[1].data, data[2].data);

    //var zrange = [-2,4];
    var zrange = d3.extent(cat, function(d){return d.obs.z});



    var x = d3.scaleBand().domain(indicators.map(function(d){return d.key})).range([0,100])
          .round(false).paddingOuter(0).align(0.5);
    var y = d3.scaleLinear().domain(zrange).range([chart.height-10, 10]);

    var po = x.paddingOuter();
    var pi = x.paddingInner();
    var step = x.step();
    var halfstep = step/2;

    chart.xaxis.attr("x1",(halfstep*po)+"%")
               .attr("x2",(100-(halfstep*po))+"%")
               .attr("y1",y(0))
               .attr("y2",y(0))
               ;

    //add in labels
    var labels_update = chart.label_container.selectAll("div").data(indicators);
    var labels_enter = labels_update.enter().append("div");

      labels_enter.append("p")
                  .classed("small-labels", true)
                  .style("text-align","center")
                  .style("margin","0px 4px")
                  ;

    var labels = labels_enter.merge(labels_update).style("display","table-cell").style("vertical-align","bottom");
    labels.style("margin","0em")
      .style("width",step+"%")
      .style("overflow","hidden")
      .select("p")
      .html(function(d,i){
        return d.value;
      })
      .each(function(d,i){
          definitions(this).define(d.key);
      });

    //build groups
    var groups_update = chart.main_group.selectAll("g.group-dot-array").data(data);
    var groups_enter = groups_update.enter().append("g").classed("group-dot-array",true)
                                    .style("pointer-events","all");
        //groups_enter.append("rect");
        groups_enter.append("g").classed("dot-group",true).attr("transform","translate(-15,0)");
        groups_enter.append("line");
    var groups = groups_enter.merge(groups_update);

    groups.select("rect")
          .attr("x",function(d,i){
            var indicator = d.variable.key; //to do: add in metadata to json
            return x(indicator)+"%";
          })
          .attr("y",0)
          .attr("height", chart.height)
          .attr("width", step+"%")
          .attr("fill", "none");

    groups.select("line")
          .attr("x1",function(d,i){return (x(d.variable.key)+halfstep)+"%"})
          .attr("x2",function(d,i){return (x(d.variable.key)+halfstep)+"%"})
          .attr("y1",0)
          .attr("y2",chart.height)
          .attr("stroke","#aaaaaa")
          .attr("stroke-dasharray","1,1")
          .style("shape-rendering","crispEdges");

    var dots = groups.select("g.dot-group").selectAll("rect").data(function(d,i){
      return d.data.filter(function(d,i,a){return d.obs.z !== null});
    });
    dots.exit().remove();
    var alldots = dots.enter().append("rect").merge(dots)
            .attr("x",function(d,i){return (x(d.obs.measure)+halfstep)+"%"})
            .attr("y",function(d,i){
              return d.id.code == cbsa ? y(d.obs.z)-1 : y(d.obs.z)
            })
            .attr("fill", function(d,i){
              return d.id.code == cbsa ? "#dc2a2a" : colors.dot
            })
            .attr("fill-opacity",function(d,i){
              return d.id.code == cbsa ? 1 : 0.5;
            })
            .attr("stroke",colors.dot)
            .attr("stroke-width",0)
            .attr("stroke-opacity",0.5)
            .attr("height", function(d,i){
              return d.id.code == cbsa ? 3 : 1;
            })
            .attr("width",function(d,i){
              return d.id.code == cbsa ? 42 : 30;
            })
            .style("shape-rendering","crispEdges")
            ;

    //BUILD OUT TEXT COMPONENT
    (function(){
      try{
        var overall = self.get_data().ranks[period];
        var values = self.get_data().values[period];
        var indicators = self.get_data().measures;

        var lookup = {};
        var o = overall.filter(function(d,i){
          return d.cbsa == cbsa;
        })
        lookup.cbsa = cbsa;
        lookup.rank = o.length==1 ? o[0].rnk : null;
        
        lookup.values = indicators.map(function(d,i){
          var v = values[d.key].filter(function(obs){
            return obs.cbsa == cbsa;
          }); 
          return v.length==1 ? {rank:v[0].rank, val:v[0].val, z:v[0].z, variable:d.value, var:d.key} : null;
        });

        //console.log(lookup);

        var txt = chart.anno_group.selectAll("text").data(lookup.values);
        txt.enter().append("text").merge(txt)
            .attr("x",function(d,i){return (x(d.var)+halfstep)+"%"})
            .attr("dx",-20)
            .attr("y",function(d,i){return y(d.z)+6})
            .attr("text-anchor","end")
            .text(function(d,i){return format.pct1(d.val)})

        var boxtext = chart.textwrap.selectAll("p.data-text").data([lookup.rank].concat(lookup.values));
        boxtext.enter().append("p").classed("data-text",true).merge(boxtext).text(function(d,i){
          if(i==0){
            return format.possessive(metname(cbsa).nameshort) + " overall rank: " + format.rank(d);
          }
          else{
            return d.variable + ": " + format.pct1(d.val) + " (" + format.rank(d.rank) + ")"
          }
        })
        .classed("big-strong", function(d,i){return i==0});

        var legendtext = chart.textwrap.selectAll("p.legend-text").data(["Add in text and symbols describing chart", "Each line depict one of the 100 largest metro areas. " + metname(cbsa).nameshort + " is highlighted in red.", "The solid line is the 100-metro average. (Data have been standardized)"])
        legendtext.enter().append("p").classed("legend-text",true).merge(legendtext).text(function(d,i){return d}).style("font-style","italic");
        
      }
      catch(e){
        //roll back everything
      }
    })();

    /////code from gci2016

    /*axis_label.append("line").attr("x1",20)
                 .attr("x2",140)
                 .attr("y1",y(0)+15)
                 .attr("y2",y(0)+15)
                .attr("stroke","#aaaaaa")
                .attr("stroke-width","1px")
                .attr("fill","none")
                .style("shape-rendering","crispEdges");

    axis_label.append("path").attr("d", "M140,"+(y(0)+15)+" m0,-5 l10,5 l-10,5 z")
                .attr("stroke","#aaaaaa")
                .attr("stroke-width","1px")
                .attr("fill","#aaaaaa");

    axis_label.selectAll("text").data([1,2]).enter().append("text").classed("above-avg-label",true)
          .text("Above average")
          .attr("x", 20)
          .attr("y", y(0))
          .attr("dy",13)
          .attr("dx",10)
          .style("font-size","13px")
         .attr("fill",function(d,i){return i==0 ? "#ffffff" : "#666666"})
        .attr("stroke",function(d,i){return i==0 ? "#ffffff" : "none"})
        .attr("stroke-width",function(d,i){return i==0 ? "3px" : "0px"});

    axis_label.attr("transform","rotate(-90 10 " + y(0) + ")");*/
    ////end gci code

    chart.init = true;
  }

  //initialize card object
  var co = card(container)
              .set_data(state.metro, "cbsa")
              .set_data(state.period, "period")
              //.printErrors(false)
              .build(build);

  //activate the chart on scrolled
  function activate(){
    co.json(url);
    //window.addEventListener("resize", function(){co.build()});
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
    container:container
  }

}
