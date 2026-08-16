import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { makeAxesLabel, makeDoubleAxisArrow } from "./scene/axes";
import { plotQubit } from "./scene/plotting";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { convertCartesianToPureState } from "./math/complex_valued_trig/plotting_calculations";
import { ComplexNumber, KetQubit, type Qubit } from "./math/linear_algebra/state_vector_components";
import { MathfieldElement } from "mathlive";
import { parseComplexNumberFromMathInput, parseStringFromComplexNumber, parseStringFromQubit } from "./scene/input_parsing";
import { rotateKetQubit } from "./math/linear_algebra/rotations";
import { parseMatrixInput } from "./scene/input_parsing";
import { defaultRotation } from "./math/linear_algebra/default_rotation_matrices";
import round from "./math/basic_math/round";
import { Measurement, MeasurementBasis, measureQubit } from "./math/linear_algebra/measurements";

MathfieldElement.fontsDirectory = "/fonts"; 

const roundTo = 5;
//class to define a plotted qubit and its info
class QubitPlot
{
  qubit : KetQubit;
  point : THREE.Mesh;
  label : CSS2DObject;
  parent : THREE.Object3D;
  alphaOutput : MathfieldElement;
  betaOutput : MathfieldElement;

  constructor(qubit : KetQubit, parent : THREE.Object3D, alphaOutput : MathfieldElement, betaOutput : MathfieldElement)
  {
    this.qubit = qubit;
    const pointAndLabel = plotQubit(qubit, parent);
    this.point = pointAndLabel.point;
    this.label = pointAndLabel.label;
    this.parent = parent;
    this.alphaOutput = alphaOutput;
    this.betaOutput = betaOutput;
    this.alphaOutput.value = parseStringFromComplexNumber(this.qubit.complexNumbers[0]);
    this.betaOutput.value = parseStringFromComplexNumber(this.qubit.complexNumbers[1]);
  }

  update(newQubit : KetQubit)
  {
    this.qubit = newQubit;
    this.parent.remove(this.point); // remove old qubit plot point
    this.parent.remove(this.label); // remove old qubit label
    const newPlot = plotQubit(newQubit, this.parent);
    this.point = newPlot.point;
    this.label = newPlot.label;
    this.alphaOutput.value = parseStringFromComplexNumber(this.qubit.complexNumbers[0]);
    this.betaOutput.value = parseStringFromComplexNumber(this.qubit.complexNumbers[1]);
  }
}



//functions
function attachTooltip(element: HTMLElement, latex: string, delayMs = 200) {
  let toolTipElement: HTMLDivElement | null = null;
  let showTimeout: number | undefined;

  element.addEventListener("mouseenter", () => {
    showTimeout = window.setTimeout(() => {
      toolTipElement = document.createElement("div");
      toolTipElement.style.position = "fixed";
      toolTipElement.style.background = "#222";
      toolTipElement.style.padding = "6px 10px";
      toolTipElement.style.borderRadius = "4px";
      toolTipElement.style.pointerEvents = "none";
      toolTipElement.style.zIndex = "1000";

      const mathField = new MathfieldElement();
      mathField.value = latex;
      mathField.readOnly = true;
      mathField.style.border = "none";
      mathField.style.background = "transparent";
      mathField.style.color = "white";
      mathField.style.fontSize = "16px";
      toolTipElement.appendChild(mathField);

      element.style.borderColor = "#3c0c57";
      element.style.borderWidth = "4px";
      element.style.borderStyle = "solid";
      document.body.appendChild(toolTipElement);

      const rect = element.getBoundingClientRect();
      toolTipElement.style.left = `${rect.left + rect.width / 2}px`;
      toolTipElement.style.top = `${rect.bottom + 8}px`;
    }, delayMs);
  });

  element.addEventListener("mouseleave", () => {
    clearTimeout(showTimeout);
    toolTipElement?.remove();
    toolTipElement = null;
    element.style.borderColor = "";
    element.style.borderWidth = "";
    element.style.borderStyle = "";
  });
}

