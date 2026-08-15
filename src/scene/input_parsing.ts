import type { MathfieldElement } from "mathlive";
import { ComplexNumber, KetQubit } from "../math/linear_algebra/state_vector_components";
import { ComputeEngine } from "@cortex-js/compute-engine";
import { Matrix } from "../math/linear_algebra/matrices";
import round from "../math/basic_math/round";

const ce = new ComputeEngine();

export function parseComplexNumberFromMathInput(input : MathfieldElement) : ComplexNumber
{
    const errorText = document.getElementById("errorMessage")!;
    errorText.textContent = "";//reset error message

    const latex = input.value;
    return parseComplexNumberFromLatex(latex);
}
       
export function parseComplexNumberFromLatex(latex : string) : ComplexNumber
{
    const expression = ce.parse(latex);
    const result = expression.evaluate();

    const realPart = result.re;
    const imaginaryPart = result.im;

    return new ComplexNumber(realPart, imaginaryPart);
}

export function parseMatrixInput(matrixInputField : MathfieldElement, rows : number, columns : number) : Matrix
{
    let matrix : ComplexNumber[][] = Array.from({ length : rows }, (_, r) => 
        Array.from({ length: columns }, (_, c) => 
        {
            const latex = matrixInputField.getPromptValue(`cell_${r}_${c}`);
            return parseComplexNumberFromLatex(latex);
        })
    );
    
    return new Matrix(matrix);
}

export function parseStringFromComplexNumber(complexNum : ComplexNumber) : string
{
    const roundedTo = 5;
    const realPartString : string = String(round(complexNum.realPart, roundedTo));
    const imaginaryPartString : string = String(round(complexNum.imaginaryPart, roundedTo));
    let complexNumString = "";
    let updatedImaginaryPartString = imaginaryPartString;
    if(imaginaryPartString == "1")
    {
        updatedImaginaryPartString = "i";
    } 
    else if(imaginaryPartString == "-1")
    {
        updatedImaginaryPartString = "-i";
    }
    else
    {
        updatedImaginaryPartString = imaginaryPartString + "i";
    }
      
    if(complexNum.imaginaryPart > 0)
    {
        complexNumString = realPartString + " + " + updatedImaginaryPartString;
    }
    if(complexNum.imaginaryPart < 0)
    {
        complexNumString = realPartString + " - " + updatedImaginaryPartString.slice(1);
    }
    if(realPartString == "0")
    {
        complexNumString = updatedImaginaryPartString;
    }
    if(imaginaryPartString == "0")
    {
        complexNumString = realPartString;
    }
    if(realPartString == "0" && imaginaryPartString == "0")
    {
        complexNumString = "0";
    }
    

    return complexNumString;
}


export function parseStringFromQubit(qubit : KetQubit)
{
    return `${parseStringFromComplexNumber(qubit.complexNumbers[0])}\\lvert0\\rangle\ +\ ${parseStringFromComplexNumber(qubit.complexNumbers[1])}\\lvert1\\rangle`;
}