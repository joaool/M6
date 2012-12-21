define([ "dojo/_base/declare" , "dojo/dom"],
//--- 2nth parameter for the define() call: callback function definition
function( Declare, dom ){	// the 2 parameters passed to the function must match with the sequence of required modules in the array (1st parameter)
var oClassName= Declare(null, {  // "CLASSNAME", oldfashion: Declare("CLASSNAME", null, {...}); newFashion:  Declare( null, {...});. ClassName is defined by the module using this declare
	// This DojDebug class is developed in order not to have to use old fashioned alert() with dojo when we do not know what is happening
	//----------------------------------------------------------------
	// How to setup:
	//    0) in the "requires" for leading and called classes place: "Mother1/debug.js",  with the alias:Dbg
	//
	//    1) in the leading source file (html):
	//		 1.1 - Define the debug object as a global (to be called with "this"): oDbg=null; imediatly after <script> (before dojo require());
	//		 1.2 - Create the oDbg object (shortly after the "{" of the function): 	this.oDbg=new Dbg();
	//       1.3 - Define which classes will have the debug active and which debug processes within those classes:setDbg("<class name>","<indent>",{"<process 1":"on/off","<process 2":"on/off",....,"<process n":"on/off"});
	//           Ex:
	//              this.oDbg.setDbg("test_save_restore_json","",{"myTest1":true,"fim":true});//All debugs in this class with these keywords will be send to console.log
	//	  	        this.oDbg.setDbg("json2FormDsgn2"        ,"->",{"constructor":true,"buildWidgets":true});//All debugs in this class with these keywords will be send to console.log
    //
	//       1.4 - If you have debugging code in the leading file (html) no not forget:oDbg.setThis("<current file name>")
	//			 Ex:oDbg.setThis("test_save_restore_json");//The name of the current source !!! 
	//
	//    2) Within each class:
	//       2.0 - place in the require: "Mother1/debug.js",  with the alias:Dbg
	//       2.1 - In the class constructor
	//			   a)define the class property --> oDbg:null,
	//			   b) In the constructor instanciate the debuger and inform the name that the debugger will adopt to the class (generally the class name)
	//             Ex:
	//				  this.oDbg=new Dbg();
	//  			  this.oDbg.setThis("json2FormDsgn2");//All debugs within this class will belong to "json2FormDsgn2"
	//  USING:
	//	     2.1 - In the code points:
	//             Call display method (equivalent to "console.log") with: if(oDbg.isDbg("<debug process>")) oDbg.display(<"message">);
	//             Ex:
	//				  if (this.oDbg.isDbg("constructor") ) this.oDbg.display("--** CONSTRUCTOR **--");
	//       2.2 - If we want to show an error message if an error condition verifies add the error condition as a second paramenter in display method:
	//			   Ex:
	//					if(this.oDbg.isDbg("main")) this.oDbg.display("x should be 1 -- x="+x,x!=1);
	//                  The above message "x should be 1 -- x="+x will only show up if the error condition (x!=1) evaluates to true
	//					if the condition verifies, the debugger will show the message in red
	//            NOTE1:The above point does not substitutes console.assert() that will show the line of the problem. ex:console.assert((x == 1), "assert message: x != 1");//note that the condition in assert is the no show" condition
	//	          NOTE2:long messages will show up in an organized block with ligth blue color
	//
	//===================================================================
		__isDebugOn:true,
		__htmlDiv:null,
		__iTimeIni:null,
		__iTimeLast: null,
		__isInitialized: false,
		// ----- JO
		__lastId:null,
		__currentClass:null,
		__indent:null,
		
		constructor: function( ) {
			this.__iTimeIni= new Date().getTime();
		},
		setThis: function( classId ) {
			this.__currentClass=classId; // sets classId to be used in all debug processes inside this class
		},
		// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/*		
		__dbgSets: {}, // this is a repository for properties to be set using setDbgOnOff
		// @@@@@@@@@@@@@@@@@
		setDbgOnOff: function( id, isOn ) {
			this.__dbgSets[id]=isOn; // sets a new or existing property named id in __dbgSets. This property will have a value true or false
			
		},
*/		
		__dbgClasses: {}, //JO this is a repository for Classes (the same as sources) to be set using setDbgClassOnOff
		setDbg: function( classId,xIndent,oProcess ) {//sets the class where debugger will show and the active processes within that class
			//setDbg("<class name>","-->",{"<process 1":"on/off","<process 2":"on/off",....,"<process n":"on/off"});
			//example setDbg("test_mother_json1":{"inicio":true,"fim":false});
			oProcess.__indent=xIndent;//adding a new property to an existing object
			this.__dbgClasses[classId]=oProcess; // sets a new or existing source named in __dbgCasses. This property will have a value true or false for each process	
			//alert("setDbg1 --> classId="+classId+" ficou com:"+JSON.stringify(this.__dbgClasses[classId]));
			//alert("setDbg2 --> classId="+classId+" myTest1 ficou com:"+this.__dbgClasses[classId]["myTest1"]);//OK
		},		
		// if a certain class is activated  all debug processes inside that class will be activated
		
		// @@@@@@@@@@@@@@@@@
		// Shows debug info (calling this.debug()) only if the id has been allowed to display
		// toShow can be a string (or number) or it can be a callback function which should return some text to show in the debug.
		// this option (of a callback) is done so that no time is spent constructing a string with debug info IF the ID is not allowed to display
		// Ex: oDbg.dbg("mytest01","o meu valor="+ myFunc(xyz) );
		// Ex: if( oDbg.isDbg("mytest01") ) oDbg.dbg("mytest01","o meu valor="+ myFunc(xyz) );
		//--------------
		//dbg: function( id, toShow,   thiz) { // this dbg function will only call this.debug(toShow) if the id has been allowed to display
		//dbg: function( toShow,   thiz) { // this dbg function will only call this.debug(toShow) if the id has been allowed to display
		display: function( toShow,xNotAssert,thiz) { // this display function will only call this.debug(toShow) if the id has been allowed to display
			var id=this.__lastId;
			var xError=false;
			if(xNotAssert!=null){
				//alert("par 2 definido ");	//now it checks if there is an error condition
				if(xNotAssert){//Error condition - enters if xNotAssert=true==>Error=>message should be displayed
					//alert("par 2 definido - condição de erro verificada  !!!  xNotAssert="+xNotAssert);// se for true entra aqui if xNotAssert=true ex (x!=1) (qdo x=2). se der null or false não entra
					xError=true;
				}else{
					return; //returns without displaying the line !!!!
				};
			};	
			if(xError){
				//	console.assert(x==1,"x deveria ser 1 !!!! current value de x="+x);//espectacular - mostra alinha de código onde o problema ocorreu
				console.assert(!xNotAssert,toShow);//shown inside debug.js
				return;
			};	
			var sType= typeof(toShow);
			if ( sType=="string" || sType=="number") { 
				//this.debug('"'+id+'": @@['+toShow+']@@');
				var iT= new Date().getTime();
				var iTd1= iT -this.__iTimeIni;
				var iTd2; //= iT- this.__iTimeIni;
				if ( this.__isInitialized  ){ // this.__iTimeLast ==null
					iTd2= iT - this.__iTimeLast;
					// console.log("############# itmeLast NOT NULL");
					
				} else {
					iTd2= 0; // iT - this.__iTimeIni;
					this.__iTimeIni= iT;
					iTd1=0;
					// console.log("####@@@@@@@@@@@@@@@ ######### itmeLast == NULL");
					this.__isInitialized =true;
					
				};
				// ------- show content -----------------------------
				//var callerFunc = arguments.callee.caller.toString(); //this returns the function text !!!
				//var callerFuncName = callerFunc.substring(0,100);
				//var x1=this.__unTrimLeft(iTd1, 5, "0")+ "/" +this.__unTrimLeft(iTd2, 4, "0");
				var x1=this.padding_right(this.__unTrimLeft(iTd1, 5, "0")+ "/" +this.__unTrimLeft(iTd2, 4, "0")," ",11);//xxxxx/xxxx
				var x2=this.padding_right('"'+id+'":'," ",15);//<process id>:       //
				//padding_right('1234', '0', 9);
				
				if((x1+x2+toShow+'<--').length>190){
					var x2Repeat=(190-((x1+x2).length))/2;
					//console.log((x1+" "+"-".repeat(x2Repeat))+"["+callerFuncName+"] "+x2+("-".repeat(x2Repeat)));
					console.log((x1+" "+"=".repeat(x2Repeat))+"["+x2+"] "+("=".repeat(x2Repeat)));
					console.info("---->"+toShow+"<----  END");//show it in a second line (including text introduced in display...
					console.log("=".repeat(200));// closing 
				}else{
					//console.log(x1+"["+callerFuncName+"] "+x2+toShow+'<--');
					console.log(x1+"-"+this.padding_right(this.__indent+this.__currentClass," ",25)+"->"+x2+"["+toShow+"] ");
				};	
				//------------------------
				//	console.assert(x==1,"x deveria ser 1 !!!! current value de x="+x);//espectacular

				this.__iTimeLast= iT;
			} else if ( sType =="function") {	
				var sResult;
				if ( thiz ) { 
					sResult= toShow.call(thiz);
				} else {
					sResult= toShow();
				}; // else end
				//this.debug('"'+id+'": @@['+sResult+']@@');
				// console.log('"'+id+'": @@['+sResult+']@@');
			} else {
				
			}; // else end		
			//}; // endif
			String.prototype.repeat = function(n) {
				//use console.log("ha".repeat(5));  // hahahahaha
				return new Array(1 + parseInt(n)).join(this);//array só aceita inteiros !!!
			};
		},//dbg
		// @@@@@@@@@@@@
		isDbg: function(id){ // isDbg() allows you to write if (this.oDbg.isDbg("someId")) { this.oDbg.display("message to display")} where the true portion of the if() is not executed 
		// ------------------// if the id is not set for debugging
		//example: if (this.oDbg.isDbg("myTest1") ) this.oDbg.display("message to display");
			//return false; enable this line to remove the debugger completly !!!
			var isOn=false;
			if(!this.__currentClass)//checks if thr Dbg class knows the class whose permission to write is being demanded
				alert("Error in debug.isDbg ->Please do not forget to define this.oDbg.setThis(<current file name>)");  
			//alert("isDbg1 current id="+id+" current class="+this.__currentClass); //CURRENT CLASS AVAILABLE
			//alert("isDbg2a current id="+id+" current class="+this.__currentClass+" stringify="+JSON.stringify(this.__dbgClasses)); 
			//alert("isDbg2b current id="+id+" current class="+this.__currentClass+" stringify="+JSON.stringify(this.__dbgClasses[this.__currentClass])); 
			//alert("isDbg3 current id="+id+" current class="+this.__currentClass+" Permission="+this.__dbgClasses[this.__currentClass][id]); 
			//isOn=true;
			
			//We need to check if the leading source has given permission to Dbg to write in the demanding class - if not--> this.__dbgClasses[this.__currentClass] will give an error
			if(!this.__dbgClasses[this.__currentClass]){//checks if thr Dbg class knows the class whose permission to write is being demanded
				//alert("Leading source gave no permission to dependent class "+this.__currentClass+' to write in Dbg. You could allow it with: this.oDbg.setDbg("'+this.__currentClass+'",....');
			}else if ( this.__dbgClasses[this.__currentClass][id] ) {//setDbg("<class name>":{"<process 1":"on/off","<process 2":"on/off",....,"<process n":"on/off"});
				this.__lastId=id;
				this.__indent=this.__dbgClasses[this.__currentClass].__indent;
				//alert("entrou em isDbg !!!! com id="+id);
				isOn=true;
			};	
			return isOn;
		},
		
		
		__unTrimLeft : function( value , size, fillPatt) {
			var sOut=""+value; // to make sure value  becomes a string
			while (sOut.length < size) {
				sOut= fillPatt+sOut;
			};
			return sOut;
		},
		padding_right:function(s, c, n) {// right padding s with c to a total of n chars. ex: padding_right('1234', '0', 9); // 123400000
			if (! s || ! c || s.length >= n) {
				return s;
			}

			var max = (n - s.length)/c.length;
			for (var i = 0; i < max; i++) {
				s += c;
			}

			return s;
		}
		
//================================================================
// Ending above is the end of the real code for the class we want to create. All of what follows is overhead required by dojo
} //end of contents of class "CLASSNAME"
);  // end of call to function Declare
//--------------------------
// coisas estaticas
oClassName.__isDebugOn=true;
oClassName.__htmlDiv=null;
oClassName.__iTimeIni=null;
oClassName.__iTimeLast= null;
oClassName.__isInitialized= false;
// ----- JO
oClassName.__lastId=null;
oClassName.__currentClass=null;
oClassName.__indent=null;

oClassName.initialize= function( ) {
	oClassName.__iTimeIni= new Date().getTime();
};
oClassName.setThis= function( classId ) {
	oClassName.__currentClass=classId; // sets classId to be used in all debug processes inside this class
};
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
/*		
__dbgSets: {}, // this is a repository for properties to be set using setDbgOnOff
// @@@@@@@@@@@@@@@@@
setDbgOnOff: function( id, isOn ) {
	this.__dbgSets[id]=isOn; // sets a new or existing property named id in __dbgSets. This property will have a value true or false
	
},
*/		
oClassName.__dbgClasses= {}; //JO this is a repository for Classes (the same as sources) to be set using setDbgClassOnOff
oClassName.setDbg= function( classId,xIndent,oProcess ) {//sets the class where debugger will show and the active processes within that class
	//setDbg("<class name>","-->",{"<process 1":"on/off","<process 2":"on/off",....,"<process n":"on/off"});
	//example setDbg("test_mother_json1":{"inicio":true,"fim":false});
	oProcess.__indent=xIndent;//adding a new property to an existing object
	oClassName.__dbgClasses[classId]=oProcess; // sets a new or existing source named in __dbgCasses. This property will have a value true or false for each process	
	//alert("setDbg1 --> classId="+classId+" ficou com:"+JSON.stringify(this.__dbgClasses[classId]));
	//alert("setDbg2 --> classId="+classId+" myTest1 ficou com:"+this.__dbgClasses[classId]["myTest1"]);//OK
};		
// if a certain class is activated  all debug processes inside that class will be activated

// @@@@@@@@@@@@@@@@@
// Shows debug info (calling this.debug()) only if the id has been allowed to display
// toShow can be a string (or number) or it can be a callback function which should return some text to show in the debug.
// this option (of a callback) is done so that no time is spent constructing a string with debug info IF the ID is not allowed to display
// Ex: oDbg.dbg("mytest01","o meu valor="+ myFunc(xyz) );
// Ex: if( oDbg.isDbg("mytest01") ) oDbg.dbg("mytest01","o meu valor="+ myFunc(xyz) );
//--------------
//dbg: function( id, toShow,   thiz) { // this dbg function will only call this.debug(toShow) if the id has been allowed to display
//dbg: function( toShow,   thiz) { // this dbg function will only call this.debug(toShow) if the id has been allowed to display
oClassName.display= function( toShow,xNotAssert,thiz) { // this display function will only call this.debug(toShow) if the id has been allowed to display
	var id=oClassName.__lastId;
	var xError=false;
	if(xNotAssert!=null){
		//alert("par 2 definido ");	//now it checks if there is an error condition
		if(xNotAssert){//Error condition - enters if xNotAssert=true==>Error=>message should be displayed
			//alert("par 2 definido - condição de erro verificada  !!!  xNotAssert="+xNotAssert);// se for true entra aqui if xNotAssert=true ex (x!=1) (qdo x=2). se der null or false não entra
			xError=true;
		}else{
			return; //returns without displaying the line !!!!
		};
	};	
	if(xError){
		//	console.assert(x==1,"x deveria ser 1 !!!! current value de x="+x);//espectacular - mostra alinha de código onde o problema ocorreu
		console.assert(!xNotAssert,toShow);//shown inside debug.js
		return;
	};	
	var sType= typeof(toShow);
	if ( sType=="string" || sType=="number") { 
		//this.debug('"'+id+'": @@['+toShow+']@@');
		var iT= new Date().getTime();
		var iTd1= iT -oClassName.__iTimeIni;
		var iTd2; //= iT- this.__iTimeIni;
		if ( oClassName.__isInitialized  ){ // this.__iTimeLast ==null
			iTd2= iT - oClassName.__iTimeLast;
			// console.log("############# itmeLast NOT NULL");
			
		} else {
			iTd2= 0; // iT - this.__iTimeIni;
			oClassName.__iTimeIni= iT;
			iTd1=0;
			// console.log("####@@@@@@@@@@@@@@@ ######### itmeLast == NULL");
			oClassName.__isInitialized =true;
			
		};
		// ------- show content -----------------------------
		//var callerFunc = arguments.callee.caller.toString(); //this returns the function text !!!
		//var callerFuncName = callerFunc.substring(0,100);
		//var x1=this.__unTrimLeft(iTd1, 5, "0")+ "/" +this.__unTrimLeft(iTd2, 4, "0");
		var x1=oClassName.padding_right(this.__unTrimLeft(iTd1, 5, "0")+ "/" +oClassName.__unTrimLeft(iTd2, 4, "0")," ",11);//xxxxx/xxxx
		var x2=oClassName.padding_right('"'+id+'":'," ",15);//<process id>:       //
		//padding_right('1234', '0', 9);
		
		if((x1+x2+toShow+'<--').length>190){
			var x2Repeat=(190-((x1+x2).length))/2;
			//console.log((x1+" "+"-".repeat(x2Repeat))+"["+callerFuncName+"] "+x2+("-".repeat(x2Repeat)));
			console.log((x1+" "+"=".repeat(x2Repeat))+"["+x2+"] "+("=".repeat(x2Repeat)));
			console.info("---->"+toShow+"<----  END");//show it in a second line (including text introduced in display...
			console.log("=".repeat(200));// closing 
		}else{
			//console.log(x1+"["+callerFuncName+"] "+x2+toShow+'<--');
			console.log(x1+"-"+oClassName.padding_right(oClassName.__indent+oClassName.__currentClass," ",25)+"->"+x2+"["+toShow+"] ");
		};	
		//------------------------
		//	console.assert(x==1,"x deveria ser 1 !!!! current value de x="+x);//espectacular

		oClassName.__iTimeLast= iT;
	} else if ( sType =="function") {	
		var sResult;
		if ( thiz ) { 
			sResult= toShow.call(thiz);
		} else {
			sResult= toShow();
		}; // else end
		//this.debug('"'+id+'": @@['+sResult+']@@');
		// console.log('"'+id+'": @@['+sResult+']@@');
	} else {
		
	}; // else end		
	//}; // endif
	String.prototype.repeat = function(n) {
		//use console.log("ha".repeat(5));  // hahahahaha
		return new Array(1 + parseInt(n)).join(this);//array só aceita inteiros !!!
	};
};//dbg
// @@@@@@@@@@@@
oClassName.isDbg= function(id){ // isDbg() allows you to write if (this.oDbg.isDbg("someId")) { this.oDbg.display("message to display")} where the true portion of the if() is not executed 
// ------------------// if the id is not set for debugging
//example: if (this.oDbg.isDbg("myTest1") ) this.oDbg.display("message to display");
	//return false; enable this line to remove the debugger completly !!!
	var isOn=false;
	if(!oClassName.__currentClass)//checks if thr Dbg class knows the class whose permission to write is being demanded
		alert("Error in debug.isDbg ->Please do not forget to define this.oDbg.setThis(<current file name>)");  
	//alert("isDbg1 current id="+id+" current class="+this.__currentClass); //CURRENT CLASS AVAILABLE
	//alert("isDbg2a current id="+id+" current class="+this.__currentClass+" stringify="+JSON.stringify(this.__dbgClasses)); 
	//alert("isDbg2b current id="+id+" current class="+this.__currentClass+" stringify="+JSON.stringify(this.__dbgClasses[this.__currentClass])); 
	//alert("isDbg3 current id="+id+" current class="+this.__currentClass+" Permission="+this.__dbgClasses[this.__currentClass][id]); 
	//isOn=true;
	
	//We need to check if the leading source has given permission to Dbg to write in the demanding class - if not--> this.__dbgClasses[this.__currentClass] will give an error
	if(!oClassName.__dbgClasses[this.__currentClass]){//checks if thr Dbg class knows the class whose permission to write is being demanded
		//alert("Leading source gave no permission to dependent class "+this.__currentClass+' to write in Dbg. You could allow it with: this.oDbg.setDbg("'+this.__currentClass+'",....');
	}else if ( oClassName.__dbgClasses[oClassName.__currentClass][id] ) {//setDbg("<class name>":{"<process 1":"on/off","<process 2":"on/off",....,"<process n":"on/off"});
		oClassName.__lastId=id;
		oClassName.__indent=oClassName.__dbgClasses[oClassName.__currentClass].__indent;
		//alert("entrou em isDbg !!!! com id="+id);
		isOn=true;
	};	
	return isOn;
};


oClassName.__unTrimLeft = function( value , size, fillPatt) {
	var sOut=""+value; // to make sure value  becomes a string
	while (sOut.length < size) {
		sOut= fillPatt+sOut;
	};
	return sOut;
};
oClassName.padding_right=function(s, c, n) {// right padding s with c to a total of n chars. ex: padding_right('1234', '0', 9); // 123400000
	if (! s || ! c || s.length >= n) {
		return s;
	}

	var max = (n - s.length)/c.length;
	for (var i = 0; i < max; i++) {
		s += c;
	}

	return s;
}

//-------------------------
return oClassName;
}// end of 2nd parameter of define() call: the call back function definition
); //end of define() function , where the first parameter contains the array with the names of the dojo required modules
