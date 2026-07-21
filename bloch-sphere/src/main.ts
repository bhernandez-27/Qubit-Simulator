import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { makeAxesLabel, makeDoubleAxisArrow } from "./scene/axes";
import { plotFromAmplitudeInputs} from "./scene/plotting";
import { parseComplexNumberFromString } from "./scene/input_parsing"; 


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

window.addEventListener("resize", () => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);
});

//inputs for plotting
const alphaInput = document.getElementById("alphaInput") as HTMLInputElement;
const betaInput = document.getElementById("betaInput") as HTMLInputElement;

const plotButton = document.getElementById("plotButton") as HTMLButtonElement;

let currentQubit: THREE.Mesh | undefined = undefined;

plotButton.addEventListener("click", () =>
{
    if(currentQubit)
    {
        blochGroup.remove(currentQubit); // remove old qubit plot
    }
    currentQubit = plotFromAmplitudeInputs(alphaInput.value, betaInput.value, blochGroup);
}
)


