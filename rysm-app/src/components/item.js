import React from "react";

const Item = (props) => {
    // Determina si el producto debe estar "seleccionado" o no, y aplica las animaciones correspondientes
    const classes = props.isHighlighted ? "lista__item animated tada infinite" : "lista__item animated infinite";

    return (
        <div className={classes}>
            <div className="lista__item-img-wrapper">
                <img src={props.imagen} alt="Imagen del producto"/>
            </div>
            <div className="lista__item-copy">
                <div className="lista__item-info">
                    <h3>{props.nombre}</h3>
                    <p>Precio unitario: ${props.precioUnitario}</p>
                </div>
                <div className="lista__item-cantidad">
                    <h2><small>Cantidad:</small> {props.cantidad} <small>{props.medida}</small></h2>
                </div>
            </div>
        </div>
    );
}

export default Item;