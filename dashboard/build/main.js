//add browser compat message: test for svg, array.filter and map

//To do: review handling of missing values in all modules: both implicit and explicit missings

//shared js-modules
import card from '../../../js-modules/card-api.js';
import nameshort from '../../../js-modules/nameshort.js';
import dir from '../../../js-modules/rackspace.js';
import table from '../../../js-modules/table.js';
import dimensions from '../../../js-modules/dimensions.js';
import metro_select from '../../../js-modules/metro-select.js';
import metro_map from '../../../js-modules/metro-maps.js';
import waypoint from '../../../js-modules/on-scroll2.js';

//project-specific js-modules
import definitions from './definitions.js';
import header from './header.js';
import ranks_and_distributions from './ranks-and-distributions-card.js';
import shift_shares from './shift-shares.js';
import trend_lines from './trend-lines.js';
import section_header from './section-header.js';
import time_select from './time-select.js';

//window.addEventListener("scroll", function(){console.log("SCROLL...")});

dir.add("json");
dir.add("json17", "data/2017/json")

//for now, run the app locally
dir.local("./");

var overall = dir.url("json", "coreIndicators.json");
var combined = dir.url("json", "combinedIndicators.json");



//KEEP TRACK OF ALL CARDS AND SCROLL EVENTS HERE
var cards = {}

//KEEP TRACK OF CURRENT METRO AND TIME PERIOD
var scope = {}
scope.metro = "47900";
scope.period = "five";
scope.periods = {one:"2014–2015", five:"2010–2015", ten:"2005–2015"}

var sectionHeader = section_header(scope);


