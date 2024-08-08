import React from 'react';
import { saveAs } from "file-saver";
import { message } from "antd";
import { ref, onValue } from "firebase/database"; // Import ref và onValue từ Firebase Database
import { database } from "../firebaseConfig";
import { Packer, Document, Paragraph, TextRun } from "docx";

const CVWord = async (employee, projects) => {
  const formatSkill = (skill) =>
    skill
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const formatDepartment = (department) => {
    if (typeof department === "string") {
      return department
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return department;
  };

  try {
    // Create a new Document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Name and Address Section
            new Paragraph({
              children: [
                new TextRun({
                  text: employee.name || "Name not available",
                  bold: true,
                  size: 32, // Optional: Adjust font size
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Address: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: employee.address || "Address not available",
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Email: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: employee.email || "Email not available",
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Department: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text:
                    formatDepartment(employee.department) || "Not provided",
                  size: 24,
                }),
              ],
            }),

            // Add a blank paragraph to create space
            new Paragraph({}),

            // WORKING EXPERIENCE Section
            new Paragraph({
              children: [
                new TextRun({
                  text: "WORKING EXPERIENCE",
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Skill: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: Array.isArray(employee.skills)
                    ? employee.skills.map(formatSkill).join(", ")
                    : employee.skills
                    ? formatSkill(employee.skills)
                    : "Not provided",
                  size: 24,
                }),
              ],
            }),

            // Add a blank paragraph to create space
            new Paragraph({}),

            // TYPICAL PROJECTS Section
            new Paragraph({
              children: [
                new TextRun({
                  text: "TYPICAL PROJECTS",
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            ...(Array.isArray(employee.projects) &&
            employee.projects.length > 0
              ? employee.projects.map((project, index) => [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Project name: ",
                        bold: true,
                        size: 24,
                      }),
                      new TextRun({
                        text: project.name || "No name provided",
                        size: 24,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Role: ",
                        bold: true,
                        size: 24,
                      }),
                      new TextRun({
                        text: project.role || "No role provided",
                        size: 24,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Description: ",
                        bold: true,
                        size: 24,
                      }),
                      new TextRun({
                        text:
                          project.description || "No description provided",
                        size: 24,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Specification: ",
                        bold: true,
                        size: 24,
                      }),
                      new TextRun({
                        text:
                          project.specification ||
                          "No specification provided",
                        size: 24,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Languages and frameworks: ",
                        bold: true,
                        size: 24,
                      }),
                      new TextRun({
                        text: Array.isArray(project.languagesAndFrameworks)
                          ? project.languagesAndFrameworks.join(", ")
                          : "Not provided",
                        size: 24,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Technologies: ",
                        bold: true,
                        size: 24,
                      }),
                      new TextRun({
                        text: Array.isArray(project.technologies)
                          ? project.technologies.join(", ")
                          : "Not provided",
                        size: 24,
                      }),
                    ],
                  }),
                  // Add a blank paragraph to create space between projects
                  new Paragraph({}),
                ])
              : [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Not yet joined the project",
                        size: 24,
                        italics: true,
                      }),
                    ],
                  }),
                ]),
          ],
        },
      ],
    });

    // Save the document as a .docx file
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${employee.name || "Employee"}_CV.docx`);
    });
  } catch (error) {
    console.error("Error exporting to Word:", error);
  }
};

export default CVWord