function animate() {
   requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

const SCALE_REFERENCE_WIDTH = 1200;

interface ScalableGroup {
  elements: HTMLElement[];
  width: number;
  height: number;
  fontSize: number;
}

function applyScale(group: ScalableGroup, scale: number) {
  for (const el of group.elements) {
    el.style.width = `${group.width * scale}px`;
    el.style.height = `${group.height * scale}px`;
    el.style.fontSize = `${group.fontSize * scale}px`;
  }
}

function updateRendererSize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);

  const scale = SCALE_REFERENCE_WIDTH / width;

  const scalableGroups: ScalableGroup[] = [
    { elements: [alphaInput, betaInput], width: 180, height: 50, fontSize: 18 },
    { elements: [ketZero, ketOne], width: 40, height: 50, fontSize: 19.8 },
    { elements: [theta, phi], width: 40, height: 40, fontSize: 19.8 },
    { elements: [plotButton], width: 224, height: 40, fontSize: 19.8 },
    { elements: [measureButton], width: 200, height: 40, fontSize: 19.8 },
    { elements: [thetaInput, phiInput], width: 156, height: 40, fontSize: 19.8 },
    { elements: [measurementResult], width: 325, height: 110, fontSize: 19.2 },
    { elements: [measurementDetails], width: 325, height: 220, fontSize: 19.2 },
    { elements: [measurementBasisOutput], width: 325, height: 40, fontSize: 19.2 },
    { elements: [basisQubits], width: 325, height: 240, fontSize: 19.2 },
    { elements: [rotationMatrixInput], width: 200, height: 100, fontSize: 18 },
    { elements: [rotationButton], width: 202, height : 40, fontSize : 18 },
    { elements: [xMatrix, yMatrix, zMatrix, hMatrix, qMatrix], width: 60, height: 30, fontSize: 14 },
  ];

  
  for (const group of scalableGroups) {
    applyScale(group, scale);
  }
}