function main(){

	//TESTING OF SCROLL
	/*(function(){
		window.addEventListener("scroll", function(){console.log("scrolled")})

		var id = ["one","two","three","four","five","six"];
		var i = -1;

		function expand(){
			if(++i < id.length){
		    var el = document.getElementById(id[i]);
		    el.style.height = "600px"
		    setTimeout(expand, 1000);
		   }
		}

		expand();
	})();*/
	//END TESTING OF SCROLL



	var mhead = header()
			.parent(document.getElementById("mm-wrap"))
			.height(220, 70)
			.build(document.getElementById("mm-header"));

	var header_content = mhead.content
							.append("div")
							.style("padding", "5px 0em 0px 0em")
							.classed("c-fix content-box",true);

	var iselect_wrap = header_content.append("div")
			.style("float","left")
			.style("margin","0em")
			.classed("c-fix",true)
			;
	iselect_wrap.append("p").text("Overall rankings will go here").style("margin","5px 0em 0em 0em");
	iselect_wrap.selectAll("div.ranking-tile").data([1,2,3]).enter().append("div")
			.style("float","left")
			.style("width","100px")
			.style("height","80px")
			.style("border","1px solid #aaaaaa")
			.style("margin","0.25em 1em 1em 0em")
			;

	var tselect_wrap = header_content.append("div")
			.style("float","right")
			.style("margin","0em 0em 0em 2em")
			;

	var mselect_wrap = header_content.append("div")
		.style("float","right")
		;

	//headers
	sectionHeader.factory(document.getElementById("growth-section-header"), "Growth");
	sectionHeader.factory(document.getElementById("prosperity-section-header"), "Prosperity");
	sectionHeader.factory(document.getElementById("inclusion-section-header"), "Inclusion");
	sectionHeader.factory(document.getElementById("methods-section-header"), "Methodology notes", null);
	
	sectionHeader.factorySpecial(document.getElementById("data-section-header"));


	//build select menu, and use its metro name lookup function
	var mselect = metro_select().setup(mselect_wrap.node()).update(scope.metro);
	var tselect = time_select().setup(tselect_wrap.node()).update(scope.period);


	setTimeout(function(){
		mselect.onchange(function(d){
			var sel = this;
			scope.metro = d.CBSA_Code;
			cards.growth1.updateMetro();
			cards.growth2.updateMetro();
			cards.growth3.updateMetro();
			cards.growth4.updateMetro();

			cards.prosperity1.updateMetro();
			cards.prosperity2.updateMetro();
			cards.prosperity3.updateMetro();

			cards.inclusion1.updateMetro();
			cards.inclusion2.updateMetro();
			cards.inclusion3.updateMetro();

			sectionHeader.update();
		});

		tselect.onchange(function(d){
			var sel = this;
			scope.period = d.period;
			cards.growth1.updatePeriod();
			cards.growth2.updatePeriod();
			cards.growth3.updatePeriod();
			cards.growth4.updatePeriod();

			cards.prosperity1.updatePeriod();
			cards.prosperity2.updatePeriod();
			cards.prosperity3.updatePeriod();

			cards.inclusion1.updatePeriod();
			cards.inclusion2.updatePeriod();
			cards.inclusion3.updatePeriod();

			sectionHeader.update();
		});
	},0)

								
	scope.metro_lookup = mselect.lookup;

	//all cards go below this line__________________

	//attach all card activate functions to a single scroll container? try both
	cards.growth1 = ranks_and_distributions(document.getElementById("growth-card1"),
													dir.url("json17", "growth_change.json"),
													scope);

	//activate is the onscroll method that loads data and draws
	cards.growth1.activate();


	cards.growth2 = trend_lines(document.getElementById("growth-card2"),
													dir.url("json17", "growth_values.json"),
													scope);

	cards.growth2.activate();


	var growth_card_3 = document.getElementById("growth-card3");
	cards.growth3 = metro_map(growth_card_3, 
								dir.url("json17", "growth_map_data.json"),
								scope, 
								[{key:"emp", title:"Employment"},
								 {key:"output", title:"Output"},
								 {key:"emp5u", title:"Employment in new firms"}
								]);

	waypoint(growth_card_3)
		.activate(function(){
			cards.growth3.activate();
		})
		.scrolling(function(pos){
			//console.log("scrolling by..." + JSON.stringify(pos));
		})
		.buffer(0.1);
		
		//.viewing(function(){
		//	console.log("VIEWING!!!");
		//});


	var growth_card_4 = document.getElementById("growth-card4");
	cards.growth4 = shift_shares(growth_card_4, dir.url("json17", "shiftshare.json"), scope);

	waypoint(growth_card_4)
		.activate(function(){
			cards.growth4.activate();
		})
		.buffer(0.1);

	//metro_map(document.getElementById("growth-card3")).responsive();

	//build definitions menu
	definitions(document.getElementById("mm-defs")).build();

	//PROSPERITY
	cards.prosperity1 = ranks_and_distributions(document.getElementById("prosperity-card1"),
													dir.url("json17", "prosperity_change.json"),
													scope);

	//activate is the onscroll method that loads data and draws
	cards.prosperity1.activate();


	cards.prosperity2 = trend_lines(document.getElementById("prosperity-card2"),
													dir.url("json17", "prosperity_values.json"),
													scope);

	cards.prosperity2.activate();


	var prosperity_card_3 = document.getElementById("prosperity-card3");
	cards.prosperity3 = metro_map(prosperity_card_3, 
								dir.url("json17", "prosperity_map_data.json"),
								scope, 
								[{key:"gdpjob", title:"GDP per job"},
								 {key:"gdpcap", title:"GDP per capita"},
								 {key:"avgwage", title:"Average annual wage"}
								]);

	waypoint(prosperity_card_3)
		.activate(function(){
			cards.prosperity3.activate();
		})
		.scrolling(function(pos){
			//console.log("scrolling by..." + JSON.stringify(pos));
		})
		.buffer(0.1);	


	//INCLUSION
	cards.inclusion1 = ranks_and_distributions(document.getElementById("inclusion-card1"),
													dir.url("json17", "inclusion_change.json"),
													scope);

	//activate is the onscroll method that loads data and draws
	cards.inclusion1.activate();


	cards.inclusion2 = trend_lines(document.getElementById("inclusion-card2"),
													dir.url("json17", "inclusion_values.json"),
													scope);

	cards.inclusion2.activate();


	var inclusion_card_3 = document.getElementById("inclusion-card3");
	cards.inclusion3 = metro_map(inclusion_card_3, 
								dir.url("json17", "inclusion_map_data.json"),
								scope, 
								[{key:"medearn", title:"Median earnings"},
								 {key:"relpov", title:"Relative income poverty"},
								 {key:"epop", title:"Employment-to-population ratio"}
								]);

	waypoint(inclusion_card_3)
		.activate(function(){
			cards.inclusion3.activate();
		})
		.scrolling(function(pos){
			//console.log("scrolling by..." + JSON.stringify(pos));
		})
		.buffer(0.1);	

}

document.addEventListener("DOMContentLoaded", main);
