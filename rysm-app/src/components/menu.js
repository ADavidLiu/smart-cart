import React from "react";
import { Link } from "react-router-dom";

const Menu = props => {
	return (
		<nav className="header__nav">
			<ul className="header__menu">
				<li className="header__menu-item"><Link to="/">Lista de compras</Link></li>
				<li className="header__menu-item"><Link to="/mercados">Mis mercados</Link></li>
			</ul>
		</nav>
	);
};

export default Menu;
