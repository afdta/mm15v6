//TO DO: investigate d3 tween for absolutely positioned dives with left % length

//shift share charts
import card from '../../../js-modules/card-api.js';

export default function shift_shares(container, url, state){

	//chart setup
  	var chart = {};
  	chart.init = false

	//colors for trend lines
	chart.cols = {};

	//chart.height
	chart.height = 325;

	chart.wrap_outer = d3.select(container)
		.classed("c-fix makesans",true);

	//title
	chart.title = chart.wrap_outer.append("p").classed("chart-title",true)
	.html('Did job growth in the ' + state.metro_lookup(state.metro).nameshort + 
		' metro area outperform or underperform the nation?<br /><span style="font-size:0.8em"> To do: Annotate with job growth numbers and percentages, clarify definitions, and main takeaway. Add a table below the aggregate shift share, showing 2015 industry (2-, 3-, or 4-digit?) shares, change, and comparison to national growth.</span>');
	
	//hold chart in wrap
	chart.wrap = chart.wrap_outer.append("div")
		.style("position","relative")
		.style("padding","1em 1em")
		.style("background-color","#eeeeee")
		.append("div")
		.style("position","relative")
		.style("padding","0px")
		.style("margin","0px");

	//legend
	/*chart.legend = chart.wrap_outer.append("div").classed("c-fix",true);
	chart.legend_entries = chart.legend.selectAll("div").data(["Metro","U.S."]).enter()
	      .append("div").style("float","left").style("margin","0px 10px 0px 0px").classed("c-fix",true);
	chart.legend_entries.append("div")
	.style("height","2px")
	.style("width","20px")
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
	.style("float","left");*/

	function build(){
		self = this;
		var json = self.get_data();
		var metro = this.get_data("cbsa");
		var metroName = state.metro_lookup(metro);

		var maxPctCh = 0.10;

		var data = json[state.period].filter(function(d,i,a){
			return (d.cbsa+"") == metro;
		})[0];

		//set scales -- not consistent between metros
		var shifts = {cs:data.cs/data.e0, im:data.im/data.e0, ns:data.ns/data.e0}

		var e0 = data.e0;
		var shifts = [
						{val:data.ns, label:"ns"}, 
						{val:data.im, label:"im"},
						{val:(data.ns+data.im), label:"pro"},
						{val:data.e1-data.e0, label:"act"},
						{val:data.cs, label:"cs"}
					]

		var max = d3.max(shifts, function(d,i){return d.val});
		var min =  d3.min(shifts, function(d,i){return d.val});
		var absmax = Math.max(Math.abs(max), Math.abs(min))/e0;

		/*if(absmax < maxPctCh){
			var extent = [0-maxPctCh, maxPctCh];
		}
		else{
			var extent = [0-absmax, absmax];
		}*/
		var extent = min > 0 ? [0, max/e0] : (max < 0 ? [min/e0, 0] : [min/e0, max/e0]);

		//map data to % range
		var scaleX = d3.scaleLinear().domain(extent).range([45,95]);
		var zero = Math.round(scaleX(0));

		var detail = json.detail[metro];

		var bar_height = (chart.height / 4) - 50; 
		if(bar_height < 1){bar_height = 1}

		var barsU = chart.wrap.selectAll("div.bar-wrap").data(shifts);
		barsU.exit().remove();
		var barsE = barsU.enter().append("div").classed("bar-wrap",true);
		barsE.append("div")
			.classed("value-bar",true)
			.style("top","0.25em")
			.style("min-height","1.5em")
			.style("height","90%")
			.style("max-height","4em")
			.style("position","absolute")
			;

		barsE.append("p");

		var bars = barsE.merge(barsU)
			.style("position","relative")
			.style("z-index",0)
			.style("margin","0.5em 0em 0.5em 0em")
			.style("padding","0em")
			.style("min-height","85px")
			//.style("background-color","#eeeeee")
			.style("border-bottom",function(d,i){return i < 4 ? "2px solid #ffffff" : "none"});

		var barsV = bars.select("div.value-bar")
			.style("left",function(d,i){
				var x = scaleX(d.val/e0);
				var w = Math.round(Math.abs(scaleX(d.val/e0) - zero))
				if(x >= zero){
					var l = zero+"%";
				}
				else{
					var l = (zero-w)+"%";
				}
				return l;
			})
			.style("width",function(d,i){
				var w = Math.round(Math.abs(scaleX(d.val/e0) - zero));
				return w+"%";
			})
			.style("background-color",function(d,i){
				return d.val < 0 ? "#dc2a2a" : "#0d73d6";
			})
			.style("height","30px");

		var ydiv_u = chart.wrap.selectAll("div.shift-axis").data([0]);
			ydiv_u.exit().remove();
		var ydiv_e = ydiv_u.enter().append("div")
									.classed("shift-axis",true)
									.style("width","1px")
									.style("border","0px solid #ffffff")
									.style("top","-0.5em")
									.style("margin","0px")
									.style("height","calc(100% + 1em)")
									.style("background-color","#333333")
									.style("position","absolute")
									.style("z-index",1)
									;
		var ydiv = ydiv_e.merge(ydiv_u).style("left",zero+"%");

		var text = bars.select("p").html(function(d,i){
			if(i==0){
				return "<strong>(a) National growth effect</strong>: The job change that would occur if the metro area matched total national job growth.";
			}
			else if(i==1){
				return "<strong>(b) Industry mix effect</strong>: The job change that would occur if every industry in the metro area matched the national growth rate in that industry, less the national growth effect."
			}
			else if(i==2){
				return "<strong>(c) Expected job growth</strong>: The sum of the national growth effect and the industry mix effect (a + b). It is the change that would occur if the metro area's industries matched the national performance of those industries."
			}
			else if(i==3){
				return "<strong>(d) Actual job growth</strong>: The actual job change in the metro area."
			}
			else if(i==4){
				return "<strong>(e) Metro area competitive shift</strong>: The difference between the actual job change and the expected job change (d - c). Indicates whether the metro area overperformed or underperformed given its industrial structure."
			}


		}).style("line-height","1.35em")
		  .style("font-size","0.8em")
		  .style("padding","7px 10px")
		  .style("max-width","40%")
		  ;

		(function(){
			var heights = [];
			bars.each(function(d,i){
				var box = this.getBoundingClientRect();
				var h = Math.round(box.bottom-box.top);
				heights.push(h);
			});
			var min = d3.min(heights) + "px";

			barsV.style("max-height", "calc(" + min + " - 1em)");			
		})();

	}

	//initialize card object
	var co = card(container)
	          .set_data(state.metro, "cbsa")
	          .set_data(state.period, "period")
	          .build(build);

	//closure for use in setTimeout below
	function resizeBuild(){
		co.build();
	}

	//activate the chart on scrolled
	function activate(){
		co.json(url);
		var resizeTimer;
		window.addEventListener("resize", function(){
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(resizeBuild, 150);
		});
	}

	function updateMetro(){
		co.set_data(state.metro, "cbsa").build();
		chart.title.html('Did job growth in the ' + state.metro_lookup(state.metro).nameshort + 
		' metro area outperform or underperform the nation?<br /><span style="font-size:0.8em"> To do: Annotate with job growth numbers and percentages, clarify definitions, and main takeaway. Add a table below the aggregate shift share, showing 2015 industry (2-, 3-, or 4-digit?) shares, change, and comparison to national growth.</span>');
	
	}

	function updatePeriod(){
		co.set_data(state.period, "period").build();
	}

	return {
	  activate:activate, 
	  updateMetro:updateMetro,
	  updatePeriod:updatePeriod, 
	  container:container
	}
}