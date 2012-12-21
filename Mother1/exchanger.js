	define(["dojo",
			 "dojo/_base/declare",
			 "dojo/domReady!"], 
		function(dojo,Declare){	
			return Declare("exchanger",null, { // must be a SINGLETON
				static:{oPointer:null,id:null,handlesZone:null},
				setPointer: function( pointer) {
					this.static.oPointer= pointer;
				},
				getPointer: function() {
					return this.static.oPointer;
				}
			}); //end of classe exchanger
		}//call back function
	); //end of require for module 	exchanger
