		define([ "Mother1/exchanger2.js",
				 "Mother1/resizeWCoord.js",
				 "Mother1/moveCoord.js",
				 "Mother1/utils.js",
				 "dojo/_base/declare",	
				 "dojo/_base/window",	
				 "dojo/on",
				 "dojo/Evented",  
				 "dojo/dnd/Moveable",
				 "dojo/dnd/Mover",	
				 "dojo/dom",
				 "dojo/dom-geometry",
				 "dojo/dom-construct",
				 "dojo/dom-style",
				 "dojo/dom-class",							 			 
				 "dojo/_base/lang",						 
				 "dojo/domReady!"], //só consome
			function(Exchanger,ResizeWidget,MoveCoord,Utils,Declare,Win,On,Evented,Moveable,Mover,Dom,DomGeom,DomConstruct,DomStyle,DomClass,Lang){ 
				return Declare("resizeMoveArea", [Evented],{
					//resizeMoveArea - This component allows an easy resize and move of a screen area
					//    1- present handles - 
					//    2- the user may change handles, or move the element gragging it
					//Ex x1=new ResizeMoveArea("test Area",100,100,100,30,5,"green","silver");
					// ------------------------ old
					//Ex:	x2=new ResizeMoveArea("Forms Area",landingLeft,landingTop+20,80,50,3,"crimson","red");
					//
					// Properties:
					//	   position ->ex { w: 300, h: 150, x: 700, y: 900, }-> New window position
					// this class instanciates an avatar that the user can move and resize to define specific areas
					// Use:  1- creating the object: var x2=new moveResizeArea(" Forms Area",200,300,100,50,3,"solid","crimson");//
					//														      label to appear
					//																	    |left,top
					//																			     |width,height
					//																					    |border thickness
					//																					    	| border type
					//																								   |border color
				//	  : 2- define an event for "mouseenter" to activate moveResizeArea when user enters the area
					//			On(dojo.byId(x2.moveResizeDivId), "mouseenter", function(evt){
					//				x2.activate();
					//			}); 
					//
					//    : 3- moveResizeArea emits the "move_resize_end" event when the user clicks inside the area to signal that she has finished the area definition
					//			x2.on("move_resize_end", function(){
					//				alert("Returned with --->Positions x="+x2.position.x+" y="+x2.position.y+" width="+x2.position.w+" height="+x2.position.h);
					//			});		
					//          Note: x2.position has the final positions in the form { w: 300, h: 150, x: 700, y: 900, }
					//			Note: after receiving control from "move_resize_end" event, the listener can reactivate the area calling x2.activate() or stoping
					//					the process collecting x2.position. The listaner can dismiss visually the finishing element with x2.delete().
					//			Note: exemples from layoutArea7.html
					//
	
					moveResizeDivId:null,
					avatarId:null,
					position:null,//to return positions ex { w: 300, h: 150, x: 700, y: 900, }
					current:{},
					element:null,
					visibleElement:null,
					objMove:null,//moveable object
					oExchanger:null,//exchanger object
					objResizeWidget:null,//resizeWidget instance
					objMove:null,//move object 
					visible_on_wayout:true, //property to define if a click outside the handles leave the element visible on the screen
					endResizeHandler:null,
					sai_por_move:false,//na classe acima (editFBuilder) há um bug que desaparece qdo sai_por_move fica true.Isto é para ser usado acima
					z:0,
					z1:0,
					constructor:function(xLabel,landingLeft,landingTop,landingWidth,landingHeight,xBorderThickness,xBorderType,xActiveColor){
						//console.log("resizeMoveArea ---- CONSTRUCTOR !!! ----");
						this.element = DomConstruct.create("div",{id:"_moveResizeBaseDiv"}); //cria HTML div - 
						this.moveResizeDivId="_moveResizeDiv0";//+this.static.moveResizeCount;
						this.avatarId="_avatarId0";//+this.static.moveResizeCount;
						this.current={label:xLabel,active:false,l:landingLeft,t:landingTop,w:landingWidth,h:landingHeight,borderThickness:xBorderThickness,borderType:xBorderType,activeColor:xActiveColor};
						var util=new Utils(); //to use utils functions
						this.element.innerHTML=util.makeDivId(this.moveResizeDivId,this.current.l,this.current.t,this.current.w,this.current.h,this.current.borderThickness,null);
						Win.body().appendChild(this.element); 
						this.visibleElement = DomConstruct.create("div"); //cria outro HTML div 
						this.visibleElement.innerHTML=util.getInnerHTML("textBox",this.avatarId,this.current.label,this.current.w,this.current.h,this.current.borderThickness,this.current.borderType,this.current.activeColor); //este é o que se vai ver...
						//dojo.byId(this.moveResizeDivId).appendChild(this.visibleElement); //textarea will be child of inner element instead of child of element (element.appendChild(visibleElement))
						dojo.byId(this.moveResizeDivId).appendChild(this.visibleElement); //textarea will be child of inner element instead of child of element (element.appendChild(visibleElement))
						//body()
						//    div ->this.element with id="_moveResizeBaseDiv"
						//			div (innerHTML do div this.element) -->this.moveResizeDivId
						//				div -->this.visibleElement
						//	
					},
					reset:function(xLabel,landingLeft,landingTop,landingWidth,landingHeight,xBorderThickness,xBorderType,xActiveColor){
						//DomConstruct.destroy(this.element);
						//this.element = DomConstruct.create("div"); //cria HTML div - 
						var util=new Utils(); //to use utils functions
						this.current={label:xLabel,active:false,l:landingLeft,t:landingTop,w:landingWidth,h:landingHeight,borderThickness:xBorderThickness,borderType:xBorderType,activeColor:xActiveColor};
						//DomStyle.set("_moveResizeBaseDiv", "left", this.current.l);
						DomStyle.set("_moveResizeBaseDiv", "left", 0);
						//DomStyle.set("_moveResizeBaseDiv", "top", this.current.t);
						DomStyle.set("_moveResizeBaseDiv", "top", 0);
						DomStyle.set("_moveResizeDiv0", "left", this.current.l);
						DomStyle.set("_moveResizeDiv0", "top", this.current.t);
						DomStyle.set("_moveResizeDiv0", "width", this.current.w);
						DomStyle.set("_moveResizeDiv0", "height", this.current.h);
						//this.element.innerHTML=util.makeDivId(this.moveResizeDivId,this.current.l,this.current.t,this.current.w,this.current.h,this.current.borderThickness,null);
						//Win.body().appendChild(this.element); 
						//this.visibleElement = DomConstruct.create("div"); //cria outro HTML div 
						DomConstruct.destroy(this.visibleElement);
						this.visibleElement = DomConstruct.create("div"); //cria outro HTML div 
						this.visibleElement.innerHTML=util.getInnerHTML("textBox",this.avatarId,this.current.label,this.current.w,this.current.h,this.current.borderThickness,this.current.borderType,this.current.activeColor); //este é o que se vai ver...		
						dojo.byId(this.moveResizeDivId).appendChild(this.visibleElement); //textarea will be child of inner element instead of child of element (element.appendChild(visibleElement))
						if(this.objResizeWidget){
							this.objResizeWidget.postCreate();
							DomStyle.set(this.avatarId,"cursor", "move"); 
							DomStyle.set(this.visibleElement,"display","block");//to make element visible all times
						}else{
							alert("ERROR in resizeMoveArea.reset() - objResizeWidget does not exist !!! - .reset should be called for reactivation");
						};
					},
					activate:function(){
						//Activates only one element at a time.
						//when activated one element has 2 states "Handles on" and "drag"
						//		from "Handles on" it is possible to resize or to drag(mouse down)
						//		from "Handles on" it is possible to finish with a click outside the element
						//      from "drag" --->with mouse up --->"handles on"
						//
						// the property __isResize ->defines the status resizing(true) or moving(false) --->default=false
						//     this property is updated by this.setStatus(true) [isResize] or false [is Moving]
						//			the update is done at resizeWidget when resizes begins (resizeWidget._onMouseDown) or 
						//						       at moveCoord when onMouseMove begins (moveCoord.onMouseMove)
						//
						//console.log("-------------------------------------------- ENTROU EM ACTIVATE() ----------------------------------------------");
						DomStyle.set(this.avatarId,"cursor", "move"); 
						DomStyle.set(this.visibleElement,"display","block");//to make element visible all times
						//---------- Regista o evento para saida (click sobre o element) ------------
						this.current.active=true;
						//DomStyle.set(this.avatarId,"border",this.current.borderThickness+"px dotted "+this.current.activeColor);
						DomStyle.set(this.avatarId,"border",this.current.borderThickness+"px "+this.current.borderType+" "+this.current.activeColor);
						if(!this.objResizeWidget){//ResizeWidget is created and its coordinator property is set to resizeMoveArea (this class)
							this.objResizeWidget=new ResizeWidget({"targetNode":this.moveResizeDivId,"targetType":"textArea"});
							this.objResizeWidget.setCoordinator(this);//informs resizeWidget that I(resizeMoveArea) am coordinating you....
							var thiz=this;
							dojo.connect(this.objResizeWidget, "onResizeComplete", function() {//callback with an anonimous function
							//On(this.objResizeWidget, "onResizeComplete", function() {//callback with an anonimous function
								//console.log("@@resizeMoveArea 2   onResizeComplete new handles position  left="+this.targetL+" top="+this.targetT+" width="+this.targetW+" height="+this.targetH);
								DomStyle.set(thiz.avatarId,"width",(this.targetW-0)+"px");
								DomStyle.set(thiz.avatarId,"height",(this.targetH-0)+"px");
							});//onResizeComplete event without hitch	
							
							this.endResizeHandler=this.objResizeWidget.on("endResize",Lang.hitch(this,function(e){
								this.z1++;
								this.position = DomGeom.position(dojo.byId(this.avatarId));
								//console.log(this.z1+"------------------------------> EVENT ENDRESIZE --> event.cancelable="+e.cancelable+" abc="+e.abc);
								console.log(this.z1+"------->resizeMoveArea.activate() -callback de ENDRESIZE left="+this.position.x+" top="+this.position.y+" width="+this.position.w+" height="+this.position.h);
								this.afterResizeEnd();//a transformar num evento
							}));	
							
						};
						//-----------------------------------------this.ready2Move();--------------------------------------------------------------
						this.position = DomGeom.position(this.moveResizeDivId,true);//o arg é o id não o node. use true to get the x/y relative to the document root
						//* -- move preparation
						if(!this.oExchanger){
							//console.log("-->ready2Move vai criar this.oExchanger");
							this.oExchanger=new Exchanger(); //A SINGLETON necessary to return control to this code when mouse up is done				
						};	
						var thiz=this;
						//this.oExchanger.setOrder(this.current.order);//selecciona a instância a devolver dentro de moveCoord com mouse up 	
						this.oExchanger.setOrder(0);//selecciona a instância a devolver dentro de moveCoord com mouse up 	
						//console.log("-->moveResizeArea.READY2MOVE ------->POE MOVE POINTER PARA "+this.current.order);
						this.oExchanger.setPointer(function(){	
							console.log("------------------------------SAI POR MOVE---------------------->resizeMoveArea.activate ->this is the way out in moveCoord");
							thiz.sai_por_move=true;
							thiz.afterMoving();//this code runs when onMouseUp event is triggered in mover class
						},0);//does setPointer to the exchanger slot 0 (2nd param of setPointer())
						this.oExchanger.setPointer(this,1);//does setPointer to the exchanger slot 1 (2nd param of setPointer()) - passing "this"	
					
						//console.log("-->ready2Move ------->vai criar objMove e moveCoord");
						this.objMove = new Moveable(this.element,{// o HTML element passa a mover-se. a classe moveable vai alterar a sua style property indicando as posições...
							delay:5, //moveable only triggers after a drag of 5 pixels
							mover:moveCoord //Moveable instanciates moveCoord (coordinated by this class) when we click on element
						});
						//console.log("-->moveResizeArea.READY2MOVE ------->criou objMove");
						//this.moveable=true;//work-around to prevent double call to moveable - case of 2 buttons in a row returning to first one
						//console.log("--------------------------------->READY2MOVE fim <---------------------------------------------");						
					},
					afterMoving:function(){//this code runs when onMouseUp event is triggered in mover class
						this.position = DomGeom.position(dojo.byId(this.avatarId));
						console.log("-->resizeMoveArea.afterMoving   new handles position  left="+this.position.x+" top="+this.position.y+" width="+this.position.w+" height="+this.position.h);
						//console.log("-->resizeMoveArea.afterMoving  ENTROU EM AFTERMOVING vindo de:getStatus="+this.getStatus());
						this.setStatus(true);//para poder aceitar click em resizeWidget
					    //console.log("-->resizeMoveArea.afterMoving INICIO com  label="+this.current.label+" id="+this.moveResizeDivId);
					},
					afterResizeEnd:function(){//this code runs when onMouseUp event is triggered in resize class and moveResize
						this.z++;
					//this.position = DomGeom.position(dojo.byId(this.avatarId));
					//this.setStatus(true);//para poder aceitar click em resizeWidget
					/*
						//console.log(this.z+"-->resizeMoveArea.afterResizeEnd  ENTROU EM AFTERRESIZE END vindo de:getStatus="+this.getStatus());
						if(this.objMove){
							this.objMove.mover=null;
							delete this.objMove.mover;
							//console.log("-->resizeMoveArea.afterResizeEnd - destruiu a prop mover de this.objMove ficou="+this.objMove.mover);
							this.objMove.destroy();
							//console.log("-->resizeMoveArea.afterResizeEnd - destruiu this.objMove");
						};
						if(this.oExchanger){
							this.oExchanger=null;
							delete this.oExchanger;	
							//console.log("-->resizeMoveArea.afterResizeEnd - destruiu this.oExchanger");						
						};
					*/
					/*	
						if(this.objResizeWidget){
							//console.log("-->resizeMoveArea.afterResizeEnd - vai destruir this.objResizeWidget");
							this.objResizeWidget.upHandler.remove(); //se não fizer isto os eventos pendentes podem disparar qdo menos se espera...
							this.objResizeWidget.moveHandler.remove();//se não fizer isto os eventos pendentes podem disparar qdo menos se espera...
							//console.log("-->resizeMoveArea.afterResizeEnd - destruiu event handlers de this.objResizeWidget");				
							this.objResizeWidget=null;
							delete this.objResizeWidget;
							//console.log("-->resizeMoveArea.afterResizeEnd - destruiu this.objResizeWidget");
						};
						//console.log("------------------------------------------------------------------------------>vai remover sair endResizeHandler");	
					*/	
						//this.endResizeHandler.remove();
						//console.log("vai sair emitindo 	resizeMoveEnd");	
						if(!this.visible_on_wayout)
							DomStyle.set(this.visibleElement,"display","none");
							
						this.emit("resizeMoveEnd",{});//- new on/event system - 
						//console.log("vai sair e já emitiu resizeMoveEnd");				
						//this.destroy;
					},
					__isResize:true,
					setStatus:function(isResize){//status is resize or moving - the first one to run locks the status for him...
						this.__isResize=isResize;
					},
					getStatus:function(){
						return this.__isResize;						
					}
				});//end of classe moveResizeArea
			}//call back function
		); //end of define for module moveResizeArea
