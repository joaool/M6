define(["dojo",
		 "dojo/_base/declare",	
		 "dojo/dnd/Mover",	 
		 "dojo/domReady!"], 
	function(dojo,Declare,Mover){	
		return Declare("moveCanvas",Mover, { 
			mouseUpCallback:null,
			constructor:function(){ //sets up return pointer
				var exchange= new exchanger(); // SINGLETON 
				this.mouseUpCallback=exchange.getPointer();//prepares mouseUpCallback with callback function set up in 2 levels up
			},
			onMouseMove: function(e){
				//dojo.dnd.autoScroll(e);
				var m = this.marginBox;
				if(e.ctrlKey){
				  this.host.onMove(this, {l: parseInt((m.l + e.pageX) /50) * 50, t: parseInt((m.t + e.pageY) / 50) * 50});
				}else{
				  this.host.onMove(this, {l: m.l + e.pageX, t: m.t + e.pageY});
				  console.log("usa moveCanvas com x="+e.pageX+" y="+e.pageY);
				}
				dojo.stopEvent(e);
			},
			onMouseUp:function(e){
				console.log("moveCanvas.................  MOUSE UP !");
				dojo.stopEvent(e);
				this.destroy();
				this.mouseUpCallback();
			}
		}); //end of classe moveCanvas
	}//call back function
); //end of require for module 	moveCanvas
