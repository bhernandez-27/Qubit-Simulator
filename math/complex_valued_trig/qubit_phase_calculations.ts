import { ComplexNumber } from "../linear_algebra/components";
import { AmplitudeVector } from "../linear_algebra/components";

export function argument(complexNumber : ComplexNumber) : number
{
    let arg = Math.atan2(complexNumber.imaginaryPart, complexNumber.realPart);
    return arg;
}

export const amplitude = (inputComplexNumber : ComplexNumber) => Math.sqrt((inputComplexNumber.realPart ** 2) + (inputComplexNumber.imaginaryPart ** 2));

export function findRelativePhase(alpha : ComplexNumber, beta : ComplexNumber) : number
{
    let alphaArg : number = argument(alpha);
    let betaArg : number = argument(beta);
    let relativePhase : number = betaArg - alphaArg;
    return relativePhase;
}

export const findTheta = (alpha : ComplexNumber) : number => 2 * Math.acos(amplitude(alpha));