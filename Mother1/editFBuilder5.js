	_z={me:"I am _z!"};
	//_thiz=null;
	_editFBuilder5=null;//necessary for motherLib eval (ex: so that Fbuilder buttons can run conde in this class...)
	define([
			"Mother1/utils.js",
			"Mother1/debug.js",
			"MotherLib6.js",
			"Mother1/ResizeMoveArea.js", 
			"Mother1/json2FormDsgn2.js", 
			"../dajax_curr/DojJsonStore.js",
			"dojo/_base/declare",
			"dojo/_base/Deferred", //this is for version 1.7
			//----- para editFBuilder on,Lang,DomGeom
			"dojo/_base/window",//used
			"dojo/on",//used
			"dojo/dom",//used
			"dojo/_base/lang",
			"dojo/dom-geometry",
			"dojo/dom-construct",
			"dojo/dom-style",
			"dijit/registry",				
			"dojo/Evented", //necessário para emit e recepção de eventos	 
			 "dojo/domReady!"], 
		function(Utils,Dbg,FBuilder,ResizeMoveArea,Json2F,JsonStoreCrud,Declare,Deferred,Win,On,Dom,Lang,DomGeom,DomConstruct,DomStyle,Registry,Evented){	
		//function(Utils,Declare,Lang,DomGeom,Evented){	
		return Declare("editFBuilder",[Evented,FBuilder],{
			// Exemple of Use:	editF=new editFBuilder(f1,"click"); //f1 is a form (FBuilder instance), par2 is an eventType"mouseenter" or "click"
			//   editFBuilder v4 supports the edition of all widgets contained in the FBuilder FORM that is passed as the first paramenter
			//        this edition is suported by two floating forms (formEdition and properties) whose initial position can be defined by an optional 3rd paramenter (initialPos) 
			//		  with the initial coordinates of each floating form.
			//		  Note a): For the form being edited, the formEdition floating form will allow: 
			//				 	the switch between run and design mode, selection of design templates and creation of new widgets 
			//		  Note b): For any widget belonging to the form being edited, the properties floating form will allow: 
			//				 	the name/rename of the widget, the elimination of the widget, the modeling of the widget properties.
			//				   The properties floating window, will only appear if the formEdition run/design switch is set to "design" and one widget is selected
			//		  
			//	General operation:
			//		On construction the class will present the formEdition floating form (in the default position(l:1180,t:5) or in the defined position when 3rd paramenter 
			//			is defined for formEdition ( initialPos={formEditionL:l1,formEditionT:t1,propertiesL:l2,propertiesT:t2} )
			//   This class will act upon any existing form (an fBuilder instance - in the example above ->f1) using the event ((in the example above ->"mouseenter")
			//		to edit any of the form's widgets. To edit the form's widgets means:
			//      1 - Whenever the user move the mouse to trigger the specified event (par2 "click" or "mouseenter" ) associated to an widget, the class will provide a 
			//   		"handles-on" approach to resize and move the widget to any position of the form. (even outside the form).
			//      2 - Whenever the user clicks outside the current selected widget the handles will go and the user can repeat step 1 to
			//			any other or the same widget.
			//  This class provides two events to upper classes using it.
			//     event "widget_selected" - this will be triggered in step 1 above
			//     event "widget_unselected" - this will be triggered in step 2 above
			//
			//  What type of information can we get in these events ?
			//    for the current selected event (or last selected in "widget_unselected") we can get: 
			//       editF.currentWidget.id,editF.currentWidget.type, 
			//		 editF.currentWidget.posInArr (the order of the widget inside the form )
			// 		 editF.currentWidget.left,editF.currentWidget.top,editF.currentWidget.width,editF.currentWidget.height
			//
			//   exemples:
			// 		editF.on("widget_selected",function(){
			//			var xOrder=editF.currentWidget.posInArr;
			//			console.log("test_MotherLib5_4 -- Pos="+xOrder+" x="+editF.currentWidget.left+" y="+editF.currentWidget.top);
			//			f1.unVisibleById(editF.currentWidget.id)
			//		});	
			//  	editF.on("widget_unselected",function(){
			//			console.log("test_MotherLib5_4 -- CAPTOU EVENT 'widget_unselected'-> FOI DESELECCIONADO O WIDGET "+editF.currentWidget.id+" do tipo "+editF.currentWidget.type);
			//			f1.visibleById(editF.currentWidget.id)
			//			editF.reset();//volta a por listeners à escuta
			//		});		
			//
			// To DEBUG this class set areaBorderColor:"red" instead of null
			// -----------------------------------------
			oDbg:null,
			overWHandlers:[],//array that will receive the handlers for overWidget listener
			outWHandlers:[],//array that will receive the handlers for outWidget listner
			//mouseClickOnWHandlers:[],//array that will receive the handlers for mouseClickOnWidget listner
			//mouseDownOnCanvasHandler:null,//the main handler in viewport - runs in any mousedown
			//mouseMoveInsideWHandler:null,
			// -----------------------
			//currentWidget:{id:null,top:0,oTop:0,left:0,oLeft:0,width:0,height:0,bottom:0,extremeL:0,type:null,posInArr:null,adjW:0,adjH:0},//established in overwidget to evaluate border zone in mouseMoveInsideW
			currentWidget:{id:null,top:0,left:0,width:0,height:0,type:null,posInArr:null},//set in overwidget for the selected widget

			//this adjustment does not include the Grid deviation because of unknown reason - Just deviations to get the screen area around the widgdet
			adjust:{"textBox":{w:0,h:0},label:{w:0,h:0},numberBox:{w:0,h:0},textArea:{w:0,h:0},checkBox:{w:0,h:0},dateTextBox:{w:0,h:0},button:{w:4,h:0},comboBox:{w:0,h:0},grid:{w:0,h:0},tabs:{w:0,h:0}}, //no caso da grid x+=7 y+=22 !!!
			//--------------------------------------------
			//objEditForm:null,
			objEditForm:null,
			objResizeMove:null,
			previousId:null, //we should know if the id of the current element==previousId ->Yes=>activate(), No=>reset(...);activate();
			bugSemaphore:false,
			areasRoot:null,//DOM div that will be the root for all areas (each area corresponding to a widget.
			areaBorderColor:null,//null,//"red"; //this normally should be null - place "red" in here to "see" the sensible areas...<---TO DEBUG VISUALLY
			eventType:"click",//this is the leading event for editFBuilder - 
			//							"mouseenter" the handles will show when entering an element
			//							"click" the handles will show when we click  an element
			_moveResizeDiv0:{w:0,h:0},//TO SOLVE THE OVERSHADOWING PROBLEM in eventType="click", it should remember  w and l for id="_moveResizeDiv0" used in ResizeMoveArea2
			//------- properties needed to incorporate _fx FORM and _prop FORM---
			_fx:null,
			_prop:null,
			initialPos:{},//it will be -->{formEditionL:l1,formEditionT:t1,propertiesL:l2,propertiesT:t2} )
			slot:0,
			zzz:null,

			//-------------------------------------------------------------------
			k:0,
			//nota sobre a utilização de ResizeMoveArea: usar activate() para activar um elemento já definido com o contructor ou com reset(....)
			//      se o elemento é o corrente, e quisermos activa-lo: fazer activate()
			//      se é um elemento novo: fazer reset(" --> "+this.currentWidget.type,widgetPosition.x-z+this.objEditForm.borderThickness,widgetPosition.y-z+this.objEditForm.borderThickness,widgetPosition.w,widgetPosition.h,1,"dotted","gold");
			//                 ...caracterizando o novo elemento, e depois fazer activate() para o activar 
			// version 3 includes the properties form _properties
			//---------------------------
			//the ancestor class (or superclass) (FBuilder) is always called automatically before the subclass constructor, and with the
			// same parameters as the subclass. Normally the subclass would have more parameters. In the superclass call all excess paramenters
			// will be ignored.
			// if we want to define how inicialization of superclass works the chainning should be turned of with:
			// "-chains-":{constructor:"manual"}
			//   constructor:"manual".
			"-chains-":{constructor:"manual"}, //this inhibits the automatic call to FBuilder
			constructor:function(objEditForm,eventType,initialPos){
				// Use Exemples:
				//    Accepting default initial values for windows formEdition (1180,5) and properties (100,50)
				//	  	edit_f0=new EditFBuilder(f0,"click"); //"mouseenter","click"  <---- in this example we accept default initial values 
				//	  setting initial position for formEditionL window
				//	  	edit_f0=new EditFBuilder(f0,"click",{formEditionL:900,formEditionT:50}); 
				//    setting initial position for formEditionL and properties window
				//		edit_f0=new EditFBuilder(f0,"click",{formEditionL:1100,formEditionT:5,propertiesL:1000,propertiesT:100});
				//the ancestor class (or superclass) (FBuilder) is always called automatically before the subclass constructor, and with the
				// same parameters as the subclass. Normally the subclass would have more parameters. In the superclass call all excess paramenters
				// will be ignored.
				// if we want to define how inicialization of superclass works the chainning should be turned of with "-chains-":{constructor:"manual"}, 
				//the properties of editFBuilder area mixin of FfBuilder properties and editFBuilder (because of inheritance)
				//_thiz=this;
				_editFBuilder5=this;//so that fBuilder can call editFBuilder4's methods via eval
				//----------------------------------------------------------------------------------------------
				console.assert((objEditForm),"editFBuilder5.contructor ->objEditForm is undefined or false !!!");
				//----------- debug preparation Area -----------------------------------------------------------
				this.oDbg=new Dbg();
				this.oDbg.setThis("editFBuilder4");//All debugs within this class will belong to "editFBuilder2"	
				//----------------------------------------------------------------------------------------------
				//declare.safeMixin(this, initialPos);//initialPos vem na forma {"test1":51,"test2":52,"test3":53} - this does not do the viewport mixin !!! we have to do it now !
				//initialPos:{},//it will be -->{formEditionL:l1,formEditionT:t1,propertiesL:l2,propertiesT:t2} )

				this.initialPos={formEditionL:1180,formEditionT:5,propertiesL:950,propertiesT:80}; //now that initialPos is private, we set its default values. 
				Declare.safeMixin(this.initialPos, initialPos);//Now we can do do the mixin of initialPos (3rd parameter)

				//alert("->editFBuilder.constructor CONSTRUCTOR");
				this.objEditForm=objEditForm;	//objEditForm:null,
				this.eventType=eventType;
				this.overWHandlers=[]; //it is instanciated in constructor to avoid sharing of array between diferent instances 
				this.outWHandlers=[];//it is instanciated in constructor to avoid sharing of array between diferent instances 
				//console.log("editFBuilder.constructor - Totobjects="+this.objEditForm.totObjects());
				this.setAListeners();
				
				if(this.oDbg.isDbg("constructor")) this.oDbg.display("END of constructor Totobjects="+this.objEditForm.totObjects());
				
				//------------------  fx form (to DEFINE FORM PROPERTIES)
				var xDesign=true;
				var xEntity="teste";
				//var fx=new FBuilder("a)switch run/design","fx",{viewPort:{l:1180,t:5,w:220,h:330,floatF:"nonModal"},borderColor:"red",borderType:"solid",borderThickness:1});
				this._fx=new FBuilder("editFBuilder5 - run/design","_fx",{viewPort:{l:this.initialPos.formEditionL,t:this.initialPos.formEditionT,w:220,h:360,floatF:"nonModal"},borderColor:"red",borderType:"solid",borderThickness:1});
				//var fx=new FBuilder("a)switch run/design","fx",{viewPort:{l:1190,w:210,h:253},borderColor:"black",borderType:"solid",borderThickness:1});
				//fx.addChild("button",{left:0,top:0,width:203,value:"Design",clickCode:"thiz.z.run_Design()"});//1
				this._fx.addChild("button",{left:0,top:0,width:203,value:"Design",clickCode:"_editFBuilder5.run_Design()"});//1
				this._fx.addChild("label",{value:"Entity:",left:2,top:30}); //2
				this._fx.addChild("textBox",{name:"entity",value:xEntity,left:45,top:30,width:160,posCode:"this.set('lblEntityDescription','What is a '+this.get('entity')+'?');"}); //3
				
				this._fx.addChild("label",  {name:"lblEntityDescription",left:2,top:58,value:"Form Description:"}); //4
				this._fx.addChild("textArea",{left:2,top:78,width:205,height:50}); //5

				this._fx.addChild("label",{value:"Form Name:",left:2,top:135}); //6
				this._fx.addChild("textBox",{name:"fName",value:xEntity,left:82,top:135,width:123}); //7

				
				var xArr=[{name:"Claro"},{name:"Blue Hills"},{name:"Simple Green"},{name:"Autumn Tree"},{name:"Chess"},{name:"Light Blue"},{name:"A+C background"}];
				this._fx.addChild("comboBox",{name:"templates",left:2,top:165,value:"Select Template",comboArr:xArr,width:202,changeCode:"zOption=_editFBuilder5.getComboChoice(this.value);"});//8

				
				this._fx.addChild("label",{value:"Insert widgets:",left:5,top:192}); //3

				var xTop=212;		
				this._fx.addChild("button",{left:0,top:xTop,width:65,height:25,value:"Text",clickCode:"_editFBuilder5.insertW('textBox')"});//4
				this._fx.addChild("button",{left:68,top:xTop,width:65,height:25,value:"Label",clickCode:"_editFBuilder5.insertW('label')"});//5
				this._fx.addChild("button",{left:136,top:xTop,width:65,height:25,value:"Num.",clickCode:"_editFBuilder5.insertW('numberBox')"});//6
				
				this._fx.addChild("button",{left:0,top:xTop+25,width:65,height:25,value:"Area",clickCode:"_editFBuilder5.insertW('textArea')"});//4
				this._fx.addChild("button",{left:68,top:xTop+25,width:65,height:25,value:"Check",clickCode:"_editFBuilder5.insertW('checkBox')"});//4
				this._fx.addChild("button",{left:136,top:xTop+25,width:65,height:25,value:"Date",clickCode:"_editFBuilder5.insertW('dateTextBox')"});//4

				this._fx.addChild("button",{left:0,top:xTop+50,width:65,height:25,value:"Button",clickCode:"_editFBuilder5.insertW('button')"});//4
				this._fx.addChild("button",{left:68,top:xTop+50,width:65,height:25,value:"Combo",clickCode:"_editFBuilder5.insertW('comboBox')"});//4
				this._fx.addChild("button",{left:136,top:xTop+50,width:65,height:25,value:"Grid",clickCode:"_editFBuilder5.insertW('grid')"});//4

				this._fx.addChild("button",{name:"btnSave",left:0,top:xTop+76,width:90,height:35,value:"Save Form",clickCode:"_editFBuilder5.save()"});//4
				this._fx.addChild("button",{name:"btnRestore",left:95,top:xTop+76,width:100,height:35,value:"Restore",clickCode:"_editFBuilder5.restore()"});//4
				//this._fx.addChild("button",{name:"btnRestore",left:95,top:xTop+76,width:100,height:35,value:"Restore",clickCode:"this.restore()"});//4
				
				var xVal=this._fx.fieldById("_fx1").props.value; //the same as .label
				
				if(this.oDbg.isDbg("constructor")) this.oDbg.display("_fx form definition completed - Initial value for button DESIGN/RUN="+xVal);
				
				//-----------------------------------------------_prop FORM
				var xEntity="Customer";
				this._prop=new FBuilder("b)Properties","_prop",{viewPort:{l:this.initialPos.propertiesL,t:this.initialPos.propertiesT,w:225,h:365,floatF:"nonModal"},borderColor:"green",borderType:"solid",borderThickness:1,silent:true});
				this._prop.addChild("textBox",{left:5,top:6,width:110}); //1
				this._prop.addChild("label",  {left:125, top:6,width:155,value:" of "+xEntity}); //2
				this._prop.addChild("label",  {left:5,top:35,value:"Description:"}); //3
				this._prop.addChild("textArea",{left:5,top:55,width:220,height:50}); //4

				this._prop.addChild("label",  {left:5,top:108,width:155,value:"No widget selected "}); //5
				this._prop.addChild("button", {left:175,top:105,width:40,height:25,value:"Del",clickCode:"_editFBuilder5.deleteW()"});//6
				
				//this._prop.addChild("grid",   {left:5,top:135,width:215,height:189,showId:false,headers:"Name,Value",colTypes:"text/50,text/100"});//7
				this._prop.addChild("grid",   {left:5,top:135,width:215,height:189,showId:false,headers:"Name/text(50),Value/text(100)"});//7

			},
			reset:function(){
				this.resumeWListeners();//Volta a recolocar os listeners à escuta
			},
			overWidget:function(xWOrder,e){//chamado com dojo.parcial(overWidget,xId) 
				if(this.objResizeMove){	//TO SOLVE THE OVERSHADOWING PROBLEM in eventType="click".
					// When waiting for click the id="_moveResizeDiv0" can not overlap any sensible area (if it does that are will not react to "click")
					//    Therefore in outWidget we saved the current w,h of DOM id="_moveResizeDiv0", we set w,h to 0 and we recover the inicail dimensions here !
					//console.log("editFBuilder.overWidget  repositions _moveResizeDiv0.w="+this._moveResizeDiv0.w+"  _moveResizeDiv0.h="+this._moveResizeDiv0.h);
					if(this.oDbg.isDbg("overWidget")) this.oDbg.display("objResizeMove already exists ->repositions _moveResizeDiv0.w="+this._moveResizeDiv0.w+"  _moveResizeDiv0.h="+this._moveResizeDiv0.h);
					DomStyle.set(Dom.byId("_moveResizeDiv0_editFBuilder"),"width",this._moveResizeDiv0.w);
					DomStyle.set(Dom.byId("_moveResizeDiv0_editFBuilder"),"height",this._moveResizeDiv0.h);
					//----------------------------------------------------------------------------------------
				};
				var xAreaId=null;
				var xAreaNode=null;
				var adj=null;
				//console.log("ENTROU order="+xWOrder);
				if(this.oDbg.isDbg("overWidget")) this.oDbg.display("ENTROU order="+xWOrder);
				var widget=this.objEditForm.field(xWOrder);
				this.currentWidget.id=widget.props.id;
				this.currentWidget.posInArr=xWOrder;//widget position in f0.arrObj		
				this.currentWidget.type=widget.type;
				this.currentWidget.left=parseInt(widget.props.style.left);//the positions in fBuilder
				this.currentWidget.top=parseInt(widget.props.style.top);	
				this.currentWidget.width=parseInt(widget.props.style.width);
				this.currentWidget.height=parseInt(widget.props.style.height);
				
				//console.log("editFBuilder.overWidget 1) OVERWIDGET Entrou em "+this.currentWidget.id+" type="+this.currentWidget.type+" x="+this.currentWidget.left+" y="+this.currentWidget.top);
				if(this.oDbg.isDbg("overWidget")) this.oDbg.display("1) OVERWIDGET Entrou em "+this.currentWidget.id+" type="+this.currentWidget.type+" x="+this.currentWidget.left+" y="+this.currentWidget.top);
				adj=this.trambolhos(this.currentWidget.type);//devolve {l:xL,t:xT,w:xW,h:xH};
				var zW=0;
				var zH=0;
				if(this.currentWidget.type=="button"){
					//zW=0;
					//zH=15;
				};
    			var widgetPosition={x:this.currentWidget.left+this.objEditForm.viewPort.l+this.objEditForm.borderThickness,y:this.currentWidget.top+this.objEditForm.viewPort.t+this.objEditForm.borderThickness,w:this.currentWidget.width+zW,h:this.currentWidget.height+zH};
				//console.log("editFBuilder.overWidget 2) c/ correcoes para display x="+widgetPosition.x+" y="+widgetPosition.y+" w="+widgetPosition.w+" h="+widgetPosition.h);
				if(this.oDbg.isDbg("overWidget")) this.oDbg.display("2) c/ correcoes para display x="+widgetPosition.x+" y="+widgetPosition.y+" w="+widgetPosition.w+" h="+widgetPosition.h);
				this.suspendWListeners();
				//console.log("editFBuilder.outWidget DESACTIVOU OS LISTENERS e vai emitir widget_selected");
				if(this.oDbg.isDbg("overWidget")) this.oDbg.display("DESACTIVOU OS LISTENERS e vai emitir widget_selected");
	
				this.emit("widget_selected",{});//- new on/event system - whenever one widget is clicked the event signal is emitted - FREE OF INTERNAL LISTENERS

				var first_time=false;
				if(!this.objResizeMove){

					first_time=true;
					//console.log("->editFBuilder.overWidget CRIA objResizeMove c/ x="+widgetPosition.x+" y="+widgetPosition.y+" w="+widgetPosition.w+" h="+widgetPosition.h);
					if(this.oDbg.isDbg("overWidget")) this.oDbg.display("1ª VEZ ->CRIA objResizeMove c/ x="+widgetPosition.x+" y="+widgetPosition.y+" w="+widgetPosition.w+" h="+widgetPosition.h);
					this.objResizeMove=new ResizeMoveArea("editFBuilder","  "+this.currentWidget.type,widgetPosition.x,widgetPosition.y,widgetPosition.w,widgetPosition.h,2,"dotted","gold");//borderType:solid, dotted,dashed
					// par1-Label, par2...par5 - positions, par6-borderThickness, par7-borderType, par8-borderColor
					this.objResizeMove.visible_on_wayout=false; //false will make the area invisible on the way out (click outside the element) - default is true.
					//to articulate _prop form with ResizeMoveArea (meaning that hanles will not go when we click in _prop form) we need to capture 
					//  the mouseenter event when entering/levaing the form to set this.objResizeMove.setStatus()
					var handler=On.pausable(this._prop.fDialog.domNode,"mouseenter",Lang.hitch(this,function(){//when it enters the dialog of _prop
						//alert("editFBuilder Entrou no dialog de em _prop !!!");
						this.objResizeMove.setStatus(false);
					}));				
					var handler2=On.pausable(this._prop.fDialog.domNode,"mouseleave",Lang.hitch(this,function(){
						this._prop.viewPort.l=DomStyle.get(this._prop.fDialog.domNode,'left');//necessary to keep the last positions
						this._prop.viewPort.t=DomStyle.get(this._prop.fDialog.domNode,'top');
						DomStyle.set(this._prop.fDialog.domNode,'left',this._prop.viewPort.l+'px');
						DomStyle.set(this._prop.fDialog.domNode,'top',this._prop.viewPort.t+'px');
						this.objResizeMove.setStatus(true);
					}));	

					this.k=0;
					
					this.objResizeMove.on("resizeMoveEnd",Lang.hitch(this,function(){
						this.k++;
						var xL=this.objResizeMove.position.x-this.objEditForm.viewPort.l-this.objEditForm.borderThickness;//new positions - we have to subtract the pane coordinates and borderThickness
						var xT=this.objResizeMove.position.y-this.objEditForm.viewPort.t-this.objEditForm.borderThickness;//new positions - we have to subtract the pane coordinates and borderThickness
						var xW=this.objResizeMove.position.w;
						var xH=this.objResizeMove.position.h;
						//console.log("->"+this.k+" a)editFBuilder.overWidget/resizeMoveEnd CLICK DE SAIDA  guarda em MotherLib Positions: x="+xL+" y="+xT+" width="+xW+" height="+xH);
						if(this.oDbg.isDbg("overWidget")) this.oDbg.display("->"+this.k+" a)callback resizeMoveEnd CLICK DE SAIDA de id="+this.currentWidget.id+" guarda em MotherLib Positions: x="+xL+" y="+xT+" width="+xW+" height="+xH);
						this.objEditForm.setFieldStyle(this.currentWidget.id,{left:xL,top:xT,width:xW,height:xH}); //now we will save the new widget position 			
						
						// now it adjusts the image
						xAreaId="A"+this.currentWidget.posInArr+"_inner";//the id of the innertHTML of element with id="A"+<i>
						adj=this.trambolhos(this.currentWidget.type);//devolve {l:xL,t:xT,w:xW,h:xH};
						//alert("TRAMBOLHOS "+JSON.stringify(adj));
						xL+=this.objEditForm.viewPort.l+this.objEditForm.borderThickness+adj.l;
						xT+=this.objEditForm.viewPort.t+this.objEditForm.borderThickness+adj.t;
						xW+=adj.w;
						xH+=adj.h;
						
						// adjust event trigger area
						DomStyle.set(xAreaId, "left", xL+"px");
						DomStyle.set(xAreaId, "top", xT+"px");
						DomStyle.set(xAreaId, "width", xW+"px");
						DomStyle.set(xAreaId, "height", xH+"px");
						//console.log("->"+this.k+" b)editFBuilder.overWidget/resizeMoveEnd reposiciona Area="+xAreaId+"->Positions x="+xL+" y="+xT+" width="+xW+" height="+xH);
						if(this.oDbg.isDbg("overWidget")) this.oDbg.display("->"+this.k+" b)callback resizeMoveEnd reposiciona Area="+xAreaId+"->Positions x="+xL+" y="+xT+" width="+xW+" height="+xH);
						//console.log("->"+this.k+" c)editFBuilder.overWidget/resizeMoveEnd --> VAI para outWidget()");
						if(this.oDbg.isDbg("overWidget")) this.oDbg.display("->"+this.k+" c)callback resizeMoveEnd --> VAI para outWidget()");
						this.outWidget();
					}));
				};
				if(this.currentWidget.id==this.previousId){
					//console.log("->editFBuilder.overWidget THE SAME ELEMENT =>activa apenas");
					if(this.oDbg.isDbg("overWidget")) this.oDbg.display("current==previous ");
				}else{
					//var z=0; //esquecer-me do var custou-me 2 horas !!!
					this.previousId=this.currentWidget.id;
					if(this.oDbg.isDbg("overWidget")) this.oDbg.display("current != previous first_time="+first_time);
					if(!first_time){//the first time it is not necessary to do reset - the constructor does it all.
						//console.log("->editFBuilder.overWidget faz reset() ");	
						if(this.oDbg.isDbg("overWidget")) this.oDbg.display("-->Not the fist time - vai fazer reset()");
						//this.objResizeMove.reset(" --> "+this.currentWidget.type,widgetPosition.x+z,widgetPosition.y+z,widgetPosition.w,widgetPosition.h,1,"dotted","gold");//borderType:solid, dotted,dashed		
						this.objResizeMove.reset(" --> "+this.currentWidget.type,widgetPosition.x,widgetPosition.y,widgetPosition.w,widgetPosition.h,1,"dotted","gold");//borderType:solid, dotted,dashed		
					};	
				};
				//console.log("->editFBuilder.overWidget -------------------------------------------------------------------------------------->faz activate() ");			
				if(this.oDbg.isDbg("overWidget")) this.oDbg.display("The first time --->faz activate()"); 
				this.objResizeMove.activate();
			
			},
			outWidget:function(){
				//console.log("SAIU");
				if(this.oDbg.isDbg("outWidget")) this.oDbg.display("SAIU");
				//if(this.oDbg.isDbg("outWidget")) this.oDbg.display("->SAIU 2 - entrada em outWidget ->o valor de z.me="+thiz.z.me);

				//TO SOLVE THE OVERSHADOWING PROBLEM in eventType="click", it should remember  w and l for id="_moveResizeDiv0"
				this._moveResizeDiv0.w=DomStyle.get(Dom.byId("_moveResizeDiv0_editFBuilder"),"width");//remembers the current position
				this._moveResizeDiv0.h=DomStyle.get(Dom.byId("_moveResizeDiv0_editFBuilder"),"height");//remembers the current position
				//console.log("outWidget saved _moveResizeDiv0.w="+this._moveResizeDiv0.w+"  _moveResizeDiv0.h="+this._moveResizeDiv0.h);
				//console.log("---->passou aqui A");
				if(this.oDbg.isDbg("outWidget")) this.oDbg.display("saved _moveResizeDiv0.w="+this._moveResizeDiv0.w+"  _moveResizeDiv0.h="+this._moveResizeDiv0.h);
				DomStyle.set(Dom.byId("_moveResizeDiv0_editFBuilder"),"width",0);
				DomStyle.set(Dom.byId("_moveResizeDiv0_editFBuilder"),"height",0);
				//----------------------------------------------------------------------------------------
				//console.log("---->passou aqui B");
				
				//console.log("->editFBuilder.outWidget-->SAIU de "+this.currentWidget.id+" Vai emitir widget_unselected event");
				if(this.oDbg.isDbg("outWidget")) this.oDbg.display("->SAIU de "+this.currentWidget.id+" Vai emitir widget_unselected event");
				this.emit("widget_unselected",{});//- whenever ouWidget event occurs - EVENTS ARE SUSPENDED
				//console.log("->editFBuilder.outWidget ---------------------------------------------------------------------------------------> regressou de widget_unselected");
				if(this.oDbg.isDbg("outWidget")) this.oDbg.display("->regressou de widget_unselected");
				//if(this.oDbg.isDbg("outWidget")) this.oDbg.display("->regressou de widget_unselected 2 ->o valor de z.me="+thiz.z.me);
		
			},//outWidget
			trambolhos:function(xType){
				//este método devolve os ajustes a fazer nas coordenadas l,t,w e w para que (sem tocar na data de fBuilder): 
				//     1)a area de triggering de cada widget seja uma envolvente da sua imagem
				//	   2)os handles estejam colocados de acordo com a imagem dos widgets
				// A area de triggering é alargada para quase todos os widgets (info em this.adjust[xType]) AQUI NÃO HÁ CORRECAO DA GRID ->só em fBuilder
				//    as correcções são de forma a que : fbuilder position+ trambolhos ==> final position of triggering area and handles on screen
				//       Nota: Relembrar que a responsabilidade de por o widget no screen é toda de fBuilder
				//    Nota: de momento apenas se aplica a grids e a buttons
				// This method introduces corrections due to: 
				//             setting of sensible area around the widget (addMarginL and addMarginT)
				//             borderThickness,w/h adjustments for each widget type(this.adjust[xType]) - borderThickness IS NOT TREATED HERE !!
				//
				//  To increase or decrease the sensible area use only addMarginL and addMarginT !!!
				var addMarginL=-4;//significa que a envolvente começa 2 à esquerda da posição indicada em fBuilder (para lá das outraa correcções)
				var addMarginT=-4;//significa que a envolvente começa 2 acima da posição indicada em fBuilder (para lá das outraa correcções)

				//var xL=this.objEditForm.borderThickness+addMarginL;// a triggering area de todos os widgets começa -2 à esq
				var xL=addMarginL;// a triggering area de todos os widgets começa -2 à esq
				//var xT=this.objEditForm.borderThickness+addMarginT;// a triggering area de todos os widgets começa -2 à acima
				var xT=addMarginT;// a triggering area de todos os widgets começa -2 à acima
				var xW=0;
				var xH=0;
				xW+=this.adjust[xType].w-2*addMarginL; //se deslocamos a area xL (positivo) devemos retirar 2*xL
				xH+=this.adjust[xType].h-2*addMarginT; //idem acima
				return {l:xL,t:xT,w:xW,h:xH};
			},
			setAListeners:function(){//set Area Listeners
				//this will define an array of domNode areas for each widget, setting up the listenner for the domNode
				//the listener area will have (for some widgets) an adjustment relatively to their real (the size in the json) size
				//    this adjustment will be w,h saved in this.currentWidget (we introduce {adjW:x1,adjH:x2})
				var util=new Utils();
				var xId=null;
				var xArea=null;
				var xAdiv=null;	
				var xType=null;
				var adj=null;
				var	xPaneL=	this.objEditForm.viewPort.l;		
				var	xPaneT=	this.objEditForm.viewPort.t;		
				if(this.areasRoot){//if it exists destroy it..
				   this.areasRoot.domNode.destroy();
				};
				this.areasRoot = DomConstruct.create("div",{id:"_areasRoot",}); //cria HTML div - 
				this.areasRoot.innerHTML=util.makeHTML("div","","A","",xPaneL,xPaneT,0,0,0,"","");
				Win.body().appendChild(this.areasRoot); 
				var xTotWidgets=this.objEditForm.totObjects(); 
				//xTotWidgets=2;
				var l,t,w,h=null;
				//console.log("->editFBuilder.setAListeners ->creates the domNodes and SETS all listeners for all domNodes");	
				if(this.oDbg.isDbg("setAListeners")) this.oDbg.display("->editFBuilder.setAListeners ->creates the domNodes and SETS all listeners for all domNodes");	
				for(var i=0;i<xTotWidgets;i++){ //Install listeners for overWidget and out Widget event
					//for each widgets creates a div with the same Area (style) of the widget - This will be the sensible area for triggers
					xId="A"+i;
					xType=this.objEditForm.field(i).type;
					adj=this.trambolhos(xType);//only area adjustments (w,h) in order to set the triggering area and place handles
					l=parseInt(this.objEditForm.field(i).props.style.left)+xPaneL+this.objEditForm.borderThickness+adj.l;
					t=parseInt(this.objEditForm.field(i).props.style.top)+xPaneT+this.objEditForm.borderThickness+adj.t;
					w=parseInt(this.objEditForm.field(i).props.style.width)+adj.w;
					h=parseInt(this.objEditForm.field(i).props.style.height)+adj.h;
					//console.log("setAListeners xId="+xId+" Type="+xType+" com: l="+l+" t="+t+" w="+w+" h="+h);
					//alert("setAListeners xId="+xId+"-->"+xArea+" Type="+xType+" com: l="+l+" t="+t+" w="+w+" h="+h+" adjust w="+this.adjust[xType].w+" adjust h="+this.adjust[xType].h);
				//xArea=util.makeHTML("div",xId+"_inner","A",this.objEditForm.field(i).type,l,t,w,h,3,"solid","red");
					xArea=util.makeHTML("div",xId+"_inner","A",this.objEditForm.field(i).type,l,t,w,h,3,"solid",this.areaBorderColor);
					//console.log("xId="+xId+"-->"+xArea+" Type="+xType+" com: l="+l+" t="+t+" w="+w+" h="+h);
					if(this.oDbg.isDbg("setAListeners")) this.oDbg.display("-->xId="+xId+"-->"+xArea+" Type="+xType+" com: l="+l+" t="+t+" w="+w+" h="+h);
					xAdiv = DomConstruct.create("div",{id:xId}); //cria HTML div a pendurar em this.areasRoot
					xAdiv.innerHTML=xArea;
					//console.log("editFBuilder.setAListeners ->vai criar area para "+this.objEditForm.field(i).type+" areaId="+xId);
					if(this.oDbg.isDbg("setAListeners")) this.oDbg.display("-->editFBuilder.setAListeners ->vai criar area para "+this.objEditForm.field(i).type+" areaId="+xId);
					this.areasRoot.appendChild(xAdiv); 
					//var handler=On.pausable(Dom.byId(xId),"mouseenter", dojo.partial(Lang.hitch(this,"overWidget"),i));
					var handler=On.pausable(Dom.byId(xId),this.eventType, dojo.partial(Lang.hitch(this,"overWidget"),i));
					this.overWHandlers.push(handler);
				};	
			},//setsAListeners		
			removeAreas:function(){//remove the sensible areas around the widgets
				if(this.oDbg.isDbg("removeAreas")) this.oDbg.display("REMOVE all sensible areas around widgets");
				DomConstruct.destroy("_areasRoot");//the id of this.areasRoot
			},//removeAreas				
			removeWListeners:function(){//over,out,mouseMoveInsideW,mouseDownOnCanvas
				var xTotWidgets=this.objEditForm.totObjects(); 
				//console.log("editFBuilder.resumeWListeners ->REMOVE all listeners");
				if(this.oDbg.isDbg("removeWListeners")) this.oDbg.display("REMOVE all listeners");
				for(var i=0;i<xTotWidgets;i++){ //Install listeners for overWidget and out Widget event
					this.overWHandlers[i].remove();
				};	
				this.overWHandlers = [];
			},//removeWListeners				
			suspendWListeners:function(){//over,out,mouseMoveInsideW,mouseDownOnCanvas
				var xTotWidgets=this.objEditForm.totObjects();
				//console.log("->editFBuilder.suspendWListeners ->SUSPEND all listeners");
				if(this.oDbg.isDbg("suspendWListeners")) this.oDbg.display("->SUSPEND all listeners");				
				for(var i=0;i<xTotWidgets;i++){ //suspend listeners for overWidget and out Widget event
					//console.log(i+"suspendWListeners suspende "+this.objEditForm.field(i).props.id);
					this.overWHandlers[i].pause();
					//this.outWHandlers[i].pause();
				};
			},//suspendWListeners	
			resumeWListeners:function(){//over,out,mouseMoveInsideW,mouseDownOnCanvas
				//alert("resumeWListeners");
				var xTotWidgets=this.objEditForm.totObjects();
				//console.log("->editFBuilder.resumeWListeners ->RESUME all listeners");	
				if(this.oDbg.isDbg("resumeWListeners")) this.oDbg.display("->RESUME all listeners");	
				for(var i=0;i<xTotWidgets;i++){ //resume listeners for overWidget and out Widget event
					//console.log("editFBuilder.resumeWListeners ->RESUME listeners for overWidget and outWidget events ->"+this.objEditForm.field(i).type+" id="+this.objEditForm.field(i).props.id+" Left="+this.objEditForm.field(i).props.style.left+" Top="+this.objEditForm.field(i).props.style.top+" width="+this.objEditForm.field(i).props.style.width+" height="+this.objEditForm.field(i).props.style.height);
					this.overWHandlers[i].resume();
				};
			},//resumeWListeners
			stopEdit:function(){//stop edit activated by button exterior to the form being edited
				this.removeWListeners();
				this.removeAreas();
			},			
			resumeEdit:function(){//resume edit activated by button exterior to the form being edited
				this.areasRoot=null;
				DomConstruct.destroy("_moveResizeBaseDiv");//to force the same order in DOM as in first time use (initial design mode)
				this.setAListeners();//this will recreate this.areasRoot
				this.previousId=null;//to force "current != previous "
				this.objResizeMove=null;		
			},
			//-------------------------------- methods to be called from _prop FORM PROPERTIES
			deleteW:function(xType){
				//var xOrder=edit_f0.currentWidget.posInArr;
				var xOrder=this.currentWidget.posInArr;
				//if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("this.z.deleteW xOrder="+xOrder);
				if(xOrder){//if xOrder is not null, then we have a widget selected
					var xName=this.objEditForm.field(xOrder).props.name;
					var x2Del=this.currentWidget.type+" "+xName;
					alert("Do you really want to delete the "+x2Del+" ?");
				}else{
					alert("editFBuilder4.deleteW Error no current widget !!!");				
				};
			},			
			//-------------------------------- methods to be called from _fx FORM FORM
			run_Design:function(){
				//alert("INSIDE editFBuilder4 - runDesign");
				var xVal=this._fx.fieldById("_fx1").props.value;
				//alert("entrou em run_Design !!!");
			//if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("entrou em run_Design !!! o valor de z.me="+thiz.z.me);
				//if (oDbg.isDbg("myTest1") ) oDbg.dbg("myTest1","A entrada button fx="+xVal);
				if(xVal=="Design"){
					xVal=this._fx.setFieldProps("_fx1",{value:"Run"});
					this.stopEdit();
					//xDesign=false;
				}else{
					xVal=this._fx.setFieldProps("_fx1",{value:"Design"});
					this.resumeEdit();
					//xDesign=true;
				};
				xVal=this._fx.fieldById("_fx1").props.value;
			},
			getComboChoice:function(){//to test buttons (z is defined globally)
				//alert("getComboChoice o valor de zzz="+this.zzz);
				x=Registry.byId("_fx8").get("displayedValue");
				xTemplate=this.convertName_Template(x);
				this.objEditForm.setTemplate(xTemplate);
				//alert("Test:selected "+x+" ==>template="+xTemplate);
			},
			convertName_Template:function(sName){
				var xArr0=[{name:"Claro",template:null},{name:"Blue Hills",template:"A"},{name:"Simple Green",template:"B"},{name:"Autumn Tree",template:"C"},{name:"Chess",template:"D"},{name:"Light Blue",template:"E"},{name:"A+C background",template:"F"}];
				var xTemplate=null;
				for(var i=0;i<xArr0.length;i++){
					if (sName==xArr0[i].name){
						xTemplate=xArr0[i].template
					};
				};
				return xTemplate;
			},//convertName_Template
			convertTemplate_Name:function(sTemplate){
				var xArr0=[{template:null,name:"Claro"},{template:"A",name:"Blue Hills"},{template:"B",name:"Simple Green"},{template:"C",name:"Autumn Tree"},{template:"D",name:"Chess"},{template:"E",name:"Light Blue"},{template:"F",name:"A+C background"}];
				var sName=null;
				for(var i=0;i<xArr0.length;i++){
					if (sTemplate==xArr0[i].template){
						sName=xArr0[i].name;
					};
				};
				return sName;
			},//convertTemplate_Name			
			insertW:function(xType){	
				var xRunDesign=this._fx.fieldById("_fx1").props.value;
				if(xRunDesign=="Run"){
					alert("Please switch to 'Design' mode in order to insert widgets !!!");
					return;
				};
				this.stopEdit();
				var xIndex=this.objEditForm.counterIndex(xType);
				var xValue=xType+(this.objEditForm.static.zcounter[this.objEditForm.currentFormNumber][xIndex]+1);//ex textBox2
				switch(xType){
					case "textBox":
						this.objEditForm.addChild("textBox",{left:0,top:0,width:100,value:xValue});
						break;
					case "label":
						this.objEditForm.addChild("label",{value:xValue,left:0,top:0});
						break;	
					case "numberBox":
						//f0.addChild("numberBox",{name:"num1",left:80,top:70,width:80,pattern:'##.00000',value:123.5});//17
						this.objEditForm.addChild("numberBox",{left:0,top:0,width:80,pattern:'##.00000',value:0});
						break;
					case "textArea":
						//f0.addChild("textArea",{left:0,top:0,width:100,height:100,preCode:"this.set('area1',this.get('test1'));",posCode:"console.log('saiu de textArea com '+this.get('area1'));"});//18
						this.objEditForm.addChild("textArea",{left:0,top:0,width:100,height:100,value:xValue});
						break;
					case "checkBox":
						//f0.addChild("checkBox",{left:480,top:10+5,title:"true/false for boolean isCreateDelTrueChild"}); //8
						this.objEditForm.addChild("checkBox",{left:0,top:0,title:"true/false"});
						break;	
					case "_radioButton":
						//TBD
						break;
					case "dateTextBox":
						//f0.addChild("dateTextBox",{left:290,top:70,value:d,width:120}); //19   //if value of date is specified as a string
						var d= new Date();
						this.objEditForm.addChild("dateTextBox",{left:0,top:0,value:d,width:100}); //19   //if value of date is specified as a string
						break;
					case "button":
						//f0.addChild("button",{left:0,top:0,width:80,value:"Button",clickCode:"z.testSave()"});//15
						this.objEditForm.addChild("button",{left:0,top:0,width:80,value:xValue});
						break;	
					case "comboBox":
						//f0.addChild("comboBox",{left:180,top:10,value:"Something...",comboArr:xArr,width:120});//2
						this.objEditForm.addChild("comboBox",{left:0,top:0,value:xValue});
						break;	
					case "grid":
						alert("this button is being used to recover f0 if it is created with silent=true");
						break;
					case "_tabs":
						break;	
					default: alert("this.z.insertW  The type "+xType+" is not available for the time being");
				};	
				//edit_f0.removeAreas();//updates the event listteners for editFBuilder()
				//edit_f0.setAListeners();		
				this.resumeEdit();
			},				
			save:function(){
				var x=this._fx.fieldShownByName("fName");//checks what's in combobox
				var xName=this._fx.fieldShownByName("fName");
				var xDescr=this._fx.fieldShownById("_fx5");
				//thiz.z.saveF("F",2,xName,xDescr);
				console.log("SAVE name="+xName+" description="+xDescr+" to slot="+this.slot);
				this.saveJson("F",this.slot,xName,xDescr);
				//tSave();
			},
			restore:function(){
				//alert("editFBuilder5 restore ENTROU");//console.log("editFBuilder5 restore);
				//if(FBuilder.checkExist("f2")){//checks if it exists a form with prefix xPrefix
				if(FBuilder.checkExist(this.objEditForm.prefix)){//checks if it exists a form with prefix xPrefix
					//alert(this.objEditForm.prefix+" EXISTE E TEM DE SER DESTRUIDO");					
					console.log("editFBuilder5 Restore "+this.objEditForm.prefix+" EXISTE E TEM DE SER DESTRUIDO");
				};
				//FBuilder.destroy("f2");//destroy the FBuilder form "f1" - it is a nop if the form is non existing
				FBuilder.destroy(this.objEditForm.prefix);//destroy the FBuilder form "f1" - it is a nop if the form is non existing
				//this.restoreForm_FromSlot(2,"nonModal");
				//this.restoreForm_FromSlot("F",2,"f2","nonModal");
			//var fz=this.restoreForm_FromSlot("F",2,this.objEditForm.prefix,"nonFloat");
				this.restoreForm_FromSlot("F",this.slot,this.objEditForm.prefix,"nonFloat").then(
						function(fz){
							//alert("Template=XXX");
							this.objEditForm=fz; //now we need a refresh to place widgets in the dome
							//fBuilder.refresh(fz.prefix);
							//alert("refresh done");
							console.log("Reconstruiu prefix="+this.objEditForm.prefix);//form Name+Form Description
							console.log("Template="+this.objEditForm.template);
							//console.log("_fx. NameTemplate="+_editFBuilder5._fx.name);//ok com _editFBuilder5 !!!! this._fx.name não funciona
							var xName=_editFBuilder5.convertTemplate_Name(this.objEditForm.template);
							_editFBuilder5._fx.setFieldPropsByName("templates",{value:xName});  
							this.zzz=this.objEditForm.template;
							_editFBuilder5.objEditForm.template=this.objEditForm.template;
							console.log("O template ficou -->"+this.zzz);
						},
						this
				);
			},	
			saveJson:function(cType,nSlot,sName,sDescr){//save or update current Json  of type=cType in slot nSlot	
				//par1 - type (1 byte), par2 - Slot number ex thiz.z.saveF("F",2,xName,xDescr);
				var json_of_f0=this.objEditForm.formDsgn2Json();//  produces the form JSON representation (format only)
				var oJsonStore = new JsonStoreCrud();//to read
				var oJsonStore2 = new JsonStoreCrud();//to create or to update				
				//var jtype="F";
				var jtype=cType;
				var idname=cType+nSlot;
				//var name= "Slot fixo N="+nSlot;
				var name=sName;
				//var description="Form de suporte do teste das properties window";
				//var description=edit_f0._fx.fieldShownById("_fx5");
				var description=sDescr;
				//alert("BUTTON SAVE formNumber="+nSlot+" Description:"+description);
				if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("BUTTON SAVE formNumber="+nSlot+" Description:"+description);
				var xRetStr=null;
				oJsonStore.setCallBack(function(oReply){//read callback
					xRetStr="<@@> testServer \n<br>-------------------------------------------------\n<br>"
						+ "  /__[@@] CLIENT TimeDurationUntilReply=[" + oReply.timing.clientTimer +"] milliseconds / [@@] Client INNER timeduration=[" + oReply.timing.clientTimerOutside +"]" //;
						+ " /__[@@] SERVER TimeDurationUntilReply=[" + oReply.timing.serverTimer +"] milliseconds "
						+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
						+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"
						// + oReply.info
						;
						if(oReply.isSuccess){
						    if(oReply.jsonObject.rowCount==0){//the form doesn't exist we have to create it ! 
							 	oJsonStore2.create( jtype, idname, name, description, json_of_f0 );
							}else{//the form doesn't exist we have to update it ! 
								//update: function( jtype, idname, name, description, json )
							 	oJsonStore2.update( jtype, idname, name, description, json_of_f0 );
							};
						}else{
							alert("Check your internet connection !!!! Trying to read form error:"+oReply.errorMessage);
						};
					//fz.setFieldProps("fz1",{value:xRetStr});
					//if(this.oDbg.isDbg("main")) this.oDbg.display(xRetStr);
				},this);
				oJsonStore2.setCallBack(function(oReply){//update or create callback
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
				},this);			
				oJsonStore.read( jtype, idname);
				//oJsonStore.create( jtype, idname, name, description, json_of_f0 );
			},//saveJson				
			//restoreForm_FromSlot:function(xFNum,xFloatF){//restore from DB slot 1..2..3., xFloatF= noFloat,modal,nonModal 
			restoreForm_FromSlot:function(cType,nSlot,sPrefix,xFloatF){//restore from DB slot 1..2..3., xFloatF= noFloat,modal,nonModal 
				//alert("restoreFromSlot "+xFNum);
				//var xFNum=2;
				var oDeferred=new Deferred();
				var oJsonStore = new JsonStoreCrud();
				//var jtype="F";
				var jtype=cType;
				//var idname="F"+xFNum;
				var idname=cType+nSlot;
				//var fPrefix="f"+xFNum;  //prefix will be f<i> for slot i
				//var fPrefix="f"+nSlot;  //prefix will be f<i> for slot i
				var fPrefix=sPrefix;  //prefix will be para,eter sPrefix
				//var fName="From slot f"+xFNum;
				var fName="From slot "+cType+nSlot;
				var restJson=null;
				var xRetStr=null;
				var objJson2F=null;
				var fz=null;//to return
				oJsonStore.setCallBack(function(oReply){
					var xRetStr="<@@> testServer \n<br>-------------------------------------------------\n<br>"
						+ "  /__[@@] CLIENT TimeDurationUntilReply=[" + oReply.timing.clientTimer +"] milliseconds / [@@] Client INNER timeduration=[" + oReply.timing.clientTimerOutside +"]" //;		
						+ " /__[@@] SERVER TimeDurationUntilReply=[" + oReply.timing.serverTimer +"] milliseconds "
						+ "\n<br>--------------------------------------------------\n<br>REPLY: "+(oReply.isSuccess?' {noErrors} ':'!**ERROR**! ==> ')
						+ " ErrorMessage="+ oReply.errorMessage+"\n<br>-------\n<br> jsonString received==>"+ oReply.jsonString +"<== \n<br>----\n<br>Info data received:\n<br>"+ oReply.info;
					//fz.setFieldProps("fz1",{value:xStr});
					if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("restoreForm_FromSlot - Inside call back:  BEGIN--->"+xRetStr);
					var objJson=JSON.parse(oReply.jsonString);//objJson has the whole object
					restJson=objJson.rowSet[0].json;//isolates the form only
					if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("restoreForm_FromSlot *** typeof objJson ="+typeof objJson +" ***");
					if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("restoreForm_FromSlot *** typeof restJson ="+typeof restJson +" ***");
					//destroy f0 with f0.destroy (should clean all widgets the dom and the form)
					//var f1=objFjson.buildNoWidgets("form f1","f1");//builds form name "form f1" & "f1", from restJson,assigning it to variable f1.
					//objFjson.buildWidgets(f1);//constroi os widgets da json restJson no form f1	
					//if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("--------- agora mostra o json do form isolado -----------------------");
					if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("restoreForm_FromSlot *** FORM JSON ALONE *** restJson: BEGIN--->"+restJson);
					if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("restoreForm_FromSlot *** ------------------- vai construir objJson2F com typeof restJson ="+typeof restJson +"<-----------------");
					objJson2F=new Json2F(restJson);//builds pre-object from JSON string
					if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("restoreForm_FromSlot *** ------------------->ja construiu objJson2F<-----------------");
					if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("restoreForm_FromSlot *** typeof objJson2F ="+typeof objJson2F +" ***");
					//before building a form we should be sure that the form does not exist
					fz=objJson2F.buildNoWidgets(fName,fPrefix,xFloatF);//builds form name "form f1" & "f1", from restJson,assigning it to variable f1.
					if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("restoreForm_FromSlot *** ------------------->buildNoWidgets complete !!!<-----------------");
					if(fz){
						objJson2F.buildWidgets(fz);//to build widgets defined in json restJson into fz form - only if fz is not null (it will be null if prefix exists)
					}else{
						alert("restoreForm_FromSlot ERROR: couldn't build widgets into form because prefix "+fPrefix+" is not free ! =>Pls destroy the form before calling this method");
						fz=null;
					};
					//return fz;
					oDeferred.resolve(fz);
				},this);
				oJsonStore.read( jtype, idname);
				if(thiz.oDbg.isDbg("main")) thiz.oDbg.display("Read request done !");
				return oDeferred;			
			},//restoreForm_FromSlot					
			test:function(){
				console.log("editFBuilder.test");
			}			
		}); //end of classe editFBuilder
	}//call back function
	); //end of require for module 	editFBuilder
