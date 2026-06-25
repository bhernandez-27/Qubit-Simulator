#include "linear_algebra_components.h"
#include <stdbool.h>
#include <stdlib.h>

vector create_bra(int num_of_elements)
{
    vector new_bra_vector;
    new_bra_vector.array_of_complex_numbers = calloc(num_of_elements, sizeof(complex_number));
    new_bra_vector.size = num_of_elements;
    new_bra_vector.type_of_vector = bra_vector;

    return new_bra_vector;
}

vector create_ket(int num_of_elements)
{
    vector new_ket_vector;
    new_ket_vector.array_of_complex_numbers = calloc(num_of_elements, sizeof(complex_number));
    new_ket_vector.size = num_of_elements;
    new_ket_vector.type_of_vector = ket_vector;

    return new_ket_vector;
}

void insert_element(vector *vector_being_modified, complex_number value, int position)
{
    vector_being_modified->array_of_complex_numbers[position]= value;
}

complex_number create_complex_number(double real_part, bool has_imaginary_part)
{   
    complex_number new_complex_number;
    new_complex_number.real_part = real_part;
    new_complex_number.has_imaginary_part = has_imaginary_part;

    return new_complex_number;
}