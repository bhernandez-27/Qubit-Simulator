import { findTheta, findRelativePhase } from "../complex_valued_trig/qubit_phase_calculations";

export class ComplexNumber 
{
    realPart : number;
    imaginaryPart : number;

    constructor(realPart : number, imaginaryPart : number) 
    {
        this.realPart = realPart;
        this.imaginaryPart = imaginaryPart;
    }
}

export interface AmplitudeVector {
    [index: number]: ComplexNumber;
}

export class AmplitudeVector
{
    complexNumbers : ComplexNumber[];
    length : number;

    constructor(complexNumbers: ComplexNumber[])
    {
        this.complexNumbers = complexNumbers;
        this.length = complexNumbers.length;

        return new Proxy(this, 
            {
                get(target, prop, receiver)
                {
                    if (typeof prop === "string" && /^\d+$/.test(prop)) 
                    {
                        return target.complexNumbers[Number(prop)];  // use `target` to reach the real array
                    }
                    return Reflect.get(target, prop, receiver); // fallback: normal behavior, using `receiver`
                }
            }
        )
    }

    
}

export class Bra extends AmplitudeVector 
{
    constructor(complexNumbers: ComplexNumber[])
    {
        super(complexNumbers);
    }
}

export class Ket extends AmplitudeVector 
{
    constructor(complexNumbers: ComplexNumber[])
    {
        super(complexNumbers);
    }
}

export interface Qubit
{
    complexNumbers : ComplexNumber[];
    length : number;
    theta : number;
    phi : number; 
}

export class BraQubit extends Bra implements Qubit
{
    theta : number;
    phi : number; 
    constructor(alpha : ComplexNumber, beta : ComplexNumber)
    {
        super([alpha,beta]);
        this.theta = findTheta(alpha);
        this.phi = findRelativePhase(alpha, beta);
    }

    update(alpha : ComplexNumber, beta : ComplexNumber)
    {
        this.theta = findTheta(alpha);
        this.phi = findRelativePhase(alpha, beta);
        this.complexNumbers = [alpha,beta];
    }
}

export class KetQubit extends Ket implements Qubit
{
    theta : number;
    phi : number;
    constructor(alpha : ComplexNumber, beta : ComplexNumber)
    {
        super([alpha,beta]);
        this.theta = findTheta(alpha);
        this.phi = findRelativePhase(alpha, beta);
    }
    update(alpha : ComplexNumber, beta : ComplexNumber)
    {
        this.theta = findTheta(alpha);
        this.phi = findRelativePhase(alpha, beta);
        this.complexNumbers = [alpha,beta];
    }
}

function complexMultiply(num1 : ComplexNumber, num2 : ComplexNumber) : ComplexNumber
{
    //(a+bi)(c+di) = ac + adi + bci -bd
    return new ComplexNumber((num1.realPart * num2.realPart) - (num1.imaginaryPart * num2.imaginaryPart), (num1.realPart * num2.imaginaryPart) + (num1.imaginaryPart * num2.realPart));
}

export function makeQubitFromSpherical(theta : number, phi : number) : KetQubit
{
    //A qubit has the form cos(theta/2)|0> + e^i*phi * sin(theta/2)|1>
    //e^i * phi = cos(phi) + i * sin(phi)
    let alphaReal : number = Math.cos(theta/2);
    let alpha : ComplexNumber = new ComplexNumber(alphaReal, 0);

    let eIPhi : ComplexNumber = new ComplexNumber(Math.cos(phi), Math.sin(phi));
    let sinPart : ComplexNumber = new ComplexNumber(Math.sin(theta/2), 0);

    let beta = complexMultiply(eIPhi, sinPart);

    return new KetQubit(alpha, beta);
}