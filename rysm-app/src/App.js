import React, { Component } from "react";
import "./styles/app.css";

import { BrowserRouter, Route } from 'react-router-dom';

import ListaDeCompras from "./components/listaDeCompras";
import Menu from "./components/menu";
import Mercados from "./components/mercados";

class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<div className="App">
					<header className="header">
						<div className="container">
							<div className="row">
								<div className="col-xs-12">
									<Menu></Menu>
								</div>
							</div>
						</div>
					</header>
					<div className="container">
						<div className="row">
							<div className="col-xs-12">
								<Route exact path="/" component={ListaDeCompras} />
								<Route path="/mercados" component={Mercados} />
							</div>
						</div>
					</div>
				</div>
			</BrowserRouter>
		);
	}
}

export default App;
