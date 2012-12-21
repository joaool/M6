	define([
			"Mother1/utils.js",
			"Mother1/debug.js",
			"MotherLib6.js",
			"Mother1/ResizeMoveArea.js",  
			"dojo/_base/declare",
			//----- para editFBuilder on,Lang,DomGeom
			"dojo/_base/window",//used
			"dojo/on",//used
			"dojo/dom",//used
			"dojo/_base/lang",
			"dojo/dom-geometry",
			"dojo/dom-construct",
			"dojo/dom-style",	
			"dojo/Evented", //necessário para emit e recepção de eventos	 
			 "dojo/domReady!"], 
		function(Utils,Dbg,FBuilder,ResizeMoveArea,Declare,Win,On,Dom,Lang,DomGeom,DomConstruct,DomStyle,Evented){	
		//function(Utils,Declare,Lang,DomGeom,Evented){	
		return Declare("editFBuilder",[Evented,FBuilder],{
			// Exemple of Use:	editF=new editFBuilder(f1,"mouseenter"); //f1 is a form (fBuilder instance), par2 is an eventType"mouseenter" or "click"
			//   This class will act upon any existing form (an fBuilder instance - in the example above ->f1) using the event ((in the example above ->"mouseenter")
			//		to edit any of the form's widgets. To edit the form's widgets means:
			//      1 - Whenever the user move the mouse to trigger the specified event (par2) associated to an widget, the class will provide a 
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

			k:0,
			//nota sobre a utilização de ResizeMoveArea: usar activate() para activar um elemento já definido com o contructor ou com reset(....)
			//      se o elemento é o corrente, e quisermos activa-lo: fazer activate()
			//      se é um elemento novo: fazer reset(" --> "+this.currentWidget.type,widgetPosition.x-z+this.objEditForm.borderThickness,widgetPosition.y-z+this.objEditForm.borderThickness,widgetPosition.w,widgetPosition.h,1,"dotted","gold");
			//                 ...caracterizando o novo elemento, e depois fazer activate() para o activar 
//		
			constructor:function(objEditForm,eventType){
				//----------- debug preparation Area -----------------------------------------------------------
				this.oDbg=new Dbg();
				this.oDbg.setThis("editFBuilder2");//All debugs within this class will belong to "editFBuilder2"	
				//----------------------------------------------------------------------------------------------
				//alert("->editFBuilder.constructor CONSTRUCTOR");
				this.objEditForm=objEditForm;	//objEditForm:null,
				this.eventType=eventType;
				this.overWHandlers=[]; //it is instaciated in constructor to avoid sharing of array between diferent instances 
				this.outWHandlers=[];//it is instaciated in constructor to avoid sharing of array between diferent instances 
				//console.log("editFBuilder.constructor - Totobjects="+this.objEditForm.totObjects());
				this.setAListeners();
				if(this.oDbg.isDbg("constructor")) this.oDbg.display("END of constructor Totobjects="+this.objEditForm.totObjects());

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
					DomStyle.set(Dom.byId("_moveResizeDiv0"),"width",this._moveResizeDiv0.w);
					DomStyle.set(Dom.byId("_moveResizeDiv0"),"height",this._moveResizeDiv0.h);
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
					this.objResizeMove=new ResizeMoveArea("  "+this.currentWidget.type,widgetPosition.x,widgetPosition.y,widgetPosition.w,widgetPosition.h,2,"dotted","gold");//borderType:solid, dotted,dashed
					// par1-Label, par2...par5 - positions, par6-borderThickness, par7-borderType, par8-borderColor
					this.objResizeMove.visible_on_wayout=false; //false will make the area invisible on the way out (click outside the element) - default is true.
					//this.objResizeMove.visible_on_wayout=false; //this will make the area invisible on the way out (click outside the element) - default is true.
					this.k=0;
					
					this.objResizeMove.on("resizeMoveEnd",Lang.hitch(this,function(){
						this.k++;
						var xL=this.objResizeMove.position.x-this.objEditForm.viewPort.l-this.objEditForm.borderThickness;//new positions - we have to subtract the pane coordinates and borderThickness
						var xT=this.objResizeMove.position.y-this.objEditForm.viewPort.t-this.objEditForm.borderThickness;//new positions - we have to subtract the pane coordinates and borderThickness
						var xW=this.objResizeMove.position.w;
						var xH=this.objResizeMove.position.h;
						//console.log("->"+this.k+" a)editFBuilder.overWidget/resizeMoveEnd CLICK DE SAIDA  guarda em MotherLib Positions: x="+xL+" y="+xT+" width="+xW+" height="+xH);
						if(this.oDbg.isDbg("overWidget")) this.oDbg.display("->"+this.k+" a)callback resizeMoveEnd CLICK DE SAIDA  guarda em MotherLib Positions: x="+xL+" y="+xT+" width="+xW+" height="+xH);
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
		if(this.oDbg.isDbg("outWidget")) this.oDbg.display("->SAIU 2 - entrada em outWidget ->o valor de z.me="+thiz.z.me);

				//TO SOLVE THE OVERSHADOWING PROBLEM in eventType="click", it should remember  w and l for id="_moveResizeDiv0"
				this._moveResizeDiv0.w=DomStyle.get(Dom.byId("_moveResizeDiv0"),"width");//remembers the current position
				this._moveResizeDiv0.h=DomStyle.get(Dom.byId("_moveResizeDiv0"),"height");//remembers the current position
				//console.log("outWidget saved _moveResizeDiv0.w="+this._moveResizeDiv0.w+"  _moveResizeDiv0.h="+this._moveResizeDiv0.h);
				if(this.oDbg.isDbg("outWidget")) this.oDbg.display("saved _moveResizeDiv0.w="+this._moveResizeDiv0.w+"  _moveResizeDiv0.h="+this._moveResizeDiv0.h);
				DomStyle.set(Dom.byId("_moveResizeDiv0"),"width",0);
				DomStyle.set(Dom.byId("_moveResizeDiv0"),"height",0);
				//----------------------------------------------------------------------------------------
				
				//console.log("->editFBuilder.outWidget-->SAIU de "+this.currentWidget.id+" Vai emitir widget_unselected event");
				if(this.oDbg.isDbg("outWidget")) this.oDbg.display("->SAIU de "+this.currentWidget.id+" Vai emitir widget_unselected event");
				this.emit("widget_unselected",{});//- whenever ouWidget event occurs - EVENTS ARE SUSPENDED
				//console.log("->editFBuilder.outWidget ---------------------------------------------------------------------------------------> regressou de widget_unselected");
				if(this.oDbg.isDbg("outWidget")) this.oDbg.display("->regressou de widget_unselected");
		if(this.oDbg.isDbg("outWidget")) this.oDbg.display("->regressou de widget_unselected 2 ->o valor de z.me="+thiz.z.me);
		
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
			test:function(){
				console.log("editFBuilder.test");
			}			
		}); //end of classe editFBuilder
	}//call back function
	); //end of require for module 	editFBuilder
