window.globals = {
  newCalcEntry: function (id, displayString) {
    // Reconsider names. Make more concise if possible.
    var calc = document.getElementById("calcDisplay");
    var newCalcEntry = document.createElement("div");
    var newDiv = document.createElement("div");
    var newCheckbox = document.createElement("input");
    var newPar = document.createElement("span");
    var infoButton = document.createElement("button");
    var settingsButton = document.createElement("button");
    var infoIcon = document.createElement("i");
    var settingsIcon = document.createElement("i");
    newCheckbox.classList.add("toggle-visible");
    infoButton.classList.add("toggle-info");
    infoButton.id = "toggle-info" + id;
    infoIcon.classList.add("fa");
    infoIcon.classList.add("fa-info");
    infoButton.appendChild(infoIcon);
    settingsButton.classList.add("toggle-settings");
    settingsButton.id = "toggle-settings" + id;
    settingsIcon.classList.add("fa");
    settingsIcon.classList.add("fa-sliders");
    settingsButton.appendChild(settingsIcon);
    settingsButton.onclick = function () {
      var stylePanel = document.getElementById("style-panel" + id);
      if (!stylePanel) {
        this.innerHTML = "Hide";
        var myStyle = globals.getStyleById(id);
        globals.styleControls(id, myStyle);
      } else {
        stylePanel.remove();
        this.innerHTML = "Set it";
      }
    };
    newCalcEntry.classList.add("calcEntry");
    newDiv.classList.add("calcEntryHeader");
    newPar.textContent = displayString;
    newCheckbox.type = "checkbox"; // What are these 3 used for?
    newCheckbox.name = "name";
    newCheckbox.value = "value";
    newCheckbox.checked = true;
    newCalcEntry.id = "calcEntry" + id;
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
    var containerDiv = document.getElementById("calcEntry" + id);
    var styleButton = document.getElementById("toggle-settings" + id);
    styleButton.innerHTML = "Hide";
    var styleDiv = document.createElement("div");
    styleDiv.classList.add("settings-panel");
    styleDiv.id = "style-panel" + id;
    var keyList = ["strokeColor", "fillColor", "strokeWidth"];
    for (var i = 0; i < keyList.length; i++) {
      var key = keyList[i];
      var val = styleObj[key];
      var attrDiv = document.createElement("div");
      attrDiv.classList.add("attributeDiv");
      if (key === "strokeColor" || key === "fillColor") {
        var colorInput = document.createElement("input");
        colorInput.type = "color";
        if (val.components.length === 4) {
          // Use alpha slider.
        }
        colorInput.value = val.toCSS(true);
        attrDiv.appendChild(colorInput);
      } else if (key === "strokeWidth") {
        var widthInput = document.createElement("input");
        widthInput.type = "range";
        widthInput.value = val;
        widthInput.min = 1;
        widthInput.max = 10;
        attrDiv.appendChild(widthInput);
      } else if (key === "dashArray") {
        // Not yet supported. Maybe should only be a checkbox.

        return;
      } else {
        // Not supported. Get on out of here.
        return;
      }
      styleDiv.appendChild(attrDiv);
      containerDiv.appendChild(styleDiv);
    }
  },
  openSettings: function (id, settings) {
    var myDiv = document.getElementById("calcEntry" + id);
    var myButton = document.getElementById("toggle-settings" + id);
    myButton.innerHTML = "Hide";
    var mySettingsDiv = document.createElement("div");
    mySettingsDiv.classList.add("settings-panel");
    mySettingsDiv.id = "settings-panel" + id;
    for (var i = 0; i < settings.length; i++) {
      var myMiniDiv = document.createElement("div"); // Div for individual attribute.
      myMiniDiv.classList.add("setting-control");
      var myLabel = document.createElement("label");
      var myInput = document.createElement("input");
      var myProp = settings[i]["propName"];
      var set = settings[i];
      myLabel.innerHTML = set["propName"] + ": ";
      myInput.type = set["inputType"];
      myInput.name = set["propName"];
      myInput.value = set["currentVal"];
      if (set["min"]) {
        myInput.min = set["min"];
        myInput.max = set["max"];
      }
      myInput.onchange = function () {
        var newObj = {};
        newObj[this.name] = this.value;
        globals.setProps(id, newObj);
      };
      myLabel.for = myInput;
      myMiniDiv.appendChild(myLabel);
      myMiniDiv.appendChild(myInput);
      mySettingsDiv.appendChild(myMiniDiv);
    }
    myDiv.appendChild(mySettingsDiv);
  },
};
window.onload = function () {
  var MQ = MathQuill.getInterface(2);
  var answerSpan = document.getElementById("answer");
  var answerMathField = MQ.MathField(answerSpan, {
    handlers: {
      edit: function () {
        var enteredMath = answerMathField.latex(); // Get entered math in LaTeX format
        checkAnswer(enteredMath);
      },
    },
  });
};
