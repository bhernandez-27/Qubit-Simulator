import * as THREE from "three";
import type { Qubit } from "../linear_algebra/components"

export function convertPureStateToCartesian(qubit : Qubit) : THREE.Vector3
{
    let r = 1;
    let theta = qubit.theta;
    let phi = qubit.phi;

    let x = r * Math.sin(theta) * Math.cos(phi);
    let y = r * Math.sin(theta) * Math.sin(phi);
    let z = r * Math.cos(theta);

    return new THREE.Vector3(x,y,z);
}