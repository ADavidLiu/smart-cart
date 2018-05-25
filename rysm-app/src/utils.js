export const cortarDecimales = num => {
    const numString = num.toString();
    if (numString.includes(".")) {
        const parteEntera = numString.split(".")[0];
        const parteDecimal = numString.split(".")[1];
        const nuevoNumero = parseFloat(parteEntera + "." + parteDecimal.slice(0, 2));
        return nuevoNumero;
    } else {
        return num;
    }
}