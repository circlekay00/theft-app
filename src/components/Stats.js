import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Typography } from '@mui/material';
import { db } from "../firebase";  // Firebase import
import { collection, getDocs } from "firebase/firestore";

// Register the necessary chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Stats = () => {
  const [offenderData, setOffenderData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});  // Store category names by ID
  const [loading, setLoading] = useState(true);  // Track loading state

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      const categorySnapshot = await getDocs(collection(db, "categories"));
      const categories = categorySnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().name; // Map category ID to name
        return acc;
      }, {});

      setCategoryNames(categories);  // Store category names in state
      setLoading(false);  // Set loading to false once categories are fetched
    } catch (error) {
      console.error("Error fetching categories: ", error);
    }
  };

  // Fetch reports from Firestore and map offenders and category names
  const fetchReports = async () => {
    if (Object.keys(categoryNames).length === 0) {
      console.log("Category names not loaded yet.");
      return;  // Prevent fetching reports before category names are loaded
    }

    try {
      const reportsRef = collection(db, "reports");  // Adjust to correct collection name if necessary
      const reportsSnapshot = await getDocs(reportsRef);
      
      const offenderCounts = {};
      const categoryCounts = {};

      reportsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const offender = data.offender;
        const categoryId = data.categoryId;

        // Count offenders
        if (offender) {
          offenderCounts[offender] = (offenderCounts[offender] || 0) + 1;
        }

        // Count categories based on categoryId
        if (categoryId) {
          const categoryName = categoryNames[categoryId] || "Unknown Category";  // Get category name from categoryNames map
          categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
        }
      });

      // Map the counts to arrays for charts
      const offenders = Object.keys(offenderCounts);
      const offenderData = Object.values(offenderCounts);
      const categoryNamesList = Object.keys(categoryCounts);
      const categoryData = Object.values(categoryCounts);

      setOffenderData({ offenders, data: offenderData });
      setCategoryData({ categories: categoryNamesList, data: categoryData });
    } catch (error) {
      console.error("Error fetching reports: ", error);
    }
  };

  // Fetch categories once when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch reports once categories are loaded
  useEffect(() => {
    if (categoryNames && !loading) {
      fetchReports();  // Fetch reports after categories are loaded
    }
  }, [categoryNames, loading]);

  // Chart data for offenders
  const offenderChartData = {
    labels: offenderData.offenders || ['No Offenders'],  // Use offender names as labels
    datasets: [
      {
        label: 'Offenders',
        data: offenderData.data || [0],  // Set data for offenders
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for categories
  const categoryChartData = {
    labels: categoryData.categories || ['No Categories'],  // Use category names as labels
    datasets: [
      {
        label: 'Categories',
        data: categoryData.data || [0],  // Set data for categories
        backgroundColor: 'rgba(54,162,235,0.2)',
        borderColor: 'rgba(54,162,235,1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Stats Dashboard
      </Typography>

      {/* Offender Chart */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Offender Distribution</Typography>
        <Bar data={offenderChartData} />
      </Box>

      {/* Category Chart */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Category Distribution</Typography>
        <Bar data={categoryChartData} />
      </Box>

      {/* Add Time or Other Stats if needed */}
    </Box>
  );
};

export default Stats;
