import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../assets/style/template/templateCV2.scss";

const generatePDF = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftColumnWidth = pageWidth * 0.7;
  const rightColumnWidth = pageWidth * 0.28;
  const leftColumnStartX = 10;
  const rightColumnStartX = leftColumnStartX + leftColumnWidth + 10;
  const imageWidth = 40; // Width of the avatar image
  const imageHeight = 40; // Height of the avatar image
  const rightColumnPadding = 10; // Padding inside the right column

  // Header
  doc.setFillColor("#1e73be");
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("Sharad Loyal", 10, 15);
  doc.setFontSize(18);
  doc.text("Senior Account Manager", 10, 25);

  // Content
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  let yOffset = 40; // Start after header

  // Helper function to add text with line wrapping
  const addText = (text, x, y, maxWidth, lineHeight = 5) => {
    let splitText = doc.splitTextToSize(text, maxWidth);
    splitText.forEach((line, index) => {
      doc.text(line, x, y + index * lineHeight);
    });
    return y + splitText.length * lineHeight; // Return new y position
  };

  // Info Section
  const info = `Customer-oriented account manager with 8 years of experience overseeing 25+ medium and large clients and successfully managing client relationships. Certified Business Relationship Manager (CBRM). Skilled with Salesforce and Zahn CRM. 100% client satisfaction for 6 straight years.`;
  yOffset = addText(info, leftColumnStartX, yOffset, leftColumnWidth);
  yOffset += 4; // Reduced space after info

  // Experience Section
  doc.setFontSize(14);
  doc.text("Experience", leftColumnStartX, yOffset);
  yOffset += 4; // Reduced space between title and content
  doc.setFontSize(12);

  const experiences = [
    {
      title: "Account Manager",
      company: "Bharti Airtel Limited, Mumbai",
      period: "2016-10 - present",
      details: [
        "Maintained a 100% Net Promoter Score (NPS) rating during the entire span of employment.",
        "Built and maintained new and existing relationships assigned by the account executive.",
        "Negotiated contracts with clients and established a timeline of performance according to policies.",
        "In charge of cross-divisional projects with a creative team ensuring all parties are well briefed and implement within schedule.",
      ],
      achievements: [
        "Increased revenue by 459% or more year-over-year for 4 years straight.",
        "Managed the accounts of 25+ medium and large business clients.",
      ],
    },
    {
      title: "Junior Account Manager",
      company: "Nori PLC PLC, Mumbai",
      period: "2014-09 - 2016-08",
      details: [
        "Assisted key account manager and senior account managers in administering large advertising accounts.",
        "Helped maintain positive, productive, and profitable client relationships.",
        "Managed 5 client accounts per year.",
      ],
    },
  ];

  experiences.forEach((exp) => {
    doc.setFontSize(12);
    yOffset = addText(exp.title, leftColumnStartX, yOffset, leftColumnWidth);
    yOffset = addText(exp.company, leftColumnStartX, yOffset, leftColumnWidth);
    yOffset = addText(exp.period, leftColumnStartX, yOffset, leftColumnWidth);
    exp.details.forEach((detail) => {
      yOffset = addText(
        `- ${detail}`,
        leftColumnStartX + 5,
        yOffset,
        leftColumnWidth - 10
      );
    });
    if (exp.achievements) {
      yOffset = addText(
        "Key Achievements:",
        leftColumnStartX,
        yOffset,
        leftColumnWidth
      );
      exp.achievements.forEach((ach) => {
        yOffset = addText(
          `- ${ach}`,
          leftColumnStartX + 5,
          yOffset,
          leftColumnWidth - 10
        );
      });
    }
    yOffset += 6; // Reduced space after each experience entry
  });

  // Education Section
  doc.setFontSize(14);
  doc.text("Education", leftColumnStartX, yOffset);
  yOffset += 4; // Reduced space between title and content
  doc.setFontSize(12);

  const education = [
    {
      degree: "JB Institute of Management Studies, MBA in Sales Management",
      period: "2010-09 - 2012-06",
      grade: "CGPA: 9.4/10",
    },
    {
      degree: "IIM Ahmedabad, Bachelors in Business Administration",
      period: "2006-09 - 2010-06",
      coursework:
        "Relevant Coursework: Managerial Accounting, Operations Management, Business Account Management, Macroeconomics, Microeconomics, Financial Management.",
    },
  ];

  education.forEach((edu) => {
    yOffset = addText(edu.degree, leftColumnStartX, yOffset, leftColumnWidth);
    yOffset = addText(edu.period, leftColumnStartX, yOffset, leftColumnWidth);
    if (edu.grade) {
      yOffset = addText(edu.grade, leftColumnStartX, yOffset, leftColumnWidth);
    }
    if (edu.coursework) {
      yOffset = addText(
        edu.coursework,
        leftColumnStartX,
        yOffset,
        leftColumnWidth
      );
    }
    yOffset += 6; // Reduced space after each education entry
  });

  // Skills Section
  doc.setFontSize(14);
  doc.text("Key Skills", leftColumnStartX, yOffset);
  yOffset += 4; // Reduced space between title and content
  doc.setFontSize(12);

  const skills = [
    "Sales & Negotiation Sells",
    "CRM Software (e.g., Salesforce, HubSpot)",
    "Excellent Communication",
    "Ability to devise creative ideas to attract the target customers attention",
    "Customer Service Orientation",
  ];
  skills.forEach((skill) => {
    yOffset = addText(
      `- ${skill}`,
      leftColumnStartX + 5,
      yOffset,
      leftColumnWidth - 10
    );
  });
  yOffset += 6; // Reduced space after skills section

  // Certificates Section
  doc.setFontSize(14);
  doc.text("Certificates", leftColumnStartX, yOffset);
  yOffset += 4; // Reduced space between title and content
  doc.setFontSize(12);

  const certificates = [
    "Certified Business Relationship Manager (CBRM)",
    "NAND Benefits Account Manager Certification (RAMC)",
  ];
  certificates.forEach((cert) => {
    yOffset = addText(
      `- ${cert}`,
      leftColumnStartX + 5,
      yOffset,
      leftColumnWidth - 10
    );
  });

  // Right Column
  let rightColumnYOffset = 40; // Start after header

  // Personal Info
  doc.addImage(
    "/public/images/avatar.jpg",
    "JPEG",
    rightColumnStartX,
    rightColumnYOffset,
    imageWidth,
    imageHeight
  );
  rightColumnYOffset += imageHeight + 10; // Space after image to avoid overlap
  const personalInfo = [
    { label: "Address", value: "69, Bandra, Raipur - 322123" },
    { label: "Phone", value: "+91 04 73370896" },
    { label: "E-mail", value: "SharadLoyal@gmail.com" },
    { label: "Age", value: "33" },
    { label: "LinkedIn", value: "linkedin.com/in/ShLoyal" },
    { label: "Nationality", value: "Indian" },
  ];
  doc.setFontSize(14);
  doc.text("Personal Info", rightColumnStartX, rightColumnYOffset);
  rightColumnYOffset += 8; // Space between title and content
  doc.setFontSize(12);
  personalInfo.forEach((info) => {
    rightColumnYOffset = addText(
      `${info.label}: ${info.value}`,
      rightColumnStartX + rightColumnPadding,
      rightColumnYOffset,
      rightColumnWidth - 2 * rightColumnPadding
    );
  });
  rightColumnYOffset += 6; // Reduced space after personal info section

  // Languages Section
  doc.setFontSize(14);
  doc.text("Languages", rightColumnStartX, rightColumnYOffset);
  rightColumnYOffset += 4; // Space between title and content
  doc.setFontSize(12);

  const languages = [
    { language: "Hindi", level: "Mother tongue" },
    { language: "English", level: "C2" },
    { language: "Spanish", level: "B2" },
  ];
  languages.forEach((lang) => {
    rightColumnYOffset = addText(
      `${lang.language} - ${lang.level}`,
      rightColumnStartX + rightColumnPadding,
      rightColumnYOffset,
      rightColumnWidth - 2 * rightColumnPadding
    );
  });
};

