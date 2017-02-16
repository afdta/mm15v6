//args
//container: div to make the header wrap
//parent (optional): specify the element that wraps the header
	//useful if you want to fix the header to the bottom of the parent element when it (the bottom) is in view
	//enables multiple headers on a single page
	//makes parent element relative positioned

export default function header(){
	var O = {};

	var height = 91;
	var height_fixed = 46
	var parent = null;
	var container = null;

	var background_color = "#eeeeee";
	var background_color_fixed = "#dddddd";

	var num_args = arguments.length;

	O.height = function(h0, h1){
		if(arguments.length > 0){
			height = h0+1;
			height_fixed = !!h1 ? h1+1 : height;
			return O;
		}
		else{
			return height;
		}
	}

	O.parent = function(p){
		if(arguments.length > 0){
			parent = p;
			d3.select(parent).style("position","relative");
			return O;
		}
		else{
			return parent;
		}

	}

	O.build = function(container_element, callback){
		if(arguments.length > 0){
			container = this.wrap = container_element;

			var wrap = d3.select(container).style("height", height+"px")
										  .style("width","100%")
										  .classed("fixed-menu",true);

			var inner =  wrap.append("div").style("height", height+"px")
										   //.style("background-color","#fafafa")
										   .style("background-color",background_color)
										   .style("z-index","100")
										   //.style("border","1px solid #dc2a2a")
										   //.style("border-width","1px 0px 1px 0px")
										   .classed("c-fix",true);

			var content = inner.append("div")
						.classed("content-box full-bleed",true)
						;

			this.content = content;

			//track the header: 0-default, 1-fixed, 2-absolute
			var position = 0;

			//scroll event handler
			function pos(){

				var window_height = Math.max(document.documentElement.clientHeight, (window.innerHeight || 0));

				var past_bottom = (!!parent && parent.getBoundingClientRect().bottom < window_height-height_fixed) ? true : false;

				var rect = container.getBoundingClientRect();
				try{
					if(rect.bottom < 0 && !past_bottom){
						if(position !== 1){
							inner.interrupt()
								 .style("position","fixed")
								 .style("bottom", (-height_fixed+"px"))
								 .style("height", height_fixed+"px")
								 .style("background-color",background_color_fixed)
								 .style("top","auto")
								 .style("left","0px")
								 .style("width","100%")
								 .transition()
								 .duration(400)
								 .style("bottom","-1px")
								 //.on("end", function(d,i){
								 	//force repaint. sometime transition results in a 1px gap
								 //	inner.style("bottom","-1px").style("display","block");
								 //})
								 ;
							position = 1;
						}
					}
					else if(rect.bottom < 0 && past_bottom){
						if(position !== 2){
							inner.interrupt()
								 .transition()
								 .duration(0)
								 .style("position","absolute")
								 .style("bottom","auto")
								 .style("height",height+"px")
								 .style("background-color",background_color)
								 .style("top","calc(100% + 2em)")
								 .style("left","0px")
								 .style("width","100%")
								 ;
							position = 2;
						}
					}
					else{
						inner.interrupt().transition().duration(0)
								 .style("position","relative")
								 .style("width","auto")
								 .style("height",height+"px")
								 .style("background-color",background_color)
								 .style("top","auto")
								 .style("bottom","auto")
								 ;
						position = 0;
					}
				}
				catch(e){
					inner.style("position","relative").style("width","auto");
				}
			}

			//set up in next tick
			setTimeout(function(){
				pos();
				window.addEventListener("scroll", pos);
				window.addEventListener("resize", pos);
			}, 0);
			
				/*pos();
				window.addEventListener("scroll", pos);*/

		}

		return O;
	}

	return O;
}
