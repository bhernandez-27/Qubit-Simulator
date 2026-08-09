import type { ComplexNumber } from "./state_vector_components";

export class Matrix
{
    rows : number;
    columns : number;
    entries : ComplexNumber[][];

    constructor(entries : ComplexNumber[][])
    {
        this.entries = entries;
        this.rows = entries.length;
        this.columns = entries[0].length;
    }

    conjugate_transpose() : Matrix
    {
        let newMatrix = Array.from(this.entries);
        for(let i = 0; i < this.entries.length; i++)//flip i and j. i indexes rows and j indexes columns
        {
            for(let j = 0; i < this.entries[0].length; i++)
            {
                newMatrix[i][j] = this.entries[j][i];
                newMatrix[i][j].imaginaryPart *= -1; //flip imaginary sign
            }
        }

        return new Matrix(newMatrix);
    }
}
