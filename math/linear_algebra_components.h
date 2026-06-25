#ifndef LINEAR_ALGEBRA_COMPONENTS_H
#define LINEAR_ALGEBRA_COMPONENTS_H

#include <stdbool.h>

typedef struct  
{
    double real_part; //this is the 1.2 in 1.2i
    bool has_imaginary_part; //will be true if there is i in the number. For example, will be true for 1.2i and false for 1.2
} complex_number;


typedef enum 
{
    bra_vector,
    ket_vector
} vector_type;


typedef struct 
{
    complex_number *array_of_complex_numbers;
    vector_type type_of_vector;
    int size;
} vector;


vector create_bra(int num_of_elements);

vector create_ket(int num_of_elements);

void insert_element(vector *vector_being_modified, complex_number value, int position);

complex_number create_complex_number(double real_part, bool has_imaginary_part);


#endif