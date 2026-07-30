import type { MathfieldElement } from "mathlive";
import { ComplexNumber } from "../math/linear_algebra/components";
import { ComputeEngine } from "@cortex-js/compute-engine";

const ce = new ComputeEngine();

export function parseComplexNumberFromMathInput(input : MathfieldElement) : ComplexNumber
{
    const errorText = document.getElementById("errorMessage")!;
    errorText.textContent = "";//reset error message

    const latex = input.value;
    const expression = ce.parse(latex);
    const result = expression.evaluate();

    const realPart = result.re;
    const imaginaryPart = result.im;

    return new ComplexNumber(realPart, imaginaryPart);
}
       
