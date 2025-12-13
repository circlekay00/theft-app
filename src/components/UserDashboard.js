import React from "react";
import MyReports from "./MyReports";
import { Typography } from "@mui/material";


export default function UserDashboard() {
const user = JSON.parse(localStorage.getItem("userData"));


return (
<div>
<Typography variant="h4" sx={{ mb: 2 }}>
Welcome, {user?.name || "User"}
</Typography>


<MyReports />
</div>
);
}