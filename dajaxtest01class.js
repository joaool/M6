define([
	"dojo/parser",
	"dojo/dom",
	"../dajax_0.6.0/DojDebug.js",
	"../dajax_0.6.0/DojDajax.js",
	"../dajax_0.6.0/DojEntity.js",
	"../dajax_0.6.0/DojRelation.js",
	"../dajax_0.6.0/DojMaster.js",
	"dojo/_base/declare",	
],
function( parser, dom, DojDebug, DojDajax , EntityCrud, RelationCrud, MasterCrud,Declare ) {
// function( parser, dom, Declare ) {
	return Declare("dajaxTest", null,{
	toTest:null,
	toTest2:null,
	constructor:function(toTest,toTest2){
		this.toTest=toTest;
		this.toTest2=toTest2;
		//------------------------------------------------------------------------------------------------------------------------------
		// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		//--------------------------------------------------
		// generate some persons to fill the table 'person'
		
		//---------------

		this.testit(); // call the function below
	},
	testit:function() {
		
		// alert("dajaxtest01class testit toTest="+JSON.stringify(this.toTest)+" ->"+JSON.stringify(this.toTest2));

		var isWantMonitoring= function() {
			var isOn=  true ; // false==no monitoring for anyone who does not want to know why a query is not returning expected values
			return isOn;
		};
		var isDevelopmentStage= function() {
			var isOn=  true ; //
			return isOn;
		};		
		this.id="testit(): testing DajaxServer";
/****/		
		//--------------------------------------------------------------------------------------------
		// using a debug object
		var oDbg = new DojDebug("infodebug"); // needs the name of a <div> where to show the debuglines
		oDbg.setDbgOnOff( true ); // true or false (default is true)
		//------------------------------------------------------------------------------------------
		//var urlServerCounterpart="dajaxserver.php"; // @@@@@@@@@@@@@@@@@
		var urlServerCounterpart="../dajax_0.6.0/dajaxserver.php"; // @@@@@@@@@@@@@@@@@
		var aj= new DojDajax( ); // Dojo Data Ajax
		var oEntity = new EntityCrud();
		oEntity.setIsMonitoringSqlExec(true);
		oEntity.setIsSqlDevelopment(true);
		
		var oRelation = new RelationCrud();
		oRelation.setIsMonitoringSqlExec(true);
		oRelation.setIsSqlDevelopment(true);
		
		var oMaster = new MasterCrud();
		oMaster.setIsMonitoringSqlExec(true);
		
		
		// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		var testNr= 77;  // <<=== change here testNr to do another test, according to tests underneath ###############
		// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		// ==============================
		//---------------------------
		oDbg.dbg("testNr", testNr);
		//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		var test_MASTER=function( testNr ) {
			//  testNr>=70 && testNr< 80 
			oDbg.dbg("in test_MASTER", testNr);
			if ( testNr==71 ) { 
				oMaster.create("Customer","Pater Familias Jerome");
				
			} else if ( testNr==72 ) { 
				oDbg.dbg("calling oMaster.readAll()");
				oMaster.readAll();
				
			} else if ( testNr==73 ) { 
				idMaster=10;
				oMaster.update( idMaster, "Don Francisco de Xavier"  );
				
			} else if ( testNr==74 ) { 
				
				idMaster=10;
				oMaster.delete( idMaster );
				
			} else if ( testNr==75 ) { 
				
				oMaster.read("Product"); // returns the key_id and the idMaster KEY in order to be able to make updates and deletions
				
			} else if ( testNr==76 ) { 
			//----------- alterado Joao -------------------------------------------------
				//var isCreateDelTrueChild=false;
				//var isCreateNormalChildWithParent= false;
				//var isCreateNormalChildWITHOUTParent= true;
				var isCreateDelTrueChild=this.toTest.isCreateDelTrueChild;
				var isCreateNormalChildWithParent=this.toTest.isCreateNormalChildWithParent;
				var isCreateNormalChildWITHOUTParent=this.toTest.isCreateNormalChildWITHOUTParent;
				var sEntity=this.toTest.sEntity;
				var sMasterData=this.toTest.sMasterData;
			//----------- alterado Joao -------------------------------------------------
				
				
				if ( isCreateDelTrueChild ) {
					//var sEntity="InvoiceLine";
					//var sMasterData="invoice line #01, 7 items prodX";
					//var aIdMasterRelatedRecords=[9];
					var aIdMasterRelatedRecords=this.toTest.aIdMasterRelatedRecords1.split(",");//an array 
					oMaster.create_New( sEntity, sMasterData, aIdMasterRelatedRecords ); 
				} else if ( isCreateNormalChildWithParent ) {
					//var sEntity="Invoice";
					//var sMasterData="INVOICE for customer Baker bakeries ";
					//var aIdMasterRelatedRecords=[5];
					var aIdMasterRelatedRecords=this.toTest.aIdMasterRelatedRecords2.split(",");//an array 

					oMaster.create_New( sEntity, sMasterData, aIdMasterRelatedRecords ); 
				} else if ( isCreateNormalChildWITHOUTParent ) {
					//var sEntity="Product"; // "InvoiceLine"; // "Product";
					//var sMasterData="Product Vitamine DD, time released ";
					
					oMaster.create_New( sEntity, sMasterData ); 
				} else {
					
				}; // end if
			} else if ( testNr==77 ) { 	
				// TEST
				var sEntity="Invoice";
				var sMasterData="INVOICE -2 for customer Baker bakeries ";
				var idMasterParent=5;
				oMaster.test_01( sEntity, sMasterData, idMasterParent ); 
			
			};
		};
		//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		var test_ENTITY = function( testNr ) {
			// testNr>=50 && testNr< 60
			oDbg.dbg("in test_ENTITY", testNr);
			if ( testNr==51 ) { 
				oEntity.create("InvoiceLine","InvoiceLines");
				
			} else if ( testNr==52 ) { 
				oEntity.readAll();
				
			} else if ( testNr==53 ) { 
				
				oEntity.update( "Maquina", "Device" , "Devices"  );
				
			} else if ( testNr==54 ) { 
				oEntity.delete("Maquina");
				
			} else if ( testNr==55 ) { 
				
				oEntity.read("Maquina");
			}
		};
		//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		var test_RELATION = function( testNr ) {
			// testNr>=60 && testNr< 70 
			oDbg.dbg("in test_Relation", testNr);
			if ( testNr==60 ) { 
				//-----------------------------
				var relatedFrom="Invoice";
				var relatedTo ="InvoiceLine";
				var description ="has";
				var cardinality ="1_N";
				var delChildren = true;
				oRelation.create( relatedFrom, relatedTo , description, cardinality, delChildren);
				
			} else if ( testNr==61 ) { 
				oRelation.readAll(  );
				
			} else if ( testNr==62 ) { 
				
				//------------
				var relatedFromToUpdate="Invoice";
				var relatedToToUpdate="InvoiceLine";
				var relatedFrom="InvoiceLine";
				var relatedTo ="Product";
				var description ="has";
				var cardinality ="1_N";
				var delChildren = false;

				oRelation.update( relatedFromToUpdate, relatedToToUpdate, relatedFrom, relatedTo , description, cardinality, delChildren );
				
			} else if ( testNr==63 ) {
				var relatedFromToDelete="InvoiceLine";
				var relatedToToDelete="Product";
				oRelation.delete( relatedFromToDelete, relatedToToDelete);
				
			} else if ( testNr==64 ) { 
				var sEntityFrom="Invoice";
				oRelation.read( sEntityFrom );
		
			} else if ( testNr==69 ) { 
				var relatedFromToDelete="InvoiceLine";
				var relatedToToDelete="Product";
				oRelation.TEST_ExecIf( relatedFromToDelete, relatedToToDelete);
			}
		};
		// #################################################################################################################
		// #################################################################################################################
		// #################################################################################################################

		// alert("getvalue="+ aj.getValue());
		var theTest="";
		
		
		if ( testNr==1 ) {
			theTest="echoParms";
		//----------
		} else if ( testNr>=70 && testNr< 80 ) {
			test_MASTER( testNr );
		} else if ( testNr>=50 && testNr< 60 ) {
			test_ENTITY( testNr );
		} else if ( testNr>=60 && testNr< 70 ) {
			test_RELATION( testNr );
		};
/**************		
		//-------- OTHER OLDER tests op application/proces G2 (DB=mig01)	
			
		} else if ( testNr==2 ) { 
			theTest="G2-retrieveAllCities";
		} else if ( testNr==3 ) { 
			theTest="G2-inputCity";
		} else if ( testNr==4 ) { 
			theTest="G2-inputPerson";
		} else if ( testNr==5 ) { 
			theTest="G2-retrievePersons";
		} else if ( testNr==6 ) { 
			theTest="G2-retrievePersons-conditional";
		} else if ( testNr==7 ) { 
			theTest="G2-retrieveCity-conditional-execAfter";
		} else if ( testNr==9 ) { 
			theTest="getVersion";
		} else if ( testNr==101 ) { 
			theTest="G2-getCityMetadata";
		} else if ( testNr==102 ) { 
			theTest="G2-testDataConversion";
		} else if ( testNr==103 ) { 
			theTest="G2-testPseudoSql";
		}; // end-if
		
		//  ttConditions
		
		if ( theTest=="dummyXXXX" ) {
		
		//-------------------------------------------------------------------
		} else if ( theTest=="G1-relation_D" ) { 	//
		//-----------------------------------------------
*/		
			/**
			<@< The remote user has to send the following fields in order to DELETE an existing relation record:
				relatedFromToDelete  : singular Entity singular description
				relatedToToDelete  : singular Entity singular description
			>@>
			**/	
/*			
			var requestId="G1";
			var controlJson={request:"relation_D",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			// 
			
			var dataJson= {relatedFromToDelete:"Invoice", relatedToToDelete:"InvoiceLinePraXuxu" }; 
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer \n<br>-------------------------------------------------\n<br>REQUEST: Serverproces='"+ requestId+ "' " 
					+ " RequestName='" +	controlJson.request + "' /__[@@] Sent DataJson===>" + JSON.stringify( dataJson ) + "<== "
					+ "  /__[@@] CLIENT TimeDurationUntilReply=" + oReply.timing.clientTimer +" milliseconds " + " /__[@@] SERVER TimeDurationUntilReply=" + oReply.timing.serverTimer +" milliseconds "
					+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G1-relation_U" ) { 	//
		//-----------------------------------------------
*/		
			/**
				BEFORE update:
				Existing relations
				[{"relatedFrom":"Customer","relatedTo":"Invoice","description":"has","cardinality":"0_N","delChildren":false}
				,{"relatedFrom":"Invoice","relatedTo":"Customer","description":"has","cardinality":"0_1","delChildren":false}
				,{"relatedFrom":"Invoice","relatedTo":"InvoiceLine","description":"has","cardinality":"1_N","delChildren":true}] 
				
				UPDATE:  {relatedFromToUpdate:"Invoice", relatedToUpdate:"InvoiceLine", relatedFromNew:"Invoice", relatedToNew:"InvoiceLinePraXuxu" , description:"has" , cardinality:"1_N", delChildren:true};
				
				AFTER UPDATE
				
				[{"relatedFrom":"Customer","relatedTo":"Invoice","description":"has","cardinality":"0_N","delChildren":false}
				,{"relatedFrom":"Invoice","relatedTo":"Customer","description":"has","cardinality":"0_1","delChildren":false}
				,{"relatedFrom":"Invoice","relatedTo":"InvoiceLinePraXuxu","description":"has","cardinality":"1_N","delChildren":true}]
				
				
			**/
/*			
			var requestId="G1";
			var controlJson={request:"relation_U",  isSqlDevelopment:isDevelopmentStage() 
					, isMonitoring: isWantMonitoring()					
					};
*/					
			/**
			<@< The remote user has to send the following fields in order to UPDATE an existing relation record:
			relatedFromToUpdate  : singular Entity singular description
			relatedToToUpdate  : singular Entity singular description
			relatedFromNew  : singular Entity singular description 
			relatedToNew	 : singular Entity singular description
			descriptionNew		: relation description
			cardinalityNew		: cardinality
			delChildrenNew	: boolean true or false
			
			>@> 
			**/			
/*			
			var dataJson= {relatedFromToUpdate:"Invoice", relatedToToUpdate:"InvoiceLine" , relatedFromNew:"Invoice", relatedToNew:"InvoiceLinePraXuxu" 
					, descriptionNew:"has" , cardinalityNew:"1_N", delChildrenNew:true}; // Invoice, Product, Customer
			
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer \n<br>-------------------------------------------------\n<br>REQUEST: Serverproces='"+ requestId+ "' " 
					+ " RequestName='" +	controlJson.request + "' /__[@@] Sent DataJson===>" + JSON.stringify( dataJson ) + "<== "
					+ "  /__[@@] CLIENT TimeDurationUntilReply=" + oReply.timing.clientTimer +" milliseconds " + " /__[@@] SERVER TimeDurationUntilReply=" + oReply.timing.serverTimer +" milliseconds "
					+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G1-relation_C" ) { 	//
		//-----------------------------------------------
			var requestId="G1";
			var controlJson={request:"relation_C",  isSqlDevelopment:isDevelopmentStage() 
					, isMonitoring: isWantMonitoring()
					};
*/					
			/**
			<@< The remote user has to send the following fields in order to create a new relation record:
			relatedFrom  : singular Entity singular description 
			relatedTo	 : singular Entity singular description
			description		: relation description
			cardinality		: cardinality
			delChildren		: boolean true or false
			WARNING: the relation create activity does NOT check if a given relation has already been entered !!!!!
				If you are not carefull you will end up with duplicated entries in the relation table 
			>@>
			**/			
/*			
			var dataJson= {relatedFrom:"Invoice", relatedTo:"InvoiceLine" , description:"has" , cardinality:"1_N", delChildren:true}; // Invoice, Product, Customer
			
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer \n<br>-------------------------------------------------\n<br>REQUEST: Serverproces='"+ requestId+ "' " 
					+ " RequestName='" +	controlJson.request + "' /__[@@] Sent DataJson===>" + JSON.stringify( dataJson ) + "<== "
					+ "  /__[@@] CLIENT TimeDurationUntilReply=" + oReply.timing.clientTimer +" milliseconds " + " /__[@@] SERVER TimeDurationUntilReply=" + oReply.timing.serverTimer +" milliseconds "
					+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G1-relation_R_ALL" ) { 	//
		//-----------------------------------------------
			var requestId="G1";
			var controlJson={request:"relation_R_ALL",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			// 
			
			var dataJson= { }; // Invoice, Product, Customer
			// CASE {relatedFrom:"Invoice" } ==> RESULT : [{"leftEntityId":3,"description":"has","cardinality":"0_1","delChildren":false,"relatedTo":"Customer","relatedFrom":"Invoice"}]
			// CASE {relatedFrom:"Customer" } ==> RESULT :[{"leftEntityId":1,"description":"has","cardinality":"0_N","delChildren":false,"relatedTo":"Invoice","relatedFrom":"Customer"}]
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer \n<br>-------------------------------------------------\n<br>REQUEST: Serverproces='"+ requestId+ "' " 
					+ " RequestName='" +	controlJson.request + "' /__[@@] Sent DataJson===>" + JSON.stringify( dataJson ) + "<== "
					+ "  /__[@@] CLIENT TimeDurationUntilReply=" + oReply.timing.clientTimer +" milliseconds " + " /__[@@] SERVER TimeDurationUntilReply=" + oReply.timing.serverTimer +" milliseconds " 
					+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G1-relation_R" ) { 	//
		//-----------------------------------------------
			var requestId="G1";
			var controlJson={request:"relation_R",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			// 
			
			var dataJson= {relatedFrom:"Customer" }; // Invoice, Product, Customer
			// CASE {relatedFrom:"Invoice" } ==> RESULT : [{"leftEntityId":3,"description":"has","cardinality":"0_1","delChildren":false,"relatedTo":"Customer","relatedFrom":"Invoice"}]
			// CASE {relatedFrom:"Customer" } ==> RESULT :[{"leftEntityId":1,"description":"has","cardinality":"0_N","delChildren":false,"relatedTo":"Invoice","relatedFrom":"Customer"}]
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer \n<br>-------------------------------------------------\n<br>REQUEST: Serverproces='"+ requestId+ "' " 
					+ " RequestName='" +	controlJson.request + "' /__[@@] Sent DataJson===>" + JSON.stringify( dataJson ) + "<== "
					+ "  /__[@@] CLIENT TimeDurationUntilReply=" + oReply.timing.clientTimer +" milliseconds " + " /__[@@] SERVER TimeDurationUntilReply=" + oReply.timing.serverTimer +" milliseconds " 
					+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G1-entity_D" ) { 	//
		//-----------------------------------------------
			var requestId="G1";
			var controlJson={request:"entity_D",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			// 
			
			var dataJson= {entityName:"MINICustomer" }; // Invoice, Product, Customer
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer \n<br>-------------------------------------------------\n<br>REQUEST: Serverproces='"+ requestId+ "' " 
					+ " RequestName='" +	controlJson.request + "' /__[@@] Sent DataJson===>" + JSON.stringify( dataJson ) + "<== "
					+ "  /__[@@] CLIENT TimeDurationUntilReply=" + oReply.timing.clientTimer +" milliseconds " + " /__[@@] SERVER TimeDurationUntilReply=" + oReply.timing.serverTimer +" milliseconds "
					+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G1-entity_U" ) { 	//
		//-----------------------------------------------
			var requestId="G1";
			var controlJson={request:"entity_U",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			// 
			
			var dataJson= {entityName:"SSProduct", newEntityName:"Product", newEntityNamePlural:"Products" }; // Invoice, Product, Customer
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer \n<br>-------------------------------------------------\n<br>REQUEST: Serverproces='"+ requestId+ "' " 
					+ " RequestName='" +	controlJson.request + "' /__[@@] Sent DataJson===>" + JSON.stringify( dataJson ) + "<== "
					+ "  /__[@@] CLIENT TimeDurationUntilReply=" + oReply.timing.clientTimer +" milliseconds " + " /__[@@] SERVER TimeDurationUntilReply=" + oReply.timing.serverTimer +" milliseconds "
					+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G1-entity_R" ) { 	//
		//-----------------------------------------------
			var requestId="G1";
			var controlJson={request:"entity_R",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			// 
			
			var dataJson= {}; // Invoice, Product, Customer
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer \n<br>-------------------------------------------------\n<br>REQUEST: Serverproces='"+ requestId+ "' " 
					+ " RequestName='" +	controlJson.request + "' /__[@@] Sent DataJson===>" + JSON.stringify( dataJson ) + "<== "
					+ "  /__[@@] CLIENT TimeDurationUntilReply=" + oReply.timing.clientTimer +" milliseconds " + " /__[@@] SERVER TimeDurationUntilReply=" + oReply.timing.serverTimer +" milliseconds "
					+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G1-entity_C" ) { 	//
		//-----------------------------------------------
			var requestId="G1";
			var controlJson={request:"entity_C",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			// 
			
			// var dataJson= {entityName:"InvoiceLine",entityNamePlural:"InvoiceLines"}; // Invoice, Product, Customer
			var dataJson= {entityName:"InvoiceLinePraXuxu",entityNamePlural:"InvoiceLinesPraXuxu"}; // Invoice, Product, Customer
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer \n<br>-------------------------------------------------\n<br>REQUEST: Serverproces='"+ requestId+ "' " 
					+ " RequestName='" +	controlJson.request + "' /__[@@] Sent DataJson===>" + JSON.stringify( dataJson ) + "<== "
					+ "  /__[@@] CLIENT TimeDurationUntilReply=" + oReply.timing.clientTimer +" milliseconds " + " /__[@@] SERVER TimeDurationUntilReply=" + oReply.timing.serverTimer +" milliseconds " 
					+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G1-getMasterOnEntity" ) { 	//
		//-----------------------------------------------
			var requestId="G1";
			var controlJson={request:"getMasterOnEntityName",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			// 
			
			var dataJson= {entityName:"Customer"}; // Invoice, Product, Customer
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer \n<br>-------------------------------------------------\n<br>REQUEST: requestId='"+ requestId+ "' /__[@@] Sent DataJson===>" + JSON.stringify( dataJson ) + "<== "
					+ "  /__[@@] CLIENT TimeDurationUntilReply=" + oReply.timing.clientTimer +" milliseconds " + " /__[@@] SERVER TimeDurationUntilReply=" + oReply.timing.serverTimer +" milliseconds " 
					+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G2-testDataConversion" ) { 	//
		//-----------------------------------------------
			var requestId="G2";
			var controlJson={request:"getCityMetadata",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			
			
			var dataJson= [ 
							{city:"Amsterdam", country:"The Netherlands", population: "950000", active:"1"}
							,{city:"Lisbon", country:"Portugal", population: "1250000",  active:"1"}
							, {city:"London", country:"Great Britain", population: "12000000" , active:"0"}
							, {city:"Paris", country:"France", population: "13000000", active:"1"}
						];
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer requestId=["+ requestId+ "]   @@RequestDuration=[" + oReply.timing +"] milliseconds <br>"+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"<br> jsonString received={<"+ oReply.jsonString +">} \n<br>Info:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G2-getCityMetadata" ) { 	//
		//-----------------------------------------------
			var requestId="G2";
			var controlJson={request:"getCityMetadata",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			
			var dataJson={ } ; // 
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer requestId=["+requestId+ "]   @@RequestDuration=[" + oReply.timing +"] milliseconds <br>"+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"<br> jsonString received={<"+ oReply.jsonString +">} \n<br>Info:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		
		//-------------------------------------------------------------------
		} else if ( theTest=="G2-retrieveCity-conditional-execAfter" ) { 	//
		//-----------------------------------------------
			var requestId="G2";
			var controlJson={request:"citySelectOnCountryGetPersons",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			
			var dataJson={countrySel:"France" } ; // 
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer requestId=["+ requestId+ "]   @@RequestDuration=[" + oReply.timing +"] milliseconds <br>"+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"<br> jsonString received={<"+ oReply.jsonString +">} \n<br>Info:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		
		
		//-------------------------------------------------------------------
		} else if ( theTest=="G2-retrieveAllCities" ) { 	//
		//-----------------------------------------------
			var requestId="G2";
			var controlJson={request:"citySelectAll",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			
			var dataJson={} ; // nothing to send as data
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} //
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer requestId=["+ requestId+ "]   @@RequestDuration=[" + oReply.timing +"] milliseconds <br>"+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"<br> jsonString received={<"+ oReply.jsonString +">} \n<br>Info:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		
		//-------------------------------------------------------------------
		} else if ( theTest=="G2-retrievePersons-conditional" ) { 	//
		//-----------------------------------------------
			var requestId="G2";
			var controlJson={request:"personSelectOnCityAndAge",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			
			var dataJson={city:"Amsterdam", ageLimit:50} ;
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} // 
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer requestId=["+ requestId+ "]   @@RequestDuration=[" + oReply.timing +"] milliseconds <br>"+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"<br> jsonString received={<"+ oReply.jsonString +">} \n<br>Info:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------
		} else if ( theTest=="G2-retrievePersons" ) { 	//
		//-----------------------------------------------
			var requestId="G2";
			var controlJson={request:"personSelectAll",  isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			
			var dataJson={} ; // name:"Agent Piet05", familyname:"Politie05", street:"Politiestraat 17", city:"Odijk" , age:32 , active:true, zipcode:"1234ZA" }; // 
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			// alert("about to send request");
			// testServer :function( theUrl, requestId, controlJson, dataJson, replyCallback , thisContext)
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} // 
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer requestId=["+ requestId+ "]   @@RequestDuration=[" + oReply.timing +"] milliseconds <br>"+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"<br> jsonString received={<"+ oReply.jsonString +">} \n<br>Info:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------	
		} else if ( theTest=="G2-inputCity" ) { 	//
		//-----------------------------------------------
			var requestId="G2";
			var controlJson={request:"inputCity", isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
*/			
			/***** /
			var dataJson= [ {city:"Amsterdam", country:"The Netherlands", population: 950000}
							,{city:"Lisbon", country:"Portugal", population: 1250000}
							, {city:"London", country:"Great Britain", population: 12000000}
							, {city:"Paris", country:"France", population: 13000000}
						];
			/ *******/
			/***** /
			var dataJson= [ {city:"Beloura", country:"Portugal", population: 1345}
							,{city:"Oegstgeest", country:"The Netherlands", population: 4500}
						];
			/ *******/
/*			
			var dataJson= [ {city:"Eindhoven", country:"The Netherlands", population: 1345}
							,{city:"Leiden", country:"The Netherlands", population: 4500}
						];
			// @@@@@@@@@@@@@@@@@@@@@//
			
			// alert("about to send request");
			// testServer :function( theUrl, requestId, controlJson, dataJson, replyCallback , thisContext)
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} // , info: undocumented parameter !!
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer requestId=["+ requestId+ "]   @@RequestDuration=[" + oReply.timing +"] milliseconds <br>"+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"<br> jsonString received={<"+ oReply.jsonString +">} \n<br>Info:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
			// 
		//-------------------------------------------------------------------		
		} else if ( theTest=="G2-inputPerson" ) { 	//
		//-----------------------------------------------
			var requestId="G2";
			var controlJson={request:"inputPerson", isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
*/			
			/********
			
			var dataJson={name:"Agent Piet05", familyname:"Politie05", street:"Politiestraat 17", city:"Odijk" , age:32 , active:true, zipcode:"1234ZA" }; // 
			ABOVE: Sending only one row of data to input in the database
			BELOW: sending several rows of data 
			var dataJson= [ {name:"Joao Carlos", familyname:"Oliveira", street:"Rua das MachaDadas 95", city:"Beloura" , age:56 , active:true, zipcode:"9076-32" }
					, {name:"Isabel", familyname:"Stapleton Garcia", street:"Rua da Mothers 17", city:"Beloura" , age:58 , active:true, zipcode:"9076-32" }
					, {name:"Jan", familyname:"va Gogh", street:"Schilderstraat 32", city:"Amsterdam" , age:187 , active:false, zipcode:"8765TV" }
					, {name:"Francois", familyname:"Hollande", street:"Rue du President de la Republique 1", city:"Paris" , age:58 , active:true, zipcode:"9834-876" }
					, {name:"Michel", familyname:"Depardieu", street:"Rue du Chinois, 21", city:"Paris" , age:43 , active:true, zipcode:"9843-455" }
					, {name:"Karel", familyname:"van der Plas", street:"Kalverstraat 18", city:"Amsterdam" , age:46 , active:true, zipcode:"8765TV" }
			]; // 
			************/
/*			
			// ------------------------------------------------
			var dataJson= generatePersons(1, 40);
			// @@@@@@@@@@@@@@@@@@@@@//
			
			// alert("about to send request");
			// testServer :function( theUrl, requestId, controlJson, dataJson, replyCallback , thisContext)
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} // , info: undocumented parameter !!
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer requestId=["+ requestId+ "]   @@RequestDuration=[" + oReply.timing +"] milliseconds <br>"+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"<br> jsonString received={<"+ oReply.jsonString +">} \n<br>Info:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		//-------------------------------------------------------------------		
		} else if ( theTest=="G2-testPseudoSql" ) { 	//
		//-----------------------------------------------
			var requestId="G2";
			// <@_SQL_DICTIONARY_ENTRIES_@> , {@_SQL_FIELD_TYPES_@}
			var controlJson={request:"<@_SQL_FIELD_TYPES_@>", isSqlDevelopment:isDevelopmentStage() , isMonitoring: isWantMonitoring()};
			
			// ------------------------------------------------
			var dataJson= {}; //generatePersons(1, 40);
			// @@@@@@@@@@@@@@@@@@@@@//
			
			// alert("about to send request");
			// testServer :function( theUrl, requestId, controlJson, dataJson, replyCallback , thisContext)
			aj.request( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> , info: <debuginfodata>} // , info: undocumented parameter !!
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer requestId=["+ requestId+ "]   @@RequestDuration=[" + oReply.timing.clientTimer +"] milliseconds <br>"+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
					+ " ErrorMessage="+ oReply.errorMessage+"<br> jsonString received={<"+ oReply.jsonString +">} \n<br>Info:\n<br>"+ oReply.info;
			}, this); // <----- notice this here: my context
		
		//------------------------------------
		} else if ( theTest=="echoParms" ) {
		//--------------------------------------------------
			// testServer :function( theUrl, requestId, controlJson, dataJson, replyCallback , thisContext)
			
			var requestId="showMeTheWorld";
			var controlJson={action:"doThisOrThat", use:"useThisOrThat"};
			var dataJson={person:{name:"Travolta", age:47}, relation: {married:true, partner:"Mrs. Clinton"} };
			// 
			// @@@@@@@@@@@@@@@@@@@@@//
			
			// alert("about to send request");
			// testServer :function( theUrl, requestId, controlJson, dataJson, replyCallback , thisContext)
			aj.testServer( urlServerCounterpart, requestId,  controlJson, dataJson, function( oReply ) {
				// oReply : {isSuccess:<boolean>, errorMessage:<string>, jsonString:<aJsonString>, jsonObject: <aJsonObject_or_null> }
				var infolocation = dojo.byId("infolocation0");
				
				infolocation.innerHTML= "<@@>"+this.id+" testServer requestId=["+ requestId+ "]   @@RequestDuration=[" + oReply.timing +"] milliseconds <br>"+(oReply.isSuccess?'no-errors':'!ERROR!')
					+ " ErrorMessage="+ oReply.errorMessage+"<br> jsonString received={<"+ oReply.jsonString +">}";
			}, this); // <----- notice this here: my context
			
		
		//------------------------------------
		} else if ( theTest=="getVersion" ) { 
		//-------------------------------------------------------------------
			var tt1="This string contains amps like & and & and && and &&& etc but also ` and `` !!";
			// var tt1="This string is clean and does not contain amps nor left quotes";
			tt1="group03/file30a.txt";
			aj.getVersion( urlServerCounterpart, "", function( response ) {
				var infolocation0 = dojo.byId("infolocation0");
				var infolocation1 = dojo.byId("infolocation1");
				
				infolocation0.innerHTML= "<@@>"+this.id+"<<<@>>> testPhp <<<@>>> "+(response.isSuccess?'no-errors':'!ERROR!')+ "<br> ErrorMessage="+ response.errorMessage;
				infolocation1.innerHTML= "Version Information{{"+ response.version+"}}@";
				
			}, this);
			
			//----------------------------------
			
		}; // else end
		//-----------
*****/
		
		
	}
});//end of classe dajaxTest
});//end of callback function and end of define

