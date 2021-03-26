window.globals = {
  mode: "Default",
  newCalcEntry: function (id, displayString) {
    var calc = document.getElementById("calcDisplay");
    var newCalcEntry = document.createElement("div");
    var newDiv = document.createElement("div");
    var newCheckbox = document.createElement("input");
    var newPar = document.createElement("span");
    var infoButton = document.createElement("button");
    var settingsButton = document.createElement("button");
    var infoIcon = document.createElement("i");
    var settingsIcon = document.createElement("i");
    infoButton.classList.add("push-right");
    infoButton.id = "toggle-info" + id;
    infoButton.title = "Toggle Info";
    infoIcon.classList.add("fa");
    infoIcon.classList.add("fa-info");
    infoButton.appendChild(infoIcon);
    settingsButton.classList.add("toggle-settings");
    settingsButton.title = "Toggle Settings";
    settingsButton.id = "toggle-settings" + id;
    settingsIcon.classList.add("fa");
    settingsIcon.classList.add("fa-sliders");
    settingsButton.appendChild(settingsIcon);
    settingsButton.onclick = function () {
      var stylePanel = document.getElementById("style-panel" + id);
      if (!stylePanel) {
        var myStyle = globals.getStyleById(id);
        globals.styleControls(id, myStyle);
      } else {
        stylePanel.remove();
      }
    };
    newCalcEntry.classList.add("calc-entry");
    newCalcEntry.id = "calc-entry" + id;
    newDiv.classList.add("calc-entry-header");
    newPar.textContent = displayString;
    newCheckbox.type = "checkbox"; // What are these 3 used for?
    newCheckbox.name = "name";
    newCheckbox.value = "value";
    newCheckbox.checked = true;
    //newCalcEntry.id = "calc-entry" + id;
    newCheckbox.onchange = function () {
      globals.setProps(id, { visible: this.checked });
    };
    newDiv.appendChild(newCheckbox);
    newDiv.appendChild(newPar);
    newDiv.appendChild(infoButton);
    newDiv.appendChild(settingsButton);
    newCalcEntry.appendChild(newDiv);
    calc.appendChild(newCalcEntry);
  },
  styleControls: function (id, styleObj) {
    var containerDiv;
    if (id === 0) {
      containerDiv = document.getElementById("calcDisplay");
    } else {
      containerDiv = document.getElementById("calc-entry" + id);
    }
    var styleDiv = document.createElement("div");
    var attrDiv;
    var keyList = ["strokeColor", "fillColor", "strokeWidth"];
    styleDiv.classList.add("control-panel");
    styleDiv.id = "style-panel" + id;
    for (var i = 0; i < keyList.length; i++) {
      var key = keyList[i];
      var val = styleObj[key];
      var labelText = keyList[i].replace(/([A-Z])/g, " $1");
      var labelText = labelText.charAt(0).toUpperCase() + labelText.slice(1);
      if (keyList[i] === "fillColor" || keyList[i] === "strokeColor") {
        attrDiv = makeColorInputDiv({
          propString: keyList[i],
          obj: styleObj,
          label: labelText,
        });
      } else {
        attrDiv = makeInputDiv({
          propString: keyList[i],
          obj: styleObj,
          label: labelText,
          inputType: "range",
          min: 1,
          max: 15,
        });
      }
      styleDiv.appendChild(attrDiv);
    }
    containerDiv.appendChild(styleDiv);
  },
  infoPanel: function (id, dataObj) {
    var containerDiv = document.getElementById("calc-entry" + id);
    var infoDiv = document.createElement("div");
    var attrDiv;
    var keyList = ["strokeColor", "fillColor", "strokeWidth"];
    var keys = {
      Shape: ["position", "radius", "size"],
    };
    infoDiv.classList.add("info-panel");
    infoDiv.id = "info-panel" + id;
    for (var i = 0; i < keyList.length; i++) {
      var key = keyList[i];
      var val = dataObj[key];
      var labelText = keyList[i].replace(/([A-Z])/g, " $1");
      var labelText = labelText.charAt(0).toUpperCase() + labelText.slice(1);
      attrDiv = makeInfoDiv({
        propString: keyList[i],
        obj: dataObj,
        label: labelText,
      });
      infoDiv.appendChild(attrDiv);
    }
    containerDiv.appendChild(infoDiv);
  },
};
window.onload = function () {
  var canvasDiv = document.getElementById("canvasContainer");
  var modeButtonBar = makeButtonBar([
    {
      faPrefix: "fas",
      faIcon: "fa-mouse-pointer",
      mode: "Default",
    },
    {
      faPrefix: "fas",
      faIcon: "fa-marker",
      mode: "Draw",
    },
    {
      faPrefix: "fas",
      faIcon: "fa-eraser",
      mode: "Erase",
    },
    {
      faPrefix: "fas",
      faIcon: "fa-hand-sparkles",
      mode: "Magic",
    },
    {
      faPrefix: "fas",
      faIcon: "fa-share-alt",
      mode: "Edge",
    },
    {
      faPrefix: "fas",
      faIcon: "fa-search",
      mode: "Scan",
    },
  ]);
  var buttonUndo = document.createElement("button");
  var buttonRedo = document.createElement("button");
  var buttonHide = document.getElementById("hideCalc");
  var plusButton = document.getElementById("plusButton");
  canvasDiv.appendChild(modeButtonBar);
  buttonHide.onclick = function (event) {
    var calc = document.getElementById("calcDisplay");
    calc.classList.toggle("hide");
    buttonHide.children[0].classList.toggle("fa-angle-double-right");
    buttonHide.children[0].classList.toggle("fa-angle-double-left");
  };
  plusButton.onclick = function (event) {
    globals.zoomCanvas();
  };
  setIcon(buttonUndo, "fa-undo", "fas");
  setIcon(buttonRedo, "fa-redo", "fas");
};

