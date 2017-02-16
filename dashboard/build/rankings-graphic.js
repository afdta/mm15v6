import ScrollCollection from '../../../js-modules/on-scroll.js';

export default function rankings_graphic(){
	try{

	var colG = ['#bdd7e7','#6baed6','#3182bd'];
	var colP = ['#bae4b3','#74c476','#31a354'];
	var colI = ['#cbc9e2','#9e9ac8','#756bb1'];
	var colAll = colG.concat(colP.concat(colI));
	var order = ["Emp","GMP","Wages","AvgWage","GMPCap","GMPJob","EmpRatio","MedEarn","RelPov"]; //order of segments

	var segLegend = {};
	for(var i=0; i<order.length; i++){
		segLegend[order[i]] = colAll[i];
	}

	var container = this.container;
	var wrap = d3.select(container);

	wrap.append("div").classed("c-fix",true)
		.selectAll("p.legendEntry").data(order).enter().append("p").text(function(d,i){return d})
				.style("color",function(d,i){return segLegend[d]})
				.style("float","left")
				.style("margin-right","8px");

	var svg = wrap.append("svg").style("width","100%").style("height","800px");

	var data = this.get_data();


	function redrawBase(){

		var b = svg.selectAll("g.bars").data(data);
		var be = b.enter().append("g").classed("bars",true);
		be.append("title");
		var bars = be.merge(b);
		b.exit().remove();

		bars.select("title").html(function(d,i){
			try{
				var val = self.lookup[d[0].cbsa][0].CBSA_Title;
			}
			catch(e){
				var val = "";
			}
			return val;

		});

		bars.attr("transform",function(d,i){return "translate(0,"+((i*7)+7)+")"});

		var seg = bars.selectAll("g.segment").data(function(d,i){return d}, function(d,i){return d.ind});
		var seg_e = seg.enter().append("g").classed("segment",true)
		seg_e.append("line");
		var segments = seg_e.merge(seg);
		seg.exit().remove();

		var cumulative = 0;
		segments.attr("transform",function(d,i){
			if(i===0){cumulative = 0} //reset for every new group
			var T =  "translate(" + cumulative*100 + ",0)";
			cumulative = cumulative+d.share;
			return T;

		})

		var lines = segments.select("line")
							.attr("x1",0).attr("y1",0).attr("y2",0).attr("x2",0)
							.attr("stroke-width","6")
							.style("stroke",function(d,i){return segLegend[d.ind]});
		var activate = function(){
			lines.transition().delay(function(d,i){return (i*500)}).duration(1000)
							 .attr("x2",function(d,i){return d.share*100});
		}
	
	var scroll = new ScrollCollection();
	scroll.register(container, activate);

	}

	redrawBase();

}
catch(e){
	console.log(e);
}
};

