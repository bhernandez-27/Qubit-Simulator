#include "linear_algebra_components.h"
#include "display_components.h"
#include "linear_algebra_functions.h"
#include <stdbool.h>
#include <stdio.h>

int main()
{
    //test making and displaying a ket
    vector test_ket = create_ket(2);
    insert_element(&test_ket, create_complex_number(1, true), 1);
    printf("|1>\n");
    display_ket(test_ket);
    

    //now get its conjugate transpose and display it
    conjugate_transpose(&test_ket);
    printf("<1|\n");
    display_bra(test_ket);
    return 0;
}