		define(["dojo",
				 "dojo/_base/declare",
				"dojo/_base/window",			 
				 "dojo/_base/lang",
				 "dojo/_base/array",
				 "dojo/on",
				 "dojo/query",
				 "dojo/dom-style",
 				 "dojo/dom-geometry",
				 "dojo/dom-construct",				 
				 "dojo/dom-class",
				 "dojo/dom",
				 "dijit/_WidgetBase"],
		//function(dojo,fBuilder,Declare,Evented,Stateful,Lang,win,Event,domAttr,on,mouse,Ready,query,domClass,domStyle,domGeom,domConstruct,registry,BorderContainer,ContentPane,Dom,DomConstruct,
		function(dojo,Declare,Win,Lang,Array,on,Query,DomStyle,DomGeom,DomConstruct,DomClass,Dom,Widget){
			return Declare("resizeWidget", Widget, {
				// ex: 		var objToSize=new ResizeWidget({"targetNode":"resizeIdx","targetType":"zzz"});
				//	par1 - targetNode:the node that resizeWidget will use to position the handles
				//	par2 - dummy
				//  Properties:
				//		exitNormally - normally true. It will be false if the instance terminate with a mouseup over a scrollbar
				//		setEndResize: call back function that will run when the user clicked outside an handle
				//		targetIL: Initial Left
				//		targetIT: Initial Top
				//		targetIW: Initial Width
				//		targetIH: Initial Height
				//		targetL: current (and final)  Left
				//		targetT: current (and final)  Top
				//		targetW: current (and final)  Width
				//		targetH: current (and final)  Height
				//
				//  Methods:
				//		clearResizeHandles():if the programmers wants to clear the handles inside the "onResizeComplete" event
				//	Events:
				//      onResizeComplete - called after each resize handle cycle
				// Ex:
				// creating the targetNode:
				//	var xResize=DomConstruct.create("div"); //it should be defined outside Ready() in order to be destroyed afterEnd 
				//	xResize.innerHTML=util.makeHTML("div","resizeIdx","A","ResizeWidget Test",xLeft,xTop,xWidth,xHeight,xResizeBorderThickness,"solid","gold");		
				//	Win.body().appendChild(xResize); 	
				//				
				// if the programmer wants to update the inside contents after each handle's resize she should use an avatar inside the "onResizeComplete" event
				// Ex:
				// 1) create the avatar in the DOM -this should be created BEFORE creating the targetNode (to assure that the handles will be upfront)
				// 		var xAvatar=DomConstruct.create("div"); 
				//  	xAvatar.innerHTML=util.makeHTML("textBox","xAvatarId","A","ResizeWidget Test",xLeft+xInsideAvatarAdjust,xTop+xInsideAvatarAdjust,xWidth-xInsideAvatarAdjust,xHeight-xInsideAvatarAdjust,null,null,null);		
				//  	Win.body().appendChild(xAvatar); 
				//
				// 2) call resizeWidget inside Ready() and create the onResizeComplete event and the exit way
				//		Ready(function(){
				//			var objToSize=new ResizeWidget({"targetNode":"resizeIdx","targetType":"zzz"});
				//			dojo.connect(objToSize, "onResizeComplete", function() {//this is the slot to any intermediate adjustment to the image of the element being resized...
				//				//adjust the avatar: DomStyle.set("xAvatarId", "left", this.targetL+xInsideAvatarAdjust);//do the same for "top","width" and "height"
				//			});
				//			objToSize.setEndResize(function(){//the exit way
				//				afterEnd();//defined inside programmer's code
				//			});	
				//		});	
				//
				//The programmer shoulds use a callback function to End Resize (setEndResize)
				//   EndResize is called when the users clicks Up outside an handle
				// 		the programmer  can intercept each onResizeComplete connecting an event to this function
				//Use:
				//   var objResizeWidget=new ResizeWidget({"targetNode":this.moveResizeDivId,"targetType":"textArea"});
			    //														|the Id or node of an HTML object with the dimensions we want for resize andles
				//																			|not important
				//   ATENTION - the node targetNode (or the Id) must be IN THE DOM !!!otherwise you will get :node is null		
				//   The handles will stick around the HTML object defined has param 1	
				//	
				//	 resizeWidget Objects comunicate with its caller in two diferent cycles:
				//		cycle:1 - When the user does mouse up after risizing one of the 8 avalilable handles
				//			in order to intercept the code the caller uses the "onResizeComplete" event.
				//		cycle:2 - When the user clicks outside an handle - indication to finish the resize operation
				//			in order to intercept the code the caller uses the "setEndResize" property to define a callback function
				//   In both cycles the programmer can collect the  state of the handles with this.targetL,this.targetT,this.targetW,this.targetH
				//
				// If the programmer wants to adjust the object being resized she should use "onResizeComplete"
				//		to do this the programmer needs to create an avatar in the DOM that will be placed inside (visually) targetNode 
				//	    the target node should be constructed after the avatar so that handles will be in the forefront
				//		inside the "onResizeComplete" the avatar should be adjusted 

				//
				// If the programmer wants a single cycle (only once) she should clearResizeHandles in the call back and destroy the object 
				//    Remember that in this case when the users click outside handles "setEndResize"  will be called, therefore should be defined
				// Ex:
				//  	dojo.connect(objToSize, "onResizeComplete", function() {
				//			alert("The new value for height: height="+this.targetH);
				//			chooseSetStyleProp(xZone,"height",this.targetH);// doing something before finhing the process in cycle 1
				//			this.destroy();
				//			DomConstruct.destroy("xAvatarId");//destroy visble node keeping its invisible root 
				//		});

				
				targetNode: null,
				targetId: null,
				targetIL:null,//Initial dimensions
				targetIT:null,
				targetIW:null,
				targetIH:null,
				targetL:null,//final dimensions
				targetT:null,
				targetW:null,
				targetH:null,
				targetType:null,
				upHandler:null,
				moveHandler:null,
				endCallback:null,//the address of callback function. It is set by method setEndResize
				exitNormally:true,
				squareBorderSize:null,
				squareSize:null,
				squareSizeHalf:null,
				squareSizePx:null,
				squareSizeHalfPx:null,
				squareSizeHalfNegPx:null,
				
				firstMouseUp:true,
				positions:[],//array with 8 positions NW,NE,SE,SW,N,S,W,E used in create handles and clear handles - it will be defined in constructor to avoid static effect 
				constructor:function(args){
					//mixes the passed argument into "this"
					//alert("Em resizeWidget 1 ");
					dojo.safeMixin(this, args);//args vem na forma {"targetNode": "target"} e monta logo this.targetNode="target"
					//alert("Em resizeWidget 1.5 com par1="+this.targetNode+" par2="+this.targetType);
					var xNode=Dom.byId(this.targetNode); //if this.targetNode is already a node dojo.byId will be a NOP, 
					//										if it is an id node will be node, if not in the DOM node will be null
					if(xNode){
						this.targetId=this.targetNode; //to preserve the input format...if input is string
						//alert("NodeId="+this.targetId+" Left="+DomStyle.get(this.targetId, "left")+" Top="+DomStyle.get(this.targetId, "top"));

						this.targetNode = xNode; //deixa de ser um Id e passa a ser um node 
						
					}else{
						alert("resizeWidget.constructor - Error: targetNode "+this.targetNode+" is not in the DOM."); 
					};					
					var coords = dojo.coords(dojo.byId(this.targetNode)); //targetNode tem a string que foi passada na construção ex"avatarId"
					//alert("Em resizeWidget 1.6 com par1="+this.targetNode+" par2="+this.targetType);
					this.targetIL=coords.l;
					this.targetL=coords.l;
					this.targetIT=coords.t;
					this.targetT=coords.t;
					this.targetIW=coords.w;
					this.targetW=coords.w;
					this.targetIH=coords.h;
					this.targetH=coords.h;
				console.log("--- ---resizeWidget.constructor L,T,W,H = "+this.targetL+","+this.targetT+","+this.targetW+","+this.targetH);
				//alert("Em resizeWidget 2");
					//this.targetId=this.targetNode; //to preserve the input format...
					
					this.squareBorderSize = 1;//BorderThikness
					this.squareSize = 6; //px
					this.squareSizeHalf = (this.squareSize / 2) + this.squareBorderSize;
					this.squareSizePx = this.squareSize + "px";
					this.squareSizeHalfPx = this.squareSizeHalf + "px";
					this.squareSizeHalfNegPx = "-" + this.squareSizeHalf + "px";//metade do square size , negativado e com+"px"
					
					this.positions=[]; //to avoid sharing of array between diferent instances 
				},
				postCreate: function() {
					if (dojo.isString(this.targetNode)) {
						this.targetNode = Dom.byId(this.targetNode); //deixa de ser um Id e passa a ser um node 
					}
					this.upHandler=this.connect(dojo.doc, "onmouseup", dojo.hitch(this, "_onMouseUp"));
					this.moveHandler=this.connect(dojo.doc,"onmousemove", dojo.hitch(this, "_onMouseMove"));

					/* //---- a retirar ---------------------------
					console.log("--------- INSIDE resizeWidget.postCreate --------------------- para "+this.targetId+" type="+this.targetType+" left="+this.targetIL+" top="+this.targetIT);//preservado no constructor
					var coords = dojo.coords(this.targetNode);//left,top are node offset from parent - x,y are absolute values 
					console.log(" left="+coords.l+", top="+coords.t+", w="+coords.w+", h="+coords.h+", x="+coords.x+", y="+coords.y);	
					console.log("resizeWidget class ->vai fazer this.createResizeHandles()");
					*/ // ---------------------------------------------
					
					this.createResizeHandles();
				},
				setEndResize:function(callback){
					this.endCallback=callback;
					//this.callTest();
				},
				_mouseDown: false,
				_lastDirection: "",
				_lastMarginBox: {
					l: 0,
					t: 0,
					w: 0,
					h: 0
				},
				_lastPosition: {
					x: 0,
					y: 0,
					w: 0,
					h: 0
				},
				_lastGrab: {
					x: 0,
					y: 0
				},
				onResizeComplete: function(marginBox) {
					//connect here
					//alert("resizeWidget.onResizeComplete faz destroy aqui !!!")
					//console.log("--- --- resizeWidget.onResizeComplete ENTROU ...");
					var coords = dojo.coords(dojo.byId(this.targetNode));//this refere-se a moveResize
					this.targetL=coords.l;
					this.targetT=coords.t;
					this.targetW=coords.w;
					this.targetH=coords.h;
				//console.log("--- --- resizeWidget.onResizeComplete ...targetL="+this.targetL);
				},
				_onMouseDown: function(e) {
					// ---- JO
					var x = e.clientX; 
					var y = e.clientY; 
				//console.log("--- ---resizeWidget._onMouseDown x="+x+" y="+y);
					// ---- JO
					this._lastMarginBox = DomGeom.getMarginBox(this.targetNode);		
					this._lastPosition = DomGeom.position(this.targetNode);
					this._lastGrab = {
						x: e.clientX,
						y: e.clientY
					};

					this._mouseDown = true;
					var handle = e.target;
					var direction = dojo.attr(handle, "className");
					//N,S,W,E,NW,NE,SW,SE
					this._lastDirection = direction.substr(direction.length - 2, 3).replace("_", "");

					e.cancelBubble = true;
				},
				_onMouseUp: function(e) {
					// ---- JO
					var x = e.clientX; 
					var y = e.clientY; 
					if(x>DomStyle.get(Win.body(), "width"))
						this.exitNormally=false;
					if(y>DomStyle.get(Win.body(), "height"))
						this.exitNormally=false;
					console.log("--- --- resizeWidget._onMouseUp    -------->  x="+x+" y="+y);
					// ---- JO

					if (this._mouseDown === true) {
						this.onResizeComplete(DomGeom.getMarginBox(this.targetNode));
					}else{ //mouse up sem estar mouse down !!!
						//console.log("--- ---resizeWidget._onMouseUp MOUSE up com mouseDown=false !!!")
						//alert("resizeWidget _onMouseUp devia sair  - firstMouseUp="+this.firstMouseUp);
						
						//if(!this.firstMouseUp){
							//alert("resizeWidget _onMouseUp vai sair");
						this.clearResizeHandles();
						this.destroy();
						this.endCallback(); //the way out !!!
						//};
						//this.firstMouseUp=false;
					};
					this._mouseDown = false;
				},
				_onMouseMove: function(e) {
					 // ---- JO
					 var x = e.clientX; 
					 var y = e.clientY; 
				//console.log("Class resizeWidget _onMouseMove x="+x+" y="+y+" mouse down="+this._mouseDown);
					 // ---- JO

					 //alert("MouseMove");
					 if (this._mouseDown === true) {

						var xMin = 10;
						var yMin = 10;
						
						if (this._lastDirection.indexOf("E") != -1) this.targetNode.style.width = Math.max(xMin, this._lastMarginBox.w + e.clientX - this._lastGrab.x) + "px";

						if (this._lastDirection.indexOf("S") != -1) this.targetNode.style.height = Math.max(yMin, this._lastMarginBox.h + e.clientY - this._lastGrab.y) + "px";

						if (this._lastDirection.indexOf("W") != -1) {
							this.targetNode.style.left = Math.min(this._lastMarginBox.l + e.clientX - this._lastGrab.x, this._lastMarginBox.l + this._lastMarginBox.w - xMin) + "px";
							this.targetNode.style.width = Math.max(xMin, this._lastMarginBox.w - e.clientX + this._lastGrab.x) + "px";
						}
						if (this._lastDirection.indexOf("N") != -1) {
							this.targetNode.style.top = Math.min(this._lastMarginBox.t + e.clientY - this._lastGrab.y, this._lastMarginBox.t + this._lastMarginBox.h - yMin) + "px";
							this.targetNode.style.height = Math.max(yMin, this._lastMarginBox.h - e.clientY + this._lastGrab.y) + "px";
						}
						this.createResizeHandles();					
						dojo.stopEvent(e);
					}
				},
				createResizeHandles: function() {
					/*
					var squareBorderSize = 1;
					var squareSize = 6; //px
					var squareSizeHalf = (squareSize / 2) + squareBorderSize;
					var squareSizePx = squareSize + "px";
					var squareSizeHalfPx = squareSizeHalf + "px";
					var squareSizeHalfNegPx = "-" + squareSizeHalf + "px";//metade do square size , negativado e com+"px"
					*/
			//console.log("createResizeHandles squareSizeHalfNegPx="+this.squareSizeHalfNegPx);
			
					var square =DomConstruct.create("div", {
						"style": {
							"position": "absolute",
							"height": this.squareSizePx,
							"width": this.squareSizePx,
							"backgroundColor": "white",
							"border": this.squareBorderSize + "px solid black"
						}
					});
					this.setPositions();// to define the array of //N,S,W,E,NW,NE,SW,SE

					Array.forEach(this.positions, function(item) {
						var node = undefined;

						//if (node = dojo.query("." + "wuhiDesignerResizeSquare_" + item.direction, this.targetNode)[0]) {               
						if (node = Query(".resize_" + item.direction, this.targetNode)[0]) {
						} else {
							node = Lang.clone(square);
							DomClass.add(node, "resize_" + item.direction);//poe no CSS a classe resize_NW, resize_NE etc para poder mudar o cursor em cima do node
							DomStyle.set(node, "cursor", item.direction + "-resize");// o cursor "NW-resize" é dupla seta diagonal esq ...etc...
							DomConstruct.place(node, this.targetNode);//coloca o square no element cujo id foi o input (recordar que o id foi substituido pelo node node=dojo.byId(xId))
							this.connect(node, "onmousedown", dojo.hitch(this, "_onMouseDown"));
							//on(node, "onmousedown", dojo.hitch(this, "_onMouseDown"));
						}
						DomStyle.set(node, item.style);
					}, this);			
				},
				clearResizeHandles: function() {
					this.setPositions();// to define the array 
					Array.forEach(this.positions, function(item) {
						var class2Del=".resize_"+item.direction;// não esquecer o ponto !!!
						//console.log("------------->apaga "+class2Del);
						var nl=Query(class2Del);
						//alert("Numero elementos com "+class2Del+"="+nl.length);
						Query(class2Del).forEach(function(node){
							DomConstruct.destroy(node);
						});
						//console.log("----------------->left="+item.style.left+" - top="+item.style.top+" - right="+item.style.right+" - bottom="+item.style.bottom);
					}, this);	
				},
				setPositions: function() {
					//console.log("------------------------------------> setPositions---------------------------------------------");
					this.positions = [{
						"direction": "NW",
						"style": {
							"top": this.squareSizeHalfNegPx,
							"left": this.squareSizeHalfNegPx
						}},
					{
						"direction": "NE",
						"style": {
							"top": this.squareSizeHalfNegPx,
							"right": this.squareSizeHalfNegPx
						}},
					{
						"direction": "SE",
						"style": {
							"bottom": this.squareSizeHalfNegPx,
							"right": this.squareSizeHalfNegPx
						}},
					{
						"direction": "SW",
						"style": {
							"bottom": this.squareSizeHalfNegPx,
							"left": this.squareSizeHalfNegPx
						}},
					{
						"direction": "N",
						"style": {
							"top": this.squareSizeHalfNegPx,
							"left": ((DomGeom.getMarginBox(this.targetNode).w / 2) - this.squareSizeHalf) + "px"
						}},
					{
						"direction": "S",
						"style": {
							"bottom": this.squareSizeHalfNegPx,
							//"left": ((dojo.marginBox(this.targetNode).w / 2) - this.squareSizeHalf) + "px"
							"left": ((DomGeom.getMarginBox(this.targetNode).w / 2) - this.squareSizeHalf) + "px"
							//	var newBox = DomGeom.getMarginBox(dojo.byId("xDiv"));

						}},
					{
						"direction": "W",
						"style": {
							"left": this.squareSizeHalfNegPx,
							"top": ((DomGeom.getMarginBox(this.targetNode).h / 2)-0 - this.squareSizeHalf) + "px"
						}},
					{
						"direction": "E",
						"style": {
							"right": this.squareSizeHalfNegPx,
							"top": ((DomGeom.getMarginBox(this.targetNode).h / 2) -0 -this.squareSizeHalf) + "px"
						}}];					
				}
			});//end of Declacre class resizeWidget
		}//call back function
	); //end of require module 	resizeWidget
