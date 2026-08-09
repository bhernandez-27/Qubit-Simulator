import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { makeAxesLabel, makeDoubleAxisArrow } from "./scene/axes";
import { plotFromAmplitudeInputs, plotQubit } from "./scene/plotting";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { convertCartesianToPureState } from "./math/complex_valued_trig/plotting_calculations";
import { KetQubit, ComplexNumber, type Qubit } from "./math/linear_algebra/state_vector_components";
import round from "./math/basic_math/round";
import { MathfieldElement } from "mathlive";
import { parseComplexNumberFromMathInput } from "./scene/input_parsing";
import { rotateKetQubit } from "./math/linear_algebra/rotations";
import { parseMatrixInput } from "./scene/input_parsing";

MathfieldElement.fontsDirectory = "/fonts"; 

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
  let roundedTo = 5;
  let alphaReal : string = String(round(qubit.complexNumbers[0].realPart, roundedTo));
  let alphaImaginary : string = String(round(qubit.complexNumbers[0].imaginaryPart, roundedTo));
  let betaReal : string = String(round(qubit.complexNumbers[1].realPart, roundedTo));
  let betaImaginary : string = String(round(qubit.complexNumbers[1].imaginaryPart, roundedTo));
  
  if(qubit.complexNumbers[0].imaginaryPart >= 0)
  {
    alphaInput.value = alphaReal + " + " + alphaImaginary +"i"
  }
  else
  {
    alphaInput.value = alphaReal + " - " + alphaImaginary.slice(1) +"i"
  }

  if(qubit.complexNumbers[1].imaginaryPart >= 0)
  {
    betaInput.value = betaReal + " + " + betaImaginary +"i"
  }
  else
  {
    betaInput.value = betaReal + " - " + betaImaginary.slice(1) +"i"
  }


  if(alphaReal == "0")
  {
    alphaInput.value = alphaImaginary  + "i";
  }
  
  if(alphaImaginary == "0")
  {
    alphaInput.value = alphaReal;
  }
  
  if(betaReal == "0")
  {
    betaInput.value =  betaImaginary + "i";
  }
  
  if(betaImaginary == "0")
  {
    betaInput.value =  betaReal;
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
rotationMatrixInput.value = 
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

let currentQubitPoint: { point: THREE.Mesh; label: CSS2DObject } | undefined = undefined;
let currentQubit = new KetQubit(new ComplexNumber(1, 0), new ComplexNumber(0,0)); //default to |0> state


//plotting qubit from MathLive inputs
plotButton.addEventListener("click", () =>
{
  try {
    if (currentQubitPoint) {
      blochGroup.remove(currentQubitPoint.point); // remove old point/label before redrawing
      blochGroup.remove(currentQubitPoint.label); // remove old qubit plot
    }
    currentQubitPoint = plotFromAmplitudeInputs(alphaInput, betaInput, blochGroup);
    currentQubit = new KetQubit(parseComplexNumberFromMathInput(alphaInput), parseComplexNumberFromMathInput(betaInput));
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
    if(currentQubitPoint)
    {
        blochGroup.remove(currentQubitPoint.label); // remove old qubit plot
        blochGroup.remove(currentQubitPoint.point); // remove old qubit plot
    }
    const localPoint = blochGroup.worldToLocal(intersects[0].point.clone());
    currentQubit = convertCartesianToPureState(localPoint);
    currentQubitPoint = plotQubit(currentQubit, blochGroup);
    outputAmplitudesFromQubit(currentQubit, alphaInput, betaInput);
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

    if (currentQubitPoint) {
      blochGroup.remove(currentQubitPoint.point); // remove old point/label before redrawing
      blochGroup.remove(currentQubitPoint.label); // remove old qubit plot
    }
    currentQubit = convertCartesianToPureState(localPoint);
    currentQubitPoint = plotQubit(currentQubit, blochGroup);
    outputAmplitudesFromQubit(currentQubit, alphaInput, betaInput);
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
    if(currentQubit === null)
    {
      errorText.textContent = "There is no qubit to rotate";
    }
    else
    {
      blochGroup.remove(currentQubitPoint!.point); // remove old point/label before redrawing
      blochGroup.remove(currentQubitPoint!.label); // remove old qubit plot
      errorText.textContent = "";
      currentQubit = rotateKetQubit(parseMatrixInput(rotationMatrixInput, 2, 2), currentQubit);

      currentQubitPoint = plotQubit(currentQubit, blochGroup);
      outputAmplitudesFromQubit(currentQubit, alphaInput, betaInput);
    }
  } 
  catch (error)
  {
    errorText.textContent = "Invalid input to rotation matrix";
    console.log(error);
  }
  
}
)


animate();