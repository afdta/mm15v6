import place_tip from '../../../js-modules/place-tooltip.js';

export default function definitions(container, showonly){
	var colors = {};
	colors.background = "#eeeeee";
	colors.background_emphasis = "#dddddd";
	colors.strip = "transparent";
	colors.highlight = "#dc2a2a";
	colors.button = "#0d73d6";
	colors.button = "#999999"

	var state = {};
	state.wrap = container;

	state.defs = {};
	state.defs.growth = {title:"Defining growth"};
	state.defs.prosperity = {title:"Defining prosperity"};
	state.defs.inclusion = {title:"Defining inclusion"};

	state.defs.growth.overall = "Growth indicators measure change in the size of a metropolitan area economy and its level of entrepreneurial activity. Growth and entrepreneurship create new opportunities for individuals and can help a metropolitan economy become more efficient. The Metro Monitor measures growth in gross metropolitan product, number of jobs, and number of jobs at young firms.";
	state.defs.prosperity.overall = "Prosperity captures changes in the average wealth and income produced by an economy. When a metropolitan area grows by increasing the productivity of its workers, through innovation or by upgrading workers’ skills, for example, the value of those workers’ labor rises. As the value of labor rises, so can wages. Increases in productivity and wages are what ultimately improve living standards for workers and families and the competitiveness of metropolitan economies.";
	state.defs.inclusion.overall = "Inclusion indicators measure how the benefits of growth and prosperity in a metropolitan economy—specifically, changes in employment and income—are distributed among individuals. Inclusive growth enables more people to invest in their skills and to purchase more goods and services. Thus, inclusive growth can increase human capital and raise aggregate demand, boosting prosperity and growth. Ensuring that all people can contribute to and benefit from growth and prosperity also helps sustain widespread support for the policies on which growth and prosperity depend.";

	state.defs.growth.indicators = [
		{
			title: "Gross metropolitan product (GMP)",
			definition: "Like gross domestic product, GMP measures the total value of goods and services produced in a metropolitan area, including wages and profits.", 
			source: "Moody's Analytics",
			key:"output"
		},
		{
			title: "Jobs",
			definition: "The total number of occupied full- and part-time employment positions in a metropolitan economy.", 
			source: "Moody's Analytics",
			key:"emp"
		},
		{
			title: "Jobs at young firms",
			definition: "The total number of full- and part-time jobs at young, private-sector firms aged five years or less. This measures the employment impact of entrepreneurship and new ventures in a metropolitan area.", 
			source: "U.S. Census Bureau’s Longitudinal Employer-Household Dynamics program",
			key:"emp5u"
		}
	]

	state.defs.prosperity.indicators = [
		{
			title: "Standard of living",
			definition: "GMP, from above, divided by total metropolitan population yields GMP per capita, which reflects a metropolitan economy’s average standard of living.", 
			source: "Moody's Analytics and the U.S. Census Bureau",
			key:"gdpcap"
		},
		{
			title: "Productivity",
			definition: "GMP, from above, divided by the total number of jobs, from above, yields average GMP per job, a crude measure of a metropolitan economy’s productivity.", 
			source: "Moody's Analytics",
			key:"gdpjob"
		},
		{
			title: "Average annual wage",
			definition: "Aggregate annual wages paid to workers divided by the total number of jobs yields the average annual wage per job in a metropolitan economy.", 
			source: "Moody's Analytics",
			key:"avgwage"
		}
	]

	state.defs.inclusion.indicators = [
		{
			title: "Employment rate",
			definition: "The share of all individuals aged 18 to 65 who are employed.", 
			source: "U.S. Census Bureau",
			key:"epop"
		},
		{
			title: "Median wage",
			definition: "The annual wage earned by the person in the middle of a metropolitan area’s income distribution (among people at least 16 years old).", 
			source: "U.S. Census Bureau",
			key:"medearn"
		},
		{
			title: "Relative poverty",
			definition: "The share of people earning less than half of the local median wage (among people at least 16 years old).", 
			source: "U.S. Census Bureau",
			key:"relpov"
		}
	]

	var get_def_from_key = function(key){
		var def;
		var i=-1;
		while(++i < 3){
			if(state.defs.growth.indicators[i].key == key){
				var def = state.defs.growth.indicators[i];
				break;
			}
			if(state.defs.prosperity.indicators[i].key == key){
				var def = state.defs.prosperity.indicators[i];
				break;
			}
			if(state.defs.inclusion.indicators[i].key == key){
				var def = state.defs.inclusion.indicators[i];
				break;
			}
		}
		return def;
	}

	//append the definition to container for the specified variable key
	state.define = function(key, container){
		if(arguments.length > 1){
			state.wrap = container;
		}

		try{
			var thiz = d3.select(state.wrap).style("cursor","default");
			

			var tooltip = thiz.append("div")
								.style("position","fixed")
								.style("display","none")
								.style("width","300px")
								.style("background-color","#fafafa")
								.style("border","1px solid #0d73d6")
								.style("padding","0.75em")
								;

			var xy = place_tip(tooltip.node(),null,0);

			var divinline = thiz.append("div")
								.style("width","20px")
								.style("height","15px")
								.style("display","inline-block")
								.style("vertical-align","middle")
								.style("line-height","15px")
								;

			var svg = divinline.append("svg").attr("width","100%").attr("height","100%");

			svg.append("circle").attr("cx","12px").attr("cy","7").attr("r","7").attr("fill","#0d73d6");
			svg.selectAll("rect").data([1,1]).enter().append("rect")
								 .attr("x",11)
								 .attr("y",function(d,i){
								 	return i==0 ? 2 : 6;
								 })
								 .attr("width","2")
								 .attr("height", function(d,i){
								 	return i==0 ? 2 : 6;
								 })
								 .attr("fill", "#ffffff")
								 .style("shape-rendering","crispEdges")
								 ;

			tooltip.append("p").text(get_def_from_key(key).definition).style("margin","0em").style("text-align","left");

			var tiptimer;
			thiz.on("mouseenter", function(d,i){
				clearTimeout(tiptimer);
				tooltip.style("display","block");
			
				tiptimer = setTimeout(function(){
					var box = state.wrap.getBoundingClientRect();
					var bottom = box.bottom+10;
					var middle = box.left + ((box.right-box.left)/2);
					var left = middle - 150;
					var pos = xy([left, bottom]);
					tooltip.style("visibility","visible").style("top",bottom+"px").style("left",pos[0]+"px");
				},300)
			});

			var hidetip = function(wait){
				if(arguments.length == 0){
					wait = 300;
				}
				clearTimeout(tiptimer);
				tiptimer = setTimeout(function(){
					tooltip.style("display","none").style("visibility","hidden");
				},wait)
			}

			thiz.on("mouseleave", function(d,i){
				hidetip();
			});

			window.addEventListener("scroll", function(){
				hidetip(0);
			});


		}
		catch(e){

		}
	}

	state.build = function(container){
		if(!!container){state.wrap = container}
		try{
			var wrap = d3.select(state.wrap)
						 .style("margin","0em 0em 4em 0em")
						 .style("padding","0em")
						 .classed("c-fix",true)
						 ;

			var buttonbox = wrap.append("div").classed("c-fix",true)
											  .style("padding","0px")
											  .style("border", "0px solid #dc2a2a")
											  .style("background-color",colors.strip)
											  .style("border-width", "0px 0px");
			var buttons = buttonbox.selectAll("div").data([
							{key:"growth", value:"Growth"},
							{key:"prosperity", value:"Prosperity"},
							{key:"inclusion", value:"Inclusion"}])
							.enter().append("div")
							.style("float","left")
							.style("cursor","pointer")
							.style("padding","0.5em 1em 0.5em 1em")
							.classed("disable-highlight", true)
							.style("margin","0px 1px 1px 0px")
							;
							
			var buttontext = buttons.append("p")
							.style("margin","0em")
							.style("font-weight","bold")
							.text(function(d,i){return d.value})
							;

			var defwrapper = wrap.append("div")
								.style("background-color", colors.background)
								.classed("row-of two-three", true)
								;

			var titlebox = defwrapper.append("div")
								.style("padding","1em 1em 2em 1em")
								.style("background-color",colors.background_emphasis);
			
			var contentbox = defwrapper.append("div")
											.style("padding","0em")
											.append("div")
											.style("padding","1em 1em 1em 1em")
											.style("margin","1em 0em 1em 0em")
											.append("div")
											.classed("c-fix row-of three-cells",true);
			function sync(d,i){
				buttons.style("background-color", function(e,j){
					return i===j ? colors.highlight : colors.button;
				});

				buttontext.style("color", function(e, j){
					return i===j ? "#ffffff" : "#ffffff";
				}).style("font-size","1.15em");

				var titles = titlebox.selectAll("p").data([state.defs[d].title, state.defs[d].overall]);
				titles.enter().append("p").merge(titles).text(function(d,i){
					return d;
				}).style("font-weight",function(d,i){return i==0 ? "bold" : "normal"})
				.style("font-size","1em")
				.style("margin","1em")
				;
				
				var defboxes = contentbox.selectAll("div").data(state.defs[d].indicators);

				var defs = defboxes.enter().append("div")
									.merge(defboxes)
									.selectAll("p").data(function(d,i){
										return [d.title, d.definition, d.source]
									});
				defs.enter().append("p").merge(defs)
				.style("font-weight", function(d,i){
					return i===0 ? "bold" : "normal";
				})
				.style("margin","0em 0em 0.5em 0em")
				.classed("", function(d,i){return i===0})
				.classed("source-text", function(d,i){return i===2})
				.text(function(d,i){
					return i===2 ? "Source: " + d : d 
				});

			}

			buttons.on("mousedown", function(d,i){
				sync(d.key, i);
			});

			var order = {growth:0, prosperity:1, inclusion:2}

			if(order.hasOwnProperty(showonly)){
				sync(showonly, order[showonly])
				buttonbox.style("display","none");
			}
			else{
				sync("growth", order["growth"]);
			}
		}
		catch(e){
			console.log("Error loading definitions, please reload page.")
		}
	}


	return state;
}