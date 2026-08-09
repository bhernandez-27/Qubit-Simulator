import { KetQubit } from "./state_vector_components";
import { Matrix } from "./matrices";
import { multiplyMatrixKet } from "./operations";

export function rotateKetQubit(rotationMatrix : Matrix, qubit : KetQubit) : KetQubit
{
    const newStateVector = multiplyMatrixKet(rotationMatrix, qubit);
    return new KetQubit(newStateVector.complexNumbers[0], newStateVector.complexNumbers[1]);
}