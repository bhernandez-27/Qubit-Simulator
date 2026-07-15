function conjugateTranspose(bra: Bra) : Ket;
function conjugateTranspose(ket: Ket) : Bra;
function conjugateTranspose(input_vector: Bra | Ket) : Bra | Ket 
{
    let complexNumbers = [];
    for (let i = 0; i < input_vector.length; i++)
    {
        complexNumbers[i] = input_vector[i];//copy
        complexNumbers[i].imaginaryPart *= -1;//flip sign
    }
    
    if (input_vector instanceof Bra)
    {
        return new Ket(complexNumbers);
    } 
    else if (input_vector instanceof Ket)
    {
        return new Bra(complexNumbers);
    } 
    else 
    {
        throw new Error("Input to conjugateTranspose not Bra or Ket");
    }
    
}
