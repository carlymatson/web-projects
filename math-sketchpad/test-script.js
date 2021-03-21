var values = {
  numSides: 5,
  radius: 150,
};

var hitOptions = {
  fill: true,
  stroke: true,
  segments: true,
  tolerance: 10,
};

var textStyle = {
  strokeColor: "white",
  strokeWidth: 1,
  fillColor: "white",
  fontSize: "20px",
  fontFamily: "Courier New",
};

var polygonStyle = {
  strokeColor: "black",
  strokeWidth: 6,
  fillColor: "DarkSlateBlue",
  fontSize: "20px",
  fontFamily: "Courier New",
};

var rotationStyle = {
  strokeColor: "#34a1eb",
  strokeWidth: 12,
  fillColor: null,
};

var newSymbol, polySymbol, polySymbolDef;
setGlobals();
loadCanvas();

var testPath = new Path.Circle(new Point({ length: 70, angle: 10 }), 30);
testPath.fillColor = "red";

var myButton = getPolyButton(360 / values.numSides).place(new Point(35, 35));
myButton.scale(new Size(60, 60) / myButton.bounds.size);

var myButton3 = getPolyButton(720 / values.numSides).place(new Point(100, 35));
myButton3.scale(new Size(60, 60) / myButton3.bounds.size);

var myButton2 = getPolyButton(-320 / values.numSides).place(new Point(165, 35));
myButton2.scale(new Size(60, 60) / myButton2.bounds.size);

var myButton4 = getPolyButton(-720 / values.numSides).place(new Point(230, 35));
myButton4.scale(new Size(60, 60) / myButton4.bounds.size);

function getPolyButton(rotation, isRotation) {
  var symbolGroup = new Group();
  var thisPoly = polySymbolDef.place(new Point(0, 0));
  var groupDecoration;
  //if (isRotation) {
  var rotationArrow = drawRotationArrow(rotation, values.radius * 1.2);
  thisPoly.rotate(rotation);
  //} else {
  //  var refLine = drawReflectionLine(rotation);
  //}

  symbolGroup.addChildren([thisPoly, rotationArrow]);
  var outline = new Path.Rectangle(
    symbolGroup.bounds.scale(1.3),
    new Size(20, 20)
  );
  outline.fillColor = "white";
  outline.strokeColor = "black";
  symbolGroup.insertChild(0, outline);
  var mySymbol = new SymbolDefinition(symbolGroup);
  return mySymbol;
}

function loadCanvas() {
  makeBackground();
  polySymbolDef = setPolygonSymbol(values.numSides, values.radius, "");
  polySymbol = polySymbolDef.place(new Point(view.bounds.size / 2));
  polySymbol.applyMatrix = true;
  console.log(polySymbol);
  // Polygon event handlers.
  polySymbol.onMouseDrag = function (event) {
    var startPt = event.point - event.delta;
    var startAngle = (startPt - this.position).angle;
    var currentAngle = (event.point - this.position).angle;
    var angleDelt = currentAngle - startAngle;
    this.rotate(angleDelt);
  };
  polySymbol.onMouseUp = function (event) {
    this.rotation = snapTo(this.rotation);
  };
  // Reflection lines.
  var refGrp = polygonReflections(values.numSides, values.radius);
  refGrp.position += new Point(view.bounds.size / 2);
  polySymbol.bringToFront();
}

// I could also just draw this once and keep it as a global reference?
function drawReflectionLine(angle, radius) {
  var refLine = new Path({
    segments: [new Point(-1.4 * radius, 0), new Point(1.4 * radius, 0)],
    style: {
      strokeColor: "#ccc",
      dashArray: [10, 12],
      strokeWidth: 6,
    },
  });
  refLine.rotate(angle);
  return refLine;
}

function setPolygonSymbol(numSides, radius, args) {
  //args = {labelRadius: 0.8, arrow: true, ngonStyle: null, labelStyle};
  //var theta =  Math.PI/numSides;
  var theta = 360 / numSides;
  var symbolGroup = new Group();
  var invisibleCircle = new Path.Circle(new Point(0, 0), radius);
  invisibleCircle.opacity = 0;
  symbolGroup.addChild(invisibleCircle);
  var vertexList = [];
  project.currentStyle = textStyle;
  for (var i = 0; i < numSides; i++) {
    var newVertex = new Point({ length: radius, angle: -theta * i });
    vertexList.push(newVertex);
    symbolGroup.addChild(
      new PointText({
        point: newVertex * (4 / 5) + new Point(0, 5),
        content: i + 1,
        justification: "center",
      })
    );
  }
  project.currentStyle = polygonStyle;
  var polygonPath = new Path({
    segments: vertexList,
    closed: true,
  });
  symbolGroup.insertChild(0, polygonPath);
  var arrPath = new Path([
    new Point(-radius / 2, 0),
    new Point(radius / 2, 0),
    new Point(radius / 4, -radius / 4),
  ]);
  arrPath.strokeColor = "white";
  arrPath.fillColor = null;
  arrPath.strokeWidth = 12;
  symbolGroup.addChild(arrPath);
  return new SymbolDefinition(symbolGroup);
}

