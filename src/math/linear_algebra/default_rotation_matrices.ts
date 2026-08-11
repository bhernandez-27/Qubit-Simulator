import type { MathfieldElement } from "mathlive";
import { parseComplexNumberFromLatex } from "../../scene/input_parsing";
import { Matrix } from "./matrices";
import { rotateKetQubit } from "./rotations";
import { ComplexNumber, KetQubit } from "./state_vector_components";
import { parseStringFromComplexNumber } from "../../scene/input_parsing";

export type defaultRotationMatrix = "x" | "y" |"z" |"h" |"q";

export function defaultRotation(rotation : defaultRotationMatrix, qubit : KetQubit, inputBox : MathfieldElement) : KetQubit
{
    const oneOverSqrtTwo = parseComplexNumberFromLatex("\\frac{1}{\\sqrt{2}}");
    const negativeOneOverSqrtTwo = parseComplexNumberFromLatex("\\frac{-1}{\\sqrt{2}}");

    const xMatrix = new Matrix([[new ComplexNumber(0,0), new ComplexNumber(1,0)],
                          [new ComplexNumber(1,0), new ComplexNumber(0,0)]]);

    const yMatrix = new Matrix([[new ComplexNumber(0,0), new ComplexNumber(0,-1)],
                          [new ComplexNumber(0,1), new ComplexNumber(0,0)]]);
    
    const zMatrix = new Matrix([[new ComplexNumber(1,0), new ComplexNumber(0,0)],
                          [new ComplexNumber(0,0), new ComplexNumber(-1,0)]]);

    const hMatrix = new Matrix([[oneOverSqrtTwo, oneOverSqrtTwo],[oneOverSqrtTwo, negativeOneOverSqrtTwo]]);
                          
    const qMatrix = new Matrix([[new ComplexNumber(0,1), new ComplexNumber(0,0)],
                          [new ComplexNumber(0,0), new ComplexNumber(1,0)]]);      
                          
    let rotatedQubit : KetQubit | null = null;  
    let chosenMatrix : Matrix | null = null;

    switch(rotation)
    {
        case "x":
            rotatedQubit = rotateKetQubit(xMatrix, qubit);
            chosenMatrix = xMatrix;
            break;
        case "y":
            rotatedQubit = rotateKetQubit(yMatrix, qubit);
            chosenMatrix = yMatrix;
            break;
        case "z":
            rotatedQubit = rotateKetQubit(zMatrix, qubit);
            chosenMatrix = zMatrix;
            break;
        case "h":
            rotatedQubit = rotateKetQubit(hMatrix, qubit);
            chosenMatrix = hMatrix;
            break;
        case "q":
            rotatedQubit = rotateKetQubit(qMatrix, qubit);
            chosenMatrix = qMatrix;
            break;
    }
    
    inputBox.value = buildMatrixLatex(chosenMatrix);
    return rotatedQubit;                                             
}

function buildMatrixLatex(matrix: Matrix): string 
{
    let matrixString : string = `\\begin{pmatrix} `;
    for(let i = 0; i < matrix.rows; i++)
    {
        for(let j = 0; j < matrix.columns; j ++)
        {
            matrixString += `\\placeholder[cell_${i}_${j}]{${parseStringFromComplexNumber(matrix.entries[i][j])}}`;
        }
        matrixString += ` \\\\ `;
    }

    matrixString += `\\end{pmatrix}`;
    return matrixString;
}