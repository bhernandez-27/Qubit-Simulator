import * as THREE from "three";
import { KetQubit, makeQubitFromSpherical} from "../linear_algebra/components"

export function convertPureStateToCartesian(qubit : KetQubit) : THREE.Vector3
{
    let r = 1;
    let theta = qubit.theta;
    let phi = qubit.phi;

    let x = r * Math.sin(theta) * Math.cos(phi);
    let y = r * Math.sin(theta) * Math.sin(phi);
    let z = r * Math.cos(theta);

    return new THREE.Vector3(x,y,z);
}

export function convertCartesianToPureState(coordinates : THREE.Vector3) : KetQubit
{
    let x = coordinates.x;
    let y = coordinates.y;
    let z = coordinates.z;

    //by defenition, a pure state lies on the Bloch Sphere surface so r = 1
    let theta = Math.acos(z);

    let phi = 0;
    if(x != 0 || y != 0)
    {
        phi = Math.sign(y) * Math.acos(x/Math.sqrt(x**2 + y**2));
    }
        

    return makeQubitFromSpherical(theta, phi);
}