function getInputVal(htmlInput) {
  var keyByType = {
    checkbox: "checked",
    range: "valueAsNumber",
    number: "valueAsNumber",
  };
  var propKey = keyByType[htmlInput.type] ? keyByType[htmlInput.type] : "value";
  return htmlInput[propKey];
}
// This is merely an example of how a more general input system might work.
var inputObj = {
  label: "RGBA", // Not so much label as type of input.
  inputs: ["checkbox", "color", "range"],
  getter: function (color) {
    var on = color ? true : false;
    var hexAlpha = toHex(color);
    return [on, hexAlpha[0], hexAlpha[1]];
  },
  setter: function (inputArray) {
    var on = inputArray[0].checked;
    var hex = inputArray[1].value;
    var alpha = inputArray[2].valueAsNumber;
    if (!on) return null;
    return hex + alpha.toString(16);
  },
};

function setInputVal(htmlInput, value) {
  return;
}

function makeInputDiv(args) {
  var containerDiv = document.createElement("div");
  var label = document.createElement("label");
  // Rethink these two.
  var valueToSet = args.propString;
  var currentVal = args.obj ? args.obj[valueToSet] : null;
  containerDiv.classList.add("setting-control");
  label.innerHTML = args.label;
  label.classList.add("push-left");
  containerDiv.appendChild(label);
  for (var i = 0; i < args.inputs.length; i++) {
    var input = document.createElement("input");
    input.type = args.inputs[i]; // Or: Object.assign() values based on propertyKey.
    setInputVal(htmlInput, currentVal); // Not implemented. If it exists, use provided getter (setter?).
    input.onchange = function () {
      // Loop through inputs and parse their values. Then use setter.
    };
    containerDiv.appendChild(input);
  }
  return containerDiv;
}

