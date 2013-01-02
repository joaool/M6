define([
	"Mother1/utils.js",
	"dijit/Menu",				 
	"dijit/MenuItem",				 
	"dijit/PopupMenuItem",				 
	"dijit/MenuBar",				 
	"dijit/MenuSeparator",	
	"dijit/PopupMenuBarItem",				 
	"dijit/DropDownMenu",
	"dijit/registry",
	
	"dojo/_base/declare",	 
	"dojo/_base/window",
	"dojo/parser",//recomendation from JS
	"dojo/dom",
	"dojo/dom-construct",//used outside class
	"dojo/ready",
	], 
	//function(fBuilder,EditViewPort,MoveResizeArea,Exchanger,ResizeWidget,MoveCanvas,Utils,Menu,MenuItem,MenuBar,MenuSeparator,PopupMenuBarItem,DropDownMenu,TooltipDialog,TextBox,Button,Declare,Win,Event,Registry,Dom,Html,On,Evented,Moveable,Mover,DomGeom,DomConstruct,DomStyle,DomClass,Lang,ContentPane,BorderContainer,AccordionContainer,TabContainer,FloatingPane,ColorPalette,Ready){ 
	//function(fBuilder,EditViewPort,MoveResizeArea,Exchanger,ResizeWidget,MoveCanvas,Utils,Menu,MenuItem,PopupMenuItem,MenuBar,MenuSeparator,
	function(Utils,Menu,MenuItem,PopupMenuItem,MenuBar,MenuSeparator,PopupMenuBarItem,DropDownMenu,Registry,
	Declare,Win,Parser,Dom,DomConstruct,Ready){ 
		//---------------------------------------------------------------------------------------	
		console.log(document.title+"......  inicio..");//document title tem "Layout Area 6.0" ... a property <title> que está no head		
		//http://www.gaeking.de/wordpress/2011/06/02/custom-dojo-menus-dijit-menubar/
		//http://dojotoolkit.org/documentation/tutorials/1.8/store_driven_tree/   o interface perfeito drag and drop de uma tree...
		//var dialog;
		//var lineColors=new dijit.ColorPalette(); 
		//var lineColorMenu=new dijit.PopupMenuItem({label: 'Line color', popup:lineColors}); 
		// --------------------------------------------
		// estrutura {menus:[{m1},{m2},{m3}]}
		// cada m1..3:{label:"lbl1",xPopup:[{m1},{m2},{m3}]} 
		// regras:level 1 o digit dijit.MenuBar() de topo recebe dijit.PopupMenuBarItem() (menus de 1st level) 
		//				se houver filhos são postos num container dijit.DropDownMenu()
		//        outros niveis: "deadend" suportado por MenuItem e "menus de menus" suportado por PopupMenuItem
		// na linha 130 indicar o menu que queremos testar	xMenu=xMenuX;
		return Declare("mMenu",null, {
			//receives a JSON structure - in menu format {label:"lbl1",xPopup:[{m1},{m2},{m3}]} where {m1} has the same format....
			//receive an DOM id to place the menu.
			// To avoid DOM conflicts the DOM nodes will be called m_+<placeId>+"_"+<sequencial number>
			// ex: 	var x=new mMenu({menu:xMenu3,placeId:"wrapper"});//args vem na forma {"menu": xMenu,placeId:"wrapper"} e monta logo this.targetNode="target"
			menu:{},
			menu:null,
			placeId:null,//the id (input arg) that will be a placeholder - it will ne a prefix for menu ids
			xMenuCounter:0,
			dropDownArr:[],//array to suport destroy method
			xArrNodeIds:[], 
			constructor:function(args){
				//mixes the passed argument into "this"
				this.menu={};//to avoid sharing of array between diferent instances 
				this.xArrNodeIds=[];
				this.dropDownArr=[];
				Declare.safeMixin(this, args);//args vem na forma {"menu": xMenu,placeId:"wrapper"} e monta logo this.targetNode="target"
				//alert("Constructor placeId="+this.placeId);
			},
			//-------------------------------------------------------------------------------------------
			//refreshMenu:function(xMenu,placeHolder){ //coloca no div com id=placeId (placeHolder) a estrutura de menus definida na json string xmenu
			refreshMenu:function(){ //coloca no div com id=placeId (placeHolder) a estrutura de menus definida na json string this.menu (xMenu)
			//-------------------------------------------------------------------------------------------
				//---------------cleans everything above wrapper-------------
				//http://shaneosullivan.wordpress.com/2009/01/02/deleting-dom-nodes-with-dojo/
				//dojo.forEach(["wrapper"], dojo._destroyElement);//neste caso só há um..
				var xMenu=this.menu;
				var placeHolder=this.placeId;
				var xyLevel=null;//matricula da posição do menu exe "2,0,3,4"
				
				DomConstruct.empty(placeHolder);//safely removes all children of the node
				//-----------------------------------------------------------	
				var xTopMenuBar = new MenuBar({});
				//pMenu = new dijit.Menu({targetNodeIds: ["progmenu"]});
				var i,j,k;
				xLevel=1;
				console.log("---------------------- START ----------------------------------- ");

				for(i=0;i<xMenu.menus.length;i++){
					//--- sets first level -------
					var xDropDown = new DropDownMenu({}); //se houver children mete-os neste container
					this.xMenuCounter+=1;
					this.dropDownArr.push(xDropDown);
					xId="m_"+this.placeId+"_"+this.xMenuCounter;
					
					//console.log("mMenu.refreshMenu ---------------------------->1) dropDownArr received id="+xId);
					if(Registry.byId(xId)){
						console.log("mMenu.refreshMenu ---------> the node >"+xId+"< still exists in registry");
						Registry.remove(xId); //o belo tramanco...
					};
					//TRAMANCO para ter click no topbar
					//xMenu.menus[i].
					//var xOnClick=(jsonStr.onClick) ? jsonStr.onClick:function(){console.log("mMenu.fillDropDownItem onclick de PopupMenu");};//to prevent onclick is not a function
					var xOnMouseEnter=(xMenu.menus[i].onMouseEnter) ? xMenu.menus[i].onMouseEnter:function(){console.log("mMenu.refreshMenu onMouseEnter de PopupMenuBarItem");};//to prevent onclick is not a function
					//var xOnClick=(xMenu.menus[i].onClick) ? xMenu.menus[i].onClick:{};//to prevent onclick is not a function
					/*
					if(xMenu.menus[i].onClick){
						xOnClick=xMenu.menus[i].onClick;
					}else{
						xOnClick=function(){console.log("mMenu.refreshMenu onclick de PopupMenuBarItem");};
					};
					*/
					//console.log("mMenu.refreshMenu -+-+-+-+-----> xOnMouseEnter p/TopBar="+xMenu.menus[i].label+" -->"+xOnMouseEnter+"<--");

					xLabel=xMenu.menus[i].label;
					xArrLevel=[i];
					var xyLevel=i;
					xMenu.menus[i].yLevel=xyLevel;//insere yLevel no array menu
					console.log("mMenu.refreshMenu                        ->"+xArrLevel+" - "+xLabel);//é a régua para debug

					xTopMenuBar.addChild(new PopupMenuBarItem({
						id:xId,
						level:[i],
						yLevel:xyLevel,
						label:xMenu.menus[i].label,
						//onClick:xOnClick,
						onMouseEnter:xOnMouseEnter,
						popup:xDropDown
					},Win.doc.createElement(xId)));
					xMenu.menus[i]["id"]=xId;//insert new id property in topbar JSON - the same as xMenu.menus[i].id=xId;
					//console.log("mMenu.refreshMenu Top Level "+xArrLevel+"--->"+xMenu.menus[i].label);
					//----- Checks second level --- fills dropdown
					if("xPopup" in xMenu.menus[i]){ //verifica se há xPopup para o nivel de topo
						//alert("O menu bar "+i+" tem xPopup !!!");
						if(xMenu.menus[i].xPopup.length>0){ // só entra se existir xPopup
							//console.log("mMenu.refreshMenu -->Existem "+xMenu.menus[i].xPopup.length+" submenus (inc.Seps)");
							//xMenu.menus[i].yLevel=i;
							for(j=0;j<xMenu.menus[i].xPopup.length;j++){//carrega submenus (nivel 1)
								xArrLevel=[i,j];
								var xyLevel=i+","+j;
								if(xMenu.menus[i].xPopup[j].label=="_@Sep"){
									xMenu.menus[i].xPopup[j].level=xArrLevel;
									xDropDown.addChild(new MenuSeparator());
								  //console.log("mMenu.refreshMenu                        ->"+xArrLevel+" - "+xLabel); -- régua
									console.log("mMenu.refreshMenu                        --->Separator no Nivel 2 <--> TopMenu="+xMenu.menus[i].xPopup[j].level[0]+" Nivel2="+xMenu.menus[i].xPopup[j].level[1]);
								}
								else{
									xMenu.menus[i].xPopup[j].yLevel=xyLevel;//insere yLevel no array menu (no nivel 1)
									xDropDown.addChild(this.fillDropDownItem(xMenu.menus[i].xPopup[j],xLevel,xArrLevel)); //preenche itens do nível 2 em diante
									xLevel=1;//regressa ao nivel 1
								}
							}
						}
					}
				}
				xTopMenuBar.placeAt(placeHolder);
				xTopMenuBar.startup();
				// Now we should assign all menu Ids to xArrNodeIds array in order to get the rigth click menu
				//for(i=1;i<=xMenuCounter;i++){
				/*
				for(i=1;i<=this.xMenuCounter;i++){
					//xId="m"+i;
					xId="m_"+this.placeId+"_"+i;
					console.log("refreshMenu fim "+xId);
					//xArrNodeIds.push(Dom.byId(xId));
					this.xArrNodeIds.push(Dom.byId(xId));
				};
				*/
				console.log("-------------------- SUMMARY (atribui yLevel)---------------------------------");
				var k=0;
				for(var i0=0;i0<xMenu.menus.length;i0++){ //for each object at level 0 (topbar)
					//xId="m"+i;
					xId="m_"+this.placeId+"_"+(k++);
					//xMenu.menus[i0].yLevel=i0;
					console.log("refreshMenu fim -->Pos="+i0+" label="+xMenu.menus[i0].label+" id="+xMenu.menus[i0].id+" yLevel="+xMenu.menus[i0].yLevel);
					if(xMenu.menus[i0].xPopup){//only enters if exists xPopup at menu object i0 at level 0 
						jsonStr0=xMenu.menus[i0].xPopup;// the json inside xPopup[i0] at level  0 (topbar)
						//console.log("refreshMenu fim ----->"+jsonStr.length+" jsonStr="+JSON.stringify(jsonStr));
						for(var j0=0;j0<jsonStr0.length;j0++){ //for all objects inside jsonStr0 (the json inside xPopup[i0] at level  0 (topbar))
							//xMenu.menus[i0].xPopup[j0].yLevel=i0+","+j0;// next line will show because jsonStr0 is a reference to the same object as xMenu.menus[i0].xPopup;
							console.log("refreshMenu fim ----->Pos=("+i0+","+j0+") label="+jsonStr0[j0].label+" id="+jsonStr0[j0].id+" yLevel="+jsonStr0[j0].yLevel);
							if(jsonStr0[j0].xPopup){//only enters if exists xPopup inside jsonStr0 
								jsonStr1=jsonStr0[j0].xPopup;//the json inside xPopup[j0] at level  1 
								//console.log("refreshMenu fim --------->"+jsonStr1.length+" jsonStr="+JSON.stringify(jsonStr1));
								for(var j1=0;j1<jsonStr1.length;j1++){ 
									xMenu.menus[i0].xPopup[j0].xPopup[j1].yLevel=i0+","+j0+","+j1;
									console.log("refreshMenu fim -------->Pos=("+i0+","+j0+","+j1+") label="+jsonStr1[j1].label+" id="+jsonStr1[j1].id+" yLevel="+jsonStr1[j1].yLevel);
									if(jsonStr1[j1].xPopup){//only enters if exists xPopup inside jsonStr1 
										jsonStr2=jsonStr1[j1].xPopup;//the json inside xPopup[j1] at level  2 
										for(var j2=0;j2<jsonStr2.length;j2++){ 
											xMenu.menus[i0].xPopup[j0].xPopup[j1].xPopup[j2].yLevel=i0+","+j0+","+j1+","+j2;
											console.log("refreshMenu fim ----------->Pos=("+i0+","+j0+","+j1+","+j2+") label="+jsonStr2[j2].label+" id="+jsonStr2[j2].id+" yLevel="+jsonStr2[j2].yLevel);
											if(jsonStr2[j2].xPopup){//only enters if exists xPopup inside jsonStr2 
												jsonStr3=jsonStr2[j2].xPopup;//the json inside xPopup[j2] at level  3
												for(var j3=0;j3<jsonStr3.length;j3++){ 
													xMenu.menus[i0].xPopup[j0].xPopup[j1].xPopup[j2].xPopup[j3].yLevel=i0+","+j0+","+j1+","+j2+","+j3;
													console.log("refreshMenu fim -------------->Pos=("+i0+","+j0+","+j1+","+j2+","+j3+") label="+jsonStr3[j3].label+" id="+jsonStr3[j3].id+" yLevel="+jsonStr3[j3].yLevel);
												};
											};
										};
									};
								};
							};
						};
											
					};
				};
				console.log("-------------------- STOP ---------------------------------");

			}, //end of method refreshMenu	
			//-------------------------------------------------------------------------------------------
			fillDropDownItem:function(jsonStr,xLevel,xArrLevel){ //returns a dijit.MenuItem or dijit.MenuSeparator (in the deadEnd case) or a dijit.PopupMenuItem (in the case of submenus)
			//-------------------------------------------------------------------------------------------
			// jsonStr has the format: {label:"lbl1",xPopup:[{m1},{m2},{m3}]} where {m1} as the same format....
			// xArrLevel - Array with position of jsonStr in xMenu - The number of array itens==xLevel
			// xfillDropDownItem=fillDropDownItem(xMenu.menus[i].xPopup[j]);
				console.log("fillDropDownItem ENTRY "+JSON.stringify(jsonStr));
				xLevel++;
				var xArr=new Array();
				if(xLevel==2){
					var xArrLevel=[xArrLevel[0],xArrLevel[1]];
				}
				else{
					if(xArrLevel.length<xLevel)
						xArrLevel.push(0);
					else
						xArrLevel[xLevel-1]++;
				}
				jsonStr.level=xArrLevel;
				var F2On=false;
				if("xPopup" in jsonStr){// checks if property xPopup exists - alternativa a if(jsonStr.xPopup)
					// there are submenus a dijit.PopupMenuItem will be returned 
					var xCountSubmenus=jsonStr.xPopup.length //number os submenus == number of array elements
					//var xMenuContainer = new dijit.Menu({}); 
					var xMenuContainer = new Menu({}); 
					var k;
					for(k=0;k<xCountSubmenus;k++){
						//children will be stored as dijit.MenuItem inside a dijit.Menu container
						//but some children may contain other children....
						//We check if each children has the xPopup property...so we call fillDropDownItem() recursively
						var	xyLevel=jsonStr.yLevel+","+k;
						jsonStr.xPopup[k].yLevel=xyLevel;
						var xfillDropDownItem=this.fillDropDownItem(jsonStr.xPopup[k],xLevel,xArrLevel); //xfillDropDownItem can be a dijit.MenuItem (in the deadEnd case) or a dijit.PopupMenuItem (in the case of submenus)
						xMenuContainer.addChild(xfillDropDownItem);		
					}
					this.xMenuCounter+=1;
					//xId="m"+this.xMenuCounter;
					xId="m_"+this.placeId+"_"+this.xMenuCounter;

					xLabel=jsonStr.label;
					xLevel--;
					//----- xArrLevel.length tem de baixar 1 grau.
					xArrLevel.pop(); //removes last array item
					jsonStr.id=xId;
					jsonStr.level=xArrLevel;
					jsonStr.zLevel=jsonStr.level+"#";
					var xyLevel=jsonStr.yLevel;
					var xOnClick=(jsonStr.onClick) ? jsonStr.onClick:function(){console.log("mMenu.fillDropDownItem onclick de PopupMenu");};//to prevent onclick is not a function
					//var xOnMouseEnter=(jsonStr.onMouseEnter) ? jsonStr.onMouseEnter:function(){console.log("mMenu.fillDropDownItem DeadEnd onMouseEnter "+jsonStr.label);}; //to prevent onclick is not a function

					//var xPopupMenuItem=new dijit.PopupMenuItem({
					var xPopupMenuItem=new PopupMenuItem({
						id:xId,
						label: jsonStr.label,
						iconClass:jsonStr.iconClass,
						level: jsonStr.level,
						zlevel:jsonStr.level+"#",
						yLevel:xyLevel,
						//onClick:xOnClick,
						//onMouseEnter:xOnMouseEnter,
						//onMouseEnter:function(){alert("PopupMenuItem yLevel="+this.yLevel)},
						//onMouseUp:function(){alert("PopupMenuItem yLevel="+this.yLevel)},
						onMouseUp:xOnClick,
						//onClick:{if (jsonStr.onClick) {
						//			jsonStr.onClick}
						//		else{""}},
						onKeyPress:function(event){ //event.charOrCode, event.keyCode and event.ctrlKey event.altKey, event.shift.Key
							//alert("KEYPRESS !!!-->"+jsonStr.id+" - "+jsonStr.label+" key>"+event.charOrCode+"<>"+event.ctrlKey+"<");
							if(event.charOrCode==114){ //F3 key
								xInhibitsHover=!xInhibitsHover;//later on should show xInhibitsHover status (true=>design mode false=>run mode)
							}
							if(!F2On){
								if(event.charOrCode==113){ //F2 key
									F2On=true;
									// qdo carregamos em F2 com F3 on (menu design) o dropdown button é colocado no topo
									//xInhibitsHover=true;//mode menu design
									console.log("mMenu.fillDropDownItem ---------------------------------------------- execution time ------------------------------------------------");
									// In execution time we only read the already existing marks in json blocks.....
									// a correr o onKeyPress event a jason string na execução é:
									console.log("mMenu.fillDropDownItem -- Json na execução:"+JSON.stringify(jsonStr));

									var node=dojo.byId(this.id);// the same as var node=dojo.byId(jsonStr.id);
									alert("mMenu.fillDropDownItem KEYPRESS F2 !!!-->Level="+this.level+" ->"+this.id+" - "+this.label+" - ["+this.level+"] ->"+this.zlevel+"->"+node.innerHTML);
									//var def = new dojo.Deferred();
									xArrLabel=[jsonStr.label];//passa por reference
									console.log("mMenu.fillDropDownItem PopupMenuItem---> Vai entrar em editMenu com "+this.label+" level="+this.level+" zLevel="+this.zlevel);
									editMenu(xArrLabel,jsonStr.id,jsonStr); //to pass value by reference
									jsonStr.label=xArrLabel[0];
									//xInhibitsHover=false;//mode menu  run
									console.log("mMenu.fillDropDownItem PopupMenuItem---> Volta de editMenu com "+jsonStr.label);
								}
							}
						},
						popup:xMenuContainer
					//},dojo.doc.createElement(xId));
					},Win.doc.createElement(xId));
				  //console.log("mMenu.fillDropDownItem dead end          --->"+xArr+" - "+xLabel+" jsonStr="+JSON.stringify(jsonStr));
					console.log("mMenu.fillDropDownItem-regride de nivel  --->"+jsonStr.level+" - "+jsonStr.label+" id="+xId+" TopMenu="+jsonStr.level[0]+" Nivel2="+jsonStr.level[1]);	

					//xLevel--;//retorna ao xLevel anterior
					//xArrLevel.pop();
					return xPopupMenuItem;
				}
				else{//o Json que foi recebido como param de fillDropDownItem não tem submenus... (no xPopup)
					// xPopup does not exist =>dead end=>returns a dijit.MenuItem or a separator
					jsonStr.level=xArrLevel;
					if(jsonStr.label=="_@Sep"){
						//xMenuItem=new dijit.MenuSeparator();
						xMenuItem=new MenuSeparator();
						console.log("mMenu.fillDropDownItem -->Separator no Nivel "+xLevel+"==["+jsonStr.level+"] <--> TopMenu="+jsonStr.level[0]+" Nivel2="+jsonStr.level[1]);
					}
					else{//dead End
						this.xMenuCounter+=1;
						//xId="m"+this.xMenuCounter;
						xId="m_"+this.placeId+"_"+this.xMenuCounter;
						xLabel=jsonStr.label;
						xArr=jsonStr.level;
						xyLevel=jsonStr.yLevel;
						jsonStr.id=xId;
						jsonStr.zLevel=jsonStr.level+"#";
						

						//jsonStr.level=[xi,xj];
						// ao construir o dijit.MenuItem() a jason string é:
						//console.log("mMenu.refreshMenu                        ->"+xArrLevel+" - "+xLabel); -- régua
						console.log("mMenu.fillDropDownItem dead end          --->"+xArr+" - "+xLabel+" jsonStr="+JSON.stringify(jsonStr));
						var xOnClick=(jsonStr.onClick) ? jsonStr.onClick:function(){console.log("mMenu.fillDropDownItem DeadEnd onClick "+jsonStr.label);}; //to prevent onclick is not a function
						//var xMenuItem=new dijit.MenuItem({
						var xMenuItem=new MenuItem({
							id:xId,
							label: jsonStr.label,
							level: jsonStr.level,
							zlevel:jsonStr.level+"#",
							yLevel:xyLevel,
							iconClass:jsonStr.iconClass,
							onClick:xOnClick,
							onKeyPress:function(event){ //event.charOrCode, event.keyCode and event.ctrlKey event.altKey, event.shift.Key
								//alert("KEYPRESS !!!-->"+jsonStr.id+" - "+jsonStr.label+" key>"+event.charOrCode+"<>"+event.ctrlKey+"<");
								if(event.charOrCode==114){ //F3 key
									xInhibitsHover=!xInhibitsHover;//later on should show xInhibitsHover status (true=>design mode false=>run mode)
								}
								if(!F2On){
									if(event.charOrCode==113){ //F2 key
										F2On=true;
										// qdo carregamos em F2 com F3 on (menu design) o dropdown button é colocado no topo
										//xInhibitsHover=true;//mode menu design
										console.log("mMenu.fillDropDownItem ---------------------------------------------- execution time ------------------------------------------------");
										// In execution time we only read the already existing marks in json blocks.....
										// a correr o onKeyPress event a jason string na execução é:
										console.log("mMenu.fillDropDownItem Json na execução:"+JSON.stringify(jsonStr));

										var node=Dom.byId(this.id);// the same as var node=dojo.byId(jsonStr.id);
										//alert("KEYPRESS F2 !!!-->"+this.id+" - "+this.label+" - ["+this.level+"] ->"+this.zlevel+"->"+node.innerHTML);
										//var def = new dojo.Deferred();
										xArrLabel=[jsonStr.label];//passa por reference
										console.log("mMenu.fillDropDownItem ---> Vai entrar em editMenu com "+this.label+" level="+this.level+" zLevel="+this.zlevel);
										editMenu(xArrLabel,jsonStr.id,jsonStr); //to pass value by reference
										jsonStr.label=xArrLabel[0];
										//xInhibitsHover=false;//mode menu  run
										console.log("mMenu.fillDropDownItem ---> Volta de editMenu com "+jsonStr.label);
									}
								}
							},
							popup:""
						//},dojo.doc.createElement(xId));
						},Win.doc.createElement(xId));

						if(F2On){
							console.log("mMenu.fillDropDownItem Pós F2 --> Acabou de terminar o Menu item --->"+jsonStr.label);
						}
				//console.log("mMenu.fillDropDownItem                   --->"+jsonStr.level+" - "+jsonStr.label+" xId="+xId+" TopMenu="+jsonStr.level[0]);	
				//console.log("mMenu.fillDropDownItem                       "+xId+":::Dead End:::>Nivel="+xLevel+"==["+xMenuItem.level+"] -->"+xMenuItem.label+"-->"+xMenuItem.zlevel);	
					}
					xLevel--;//retorna ao xLevel anterior
					return xMenuItem;
				}
			},//end of method fillDropDownItem	
			destroy:function(){
				// dropDownArr contains the dropdown var so that we can delete it with  destroyRecursive()
				for(var i=0;i<this.dropDownArr.length;i++){
					//DomConstruct.destroy("dijit_DropDownMenu_"+i);
					//console.log("DESTROY() menu="+this.placeId+" destroe o dropDown #"+i);
					this.dropDownArr[i].destroyRecursive(true);//Destroy this widget and its descendants (without preserving dom nodes (false)
					//this.dropDownArr[i].destroyRendering();//Destroy this DOM nodes associated with this widge
					//DomConstruct.destroy("dijit_Menu_"+i);		
				};
				//var widgets = dijit.findWidgets(<containerDiv>);//registry.findWidgets returns an array of all non-nested widgets inside the given DOM node.
				//dojo.forEach(widgets, function(w) {
				//	w.destroyRecursive(true);
				//});
				DomConstruct.destroy(this.placeId);
			}//end of method destroy
			// notice that test is called form menu object - it exterior to the class... test:function(){alert("mMenu.test test message in function test");
		});//end of class mMenu
	}//closing of main callback function		
);//closing of define function
