import { divideQubitByScalar, innerProduct, qubitMagnitudeSquared } from "./operations";
import { KetQubit, BraQubit } from "./state_vector_components";
import { makeQubitFromSpherical } from "./state_vector_components";
import { complexMultiply } from "./operations";

export type MeasuredQubit = "theta" | "thetaPerp";

//measurement basis object
export class MeasurementBasis
{
  theta : number;
  phi : number;
  thetaPerp : number;
  basisQubitBra : BraQubit;
  basisQubitKet : KetQubit;
  basisOrthogonalQubitBra : BraQubit;
  basisOrthogonalQubitKet : KetQubit;

  constructor(theta : number, phi : number)
  {
    this.theta = theta;
    this.phi = phi;
    this.thetaPerp = theta + Math.PI;
    this.basisQubitKet = makeQubitFromSpherical(theta, phi);
    this.basisQubitBra = new BraQubit(this.basisQubitKet.complexNumbers[0], this.basisQubitKet.complexNumbers[1]);
    this.basisOrthogonalQubitKet = makeQubitFromSpherical(this.thetaPerp, phi); 
    this.basisOrthogonalQubitBra = new BraQubit(this.basisOrthogonalQubitKet.complexNumbers[0], this.basisOrthogonalQubitKet.complexNumbers[1]);
  }

  update(newTheta : number, newPhi : number)
  {
    this.theta = newTheta;
    this.phi = newPhi;
    this.thetaPerp = newTheta + Math.PI;
    this.basisQubitKet = makeQubitFromSpherical(newTheta, newPhi);
    this.basisQubitBra = new BraQubit(this.basisQubitKet.complexNumbers[0], this.basisQubitKet.complexNumbers[1]);
    this.basisOrthogonalQubitKet = makeQubitFromSpherical(this.thetaPerp, newPhi); 
    this.basisOrthogonalQubitBra = new BraQubit(this.basisOrthogonalQubitKet.complexNumbers[0], this.basisOrthogonalQubitKet.complexNumbers[1]);   
  }
};

export class Measurement
{
    basisQubitProjection : KetQubit;
    basisOrthogonalQubitProjection : KetQubit;
    basisQubitProb : number;
    basisOrthogonalQubitProb : number;
    basisQubitPM : KetQubit;
    basisOrthogonalQubitPM : KetQubit;
    postMeasurementState : KetQubit;
    measuredQubit : MeasuredQubit;
    measuredQubitProb : number;

    constructor(basisQubitProjection : KetQubit, basisOrthogonalQubitProjection : KetQubit, basisQubitProb : number, basisOrthogonalQubitProb : number, basisQubitPM : KetQubit, basisOrthogonalQubitPM : KetQubit, postMeasurementState : KetQubit, measuredQubit : MeasuredQubit, measuredQubitProb : number)
    {
        this.basisQubitProjection = basisQubitProjection;
        this.basisOrthogonalQubitProjection = basisOrthogonalQubitProjection;
        this.basisQubitProb = basisQubitProb;
        this.basisOrthogonalQubitProb = basisOrthogonalQubitProb;
        this.basisQubitPM = basisQubitPM;
        this.basisOrthogonalQubitPM = basisOrthogonalQubitPM;
        this.postMeasurementState = postMeasurementState;
        this.measuredQubit = measuredQubit;
        this.measuredQubitProb = measuredQubitProb;
    }
}

export function measureQubit(ketQubit : KetQubit, measurementBasis : MeasurementBasis)
{
    //projecting the qubit using the measurement basis
    const basisQubitProjectionScalar = innerProduct(measurementBasis.basisQubitBra, ketQubit);
    const basisOrthogonalQubitProjectionScalar = innerProduct(measurementBasis.basisOrthogonalQubitBra, ketQubit);
    const basisQubitProjection : KetQubit = new KetQubit(complexMultiply(basisQubitProjectionScalar, measurementBasis.basisQubitKet.complexNumbers[0]), complexMultiply(basisQubitProjectionScalar, measurementBasis.basisQubitKet.complexNumbers[1]));
    const basisOrthogonalQubitProjection : KetQubit = new KetQubit(complexMultiply(basisOrthogonalQubitProjectionScalar, measurementBasis.basisOrthogonalQubitKet.complexNumbers[0]), complexMultiply(basisOrthogonalQubitProjectionScalar, measurementBasis.basisOrthogonalQubitKet.complexNumbers[1]));
    
    console.log(basisQubitProjectionScalar);
    console.log(basisQubitProjection);
    //using the projected state to determine probabilities
    const basisQubitProb = qubitMagnitudeSquared(basisQubitProjection);
    const basisOrthogonalQubitProb = qubitMagnitudeSquared(basisOrthogonalQubitProjection);

    console.log(basisQubitProb);
    //determining the post measurement states
    const basisQubitResultPM = divideQubitByScalar(basisQubitProjection, Math.sqrt(basisQubitProb));
    const basisOrthogonalQubitResultPM = divideQubitByScalar(basisOrthogonalQubitProjection, Math.sqrt(basisOrthogonalQubitProb));


    let chosenPMState : KetQubit | null = null;
    let chosenQubit : MeasuredQubit | null = null;
    let chosenResultProb : number = 0;

    const randomNum = Math.random();
    if(randomNum < basisQubitProb)
    {
        chosenPMState = basisQubitResultPM;
        chosenResultProb = basisQubitProb;
        chosenQubit = "theta";
    } 
    else 
    {
        chosenPMState = basisOrthogonalQubitResultPM;
        chosenResultProb = basisOrthogonalQubitProb;
        chosenQubit = "thetaPerp";
    }
    return new Measurement(basisQubitProjection, basisOrthogonalQubitProjection, basisQubitProb, basisOrthogonalQubitProb, basisQubitResultPM, basisOrthogonalQubitResultPM, chosenPMState, chosenQubit, chosenResultProb);
}   