	define([
			 "MotherLib5.js",
			 "dojo/_base/declare",
			 "dijit/form/ValidationTextBox",
			 "dojo/domReady!"], 
		function(FBuilder,Declare,ValidationTextBox){	
			return Declare("json2FormDsgn",null, { 
				//var viewPortX={l:50,t:5,w:1250,h:100};
				//var f0=new FBuilder("form f0","f0",{viewPort:viewPortX,borderColor:"green",borderType:"solid",borderThickness:1});
				//form features: ex: {"fname":fname,"fprefix":fprefix,"fLayout":{"viewPort":{"l":l,"t":t,"w";w,"h":h},"borderColor":bColor,"borderType":bType,"borderThickness":bThickness},
			//                    "widgets":[{"type":"button","props":props1},{"type":"textBox","props":props2}]}
				// Do not forget that double quotes are necessary in properties and strings, for JSON.parse(xStr) to work. Avoiding -> JSON.parse: expected property name or '}'.
				name:null,
				prefix:null,		
				//viewPort:{l:100,t:100,w:200,h:200},
				viewPort:null,
				borderThickness:null,
				borderType:null,//solid,dotted,dashed,double,groove,ridge,inset,outset,none
				borderColor:null,
				widgets:null,
				constructor:function(xStr){
					console.log("json2FormDsgn -------------------------- CONSTRUCTOR !!! ---------------------");  
					//ex 	objFjson=new FJson(json_of_f0);
					var obj = JSON.parse(xStr);
					this.name=obj.fname;
					this.prefix=obj.fprefix;
					this.viewPort=obj.fLayout.viewPort;
					this.borderColor=obj.fLayout.borderColor;
					this.borderType=obj.fLayout.borderType;
					this.borderThickness=obj.fLayout.borderThickness;	
					this.widgets=obj.widgets;	
				},
				buildNoWidgets: function(xName,xPrefix ) { //builds  form with name xName and prefix xPrefix base on the json introduced in the contructor
					//var viewPortX={l:50,t:5,w:1250,h:100};
					//var f0=new FBuilder("form f0","f0",{viewPort:viewPortX,borderColor:"green",borderType:"solid",borderThickness:1});
					this.prefix=xPrefix;
					var xRet=new FBuilder(xName,xPrefix,{viewPort:this.viewPort,borderColor:this.borderColor,borderType:this.borderType,borderThickness:this.borderThickness});
					return xRet;
				},
				buildWidgets:function(objForm){//builds widgets into objForm
					// var f1=objFjson.buildNoWidgets("form f1","f1");//builds form with name "form f1" and prefix "f1" assigning it to variable f1.
					// objFjson.buildWidgets(f1);
					objForm.static.zarrObj[objForm.currentFormNumber]=[]; //limpa arrWidgets
					objForm.counter=[0,0,0,0,0,0,0,0,0,0,0]; //numer of elements for each type
					objForm.maxCounter=[0,0,0,0,0,0,0,0,0,0,0]; //max numer of elements for each type (if one is deleted the numbering goes on..)
					objForm.highestOrder=0; //absolute widget counter (incremented by each widgets whatever type)
					var dijitObj=null;
					var xType=null;
					var JSON_var=null;
					var xId=null;
					var xTotWidgets=this.widgets.length;
					alert("buildWidgets widgets="+xTotWidgets);
					for(var xOrder=0;xOrder<xTotWidgets;xOrder++){
						xType=this.widgets[xOrder].type;
						//objForm.static.zarrObj[this.currentFormNumber][xOrder].type=xType;
						//console.log("forma "+xType);
						objForm.counter[objForm.counterIndex(xType)]+=1;
						objForm.maxCounter[objForm.counterIndex(xType)]+=1;
						//	"widgets":[{"type":"button","props":props1},{"type":"textBox","props":props2}]}
						objForm.static.zarrObj[objForm.currentFormNumber][xOrder]=this.widgets[xOrder];	
						JSON_var=this.widgets[xOrder];
						//JSON_var.props=objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props;
						//xId=objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.id;
						objForm.highestOrder++;
						xId=this.prefix+objForm.highestOrder;
						objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.id=xId;
						
						//
						switch(xType){
							case "textBox":
								//dijitObj=new ValidationTextBox(JSON_var.props, dojo.doc.createElement(arrObj[i].props.id)); 
								console.log("vai criar type="+xType+" xId="+xId);
								dijitObj=new ValidationTextBox(JSON_var.props, xId); 
								objForm.formObj.domNode.appendChild(dijitObj.domNode) //this places the widget inside the form	
								break;
						/*		
							case "label":
								dijitObj=new TextBox(arrObj[i].props, dojo.doc.createElement(arrObj[i].props.id)); //o 2º param é o DomNode string
								break;	
							case "numberBox":
								dijitObj=new NumberTextBox(arrObj[i].props, dojo.doc.createElement(arrObj[i].props.id)); //o 2º param é o DomNode string
								break;
							case "textArea":
								dijitObj=new Textarea(arrObj[i].props, dojo.doc.createElement(arrObj[i].props.id)); //o 2º param é o DomNode string
								break;
							case "checkBox":
								dijitObj=new CheckBox(arrObj[i].props)
								break;	
							case "radioButton":
								//dijitObj=new DateTextBox(arrObj[i].props, dojo.doc.createElement(arrObj[i].props.id)); //o 2º param é o DomNode string
								break;
							case "dateTextBox":
								dijitObj=new DateTextBox(arrObj[i].props, dojo.doc.createElement(arrObj[i].props.id)); //o 2º param é o DomNode string
								break;
							case "button":
								dijitObj=new Button(arrObj[i].props, dojo.doc.createElement(arrObj[i].props.id)); //o 2º param é o DomNode string
								break;	
							case "comboBox":
								dijitObj=new ComboBox(arrObj[i].props, dojo.doc.createElement(arrObj[i].props.id)); //o 2º param é o DomNode string
								//dijitObj.startup();
								break;	
							case "grid":
								//dijitObj=new dojox.grid.DataGrid(arrObj[i].props);//, dojo.doc.createElement("div")); //o 2º param é o DomNode string
								dijitObj=new DataGrid(arrObj[i].props);//, dojo.doc.createElement("div")); //o 2º param é o DomNode string
								//alert("3GRID construido !!! vai fazer append com id="+JSON_var.props.id);
								//f0.formObj.domNode.appendChild(dijitObj.domNode); //não sei porquê mas também funciona
								this.formObj.domNode.appendChild(dijitObj.domNode);
								dijitObj.startup();					
								break;
							case "tabs":
								alert("jsonFormDownLoad: Tabs still to be implemented")
								break;	
							default: alert("Form.addChild "+this.name+": The type "+xType+" is unknown for the time being");
						*/
						};
						//objForm.formObj.domNode.appendChild(dijitObj.domNode) //this places the widget inside the form	
						objForm.static.zarrObj[objForm.currentFormNumber].push(JSON_var);
						objForm.static.zarrWidgets[objForm.currentFormNumber].push(dijitObj);

						//domClass.add(dijitObj.domNode, "Mother_"+objForm.prefix);//add a class to CSS so that we can have a CSS selector to all widgets in a form
					// problema com totObjects()	console.log("json2FormDsgn->Fabricou Widg order="+xOrder+"->"+objForm.name+"."+objForm.static.zarrObj[objForm.currentFormNumber][objForm.totObjects()-1].props.id+" "+objForm.static.zarrObj[objForm.currentFormNumber][objForm.totObjects()-1].props.title);
						console.log("json2FormDsgn->Fabricou Widg order="+xOrder+"->"+objForm.name+"."+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.id+" "+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.title);
						//console.log("----->Value:"+this.static.zarrObj[this.currentFormNumber][this.totObjects()-1].props.value+" order do id="+dijitObj.get("id")+"=>order="+this.locateOrderById(dijitObj.get("id")));
						console.log("json2FormDsgn---------->Width="+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.style.width+" height="+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.style.height+" visibility="+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.style.visibility);
					};
				}
			}); //end of classe json2FormDsgn
		}//call back function
	); //end of require for module 	json2FormDsgn
