// Interfaz de anotación TEI
// Versión 1.0
// Por Sergio Rodríguez Gómez
// MIT LICENSE
// Este código se puede copiar, modificar y distribuir libremente

/*
Descripción: este es el código de una interfaz que sirve para anotar 
textos con el esquema TEI (Text Encoding Initiative). 
Básicamente, la interfaz muestra el contenido de un documento preformateado en TEI
y permite añadir etiquetas y attributos a partes del documento seleccionadas.
El contenido etiquetado se resalta con varios colores para que sea fácil de seguir.
El documento con las nuevas anotaciones puede luego exportarse.
*/

/* TODOS:
  -poner una lista de los labels TEI más comunes
  -incluir la opción de agregar sub esquemas TEI para distintos tipos de textos
  -incluor una interfaz que permita crear in TEI XML desde cero con especificaciones mínimas
  -arreglar los colores al azar para que no salgan colores oscuros
*/

let url; // Guarda la url del archivo subido por el usuario
let xml; // Guarda el objeto XML sobre el que se harán modificaciones
let current = {
  label: "persName", // El label inicial del DOM select
  selection: null, // La selección de texto actual
  range: null, // El rango de texto actual (se actualiza con el botón etiquetar)
  attrkeys: [], // Las claves de los atributos actuales
  attrvalues: [], // Los valores de los atributos actuales
  text: null,
  textdiv: null
}

let attrCheckbox; // Checkbox para definir si se añaden atributos
let attrSelection = false; // ¿Se añaden atributos?

let label_list = ["div","p","persName","placeName","orgName","q","label"];

// Una lista de colores por defecto
// Si se añaden nuevas etiquetas, se añaden colores aleatorios a esta lista
let color_list = ["#e8f3ff","#e8fff0","#99ff66","#bf80ff","#ff6699","#3399ff","#ffcc00","#ffff66","#a1f0f0"];

// El elemento select que contiene los labels de label_list
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

  // El botón que se presiona para abrir el explorador de carga
  createElement("label")
    .id("loadXML_label")
    .html("Seleccionar el archivo")
    .attribute("for","xml_file")
    .parent("load_ui_container")

  // Span que muestra el nombre del archivo o la advertencia de que no se ha seleccionado ningún archivo
  createSpan("...No has seleccionado ningún archivo")
    .id("loadXML_span")
    .parent("load_ui_container")

  // El input del archivo, permanece oculto y es remplazado por el botón "label"
  let loadXML = createElement("input");
  loadXML.parent("load_ui_container");
  loadXML.id("xml_file");
  loadXML.attribute("type", "file");
  loadXML.attribute("accept", "text/xml");
  loadXML.changed(()=>{
    select("#loadXML_span").html(document.getElementById('xml_file').files[0].name);
  })

  // El botón para confirmar la carga del archivo
  let loadXML_Btn = createButton("Cargar");
  loadXML_Btn.parent("#load_ui_container");
  loadXML_Btn.mouseReleased(()=>{
    if (loadXML.value()!="") {
      let reader = new FileReader();
      let file = document.getElementById('xml_file').files[0];
      url = window.URL.createObjectURL(file);
      defineXML();
    } else {
      // Una advertencia en caso de que se presione el botón sin cargar nada
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
  console.log(xml);
  current.text = xml.getChild("text").DOM.innerHTML;
  createHTMLelements();
  highlightHTMLelements();
  showLabelingUI();
  showExportUI();
}

function createHTMLelements() {
  if (select("#text_subcontainer")) {select("#text_subcontainer").remove()}
  createDiv("").id("text_subcontainer").parent("text_container");
  current.textdiv = createDiv(current.text).parent("#text_subcontainer");
}

function highlightHTMLelements() {
  current.textdiv.mouseReleased(()=>{
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

function showExportUI() {
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
  let label = document.createElementNS("http://www.tei-c.org/ns/1.0",current.label);
  current.range.surroundContents(label);
  setLabelAttributes(label);
  xml.getChild("text").DOM.innerHTML = current.textdiv.html();
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

/* Funciones de ayuda --------------- */
function randomHexColor() {
  let rgb = [];
  for (let i = 0; i < 3; i++) {
    rgb[i] = int(random(255));
  }
  let hexColor = "#";
  rgb.map(e=>hexColor+=hex(e,2));
  return hexColor
}