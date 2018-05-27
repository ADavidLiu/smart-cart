import React from "react";

const Mercado = props => {
    return (
        <li className="mercados__list-item">
            {props.valorTotal}
            {props.fecha}
        </li>
    );
};

export default Mercado;