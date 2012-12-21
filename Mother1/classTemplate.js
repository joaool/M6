	define(["dojo",
			 "dojo/_base/declare",
			 "dojo/domReady!"], 
		function(dojo,Declare){	
			return Declare("className",null, { // must be a SINGLETON
				constructor:function(){
					//console.log("className -------------------------- CONSTRUCTOR !!! ---------------------");     
				},
				test1: function( ) {
				},
				test2:function(){
				}
			}); //end of classe className
		}//call back function
	); //end of require for module 	className
