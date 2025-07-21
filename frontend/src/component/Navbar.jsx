import React from "react";
import { Link, useLocation } from "react-router-dom";
import ApiService from "../service/ApiService";
import {
  BarChart2,
  Repeat,
  Boxes,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  User,
  LogOut
} from "lucide-react";

const logout = () => {
  ApiService.logout();
};

const Navbar = () => {
  const location = useLocation();
  const isAuth = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();

  const links = [
    { to: "/dashboard", label: "Tableau de bord", icon: <BarChart2 />, auth: true },
    { to: "/transaction", label: "Transactions", icon: <Repeat />, auth: true },
    { to: "/category", label: "Catégorie", icon: <Boxes />, auth: true, admin: true },
    { to: "/product", label: "Produits", icon: <Package />, auth: true, admin: true },
    { to: "/supplier", label: "Fournisseurs", icon: <Users />, auth: true, admin: true },
    { to: "/purchase", label: "Achats", icon: <ShoppingCart />, auth: true },
    { to: "/sell", label: "Ventes", icon: <DollarSign />, auth: true },
    { to: "/profile", label: "Profil", icon: <User />, auth: true },
    { to: "/login", label: "Déconnexion", icon: <LogOut />, auth: true, onClick: logout }
  ];

  return (
    <>
    <div className="topbar">
        <div className="logo-section">
          <Package className="logo-icon" />
          <span className="logo-text">StockFlow Pro</span>
        </div>
      </div>
    <nav className="navbar">
      {links.map((link, idx) => {
        if (
          (link.auth && !isAuth) ||
          (link.admin && !isAdmin)
        )
          return null;

        return (
          <Link
            key={idx}
            to={link.to}
            className={`nav-item ${location.pathname === link.to ? "active" : ""}`}
            onClick={link.onClick}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </nav>
    </>
  );
};

export default Navbar;
