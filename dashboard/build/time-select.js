//left off here

export default function time_select(){
	var sel = {};

	sel.setup = function(container){

		var odata = [{period:"one", label:"2014–2015"},{period:"five", label:"2010–2015"},{period:"ten", label:"2005–2015"}];


		var wrap = d3.select(container).classed("makesans",true);
			wrap.selectAll("*").remove(); //there's no updating here

		var instruction = wrap.append("p").html("Time period: ")
										  .style("display","inline-block")
										  .style("margin","0em")
										  .style("line-height","1em")
										  .style("font-size","0.8em")
										  .style("padding","0px 0px 0px 6px")
										  //.style("color","#dc2a2a")
										  .style("text-transform","uppercase");

		var select = wrap.append("select").style("display","block")
										  .style("margin","0px 0px 0px 0px")
										  .style("line-height","1.65em")
										  .style("font-size","1em")
										  .style("padding","2px 5px 2px 5px")
										  .style("background","transparent")
										  //.style("color","#dc2a2a")
										  //.style("border-color","#dc2a2a")
										  .style("outline","none");

		this.node = select.node();

		var options = select.selectAll("option").data(odata).enter().append("option");
			options.attr("value", function(d,i){return d.period})
				   .text(function(d,i){return d.label})
				   .style("color","#333333");

		select.on("change", function(d,i){
			var val = this.value;
			try{
				var m = odata[this.selectedIndex];

				if(m.period!==val){
					throw "ERROR";
				}
			}
			catch(e){
				var m = odata[0];
				sel.update(m.period);
			}

			if(!!sel.onchg){
				sel.onchg(m);
			}
		});
		return sel;
	}

	//update the selection, but don't trigger change event
	sel.update = function(val){
		if(this.node){
			this.node.value = val;
		}

		return sel;
	}
	//the callback executes with the sel object as this
	sel.onchange = function(callback){
		sel.onchg = callback;

		return sel;
	}

	return sel;
}
