class ComplexNumber 
{
    realPart : number;
    imaginaryPart : number;

    constructor(realPart : number, imaginaryPart : number) 
    {
        this.realPart = realPart;
        this.imaginaryPart = imaginaryPart;
    }
}

interface Vector
{
    complexNumbers : ComplexNumber[];
    length : number;

    [index: number]: ComplexNumber;
}

class Vector 
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

class Bra extends Vector 
{
    constructor(complexNumbers: ComplexNumber[])
    {
        super(complexNumbers);
    }
}

class Ket extends Vector 
{
    constructor(complexNumbers: ComplexNumber[])
    {
        super(complexNumbers);
    }
}

class BraQubit extends Ket
{
    constructor(alpha : ComplexNumber, beta : ComplexNumber)
    {
        super([alpha,beta]);
    }
}

class KetQubit extends Ket
{
    constructor(alpha : ComplexNumber, beta : ComplexNumber)
    {
        super([alpha, beta]);
    }
}