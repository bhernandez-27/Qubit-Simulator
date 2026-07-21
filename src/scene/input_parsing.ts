import { ComplexNumber } from "../math/linear_algebra/components";

export function parseComplexNumberFromString(input : string) : ComplexNumber
{
    let realPart = 0;
    let imaginaryPart = 0;

    const errorText = document.getElementById("errorMessage")!;
    errorText.textContent = "";//reset error message

    //regExp to test if valid input
    if(/^ *-?\d+ *$/.test(input) || /^ *-?\d+\.\d+ *$/.test(input)) //real a or -a. just real part, no imaginary part. Example: 5
    {
        realPart = Number(input);
        console.log("real a");
    }
    else if(/^ *-?\d+i *$/.test(input) || /^ *-?\d+\.\d+i *$/.test(input)) //imaginary part only: bi or -bi with real b
    {
        imaginaryPart = Number(input.slice(0, input.indexOf("i")));//slice out the i
        console.log("real b");
    } 
    else if(/^ *-?i *$/.test(input))//imaginary part only with b = 1 or -1
    {
        if(input.indexOf("-") >= 0)
        {
            imaginaryPart = -1;
        } 
        else
        {
            imaginaryPart = 1;
        }
        console.log("b=1");
    }
    else if(/ *-?\d+ *[-+] *\d+i *$/.test(input))//both ints
    {
        const parts = / *(-?\d+) *([-+]) *(\d+)i *$/.exec(input)!;
        realPart = Number(parts[1]);
        imaginaryPart = Number(parts[3]);  
        if(parts[3] === "-")
        {
            imaginaryPart *= -1;
        } 
        console.log("both a and b ints");
    } 
    else if(/ *-?\d+ *[-+] *i *$/.test(input))//both ints, with b = 1
    {
        const parts = / *(-?\d+) *([-+]) *i *$/.exec(input)!;
        realPart = Number(parts[1]);
        imaginaryPart = 1;    
        if(parts[2] === "-")
        {
            imaginaryPart *= -1;
        }
        console.log("int a and b=1");
    } 
    else if(/^ *-?\d+ *[-+] *\d+.\d+i *$/.test(input))//a int b real
    {
        const parts = /^ *(\d+) *[-+] *(\d+.\d+)i *$/.exec(input)!;
        realPart = Number(parts[1]);
        imaginaryPart = Number(parts[3]);    
        if(parts[2]==="-")
        {
            imaginaryPart *= -1;
        }
        console.log("int a real b");
    } 
    else if(/ *-?\d+.\d+ *[-+] *i *$/.test(input))//a real b int
    {
        const parts = / *(-?\d+.\d+) *([-+]) *(\d+)i *$/.exec(input)!;
        realPart = Number(parts[1]);
        imaginaryPart = Number(parts[3]);  
        if(parts[2] === "-")
        {
            imaginaryPart *= -1;
        }
        console.log("real a int b");  
    } 
    else if(/ *-?\d+.\d+ *[-+] *i *$/.test(input))//a real b int with b = 1
    {
        const parts = /^ *(-?\d+.\d+) *([-+]) *i *$/.exec(input)!;
        realPart = Number(parts[1]);
        imaginaryPart = 1;    
        if(parts[2] === "-")
        {
            imaginaryPart *= -1;
        }
        console.log("real a int b=1");
    } 
    else if(/ *-?\d+.\d+ *[-+] *\d+.\d+i *$/.test(input))//both real
    {
        const parts = /^ *(-?\d+.\d+) *([-+]) *(\d+.\d+)i *$/.exec(input)!;
        realPart = Number(parts[1]);
        imaginaryPart = Number(parts[3]);    
        if(parts[2] === "-")
        {
            imaginaryPart *= -1;
        }
        console.log("both real");
    } 
    else 
    {
        errorText.textContent = "Invalid Input. Each value must be a complex number of the form a + bi where a and b are real numbers!";
        errorText.style.fontSize = "24px";
        console.error("Invalid Input: ", input);
    }

    return new ComplexNumber(realPart, imaginaryPart);
}
       
