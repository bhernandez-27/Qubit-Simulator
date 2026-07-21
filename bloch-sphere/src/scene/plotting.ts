import * as THREE from "three";
import { makeAxesLabel } from "./axes";
import { parseComplexNumberFromString } from "./input_parsing";
import { type Qubit, KetQubit } from "../math/linear_algebra/components";
import { convertPureStateToCartesian } from "../math/complex_valued_trig/plotting_calculations";

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
): THREE.Mesh
{
    const point = plotPoint(coordinates, parent, radius, color); // capture the return value — this was missing

    // offset the label slightly so it doesn't sit directly on top of the point
    const labelPosition = new THREE.Vector3(coordinates.x, coordinates.y + labelOffset, coordinates.z);
    makeAxesLabel("|ψ⟩", labelPosition, parent);

    return point;
}

export function plotQubit(qubit : Qubit, parent : THREE.Object3D) : THREE.Mesh
{
    const coordinates = convertPureStateToCartesian(qubit);
    return plotPsi(coordinates, parent);
}

export function plotFromAmplitudeInputs(alphaString : string, betaString : string, parent : THREE.Object3D) : THREE.Mesh
{
    const alpha = parseComplexNumberFromString(alphaString);
    const beta = parseComplexNumberFromString(betaString);

    return plotQubit(new KetQubit(alpha, beta), parent);
}