import React, { Component } from "react";
import axios from "axios";

import info from "../info";
import Mercado from "./mercado"

class Mercados extends Component {
    constructor() {
        super();
        this.state = {
            lista: [],
            isLoading: true
        }
    }

    componentDidMount() {
        axios.get(info.urlBaseServer + "/mercados").then(res => {
            const mercados = res.data;
            this.setState({
                lista: mercados,
                isLoading: false
            });
        }).catch(err => {
            console.log(err);
        });
    }

    render() {
        const mercados = this.state.lista.map((mercado, i) => {
            return <Mercado key={i} productos={mercado.productos} valorTotal={mercado.valorTotal} fecha={mercado.fecha}></Mercado>
        });

        return (
            <div className="col-xs-12">
                <div className="col-xs-12 mercados">
                    <h1 className="u-align-inline-center u-margin-bottom-big"><b>Lista de mercados</b></h1>
                    <ul className="mercados__list">
                        { this.state.isLoading ? <div className="u-align-inline-center"><i className="fas fa-sync fa-spin fa-5x lista__icon"></i></div> : "" }
                        { mercados }
                    </ul>
                </div>
            </div>
        );
    }
}

export default Mercados;