// , isDetailedMonitoring:true

/*****
var generatePersons = function( iFrom , iCount) {
		var aOut=new Array();
		for (var ii=iFrom; ii< iFrom+iCount; ii++) {
			var ixx= ii % 4;
			var oo= null;
			if ( ixx==0 ) {
				 oo= {name:"Marcel-"+ii, familyname:"Sebastien-"+ii, street:"Avenue Kleber, "+(( ii%140)+1), city:"Paris" , age: (( ii%60)+17) , active:true, zipcode:"826"+(ii%100) };
			} else if ( ixx==1 ) {
				oo= {name:"Arnold-"+ii, familyname:"van Basten-"+ii, street:"Schonebeeklaan, "+(( ii%75)+1), city:"Amsterdam" , age: (( ii%54)+17) , active:true, zipcode:"765"+(ii%71) };
			} else if ( ixx==2 ) {
				oo = {name:"Mario-"+ii, familyname:"Bernardino-"+ii, street:"Rua Bernardo Santareno, "+(( ii%23)+1), city:"Lisboa" , age: (( ii%48)+16) , active:false, zipcode:"6498"+(ii%87) };
			} else if ( ixx==3 ) {
				oo= {name:"Francis-"+ii, familyname:"Scott-"+ii, street:"Seaside Road "+(( ii%64)+1), city:"London" , age: (( ii%60)+17) , active:true, zipcode:"615"+(ii%131) };
				
			}; // end if
			aOut.push(oo);
			
		};
		// {name:"Isabel", familyname:"Stapleton Garcia", street:"Rua da Mothers 17", city:"Beloura" , age:58 , active:true, zipcode:"9076-32" }
		return aOut;
	};

******/