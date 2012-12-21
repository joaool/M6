		define([ "Mother1/exchanger2.js",
				 "Mother1/resizeWidget3.js",
				 "Mother1/moveCanvas2.js",
				 "Mother1/utils.js",
				 "dojo/_base/declare",	 
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
			function(Exchanger,ResizeWidget,MoveCanvas,Utils,Declare,On,Evented,Moveable,Mover,Dom,DomGeom,DomConstruct,DomStyle,DomClass,Lang){ 
				return Declare("moveResizeArea", [Evented],{
					//Revision from MoveResizeArea:
					//    1- present handles - 
					//    2- the user may change handles, or move the element gragging it
					//Ex x1=new ResizeMoveArea("test Area",100,100,100,30,5,"green","silver");
					// ------------------------ old
					//Ex:	x2=new ResizeMoveArea("Forms Area",landingLeft,landingTop+20,80,50,3,"crimson","red");
					//
					// Properties:
					//	   position ->ex { w: 300, h: 150, x: 700, y: 900, }-> New window position
					//     newbox -> newbox.l, newbox.t, newbox.w, newbox.h -> New window margins  //duplicado esqueci-me que existia o outro
					// this class instanciates an avatar that the user can move and resize to define specific areas
					// Use:  1- creating the object: var x2=new moveResizeArea(" Forms Area",200,300,100,50,3,"crimson","red");//
					//														      label to appear
					//																	    |left,top
					//																			     |width,height
					//																					    |border thickness
					//																					    	| active (dotted color)
					//																								   |passive (solid) color
					//								active color signals to the user that the area is yet moveable and resizeable
					//								passive color signals to the user that the area is already defined (process is finished) cannot move or resize
					//
					//       
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
					//
					//Behaviour:
					// once set (as definided above) the user can activate the areas definition (typically with a button)
					//    only one area is active (dotted) at a time - if one area is active all others are passive (solid)
					//	      a) the active area can be dragged. At the end of the drag (mouse-up) handles will be shown.
					//				the user can adjust the handles infinitly until she clicks outside one handle. 
					//					If she clicks outside the area: Handles will go with the area active (dotted) and area can be dragged ->a) 
					//					If she clicks inside the area: Handles will go with the area inactive (solid). At this point moveResizeArea will publish the 
					//						"move_resize_end" event, passing control to an eventual listener.
					// Whenever an instance is created that instance gets active all the others becoming passive (in whatever position they may be)
					//
					// ex of a button based definition:
					//
					//					var fz=new fBuilder("fz0","fz"); //form para tab Visual Form Builder
					//					fz.addChild("button",{left:5,top:5,value:"Layout Menus",width:100,height:49,clickCode:"z.menuArea();"}); //1
					//					fz.addChild("button",{left:5,top:100,value:"Layout Form",width:100,height:49,disable:false,clickCode:"z.formsArea();"}); //2
					//					fz.addChild("button",{left:5,top:180,value:"Layout Navigation",width:100,height:49,disable:false,clickCode:"z.navigationArea();"}); //3
					//					placeFormInPane(fz,"PaneId1",50,50,120,350,1,"dotted","red");//places the form runDesign in pane xPaneId. If pane does not exist create a new one and places it in a div in the body()
					//					fz.compensationAll();//not 100% necessary, but a good practice (after widgets are placed in the DOM) to insure that buttons will get the rigth dimensions....
					//
					// 					var	z=Lang.getObject("z",true);//to define object z acessible by MotherLib
					//					var x1=null;
					//					var x2=null;
					//					var x3=null;
					//					z.menuArea=function(){
					//						if(!x1){
					//							x1=new MoveResizeArea(" Menu Area",200,100,100,30,6,"green","silver");
					//							x1.on("move_resize_end", function(){//register to listen for "move_resize_end" event
					//								alert("Returned with --->Positions x="+x1.position.x+" y="+x1.position.y+" width="+x1.position.w+" height="+x1.position.h);
					//								x1.delete();//to force x1 to desapear visually
					//							};
					//						};
					//					};
					//					... the same for z.formsArea=function(){... and z.navigationArea=function(){...

					// ---------------------create and move avatar-------------------------------------------
					// Cada objecto criado persiste na classe (static component) até à destruição da classe
					//		o objecto pode estar activado (dotted) ou desactivado (solid) mas conserva as suas current properties...
					//
					// A classe moveable cria um div como parent do div que queremos ver mover....
					// a classe resizeWidget coloca os handles como child nodes do node targetNode (inicialmente é um targetId...)
					// faz  dotted line com active color enquanto a possibilidade de move resize estiver activa, faz solid line com passive color qdo terminar
					static:{
						moveResizeCount:-1,
						currentArr:[],//array of current properties of each instance - 	{label:xLabel,order:this.static.moveResizeCount,active:false,l:landingLeft,t:landingTop,w:landingWidth,h:landingHeight,borderThickness:xBorderThickness,activeColor:xActiveColor,passiveColor:xPassiveColor};
						lastActive:null,// order of the last active element. null=>none is active, 0,1,2,3,4 =>the number of the active
						clickHandlerArr:[], //array of click handlers
						objMoveArr:[],//array of objMove 0,1,2,3,4
						objResizeWidgetArr:[]//array of objResizeWidget 0,1,2,3,4 (necessary to clear handles if calling mouseenter leaves handles on screen)
					},//static variable with all the instances to prevent DOM conflicts
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
					clickHandler:null,//handler of click event - the way out event
					newBox:null,// final positions encoding w,h,l,t
					moveableCreated:false,// semaphore necessary to prevent to sucessive call s to moveable in activate
					//active:false,//property true/false to validate from outside if area is active (has dotted line)
					//enterHandler:null,//this event is necessary to send mover (thru oExchanger.setOrder() ) an indication of the callback instance that
									  // should be called  when mouse up is done
									  //whenever the user enters a moveResize element mouseenter sets oExchanger.setOrder() to the order (0...4) of the element
					constructor:function(xLabel,landingLeft,landingTop,landingWidth,landingHeight,xBorderThickness,xActiveColor,xPassiveColor){
						console.log("-------------- RESIZEMOVE ----------------");
						this.element = DomConstruct.create("div"); //cria HTML div - 
						this.static.moveResizeCount+=1; //to prevent DOM conflicts in id="_moveResizeDiv" and id="avatarId"
						this.moveResizeDivId="_moveResizeDiv"+this.static.moveResizeCount;
						this.avatarId="_avatarId"+this.static.moveResizeCount;
						this.current={label:xLabel,order:this.static.moveResizeCount,active:false,l:landingLeft,t:landingTop,w:landingWidth,h:landingHeight,borderThickness:xBorderThickness,activeColor:xActiveColor,passiveColor:xPassiveColor};
						console.log("---moveResizeArea.constructor ORDER="+this.current.order);
						this.deactivatePrevious();//deactivates previous (if any) updating visually

						this.static.currentArr.push(this.current);
						var util=new Utils(); //to use utils functions
						//this.element.innerHTML=this.makeDivId(this.moveResizeDivId,this.current.l,this.current.t,this.current.w,this.current.h,this.current.borderThickness,null);
						this.element.innerHTML=util.makeDivId(this.moveResizeDivId,this.current.l,this.current.t,this.current.w,this.current.h,this.current.borderThickness,null);
						dojo.body().appendChild(this.element); 
						this.visibleElement = DomConstruct.create("div"); //cria outro HTML div 
						//visibleElement.innerHTML="<textArea id='avatarId'>Menu Area</textarea>"; //este é o que se vai ver...
						//this.visibleElement.innerHTML=this.getInnerHTML("textBox",this.avatarId,this.current.label,this.current.w,this.current.h,this.current.borderThickness,"dotted",this.current.activeColor); //este é o que se vai ver...
						this.visibleElement.innerHTML=util.getInnerHTML("textBox",this.avatarId,this.current.label,this.current.w,this.current.h,this.current.borderThickness,"dotted",this.current.activeColor); //este é o que se vai ver...
						dojo.byId(this.moveResizeDivId).appendChild(this.visibleElement); //textarea will be child of inner element instead of child of element (element.appendChild(visibleElement))
						
						//this.static.clickHandlerArr.push(clickHandler);
						this.static.clickHandlerArr.push(null);
						this.static.objMoveArr.push(null);
		                 //whenever the user enters a moveResize element mouseenter sets oExchanger.setOrder() to the order (0...4) of the element
						// order in oExchanger is necessary to get the callback function corresponding to the "entered" element
					},
					delete:function(){//remove element visually and sets it inactive internally
						this.static.lastActive=this.current.order;// para assegurar que este é o previous
						this.deactivatePrevious();
						var node=this.element;
						DomConstruct.destroy(node);
						//dojo.destroy(node); //tb funciona
						//now remove it visually
						/* funciona
						if(node)
							node.parentNode.removeChild(node);
						*/
					},
					deactivatePrevious:function(){//deactivates previous (if any) visually and updating all status. At the end sets current as lastActive
						//only one area can be active at a time - it is necessary to desactivate any other area
						console.log("---moveResizeArea.deactivatePrevious LAST ACTIVE="+this.static.lastActive+" Pretender="+this.static.moveResizeCount);
						if(this.static.lastActive!=null){//if it is null (first run...) nothing to do. If there was one previsously it is set to solid border
							//this.static.currentArr.push(this.current);
							console.log("---moveResizeArea.deactivatePrevious RETIRA dotted a "+this.static.lastActive);
							//alert("---moveResizeArea.deactivatePrevious vai retirar dotted em"+this.static.active);
							console.log("---moveResizeArea.deactivatePrevious 1");
							if(dojo.byId("_avatarId"+this.static.lastActive))
								DomStyle.set("_avatarId"+this.static.lastActive,"border",this.static.currentArr[this.static.lastActive].borderThickness+"px solid "+this.static.currentArr[this.static.lastActive].passiveColor);					
							console.log("---moveResizeArea.deactivatePrevious 1.1");

							if(this.static.clickHandlerArr[this.static.lastActive])//removes only if it exists (that's the case of pressing 2 buttons in a row - without activate)
								this.static.clickHandlerArr[this.static.lastActive].remove();
							console.log("---moveResizeArea.deactivatePrevious 1");

							this.static.currentArr[this.static.lastActive].active=false;//sets the active status of previous element to false 
							if(this.static.objMoveArr[this.static.lastActive])//destroy only if it exists (that's the case of pressing 2 buttons in a row - without activate)
								this.static.objMoveArr[this.static.lastActive].destroy();//no movement for previous element
							if(this.static.objResizeWidgetArr[this.static.lastActive]){//destroy only if it exists (that's the case of pressing 2 buttons in a row - without activate)
								this.static.objResizeWidgetArr[this.static.lastActive].clearResizeHandles();
							};
						};
						console.log("---moveResizeArea.deactivatePrevious 2");
						this.static.lastActive=this.current.order;// para avisar a  próxima instância
						console.log("---moveResizeArea.deactivatePrevious 3");

					},	
					activate:function(){//rule:whenever one element gets activated ->previous is desactivated
										//to activate is 1)to prepare for move and resize 2)to update visual clues
										//activate is only called by an external call (mouseenter) - it can be called multiple times
										
						// user has handles but wants:
						//    1 - to move the avatar - she does click ->cursor moves to "move" and she can move freely
						//	  2 - to resize the avatar - she rezises the number of times she wants (one "onResizeComplete" event per resize) 
						//                               at the ent of resizes she clicks inside to move or outside to finish
						//  activate prepares:
						//         afterResizeEnd() - at the end of resize
						//  1 (click)=>thiz.afterClick() =>move preparation=>afterMoving()
						console.log("->resizeMoveArea ACTIVATE de order="+this.current.order+" id="+this.moveResizeDivId+" e de "+this.avatarId+" o ultimo activo foi="+this.static.lastActive+" activo="+this.static.currentArr[this.current.order].active);
						//DomStyle.set(this.avatarId,"cursor", "text"); 
						DomStyle.set(this.avatarId,"cursor", "move"); 
						if(!this.static.currentArr[this.current.order].active){//only acts if not active
						//	console.log("---resizeMoveArea.activate vai chamar deactivatePrevious");
						//	this.deactivatePrevious();//whenever one element gets activated ->previous is desactivated
							console.log("---resizeMoveArea.activate ENTROU EM: if not active");
							//---------- Regista o evento para saida (click sobre o element) ------------
							var thiz=this;
							//clickHandler is used to terminate moveResize 
/*
							var clickHandler=On.pausable(dojo.byId(this.moveResizeDivId), "click", function(evt){ //ao passar de dojo.connect para on não esquecer que "onmouseenter" passa a "mouseenter"
								console.log("---resizeMoveArea. 1-CLICK INSIDE  label="+thiz.current.label+" order="+thiz.current.order+" id="+thiz.moveResizeDivId);
								alert("CLICK !!!");
								//var node=Dom.byId(thiz.moveResizeDivId);
								//DomStyle.set(node, "cursor", "move");// o cursor passa a Move
								DomStyle.set(thiz.avatarId,"cursor", "move"); 
								thiz.ready2Move(); 
							});
						
							this.static.clickHandlerArr[this.current.order]=clickHandler;
*/								
							//----------------------------------------------------------------------------
							this.static.currentArr[this.current.order].active=true;
							DomStyle.set(this.avatarId,"border",this.current.borderThickness+"px dotted "+this.current.activeColor);
							var thiz=this;
							objResizeWidget=new ResizeWidget({"targetNode":this.moveResizeDivId,"targetType":"textArea"});
							dojo.connect(objResizeWidget, "onResizeComplete", function() {
								//este é o slot para fazer algo após uma action de resize (sem ser a final...)... Por exemplo adaptar a figura ao estado corrente dos handles...
								this.newBox = DomGeom.getMarginBox(dojo.byId(thiz.moveResizeDivId));
								console.log("@@resizeMoveArea 2   onResizeComplete new handles position  left="+this.newBox.l+" top="+this.newBox.t+" width="+this.newBox.w+" height="+this.newBox.h);
								//alert("@@resizeMoveArea.afterMoving   onResizeComplete new handles position  left="+this.newBox.l+" top="+this.newBox.t+" width="+this.newBox.w+" height="+this.newBox.h);
								//o conteudo vai adaptar-se à nova posição dos handles
							//alert("var de avatar="+thiz.avatarId);
								DomStyle.set(thiz.avatarId,"width",(this.newBox.w-0)+"px");
								DomStyle.set(thiz.avatarId,"height",(this.newBox.h-0)+"px");
							});//onResizeComplete event without hitch
							objResizeWidget.setEndResize(Lang.hitch(this,function(){
								//houve click fora dos handles dentro de objResizeWidget
								//this.newBox = DomGeom.getMarginBox(dojo.byId(this.avatarId));
								this.newBox = DomGeom.position(dojo.byId(this.avatarId));
								console.log("-->resizeMoveArea AFTER RESIZE END handles position  left="+this.newBox.x+" top="+this.newBox.y+" width="+this.newBox.w+" height="+this.newBox.h);
								var inside=false;
								if((objResizeWidget.lastX>=this.newBox.x) && (objResizeWidget.lastX<=this.newBox.x+this.newBox.w) && (objResizeWidget.lastY>=this.newBox.y) && (objResizeWidget.lastY<=this.newBox.y+this.newBox.h))
									inside=true;
								console.log("-->cursorX="+objResizeWidget.lastX+">="+this.newBox.x+"<="+(this.newBox.x+this.newBox.w)+" cursorY="+objResizeWidget.lastY+">="+this.newBox.y+"<="+(this.newBox.y+this.newBox.h))
								console.log("AFTER RESIZE END inside="+inside);
								//alert("AFTER RESIZE END inside="+inside);
								//se o click for dentro do elemento =>move, se o click for fora =>fim
								if(inside){ //the up click was inside the element
									console.log("--->resizeMoveArea.activate callback de objResizeWidget.setEndResize CLICK INSIDE vai para ...afterMoving");
									this.afterMoving();
								}else{
									alert("CLICK OUTSIDE - ENVIA PARA afterResizeEnd ->vai emitir evento de saida...");
									thiz.afterResizeEnd();//a transformar num evento
								};
							}));	
							this.static.objResizeWidgetArr[this.current.order]=objResizeWidget; //(necessary to clear handles if calling mouseenter leaves handles on screen)
						};
						this.ready2Move();
					},
					ready2Move:function(){//this code prepares the element move
						console.log("-->resizeMoveArea.READY2MOVE - cursor move  -> vai sair com "+this.static.lastActive);	
						//alert("yyyyyyyyyyyy---------------> afterClick - se fizer click prepara move "+this.static.lastActive+"<--------------");	
						this.position = DomGeom.position(this.moveResizeDivId,true);//o arg é o id não o node. use true to get the x/y relative to the document root
						//* -- move preparation
						this.oExchanger=new Exchanger(); //A SINGLETON necessary to return control to this code when mouse up is done				
						var thiz=this;
						this.oExchanger.setOrder(this.current.order);//selecciona a instância a devolver dentro de moveCanvas com mouse up 	
						console.log("-->moveResizeArea.READY2MOVE ------->POE MOVE POINTER PARA "+this.current.order);
						this.oExchanger.setPointer(function(){					
							thiz.afterMoving();//this code runs when onMouseUp event is triggered in mover class
						/*	
							console.log("VOLTA A ACTIVATE");
							//DomStyle.set(thiz.avatarId,"cursor", "text"); 
							alert("MOUSE UP IN MOVER CLASS - é preciso actualizar resizeWidget sobre as novas coordenadas...");
							thiz.activate();//this code runs when onMouseUp event is triggered in mover class:moveCanvas
						*/
						},this.current.order);//does setPointer to the exchanger slot this.current.order (2nd param of setPointer())	
						//if(!this.moveable){ //work-around to prevent double call to moveable - case of 2 buttons in a row returning to first one
							//alert("VAI CRIAR MOVEABLE");
				///*	
						console.log("-->moveResizeArea.READY2MOVE ------->vai criar objMove");
						this.objMove = new Moveable(this.element,{// o HTML element passa a mover-se. a classe moveable vai alterar a sua style property indicando as posições...
							delay:5, //moveable only triggers after a drag of 5 pixels
							mover:moveCanvas //Moveable instanciates moveCanvas when we click on element
						});
				//*/	
						console.log("-->moveResizeArea.READY2MOVE ------->criou objMove");
						this.moveable=true;//work-around to prevent double call to moveable - case of 2 buttons in a row returning to first one
						//};
						this.static.objMoveArr[this.current.order]=this.objMove;
						console.log("-->moveResizeArea.READY2MOVE ------->fim de READY2MOVE");

						//*/
					},					
					afterMoving:function(){//this code runs when onMouseUp event is triggered in mover class
					    console.log("-->resizeMoveArea.afterMoving INICIO com "+this.current.order+" label="+this.current.label+" id="+this.moveResizeDivId);
						//this.clickHandler.pause();//para não interferir em resize
									
								/*	if(this.objMove){
										this.objMove.destroy();
										alert("resizeMoveArea objResizeWidget.setEndResize Destruiu moveable")
									};  */
						
						this.moveable=false;//moveable is done (work-around to prevent double call to moveable)
						this.objMove.destroy();
						this.static.currentArr[this.current.order].active=false; //to allow mouseenter trigger to hook on activate()
						if(this.objResizeWidget){
							console.log("resizeMoveArea.afterMoving - vai destruir this.objResizeWidget");
							this.objResizeWidget.destroy();
							alert("resizeMoveArea.afterMoving - destruiu this.objResizeWidget");
						};
						alert("resizeMoveArea.afterMoving -VOLTOU DE MOVE - JÁ DESTRUIU O OBJMOVE e this.objResizeWidget E VAI LANÇAR ACTIVATE()");
						this.activate();
					/*
						this.static.clickHandlerArr[this.current.order].pause();
						//this.objMove.destroy();
						if(this.static.objMoveArr[this.current.order])//destroy only if it exists (that's the case of pressing 2 buttons in a row - without activate)
							this.static.objMoveArr[this.current.order].destroy();
						//agora fazemos resize
						// o param targetNode é o id do node que está no dom e em relação ao qual queremos colocar handles	
						var thiz=this;
						var objResizeWidget=new ResizeWidget({"targetNode":this.moveResizeDivId,"targetType":"textArea"});
						dojo.connect(objResizeWidget, "onResizeComplete", function() {
							//este é o slot para fazer algo após uma action de resize (sem ser a final...)... Por exemplo adaptar a figura ao estado corrente dos handles...
							this.newBox = DomGeom.getMarginBox(dojo.byId(thiz.moveResizeDivId));
							alert("resizeMove STOP 1");
							console.log("---moveResizeArea.afterResize   onResizeComplete new handles position  left="+this.newBox.l+" top="+this.newBox.t+" width="+this.newBox.w+" height="+this.newBox.h);
							//o conteudo vai adaptar-se à nova posição dos handles
						//alert("var de avatar="+thiz.avatarId);
							DomStyle.set(thiz.avatarId,"width",(this.newBox.w-0)+"px");
							DomStyle.set(thiz.avatarId,"height",(this.newBox.h-0)+"px");
						});//onResizeComplete event without hitch
						//alert("---moveResizeArea.afterMoving 1-CHEGOU AQUI !!!");

						//console.log("---moveResizeArea.afterMoving antes da callback definition para move resize="+thiz.current.order+" com label="+thiz.current.label+" order="+thiz.current.order+" id="+thiz.moveResizeDivId);
						objResizeWidget.setEndResize(Lang.hitch(this,function(){
							//console.log("moveResize.afterMoving vai fazer setEndResize para a instancia="+thiz.current.order+" com label="+thiz.current.label+" order="+thiz.current.order+" id="+thiz.moveResizeDivId);
							//alert("------------------------------ setEndResize acabou resizes: vai fazer setEndResize -----------------------------");
							thiz.afterResizeEnd();//a transformar num evento
						}));	
						this.static.objResizeWidgetArr[this.current.order]=objResizeWidget; //(necessary to clear handles if calling mouseenter leaves handles on screen)
					*/	
					},
					afterResizeEnd:function(){//this code runs when onMouseUp event is triggered in resize class and moveResize
						console.log(" ResizeMoveArea. 2 AFTER RESIZE END !!! ----------------------------------------------");
					//this.static.clickHandlerArr[this.current.order].resume();//volta a colocar o clickHandler activo para poder terminar moveResize
						this.static.currentArr[this.current.order].active=false; //to allow mouseenter trigger to hook on activate()
						//alert("FIM - VAI SAIR");
						this.oExchanger.setPointer(function(){});
						if(this.objMove){
							this.objMove.destroy();
							alert("resizeMoveArea.afterResizeEnd Destruiu moveable")
						};
						console.log("vai sair emitindo 	resizeMoveEnd");			
						this.emit("resizeMoveEnd",{});//- new on/event system - deselect on unMark all
						console.log("vai sair e já emitiu resizeMoveEnd");				
						this.destroy;
					},	

				});//end of classe moveResizeArea
			}//call back function
		); //end of define for module moveResizeArea
