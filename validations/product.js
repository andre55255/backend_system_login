function description(description) {
    const reg = /[a-zA-Z]/;
    return reg.test(description); // Retorna true se valido apenas letras
}

function quantity(quantity) {
    const reg = /^\d+$/;
    return reg.test(quantity); // Retorna true se valido apenas numeros
}

function valueUnitary(valueUnitary) {
    const reg = /^[1-9]\d*(\.\d+)?$/;
    return reg.test(valueUnitary); // Retorna true se valido numero real
}

module.exports = {
    description,
    quantity,
    valueUnitary
}