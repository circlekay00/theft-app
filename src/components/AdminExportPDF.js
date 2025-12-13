// src/components/AdminExportPDF.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminExportPDF(report) {
  if (!report) return;

  const doc = new jsPDF();

  const {
    id,
    categoryName,
    subcategory,
    status,
    createdAt,
    fields = {},
  } = report;

  const createdDate = createdAt?.toDate
    ? createdAt.toDate().toLocaleString()
    : String(createdAt);

  doc.setFontSize(18);
  doc.text("Report Details", 14, 15);

  doc.setFontSize(12);
  doc.text(`Report ID: ${id}`, 14, 25);
  doc.text(`Created At: ${createdDate}`, 14, 32);

  const tableRows = [
    ["Category", categoryName || ""],
    ["Subcategory", subcategory || ""],
    ["Status", status || ""],
    ["Store Number", fields["Store Number"] || ""],
    ["Offender", fields.offender || ""],
    ["Details", fields.Details || ""],
    ["Police Report #", fields.policeReport || ""],
    ["Reporter Name", fields.reporterName || ""],
    ["Reporter ID", fields.reporterId || ""],
  ];

  autoTable(doc, {
    startY: 40,
    head: [["Field", "Value"]],
    body: tableRows,
    styles: { fontSize: 11, cellPadding: 3 },
    headStyles: { fillColor: [0, 0, 0] },
  });

  doc.save(`report_${id}.pdf`);
}
