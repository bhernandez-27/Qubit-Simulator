import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { makeAxesLabel, makeDoubleAxisArrow } from "./scene/axes";
import { plotQubit } from "./scene/plotting";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { convertCartesianToPureState } from "./math/complex_valued_trig/plotting_calculations";
import { KetQubit, type Qubit } from "./math/linear_algebra/state_vector_components";
import { MathfieldElement } from "mathlive";
import { parseComplexNumberFromMathInput, parseStringFromComplexNumber } from "./scene/input_parsing";
import { rotateKetQubit } from "./math/linear_algebra/rotations";
import { parseMatrixInput } from "./scene/input_parsing";
import { defaultRotation } from "./math/linear_algebra/default_rotation_matrices";

MathfieldElement.fontsDirectory = "/fonts"; 

//class to define a plotted qubit and its info
class QubitPlot
{
  qubit : KetQubit;
  point : THREE.Mesh;
  label : CSS2DObject;
  parent : THREE.Object3D;

  constructor(qubit : KetQubit, parent : THREE.Object3D)
  {
    this.qubit = qubit;
    const pointAndLabel = plotQubit(qubit, parent);
    this.point = pointAndLabel.point;
    this.label = pointAndLabel.label;
    this.parent = parent;
  }

  update(newQubit : KetQubit)
  {
    this.qubit = newQubit;
    this.parent.remove(this.point); // remove old qubit plot point
    this.parent.remove(this.label); // remove old qubit label
    const newPlot = plotQubit(newQubit, this.parent);
    this.point = newPlot.point;
    this.label = newPlot.label;
  }
}

//functions
function animate() {
   requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

function updateRendererSize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);

  const scale = 1200 / width;

  for (const input of [alphaInput, betaInput]) {
    input.style.width = `${220 * scale}px`;
    input.style.height = `${40 * scale}px`;
    input.style.fontSize = `${16 * scale}px`;
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
    return new QubitPlot(newQubit, parent);
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

animate();