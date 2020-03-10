// Interfaz de anotación TEI
// Versión 0.1
// Por Sergio Rodríguez Gómez
// MIT LICENSE
// Este código se puede copiar, modificar y distribuir libremente

let url = 'test.xml';
let xml;
let current = {
  label: "persName",
  selection: null
}

let encabezado;
let cuerpo;
let leyenda;
let encabezado_elements = [];
let cuerpo_elements = [];
let leyenda_elements = [];

let label_list = ["persName", "placeName", "orgName", "q", "label"];
let color_list = ["#99ff66", "#bf80ff", "#ff6699", "#3399ff", "#ffcc00", "#ffff66", "#669999"];
let select_label;

let output;

function setup() {
  noCanvas();
  loadXMLui();
  output = createElement("textarea", "");
  output.parent("output_container");
}

function loadXMLui() {
  let loadXML = createElement("input");
  loadXML.parent("load_ui_container");
  loadXML.attribute("type", "file");
  let loadXML_Btn = createButton("Cargar");
  loadXML_Btn.parent("#load_ui_container");
  loadXML_Btn.mouseReleased(()=>{
    if (loadXML.value()!="") {
      console.log(loadXML.value());
      url = loadXML.value();
      defineXML();
    } else {
      defineXML();
      console.log("Se cargó un XML de prueba")
      //alert("Carga un archivo XML primero");
    }
  })
}

function defineXML() {
  loadXML(url, loadUI);
}

function newLabel() {
  if (select("#new_label")) {
    select("#new_label").remove();
    select("#new_label_btn").remove();
  }
  let inp = createInput("nueva etiqueta")
  inp.id("new_label")
  .parent("labels_container")
  createButton("agregar")
  .id("new_label_btn")
  .parent("labels_container")
  .mouseReleased(()=>{
    if (!label_list.includes(inp.value())) {
      label_list.push(inp.value());
      color_list.push(randomHexColor());
      defineCurrentLabel();
    } else {
      alert("La etiqueta ya existe");
    }
  });
}

function defineCurrentLabel() {
  select("#labels_container").show();
  setOptions();
  setButton();
  setConventions();
  newLabel();
}

function setButton() {
  if (select("#label_btn")) {select("#label_btn").remove();}
  let labelBtn = createButton("Etiquetar").id("label_btn");
  labelBtn.parent("labels_container");
  labelBtn.mouseReleased(()=>{
    if (current.selection) {
      addLabel();
    } else {
      console.log(current.selection);
    }
  }); 
}

function setOptions() {
  if (select("#select_label")) {select("#select_label").remove();}
  select_label = createSelect().id("select_label");
  select_label.parent("labels_container");
  for (const e of label_list) {
    select_label.option(e);
  }
}

function setConventions() {
  select("#conventions").remove();
  let conv = createDiv("")
  conv.id("conventions").parent("labels_container");
  createP("Convenciones:").parent("conventions");
  let styling = "";
  for (let e in label_list) {
    createP(label_list[e])
    .parent("conventions")
    .style("background", color_list[e]);

    styling+=`
    ${label_list[e]} {
      background: ${color_list[e]};
    }
    `
  }
  if (select("#label_styling")) {select("#label_styling").remove();}
  createElement("style", styling).id("label_styling");
}

function loadUI(xml_input) {
  xml = xml_input;
  let divs = xml.getChild("text").getChild("body").getChildren();
  getXMLelements(divs);
  createHTMLelements();
  anotateHTMLelements();
  defineCurrentLabel();

  let saveBtn = createButton("Exportar anotación");
  saveBtn.parent("ui_container");
  saveBtn.mouseReleased(()=>{
    console.log(xml.serialize());
    output.html(xml.serialize());
  })
}

function getXMLelements(divs) {
  encabezado = divs[0].getChildren();
  cuerpo = divs[1].getChildren();
  leyenda = divs[2].getChildren();
}

function createHTMLelements() {
  encabezado.map((XMLelement,i)=>{
    encabezado_elements[i] = createElement('h1',XMLelement.getContent());
    encabezado_elements[i].parent("text_container");
  });
  cuerpo.map((XMLelement,i)=>{
    cuerpo_elements[i] = createP(XMLelement.getContent());
    cuerpo_elements[i].parent("text_container");
  });
  leyenda.map((XMLelement,i)=>{
    leyenda_elements[i] = createP(XMLelement.getContent());
    leyenda_elements[i].parent("text_container");
  });
}

function anotateHTMLelements() {
  encabezado.map((XMLelement,i)=>{
    updateCurrent(encabezado_elements[i], XMLelement)
  });
  cuerpo.map((XMLelement,i)=>{
    updateCurrent(cuerpo_elements[i], XMLelement)
  });
  leyenda.map((XMLelement,i)=>{
    updateCurrent(leyenda_elements[i], XMLelement)
  });
}

function updateCurrent(html_e, xml_e) {
  html_e.mouseReleased(()=>{
    current.xml = xml_e;
    current.html = html_e;
    current.selection = window.getSelection();
  })
}

function addLabel() {
  current.label = select_label.value();
  let label = document.createElementNS("http://www.tei-c.org/ns/1.0", current.label);
  current.selection.getRangeAt(0).surroundContents(label);
  current.xml.setContent(current.html.html());
}

function randomHexColor() {
  let rgb = [];
  for (let i = 0; i < 3; i++) {
    rgb[i] = int(random(255));
  }
  let hexColor = "#";
  rgb.map(e=>hexColor+=hex(e,2));
  return hexColor
}