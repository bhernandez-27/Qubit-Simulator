import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { makeAxesLabel, makeDoubleAxisArrow } from "./scene/axes";
import { plotFromAmplitudeInputs, plotPsi } from "./scene/plotting";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { convertCartesianToPureState } from "./math/complex_valued_trig/plotting_calculations"
import { KetQubit, ComplexNumber, type Qubit } from "./math/linear_algebra/components"
import { parseComplexNumberFromString } from "./scene/input_parsing"
import round from "./math/basic_math/round"

let sphereSegments = 13;

const container = document.getElementById("sceneContainer") as HTMLDivElement;

// create a group that represents your "unit Bloch sphere" coordinate space
const blochGroup = new THREE.Group();
const visualRadius = 5; 


const scene = new THREE.Scene();
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

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
container.appendChild(labelRenderer.domElement);

makeAxesLabel("|0⟩", new THREE.Vector3(0, 0, 1.2), blochGroup);
makeAxesLabel("|1⟩", new THREE.Vector3(0, 0, -1.2), blochGroup);
makeAxesLabel("|-⟩", new THREE.Vector3(-1.2, 0, 0), blochGroup);
makeAxesLabel("|+⟩", new THREE.Vector3(1.2, 0, 0), blochGroup);
makeAxesLabel("|L⟩", new THREE.Vector3(0, 1.2, 0), blochGroup);
makeAxesLabel("|R⟩", new THREE.Vector3(0, -1.2, 0), blochGroup);

makeAxesLabel("x", new THREE.Vector3(2, 0, 0), blochGroup);
makeAxesLabel("y", new THREE.Vector3(0, 2, 0), blochGroup);
makeAxesLabel("z", new THREE.Vector3(0, 0, 2), blochGroup);

blochGroup.add(makeDoubleAxisArrow(new THREE.Vector3(1, 0, 0), 2, 0xff0000));
blochGroup.add(makeDoubleAxisArrow(new THREE.Vector3(0, 1, 0), 2, 0x0000ff));
blochGroup.add(makeDoubleAxisArrow(new THREE.Vector3(0, 0, 1), 2, 0x00ff00));

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
   requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}
animate();

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
const alphaInput = document.getElementById("alphaInput") as HTMLInputElement;
const betaInput = document.getElementById("betaInput") as HTMLInputElement;

const plotButton = document.getElementById("plotButton") as HTMLButtonElement;

let currentQubitPoint: { point: THREE.Mesh; label: CSS2DObject } | undefined = undefined;
let currentQubit = new KetQubit(new ComplexNumber(1, 0), new ComplexNumber(0,0)); //default to |0> state

plotButton.addEventListener("click", () =>
{
    if(currentQubitPoint)
    {
        blochGroup.remove(currentQubitPoint.point); // remove old qubit plot
        blochGroup.remove(currentQubitPoint.label); // remove old qubit label
    }
    currentQubitPoint = plotFromAmplitudeInputs(alphaInput.value, betaInput.value, blochGroup);
    currentQubit.update(parseComplexNumberFromString(alphaInput.value), parseComplexNumberFromString(betaInput.value));
}
)

//handle click inputs
let isDragging = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateMouseFromEvent(event: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function outputAmplitudesFromQubit(qubit : Qubit, alphaInput : HTMLInputElement, betaInput : HTMLInputElement) 
{
  let roundedTo = 5;
  alphaInput.value = String(round(qubit.complexNumbers[0].realPart, roundedTo)) + " + " + String(round(qubit.complexNumbers[0].imaginaryPart, roundedTo)) + "i";
  betaInput.value = String(round(qubit.complexNumbers[1].realPart, roundedTo)) + " + " + String(round(qubit.complexNumbers[1].imaginaryPart, roundedTo)) + "i";
}


// 1. Start dragging — only if the click actually hit the existing point (or the sphere)
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
    currentQubitPoint = plotPsi(localPoint, blochGroup);
    currentQubit = convertCartesianToPureState(localPoint);
    outputAmplitudesFromQubit(currentQubit, alphaInput, betaInput);
  }
});

// 2. While dragging — continuously raycast and reposition
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
    currentQubitPoint = plotPsi(localPoint, blochGroup);
    currentQubit = convertCartesianToPureState(localPoint);
    outputAmplitudesFromQubit(currentQubit, alphaInput, betaInput);
  }
});

// 3. Stop dragging
renderer.domElement.addEventListener("pointerup", () => {
  isDragging = false;
  controls.enabled = true; // re-enable camera controls
});

// also stop if the mouse leaves the canvas entirely, to avoid a "stuck" drag state
renderer.domElement.addEventListener("pointerleave", () => {
  isDragging = false;
  controls.enabled = true;
});


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

function updateRendererSize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);

  const scale = 1200 / width;

  for (const input of [alphaInput, betaInput]) {
    input.style.width = `${150 * scale}px`;
    input.style.height = `${40 * scale}px`;
    input.style.fontSize = `${16 * scale}px`;
  }
}


const resizeObserver = new ResizeObserver(() => {
  updateRendererSize();
});
resizeObserver.observe(container);
