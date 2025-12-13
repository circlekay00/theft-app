// src/components/AdminExportPDF.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function exportReportsToPDF(reports) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Loss Prevention Reports", 40, 40);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);

  const tableColumn = [
    "Store #",
    "Offender",
    "Category",
    "Subcategory",
    "Details",
    "Status",
    "Reporter",
    "Created At",
    "Police #",
  ];

  const tableRows = reports.map((r) => [
    r.storeNumber || "N/A",
    r.offender || "N/A",
    r.categoryName || "N/A",
    r.subcategory || "N/A",
    r.Details || "N/A",
    r.status || "Pending",
    r.reporterName || "Unknown",
    r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleString() : "N/A",
    r.policeReportNumber || "",
  ]);

  doc.autoTable({
    startY: 90,
    head: [tableColumn],
    body: tableRows,
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [33, 33, 33],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save("Reports.pdf");
}
