import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ReportForm from "./components/ReportForm";
import AdminDashboard from "./components/AdminDashboard";
import ManageCategories from "./components/ManageCategories";
import ManageSubcategories from "./components/ManageSubcategories";
import ManageOffenders from "./components/ManageOffenders";
import ManageFields from "./components/ManageFields";
import Logout from "./components/Logout";
import Login from "./components/Login";

import RequireAdmin from "./components/RequireAdmin";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/" element={<ReportForm />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          <Route
            path="/manage-categories"
            element={
              <RequireAdmin>
                <ManageCategories />
              </RequireAdmin>
            }
          />

          <Route
            path="/manage-subcategories"
            element={
              <RequireAdmin>
                <ManageSubcategories />
              </RequireAdmin>
            }
          />

          <Route
            path="/manage-offenders"
            element={
              <RequireAdmin>
                <ManageOffenders />
              </RequireAdmin>
            }
          />

          <Route
            path="/manage-fields"
            element={
              <RequireAdmin>
                <ManageFields />
              </RequireAdmin>
            }
          />

          {/* Logout */}
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Layout>
    </Router>
  );
}
