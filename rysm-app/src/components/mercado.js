import React from "react";
import Item from "./item";

const Mercado = props => {
    const productos = props.productos.map(producto => {
        return <Item key={producto.nombre} imagen={producto.imagen} nombre={producto.nombre} precioUnitario={producto.precioUnitario} cantidad={producto.cantidad} medida={producto.medida} isHighlighted={false}></Item>
    });

    return (
        <li className="mercados__list-item">
            <div className="mercados__list-item-info">
                <h4 className="mercados__list-item-date">{props.fecha}</h4>
                <h1 className="mercados__list-item-total">${props.valorTotal}</h1>
            </div>
            <div className="mercados__list-item-products">
                { productos }
            </div>
        </li>
    );
};

export default Mercado;