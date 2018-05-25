import React, { Component } from "react";
import "./styles/app.css";

import ListaDeCompras from "./components/listaDeCompras";

class App extends Component {
	render() {
		return (
			<div className="App">
				<div className="container">
					<div className="row">
						<div className="col-xs-12 u-align-inline-center">
							<h1 className="u-margin-bottom-big"><b>Carrito de compras</b></h1>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<ListaDeCompras />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
