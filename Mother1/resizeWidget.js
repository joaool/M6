		define(["dojo",
				 "dojo/_base/declare",
				 "dojo/on",
				 "dojo/query",
				 "dojo/dom-style",
				 "dojo/dom-construct",				 
				 "dojo/dom",
				 "dijit/_WidgetBase"],
		//function(dojo,fBuilder,Declare,Evented,Stateful,Lang,win,Event,domAttr,on,mouse,Ready,query,domClass,domStyle,domGeom,domConstruct,registry,BorderContainer,ContentPane,Dom,DomConstruct,
		function(dojo,Declare,on,query,domStyle,DomConstruct,Dom,Widget){
			return Declare("resizeWidget", Widget, {
				//The programmer shoul use a callback function to End Risize
				//   EndResize is called when the users clicks Up outside an handle
				// the programmer  can intercept each onResizeComplete connecting an event to this function
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
				endCallback:null,
				firstMouseUp:true,
				constructor:function(args){
					//mixes the passed argument into "this"
					dojo.safeMixin(this, args);//args vem na forma {"targetNode": "target"} e monta logo this.targetNode="target"
					var coords = dojo.coords(dojo.byId(this.targetNode)); //targetNode tem a string que foi passada na construção ex"avatarId"
					this.targetIL=coords.l;
					this.targetL=coords.l;
					this.targetIT=coords.t;
					this.targetT=coords.t;
					this.targetIW=coords.w;
					this.targetW=coords.w;
					this.targetIH=coords.h;
					this.targetH=coords.h;
					console.log("resizeWidget constructor L,T,W,H = "+this.targetL+","+this.targetT+","+this.targetW+","+this.targetH);
					this.targetId=this.targetNode; //to preserve the input format...
					//alert("entrou em resizeWidget com tipo="+this.targetType);
				},
				postCreate: function() {
					if (dojo.isString(this.targetNode)) {
						this.targetNode = Dom.byId(this.targetNode);
					}
					this.upHandler=this.connect(dojo.doc, "onmouseup", dojo.hitch(this, "_onMouseUp"));
					this.moveHandler=this.connect(dojo.doc,"onmousemove", dojo.hitch(this, "_onMouseMove"));
					//dojo.doc=win.doc
					//on(win.doc, "onmouseup", Lang.hitch(this, "_onMouseUp"));
					//on(win.doc, "onmousemove", Lang.hitch(this, "_onMouseMove"));
					console.log("resizeWidget class ->vai fazer this.createResizeHandles()");
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
					console.log("resizeWidget onResizeComplete ...");
					var coords = dojo.coords(dojo.byId(this.targetNode));//this refere-se a moveResize
					this.targetL=coords.l;
					this.targetT=coords.t;
					this.targetW=coords.w;
					this.targetH=coords.h;
					console.log("resizeWidget2 onResizeComplete ...targetL="+this.targetL);

					//this.destroy();
					//this.endCallback();
				},
				_onMouseDown: function(e) {
					// ---- JO
					var x = e.clientX; 
					var y = e.clientY; 
					console.log("Class resizeWidget ------------->_onMouseDown x="+x+" y="+y);
					// ---- JO
				
					this._lastMarginBox = dojo.marginBox(this.targetNode);		
					this._lastPosition = dojo.position(this.targetNode);
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
					console.log("Class resizeWidget -----------------> _onMouseUp x="+x+" y="+y);
					// ---- JO

					if (this._mouseDown === true) {
						this.onResizeComplete(dojo.marginBox(this.targetNode));
					}else{ //mouse up sem estar mouse down !!!
						console.log("mouse up com mouseDown=false !!!")
						if(!this.firstMouseUp){
							//alert("resizeWidget _onMouseUp vai sair");
							this.destroy();
							this.endCallback(); //the way out !!!
						};
						this.firstMouseUp=false;
					};
					this._mouseDown = false;
				},
				_onMouseMove: function(e) {
					 // ---- JO
					 var x = e.clientX; 
					 var y = e.clientY; 
					 console.log("Class resizeWidget _onMouseMove x="+x+" y="+y+" mouse down="+this._mouseDown);
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

					var squareBorderSize = 1;
					var squareSize = 6; //px
					var squareSizeHalf = (squareSize / 2) + squareBorderSize;
					var squareSizePx = squareSize + "px";
					var squareSizeHalfPx = squareSizeHalf + "px";
					var squareSizeHalfNegPx = "-" + squareSizeHalf + "px";

					var square =DomConstruct.create("div", {
						"style": {
							"position": "absolute",
							"height": squareSizePx,
							"width": squareSizePx,
							"backgroundColor": "white",
							"border": squareBorderSize + "px solid black"
						}
					});

					var positions = [{
						"direction": "NW",
						"style": {
							"top": squareSizeHalfNegPx,
							"left": squareSizeHalfNegPx
						}},
					{
						"direction": "NE",
						"style": {
							"top": squareSizeHalfNegPx,
							"right": squareSizeHalfNegPx
						}},
					{
						"direction": "SE",
						"style": {
							"bottom": squareSizeHalfNegPx,
							"right": squareSizeHalfNegPx
						}},
					{
						"direction": "SW",
						"style": {
							"bottom": squareSizeHalfNegPx,
							"left": squareSizeHalfNegPx
						}},
					{
						"direction": "N",
						"style": {
							"top": squareSizeHalfNegPx,
							"left": ((dojo.marginBox(this.targetNode).w / 2) - squareSizeHalf) + "px"
						}},
					{
						"direction": "S",
						"style": {
							"bottom": squareSizeHalfNegPx,
							"left": ((dojo.marginBox(this.targetNode).w / 2) - squareSizeHalf) + "px"
						}},
					{
						"direction": "W",
						"style": {
							"left": squareSizeHalfNegPx,
							"top": ((dojo.marginBox(this.targetNode).h / 2) - squareSizeHalf) + "px"
						}},
					{
						"direction": "E",
						"style": {
							"right": squareSizeHalfNegPx,
							"top": ((dojo.marginBox(this.targetNode).h / 2) - squareSizeHalf) + "px"
						}}];

					dojo.forEach(positions, function(item) {
						var node = undefined;

						//if (node = dojo.query("." + "wuhiDesignerResizeSquare_" + item.direction, this.targetNode)[0]) {               
						if (node = dojo.query(".resize_" + item.direction, this.targetNode)[0]) {
					  } else {
							node = dojo.clone(square);
							dojo.addClass(node, "resize_" + item.direction);
							dojo.style(node, "cursor", item.direction + "-resize");
							dojo.place(node, this.targetNode);
							this.connect(node, "onmousedown", dojo.hitch(this, "_onMouseDown"));
						}

						dojo.style(node, item.style);
					}, this);
				}
			});//end of Declacre class resizeWidget
		}//call back function
	); //end of require module 	resizeWidget