function makeColorInputDiv(args) {
  // Args: label, object, propString.
  var containerDiv = document.createElement("div");
  var label = document.createElement("label");
  var checkbox = document.createElement("input");
  var colorInput = document.createElement("input");
  var alphaSlider = document.createElement("input");
  var valueToSet = args.propString;
  var currColor = args.obj[valueToSet];
  containerDiv.classList.add("setting-control");
  // Create label and inputs (one per each in list.)
  label.innerHTML = args.label;
  label.classList.add("push-left");
  Object.assign(checkbox, {
    type: "checkbox",
    checked: currColor,
  });
  Object.assign(colorInput, {
    type: "color",
    value: toHex(currColor),
  });
  Object.assign(alphaSlider, {
    type: "range",
    title: "Alpha",
    min: 0,
    max: 255,
    value: currColor && currColor.alpha ? currColor.alpha * 255 : 255,
  });
  containerDiv.appendChild(label);
  containerDiv.appendChild(checkbox);
  containerDiv.appendChild(colorInput);
  containerDiv.appendChild(alphaSlider);
  function updateColor() {
    // Setter.
    var val;
    if (!checkbox.checked) {
      val = null;
    } else {
      val = colorInput.value + alphaSlider.valueAsNumber.toString(16);
    }
    args.obj[valueToSet] = val;
  }
  checkbox.onchange = updateColor;
  colorInput.onchange = updateColor;
  alphaSlider.onchange = updateColor;
  return containerDiv;
}

function makeInfoDiv(args) {
  var containerDiv = document.createElement("div");
  var label = document.createElement("label");
  var valSpan = document.createElement("span");
  containerDiv.classList.add("info-line");
  label.innerHTML = args.label;
  label.classList.add("push-left");
  valSpan.innerHTML = args.value;
  infoDiv.addChild(label);
  infoDiv.addChild(valSpan);
  return infoDiv;
}

function makeInputDiv(args) {
  var containerDiv = document.createElement("div");
  var label = document.createElement("label");
  var input = document.createElement("input");
  var valueToSet = args.propString;
  var currentVal = args.obj ? args.obj[valueToSet] : null;
  containerDiv.classList.add("setting-control");
  label.innerHTML = args.label;
  label.classList.add("push-left");
  input.type = args.inputType;
  if (args.inputType === "checkbox") {
    input.checked = currentVal;
  } else {
    input.value = currentVal;
  }
  if (args.inputType === "range" || args.inputType === "number") {
    input.min = args.min;
    input.max = args.max;
  }
  input.onchange = function () {
    if (this.type === "checkbox") {
      args.obj[valueToSet] = this.checked;
    } else {
      args.obj[valueToSet] = this.value;
    }
  };
  containerDiv.appendChild(label);
  containerDiv.appendChild(input);
  return containerDiv;
}

function makeButtonBar(buttonList) {
  // Args: faPrefix, faIcon, mode
  var buttons = [];
  var buttonBar = document.createElement("div");
  buttonBar.classList.add("button-bar");
  for (var i = 0; i < buttonList.length; i++) {
    var buttonObj = buttonList[i];
    var button = document.createElement("button");
    //var icon = document.createElement("i");
    button.name = buttonObj["mode"];
    button.title = buttonObj["mode"];
    button.classList.add("mode-button");
    setIcon(button, buttonObj["faIcon"], buttonObj["faPrefix"]);
    //icon.classList.add(buttonObj["faPrefix"]);
    //icon.classList.add(buttonObj["faIcon"]);
    button.onclick = function (event) {
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("selected-button");
      }
      var currStyleSettings = document.getElementById("style-panel0");
      if (currStyleSettings) currStyleSettings.remove();
      globals.mode = this.name;
      this.classList.add("selected-button");
      globals.setMode(this.name.toLowerCase());
    };
    buttons.push(button);
    buttonBar.appendChild(button);
  }
  buttons[0].classList.add("selected-button");
  return buttonBar;
}

function setIcon(button, faIcon, faPrefix) {
  var icon, classList;
  var faPref = faPrefix ? faPrefix : "fas";
  if (button.children && button.children[0]) {
    icon = button.children[0];
  } else {
    icon = document.createElement("i");
    button.appendChild(icon);
  }
  classList = icon.classList;
  while (classList.length > 0) {
    classList.remove(classList.item(0));
  }
  icon.classList.add(faPref);
  icon.classList.add(faIcon);
  return button;
}

function colourNameToHex(colour) {
  var colours = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    "indianred ": "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgrey: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370d8",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#d87093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32",
  };
  if (typeof colours[colour.toLowerCase()] != "undefined")
    return colours[colour.toLowerCase()];
  return colour;
}

function toHex(color) {
  if (!color) return "#000000";
  if (color.toCSS) return color.toCSS(true);
  if (color[0] === "#") return color.slice(0, 7);
  return colourNameToHex(color);
}
