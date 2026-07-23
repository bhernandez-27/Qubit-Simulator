export default function round(input : number, numOfDecimalPlaces : number) : number 
{
    let factor = 10**numOfDecimalPlaces;
    let scaled = input * factor;
    let roundedScaled = Math.round(scaled);
    return roundedScaled/factor;
}