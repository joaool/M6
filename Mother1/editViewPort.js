		define(["dojo",
				 "MotherLib3.js",
				 "Mother1/exchanger.js",
				 "Mother1/moveCanvas.js",
				 "Mother1/moveCarrier.js",
				 "Mother1/resizeWidget.js",
				 "dojo/_base/declare",
				 "dojo/Evented", 
				 "dojo/Stateful", 
				 "dojo/_base/lang",				 
				 //"dojo/_base/window",
				 //"dojo/_base/event",
				 "dojo/dom-attr",
				 "dojo/on",
				 "dojo/mouse",
				 "dojo/ready",
				 "dojo/query",
				 "dojo/dom-class",
				 "dojo/dom-style",
				 "dojo/dom-geometry",
				 "dojo/dom-construct",				 
				 //"dijit/registry",
				 //"dijit/layout/BorderContainer",
				 "dijit/layout/ContentPane",
				 "dojo/dom",
				 //"dojo/dom-construct",
				 "dojo/dnd/Moveable",
				 "dojo/dnd/Mover",
				 "dojo/dnd/move",
				 //"dijit/_WidgetBase",
				 "dojo/domReady!"], 
		//function(dojo,fBuilder,Declare,Evented,Stateful,Lang,win,Event,domAttr,on,mouse,Ready,query,domClass,domStyle,domGeom,DomConstruct,registry,BorderContainer,ContentPane,Dom,DomConstruct,
		function(dojo,fBuilder,Exchanger,MoveCanvas,MoveCarrier,ResizeWidget,Declare,Evented,Stateful,Lang,domAttr,on,mouse,Ready,query,DomClass,domStyle,domGeom,DomConstruct,ContentPane,Dom,
				Moveable, Mover,Move){
				//Moveable, Mover,Move,Widget){
			//console.log("inicio de editViewPort1 ");
			//O que falta:
			// 0)DONE - Por run mode a fazer efeito - ao mudar para run mode retirar os marked widgets - testar e corrigir crosshair cursor em design e Run modes.
			// 1) Em "mode run" retirar crosshair cursor de textbox, label e button
			// 2)fazer enable do clickcode para buttons em "mode run"
			// 3) para os labels fazer aparecer border em mode design  (já está) e retira-las em mode run.
			// 4)Check box impedir crosshair cursor...só deve ser permitido move
			// 5)DONE - Colocar snap to grid...
			// 6) standarizar com dojo/on retirando connects
			// 7) distinguir visualmente marked widgets from selected widget - In Mother: we can mark several nodes, but we can select only one widget
			//    a selected node is the last marked node if it was not unmarked after its selection
			// 8) introduzir delete widget com key del over a selected node
			// 9) Garantir que arrays de handlers não são estáticos (sharable between instances)
			//thizz=this; //para invocar switchToDesign();
			//console.debug(this);
			//alert("Inicio");
			/*
			//formato de um module:
			
			define(["dojo/_base/declare",
					"esri/map"], 
				function (declare, map) {
					return declare("tut.Module1", [], { // or tut>>.<<Module1 
						constructor: function() { this.name='a'; console.log('a ctor'); }
						log: function() { console.log(this.name);} 
					});     
				} 
			}); 
			//http://requirejs.org/docs/whyamd.html
			*/
	return Declare("editViewPort",[Evented,Stateful], {
		viewPortX:null,
		viewPortY:null,
		viewPortW:null,
		viewPortH:null,
		objEditForm:null,
		
		canvasPane:null,//canvasPane object
		canvas:null, //canvasPane Node
		carrierPane:null,//carrierPane object
		carrier:null, //carrierPane  Node
		objCanvasMove:null,//used to move canvas
		objCarrierMove:null,//used to move carrierPane
		objResizeWidget:null,//used to resize widgets

		moveAllowed:false, //it becames true when there is at least one marked widget and a click is done in one of those widgets (the cursor will be "move")
		// -----------------------------------------SEMAPHORES 
		outsideWidget:true,
		insideWBorder:false,//this is "inside the border line of the widget
		insideWidget:false,//this is "inside interior side of the widget"
		markedWidgets:false,//is true if one or more widgets are marked
		// -----------------------
		selectedWidgetId:null,//the id of widget selected - the same as last marked - null=> no widget is selected
		modeRun:false, //Class editViewPort - has a Run um mode and a design mode when modeRun=false; 
		// -----------------------------------------EVENT HANDLERS - arrays and jsons should be splitted to support several instances
		//http://dojotoolkit.org/reference-guide/1.7/dojo/declare.html should be declared in the contructor (this.someData = [ ]; ) to assure instance independence
		overWHandlers:[],//array that will receive the handlers for overWidget listener
		outWHandlers:[],//array that will receive the handlers for outWidget listner
		mouseClickOnWHandlers:[],//array that will receive the handlers for mouseClickOnWidget listner
		mouseDownOnCanvasHandler:null,//the main handler in viewport - runs in any mousedown
		mouseMoveInsideWHandler:null,
		// -----------------------
		currentWidget:{id:null,top:0,oTop:0,left:0,oLeft:0,width:0,height:0,bottom:0,extremeL:0,type:null,posInArr:null},//established in overwidget to evaluate border zone in mouseMoveInsideW
		tempGridPattern:null,//temp to recover objEditForm.gridPattern in afterResizeEnd. This allows us to change the objEditForm.gridPattern to 1 in resize
		//-------------------------------------------------------------------------------------------
		constructor:function(viewPortX,viewPortY,viewPortW,viewPortH,objEditForm){	//mixes the passed argument into "this"
		//-------------------------------------------------------------------------------------------
		//constructor:function(args){	//mixes the passed argument into "this"
			//dojo.safeMixin(this, args);//args vem na forma {viewPortX:100,viewPortY:50,viewPortW:1100,viewPortH:400,objEditForm:f0} e monta logo this.targetNode="target"
			//alert(this.objEditForm.name);ok
			this.viewPortX=viewPortX;
			this.viewPortY=viewPortY;
			this.viewPortW=viewPortW;
			this.viewPortH=viewPortH;
			this.objEditForm=objEditForm;	//objEditForm:null,
			/*
			this.watch("modeRun",function(){
				 alert("modeRun changed to " + this.get("modeRun"));
			});
			*/
			//----- tb não funciona....
			thiz=this;
			var xobj = new Stateful({
				xModeRun: thiz.modeRun
			});
			xobj.watch("xModeRun",function(){
				 alert("xModeRun changed to " + this.modeRun);
			});
			//--------------------------
			console.log("editViewPort.constructor viewPort x="+this.viewPortX+" y="+this.viewPortY+" w="+this.viewPortW+" h="+this.viewPortH);//junta + 18 para as scrollbars
			this.canvasPane=this.placeFormInPane(this.objEditForm,"canvasPaneId",this.viewPortX,this.viewPortY,this.viewPortW,this.viewPortH,1,"dotted","red");
			this.canvas = dojo.byId("canvasPaneId"); 
			var canvasBox = domGeom.getMarginBox(this.canvasPane.domNode);//CANVAS BOX
			console.log("editViewPort.constructor canvasPane box="+canvasBox.l+","+canvasBox.t+","+canvasBox.w+","+canvasBox.h);//junta + 18 para as scrollbars
			
			//---------- CARRIER PANE ------análogo ao que foi feito para canvas, mas agora para carrier. A diferença é que em vez de ser colocado no body, carrierDiv é colocado no canvas
			var carrierDiv = DomConstruct.create("div"); 
			carrierDiv.innerHTML="<div id='carrierDivId'></div>";
			this.canvas.appendChild(carrierDiv);
			xStyle="position:absolute;left:0px;top:0px;width:"+(this.viewPortW+500)+"px;height:"+(this.viewPortH+300)+"px;";
			this.carrierPane=new ContentPane({
				id:"carrierPaneId",
				content:"",
				style:xStyle
			}, "carrierDivId");	//o carrierPane é colocado sobre o carrierDiv
			this.carrier = dojo.byId("carrierPaneId");
			var marginBox2 = domGeom.getMarginBox(this.carrierPane.domNode);  //SERVE PARA QUÊ ?
			console.log("carrierPane box="+marginBox2.l+","+marginBox2.t+","+marginBox2.w+","+marginBox2.h);//SERVE PARA QUÊ ?
			var formOverCanvas=this.objEditForm.formObj;//ex 	var formOverCanvas=f0.formObj;
			formOverCanvas.placeAt("canvasPaneId");  //o form c/os widgets en cima é posto em cima do Canvas
			this.canvasPane.startup();//Basta isto para por o tab a funcionar (if any...)
			//alert("editViewPort.constructor vai chamar this.objEditForm.compensationAll()");
			this.objEditForm.compensationAll(); //Necessary because by some reason button width/height need to be set after widget DOM connection (not before this)
			//Node structure now:
			//body()
			//	canvasDiv
			//		innerHTML
			//			canvasPane(border red)
			//				objEditForm
			//				carrierPane (border blue)
			// ------------------- event setup --------------------------
			// Se montar os handlers com ---> this.mouseDownOnCanvasHandler=on.pausable(this.canvas,"mousedown",this.mouseDownOnCanvas); 
			//		em mouseDownOnCanvas o scope é o scope da chamada (na qual "this" refere-se a mouseDownOnCanvas e não a "editViewPort"...
			//		vamos usar dojo.hitch(this,"mouseDownOnCanvas") para forçar a function mouseDownOnCanvas a reter o scope original do momento da definição...
			this.mouseDownOnCanvasHandler=on.pausable(this.canvas,"mousedown",Lang.hitch(this,"mouseDownOnCanvas"));
			//this.mouseMoveInsideWHandler=on.pausable(this.canvas,"mousemove",this.mouseMoveInsideW); //necessary to control border condition
			this.mouseMoveInsideWHandler=on.pausable(this.canvas,"mousemove",Lang.hitch(this,"mouseMoveInsideW")); //necessary to control border condition
			this.mouseMoveInsideWHandler.pause();//pause is the default state - it will be resumed in overWidget
			console.log("Totobjects="+this.objEditForm.totObjects());
			var xTotWidgets=this.objEditForm.totObjects();  
			for(var i=0;i<xTotWidgets;i++){ //Install listeners for overWidget and out Widget event
				console.log("instala listeners para overWidget e outWidget events ->"+this.objEditForm.field(i).type+" id="+this.objEditForm.field(i).props.id+" Left="+this.objEditForm.field(i).props.style.left+" Top="+this.objEditForm.field(i).props.style.top+" width="+this.objEditForm.field(i).props.style.width+" height="+this.objEditForm.field(i).props.style.height);
				//this.overWHandlers.push(on.pausable(this.topDijitNode(this.objEditForm.field(i).props.id,this.objEditForm.field(i).type),"mouseenter", dojo.partial(this.overWidget,i)));//chama o event mas passa outro parâmetro
				this.overWHandlers.push(on.pausable(this.topDijitNode(this.objEditForm.field(i).props.id,this.objEditForm.field(i).type),"mouseenter", dojo.partial(Lang.hitch(this,"overWidget"),i)));//chama o event mas passa outro parâmetro
				//this.outWHandlers.push(on.pausable(this.topDijitNode(this.objEditForm.field(i).props.id,this.objEditForm.field(i).type),"mouseleave", this.outWidget));
				this.outWHandlers.push(on.pausable(this.topDijitNode(this.objEditForm.field(i).props.id,this.objEditForm.field(i).type),"mouseleave", Lang.hitch(this,"outWidget")));
				//this.mouseClickOnWHandlers.push(this.objEditForm.widget(i).on("mouseup",this.mouseClickOnWidget));
				this.mouseClickOnWHandlers.push(this.objEditForm.widget(i).on("mouseup",Lang.hitch(this,"mouseClickOnWidget")));
			};			
			//alert("fim do constructor "+this.objEditForm.name);//ok
		},
		xTest:function(){
			console.log("editViewPort.xTest viewPort x="+this.viewPortX+" y="+this.viewPortY+" w="+this.viewPortW+" h="+this.viewPortH);//junta + 18 para as scrollbars		
			console.debug(this);

			alert("editViewPort.xTest "+this.objEditForm.name);//ok
		},
		mouseDownOnCanvas:function(e){
			var x = e.clientX; 
			var y = e.clientY; 
			//http://stackoverflow.com/questions/1081499/accessing-an-objects-property-from-an-event-listener-call-in-javascript
			//When the event handler gets called, "this" no longer references the "someObj" object. 
			//You need to capture "this" into a local variable that the mouseMoving function will capture.
			//The key thing to remember is that "this" it is bound to the calling object when the function is called, not when the function is created.
			console.log("mouseDownOnCanvas FOI FEITO MOUSEDOWN !!!");
			if(this.outsideWidget){ //mouse down outside any widget
				console.log("mouseDownOnCanvas com outsideWidget=true");
				this.unMark(-1);// -1 means all f0 elements - Unmarks all unmarked widgets
				this.markedWidgets=false;
				if(e.ctrlKey){//pressing mouse down with ctrl key down =>moving the CANVAS - MOUSE UP will trigger afterMovingCanvas()
					// TO DO -->É NECESSÁRIO GARANTIR AS POSIÇÕES FINAIS DOS WIDGETS !!!! 
					//alert("The user wants to move the view port !!!");	
					this.suspendWListeners();
					if(!this.objCanvasMove){// objCanvasMove não está criado
						var oExchanger=new Exchanger(); //Um SINGLETON
						oExchanger.static.id=this.id;//to be accessed by canvasMove object
						var thiz=this;
						oExchanger.setPointer(function(){					
							//thiz.afterMovingCanvas();//this code runs when onMouseUp event is triggered in mover class
							thiz.afterMovingCanvas();//this code runs when onMouseUp event is triggered in mover class
						});
						this.objCanvasMove = new Moveable(this.canvas,{	//todo o canvas passa a mover-se !!!
							mover:moveCanvas
						});
					};
					console.log("CANVAS MOVING")
				};
				//console.log("mouseDownOnCanvas  -> preparou canvas move  x="+x+" y="+y+" pode fazer drag do canvas. objCanvasMove="+objCanvasMove);
			}else{ //it is inside a widget
			console.log("mouseDownOnCanvas  inside a widget (border ou interior) ->o Widget é "+this.currentWidget.id);
				if(this.insideWBorder){//border zone 
					if(!this.markedWidgets){//border zone active				
						console.log("mouseDownOnCanvas  insideWBorder ->Resizes widget "+this.currentWidget.id);
						this.moveAllowed=false;	
						// -- RESIZE WIDGET
						this.suspendWListeners();
						// -- prepara objResizeWidget 
						this.tempGridPattern=this.objEditForm.gridPattern;//guarda temporariamente o objEditForm.gridPattern
						this.objEditForm.gridPattern=1;
						console.log("RESIZE --------------> vai fazer resizeWidget para "+this.currentWidget.id+" - "+this.currentWidget.type+" W,H "+this.currentWidget.width+","+this.currentWidget.height);
						console.log("mouseDownOnCanvas From Widget to handles id="+this.currentWidget.id+" type="+this.currentWidget.type+" l="+this.currentWidget.left+" t="+this.currentWidget.top+" w="+this.currentWidget.width+" h="+this.currentWidget.height);
						dojo.style(dojo.byId("canvasPaneId"), "overflow", "hidden");
						var xScroll = domGeom.docScroll();
						
						var xDiv = DomConstruct.create("div"); //cria HTML div 
						console.log(" antes de style Bottom="+this.currentWidget.bottom+" Top="+this.currentWidget.top+" (Bottom-Top)="+(this.currentWidget.bottom-this.currentWidget.top));
						var xStyle="position:absolute;left:"+(this.currentWidget.left+xScroll.x)+"px;top:"+(this.currentWidget.top+xScroll.y)+"px;width:"+(this.currentWidget.extremeL-this.currentWidget.left)+"px;height:"+(this.currentWidget.bottom-this.currentWidget.top)+"px;";
						xDiv.innerHTML="<div id='xDiv' style='"+xStyle+"'></div>"; //altera a posição do div
						dojo.body().appendChild(xDiv);//coloca o div parent no DOM
						//placeFormInPane:functin(xFBuilder,xPaneId,xLeft,xTop,xWidth,xHeight,borderThickness,borderType,xColor)
						console.log(" From Widget to handles Style="+xStyle+" xScroll="+xScroll.y+" Original Left="+this.currentWidget.oLeft+" Original Top="+this.currentWidget.oTop);
						console.log("mouseDownOnCanvas -----> FIRST TIME FOR RESIZE");
						var thiz=this;
						this.objResizeWidget=new ResizeWidget({"targetNode":"xDiv","targetType":this.currentWidget.type});
						dojo.connect(this.objResizeWidget, "onResizeComplete", function() {
							//este é o slot para fazer algo após uma action de resize (sem ser a final...)... Por exemplo adaptar a figura ao estado corrente dos handles...
							console.log("mouseDownOnCanvas onResizeComplete1 id="+thiz.currentWidget.id+" type="+thiz.currentWidget.type+" l="+thiz.currentWidget.left+" t="+thiz.currentWidget.top+" w="+thiz.currentWidget.width+" h="+thiz.currentWidget.height);
							// from Handles to widget
							var xPos=domGeom.position(dojo.byId(thiz.currentWidget.id),false);//includeScroll=False =>Takes scroll into account - use true to get the x/y relative to the document root (unaffected by window scrolling)
							var xScroll = domGeom.docScroll();
							//var change={l:this.targetL-this.targetIL,t:this.targetT-this.targetIT,w:this.targetW-this.targetIW,h:this.targetH-this.targetIH}
							var change={l:this.targetL-this.targetIL,t:this.targetT-this.targetIT,w:this.targetW-this.targetIW,h:this.targetH-this.targetIH}
						var canvasBox = domGeom.getMarginBox(thiz.canvasPane.domNode);//CANVAS BOX

							//console.log("+++++++> Initial: Left="+xPos.x+" Top="+xPos.y+" W="+xPos.w+" H="+xPos.h);
							console.log("+++++++> Initial: Left="+(xPos.x-canvasBox.l)+" Top="+(xPos.y-canvasBox.t)+" W="+xPos.w+" H="+xPos.h);
						//alert("onResizeComplete ");
							console.log("+++++++> Variation: Left="+change.l+" Top="+change.t+" W="+change.w+" H="+change.h);
							var xL=thiz.currentWidget.oLeft+change.l;
							var xT=thiz.currentWidget.oTop+change.t;
							var xW=thiz.currentWidget.width+change.w;
							var xH=thiz.currentWidget.height+change.h;
							console.log("+++++++> Final: Left="+xL+" Top="+xT+" W="+xW+" H="+xH);
						console.log("mouseDownOnCanvas onResizeComplete2 we reajust the widget... id="+thiz.currentWidget.id+" type="+thiz.currentWidget.type+" l="+thiz.currentWidget.left+" t="+thiz.currentWidget.top+" w="+thiz.currentWidget.width+" h="+thiz.currentWidget.height);
							thiz.objEditForm.setFieldStyle(thiz.currentWidget.id,{left:xL,top:xT,width:xW,height:xH}); 
						
							//alert("mouseDownOnCanvas id="+this.currentWidget.id+" type="+this.currentWidget.type+" l="+this.currentWidget.left+" t="+this.currentWidget.top+" w="+this.currentWidget.width+" h="+this.currentWidget.height);
							if(thiz.currentWidget.type=="tabs"){
								console.log("onResizeComplete -->TAB faz resize");
								dijit.byId(thiz.currentWidget.id).resize();
							};
						});//onResizeComplete event without hitch
						this.objResizeWidget.setEndResize(Lang.hitch(this,function(){
							this.afterResizeEnd();
						}));				
						// --END OF RESIZE -------
					};
				}else{ //the same as insideWidget (interior)
					if(this.objEditForm.tag(this.currentWidget.posInArr)){ //this widget is marked !!! can drag
						console.log("DRAG SIGNAL before move: x="+this.currentWidget.left+"y="+this.currentWidget.top);
						this.suspendWListeners();
						if(!this.objCarrierMove){// objCarrierMove não está criado
							var oExchanger=new Exchanger(); //Um SINGLETON
							oExchanger.static.id=this.id;//to be accessed by canvasMove object
							var thiz=this;
							oExchanger.setPointer(function(){					
								//this.afterMovingCarrier();//this code runs when onMouseUp event is triggered in mover class
								thiz.afterMovingCarrier();//this code runs when onMouseUp event is triggered in mover class
							});
							this.objCarrierMove = new Moveable(this.carrier,{	//todo o carrier passa a mover-se !!!
								mover:moveCarrier
							});
						};
						//Now we will move the object to the carrier pane
						this.loadCarrier();//all marked widgets will be loaded in carrier pane
					};
				};
				console.log("mouseDownOnCanvas **************  end of 'is inside a widget' **************+");				
			};
		},//mouseDownOnCanvas
		loadCarrier:function(){//all marked widgets will be loaded in carrier pane
			var xTotWidgets=this.objEditForm.totObjects();
			for(var i=0;i<xTotWidgets;i++){
				if(this.objEditForm.tag(i)){
					this.carrier.appendChild(this.objEditForm.widget(i).domNode);
				};
			};
		},//loadCarrier	
		unLoadCarrier:function(difX,difY){//to put widgets that are in carrier pane back to canvas with new coordinates
			var xTotWidgets=this.objEditForm.totObjects();
			for(var i=0;i<xTotWidgets;i++){
				if(this.objEditForm.tag(i)){//for each tagged, updates position and unloads
					var xId=this.objEditForm.field(i).props.id;
					var xLeft=this.objEditForm.field(i).props.style.left;
					var xTop=this.objEditForm.field(i).props.style.top;
					xLeft=parseInt(xLeft)+difX;
					xTop=parseInt(xTop)+difY;
					this.objEditForm.setFieldStyle(xId,{left:xLeft,top:xTop});
					this.canvas.appendChild(this.objEditForm.widget(i).domNode);
				};
			};
			var mboxCanvas=domGeom.getMarginBox(this.canvasPane.domNode);
			domGeom.setMarginBox(this.carrierPane.domNode,mboxCanvas);//reposition carrier for next move		
		},//unLoadCarrier	
		/* old event system
		onWidgetSelect:function(){//the selected widget is the last marked widget while it is still marked
			this.selectedWidgetId=this.currentWidget.id;
			console.log("editViewPort onWidgetSelect");
		},
		onWidgetUnselect:function(){//a widget is Unselected if all widgets are unmarked or if the selected on is unmarked
			console.log("editViewPort onWidgetUnSelect");
		},	
		*/		
		mark:function(i){//marks element order=i
			var xNode=dojo.byId(this.objEditForm.field(i).props.id);
			this.objEditForm.setTag(i,true);
			//this.onWidgetSelect();//whenever one widget is clicked the event is launched
			this.selectedWidgetId=this.currentWidget.id;
	//		this.emit("selectwidget",{});//- new on/event system - whenever one widget is clicked the event signal is emitted
			if(this.objEditForm.field(i).type=="button"){
				//alert("o field order="+i+" é um button - vai marcar de forma diferente");//para centrar a marca
				dojo.style(this.topDijitNode(this.objEditForm.field(i).props.id,this.objEditForm.field(i).type), "cursor", "move");
				domStyle.set(xNode.parentNode,"border","3px solid silver");//marca o button no pai do id					
			}else{
				dojo.style(xNode, "cursor", "move");
				domStyle.set(this.topDijitNode(this.objEditForm.field(i).props.id,this.objEditForm.field(i).type),"border","3px solid silver");//marca o widget			
			};	
			this.moveAllowed=true;
		},//mark
		unMark:function(xOrder){//unMarks one or all (-1) order
			var xTotWidgets=xOrder+1;
			var k=xOrder;
			if(xOrder<0){
				xTotWidgets=this.objEditForm.totObjects();
				k=0;
				//this.onWidgetUnselect();//deselect on unMark all
	//			this.emit("unselectwidget",{});//- new on/event system - deselect on unMark all
				this.selectedWidgetId=null;
			}else{ //a single widget is going to be unMarked - check id it will launch onWidgetUnselect event 
				if (this.objEditForm.field(xOrder).props.id==this.selectedWidgetId){
					//this.onWidgetUnselect();//the widget to be unMarked is the currently selected. Unselect it. 
	//				this.emit("unselectwidget",{});//- new on/event system -the widget to be unMarked is the currently selected. Unselect it. 
					this.selectedWidgetId=null;
				};
			};
			for(var i=k;i<xTotWidgets;i++){
				var xNode=dojo.byId(this.objEditForm.field(i).props.id);
				this.objEditForm.setTag(i,false);
				if(this.objEditForm.field(i).type=="button"){
					domStyle.set(xNode.parentNode,"border",null);//para button desmarca o pai do id					
					dojo.style(xNode.parentNode, "cursor", "default");
				}else{
					dojo.style(xNode, "cursor", "default");
					domStyle.set(this.topDijitNode(this.objEditForm.field(i).props.id,this.objEditForm.field(i).type),"border",null);//desmarca o widget			
				};
				this.moveAllowed=false;
			};
		},//unMark	
		checkMarks:function(){//true if at least one marked widgets exist
			var xTotWidgets=this.objEditForm.totObjects();
			for(var i=0;i<xTotWidgets;i++){
				if(this.objEditForm.tag(i))
					return true;
			}
			return false;
		},//checkMarks
		checkOnMarkEvent:function(){//true one and only one widget is marked
			var xTotWidgets=this.objEditForm.totObjects();
			var k=0;
			for(var i=0;i<xTotWidgets;i++){
				if(this.objEditForm.tag(i))
					k++;
			}
			return k==1 ? true:false;
		},//checkMarks
		afterMovingCanvas:function(){
			var paneX=domStyle.get(dojo.byId("canvasPaneId"),"left");//gets X do pane
			var paneY=domStyle.get(dojo.byId("canvasPaneId"),"top");//gets Y do pane
			//alert("-------------->Terminou MOVING THE CANVAS com paneX="+paneX+" paneY="+paneY);
			//now we need to go through all and change its coordinates
			this.objCanvasMove.destroy();
			this.objCanvasMove=null;
			console.log("CANVAS STOPED MOVING")
			this.resumeWListeners();
		},//afterMovingCanvas	
		afterMovingCarrier:function(){
			var paneX=domStyle.get(dojo.byId("carrierPaneId"),"left");//gets X do pane
			var paneY=domStyle.get(dojo.byId("carrierPaneId"),"top");//gets Y do pane
			//now we need to go through all marked widgets and change its coordinates and unload carrier Pane
			this.unLoadCarrier(paneX,paneY);//unLoadCarrier pane and corrects all marked widgets left and top

			this.unMark(-1);
			this.markedWidgets=false;
			this.objCarrierMove.destroy();
			this.objCarrierMove=null;
			
			var mBoxAfterMove = domGeom.getMarginBox(this.carrierPane.domNode);
			console.log("carrierPane antes de reset da box="+mBoxAfterMove.l+","+mBoxAfterMove.t+","+mBoxAfterMove.w+","+mBoxAfterMove.h);
			//Reposition of carrier pane in 0,0 (inside canvasPane
			domStyle.set(dijit.byId("carrierPaneId").domNode,"left","0px");			
			domStyle.set(dijit.byId("carrierPaneId").domNode,"top","0px");		
			var marginBox2 = domGeom.getMarginBox(this.carrierPane.domNode);
			console.log("carrierPane depois de reset da box="+marginBox2.l+","+marginBox2.t+","+marginBox2.w+","+marginBox2.h);
			console.log("CARRIER STOPED MOVING")
			this.resumeWListeners();
		},//afterMovingCarrier	
		afterResizeEnd:function(){
			//aqui terminou o resize completamente !!! devemos destruir o objecto
			DomConstruct.destroy("xDiv");
			dojo.style(dojo.byId("canvasPaneId"), "overflow", "auto");
			var adj2X=this.adjustType2(this.currentWidget.type,"x");
			var adj2Y=this.adjustType2(this.currentWidget.type,"y");						
			console.log("afterResizeEnd depois Widget="+this.currentWidget.id+" ->"+this.currentWidget.posInArr+" left="+this.currentWidget.left+" top="+this.currentWidget.top+" w="+this.currentWidget.width+" h="+this.currentWidget.height);
			var xPos=domGeom.position(dojo.byId(this.currentWidget.id),false);//includeScroll=False =>Takes scroll into account - use true to get the x/y relative to the document root (unaffected by window scrolling)
			var xScroll = domGeom.docScroll();
			var change={l:this.objResizeWidget.targetL-this.objResizeWidget.targetIL,t:this.objResizeWidget.targetT-this.objResizeWidget.targetIT,w:this.objResizeWidget.targetW-this.objResizeWidget.targetIW,h:this.objResizeWidget.targetH-this.objResizeWidget.targetIH}
			console.log("afterResizeEnd+++++++> Initial: Left="+xPos.x+" Top="+xPos.y+" W="+xPos.w+" H="+xPos.h);
			console.log("afterResizeEnd+++++++> Variation: Left="+change.l+" Top="+change.t+" W="+change.w+" H="+change.h);
			var xL=this.currentWidget.oLeft+change.l;
			var xT=this.currentWidget.oTop+change.t;
			var xW=this.currentWidget.width+change.w;
			var xH=this.currentWidget.height+change.h;
			console.log("afterResizeEnd+++++++> Final: Left="+xL+" Top="+xT+" W="+xW+" H="+xH);
			console.log("afterResizeEnd  we reajust the widget... id="+this.currentWidget.id+" type="+this.currentWidget.type+" l="+this.currentWidget.left+" t="+this.currentWidget.top+" w="+this.currentWidget.width+" h="+this.currentWidget.height);
			//f0.setFieldStyle(this.currentWidget.id,{left:xL,top:xT,width:xW,height:xH}); 
			this.objEditForm.gridPattern=this.tempGridPattern;
			this.objEditForm.setFieldStyle(this.currentWidget.id,{left:xL,top:xT,width:xW,height:xH}); 
			dijit.byId(this.currentWidget.id).startup();		
			this.objResizeWidget.destroy();
			this.objResizeWidget=null;
			//----- semaphore status --  true,false,false
			this.outsideWidget=true;
			this.insideWBorder=false;
			this.insideWidget=false;
			this.resumeWListeners();
		},//afterResizeEnd	
		mouseMoveInsideW:function(e){ 
			//this listner only applies for modeRun=false. Only set semaphores
			//this listener establishes the distinctions between border and interior zone inside a widget
			//  it defines 3 semaphores: outsideWidget/insideWBorder/insideWidget=false;
			//  in the interior zone it sets cursor to move or default if tagged or not
			var x = e.clientX; 
			var y = e.clientY; 
			//http://www.w3.org/TR/CSS21/box.html#box-dimensions
			var difX=(x-this.currentWidget.left<7)? true:false;
			var difY=(y-this.currentWidget.top<5)? true:false;
			var difW=(this.currentWidget.extremeL-x<7)? true:false;
			var difH=(this.currentWidget.bottom-y<5)? true:false;
			console.log("mouseMoveInsideW  Widget="+this.currentWidget.id+" top="+this.currentWidget.top+" mouse x,y="+x+","+y+" DifX="+difX+" DifY="+difY+" DifW="+difW+" DifH="+difH);
			console.log("--------------top,h-->"+this.currentWidget.top+"+"+this.currentWidget.height+" dif margem inf="+(this.currentWidget.bottom-y)+" X,Y,W,L="+this.currentWidget.left+","+this.currentWidget.top+","+this.currentWidget.width+","+this.currentWidget.height);
			if(difX || difY ||difW ||difH){// inside border zone
				if(!this.markedWidgets){
					console.log("--INSIDE BORDER ZONE-------->mouse over em Border ID="+this.currentWidget.id+" x,y="+x+","+y+" X,Y="+this.currentWidget.left+","+this.currentWidget.top+" extremeL="+this.currentWidget.extremeL+" bottom="+this.currentWidget.bottom);
					domStyle.set(this.topDijitNode(this.currentWidget.id,this.currentWidget.type),"cursor", "crosshair"); //topDijitNodeevita partes de widget ficarem com crosshair e outras não...
					if(this.currentWidget.type=="button"){//em desespero... e funciona
						domStyle.set(dojo.byId(this.currentWidget.id),"cursor", "crosshair"); //topDijitNode evita partes de widget ficarem com crosshair e outras não...
					};	
					//----- semaphore status --  false,true,false
					this.outsideWidget=false;
					this.insideWBorder=true;
					this.insideWidget=false;//it is inside the widget but not in its interior zone
				}else{// border zone but with markedWidgets
					console.log("--INSIDE BORDER ZONE--INACTIVE ID="+this.currentWidget.id+" x,y="+x+","+y+" X,Y,W,L="+this.currentWidget.left+","+this.currentWidget.top+","+this.currentWidget.width+","+this.currentWidget.height);
					//dojo.style(dojo.byId(currentWidget.id), "cursor", "default");
					domStyle.set(this.topDijitNode(this.currentWidget.id,this.currentWidget.type),"cursor", "default"); //topDijitNodeevita partes de widget ficarem com crosshair e outras não...
					this.outsideWidget=false;
					this.insideWBorder=false;
					this.insideWidget=false;//it is inside the widget but not in its interior zone
				};
			}else{//inside the widget interior (core)
				console.log("--INSIDE INSIDE ZONE--ID="+this.currentWidget.id+" x,y="+x+","+y+" X,Y,W,L="+this.currentWidget.left+","+this.currentWidget.top+","+this.currentWidget.width+","+this.currentWidget.height);
				if(this.objEditForm.tag(this.currentWidget.posInArr)){ // this widget is already marked - then switch cursor to move
					dojo.style(dojo.byId(this.currentWidget.id), "cursor", "move");
					this.moveAllowed=true;			
				}else{//this widget is not marked
					dojo.style(dojo.byId(this.currentWidget.id), "cursor", "default");
					this.moveAllowed=false;			
				};
				//----- semaphore status --  false,false,true
				this.outsideWidget=false;
				this.insideWBorder=false;
				this.insideWidget=true;//it is inside the widget AND in its interior zone
			};
		},//mouseMoveInsideW
		overWidget:function(xWOrder,e){//chamado com dojo.parcial(overWidget,xId) 
			//Event.stop(e);
			var x = e.clientX; 
			var y = e.clientY; 
			this.outsideWidget=false;
			//alert("entrou em overWidget viewPortX "+this.viewPortX);

			//alert("entrou em overWidget "+this.objEditForm.name);

			widget=this.objEditForm.field(xWOrder);
			//alert("entrou em overWidget2");
			// to pass info to mouseMoveInsideW - also to be used in mouseDownOnCanvas 
			this.currentWidget.id=widget.props.id;
			this.currentWidget.posInArr=xWOrder;//widget position in f0.arrObj		
			this.currentWidget.type=widget.type;
			this.currentWidget.width=parseInt(widget.props.style.width);
			this.currentWidget.height=parseInt(widget.props.style.height);
			console.log("x->ENTROU em "+this.objEditForm.field(xWOrder).props.id+" h="+widget.props.style.height+" h="+this.currentWidget.height);
			
			this.currentWidget.oLeft=parseInt(widget.props.style.left);
			this.currentWidget.oTop=parseInt(widget.props.style.top);

			var widgetPosition=domGeom.position(dojo.byId(this.currentWidget.id),false);//includeScroll=False =>Takes scroll into account - use true to get the x/y relative to the document root (unaffected by window scrolling)
			console.log("xx->ENTROU em "+this.objEditForm.field(xWOrder).props.id+" widget.w="+widgetPosition.w+" widget.h="+widgetPosition.h);

			this.currentWidget.left=widgetPosition.x+this.adjustType(this.currentWidget.type,"x");		
			this.currentWidget.top=widgetPosition.y+this.adjustType(this.currentWidget.type,"y");
			this.currentWidget.extremeL=this.currentWidget.left+this.currentWidget.width+this.adjustType2(this.currentWidget.type,"x");	
			this.currentWidget.bottom=this.currentWidget.top+this.currentWidget.height+this.adjustType2(this.currentWidget.type,"y");//
			
			console.log("xxx->ENTROU em "+this.objEditForm.field(xWOrder).props.id+" bottom="+this.currentWidget.bottom+" pos.y="+widgetPosition.y+" pos.h="+widgetPosition.h+" adjY="+this.adjustType(this.currentWidget.type,"y")+" adj2Y="+this.adjustType2(this.currentWidget.type,"y"));

			var xScroll = domGeom.docScroll();

		
			console.log("ENTROU em "+this.objEditForm.field(xWOrder).props.id+" posInArr="+this.currentWidget.posInArr+" h="+this.currentWidget.height+" scrollY="+xScroll.y); //this is the widget element
			console.log("---> overWidget Id="+this.currentWidget.id+" Left="+widgetPosition.x+"-"+this.adjustType(this.currentWidget.type,"x")+" Top="+widgetPosition.y+"-"+this.adjustType(this.currentWidget.type,"x"));
			console.log("---> overWidget Id="+this.currentWidget.id+" Left="+this.currentWidget.left+" Top="+this.currentWidget.top+" Width="+this.currentWidget.width+" Height="+this.currentWidget.height);
			this.mouseMoveInsideWHandler.resume();//alows border evaluation
			this.mouseDownOnCanvasHandler.resume();//já pode ir ao mouseDownOnCanvas
			//widgetOver=true;		
		},//overWidget	
		outWidget:function(){
			console.log("SAIU de "+this.currentWidget.id+"<>");
			//----- semaphore status --  true,false,false
			this.outsideWidget=true;
			this.insideWBorder=false;
			this.insideWidget=false;
			//--------------------
			this.mouseMoveInsideWHandler.pause();//stops border evaluation
		},//outWidget
		mouseClickOnWidget:function(e){
			//only if mode=Design - mark or unmark the current element 
			//Event.stop(e);
			console.log("mouseClickOnWidget - Order="+this.currentWidget.posInArr+" Tag="+this.objEditForm.tag(this.currentWidget.posInArr));			
			if(this.objEditForm.tag(this.currentWidget.posInArr)){ //marked widget
				this.unMark(this.currentWidget.posInArr);
				this.markedWidgets=this.checkMarks();//true if at least one is marked
				console.log("mouseClickOnWidget - DESMARCOU WIDGET="+this.currentWidget.posInArr+" marked="+this.markedWidgets);
			}else{//this widget is not marked
				this.mark(this.currentWidget.posInArr);
				this.markedWidgets=true;			
				console.log("mouseClickOnWidget - MARCOU WIDGET="+this.currentWidget.posInArr+" marked="+this.markedWidgets);			
			};
			//----- semaphore status --  false,false,true
			this.outsideWidget=false;
			this.insideWBorder=false;
			this.insideWidget=true;//it is inside the widget AND in its interior zone
		},//mouseClickOnWidget	
		suspendWListeners:function(){//over,out,mouseMoveInsideW,mouseDownOnCanvas
			var xTotWidgets=this.objEditForm.totObjects();
			for(var i=0;i<xTotWidgets;i++){ //suspend listeners for overWidget and out Widget event
				this.overWHandlers[i].pause();
				this.outWHandlers[i].pause();
				this.mouseClickOnWHandlers[i].remove();
			};
			this.mouseMoveInsideWHandler.pause();//stops border evaluation
			this.mouseDownOnCanvasHandler.pause();	
		},//suspendWListeners	
		resumeWListeners:function(){//over,out,mouseMoveInsideW,mouseDownOnCanvas
			var xTotWidgets=this.objEditForm.totObjects();		
			for(var i=0;i<xTotWidgets;i++){ //resume listeners for overWidget and out Widget event
				this.overWHandlers[i].resume();
				this.outWHandlers[i].resume();
				//this.mouseClickOnWHandlers[i]=this.objEditForm.widget(i).on("mouseup",mouseClickOnWidget);
				this.mouseClickOnWHandlers[i]=this.objEditForm.widget(i).on("mouseup",Lang.hitch(this,"mouseClickOnWidget"));
			};
			this.mouseMoveInsideWHandler.pause();//pause is the default state - it will be resumed in overWidget
			this.mouseDownOnCanvasHandler.resume();
		},//resumeWListeners	
		topDijitNode:function(xId,xType){
			//dado um dijit id devolve o Node que deve ser usado para fazer mouseenter ou mudar o cursor
			//o mais alto na hierarquia que contem o dijit
			var xNode=dojo.byId(xId);
			if(xNode.parentNode.parentNode.id=="widget_"+xNode.id){//é o que acontece a //aplica-se a textBox,label,numberBox,dateTextBox,comboBox
				return(xNode.parentNode.parentNode);
			}else{
				if(xType=="button"){
					return(xNode.parentNode.parentNode);
				};	
				return(xNode);
			};
		},
		adjustType:function(xType,xDirection){//for each type does an adjustment according to the direction (x or y) to left,top
			switch(xType){//left and top //o parametro comanda os handles - o widget fixo
				case "textBox":if(xDirection=="x")	return -3;else return -2;// ok
					break;
				case "label":if(xDirection=="x")	return -3;else return -2;
					break;
				case "numberBox":if(xDirection=="x")	return -3;else return -2;
					break;			
				case "textArea":if(xDirection=="x")	return 0;else return 0;// x ok,y ok
					break;			
				case "checkBox":if(xDirection=="x")	return 0;else return 0;// x ok, y ok 
					break;			
				case "dateTextBox":if(xDirection=="x")	return -3;else return -2;// y ok
					break;
				case "button":if(xDirection=="x")	return -4;else return -2;//y ok
					break;	
				case "comboBox":if(xDirection=="x")	return -3;else return -2;
					break;	
				case "grid":if(xDirection=="x")	return 0;else return 1;
					break;
				case "tabs":if(xDirection=="x")	return 0;else return 0;// y ok
					break;			
				default: alert("adjustType: the type "+xType+" is unknown");	
			}		
			return alert("adjustType: wrong wayout the type "+xType+" is unknown");
		},	
		adjustType2:function(xType,xDirection){//for each type does an adjustment according to the direction (x or y) to width,height
			console.log(xType+" dir="+xDirection);
			switch(xType){//extremeL and bottom
				case "textBox":if(xDirection=="x")	return 1;else return 2;// x ok, y ok
					break;
				case "label":if(xDirection=="x")	return 1;else return 2;
					break;
				case "numberBox":if(xDirection=="x")	return 1;else return 2;
					break;			
				case "textArea":if(xDirection=="x")	return 5;else return 5;// x ok,y ok
					break;			
				case "checkBox":if(xDirection=="x")	return 2;else return 2;// x ok, y ok
					break;			
				case "dateTextBox":if(xDirection=="x") return 1;else return 2;// x ok, y ok
					break;
				case "button":if(xDirection=="x")	return 8;else return 6;//x ok, y ok
					break;	
				case "comboBox":if(xDirection=="x")	return 1;else return 2;
					break;	
				case "grid":if(xDirection=="x")	return 2;else return 0;
					break;
				case "tabs":if(xDirection=="x")	return -1;else return -1;//x ok, y ok
					break;			
				default: alert("adjustType: the type "+xType+" is unknown");	
			}		
			return alert("adjustType: wrong wayout the type "+xType+" is unknown");
		},
		placeFormInPane:function(xFBuilder,xPaneId,xLeft,xTop,xWidth,xHeight,borderThickness,borderType,xColor){//places the form runDesign in pane xPaneId. If pane does not exist create a new one and places it in a div in the body()
			//Parameters:fBuilder Object, ContentPaneId,left,top,width,height,borderThickness,BorderType,color
			//borderType are: solid, dotted or dashed
			// Method will create a Content Pane over a div over the body and the Content Pane will receive a Form Buider object
			//Content Pane if created  will get a CSS Class "Mother_"+(prefix of fBuilder Object)
			var xPane=dijit.byId(xPaneId);
			//if(!dijit.byId(xPaneId)){//the ContentPane does not exist, it will be created in a div in the body
			if(!xPane){//the ContentPane does not exist, it will be created in a div in the body
				var xDiv = DomConstruct.create("div"); 
				var xDivId="divPane_"+xPaneId;
				xDiv.innerHTML="<div id='"+xDivId+"'></div>"; //the div id is "divPane_"+xPaneId
				dojo.body().appendChild(xDiv);//coloca o div no DOM
				//var xStyle="position:absolute;left:"+xLeft+"px;top:"+xTop+"px;width:"+xWidth+"px;height:"+xHeight+"px;border: "+borderThickness+"px dotted "+xColor+";'";
				var xStyle="position:absolute;left:"+xLeft+"px;top:"+xTop+"px;width:"+xWidth+"px;height:"+xHeight+"px;border: "+borderThickness+"px "+borderType+" "+xColor+";'";
				xPane=new ContentPane({
					id:xPaneId,
					content:"",
					//style:'position:absolute;left:800px;top:5px;width:200px;height:30px;border: 1px dotted green;'
					style:xStyle
				}, xDivId);	//o carrierPane é colocado sobre o xDiv	
				DomClass.add(xPane.domNode, "Mother_"+xFBuilder.prefix);//add the CSS class "Mother_"+(prefix of fBuilder Object) to ContentPane
			};
			//if ContentPane exists all parameters after xPaneId will be discarded
			var formRunDesign=xFBuilder.formObj;
			formRunDesign.placeAt(xPaneId);  //o form é colocado no pane que: ou já existe ou senão existe é criado e colocado num div no body
			return xPane;//it will return the dijit ContentPane object, existing or created in the function 
		}						
	});//end of declare associative array, closing  of declare function
}); //closing of codeblock for callback function & closing of define function	



	//tecnica para mostrar e esconder widgets com dojo.query("#editorPanel").style("display", "none"); ou dojo.query("#editorPanel").style("display", "block");
		//http://dojo-toolkit.33424.n3.nabble.com/TabContainer-nothing-shows-td3867237.html
	// Dynamic delete and insert
		//http://dojo-toolkit.33424.n3.nabble.com/TabContainer-Deleting-a-tab-dynamically-td817526.html	

	//var objCanvasMove = new dojo.dnd.Moveable(canvas,{	//todo o canvas passa a mover-se !!!
	//	mover:moveCanvas
	//});
	// SET EVENT BEHAVIOUR
	//  Pretended Behaviour:
	//	when the user clicks in the viewport, she can click in:
	//											|       visible  behaviour            
	//      - the canvas (outside any widget)   | Unmarks all marked widgets
	//      - inside the widget border          | Shows handles allowing widget resize 
	//      - inside the widget interior		|
	//           if the widget is unmarked 		| marks the widget (after this cursor changes to move if inside a widget)
	//			 if it is already marked		| unmark the widget
	//
	// EXECUTING OPERATIONS -In order to:		|                DO:
	//
	//     Drag the whole Canvas				|ctrl+click the canvas (outside any widget) keeping mouse down
	//											|     Mouse up will terminate the operation
	//	   Drag a set of widgets				|Mark the widgets to move and with the mouse over one of the marked widgets (cursor change to move)
	//											|    Click to signal "we want to move" + mouse down to drag
	//											|       Mouse up will terminate the operation
	//	   Resize a widget				        |Call resizing handles clicking in widget border (cursor changes to crosshair in widget border )
	//											|    Terminate resizing operation with a click outside any of the widget hanles
	//	   Delete a set of widgets				|Mark the widgets to delete and press the "Delete" key
	//											|    Deletion and operation will terminate upon user confirmation.

	//                                                   
	// MAIN EVENTS
	//  mouseDownOnCanvas - catch clicks outside widgets, inside widgets border and inside inside widgets performing the following actions:
	//		outside widgets:
	//			Unmarks any marked widgets
	//			if ctrl key is pressed - Move the canvas
	//		inside widget:
	//			inside border zone:
	//				if border zone is active (unMarked widget - crosshair cursor is shown) call resizing handles allowing resize
	//				if border zone is inactive (marked widget - move cursor is shown both in border and core zone) - nothing is done
	//			inside inside zone (widget core):
	//				if widget is marked ->Drags this widget and all other marked (tagged) widgets
	//				(if widget is unmark -> to mark it is a task to mouseClickOnWidget)
	//
	//  mouseMoveInsideW - signals mouseDownOnCanvas 3 semaphores: outsideWidget/insideWBorder/insideWidget
	//
	//	overWidget - triggered when mouse enters a widget. Prepares currentWidget info and activate:
	//			 mouseMoveInsideW - event activated
	//			 mouseDownOnCanvas - event activated
	//
	//  outWidget - triggered when mouse leaves a widget.  Desactivates:
	//			 mouseMoveInsideW - event desactivated
	//
	//  mouseClickOnWidget - triggered by mouseup when mouse is inside a widget. Marks unmarked widgets and unmarks marked widget
	//
	//    receiving a qualification outsideWidget, insideWBorder or insideWidget (one true =>all others false)
	//	  if(outsideWidget) (Unmarks all marked widgets) 
	//	  if(insideWBorder) (resize current widget) 
	//	  if(insideWidget) 
	//		if(currentWidget is unmarked) (marks the widget) =>cursor to move in the next cursor over
	//									  (prepares carrier drag for an eventual next click)
	//		else(currentWidget was marked)(drags the carrier pane)
	//									  (unmarks all widgets) =>cursor to default and crosshair inside widget border
	//
	//    
	// ------------
	//
	//      The eventType       the listener function            the handler    
	//		   mousedown			mouseDownOnCanvas				mouseDownOnCanvasHandler	
	//			click				mouseClickOnWidget
	//		   mouseenter			overWidget
	//		   mouseleave			outWidget
	//		   mousemove	        mouseMoveInsideW				mouseMoveInsideWHandler (necessary to control border condition)
	//      unmark any market widgets
	//      Prepare canvas move - if there are no marked widgets
	//		disarmed in overWidget / rearmed in outWidget
	//              
	//   Mouse down on canvas   - mouseDownOnCanvas - 
	//      	1-allows canvas repositioning
	//   Mouse over a widget   - overWidget - sets up mouseDownWidgetHandler & clickWidgetHandler
	//   Mouse out of a widget - outWidget - disarms mouseDownWidgetHandler & clickWidgetHandler
	//	 Mouse down over a widget - mouseDownWidgetHandler 
	//        prepares widget to move - it is disarmed by outWidget
	//		  Setup in overWidget -Runs only once 
	//	 Mouse Click over a widget - clickWidgetHandler
	//        Runs after mouseDownWidgetHandler marking border if unmarket/ unmarking if marked
	// a classe editViewPort - tem um mode "Run" e um mode Design 