function polygonReflections(numSides, radius) {
  var theta = (2 * Math.PI) / numSides;
  var reflectionGroup = new Group();
  var refLine = new Path({
    segments: [new Point(-1.5 * radius, 0), new Point(1.5 * radius, 0)],
    style: {
      strokeColor: "#ccc",
      dashArray: [10, 12],
      strokeWidth: 6,
    },
  });
  var rLine = refLine.clone();
  for (var i = 0; i < numSides; i++) {
    rLine.onClick = startFlip;
    rLine.onMouseEnter = function () {
      this.strokeColor = "#08fff7";
    };
    rLine.onMouseLeave = function () {
      this.strokeColor = "#ccc";
    };
    reflectionGroup.addChild(rLine);
    if (i < numSides - 1) {
      // Exit early if it's the last reflection line.
      rLine = rLine.clone().rotate(180 / numSides);
    }
  }
  refLine.remove();
  return reflectionGroup;
}

function startFlip(event) {
  var myAngle = snapTo(
    (event.point - polySymbol.position).angle,
    2 * values.numSides
  ); // More general animation player?
  polySymbol.onFrame = function (e) {
    var i = e.count;
    var timeout = 13; // Timeout at n=13. Must be odd to avoid hitting zero!
    if (i >= timeout) {
      polySymbol.onFrame = null;
      return;
    }
    var oldScale = 1 - (2 / timeout) * i; // Or old rotation and new rotation.
    var newScale = 1 - (2 / timeout) * (i + 1);
    var lambda = newScale / oldScale;
    flip(polySymbol, myAngle, lambda); // Or partial rotation.
  };
}
// These are good to go.

function makeBackground() {
  project.activeLayer.name = "background";
  var whiteBackground = new Path.Rectangle({
    rectangle: view.bounds,
    strokeColor: "white",
    fillColor: "white",
    dashArray: null,
    locked: true,
    name: "background",
  });
}

function snapTo(rotation, divider) {
  if (!divider) {
    divider = values.numSides;
  }
  var angl = 360 / divider;
  return Math.round(rotation / angl) * angl;
}

function flip(ngon, theta, lambda) {
  var shift = ngon.position;
  ngon.position = new Point(0, 0);
  ngon.matrix.prepend(matrixReflect(theta, lambda));
  ngon.position = shift;
}

function matrixReflect(theta, lambda) {
  theta *= Math.PI / 180;
  var c = Math.cos(theta);
  var s = Math.sin(theta);
  var scaleMatrix = new Matrix(
    c * c + lambda * s * s,
    (1 - lambda) * c * s,
    (1 - lambda) * c * s,
    s * s + lambda * c * c,
    0,
    0
  );
  return scaleMatrix;
}

function drawRotationArrow(toAngle, radius) {
  var halfway = new Point({ length: radius, angle: toAngle / 2 });
  var to = new Point({ length: radius, angle: toAngle });
  var newArc = new Path.Arc(new Point(radius, 0), halfway, to);
  newArc = arrowify(newArc);
  newArc.style = rotationStyle;
  return newArc;
}

function arrowify(myPath, arrowSize) {
  if (!arrowSize) {
    arrowSize = 12;
  }
  var point = myPath.lastSegment.point;
  var vector = myPath.getTangentAt(myPath.length);
  var thisArrowTip = setArrowTip(arrowSize);
  thisArrowTip.position += myPath.lastSegment.point;
  thisArrowTip.rotate(vector.angle);
  return new CompoundPath(myPath, thisArrowTip);
}

function setArrowTip(size) {
  if (!size) {
    size = 12;
  }
  var upperCorner = new Point(-Math.cos(Math.PI / 7), Math.sin(Math.PI / 7));
  var lowerCorner = new Point(-Math.cos(Math.PI / 7), -Math.sin(Math.PI / 7));
  var arrowTipPath = new Path([
    upperCorner * size,
    new Point(0, 0),
    lowerCorner * size,
  ]);
  arrowTipPath.strokeColor = "black";
  //Optional: Closed path.
  arrowTipPath.closePath();
  // Optional: no fill.
  arrowTipPath.fillColor = "black";
  arrowTipPath.pivot = new Point(0, 0);
  arrowTipPath.dashArray = null;
  return arrowTipPath;
}

function matrixRotate(theta) {
  theta = (theta * 2 * Math.PI) / 360;
  var c = Math.cos(theta);
  var s = Math.sin(theta);
  return new Matrix(c, -s, s, c, 0, 0);
}

function updateWindowDisplay() {
  var dispStr = "String";
  globals.setText(dispStr);
}

function setGlobals() {
  globals.numSides = values.numSides;
  globals.updateDisplay = updateWindowDisplay;
  globals.refreshCanvas = function () {
    project.clear();
    values.numSides = globals.numSides;
    loadCanvas();
  };
}
