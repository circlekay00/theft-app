import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ReportForm from "./components/ReportForm";
import AdminDashboard from "./components/AdminDashboard";
import ManageCategories from "./components/ManageCategories";
import ManageSubcategories from "./components/ManageSubcategories";
import ManageOffenders from "./components/ManageOffenders";
import ManageFields from "./components/ManageFields";
import ManageUsers from "./components/ManageUsers";
import Logout from "./components/Logout";
import Login from "./components/Login";
import Register from "./components/Register";
import Stats from "./components/Stats";
import RequireAdmin from "./components/RequireAdmin";
import RequireSuperAdmin from "./components/RequireSuperAdmin";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />

          {/* LOGGED IN USERS */}
          <Route path="/" element={<ReportForm />} />

          {/* ADMIN + SUPERADMIN */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          {/* SUPERADMIN ONLY */}
          <Route
            path="/manage-categories"
            element={
              <RequireSuperAdmin>
                <ManageCategories />
              </RequireSuperAdmin>
            }
          />
          <Route
            path="/manage-subcategories"
            element={
              <RequireSuperAdmin>
                <ManageSubcategories />
              </RequireSuperAdmin>
            }
          />
          <Route
            path="/manage-offenders"
            element={
              <RequireSuperAdmin>
                <ManageOffenders />
              </RequireSuperAdmin>
            }
          />
          <Route
            path="/manage-fields"
            element={
              <RequireSuperAdmin>
                <ManageFields />
              </RequireSuperAdmin>
            }
          />
          <Route
            path="/manage-users"
            element={
              <RequireSuperAdmin>
                <ManageUsers />
              </RequireSuperAdmin>
            }
          />

          {/* STATS */}
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Layout>
    </Router>
  );
}
