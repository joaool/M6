	define([ "dojo/_base/declare",
			 "../dajax_curr/DojEntity.js",
			 //"dojo/Deferred",//this is for version 1.8
			 "dojo/_base/Deferred", //this is for version 1.7
			// "../dajax_curr/DojDelayed.js",			 
			 "Mother1/debug.js"], 
		//function(Declare,EntityCrud,Deferred,Delayed,Dbg){	
		function(Declare,EntityCrud,Deferred,Dbg){	
			var dDictionary = Declare("dDictionary",null, { // comment
				constructor:function(){
					//----------- debug preparation Area -----------------------------------------------------------
					this.oDbg=new Dbg();
					this.oDbg.setThis("dDictionary");//All debugs within this class will belong to this debug label
					//----------------------------------------------------------------------------------------------	
					if(this.oDbg.isDbg("constructor")) this.oDbg.display("--** CONSTRUCTOR **--");
				},
				test1: function( ) {
					console.log("dDictionary test1 !!!")
				},
				test2:function(){
				}
			}); //end of declare for classe className
			//-----------------
			// Here STATIC methods and properties:
			//-----------------
			//Dbg.setThis("dDictionary");//debug preparation Area --->All debugs within this class will belong to this debug label NOT WORKING
			// Index of data Dictionary methods :
			// ----------------------------------------------- Persistence methods ()-----------------------------------------------------------------------------------------
			//     dDictionary.read= function(xSingular) {//returns oEntity object from persistence mechanism
			//     dDictionary.save= function(xOldSingular,oEntity) {//save/update entity object oEntity=dDictionary.entityObj[xIdEntity]
			// ---------------------------------------------- Memory CRUD methods --------------------------------------------------------
			//	   dDictionary.createEntity= function(xSingular,xPlural,xDescription) {//singular, plural, description
			//     dDictionary.updateEntity= function(oEntity,xSingular,xPlural,xDescription) {//updates singular, plural and description for object oEntity
			//	   dDictionary.addAttribute= function(oEntity,xAttribute,xDescription,xType) {//adds AttributeName,Description and Type to oEntity of Data Dictionary
			//	   dDictionary.removeAttribute= function(oEntity,xAttribute) {//for object oEntity, remove Attribute name=xAttribute 
			//	   dDictionary.renameAttribute= function(oEntity,xOldName,xNewName) {//for object oEntity  rename xOldName to xNewName
			//	   dDictionary.getAttributeName= function(oEntity,xComp) {//for object oEntity, Get attribute for compressed attribute=xComp
			//	   dDictionary.getCompressedName= function(oEntity,xName) {//for object oEntity, Get compressed name for attributeName
			//	   dDictionary.entitySemantics= function(oEntity,xType,xLanguage) {//shows entity/description semantics
			//	   dDictionary.attributeSemantics= function(xAttribute,xAttrDescription,oEntity,xLanguage) {//shows singular-description for attribute=xAttribute
			//	   dDictionary.getCompressed=function ( iGenNext ) { /returns a 2 bytes string from number 


			dDictionary.property01=1234;
			dDictionary.entityObj={};
			var xIdEntity="E1";				
			//dDictionary.entityObj[xIdEntity]={singular:"Client",plural:"clients",description:"Individual or Company to whom we may send invoices",lastId:0,L2C:{},C2L:{},attributes:[]};
			//var oEntity=dDictionary.entityObj[xIdEntity];
	

			//----------------------------------------------------------------------------------------------
			dDictionary.read= function(xSingular) {//returns oEntity object from persistence mechanism
			//----------------------------------------------------------------------------------------------
			// Returns a deferred that will return oEntity if it exist or null if it does not exist
			// exemple:
			//  dDictionary.read(xEnt).then( 
			//		function(  oEntity) { //--------accepted
			//			if(oEntity){
			// 				testShowEntity("testing....createEntity, entitySemantics",oEntity);//add atributes to entity
			// 				testShowAttributes("testing ....renameAttribute,addAttribute,removeAttribute", oEntity); //showing changes
			// 			}else{
			// 				if(this.oDbg.isDbg("main")) this.oDbg.display(" There is no entity="+xEnt+" in the database !!!");
			// 			};	
			// 		},
			// 		function(err){
	        // 			alert("An error occurred: " + err);//shows the error message prepared in dDictionary.read
			//		},
			// 		this
			// );	
			// */
			//var oDelayed=new Delayed();
				var oDeferred=new Deferred();
				
				// Ex.dDictionary.entityObj[xIdEntity]=reads dictionary from database
				console.log("entrou em dDictionary.read !!!com "+xSingular);
				var callBackFunc1 = function(oReply){//read callback
					xRetStr="<@@> testServer \n<br>-------------------------------------------------\n<br>"
						+ "  /__[@@] CLIENT TimeDurationUntilReply=[" + oReply.timing.clientTimer +"] milliseconds / [@@] Client INNER timeduration=[" + oReply.timing.clientTimerOutside +"]" //;
						+ " /__[@@] SERVER TimeDurationUntilReply=[" + oReply.timing.serverTimer +"] milliseconds "
						+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
						+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"
						// + oReply.info
						;
					var oEntity=null;
					if(oReply.isSuccess){
						if(oReply.jsonObject.rowCount==0){//if the entity doesn't exist we return null
							//console.log("Inside Callback  - cliente não existe ------------------------------------------------------------");
							//console.log(xRetStr);
							//console.log("--------------------------------------------------------------------------------------------------");
							//oDelayed.resolve(oEntity );
							oDeferred.resolve(oEntity);
							
						}else{//the entity exist we want to retrieve xSingular, xSingular, xPlural, xDescription, xJsonData
							//{singular:xSingular,plural:xPlural,description:xDescription,lastId:0,L2C:{},C2L:{},attributes:[]};
							//console.log("1)Inside Callback  - *** READ TOTAL ***:"+oReply.jsonString);
							var oSavedEnt=oReply.jsonObject.rowSet[0];//This is an object that has a property called "json" that contains a string that mimics an object
							//console.log("2)Inside Callback*** READ PARCIAL ***:"+JSON.stringify(oSavedEnt));
							var sJson=oSavedEnt.json;
							var oJson= JSON.parse( sJson );
							oEntity={singular:oSavedEnt.singularDescription,plural:oSavedEnt.pluralDescription,description:oSavedEnt.description,lastId:oJson.lastId,L2C:oJson.L2C,C2L:oJson.C2L,attributes:oJson.attributes};
							//console.log("3)Inside Callback*** READ oEntity ***:"+JSON.stringify(oEntity));
							//oDelayed.resolve( oEntity );
							oDeferred.resolve(oEntity);
						};
					}else{
						console.log("Check your internet connection !!!! Trying to read ENTITY error:"+oReply.errorMessage);
						//oDelayed.reject("dDictionary.read2(B) Check your internet connection !!!! Trying to read form error:"+oReply.errorMessage );
						oDeferred.reject("dDictionary.read Check your internet connection !!!! Trying to read ENTITY error:"+oReply.errorMessage);
						
						//this emits an error Error: dDictionary.read Check your internet connection !!!! Trying to read ENTITY error:
						//   oDeferred.errback(new Error("dDictionary.read Check your internet connection !!!! Trying to read ENTITY error:"+oReply.errorMessage));
					};
					
				};
				var oEntity = new EntityCrud( callBackFunc1 , this);//to read
				oEntity.read(xSingular);//read: function( entityNameValue ) { 
				//return oDelayed;
				return oDeferred;
			};	//read			
			//------------------------------------------------------------------
			dDictionary.save= function(xOldSingular,oEntity) {//save/update entity object oEntity=dDictionary.entityObj[xIdEntity]
			//------------------------------------------------------------------
				// param1 - existing singular name if singular name is to be renamed by oEntity.singular. If there is no rename xOldSingular=oEntity.singular
				//
				//ex.   dDictionary.save(dDictionary.entityObj[xIdEntity]);
			    //structure--> {singular:xSingular,plural:xPlural,description:xDescription,lastId:0,L2C:{},C2L:{},attributes:[]};

				var xSingular=oEntity.singular; //dDictionary.entityObj[xIdEntity].singular
				var xPlural=oEntity.plural; //dDictionary.entityObj[xIdEntity].plural
				var xDescription=oEntity.description; //dDictionary.entityObj[xIdEntity].description
				var oJson={lastId:oEntity.lastId,L2C:oEntity.L2C,C2L:oEntity.C2L,attributes:oEntity.attributes};
				var xJsonData=JSON.stringify(oJson);
				console.log("dDictionary.save in the slot "+xOldSingular+" places: xSingular="+xSingular+" xPlural="+xPlural+" xDescription="+xDescription);
				//alert("dDictionary.save store xJsonData="+xJsonData);
				var callBackFunc1 = function(oReply){//read callback
					xRetStr="<@@> testServer \n<br>-------------------------------------------------\n<br>"
						+ "  /__[@@] CLIENT TimeDurationUntilReply=[" + oReply.timing.clientTimer +"] milliseconds / [@@] Client INNER timeduration=[" + oReply.timing.clientTimerOutside +"]" //;
						+ " /__[@@] SERVER TimeDurationUntilReply=[" + oReply.timing.serverTimer +"] milliseconds "
						+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
						+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"
						// + oReply.info
						;
					if(oReply.isSuccess){
						if(oReply.jsonObject.rowCount==0){//the entity doesn't exist we have to create it ! 
							//	create: function( singularName, pluralName, jsonData ) {
							console.log("dDictionary.save - the entity "+xOldSingular+" doesn't exist we are going to create it "); 
							oEntity2.create( xSingular, xPlural, xDescription, xJsonData);
							console.log("dDictionary.save - creation done "); 

						}else{//the entity exist we have to update it ! 
							//  update: function( entityNameCurrent, newEntityName, newEntityNamePlural, newJsonData ) { 
							console.log("dDictionary.save - the entity "+xOldSingular+" exists we are going to update it to "+xSingular); 
							oEntity2.update( xOldSingular, xSingular, xPlural, xDescription, xJsonData);
							console.log("dDictionary.save - update done "); 
						};
					}else{
						alert("Check your internet connection !!!! Trying to read form error:"+oReply.errorMessage);
					};
				};	
				var callBackFunc2 = function(oReply){//update or create callback
					xRetStr="<@@> testServer \n<br>-------------------------------------------------\n<br>"
						+ "  /__[@@] CLIENT TimeDurationUntilReply=[" + oReply.timing.clientTimer +"] milliseconds / [@@] Client INNER timeduration=[" + oReply.timing.clientTimerOutside +"]" //;
						+ " /__[@@] SERVER TimeDurationUntilReply=[" + oReply.timing.serverTimer +"] milliseconds "
						+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
						+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"
						// + oReply.info
						;
						if(!oReply.isSuccess){
							alert("Check your internet connection !!!! Trying to write form error:"+oReply.errorMessage);
						};
					//fz.setFieldProps("fz1",{value:xRetStr});
					//if(this.oDbg.isDbg("main")) this.oDbg.display(xRetStr);
				};					
				var oEntity1 = new EntityCrud( callBackFunc1 , this);//to read
				var oEntity2 = new EntityCrud( callBackFunc2 , this);//to update or create callback
				oEntity1.read(xOldSingular);//reads with the oldKey - if DojEntity (returns 0 rows) =>create ,if DojEntity (returns >0 rows => exists) => update
			};
			// ---------------------------------------------- Memory CRUD methods --------------------------------------------------------
			dDictionary.createEntity= function(xSingular,xPlural,xDescription) {//singular, plural, description
				//ex. var oEntity=dDictionary.createEntity("Client","clients","Individual or Company to whom we may send invoices");
			    return {singular:xSingular,plural:xPlural,description:xDescription,lastId:0,L2C:{},C2L:{},attributes:[]};
			};			
			dDictionary.addEntity= function(xSingular,xPlural,xDescription,xType) {//Checks if entity exists (checks for xSingular) if it exists refuses to add
				// dDictionary.entityObj[xIdEntity]={singular:"Client",plural:"clients",description:"Ind/Company to whom we may send invoices",lastId:0,attributes:[],L2C{},C2L{}};
			};				
			dDictionary.removeEntity= function(xSingular) {//removes current entity
			};
			dDictionary.updateEntity= function(oEntity,xSingular,xPlural,xDescription) {//updates singular, plural and description for object oEntity
				//this does not change the entity in the persistent mechanism
				oEntity.singular=xSingular;
				oEntity.plural=xPlural;
				oEntity.description=xDescription;
			    return oEntity;
			};
			dDictionary.addEntity= function(xSingular,xPlural,xDescription,xType) {//Checks if entity exists (checks for xSingular) if it exists refuses to add
				// dDictionary.entityObj[xIdEntity]={singular:"Client",plural:"clients",description:"Ind/Company to whom we may send invoices",lastId:0,attributes:[],L2C{},C2L{}};
			};				
			dDictionary.removeEntity= function(xSingular) {//removes current entity
			};
			dDictionary.renameEntity= function(xOldSingular,xNewSingular,xPlural,xDescription) {//rename xOldSingular to xNewSingular
			};
			dDictionary.addAttribute= function(oEntity,xAttribute,xDescription,xType) {//adds AttributeName,Description and Type to oEntity of Data Dictionary
				//oEntity={singular:"Client",plural:"clients",description:"Company to send invoices",lastId:0,L2C:{},C2L:{},attributes:[]};
				var nId=oEntity.lastId++;
				var sComp=dDictionary.getCompressed(nId++);
				//dDictionary.entityObj[xIdEntity].attributes.push({name:"address",description:"address to send invoices",type:"text"});
				oEntity.attributes.push({name:xAttribute,description:xDescription,type:xType});		
				oEntity.L2C[xAttribute]=sComp;//Logical to Compressed
				oEntity.C2L[sComp]=xAttribute;//Compressed to Logical
				oEntity.lastId=nId;
			};//dDictionary.addAttribute			

			dDictionary.removeAttribute= function(oEntity,xAttribute) {//for object oEntity, remove Attribute name=xAttribute 
				var sComp=oEntity.L2C[xAttribute];//get CompressedName to nullify it
				//oEntity.L2C[xAttribute]=null;//nulifies
				delete oEntity.L2C[xAttribute];//delete pair key/value from object 
				//oEntity.C2L[sComp]=null;//nulifies
				delete oEntity.C2L[sComp];//delete pair key/value from object 
				//now remove it from array
				var xTotAttr=oEntity.attributes.length;
				for(var i=0;i<xTotAttr;i++){
					if(oEntity.attributes[i].name==xAttribute){//locate attribute name to delete
						oEntity.attributes.splice(i,1);//index=i, howmany=1
						return;
					};
				};
				console.log("dDictionary.removeAttribute - attribute "+xAttribute+" doesnot exist in entity "+oEntity.singular);
			};					
			dDictionary.renameAttribute= function(oEntity,xOldName,xNewName) {//for object oEntity  rename xOldName to xNewName
				//if xOldName does not exist => NOP nothing is done
				var xTotAttr=oEntity.attributes.length;
				for(var i=0;i<xTotAttr;i++){
					//if(dDictionary.entityObj[xEntity].attributes[i].name==xOldName){
					if(oEntity.attributes[i].name==xOldName){
						oEntity.attributes[i].name=xNewName;
						var sComp=oEntity.L2C[xOldName];//get Old CompressedName to nullify it
						oEntity.L2C[xOldName]=null;//nulifies it
						oEntity.L2C[xNewName]=sComp;//sets the new name in translation table
						oEntity.C2L[sComp]=xNewName;//Compressed to Logical						
						return;
					};
				};
				console.log("dDictionary.renameAttribute - attribute "+xOldName+" doesnot exist in entity "+oEntity.singular);
			};	//renameAttribute			
			dDictionary.getAttributeName= function(oEntity,xComp) {//for object oEntity, Get attribute for compressed attribute=xComp
				return oEntity.C2L[xComp];
			}; //getAttributeName				
			dDictionary.getCompressedName= function(oEntity,xName) {//for object oEntity, Get compressed name for attributeName
				return oEntity.L2C[xName];
			};//getCompressedName				
			dDictionary.entitySemantics= function(oEntity,xType,xLanguage) {//shows entity/description semantics
			// return (case "A") --> <Client> is a <Individual or Company to whom we may send invoices>
			// ex: if(this.oDbg.isDbg("main")) this.oDbg.display("Semantics 1)->"+dDictionary.entitySemantics(oEntity,"A","En"));
			// ex: if(this.oDbg.isDbg("main")) this.oDbg.display("Semantics 2)->"+dDictionary.entitySemantics(oEntity,"B","En"));
			//	   A set with more than one <Client> is called a set of <clients>
				var xRet=null;
				if(xType=="A"){
					xRet=dDictionary.makeSemStr(oEntity.singular,oEntity.description,"A","En");
				}else if(xType=="B"){
					xRet=dDictionary.makeSemStr(oEntity.singular,oEntity.plural,"B","En");
				}else{
					alert("dDictionary.entitySemantics Parameter xType="+xType+" is unsupported !!!");
				};
				return xRet
			}; //entitySemantics

			dDictionary.makeSemStr= function(x1,x2,xType,xLanguage) {//concatenate basic entity semantics
			// for "A" - singular-description x1=singular and x2=description
			//  	use: dDictionary.makeSemStr("Client","Individual or Company to whom we may send invoices","A","En") to get:
			// 				<Client> is a <Individual or Company to whom we may send invoices>
			// for "B" - singular-plural x1=singular and x2=plural
			//  	use: dDictionary.makeSemStr("Client","clients","B","En") to get:
			//				A set with more than one <Client> is called a set of <clients>
			//------------------------------------------------------------------------------
				var trad={ //semantinc repository
					"En":{A:{pre:"",mid:" is a ",pos:""},B:{pre:"A set with more than one ",mid:" is called a set of ",pos:""}}, 
					"Fr":{A:{pre:"",mid:" c'est un ",pos:""},B:{pre:"Un group avec plus q'un ",mid:" s'appelle un groupe de ",pos:""}},
					"Nl":{A:{pre:"",mid:" is een ",pos:""},B:{pre:"Een set met meer dan één ",mid:" is een set van ",pos:""}},
					"Pt":{A:{pre:"",mid:" é um ",pos:""},B:{pre:"Um grupo com mais do que um ",mid:" designa-se por grupo de ",pos:""}}
				};
				var oTrad=trad[xLanguage][xType];
				var sRet=oTrad.pre+x1+oTrad.mid+x2+oTrad.pos;
				return sRet;
			}; //makeSemStr	
			dDictionary.makeSemAttrStr= function(x1,x2,xEntSingular,xLanguage) {//concatenate basic entity semantics
			// ex: dDictionary.makeSemAttrStr("address","the address to send invoices","Client","En");
			//      returns --->  The <address> of <Client> is <the address to send invoices>
			//  dDictionary.attributeSemantics(oEntity.attributes[i].name,oEntity.attributes[i].description,oEntity,"En");
				var trad={ //entity+A+description, B.pre+singular+B.mid+plural+B.pos
					"En":{pre:"The ",mid1:" of ",mid2:" is ",pos:""},
					"Fr":{pre:"Le ",mid1:" du ",mid2:" c'est ",pos:""},
					"Nl":{pre:"Het ",mid1:" van de ",mid2:" is het ",pos:""},
					"Pt":{pre:"",mid1:" do ",mid2:" é ",pos:""}
				};
				var oTrad=trad[xLanguage];
				var sRet= oTrad.pre+x1+oTrad.mid1+xEntSingular+oTrad.mid2+x2+oTrad.pos;
				return sRet;
			}; //makeSemAttrStr				
			dDictionary.attributeSemantics= function(xAttribute,xAttrDescription,oEntity,xLanguage) {//shows singular-description for attribute=xAttribute
			// ex: The <address> of <Client> is <the address to send invoices>
			//  dDictionary.attributeSemantics(oEntity.attributes[i].name,oEntity.attributes[i].description,oEntity,"En");
				var trad={ //entity+A+description, B.pre+singular+B.mid+plural+B.pos
					"En":{pre:"The ",mid1:" of ",mid2:" is ",pos:""},
					"Fr":{pre:"Le ",mid1:" du ",mid2:" c'est ",pos:""},
					"Nl":{pre:"Het ",mid1:" van de ",mid2:" is het ",pos:""},
					"Pt":{pre:"",mid1:" do ",mid2:" é ",pos:""}
				};
				var oLanguage=trad[xLanguage];//extracts language code
				return oLanguage.pre+xAttribute+oLanguage.mid1+oEntity.singular+oLanguage.mid2+xAttrDescription+oLanguage.pos;
			}; //attributeSemantics			
			dDictionary.getCompressed=function ( iGenNext ) { //returns a 2 bytes string from number 
				var sOut="";
				//-------------
				var iMinLen=2;
				var sGenChars="0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ_";
				//---------------------------------------------------------
				// Test using small character sets :
				// var sGenChars="01"; // generates a binary represntation with only '0' and '1' symbols
				//   or 
				// var sGenChars="abc";
				//-------------------------------------
				var iGenCharLength= sGenChars.length;
				
				var ii= iGenNext;
				while ( ii >0 ) {
					var iPos= ii % iGenCharLength;
					var ch= sGenChars.substr( iPos, 1);
					sOut+= ch;
					ii= Math.floor( ii / iGenCharLength);
				};
				ii=sOut.length;
				while (ii< iMinLen) {
					sOut+= sGenChars.substr( 0, 1);
					ii++;
				};
				//---------
				sOut=  dDictionary.strReverse( sOut) ;
				return sOut;
				
			};
			// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			//  reverse a string: ex: "abcd" becomes "dcba"
			dDictionary.strReverse=function ( str ) {
				var sOut="";
				var iLen=str.length;
				for (var ii=iLen-1; ii>=0; ii--) {
					sOut+= str.substr(ii,1);
				};
				return sOut;
			};			
			
			return dDictionary;
		}//call back function
	); //end of require for module 	className
