import type { MathfieldElement } from "mathlive";
import { ComplexNumber } from "../math/linear_algebra/state_vector_components";
import { ComputeEngine } from "@cortex-js/compute-engine";
import { Matrix } from "../math/linear_algebra/matrices";
const ce = new ComputeEngine();

export function parseComplexNumberFromMathInput(input : MathfieldElement) : ComplexNumber
{
    const errorText = document.getElementById("errorMessage")!;
    errorText.textContent = "";//reset error message

    const latex = input.value;
    return parseComplexNumberFromLatex(latex);
}
       
function parseComplexNumberFromLatex(latex : string) : ComplexNumber
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
