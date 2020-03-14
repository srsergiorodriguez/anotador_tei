// Interfaz de anotación TEI
// Versión 0.1
// Por Sergio Rodríguez Gómez
// MIT LICENSE
// Este código se puede copiar, modificar y distribuir libremente

let url; // Guarda la url del archivo subido por el usuario
let xml; // Guarda el objeto XML sobre el que se harán modificaciones
let current = {
  label: "persName", // El label inicial del DOM select
  selection: null, // La selección de texto actual
  range: null, // El rango de texto actual (se actualiza con el botón etiquetar)
  attrkeys: [], // Las claves de los atributos actuales
  attrvalues: [] // Los valores de los atributos actuales
}

let attrCheckbox; // Checkbox para definir si se añaden atributos
let attrSelection = false; // ¿Se añaden atributos?

let encabezado; // Contiene el valor del div de tipo encabezado
let cuerpo; // Contiene el valor del div de tipo cuerpo
let leyenda; // Contiene el valor del div de tipo leyenda
let encabezado_elements = []; // Contiene los elementos child del div encabezado
let cuerpo_elements = []; // Contiene los elementos child del div cuerpo
let leyenda_elements = []; // Contiene los elementos child del div leyenda

// Una lista de labels por defecto
// TODO: poner aquí los labels TEI más comunes
// TODO2: incluir la opción de agregar sub esquemas TEI
let label_list = ["persName", "placeName", "orgName", "q", "label"];

// Una lista de colores por defecto
// Si se añaden nuevas etiquetas, se añaden colores aleatorios a esta lista
let color_list = ["#99ff66", "#bf80ff", "#ff6699", "#3399ff", "#ffcc00", "#ffff66", "#669999"];

// El elemento select que contiene los lables de label_list
let select_label;

// Un elemento textarea en el que se muestra el XML codificado final
let output;

function setup() {
  noCanvas();
  loadXMLui();
  select("#date").html(`${new Date().getFullYear()}`);
}

function loadXMLui() {
  // Muestra la interfaz inicial de carga de archivos
  createElement("label")
    .id("loadXML_label")
    .html("Seleccionar el archivo")
    .attribute("for", "xml_file")
    .parent("load_ui_container")

  createSpan("...No has seleccionado ningún archivo")
    .id("loadXML_span")
    .parent("load_ui_container")

  let loadXML = createElement("input");
  loadXML.parent("load_ui_container");
  loadXML.id("xml_file");
  loadXML.attribute("type", "file");
  loadXML.attribute("accept", "text/xml");
  loadXML.changed(()=>{
    select("#loadXML_span").html(document.getElementById('xml_file').files[0].name);
  })

  let loadXML_Btn = createButton("Cargar");
  loadXML_Btn.parent("#load_ui_container");
  loadXML_Btn.mouseReleased(()=>{
    if (loadXML.value()!="") {
      let reader = new FileReader();
      let file = document.getElementById('xml_file').files[0];
      url = window.URL.createObjectURL(file);
      defineXML();
    } else {
      alert("Carga un archivo XML primero");
    }
  })
}

function defineXML() {
  loadXML(url,loadUI);
}

function loadUI(xml_input) {
  // Muestra la interfaz de anotación
  select("#anotator_container").show();
  xml = xml_input;
  let divs = xml.getChild("text").getChild("body").getChildren();
  getXMLelements(divs);
  createHTMLelements();
  highlightHTMLelements();

  showLabelingUI();
  if (select("#save_btn")) {select("#save_btn").remove()}
  let saveBtn = createButton("Exportar anotación").id("save_btn");
  saveBtn.parent("button_container");
  saveBtn.mouseReleased(()=>{
    output.html(xml.serialize());
  });

  if (select("#output_export")) {select("#output_export").remove()}
  output = createElement("textarea", "").id("output_export");
  output.parent("output_container");
}

function getXMLelements(divs) {
  encabezado = divs[0].getChildren();
  cuerpo = divs[1].getChildren();
  leyenda = divs[2].getChildren();
}

function createHTMLelements() {
  if (select("#text_subcontainer")) {select("#text_subcontainer").remove()}
  createDiv("").id("text_subcontainer").parent("text_container");
  encabezado.map((XMLelement,i)=>{
    encabezado_elements[i] = createElement('h1',XMLelement.getContent());
    encabezado_elements[i].parent("#text_subcontainer");
  });
  cuerpo.map((XMLelement,i)=>{
    cuerpo_elements[i] = createP(XMLelement.getContent());
    cuerpo_elements[i].parent("text_subcontainer");
  });
  leyenda.map((XMLelement,i)=>{
    leyenda_elements[i] = createElement("h2",XMLelement.getContent());
    leyenda_elements[i].parent("text_subcontainer");
  });
}

