		define([ "Mother1/exchanger2.js",
				 "Mother1/resizeWidget2.js",
				 "Mother1/moveCanvas2.js",
				 "dojo/_base/declare",	 
				 "dojo/on",
				 "dojo/Evented",  
				 "dojo/dnd/Moveable",
				 "dojo/dnd/Mover",	
				 "dojo/dom-geometry",
				 "dojo/dom-construct",
				 "dojo/dom-style",	
				 "dojo/_base/lang",						 
				 "dojo/domReady!"], //só consome
			function(Exchanger,ResizeWidget,MoveCanvas,Declare,On,Evented,Moveable,Mover,DomGeom,DomConstruct,DomStyle,Lang){ 
				return Declare("moveResizeArea", [Evented],{
					// this class instanciate an avatar that the user can move and resize to define specific areas
					// Use:  1- creating the object: var x2=new moveResizeArea(" Forms Area",200,300,100,50,3,"crimson","red");//
					//														 label to appear
					//																	|left,top
					//																			|width,height
					//																					|border thickness
					//																						| active (dotted color)
					//																								|passive (solid) color
					//								active color signals to the user that the area is yet moveable and resizeable
					//								passive color signals to the user that the area is already defined (process is finished) cannot move or resize
					//
					//       
					//	  : 2- define an event for mouseenter to activate moveResizeArea when user enters the area
					//			On.once(dojo.byId(x2.moveResizeDivId), "mouseenter", function(evt){
					//				x2.activate();
					//			}); 
					//
					//    : 3- moveResizeArea emits the "move_resize_end" event when the user clicks inside the area to signal that she has finished the area definition
					//			x2.on("move_resize_end", function(){
					//				alert("O evento mov_resize_end foi activado para x2 red");
					//			});		
					//
					//
					// ---------------------create and move avatar-------------------------------------------
					// A classe moveable cria um div como parent do div que queremos ver mover....
					// a classe resizeWidget coloca os handles como child nodes do node targetNode (inicialmente é um targetId...)
					// faz  dotted line com active color enquanto a possibilidade de move resize estiver activa, faz solid line com passive color qdo terminar
					static:{
						moveResizeCount:-1,
						currentArr:[],//ainda por usar
						activeArr:[],//ainda por usar
					},//static variable with all the instances to prevent DOM conflicts
					moveResizeDivId:null,
					avatarId:null,
					current:{},
					element:null,
					visibleElement:null,
					objMove:null,//moveable object
					oExchanger:null,//exchanger object
					clickHandler:null,//handler of click event - the way out event
					active:false,//property true/false to validate from outside if area is active (has dotted line)
					//enterHandler:null,//this event is necessary to send mover (thru oExchanger.setOrder() ) an indication of the callback instance that
									  // should be called  when mouse up is done
									  //whenever the user enters a moveResize element mouseenter sets oExchanger.setOrder() to the order (0...4) of the element
					constructor:function(xLabel,landingLeft,landingTop,landingWidth,landingHeight,xBorderThickness,xActiveColor,xPassiveColor){
						this.element = DomConstruct.create("div"); //cria HTML div - 
						this.static.moveResizeCount+=1; //to prevent DOM conflicts in id="_moveResizeDiv" and id="avatarId"
						this.moveResizeDivId="_moveResizeDiv"+this.static.moveResizeCount;
						this.avatarId="_avatarId"+this.static.moveResizeCount;
						this.current={label:xLabel,order:this.static.moveResizeCount,l:landingLeft,t:landingTop,w:landingWidth,h:landingHeight,borderThickness:xBorderThickness,activeColor:xActiveColor,passiveColor:xPassiveColor};
						this.element.innerHTML=this.makeDivId(this.moveResizeDivId,this.current.l,this.current.t,this.current.w,this.current.h,this.current.borderThickness,null);
						dojo.body().appendChild(this.element); 
						this.visibleElement = DomConstruct.create("div"); //cria outro HTML div 
						//visibleElement.innerHTML="<textArea id='avatarId'>Menu Area</textarea>"; //este é o que se vai ver...
						this.visibleElement.innerHTML=this.getInnerHTML("textBox",this.avatarId,this.current.label,this.current.w,this.current.h,this.current.borderThickness,"dotted",this.current.activeColor); //este é o que se vai ver...
						dojo.byId(this.moveResizeDivId).appendChild(this.visibleElement); //textarea will be child of inner element instead of child of element (element.appendChild(visibleElement))

						var thiz=this;
						//clickHandler is used to terminate moveResize 
						this.clickHandler=On.pausable(dojo.byId(this.moveResizeDivId), "click", function(evt){ //ao passar de dojo.connect para on não esquecer que "onmouseenter" passa a "mouseenter"
							console.log("---moveResizeArea.constructor Click inside area (to finish) label="+thiz.current.label+" order="+thiz.current.order+" id="+thiz.moveResizeDivId);
							thiz.afterMoveResize(); 
						}); 
                        //whenever the user enters a moveResize element mouseenter sets oExchanger.setOrder() to the order (0...4) of the element
						// order in oExchanger is necessary to get the callback function corresponding to the "entered" element
					},
					activate:function(){
						//alert("activate de order="+this.current.order+" id="+this.moveResizeDivId+" e de "+this.avatarId);
						//only one area can be active at a time - it is necessary to desactivate any other area
						this.active=true;
						DomStyle.set(this.avatarId,"border",this.current.borderThickness+"px dotted "+this.current.activeColor);
						this.oExchanger=new Exchanger(); //A SINGLETON necessary to return control to this code when mouse up is done				
						var thiz=this;
						this.oExchanger.setOrder(this.static.moveResizeCount);//selecciona a instância a devolver dentro de moveCanvas com mouse up 				
						this.oExchanger.setPointer(function(){					
							thiz.afterMoving();//this code runs when onMouseUp event is triggered in mover class
						},this.static.moveResizeCount);//does setPointer to the exchanger slot this.static.moveResizeCount (2nd param of setPointer())	
						//});
						this.objMove = new Moveable(this.element,{// o HTML element passa a mover-se. a classe moveable vai alterar a sua style property indicando as posições...
							delay:5, //moveable only triggers after a drag of 5 pixels
							mover:moveCanvas //Moveable instanciates moveCanvas when we click on element
						});
					},
					afterMoving:function(){//this code runs when onMouseUp event is triggered in mover class
						//console.log("---moveResizeArea.afterMoving INICIO com "+this.current.order+" label="+this.current.label+" id="+this.moveResizeDivId);
					//alert("Order="+this.current.order+" moveResize.afterMoving ENTRADA depois de Mouse UP em mover !!!");
						this.clickHandler.pause();//para não interferir em resize
						//this.enterHandler.pause();//para não interferir em resize
						this.objMove.destroy();
						//agora fazemos resize
						// o param targetNode é o id do node que está no dom e em relação ao qual queremos colocar handles	
						var thiz=this;
						var objResizeWidget=new ResizeWidget({"targetNode":this.moveResizeDivId,"targetType":"textArea"});
						dojo.connect(objResizeWidget, "onResizeComplete", function() {
							//este é o slot para fazer algo após uma action de resize (sem ser a final...)... Por exemplo adaptar a figura ao estado corrente dos handles...
							var newBox = DomGeom.getMarginBox(dojo.byId(thiz.moveResizeDivId));
							console.log("---moveResizeArea.afterMoving   onResizeComplete new handles position  left="+newBox.l+" top="+newBox.t+" width="+newBox.w+" height="+newBox.h);
							//o conteudo vai adaptar-se à nova posição dos handles
						//alert("var de avatar="+thiz.avatarId);
							DomStyle.set(thiz.avatarId,"width",(newBox.w-0)+"px");
							DomStyle.set(thiz.avatarId,"height",(newBox.h-0)+"px");
						});//onResizeComplete event without hitch
						//console.log("---moveResizeArea.afterMoving antes da callback definition para move resize="+thiz.current.order+" com label="+thiz.current.label+" order="+thiz.current.order+" id="+thiz.moveResizeDivId);
						objResizeWidget.setEndResize(Lang.hitch(this,function(){
							//console.log("moveResize.afterMoving vai fazer setEndResize para a instancia="+thiz.current.order+" com label="+thiz.current.label+" order="+thiz.current.order+" id="+thiz.moveResizeDivId);
							//alert("moveResize afterMoving vai fazer setEndResize");
							thiz.afterResizeEnd();//a transformar num evento
						}));	
						//alert("fim de afterMoving");
						// --END OF RESIZE -------					
					},
					afterResizeEnd:function(){//this code runs when onMouseUp event is triggered in resize class and moveResize
						//alert("moveResize After afterResizeEnd !!!");
						this.clickHandler.resume();//volta a colocar o clickHandler activo para poder terminar moveResize
						this.activate();
					},	
					afterMoveResize:function(){//this code runs when onMouseUp event is triggered in resize class and moveResize
						//alert("moveResize afterMoveResize VAI EMITIR EVENTO DE SAIDA !!!");
						// EMISSOR - precisa de  "dojo/Evented",  	
						// Para o novo sistem de on/eventos>1.7: do lado do emissor faz-se this.emit("selectwidget",{}); //second parameter is a set of event properties 
						//																   this.emit("resize_end",{});																
						// NAO ESQUECER: a classe emissora tem de ser derivada de Evented...	Declare("editViewPort",[Evented], {
						//																		Declare("moveResize", [Evented],{
						//
						// RECEPTOR - precisa de 
						// do lado do listener faz-se vPort.on("selectwidget", function(){....this will be called when "ready" event is emitted...});
						//							  x1.on("resize_end", function(){
						// NOTA: este "on" não é o alias de dojo/on (por ex. On) é de Evented...- codificar  "on" com minusculas
						//	
						//this.destroy();	
						this.clickHandler.remove();
						this.objMove.destroy();
						DomStyle.set(this.avatarId,"border",this.current.borderThickness+"px solid "+this.current.passiveColor);
						this.active=false;
						this.emit("move_resize_end",{});//- new on/event system - whenever one widget is clicked the event signal is emitted
					},
					//------------  auxiliary functions to remove to a global.js module
					makeDivId:function(xId,xLeft,xTop,xWidth,xHeight,xBorderThickness,xColor){//div features
					//-------------------------------------------------------------------------------------------
						//use el.innerHTML=makeDivId(x.id,x.initialLeft,x.initialTop,x.initialWidth,x.initialHeight,3,null); //last is color - null, "blue", "red", "green"
						var xInner="<div id='"+xId+"' style='position: absolute; top:"+xTop+"px; left:"+xLeft+"px; height:"+xHeight+"px; width:"+xWidth+"px;";
						if(xColor)
							xInner+=" border:"+xBorderThickness+"px solid "+xColor+";'>";
						else{
							xInner+="'>";
						}
						return xInner+"</div>";
					},
					//-------------------------------------------------------------------------------------------
					getInnerHTML:function(xType,xId,xText,xWidth,xHeight,xBorderThickness,xBorderType,xColor){//type of field,width,height,
					//-------------------------------------------------------------------------------------------
						// xType - element type : textBox,label,numberBox,textArea,checkBox,dateTextBox,button,comboBox,grid
						// xId - Id of HTML element to form
						// xtext - text of element
						// xWidth,xHeight
						// xBorderThickness - thickness of border line
						// xBorderType - type of border line : solid, dotted, dashed
						// xColor - color of border line
						var xInner="";
						//console.log("getInnerHTML com xType="+xType);
						//var xStyle="position: absolute; top: 0px; left: 0px; height: "+xHeight+"px; width: "+xWidth+"px;";
						var xStyle="position: absolute; height: "+xHeight+"px; width: "+xWidth+"px;";
						if(xColor)
							xStyle+=" border:"+xBorderThickness+"px "+xBorderType+" "+xColor+";";
						//console.log("getInnerHTML with "+xType);
						switch(xType){
							case "textBox":xInner="<input id='"+xId+"' class='avatar' type='text' name='textBox' value='"+xText+"' style='"+xStyle+"'>";
								break;
							case "label":xInner="<input id='"+xId+"' class='avatar' type='text' name='label' value='"+xText+"' style='"+xStyle+"'>";
								break;
							case "numberBox":xInner="<input id='"+xId+"' class='avatar' type='text' name='numberBox' value='"+xText+"' style='"+xStyle+"'>";
								break;			
							case "textArea":xInner="<textarea id='"+xId+"' class='avatar' style='"+xStyle+"'>"+xText+"</textarea>";
								break;			
							case "checkBox":xInner="<input id='"+xId+"' class='avatar' type='checkbox' class='bigcheck'>";
								break;			
							case "dateTextBox":xInner="<select id='"+xId+"' class='avatar' style='"+xStyle+"'><option value='dateBox'>"+xText+"</option></select>";
								break;
							case "button":xInner="<button id='"+xId+"' class='avatar' style='"+xStyle+"'>"+xText+"</button>";
								break;	
							case "comboBox":xInner="<select id='"+xId+"' class='avatar' style='"+xStyle+"'><option value='comboBox'>"+xText+"</option></select>";
								break;	
							case "grid"://uma grid tem pelo menos 2 colunas e 2 linhas - recusa menos que isso
									//3 escaloes para largura 1,2, ou 3 colunas
									// trata a largura
									//grid_td_HTML("Item",2,2);
									var xHeader="Col";
									var xItem="Item";
									if(xWidth<=90){
											xCols=2;
											xHeader="C";
											xItem="";
									}else if(xWidth<=180){
											xCols=2;
											xItem="";
									}else{
										xCols=2+(xWidth-130)/150; //assume 100 px de largura por coluna
									}
									//trata a altura
									if(xHeight<=80){
										xRows=1;
										xItem="";
									}else{
										xRows=1+(xHeight-80)/25; //assume 25 pix de altura por row
									}
									xInner="<table class='avatar' width='100%' border='1'>"+grid_th_HTML(xHeader,xCols)+grid_td_HTML(xItem,xRows,xCols)+"</table>";;
								break;
							case "tabs":xInner="<div class='avatarTab' id='tabheader' type='tab'>"+	//width 300 height 60
												"<ul><li><a href='#'>Tab 1</a></li>"+
													"<li id='selected'><a href='#'>Tab 2</a></li>"+
													"<li><a href='#'>Tab 3</a></li>"+
													"<li><a href='#'>Tab 4</a></li></ul>"+ 
												"</div>"+
												"</div><div class='avatarTab' id='content'><p>* * *</p></div>";
								break;	
							default: alert("getInnerHTML: the type "+xType+" is unknown");	
						}		
						return xInner;
					},
					//-------------------------------------------------------------------------------------------
					 grid_th_HTML:function(xContent,xCols){//makes <th>  </th> with inside content =xContent for xCol columns
					//-------------------------------------------------------------------------------------------	
						var xRet="<tr>";
						for(var i=0;i<xCols;i++){
							xRet=xRet+"<th>"+xContent+" "+(i+1)+"</th>"
						}
						//console.log("grid_th_HTML produziu:"+xRet+"</tr>");
						return xRet+"</tr>";
					},			
					//-------------------------------------------------------------------------------------------
					grid_td_HTML:function(xContent,xRows,xCols){//makes <tr>  </th> with inside content =xContent for xCol,xRows 
					//-------------------------------------------------------------------------------------------	
						//console.log("grid_td_HTML inicio para linhas="+xRows);
						var xRet="";
						for(var i=0;i<xRows;i++){//linhas
							xRet=xRet+"<tr>";
							for(var j=0;j<xCols;j++){//colunas
								xRet=xRet+"<td>"+xContent+" "+(i+1)+","+(j+1)+"</td>"
							}
							xRet=xRet+"</tr>";
						}
						//console.log("grid_td_HTML produziu:"+xRet);
						return xRet;
					}			
				});//end of classe moveResizeArea
			}//call back function
		); //end of define for module moveResizeArea
