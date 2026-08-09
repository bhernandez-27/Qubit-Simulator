import { ComplexNumber, Ket } from "./state_vector_components";
import { Matrix } from "./matrices";

export function magnitudeSquared(complexNum : ComplexNumber) : number
{
    return complexNum.realPart ** 2 + complexNum.imaginaryPart ** 2;
}

export function complexMultiply(num1 : ComplexNumber, num2 : ComplexNumber) : ComplexNumber
{
    //(a+bi)(c+di) = ac + adi + bci -bd
    return new ComplexNumber((num1.realPart * num2.realPart) - (num1.imaginaryPart * num2.imaginaryPart), (num1.realPart * num2.imaginaryPart) + (num1.imaginaryPart * num2.realPart));
}

function complexAdd(num1 : ComplexNumber, num2 : ComplexNumber)
{
    return new ComplexNumber(num1.realPart + num2.realPart, num1.imaginaryPart + num2.imaginaryPart);
}

export function multiplyMatrixKet(matrix : Matrix, ket : Ket)
{
    let newKetValues : ComplexNumber[] = [];
    let currentValue : ComplexNumber | null;
    for(let i = 0; i < ket.length; i++)
    {
        currentValue = new ComplexNumber(0,0);
        console.log("test");
        for(let j = 0; j < ket.length; j++)
        {
            currentValue = complexAdd(currentValue, complexMultiply(matrix.entries[i][j], ket.complexNumbers[j]));
        }
        console.log("test2");
        console.log(currentValue);
        newKetValues.push(currentValue);
    }

    return new Ket(newKetValues);
}