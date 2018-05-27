// Paquetes necesarios
// Servidor
const app = require("express")();
const http = require("http").Server(app);

// Conexión en tiempo real con el cliente
const io = require("socket.io")(http);
io.on("connection", socket => {
	console.log("Se realizó la conexión!");
});

// Para trabajar con JSON
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Para usar MongoDB
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const urlDB = "mongodb://andres.liu:andres.liu@ds243295.mlab.com:43295/rysm-db"; // URL para la base de datos en mLab
const nombreDB = "rysm-db";

// Funciones del servicio web
// Devuelve la lista de compras actual
app.get("/lista-de-compras", (req, res) => {
	consultar("lista-de-compras", datos => {
		res.set("Access-Control-Allow-Origin", "*");
		res.send(datos);
	});
});

// Devuelve los productos en inventario
app.get("/productos", (req, res) => {
	consultar("productos", datos => {
		res.set("Access-Control-Allow-Origin", "*");
		res.send(datos);
	});
});

// Devuelve los mercados anteriores
app.get("/mercados", (req, res) => {
	consultar("mercados", datos => {
		res.set("Access-Control-Allow-Origin", "*");
		res.send(datos);
	});
});

// Actualiza el estado de la lista de compras
app.post("/lista-de-compras", (req, res) => {
    const nuevoProducto = req.body;
    actualizarLista(nuevoProducto);
	res.send("Los datos fueron recibidos");
});

// Recibe la notificación de que la sección del producto escaneado está cerca
app.post("/notificacion", (req, res) => {
	const notificacion = req.body;
	io.emit("notificacion", notificacion);
	res.send("La notificación fue recibida");
});

// Inicia el servidor
http.listen(4000, () => {
	console.log("Servidor iniciado en el puerto 4000");
});

const consultar = (coleccion, callback) => {
	MongoClient.connect(urlDB, (err, client) => {
		assert.equal(null, err);

		const db = client.db(nombreDB);
		const collection = db.collection(coleccion);

		// Devuelve todos los documentos encontrados
		const datos = collection.find({}).toArray((err, res) => {
			if (err) {
				console.log(err);
			}

			// Ejecuta el callback que se le pase
			callback(res);
		});

		client.close();
	});
};

const actualizarLista = nuevoProducto => {
	MongoClient.connect(urlDB, (err, client) => {
		assert.equal(null, err);

		const db = client.db(nombreDB);
		const collection = db.collection("lista-de-compras");
	
		const id = nuevoProducto.id;
		let peso = 0;
		if (nuevoProducto.peso) {
			peso = nuevoProducto.peso;
		}

		// Actualiza la cantidad de cada producto
		consultar("lista-de-compras", datos => {
			const listaActual = datos[0];

			listaActual.productos.map(producto => {
				if (producto.id === id) {
					if (producto.medida === "gramos") {
						if (peso < 0 || peso === NaN || peso === undefined || peso === null) {
							producto.cantidad = 0;
						} else {
							producto.cantidad = peso;
						}
					} else {
						producto.cantidad++;
					}

					consultar("productos", datosInventario => {
						datosInventario.map(productoInventario => {
							if (producto.id === productoInventario.id) {
								if (producto.medida === "gramos") {
									listaActual.valorTotal += producto.cantidad * productoInventario.precio;
								} else {
									listaActual.valorTotal += productoInventario.precio;
								}

								let valorString = listaActual.valorTotal.toString();

								// Para cortar los decimales a sólo 2 caracteres
								if (valorString.includes(".")) {
									const parteEntera = valorString.split(".")[0];
									const parteDecimal = valorString.split(".")[1];
									valorString = parteEntera + "." + parteDecimal.slice(0, 2);

									listaActual.valorTotal = parseFloat(valorString);
								}

								// Actualiza la lista final en la base de datos
								collection.replaceOne({}, listaActual);
								client.close();
								// Manda la nueva lista al cliente para que se actualice en tiempo real
								io.emit("nuevo producto", listaActual);
							}
						});
					});
				}
			});
		});
	});
};

const reiniciarLista = () => {
	MongoClient.connect(urlDB, (err, client) => {
		assert.equal(null, err);

		const db = client.db(nombreDB);
		const collection = db.collection("lista-de-compras");

		consultar("lista-de-compras", datos => {
			const listaActual = datos[0];

			listaActual.valorTotal = 0;

			listaActual.productos.map(producto => {
				producto.cantidad = 0;
			});

			collection.replaceOne({}, listaActual);
		});
	});
}

// Reiniciar la lista de compras en 0 (valor y cantidades) al iniciar el servidor
reiniciarLista();