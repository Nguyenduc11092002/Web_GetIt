import React from "react";
import { Button } from "antd";
import * as XLSX from "xlsx";
import "../assets/style/Global.scss";

const ExportExcel = ({ data, fileName }) => {
  const exportToExcel = () => {
    // Define the fields to exclude
    const fieldsToExclude = ["id", "isAdmin", "password", "Status"];

    // Filter the data to exclude the specified fields
    const filteredData = data.map((item) => {
      const filteredItem = {};
      Object.keys(item).forEach((key) => {
        if (!fieldsToExclude.includes(key)) {
          filteredItem[key] = item[key];
        }
      });
      return filteredItem;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Define the fields to highlight in green
    const fieldsToHighlight = [
      "email",
      "name",
      "role",
      "contact",
      "createdAt",
      "cv_list",
      "projetcIds",
      "skill",
    ];

    // Apply styles to the header
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: 0 }; // First row, all columns
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      if (!worksheet[cell_ref]) continue;
      if (typeof worksheet[cell_ref].s === "undefined")
        worksheet[cell_ref].s = {};
      worksheet[cell_ref].s.fill = { fgColor: { rgb: "4F81BD" } };
      worksheet[cell_ref].s.font = { color: { rgb: "FFFFFF" }, bold: true };
      worksheet[cell_ref].s.border = {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      };
      worksheet[cell_ref].s.alignment = {
        vertical: "center",
        horizontal: "center",
      };
    }

    // Apply styles to the data cells
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!worksheet[cell_ref]) continue;
        if (typeof worksheet[cell_ref].s === "undefined")
          worksheet[cell_ref].s = {};

        // Get the header value for the current column
        const header_cell_address = { c: C, r: 0 };
        const header_cell_ref = XLSX.utils.encode_cell(header_cell_address);
        const headerValue = worksheet[header_cell_ref].v;

        // Apply green background if the field is in the specified fields to highlight
        if (fieldsToHighlight.includes(headerValue)) {
          worksheet[cell_ref].s.fill = { fgColor: { rgb: "C6EFCE" } };
        }

        worksheet[cell_ref].s.border = {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        };
        worksheet[cell_ref].s.alignment = {
          vertical: "center",
          horizontal: "left",
        };
      }
    }

    // Adjust column widths with specific widths for email and createdAt
    const colWidths = filteredData.reduce((widths, row) => {
      return Object.keys(row).map((key, i) => {
        const cellValue = row[key];
        const length = cellValue ? cellValue.toString().length : 10;
        return Math.max(length, widths[i] || 10);
      });
    }, []);

    const adjustedColWidths = colWidths.map((width, i) => {
      if (Object.keys(filteredData[0])[i] === "email") {
        return { wch: 30 }; // Set a wider width for email
      } else if (Object.keys(filteredData[0])[i] === "createdAt") {
        return { wch: 20 }; // Set a wider width for createdAt
      } else {
        return { wch: width + 2 };
      }
    });

    worksheet["!cols"] = adjustedColWidths;

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate a download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <Button className="btn" type="primary" onClick={exportToExcel}>
      Export to Excel
    </Button>
  );
};

export default ExportExcel;