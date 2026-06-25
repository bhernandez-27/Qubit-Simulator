#include <stdio.h>
#include "linear_algebra_components.h"

void display_bra(vector bra)
{
    printf("(");
    for(int i = 0; i < bra.size; i++)
    {
        if(bra.array_of_complex_numbers[i].has_imaginary_part)
            printf("%fi ", bra.array_of_complex_numbers[i].real_part);
        else 
            printf("%f ", bra.array_of_complex_numbers[i].real_part);
    }
    printf(")\n");
}


void display_ket(vector ket)
{
    for(int i = 0; i < ket.size; i++)
    {
        if(ket.array_of_complex_numbers[i].has_imaginary_part)
            printf("(%fi)\n", ket.array_of_complex_numbers[i].real_part);
        else 
            printf("(%f)\n", ket.array_of_complex_numbers[i].real_part);
    }
}
