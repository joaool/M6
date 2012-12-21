	define([ "dojo/_base/declare",
			 "../dajax_curr/DojEntity.js",	
			 "Mother1/debug.js"], 
		function(Declare,EntityCrud,Dbg){	
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

			dDictionary.property01=1234;
			dDictionary.entityObj={};
			var xIdEntity="E1";				
			dDictionary.entityObj[xIdEntity]={singular:"Client",plural:"clients",description:"Individual or Company to whom we may send invoices",lastId:0,L2C:{},C2L:{},attributes:[]};
			var oEntity=dDictionary.entityObj[xIdEntity];
	
			dDictionary.xxstaticTest1= function() {//comment
				// ------------------------- SET UP --------------------------------
				//var xIdEntity="E1";				
				//dDictionary.entityObj[xIdEntity]={singular:"Client",plural:"clients",description:"Individual or Company to whom we may send invoices",lastId:0,L2C:{},C2L:{},attributes:[]};
				var oEntity=dDictionary.entityObj[xIdEntity];
				//dDictionary.entityObj[xIdEntity]={singular:"Customer",plural:"#clients",description:"#Individual or Company to whom we may send invoices",lastId:0,L2C:{},C2L:{},attributes:[]};
				//dDictionary.entityObj[xIdEntity]={singular:"*Customer",plural:"#clients",description:"#Individual or Company to whom we may send invoices",lastId:0,L2C:{},C2L:{},attributes:[]};
				//-------------------------------------------------------- attributes ----------------------------------------------------------------
				dDictionary.addAttribute(oEntity,"address","address to send invoices","text"); //xEntity,xAttribute,xDescription,xType
				dDictionary.addAttribute(oEntity,"dlvryAddress","place where goods should be delivered","text"); //xEntity,xAttribute,xDescription,xType
				dDictionary.addAttribute(oEntity,"salesRep","professional responsible for customer's follow-up","text"); //xEntity,xAttribute,xDescription,xType
				dDictionary.addAttribute(oEntity,"birthday","date of aniversary","text"); //xEntity,xAttribute,xDescription,xType
				// ------------------------- END OF SET UP --------------------------------
				dDictionary.show(dDictionary.entityObj[xIdEntity]);
				
				console.log("----------------------------------------------- CHANGE ---------------------------------------------------");
				console.log("------------------------ Attributes: rename dlvryAddress to delivery, add discount, remove salesRep  -----------------------------");
				dDictionary.renameAttribute(oEntity,"dlvryAddress","delivery");
				dDictionary.addAttribute(oEntity,"discount","% to be reduced in every invoice","numeric");//adds AttributeName,Description and Type to oEntity of Data Dictionary
				dDictionary.removeAttribute(oEntity,"salesRep");//adds AttributeName,Description and Type to oEntity of Data Dictionary
				dDictionary.show(dDictionary.entityObj[xIdEntity]);
				
				console.log("----------------------------------- save test-----------------------------");
				//dDictionary.save(dDictionary.entityObj[xIdEntity].singular,dDictionary.entityObj[xIdEntity]);//an update
				dDictionary.save("*Customer",oEntity);//an update - "Client" wil change to what's in dDictionary.entityObj[xIdEntity]

				console.log("save done !!!!");
			};
			dDictionary.xxshow= function(oEntity) {//To show via console.log the test results
				//oEntity - this is dDictionary.entityObj[xIdEntity]
				console.log("----------------------------------- ENTITY -----------------------------");
				console.log("1)dDictionary.show singular="+oEntity.singular);
				console.log("2)dDictionary.show  Plural-->A set with more than one "+oEntity.singular+" is called a set of "+oEntity.plural);
				console.log("3)dDictionary.show Description--> "+oEntity.singular+" is a "+oEntity.description);
				console.log("4)dDictionary.show  lastId="+oEntity.lastId);

				console.log("----------------------------------- ATTRIBUTES -----------------------------");
				xTotAttr=oEntity.attributes.length;
				for(var i=0;i<xTotAttr;i++){
					console.log(i+"-"+" The "+oEntity.attributes[i].name+" of "+oEntity.singular+" is the "+oEntity.attributes[i].description);
				};
				console.log("----------------------------------- GET ATTRIBUTE NAMES from compressed getAttributeName()-----------------------------");
				for(var i=0;i<xTotAttr;i++){
					var xId=dDictionary.getCompressed(i);
					var xName=oEntity.attributes[i].name
					console.log(i+"-"+xName+" --->for compressed Name="+xId+" The name is "+dDictionary.getAttributeName(oEntity,xId));
				};
				console.log("----------------------------------- GET compressed NAMES from logical names -----------------------------");
				//now we want to iterate all compressed keys in object oEntity.C2L !!! - the number of entries can be different from the number of elements in attributes[]
				//var totKeys=Object.keys(oEntity.C2L).length;//OK FUNCIONA !!!
				var maxKey=oEntity.lastId;
				for(var i=0;i<maxKey;i++){
					var xId=dDictionary.getCompressed(i);
					console.log(i+"---->for compressed Name="+xId+" The name is "+dDictionary.getAttributeName(oEntity,xId));
				};			
			};
			dDictionary.staticTest2= function() {//comment
				console.log("entrou em dDictionary.staticTest2 !!!");
				var x1=dDictionary.read("Client");
				if(x1){
					console.log("Client existe ! return="+x1);
				}else{
					console.log("A entidade Client não existe !!!");
				};
			};
			dDictionary.xxxTestEntitySemantics= function() {//comment
				console.log("------------- dDictionary.TestEntitySemantics --------------------------------------------");
				console.log("Semantics 1)->"+dDictionary.entitySemantics(oEntity,"singular-description","En"));
				console.log("Semantics 2)->"+dDictionary.entitySemantics(oEntity,"singular-plural","En"));
			};
			//============================================================================
			dDictionary.read= function(xSingular     , myCallBack, myThis) {//returns oEntity object from persistence mechanism
			/**
			// How to use callback
			 dDictionary.read( "client" , function(isResult, sMessage, oEntity) {
				
				}, this);
			**/
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
						if(oReply.jsonObject.rowCount==0){//the entity doesn't exist we return null
							console.log("Inside Callback  - cliente não existe ------------------------------------------------------------");
							console.log(xRetStr);
							console.log("--------------------------------------------------------------------------------------------------");
							if ( myCallBack) {
								if (myThis) {
									myCallBack.call(myThis, false, "(A) cliente não existe",  oEntity);
								} else {
									myCallBack( false, "(A) cliente não existe", oEntity);
								};
							};
							return null;
						}else{//the entity exist we want to retrieve xSingular, xSingular, xPlural, xDescription, xJsonData
							//{singular:xSingular,plural:xPlural,description:xDescription,lastId:0,L2C:{},C2L:{},attributes:[]};
							console.log("1)Inside Callback  - *** READ TOTAL ***:"+oReply.jsonString);
							var oSavedEnt=oReply.jsonObject.rowSet[0];//isolates  entity attributes
							console.log("2)Inside Callback*** READ PARCIAL ***:"+JSON.stringify(oSavedEnt));
							var oInteriorJson=oSavedEnt.json;
							console.log("2.5)Inside Callback*** READ json field ***:"+JSON.stringify(oSavedEnt.json));
							console.log("2.51)Inside Callback*** READ json field ***:"+JSON.stringify(oInteriorJson));
							var sJson=oSavedEnt.json;
							var oJson= JSON.parse( sJson );
							var iLastId= oJson.lastId;
							console.log("2.6--)Inside Callback*** READ json field lastId***: oJson="+ JSON.stringify(oJson));
							console.log("2.6-----)Inside Callback*** READ json field lastId***: oJson.attributes[0].name=" + oJson.attributes[0].name);
							console.log("2.6a)Inside Callback*** READ json field lastId***: iLastId="+ iLastId);
							//console.log("2.6a)Inside Callback*** READ json field lastId***:"+JSON.stringify(oSavedEnt.json.lastId));
							console.log("2.6b)Inside Callback*** READ json field lastId***:"+JSON.stringify(oSavedEnt.json["lastId"]));
							//oEntity={singular:oSavedEnt.singularDescription,plural:oSavedEnt.pluralDescription,description:oSavedEnt.description,lastId:oSavedEnt.json.lastId,L2C:oSavedEnt.json.L2C,C2L:oSavedEnt.json.C2L,attributes:oSavedEnt.json.attributes};
			oEntity={singular:oSavedEnt.singularDescription,plural:oSavedEnt.pluralDescription,description:oSavedEnt.description,lastId:oSavedEnt.json.lastId};
			//,L2C:oSavedEnt.json.L2C,C2L:oSavedEnt.json.C2L,attributes:oSavedEnt.json.attributes};
							console.log("3)Inside Callback*** READ oEntity ***:"+JSON.stringify(oEntity));
							if ( myCallBack) {
								if (myThis) {
									myCallBack.call(myThis, true, "", oEntity);
								} else {
									myCallBack(oEntity);
								};
							};
							// oEntity has the return object
							return oEntity;
						};
					}else{
						// alert("Check your internet connection !!!! Trying to read form error:"+oReply.errorMessage);
						if ( myCallBack) {
							if (myThis) {
								myCallBack.call(myThis, false, "(B) Check your internet connection !!!! Trying to read form error:"+oReply.errorMessage,  oEntity);
							} else {
								myCallBack( false, "(B) Check your internet connection !!!! Trying to read form error:"+oReply.errorMessage, oEntity);
							};
						};
					};
					
				};
				var oEntity = new EntityCrud( callBackFunc1 , this);//to read
				oEntity.read(xSingular);//read: function( entityNameValue ) { 
				
			};	
			//dDictionary.save= function(xEntity,xSingular,xPlural,xDescription,xJsonData) {//save/update entity=xEntity 
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
			};				
			
			dDictionary.getAttributeName= function(oEntity,xComp) {//for object oEntity, Get attribute for compressed attribute=xComp
				return oEntity.C2L[xComp];
			};				
			dDictionary.getCompressedName= function(oEntity,xName) {//for object oEntity, Get compressed name for attributeName
				return oEntity.L2C[xName];
			};//getCompressedName				
			dDictionary.entitySemantics= function(oEntity,xType,xLanguage) {//shows entity/description semantics
				var codes={"singular-description":"A","singular-plural":"B"};
				var trad={ //entity+A+description, B.pre+singular+B.mid+plural+B.pos
					"En":{A:{pre:"",mid:" is a ",pos:""},B:{pre:"A set with more than one ",mid:" is called a set of ",pos:""}}, 
					"Fr":{A:{pre:"",mid:" c'est un ",pos:""},B:{pre:"Un group avec plus q'un ",mid:" s'appelle un groupe de ",pos:""}},
					"Nl":{A:{pre:"",mid:" is een ",pos:""},B:{pre:"Een set met meer dan één ",mid:" is een set van ",pos:""}},
					"Pt":{A:{pre:"",mid:" é um ",pos:""},B:{pre:"Um grupo com mais do que um ",mid:" designa-se por grupo de ",pos:""}}
				};
				var xCode=codes[xType];//extracts A or B
				if(xCode){
					var xFirst=oEntity.singular;//for A it will be oEntity.singular
					var xSecond=null;//for A it will be oEntity.description
					if(xCode=="A"){
						xSecond=oEntity.description;
					}else if(xCode=="B"){
						xSecond=oEntity.plural;
					};
					var oLanguage=trad[xLanguage];//extracts language code
					if(oLanguage){
						var sRet=oLanguage[xCode].pre+xFirst+oLanguage[xCode].mid+xSecond+oLanguage[xCode].pos;
						return sRet;
					}else{
						return "dDictionary.entitySemantics -->Language "+xLanguage+" is undefined";
					};
				}else{
				    return "dDictionary.entitySemantics -->Type "+xType+" is undefined";
				};
			}; //entitySemantics
			dDictionary.getCompressed=function ( iGenNext ) { //
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
