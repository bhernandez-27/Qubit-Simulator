import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export function makeAxesLabel(text: string, position: THREE.Vector3, parent: THREE.Object3D): CSS2DObject {
  const div = document.createElement("div");
  div.textContent = text;
  div.style.color = "white";
  div.style.fontSize = "25px";

  const label = new CSS2DObject(div);
  label.position.copy(position);
  parent.add(label);
  return label;
}

export function makeDoubleAxisArrow(direction: THREE.Vector3, length: number, color: number): THREE.Group {
  const group = new THREE.Group();
  const dir = direction.clone().normalize();
  const origin = new THREE.Vector3(0, 0, 0);
  const headLength = length * 0.02;
  const headWidth = length * 0.01;

  group.add(new THREE.ArrowHelper(dir, origin, length, color, headLength, headWidth));
  group.add(new THREE.ArrowHelper(dir.clone().negate(), origin, length, color, headLength, headWidth));

  return group;
}