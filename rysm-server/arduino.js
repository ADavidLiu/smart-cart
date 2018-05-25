// Paquetes necesarios
// Para leer el puerto USB
const SerialPort = require("serialport");
// Librería para REST
const axios = require("axios");

// Lectura del puerto serial
const puerto = "/dev/cu.usbmodem1411";
const port = new SerialPort(puerto, {
	baudRate: 9600
});

// URL del servidor
const urlServer = "http://localhost:4000/";

// Inicialización del string de los datos recibidos
let dataString = "";

// Cuando reciba datos por el puerto serial
port.on("data", data => {
    // Concatenar todo lo que llegue
    dataString += data.toString();
    // Cuando el string empiece por ';' y termine en ':', significa que la información está completa
	if (dataString.includes(";", 0) && dataString.includes(":", dataString.length - 1)) {
        // Separa el ID y el peso leído
        const id = dataString.split(";:")[0].split(";")[1];
        const grs = parseFloat(dataString.split(";:")[1].split(":")[0]);

        // Inicialización del objeto del producto leído
        let producto = {};

        // Si es un item con peso, lo asigna al producto.
        if (grs <= 0.2) {
            producto = {
                id: id
            }
        } else {
            producto = {
                id: id,
                peso: grs
            }
        }

        // Si es una notificación
        if (id === "27150207170232") {
            // Envía la notificación al servidor
            enviarDatos("notificacion", {
                seccion: "FRUTAS"
            });
        } else {
            // Envía los datos al servidor
            enviarDatos("lista-de-compras", producto);
        }

        // Reinicia la cadena de datos leídos
        dataString = "";
    }
});

// Capturar errores al leer el puerto serial
port.on("error", err => {
	console.log("Error: ", err.message);
});

// Función para enviar los datos al servidor
const enviarDatos = (ruta, datos) => {
    axios.post(urlServer + ruta, datos).then(res => {
        console.log(res.data);
    }).catch(err => {
        console.log(err);
    });
}