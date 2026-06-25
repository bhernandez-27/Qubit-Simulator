#include "linear_algebra_components.h"
#include <stdlib.h>


//assumption is that input is a bra or ket
vector conjugate_transpose(vector old_vector) //aka dagger
{
    vector new_vector;
    new_vector.size = old_vector.size;
    new_vector.array_of_complex_numbers = old_vector.array_of_complex_numbers;

    if (new_vector.type_of_vector == bra_vector)
        new_vector.type_of_vector = ket_vector;
    
    if (new_vector.type_of_vector == ket_vector)
        new_vector.type_of_vector = bra_vector;

    for(int i = 0; i < new_vector.size; i++)
    {
        new_vector.array_of_complex_numbers[i].real_part = new_vector.array_of_complex_numbers[i].real_part * -1;//flip sign
    }

    return new_vector;
}
//output is the conjugate transpose. Turns bra to ket and ket to bra.