function highlightHTMLelements() {
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

function showLabelingUI() {
  select("#labels_position").show();
  if (select("#labels_container")) {select("#labels_container").remove()}
  createDiv("").id("labels_container").show().parent("#labels_position");
  createP("Selecciona la etiqueta:").parent("#labels_container");
  setOptions();
  setLabelButton();
  setAttributeCheckbox();
  setConventions();
  setAdditionalLabels();
}

function setOptions() {
  select_label = createSelect().id("select_label");
  select_label.parent("labels_container");
  for (const e of label_list) {
    select_label.option(e);
  }
}

function setLabelButton() {
  let labelBtn = createButton("Etiquetar").id("label_btn");
  labelBtn.parent("labels_container");
  labelBtn.mouseReleased(()=>{
    current.range = window.getSelection().getRangeAt(0);
    if (current.selection) {
      if (current.selection.toString().length < 1) {
        alert("Selecciona la parte del texto que quieres etiquetar");
      } else {
        if (attrCheckbox.checked()==true) {
          showAttributeUI();
        } else {
          addLabel();
        }
      }
    } else {
      alert("Selecciona la parte del texto que quieres etiquetar");
    }
  }); 
}

function showAttributeUI() {
  select("#attributes_position").show();
  if (select("#attributes_container")) {select("#attributes_container").remove()}
  createDiv("").id("attributes_container").show().parent("#attributes_position");
  createP("Define los atributos:").parent("#attributes_container");

  createDiv("").id("attributes_subcontainer").parent("#attributes_container");
  createKeyValueInput();

  let moreBtn = createButton("Más atributos").parent("#attributes_container");
  moreBtn.mouseReleased(()=>{
    createKeyValueInput();
  });
  let acceptBtn = createButton("Etiquetar").parent("#attributes_container");
  acceptBtn.mouseReleased(()=>{
    current.attrkeys = selectAll(".attr_keys").map(d=>d.value());
    current.attrvalues = selectAll(".attr_values").map(d=>d.value());
    select("#attributes_position").hide();
    select("#attributes_container").remove();
    addLabel();
  });
  let cancelBtn = createButton("Cancelar").parent("#attributes_container");
  cancelBtn.mouseReleased(()=>{
    select("#attributes_position").hide();
    select("#attributes_container").remove();
  });
}

function createKeyValueInput() {
  createInput("Clave").style("border-radius", "0px").class("attr_keys").parent("attributes_subcontainer");
  createInput("Valor").style("border-radius", "0px").class("attr_values").parent("attributes_subcontainer");
}

function setAttributeCheckbox() {
  attrCheckbox = createCheckbox("¿Incluir atributos?", attrSelection).id("attr_checkbox");
  attrCheckbox.parent("labels_container");
}

function addLabel() {
  current.label = select_label.value();
  let label = document.createElementNS("http://www.tei-c.org/ns/1.0", current.label);
  setLabelAttributes(label);
  current.range.surroundContents(label);
  current.xml.setContent(current.html.html());
  current.selection = null;
  current.range = null;
}

function setLabelAttributes(label) {
  for (let i = 0; i < current.attrkeys.length; i++) {
    label.setAttribute(current.attrkeys[i],current.attrvalues[i]);
  }
  current.attrkeys = [];
  current.attrvalues = [];
}

function setConventions() {
  let conv = createDiv("")
  conv.id("conventions").parent("labels_container");
  createP("Convenciones:").parent("conventions");
  let styling = "";
  for (let e in label_list) {
    createP(label_list[e])
    .parent("conventions")
    .style("background", color_list[e])
    .class("conventions_p")

    styling+=`
    #text_container ${label_list[e]} {
      background: ${color_list[e]};
    }
    `
  }
  if (select("#label_styling")) {select("#label_styling").remove()}
  createElement("style", styling).id("label_styling");
}

function setAdditionalLabels() {
  let inp = createInput("Nueva etiqueta")
  inp.id("new_label")
  .style("border-radius", "0px")
  .parent("labels_container")

  createButton("Agregar")
  .id("new_label_btn")
  .parent("labels_container")
  .mouseReleased(()=>{
    if (!label_list.includes(inp.value())) {
      label_list.push(inp.value());
      color_list.push(randomHexColor());
      showLabelingUI();
    } else {
      alert("La etiqueta ya existe");
    }
  });
}

// Helpers --------------- *

function randomHexColor() {
  let rgb = [];
  for (let i = 0; i < 3; i++) {
    rgb[i] = int(random(255));
  }
  let hexColor = "#";
  rgb.map(e=>hexColor+=hex(e,2));
  return hexColor
}