function templateCV2() {
  return (
    <div className="App">
      <div className="header">
        <h1>Sharad Loyal</h1>
        <h2>Senior Account Manager</h2>
      </div>
      <div className="content">
        <div className="left-column">
          <div className="info">
            <p>
              Customer-oriented account manager with 8 years of experience
              overseeing 25+ medium and large clients and successfully managing
              client relationships. Certified Business Relationship Manager
              (CBRM). Skilled with Salesforce and Zahn CRM. 100% client
              satisfaction for 6 straight years.
            </p>
          </div>
          <div className="experience">
            <h3>Experience</h3>
            <div className="experience-item">
              <h4>Account Manager</h4>
              <p>Bharti Airtel Limited, Mumbai</p>
              <p>2016-10 - present</p>
              <ul>
                <li>
                  Maintained a 100% Net Promoter Score (NPS) rating during the
                  entire span of employment.
                </li>
                <li>
                  Built and maintained new and existing relationships assigned
                  by the account executive.
                </li>
                <li>
                  Negotiated contracts with clients and established a timeline
                  of performance according to policies.
                </li>
                <li>
                  In charge of cross-divisional projects with a creative team
                  ensuring all parties are well briefed and implement within
                  schedule.
                </li>
              </ul>
              <p>
                <strong>Key Achievements</strong>
              </p>
              <ul>
                <li>
                  Increased revenue by 459% or more year-over-year for 4 years
                  straight.
                </li>
                <li>
                  Managed the accounts of 25+ medium and large business clients.
                </li>
              </ul>
            </div>
            <div className="experience-item">
              <h4>Junior Account Manager</h4>
              <p>Nori PLC PLC, Mumbai</p>
              <p>2014-09 - 2016-08</p>
              <ul>
                <li>
                  Assisted key account manager and senior account managers in
                  administering large advertising accounts.
                </li>
                <li>
                  Helped maintain positive, productive, and profitable client
                  relationships.
                </li>
                <li>Managed 5 client accounts per year.</li>
              </ul>
            </div>
          </div>
          <div className="education">
            <h3>Education</h3>
            <div className="education-item">
              <p>
                <strong>
                  JB Institute of Management Studies, MBA in Sales Management
                </strong>
              </p>
              <p>2010-09 - 2012-06</p>
              <p>CGPA: 9.4/10</p>
            </div>
            <div className="education-item">
              <p>
                <strong>
                  IIM Ahmedabad, Bachelors in Business Administration
                </strong>
              </p>
              <p>2006-09 - 2010-06</p>
              <p>
                Relevant Coursework: Managerial Accounting, Operations
                Management, Business Account Management, Macroeconomics,
                Microeconomics, Financial Management.
              </p>
            </div>
          </div>
          <div className="skills">
            <h3>Key skills</h3>
            <ul>
              <li>Sales & Negotiation Sells</li>
              <li>CRM Software (e.g., Salesforce, HubSpot)</li>
              <li>Excellent Communication</li>
              <li>
                Ability to devise creative ideas to attract the target customers
                attention
              </li>
              <li>Customer Service Orientation</li>
            </ul>
          </div>
          <div className="certificates">
            <h3>Certificates</h3>
            <ul>
              <li>Certified Business Relationship Manager (CBRM)</li>
              <li>NAND Benefits Account Manager Certification (RAMC)</li>
            </ul>
          </div>
        </div>
        <div className="right-column">
          <div className="personal-info">
            <img src="/public/images/avatar.jpg" alt="Sharad Loyal" />
            <div className="info">
              <h3>Personal Info</h3>
              <p>
                <strong>Address:</strong> 69, Bandra, Raipur - 322123
              </p>
              <p>
                <strong>Phone:</strong> +91 04 73370896
              </p>
              <p>
                <strong>E-mail:</strong> SharadLoyal@gmail.com
              </p>
              <p>
                <strong>Age:</strong> 33
              </p>
              <p>
                <strong>LinkedIn:</strong> linkedin.com/in/ShLoyal
              </p>
              <p>
                <strong>Nationality:</strong> Indian
              </p>
            </div>
          </div>
          <div className="languages">
            <h3>Languages</h3>
            <ul>
              <li>
                Hindi - <span>Mother tongue</span>
              </li>
              <li>
                English - <span>C2</span>
              </li>
              <li>
                Spanish - <span>B2</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

templateCV2.generatePDF = generatePDF;

export default templateCV2;
