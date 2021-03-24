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
  label.innerHTML = args.label;
  label.classList.add("push-left");
  checkbox.type = "checkbox";
  checkbox.checked = currColor;
  colorInput.type = "color";
  colorInput.value = currColor ? currColor.toCSS(true) : null;
  alphaSlider.type = "range";
  alphaSlider.title = "Alpha";
  alphaSlider.min = 0;
  alphaSlider.max = 255;
  alphaSlider.value = currColor ? currColor.alpha * 255 : 255;
  containerDiv.appendChild(label);
  containerDiv.appendChild(checkbox);
  containerDiv.appendChild(colorInput);
  containerDiv.appendChild(alphaSlider);
  function updateColor() {
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
} // See if this can go back with makeInputDiv.0

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
