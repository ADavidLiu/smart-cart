import React, { Component } from "react";
import axios from "axios";
import socketIOClient from "socket.io-client";
import moment from "moment";

import info from "../info";
import { cortarDecimales } from "../utils";
import Item from "./item";

class ListaDeCompras extends Component {
    // Inicializa el componente
    constructor(props) {
        super();
        // Define el estado inicial
        this.state = {
            lista: [],
            valorTotal: 0,
            isLoading: true,
            isFilled: false
        }
    }

    // Actualiza las cantidades de los productos a medida que son escaneados
    actualizarLista = nuevaLista => {
        const nuevosProductos = nuevaLista.productos;
        const nuevoValorTotal = nuevaLista.valorTotal;

        let listaActual = this.state.lista;

        listaActual.map(productoActual => {
            nuevosProductos.map(productoNuevo => {
                if (productoActual.id === productoNuevo.id) {
                    productoActual.cantidad = productoNuevo.cantidad;
                }
            });
        });

        // Modifica el estado de la lista de compras y genera el cambio visual en la interfaz
        this.setState({
            lista: listaActual,
            valorTotal: nuevoValorTotal,
            isFilled: true
        });
    }

    // Recibe la "sección" o categoría de la sección escaneada en el supermercado y modifica el estado visual de los productos correspondientes
    notificarSeccion = seccion => {
        const listaActual = this.state.lista;
        listaActual.map(producto => {
            if (producto.seccion === seccion) {
                producto.isHighlighted = true;

                // Reproduce el sonido
                try {
                    this.refs.alerta.play();
                } catch(err) {
                    console.log(err);
                }
                // Después de 5 segundos, para el sonido y regresa el producto a su estado normal
                const timeout = setTimeout(() => {
                    this.refs.alerta.pause();
                    this.refs.alerta.currentTime = 0;
                    producto.isHighlighted = false;

                    // Vuelve a actualizar el estado con los productos correspondientes sin estar seleccionados
                    this.setState({
                        lista: listaActual
                    });

                    // Destruye el timer
                    clearTimeout(timeout);
                }, 5000);
            }
        });

        // Actualiza el estado con los productos correspondientes seleccionados
        this.setState({
            lista: listaActual
        });
    }

    // Envía un POST al servidor para guardar el estado final de la lista de compras en la base de datos de los mercados
    terminar = () => {
        axios.post(info.urlBaseServer + "/terminar", {
            productos: this.state.lista,
            valorTotal: this.state.valorTotal,
            fecha: `${moment().format("MMMM Do YYYY, h:mm:ss a")}`
        }).then(res => {
            // Reinicia el estado
            this.setState({
                lista: [],
                valorTotal: 0,
                isLoading: true,
                isFilled: false
            });
            // Dar tiempo para que el servidor reinicie la lista en la base de datos
            const timeout = setTimeout(() => {
                this.cargar();
                clearTimeout(timeout);
            }, 5000);
        }).catch(err => {
            console.log(err);
        });
    }

    // Llena el estado con la información de la lista en la base de datos
    cargar = () => {
        // Obtiene los valores e información iniciales de la lista de compras en la base de datos
        let listaActual = [];
        let valorTotal = 0;

        // Consume el servicio web del servidor para cargar la lista de compras
        axios.get(info.urlBaseServer + "/lista-de-compras").then(res => {
            const listaRecibida = res.data[0].productos;
            valorTotal = res.data[0].valorTotal;
            let isNowFilled = false;

            axios.get(info.urlBaseServer + "/productos").then(res => {
                const productosInventario = res.data;
                listaRecibida.map(producto => {
                    productosInventario.map(productoInventario => {
                        if (producto.id === productoInventario.id) {
                            listaActual.push({
                                id: producto.id,
                                imagen: productoInventario.imagen,
                                nombre: productoInventario.nombre,
                                precioUnitario: productoInventario.precio,
                                cantidad: producto.cantidad,
                                medida: producto.medida,
                                seccion: productoInventario.seccion,
                                isHighlighted: false
                            });
                        }
                    });
                });

                listaActual.map(producto => {
                    if (producto.cantidad > 0) {
                        isNowFilled = true;
                    }
                });

                // Actualiza el estado con la lista de compras actual en la base de datos y elimina el ícono de carga
                this.setState({
                    lista: listaActual,
                    valorTotal: valorTotal,
                    isLoading: false,
                    isFilled: isNowFilled
                });
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            console.log(err);
        });
    }

    // Cuando el componente se haya cargado en el DOM
    componentDidMount = () => {
        // Conexión en tiempo real con el servidor
        const socket = socketIOClient(info.urlBaseServer);
        // "Escucha" al evento "nuevo producto" y recibe los datos del nuevo producto escaneado
        socket.on("nuevo producto", nuevaLista => {
            try {
                this.refs.beep.play();
            } catch(err) {
                console.log(err);
            }
            this.actualizarLista(nuevaLista);
        });
        // "Escucha" el evento "notificacion" y ejecuta la función correspondiente
        socket.on("notificacion", notificacion => {
            const seccionNotificada = notificacion.seccion;
            this.notificarSeccion(seccionNotificada);
        });

        this.cargar();
    }

    // Renderiza los componentes en el DOM
    render() {
        // Crea un arreglo de items para agregar a la lista con base en los que hayan en la base de datos
        const items = this.state.lista.map(item => {
            return <Item key={item.nombre} imagen={item.imagen} nombre={item.nombre} precioUnitario={item.precioUnitario} cantidad={item.cantidad} medida={item.medida} isHighlighted={item.isHighlighted}></Item>
        });

        // JSX renderizado
        return (
            <div className="col-xs-12 lista">
                <h1 className="u-margin-bottom-big u-align-inline-center"><b>Carrito de compras</b></h1>
                <audio src="alerta.wav" className="lista__alerta" loop ref="alerta"></audio>
                <audio src="beep.wav" className="lista__alerta" ref="beep"></audio>
                <div className="col-xs-12 col-sm-6">
                    { this.state.isLoading ? <div className="u-align-inline-center"><i className="fas fa-sync fa-spin fa-5x lista__icon"></i></div> : <h2 className="u-margin-bottom-med u-align-inline-center">Mi lista</h2> }
                    { items }
                </div>
                <div className="col-xs-12 col-sm-6">
                    <div className="lista__total">
                        <h3>Subtotal: ${this.state.valorTotal}</h3>
                        <h3>IVA: ${cortarDecimales(this.state.valorTotal * .19)}</h3>
                        <hr/>
                        <h2>Total a pagar: ${cortarDecimales(this.state.valorTotal + this.state.valorTotal * .19)}</h2>
                    </div>
                    <button className="lista__btn" disabled={this.state.isFilled ? false : true} onClick={this.terminar}>Terminar mercado</button>
                </div>
            </div>
        );
    }
}

export default ListaDeCompras;