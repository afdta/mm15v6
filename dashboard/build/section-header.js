import metro_select from '../../../js-modules/metro-select.js';

export default function section_header(g_scope){
	var lookup = metro_select().lookup;
	var updates = {};
	var numHeaders = -1;

	var build = function(container, title, subtitle_fn){
		var id = "H" + (++numHeaders);
		var wrap = d3.select(container)
			.classed("makesans",true)
			.style("padding","6em 1em 0.5em 1em")
			.style("margin","1em 0em 2em 0em")
			.style("border-bottom", "1px solid rgb(220, 42, 42)");
		var arglen = arguments.length;

		var title = wrap.append("p")
							.style("font-size","2em")
							.style("font-weight","bold")
							.style("text-align","center")
							.style("color","rgb(220, 42, 42)")
							.style("margin","0em")
							.text(title);

		if(subtitle_fn !== null){
			var subtitle = wrap.append("p")
								.style("font-size","1em")
								.style("text-align","center")
								.style("color","rgb(220, 42, 42)")
								.style("text-transform","uppercase")
								.style("margin","0em")
								;

			var subfn = function(){
				var html = arglen < 3 ? "In <strong>" + 
									lookup(g_scope.metro).name + 
									"</strong> / " + g_scope.periods[g_scope.period] :
									subtitle_fn(lookup(g_scope.metro));				
				return html;
			}


			subtitle.html(subfn());

			updates[id] = function(){
				subtitle.html(subfn());
			}
		}
	}

	var buildMain = function(container){
		var id = "H" + (++numHeaders);

		var text = function(){
			return "The " + lookup(g_scope.metro).nameshort + " metropolitan area";
		}

		var wrap = d3.select(container)
						.style("margin","0em 0em 0em 0em")
						;

		var wrap = d3.select(container)
			.classed("makesans",true)
			.style("padding","0em 1em 0.5em 1em")
			.style("margin-bottom","0em")
			.style("border-bottom", "1px solid rgb(220, 42, 42)")
			.style("border-bottom", "0px solid #333333")
			.append("div")
			.classed("content-box",true)
			.style("margin","0px auto")
			;

		wrap.append("p")
			.text("Explore data for")
			.style("font-weight","bold")
			.style("color","#dc2a2a")
			.style("margin","0em")
			;

		var p = wrap.append("p")
			.style("font-weight","bold")
			.style("color","#dc2a2a")
		 	.style("font-size","2em")
		 	.style("margin", "0em 0em 0.2em 0em")
		 	.style("line-height","1.2em")
		 	.text(text())
		 	;	
	
		updates[id] = function(){
			p.text(text());
		}
	}

	var updatefn = function(){
		for(var p in updates){
			if(updates.hasOwnProperty(p)){
				updates[p]();
			}
		}
	}

	return {factory:build, factorySpecial:buildMain, update:updatefn};

}