import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

export default function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="layout-container">
      <nav className="top-nav">
        <div className="nav-left">
          <Link
            to="/"
            className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
          >
            Submit Report
          </Link>

          <Link
            to="/admin"
            className={`nav-item ${
              location.pathname.startsWith("/admin") ? "active" : ""
            }`}
          >
            Admin Dashboard
          </Link>

          <Link
            to="/manage-categories"
            className={`nav-item ${
              location.pathname === "/manage-categories" ? "active" : ""
            }`}
          >
            Categories
          </Link>

          <Link
            to="/manage-subcategories"
            className={`nav-item ${
              location.pathname === "/manage-subcategories" ? "active" : ""
            }`}
          >
            Subcategories
          </Link>

          <Link
            to="/manage-offenders"
            className={`nav-item ${
              location.pathname === "/manage-offenders" ? "active" : ""
            }`}
          >
            Offenders
          </Link>

          <Link
            to="/manage-fields"
            className={`nav-item ${
              location.pathname === "/manage-fields" ? "active" : ""
            }`}
          >
            Custom Fields
          </Link>
        </div>

        <div className="nav-right">
          <Link
            to="/logout"
            className={`nav-item ${
              location.pathname === "/logout" ? "active" : ""
            }`}
          >
            Logout
          </Link>
        </div>
      </nav>

      <main className="content-area">{children}</main>
    </div>
  );
}