function updateMouseFromEvent(event: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function outputAmplitudesFromQubit(qubit : Qubit, alphaInput : MathfieldElement, betaInput : MathfieldElement) 
{
  alphaInput.value = parseStringFromComplexNumber(qubit.complexNumbers[0]);
  betaInput.value = parseStringFromComplexNumber(qubit.complexNumbers[1]);
}

//when input is given, replot the qubit or plot it if none exists yet
function replotQubit(oldPlot : QubitPlot | null, newQubit : KetQubit, parent : THREE.Object3D) : QubitPlot
{
  if(oldPlot === null)
  {
    return new QubitPlot(newQubit, parent, alphaInput, betaInput);
  } 
  else
  {
    oldPlot.update(newQubit);
    return oldPlot;
  }
}
   

const container = document.getElementById("sceneContainer") as HTMLDivElement;//cointainer housing the sphere and its scene
//resizing
const handle = document.getElementById("resizeHandle")!;
const nav = document.getElementById("leftHandNavigation") as HTMLDivElement;
let isResizing = false;

handle.addEventListener("pointerdown", () => {
  isResizing = true;
});

window.addEventListener("pointermove", (event) => {
  if (!isResizing) return;
  nav.style.width = `${event.clientX}px`; // set width directly based on mouse X position
});

window.addEventListener("pointerup", () => {
  isResizing = false;
});

const resizeObserver = new ResizeObserver(() => {
  updateRendererSize();
});

resizeObserver.observe(container);


//ket zero part
const ketZero = new MathfieldElement();
ketZero.id = "ketZero";
ketZero.value = "\\lvert0\\rangle";
ketZero.readOnly = true; 
document.getElementById("ketZero")!.appendChild(ketZero);

//ket one part
const ketOne = new MathfieldElement();
ketOne.id = "ketOne";
ketOne.value = "\\lvert1\\rangle";
ketOne.readOnly = true;
document.getElementById("ketOne")!.appendChild(ketOne);


//define input elements
const alphaInput = new MathfieldElement();
alphaInput.id = "alphaInput";
alphaInput.value = "\\frac{1}{\\sqrt{2}}";
document.getElementById("alphaInputContainer")!.appendChild(alphaInput);

const betaInput = new MathfieldElement();
betaInput.id = "betaInput";
betaInput.value = "\\frac{1}{\\sqrt{2}}";
document.getElementById("betaInputContainer")!.appendChild(betaInput);

const rotationMatrixInput = new MathfieldElement();
rotationMatrixInput.id = "rotationMatrixInput";
document.getElementById("rotationContainer")!.appendChild(rotationMatrixInput);
rotationMatrixInput.value = 
  "\\begin{pmatrix} \\placeholder[cell_0_0]{\\frac{1}{\\sqrt{2}}} & \\placeholder[cell_0_1]{\\frac{1}{\\sqrt{2}}} \\\\ \\placeholder[cell_1_0]{\\frac{1}{\\sqrt{2}}} & \\placeholder[cell_1_1]{-\\frac{1}{\\sqrt{2}}} \\end{pmatrix}";rotationMatrixInput.readOnly = true;

//measuring section
const theta = new MathfieldElement();
theta.id = "theta";
theta.style.width = "40px";
theta.style.height = "40px";
theta.style.fontSize = "22px";
theta.value = "\\theta =";
theta.readOnly = true;
document.getElementById("theta")!.appendChild(theta);

const phi = new MathfieldElement();
phi.id = "phi";
phi.style.width = "40px";
phi.style.height = "40px";
phi.style.fontSize = "22px";
phi.value = "\\phi =";
phi.readOnly = true;
document.getElementById("phi")!.appendChild(phi);


let measurementBasis : MeasurementBasis | null = null;
let measurement : Measurement | null = null;

const measurementBasisOutput = new MathfieldElement();
measurementBasisOutput.id = "measurementBasisOutput";
measurementBasisOutput.value = "\\{\\lvert\\theta\\rangle\ "
+`,\\lvert\\theta^\\perp\\rangle\ \\}`
measurementBasisOutput.readOnly = true;
document.getElementById("measurementBasis")?.appendChild(measurementBasisOutput);

const basisQubits = new MathfieldElement();
basisQubits.id = "basisQubits";
basisQubits.readOnly = true;
basisQubits.style.display = "none";
document.getElementById("basisQubits")!.appendChild(basisQubits);


const measurementResult = new MathfieldElement();
measurementResult.id = "measurementResult";
measurementResult.readOnly = true;
measurementResult.style.display = "none";
document.getElementById("measurementResult")!.appendChild(measurementResult);

const measurementDetails = new MathfieldElement();
measurementDetails.id = "measurementResult";
measurementDetails.readOnly = true;
measurementDetails.style.display = "none";
document.getElementById("measurementDetails")!.appendChild(measurementDetails);

const thetaInput = new MathfieldElement();
thetaInput.id = "thetaInput";
thetaInput.value = "0";
document.getElementById("thetaContainer")!.appendChild(thetaInput);

const phiInput = new MathfieldElement();
phiInput.id = "phiInput";
phiInput.value = "0";
document.getElementById("phiContainer")!.appendChild(phiInput);


//adjustable sphere cosmetics for how dense the sphere is
let sphereSegments = 13;

//group where all bloch sphere elements live
const blochGroup = new THREE.Group();
const visualRadius = 5; 

//scene where this group lives
const scene = new THREE.Scene();
//setup
scene.background = new THREE.Color().setHex(0x181818);
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.up.set(0,0,1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(1, sphereSegments, sphereSegments);
const material = new THREE.MeshBasicMaterial({ color: 0x552f70, wireframe: true });

const sphere = new THREE.Mesh(geometry, material);
sphere.rotation.x = Math.PI / 2; // rotate 90° so poles move from Y-axis to Z-axis
blochGroup.add(sphere);

camera.position.set(12, 0, 0);
camera.lookAt(sphere.position);

const controls = new OrbitControls(camera, renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
container.appendChild(labelRenderer.domElement);

//error Message setup
const errorText = document.getElementById("errorMessage")!;



//make the axes
blochGroup.add(makeDoubleAxisArrow(new THREE.Vector3(1, 0, 0), 2, 0xff0000));
blochGroup.add(makeDoubleAxisArrow(new THREE.Vector3(0, 1, 0), 2, 0x0000ff));
blochGroup.add(makeDoubleAxisArrow(new THREE.Vector3(0, 0, 1), 2, 0x00ff00));

//make the axis labels
makeAxesLabel("x", new THREE.Vector3(2, 0, 0), blochGroup);
makeAxesLabel("y", new THREE.Vector3(0, 2, 0), blochGroup);
makeAxesLabel("z", new THREE.Vector3(0, 0, 2), blochGroup);

//label each noteworthy state
makeAxesLabel("|0⟩", new THREE.Vector3(0, 0, 1.2), blochGroup);
makeAxesLabel("|1⟩", new THREE.Vector3(0, 0, -1.2), blochGroup);
makeAxesLabel("|-⟩", new THREE.Vector3(-1.2, 0, 0), blochGroup);
makeAxesLabel("|+⟩", new THREE.Vector3(1.2, 0, 0), blochGroup);
makeAxesLabel("|L⟩", new THREE.Vector3(0, 1.2, 0), blochGroup);
makeAxesLabel("|R⟩", new THREE.Vector3(0, -1.2, 0), blochGroup);


const slider = document.getElementById("sphereSegmentsSlider") as HTMLInputElement;
const sphereSegmentsLabel = document.getElementById("sphereSegmentsValue")!;

slider.addEventListener("input", () => {
    const newSegments = parseInt(slider.value);
    sphereSegmentsLabel.textContent = String(newSegments);
    sphere.geometry.dispose();
    sphere.geometry = new THREE.SphereGeometry(1, newSegments, newSegments);
});

blochGroup.scale.set(visualRadius, visualRadius, visualRadius);
scene.add(blochGroup);


//inputs for plotting
const plotButton = document.getElementById("plotButton") as HTMLButtonElement;

let currentQubitPlot : QubitPlot | null = null;

//plotting qubit from MathLive inputs
plotButton.addEventListener("click", () =>
{
  try {
    currentQubitPlot = replotQubit(currentQubitPlot, new KetQubit(parseComplexNumberFromMathInput(alphaInput), parseComplexNumberFromMathInput(betaInput)), blochGroup)
  } catch (e) {
    //invalid input
    errorText.textContent = "Invalid math expression in alpha or beta.";
  }
});


//handling inputs from clicking on the sphere
let isDragging = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


//initial click
renderer.domElement.addEventListener("pointerdown", (event) => {
  updateMouseFromEvent(event);
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(sphere);
  if (intersects.length > 0) {
    isDragging = true;
    controls.enabled = false; // disable OrbitControls while dragging the point, so they don't fight each other
    const localPoint = blochGroup.worldToLocal(intersects[0].point.clone());
    currentQubitPlot = replotQubit(currentQubitPlot, convertCartesianToPureState(localPoint), blochGroup);
    outputAmplitudesFromQubit(currentQubitPlot!.qubit, alphaInput, betaInput);
  }
});

//holding down and dragging the mouse moves the qubit 
renderer.domElement.addEventListener("pointermove", (event) => {
  if (!isDragging) return;

  updateMouseFromEvent(event);
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(sphere);
  if (intersects.length > 0) {
    const localPoint = blochGroup.worldToLocal(intersects[0].point.clone());
    currentQubitPlot = replotQubit(currentQubitPlot, convertCartesianToPureState(localPoint), blochGroup);
    outputAmplitudesFromQubit(currentQubitPlot!.qubit, alphaInput, betaInput);
  }
});

//mouse released, stop moving the qubit
renderer.domElement.addEventListener("pointerup", () => {
  isDragging = false;
  controls.enabled = true; // re-enable camera controls
});

// also stop if the mouse leaves the canvas entirely, to avoid a "stuck" drag state
renderer.domElement.addEventListener("pointerleave", () => {
  isDragging = false;
  controls.enabled = true;
});



//rotation input handling
const rotationButton = document.getElementById("rotateButton") as HTMLButtonElement;

rotationButton.addEventListener("click", ()=>
{
  try 
  {
    if(currentQubitPlot === null)
    {
      errorText.textContent = "Error: You must plot a qubit first!";
    }
    else
    {
      errorText.textContent = "";
      currentQubitPlot = replotQubit(currentQubitPlot, rotateKetQubit(parseMatrixInput(rotationMatrixInput, 2, 2), currentQubitPlot!.qubit), blochGroup);
      outputAmplitudesFromQubit(currentQubitPlot!.qubit, alphaInput, betaInput);
    }
  } 
  catch (error)
  {
    errorText.textContent = "Invalid input to rotation matrix";
    console.log(error);
  }
  
})

//default matrices
const xMatrix = document.getElementById("XMatrix") as HTMLButtonElement;
xMatrix.addEventListener("click", ()=>
{
  currentQubitPlot = replotQubit(currentQubitPlot, defaultRotation("x", currentQubitPlot!.qubit, rotationMatrixInput), blochGroup);
})

const yMatrix = document.getElementById("YMatrix") as HTMLButtonElement;
yMatrix.addEventListener("click", ()=>
{
  currentQubitPlot = replotQubit(currentQubitPlot, defaultRotation("y", currentQubitPlot!.qubit, rotationMatrixInput), blochGroup);
})

const zMatrix = document.getElementById("ZMatrix") as HTMLButtonElement;
zMatrix.addEventListener("click", ()=>
{
  currentQubitPlot = replotQubit(currentQubitPlot, defaultRotation("z", currentQubitPlot!.qubit, rotationMatrixInput), blochGroup);
})

const hMatrix = document.getElementById("HMatrix") as HTMLButtonElement;
hMatrix.addEventListener("click", ()=>
{
  currentQubitPlot = replotQubit(currentQubitPlot, defaultRotation("h", currentQubitPlot!.qubit, rotationMatrixInput), blochGroup);
})

const qMatrix = document.getElementById("QMatrix") as HTMLButtonElement;
qMatrix.addEventListener("click", ()=>
{
  currentQubitPlot = replotQubit(currentQubitPlot, defaultRotation("q", currentQubitPlot!.qubit, rotationMatrixInput), blochGroup);
})


//measurements
const measureButton = document.getElementById("measureButton") as HTMLButtonElement;
measureButton.addEventListener("click", ()=>
{
  const parsedTheta : ComplexNumber = parseComplexNumberFromMathInput(thetaInput);
  const parsedPhi : ComplexNumber = parseComplexNumberFromMathInput(phiInput);
  if(parsedTheta.imaginaryPart != 0 || parsedPhi.imaginaryPart != 0)
  {
    errorText.textContent = "Error: Theta and Phi must be real numbers!"
    return;
  }
  if(currentQubitPlot === null)
  {
    errorText.textContent = "Error: There must be a qubit plotted first!"
    return;
  }
  errorText.textContent = "";
  measurementBasis = new MeasurementBasis(parsedTheta.realPart, parsedPhi.realPart);

  measurement = measureQubit(currentQubitPlot!.qubit, measurementBasis);

  document.getElementById("measurementResultHeader")!.style.display = "block";//display header

  let measuredLatex = null;
  if(measurement.measuredQubit == "theta")
  {
    measuredLatex = "\\theta";
  }
  else
  {
    measuredLatex = "\\theta^\\perp";
  }
  
  measurementResult.value = `\\displaylines{\\text{Measurement Applied: }\\lvert${measuredLatex}\\rangle\\langle${measuredLatex}\\rvert\\\\`
  +`\\text{Measured State: }\\\\`
  +`\\lvert\\psi^{(${measuredLatex})}\\rangle\ =\ ${parseStringFromQubit(measurement.postMeasurementState)}}`
 
  measurementDetails.value = `\\displaylines{\\text{Measurement Details:}\\\\`
  +`\\lvert\\theta\\rangle\\langle\\theta\\rvert \\lvert\\psi\\rangle\ =\ ${parseStringFromQubit(measurement.basisQubitProjection)}\\\\`
  +`\\lvert\\theta^\\perp\\rangle\\langle\\theta^\\perp\\rvert \\lvert\\psi\\rangle\ =\ ${parseStringFromQubit(measurement.basisOrthogonalQubitProjection)}\\\\`
  +`p(\\theta)\ =\ ${round(measurement.basisQubitProb, roundTo)}\\\\`
  +`p(\\theta^\\perp)\ =\ ${round(measurement.basisOrthogonalQubitProb, roundTo)}\\\\`
  +`\\lvert\\psi^{(\\theta)}\\rangle\ =\ ${parseStringFromQubit(measurement.basisQubitPM)}\\\\`
  +`\\lvert\\psi^{(\\theta^\\perp)}\\rangle\ =\ ${parseStringFromQubit(measurement.basisOrthogonalQubitPM)}\\\\`
  +`}`;
  measurementResult.style.display = "block";
  measurementDetails.style.display = "block";

  measurementBasisOutput.value = "\\{\\lvert\\theta\\rangle\ "
  +`=\ ${parseStringFromComplexNumber(measurementBasis.basisQubitKet.complexNumbers[0])}\\lvert0\\rangle\ +\ `
  +`${parseStringFromComplexNumber(measurementBasis.basisQubitKet.complexNumbers[1])}\\lvert1\\rangle,\ `
  +`\\lvert\\theta^\\perp\\rangle\ =\ `
  +`${parseStringFromComplexNumber(measurementBasis.basisOrthogonalQubitKet.complexNumbers[0])}\\lvert0\\rangle\ +\ `
  +`${parseStringFromComplexNumber(measurementBasis.basisOrthogonalQubitKet.complexNumbers[1])}\\lvert1\\rangle\\}`
  measurementBasisOutput.style.display = "block";

  basisQubits.value = "\\begin{aligned}"
  +"\\lvert\\theta\\rangle\ &=\ \\cos(\\frac{\\theta}{2})\\lvert0\\rangle\ + \ e^{i\\phi}\\sin(\\frac{\\theta}{2})\\lvert1\\rangle"
  +"\\\\"
  +`&=\ \\cos(\\frac{${round(measurementBasis.theta, roundTo)}}{2})\\lvert0\\rangle\ + \ e^{i\\cdot${round(measurementBasis.phi, roundTo)}}\\sin(\\frac{${round(measurementBasis.theta, roundTo)}}{2})\\lvert1\\rangle`
  +"\\\\"+
  `&=\ ${parseStringFromComplexNumber(measurementBasis.basisQubitKet.complexNumbers[0])}\\lvert0\\rangle\ +\ ${parseStringFromComplexNumber(measurementBasis.basisQubitKet.complexNumbers[1])}\\lvert1\\rangle`
  +"\\\\"+
  `\\lvert\\theta^\\perp\\rangle\ &=\ \\cos(\\frac{\\theta^\\perp}{2})\\lvert0\\rangle\ + \ e^{i\\phi}\\sin(\\frac{\\theta^\\perp}{2})\\lvert1\\rangle`
  +"\\\\"+
  `&=\ \\cos(\\frac{${round(measurementBasis.thetaPerp, roundTo)}}{2})\\lvert0\\rangle\ + \ e^{i\\cdot${round(measurementBasis.phi, roundTo)}}\\sin(\\frac{${round(measurementBasis.thetaPerp, roundTo)}}{2})\\lvert1\\rangle`
  +"\\\\"+
  `&=\ ${parseStringFromComplexNumber(measurementBasis.basisOrthogonalQubitKet.complexNumbers[0])}\\lvert0\\rangle\ +\ ${parseStringFromComplexNumber(measurementBasis.basisOrthogonalQubitKet.complexNumbers[1])}\\lvert1\\rangle`
  +"\\end{aligned}";

  basisQubits.style.display = "block";

  currentQubitPlot.update(measurement.postMeasurementState);
})


animate();
//hovering over inputs for information
attachTooltip(alphaInput, "\\displaylines{\\text{This is alpha. It is the } \\alpha \\text{ in } \\alpha\\lvert0\\rangle\ +\ \\beta\\lvert1\\rangle"
  +"\\\\"
  +"\\text{It is the probability amplitude of the }\\lvert0\\rangle \\text{ state.}\\\\"
  +"\\text{Squaring it gives the probability of seeing the } \\lvert0\\rangle \\text{ state after a measurement in the computational basis } \\{\\lvert0\\rangle, \\lvert1\\rangle\\}\\\\"
  +"p(0)\ =\ \\alpha^2}");
attachTooltip(betaInput, "\\displaylines{\\text{This is beta. It is the } \\beta \\text{ in } \\alpha\\lvert0\\rangle\ +\ \\beta\\lvert1\\rangle"
  +"\\\\"
  +"\\text{It is the probability amplitude of the }\\lvert1\\rangle \\text{ state.}\\\\"
  +"\\text{Squaring it gives the probability of seeing the } \\lvert1\\rangle \\text{ state after a measurement in the computational basis } \\{\\lvert0\\rangle, \\lvert1\\rangle\\}\\\\"
  +"p(1)\ =\ \\beta^2}");

attachTooltip(rotationMatrixInput, "\\displaylines{\\text{This is the matrix form of}\\\\"
  +"R_{\\hat{n}}(\\xi) \\equiv e^{-i\\frac{\\xi}{2}\\hat{n}\\cdot\\vec{\\sigma}}"
  +"\\\\"
  +"=\\ \\cos\\left(\\frac{\\xi}{2}\\right)I\\ -\\ i\\sin\\left(\\frac{\\xi}{2}\\right)(n_xX\\ +\\ n_yY\\ +\\ n_zZ)"
  +"\\\\"
  +"\\text{where }\\hat{n} = (n_x, n_y, n_z)\\text{ is the axis and }\\xi\\text{ is the angle of rotation.}"
  +"}");


attachTooltip(xMatrix, "\\displaylines{"
  +"\\text{Pauli X Gate (Bit Flip)}"
  +"\\\\"
  +"X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}"
  +"\\\\"
  +"\\text{Swaps the amplitudes: }"
  +"\\\\X\\lvert0\\rangle = \\lvert1\\rangle\\\\"
  +"X\\lvert1\\rangle = \\lvert0\\rangle"
  +"}");

attachTooltip(yMatrix,
  "\\displaylines{"
  +"\\text{Pauli Y Gate (Bit-Phase Flip)}"
  +"\\\\"
  +"Y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}"
  +"\\\\"
  +"\\text{Flips the Bit and the Phase: }\\\\"
  +"Y\\lvert0\\rangle\ =\ i\\lvert1\\rangle\ =\ \\lvert1\\rangle"
  +"\\\\"
  +"Y\\lvert1\\rangle\ =\ -i\\lvert0\\rangle\ =\ -\\lvert0\\rangle"
  +"}"
);

attachTooltip(zMatrix,
  "\\displaylines{"
  +"\\text{Pauli Z Gate (Phase Flip)}"
  +"\\\\"
  +"Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}"
  +"\\\\"
  +"\\text{Flips the Phase}\\\\"
  +"Z\\lvert0\\rangle\ =\ \\lvert0\\rangle"
  +"\\\\"
  +"Z\\lvert1\\rangle\ =\ -\\lvert1\\rangle"
  +"}"
);

attachTooltip(hMatrix,
  "\\displaylines{"
  +"\\text{Hadamard Gate}"
  +"\\\\"
  +"H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}"
  +"\\\\"
  +"\\text{Creates an equal superposition of }\\lvert0\\rangle\\text{ and }\\lvert1\\rangle\\\\"
  +"H\\lvert0\\rangle\ =\ \\lvert+\\rangle = \\frac{1}{\\sqrt{2}}\\lvert0\\rangle\ +\ \\frac{1}{\\sqrt{2}}\\lvert1\\rangle"
  +"\\\\"
  +"H\\lvert1\\rangle\ =\ \\lvert-\\rangle\ =\ \\frac{1}{\\sqrt{2}}\\lvert0\\rangle\ -\ \\frac{1}{\\sqrt{2}}\\lvert1\\rangle"
  +"}"
);


attachTooltip(qMatrix,
  "\\displaylines{"
  +"\\text{Quarter Wave Plate (}\\lvert0\\rangle\\text{ Delayer)}"
  +"\\\\"
  +"Q = \\begin{pmatrix} i & 0 \\\\ 0 & 1 \\end{pmatrix}"
  +"\\\\"
  +"\\text{Applies a quarter-wavelength phase delay to }\\lvert0\\rangle\\\\"
  +"Q\\lvert0\\rangle\ =\ i\\lvert0\\rangle"
  +"\\\\"
  +"Qi\\lvert0\\rangle\ =\ -1\\lvert0\\rangle"
  +"\\\\"
  +"Q(-1\\lvert0\\rangle\) =\ -i\\lvert0\\rangle"
  +"\\\\"
  +"Q(-i\\lvert1\\rangle\) =\ \\lvert1\\rangle"
  +"}"
);


attachTooltip(thetaInput, "\\displaylines{\\text{This is theta.}\\\\"
  +"\\text{It is the }\\theta \\text{ in } \\lvert\\theta\\rangle\ =\ \\cos(\\frac{\\theta}{2})\\lvert0\\rangle\ +\ e^{i\\phi}\\sin(\\frac{\\theta}{2})\\lvert1\\rangle}");


attachTooltip(phiInput, "\\displaylines{\\text{This is phi.}\\\\"
  +"\\text{It is the }\\phi \\text{ in } \\lvert\\theta\\rangle\ =\ \\cos(\\frac{\\theta}{2})\\lvert0\\rangle\ +\ e^{i\\phi}\\sin(\\frac{\\theta}{2})\\lvert1\\rangle}");