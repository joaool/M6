define(["dojo",
		 "dojo/_base/declare",
		 "dojo/_base/event", 		 
		 "Mother1/exchanger2.js",
		 "dojo/dnd/Mover",
		 "dojo/domReady!"], 
	function(dojo,Declare,Event,Exchanger,Mover){	
		return Declare("moveCanvas",Mover, { 
			mouseUpCallback:null,
			order:null, //position in exchanger of callback pointer (0..4)
			constructor:function(){ //sets up return pointer
				console.log("--- ---moveCanvas.constructor .................  ENTROU!");

				/*
				var exchange= new Exchanger(); // SINGLETON 
				this.order=exchange.static.order;
				this.mouseUpCallback=exchange.getPointer(xOrder);//prepares mouseUpCallback with callback function set up in 2 levels up
				alert("moveCanvas registou order="+this.order+" e function="+this.mouseUpCallback);
				//in order to know which element is moving
				*/
			},
			onMouseMove: function(e){
				//dojo.dnd.autoScroll(e);
				var m = this.marginBox;
				if(e.ctrlKey){
				  this.host.onMove(this, {l: parseInt((m.l + e.pageX) /50) * 50, t: parseInt((m.t + e.pageY) / 50) * 50});
				}else{
				  this.host.onMove(this, {l: m.l + e.pageX, t: m.t + e.pageY});
				  //console.log("usa moveCanvas com x="+e.pageX+" y="+e.pageY);
				}
				Event.stop(e);
			},
			onMouseUp:function(e){
				//Event.stop(e);
				var exchange= new Exchanger(); // SINGLETON 
				//this.order=exchange.static.order;
				this.mouseUpCallback=exchange.getPointer();//prepares mouseUpCallback with callback function set up in 2 levels up
				//alert("moveCanvas MOUSE UP registou order="+this.order+" e function="+this.mouseUpCallback);		
				console.log("--- ---moveCanvas.onMouseUp ........antes de destroy().........  MOUSE UP !");
				this.destroy();
				console.log("--- ---moveCanvas.onMouseUp .................  MOUSE UP !");
				Event.stop(e);
				//dojo.stopEvent(e);
				this.mouseUpCallback();
			}
		}); //end of classe moveCanvas
	}//call back function
); //end of require for module 	moveCanvas
