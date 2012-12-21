	define([
			 "MotherLib6.js",
			 "Mother1/debug.js",
			 "dojo/_base/declare",
			 "dojo/dom",
			 "dojo/dom-class",
			 "dojo/_base/lang",
			 "dijit/form/ValidationTextBox",
			 "dojo/domReady!"], 
		function(FBuilder,Dbg,Declare,Dom,DomClass,Lang,ValidationTextBox){	
			return Declare("json2FormDsgn",null, { 
				//var viewPortX={l:50,t:5,w:1250,h:100};
				//var f0=new FBuilder("form f0","f0",{viewPort:viewPortX,borderColor:"green",borderType:"solid",borderThickness:1});
				//form features: ex: {"fname":fname,"fprefix":fprefix,"fLayout":{"viewPort":{"l":l,"t":t,"w";w,"h":h},"borderColor":bColor,"borderType":bType,"borderThickness":bThickness},
			//                    "widgets":[{"type":"button","props":props1},{"type":"textBox","props":props2}]}
				// Do not forget that double quotes are necessary in properties and strings, for JSON.parse(xStr) to work. Avoiding -> JSON.parse: expected property name or '}'.
				oDbg:null,
				name:null,
				prefix:null,		
				//viewPort:{l:100,t:100,w:200,h:200},
				viewPort:null,
				borderColor:null,
				borderType:null,//solid,dotted,dashed,double,groove,ridge,inset,outset,none
				borderThickness:null,
				template:null,
				widgets:null,
				objFBuilder:null,

				constructor:function(xStr){
					//  EX: objJson2F=new Json2F(restJson);//builds pre-object from JSON string
					//----------- debug preparation Area -----------------------------------------------------------
					this.oDbg=new Dbg();
					this.oDbg.setThis("json2FormDsgn2");//All debugs within this class will belong to "json2FormDsgn2"	
					//----------------------------------------------------------------------------------------------
					//if (this.oDbg.isDbg("constructor") ) this.oDbg.display("--** CONSTRUCTOR **--");
					var obj = JSON.parse(xStr);
					this.name=obj.name;
					this.prefix=obj.prefix;
					this.viewPort={};
					this.viewPort=obj.fLayout.viewPort;
					this.borderColor=obj.fLayout.borderColor;
					this.borderType=obj.fLayout.borderType;
					this.borderThickness=obj.fLayout.borderThickness;	
					this.template=obj.fLayout.template;	
					this.widgets={};
					this.objFBuilder={};
					this.widgets=obj.widgets;	
					if (this.oDbg.isDbg("constructor") ) this.oDbg.display("--** CONSTRUCTOR **-- name="+this.name+" prefix="+this.prefix+" viewPort="+JSON.stringify(this.viewPort)+" template="+this.template);

				},
				buildNoWidgets: function(xName,xPrefix,xFloatF ) { //builds  form with name xName and prefix xPrefix based on the json introduced in the contructor - 
					// TAKE CARE --> if it already exists a FBuilder form with prefix=xPrefix this method will produce null !!!!!
					// the new reconstructed form will have the floating properties of  xFloatF: ("nonFloat" => form in pane ), ("modal" or "nonModal" => floating forms)
					// f1=objJson2F.buildNoWidgets("form f1","f1","nonModal");//builds form name "form f1" & "f1", from restJson,assigning it to variable f1.
					this.name=xName;
					this.prefix=xPrefix;
					if(!xFloatF)
						xFloatF="nonFloat";
					this.viewPort.floatF=xFloatF;
					//before building we will check if it exists a dojo form with DOM id=xPrefix - we should assure that the prefix is free
					//f0.destroy();//this will destroy all widgets, the dojo form, the dojo ContentPane and the dojo Dialog if its a floating form
					var xNode=Dom.byId(xPrefix);//checks if it exists a DOM id with xPrefix (checking if the DOJO FORM xPrefix is  in DOM)
					if(xNode){
						alert("json2FormDsgn2.buildNoWidgets ERROR: existing prefix "+xPrefix+" =>Pls destroy the form before calling this method")
						xRet=null;
					}else{	
						if(this.oDbg.isDbg("buildNoWidgets")) this.oDbg.display("objFBuilder is going to be built with name="+xName+" prefix="+xPrefix+" viewPort="+JSON.stringify(this.viewPort));
						this.objFBuilder=new FBuilder(xName,xPrefix,{viewPort:this.viewPort,borderColor:this.borderColor,borderType:this.borderType,borderThickness:this.borderThickness,template:this.template});
						var xRet=this.objFBuilder;
						if(this.oDbg.isDbg("buildNoWidgets")) this.oDbg.display("objFBuilder was built with name="+xName+" prefix="+xPrefix+" viewPort="+JSON.stringify(this.viewPort));
						//if (this.oDbg.isDbg("constructor") ) this.oDbg.display("--** CONSTRUCTOR **-- name="+this.name+" prefix="+this.prefix+" viewPort="+JSON.stringify(this.viewPort)+" template="+this.template);

					};
					return xRet;
				},
				buildWidgets:function(objForm){//builds widgets into objForm
					// var f1=objFjson.buildNoWidgets("form f1","f1");//builds form with name "form f1" and prefix "f1" assigning it to variable f1.
					// objFjson.buildWidgets(f1);
					// or 
					// 	f1=objJson2F.buildNoWidgets("form f1","f1","nonModal");//builds form name "form f1" & "f1", from restJson,assigning it to variable f1.
					// objJson2F.buildWidgets(f1);//constroi os widgets da json restJson no form f1			

					// This method uses the array of widgets - this.widgets - to reconstruct widgets in a form
					//   SPECIAL NOTE: this.widgets has for each widgets the that was current when the Json was saved (motherLib6.formContent2Json()
					//						in this method the widget ids will be reassigned to this.prefix - thus preventing name colisions
					this.objFBuilder.static.zarrObj[this.objFBuilder.currentFormNumber]=[]; //clean it for current form
					this.objFBuilder.static.zarrObj[this.objFBuilder.currentFormNumber]=[]; //clean it for current form
					this.objFBuilder.counter=[0,0,0,0,0,0,0,0,0,0,0]; //numer of elements for each type
					this.objFBuilder.maxCounter=[0,0,0,0,0,0,0,0,0,0,0]; //max numer of elements for each type (if one is deleted the numbering goes on..)
					this.objFBuilder.highestOrder=0; //absolute widget counter (incremented by each widgets whatever type)
					var dijitObj=null;
					var xType=null;
					var JSON_var=null;
					var xProps=null;
					var xAllProps=null;
					var xPropsZero={left:0,top:0,width:0,height:0,value:"",id:"",name:"",required:false,invalidMessage:"Error...please correct",missingMessage:"Must have a value !",regExp:"[^\t]*",
							datePattern:"dd/MM/yyyy",checked:false,onClick:"",clickCode:"",preCode:"",posCode:"",changeCode:"",
							pattern:"#######",comboArr:"",disable:false,disabled:false,title:"@|",headers:"",colTypes:"",showId:true,placeHolder:""};
					var xOrderInType=null;
					var xId=null;
					var xIndex=null;
					var xTotWidgets=this.widgets.length;
					if(this.oDbg.isDbg("buildWidgets")) this.oDbg.display("------------------------------BEGINs for form prefix="+this.objFBuilder.prefix+" #widgets="+xTotWidgets+" -------------------");
					for(var xOrder=0;xOrder<xTotWidgets;xOrder++){
						xType=this.widgets[xOrder].type;
						xAllProps=Lang.clone(xPropsZero);//set xAllProps to initial state
						// ------ updates widget counters ----------------
						xIndex=this.objFBuilder.counterIndex(xType);
						this.objFBuilder.static.zcounter[this.objFBuilder.currentFormNumber][xIndex]+=1;
						this.objFBuilder.static.zmaxCounter[this.objFBuilder.currentFormNumber][xIndex]+=1;
						xOrderInType=this.objFBuilder.maxTot(xType);
						// -----------------------------------------------
						this.objFBuilder.static.zarrObj[this.objFBuilder.currentFormNumber][xOrder]=this.widgets[xOrder];	
						xProps=this.widgets[xOrder].props;//this should be adjusted to xAllProps
						xAllProps=Lang.mixin(xAllProps, xProps);//adjusting - inserting default values where no info is comming from JSON representation
						xAllProps=Lang.mixin(xAllProps, xProps.style);//second mixing to flatten style
						this.objFBuilder.highestOrder++;
						xId=this.prefix+this.objFBuilder.highestOrder;
						this.objFBuilder.static.zarrObj[this.objFBuilder.currentFormNumber][xOrder].props.id=xId;// id can be renamed because new form prefix probably is diferent from the one saved in xStr (constructor)
						if(xAllProps.id==xAllProps.name){//the user didn't choose a name and the system adopts the id...
							xAllProps.id=xId;
							xAllProps.name=xId;//if the id changes the name also change
						};
						xAllProps.id=xId;
						
						xAllProps.left=parseInt(xAllProps.left);//because in the server Json it was already +"px"
						xAllProps.top=parseInt(xAllProps.top);
						xAllProps.width=parseInt(xAllProps.width);
						xAllProps.height=parseInt(xAllProps.height);
						
						//falta normalizar para xAllProps
						JSON_var=this.objFBuilder.buildJSON_var(xType,xOrder,xOrderInType,xAllProps)
						dijitObj=this.objFBuilder.buildWidget(JSON_var);//JSON_var includes type in itself

						//objForm.formObj.domNode.appendChild(dijitObj.domNode) //this places the widget inside the form	
						this.objFBuilder.static.zarrObj[this.objFBuilder.currentFormNumber].push(JSON_var);
						this.objFBuilder.static.zarrWidgets[this.objFBuilder.currentFormNumber].push(dijitObj);
						//if (this.oDbg.isDbg("buildWidgets")) this.oDbg.display("Width="+this.objFBuilder.static.zarrObj[this.objFBuilder.currentFormNumber][xOrder].props.style.width+" height="+this.objFBuilder.static.zarrObj[this.objFBuilder.currentFormNumber][xOrder].props.style.height+" visibility="+this.objFBuilder.static.zarrObj[this.objFBuilder.currentFormNumber][xOrder].props.style.visibility);
						//--------------------
						//--------------------------------------- FIM DO "NACIONAL TRAMBOLHISMO (simplificado: sem grids)" -----------------------------------------------------------------------------------------------
						if(xType=="tabs"){//Tabs are placed directly over the contentPane - not inside the form that is over the contentPane
							var dijitNode=dijit.byId(xId).domNode; //dijit.byId returns a handle to the object= a javascript object, that has a domNode property
							var paneNode = dojo.byId(this.objFBuilder.xPaneId); //Returns the DOM node of the object xPane
							paneNode.appendChild(dijitNode);
						}else{//all widgets will be placed over the form, except tabs
							this.objFBuilder.formObj.domNode.appendChild(dijitObj.domNode) //this places the widget inside the form	
							//alert("json2FormDsgn.buildWidget WIDGET MOSTRADO !");
						};
						if(xType=="tabs"){//to avoid the 3 bars problem in tabs we need  to make a startup to the underlaying contentPane (xPane - set in placeFormInPane)
							this.objFBuilder.xPane.startup();//if this is active the width will be the container width
						};	
/*					
						if(xType=="button"){//to assure that button height will be show - should run after this.static.zarrObj and this.static.zarrWidgets
							//alert("button - to do button compensation order="+xOrder);
							this.objFBuilder.compensationButton(xOrder);
						};
						DomClass.add(dijitObj.domNode, "Mother_"+this.objFBuilder.prefix);//add a class to CSS so that we can have a CSS selector to all widgets in a form
*/		
	
						if(xType=="button"){//to assure that button height will be show - should run after this.static.zarrObj and this.static.zarrWidgets
							//alert("button - to do button compensation order="+xOrder);
							//this.compensationButton(xOrder);//this does not deal with domClass !!!
							this.objFBuilder.compensationButton(xOrder);
							var xNode=dojo.byId(xId);
							if(this.oDbg.isDbg("buildWidgets")) this.oDbg.display("*******************>For buttons - "+xId+" Sets template to "+this.objFBuilder.template);
							DomClass.add(xNode.parentNode, "Mother_"+this.objFBuilder.template);//add a class "Mother_x" to the SPAN node thar has .dijitButtonNode
							//DomClass.add(dijitObj.domNode, "Mother_"+this.objFBuilder.template);//add a class to CSS so that we can have a CSS selector to all widgets in a form
						}else{//for all other widgets...	
							//domClass.add(dijitObj.domNode, "Mother_"+this.objFBuilder.template);//choose CSS selector from  Mother.CSS ->TO PREVENT A SECOND CALL FOR BUTTONS
							DomClass.add(dijitObj.domNode, "Mother_"+this.objFBuilder.template);//add a class to CSS so that we can have a CSS selector to all widgets in a form
						};	
						//DomClass.add(dijitObj.domNode, "Mother_"+this.objFBuilder.template);//add a class to CSS so that we can have a CSS selector to all widgets in a form

						
						//for buttons we need to transmit the style (already set in the top span node) to the node with id that is in Mother
						// we can not do it here because at this point the widget is not yet in the DOM (dojo.byId(xId) returns null - to solve this:
						//   We need to call CompensationAll after all addChilds added in order to do a compensationButton followed by a formObj.startup();
					//console.log("Fabricou Widg order="+xOrder+"->"+this.name+"."+this.static.zarrObj[this.currentFormNumber][this.totObjects()-1].props.id+" "+this.static.zarrObj[this.currentFormNumber][this.totObjects()-1].props.title);
			//console.log("json2FormDsgn->Fabricou Widg order="+xOrder+"->"+objForm.name+"."+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.id+" ");+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.title);
if (this.oDbg.isDbg("buildWidgets")) this.oDbg.display("Fabricou Widg order="+xOrder+"->"+objForm.name+"."+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.id+" "+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.title);
				//console.log("----->Value:"+this.static.zarrObj[this.currentFormNumber][this.totObjects()-1].props.value+" order do id="+dijitObj.get("id")+"=>order="+this.locateOrderById(dijitObj.get("id")));
					//console.log("---------->Width="+this.static.zarrObj[this.currentFormNumber][this.totObjects()-1].props.style.width+" height="+this.static.zarrObj[this.currentFormNumber][this.totObjects()-1].props.style.height+" visibility="+this.static.zarrObj[this.currentFormNumber][this.totObjects()-1].props.style.visibility);
					//console.log("json2FormDsgn---------->Width="+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.style.width+" height="+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.style.height+" visibility="+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.style.visibility);
if (this.oDbg.isDbg("buildWidgets")) this.oDbg.display("----->Width="+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.style.width+" height="+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.style.height+" visibility="+objForm.static.zarrObj[objForm.currentFormNumber][xOrder].props.style.visibility);

					//--------------------------------------- FIM DO "NACIONAL TRAMBOLHISMO" -----------------------------------------------------------------------------------------------
					};
				}
			}); //end of classe json2FormDsgn
		}//call back function
	); //end of require for module 	json2FormDsgn
