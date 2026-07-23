import * as THREE from "three";
import { makeAxesLabel } from "./axes";
import { parseComplexNumberFromString } from "./input_parsing";
import { KetQubit } from "../math/linear_algebra/components";
import { convertPureStateToCartesian } from "../math/complex_valued_trig/plotting_calculations";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import round from "../math/basic_math/round"

export function plotPoint(
    coordinates : THREE.Vector3,
    parent: THREE.Object3D, // Scene OR Group both work — same base type
    radius: number = 0.04,  // note: smaller radius, since the GROUP scaling will enlarge it too!
    color: number = 0xffffff
): THREE.Mesh 
{
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    const point = new THREE.Mesh(geometry, material);
    point.position.set(coordinates.x, coordinates.y, coordinates.z);
    parent.add(point);
    return point;
}

export function plotPsi
(
    coordinates : THREE.Vector3,
    parent: THREE.Object3D,
    radius: number = 0.04,
    color: number = 0xd7e05a,
    labelOffset: number = 0.15 // how far the label sits away from the point
): { point : THREE.Mesh, label : CSS2DObject }
{
    const point = plotPoint(coordinates, parent, radius, color); // capture the return value 

    // offset the label slightly so it doesn't sit directly on top of the point
    const labelPosition = new THREE.Vector3(coordinates.x, coordinates.y + labelOffset, coordinates.z);
    const label = makeAxesLabel("|ψ⟩", labelPosition, parent);

    return {point, label};
}

export function plotQubit(qubit : KetQubit, parent : THREE.Object3D) : { point : THREE.Mesh, label : CSS2DObject }
{
    const coordinates = convertPureStateToCartesian(qubit);
    return plotPsi(coordinates, parent);
}

export function plotFromAmplitudeInputs(alphaString : string, betaString : string, parent : THREE.Object3D) : { point : THREE.Mesh, label : CSS2DObject }
{
    const alpha = parseComplexNumberFromString(alphaString);
    const beta = parseComplexNumberFromString(betaString);

    return plotQubit(new KetQubit(alpha, beta), parent);
}