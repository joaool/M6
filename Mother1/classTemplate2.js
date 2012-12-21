	define([ "dojo/_base/declare",
			 "Mother1/debug.js"], 
		function(Declare,Dbg){	
			var oClassName = Declare("className",null, { // comment
				constructor:function(){
					//----------- debug preparation Area -----------------------------------------------------------
					this.oDbg=new Dbg();
					this.oDbg.setThis("className");//All debugs within this class will belong to this debug label
					//----------------------------------------------------------------------------------------------
					if(this.oDbg.isDbg("constructor")) this.oDbg.display("--** CONSTRUCTOR **--");
				},
				test1: function( ) {
					alert("className test1 !!!")
				},
				test2:function(){
				}
			}); //end of declare for classe className
			//-----------------
			// Here STATIC methods and properties:
			//-----------------
			oClassName.property01=1234;
			oClassName.staticTest1= function() {//comment
				alert("className staticTest1 !!!")
			};
			oClassName.staticTest2= function() {//comment
			};	
			return oClassName;
		}//call back function
	); //end of require for module 	className
