define(["dojo",
		 "dojo/_base/declare",
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
	function(dojo,Declare,Lang,Array,on,Query,DomStyle,DomGeom,DomConstruct,DomClass,Dom,Widget){
		return Declare("utils", null, {
			// A collection of tools for Mother overall use 
			//To make this work, you'll need to tell the browser that Utils is a global variable: window.Utils = new UtilityMethod(); 
			//Now, Utils is set on the window object thus making it accessible anywhere (A nice feat of the window object is that its 
			//  properties are available without the window. prepended, so you can still use Utils.testMethod as normal)
			auxvar: null,
			test:function(){
				alert("Utils TEST OK !!!!");
			},
			//-------------------------------------------------------------------------------------------
			makeDivId:function(xId,xLeft,xTop,xWidth,xHeight,xBorderThickness,xColor){//used in moveResizeArea2.js - position: relative this prevents the vertical jump
			//-------------------------------------------------------------------------------------------
			//returns a string
				var xInner="<div id='"+xId+"' style='position: relative; top:"+xTop+"px; left:"+xLeft+"px; height:"+xHeight+"px; width:"+xWidth+"px;";
				if(xColor)
					xInner+=" border:"+xBorderThickness+"px solid "+xColor+";'>";
				else{
					xInner+="'>";
				}
				//console.log("utils.makeDivId "+xInner+"</div>");
				return xInner+"</div>";
			},
			//-------------------------------------------------------------------------------------------
			makeAbsDivId:function(xId,xLeft,xTop,xWidth,xHeight,xBorderThickness,xBorderType,xColor){//the same as above but absolute
			//-------------------------------------------------------------------------------------------
			//returns a string
				var xInner="<div id='"+xId+"' style='position: absolute; top:"+xTop+"px; left:"+xLeft+"px; height:"+xHeight+"px; width:"+xWidth+"px;";
				if(xColor)
					xInner+=" border:"+xBorderThickness+"px "+xBorderType+" "+xColor+";'>";
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
			getInnerAbsHTML:function(xType,xId,xText,xLeft,xTop,xWidth,xHeight,xBorderThickness,xBorderType,xColor){//type of field,width,height,
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
				var xStyle="position: absolute; left:"+xLeft+"px;top:"+xTop+"px; height:"+xHeight+"px; width: "+xWidth+"px;";
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
			makeHTML:function(xType,xId,A_R,xText,xLeft,xTop,xWidth,xHeight,xBorderThickness,xBorderType,xColor){
			//-------------------------------------------------------------------------------------------
				// xType - element type : div,textBox,label,numberBox,textArea,checkBox,dateTextBox,button,comboBox,grid
				//		if type="div" =>no class, no value (xText is ignored)
				// xId - Id of HTML element to form - OPTIONAL
				// A_R - Absolute or Relative Position - "A" for absolute, else =>relative (is ignored if xLeft is undefined)
				// xText - text of element (ignored if type="div")
				// xLeft,xTop - OPTIONAL (both defined or both nulls)
				// xWidth,xHeight
				// xBorderThickness - thickness of border line
				// xBorderType - type of border line : solid, dotted, dashed, inset, groove etc
				// xColor - color of border line - OPTIONAL (if color is omited the whole border will disapear)
				//
				//exemples
				//			menuPlace3.innerHTML=util.makeHTML("div","wrapper3","A","",700,300,300,50,2,null,null); //no text, nborder
				//			menuPlace2.innerHTML=util.makeHTML("div","wrapper2","A","",700,100,300,50,2,"solid","blue");//no text
				//	old makedivId //floatPane1.innerHTML=util.makeDivId("fPaneId1",0,0,1,1,1,"crimson");//O placeHolder do pFloatingPane
				//	                floatPane1.innerHTML=util.makeHTML("div","fPaneId1","R","",0,0,1,1,1,"crimson");//substitui makeDivId

				var xInner="";
				var xIdPart="";
				if(xId)
					xIdPart="id='"+xId+"'";
				//var xStyle="position: absolute; top: 0px; left: 0px; height: "+xHeight+"px; width: "+xWidth+"px;";
				var xStyle="width:"+xWidth+"px;height:"+xHeight+"px;";
				if(xColor)
					xStyle+=" border:"+xBorderThickness+"px "+xBorderType+" "+xColor+";";
				if(xLeft){
					var xAR="";
					if(A_R){
						if(A_R=="A"){
							xAR="position: absolute;";
						}else{
							xAR="position: relative;";				
						};
					}
					xStyle=xAR+" left:"+xLeft+"px;top:"+xTop+"px;"+xStyle;
				};
				//console.log("getInnerAbsHTML2 with "+xStyle);		
				switch(xType){
					case "div":xInner="<div "+xIdPart+" style='"+xStyle+"'></div>";
						break;
					case "textBox":xInner="<input "+xIdPart+" class='avatar' type='text' name='textBox' value='"+xText+"' style='"+xStyle+"'>";
						break;
					case "label":xInner="<input "+xIdPart+" class='avatar' type='text' name='label' value='"+xText+"' style='"+xStyle+"'>";
						break;
					case "numberBox":xInner="<input "+xIdPart+" class='avatar' type='text' name='numberBox' value='"+xText+"' style='"+xStyle+"'>";
						break;			
					case "textArea":xInner="<textarea "+xIdPart+" class='avatar' style='"+xStyle+"'>"+xText+"</textarea>";
						break;			
					case "checkBox":xInner="<input "+xIdPart+" class='avatar' type='checkbox' class='bigcheck'>";
						break;			
					case "dateTextBox":xInner="<select "+xIdPart+" class='avatar' style='"+xStyle+"'><option value='dateBox'>"+xText+"</option></select>";
						break;
					case "button":xInner="<button "+xIdPart+" class='avatar' style='"+xStyle+"'>"+xText+"</button>";
						break;	
					//case "comboBox":xInner="<select "+xIdPart+" class='avatar' style='"+xStyle+"'><option value='comboBox'>"+xText+"</option></select>";
					case "comboBox":xInner="<select "+xIdPart+" style='"+xStyle+"'><option value='comboBox'>"+xText+"</option></select>";
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
		});//end of Declacre class utils
	}//call back function
); //end of define module 	resizeWidget
