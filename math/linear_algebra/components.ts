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


class BraQubit extends Bra
{
    theta : number;
    phi : number; 
    constructor(alpha : ComplexNumber, beta : ComplexNumber)
    {
        super([alpha,beta]);
        this.theta = findTheta(alpha);
        this.phi = findRelativePhase(alpha, beta);
    }
}

class KetQubit extends Ket 
{
    theta : number;
    phi : number;
    constructor(alpha : ComplexNumber, beta : ComplexNumber)
    {
        super([alpha,beta]);
        this.theta = findTheta(alpha);
        this.phi = findRelativePhase(alpha, beta);
    }
}