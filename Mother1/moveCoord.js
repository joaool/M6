define(["dojo",
		 "dojo/_base/declare",
		 "Mother1/debug.js",
		 "dojo/_base/event", 
		 "Mother1/exchanger2.js",
		 "dojo/dnd/Mover"],
	function(dojo,Declare,Dbg,Event,Exchanger,Mover){	
		return Declare("moveCoord",Mover, { 
			mouseUpCallback:null,
			order:null, //position in exchanger of callback pointer (0..4)
			coordinator:null,
			constructor:function(){ //sets up return pointer
				//console.log("------>moveCoord.constructor --------CONSTRUCTOR !!! ------------");
				this.oDbg=new Dbg();
				this.oDbg.setThis("moveCoord");
				//it enters here when drag begins - if there is a mouseUp event pending in reiszeWidget it should be disarmed
				var exchange= new Exchanger(); // SINGLETON 
				this.coordinator=exchange.oPointer[1];
				if(this.oDbg.isDbg("constructor")) this.oDbg.display("Already got coordinator in exchange slot 1");
				//console.log("------>moveCoord..constructor --------FIM DO CONSTRUCTOR !!! ------------");
			},
			setCoordinator:function(coordinator){
				this.coordinator=coordinator;
			},			
			onMouseClick:function(e){
				this.destroy();
				Event.stop(e);
			},
			onMouseMove: function(e){
				this.coordinator.setStatus(false);//informs the coordinator that __isResize=false, ==>move status
				//console.log("moveCoord.onMouseMove THE COORDINATOR IS SET TO MOVE =>this.coordinator.setStatus(false)");
				var m = this.marginBox;
				if(e.ctrlKey){
				  this.host.onMove(this, {l: parseInt((m.l + e.pageX) /50) * 50, t: parseInt((m.t + e.pageY) / 50) * 50});
				}else{
				  this.host.onMove(this, {l: m.l + e.pageX, t: m.t + e.pageY});
				  //console.log("------>moveCoord.onMouseMove move to x="+e.pageX+" y="+e.pageY);
				}
				Event.stop(e);
			},
			onMouseUp:function(e){
				//Event.stop(e);
				var isResize=this.coordinator.getStatus();
				if(this.oDbg.isDbg("onMouseUp")) this.oDbg.display("Got from coordinator isResize="+isResize);
				if(!isResize){
					if(this.oDbg.isDbg("onMouseUp")) this.oDbg.display("-->execute MouseUp because isResize is set to "+isResize);
					var exchange= new Exchanger(); // SINGLETON 
					this.mouseUpCallback=exchange.getPointer();//prepares mouseUpCallback with callback function set up in 2 levels up
					//console.log("--- --- -----------------------------moveCanvas.onMouseUp ........antes de destroy() !.........  MOUSE UP ! content de callback:"+this.mouseUpCallback);
					exchange.oPointer[4]=null; //cleans the signal to inhibit mouseUp event in resizeWidget
					Event.stop(e);
					//dojo.stopEvent(e);
					//console.log("--- ---moveCanvas.onMouseUp ........vai fazer destroy ");
					this.destroy();				
					//console.log("--- ---moveCanvas.onMouseUp ........vai fazer mouseUpCallback ");		
					this.mouseUpCallback();
					//console.log("--- ---moveCanvas.onMouseUp ........vai fazer destroy em MOUSE UP !");
				};
			}
		}); //end of classe moveCanvas
	}//call back function
); //end of require for module 	moveCanvas
