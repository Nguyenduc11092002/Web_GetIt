import "jspdf-autotable";
import React from "react";
import avt from "../../public/images/avatar.jpg";
import "../assets/style/template/TemplateCV1.scss";

const generatePDF = (doc) => {
  // Add background color to the left section
  doc.setFillColor(57, 64, 208); // #3940d0
  doc.rect(0, 0, 100, doc.internal.pageSize.height, "F"); // Fills the entire left section

  // Add avatar
  const img = new Image();
  img.src = avt;
  const x = 45; // Tọa độ x của hình tròn (tâm)
  const y = 50; // Tọa độ y của hình tròn (tâm)
  const radius = 30; // Bán kính của hình tròn

  doc.setFillColor("#3940d0");
  doc.circle(x, y, radius, "F");

  doc.addImage(img, "JPEG", 15, 20, 60, 60);

  // Add name and contact details
  const startX = 105; // Adjusted x position
  const startY = 20; // Adjusted y position

  doc.setFont("Times", "normal");
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text("Michelle Robinson", startX, startY + 10);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Graphic Designer", startX, startY + 20);

  doc.setFontSize(12);
  doc.text("14585 10th Ave, Whitestone, NY", startX, startY + 30);
  doc.text("+1 212-941-7824", startX, startY + 35);
  doc.text("info@urmailaddress.com", startX, startY + 40);

  // Add sections with titles and content
  const sections = [
    {
      title: "About Me",
      content: "Motivated with 8 years of area of expertise...",
      y: 90,
    },
    {
      title: "Website & Social Links",
      content:
        "Facebook: facebook.com/robinson\nBehance: behance.net/robinson\nTwitter: twitter.com/robinson",
      y: 120,
    },
    {
      title: "References",
      content:
        "Mr. Michel Robinson\nGraphic and Web Designer\n+1 212-941-7824\ninfo@urmailname.com",
      y: 160,
    },
    {
      title: "Languages",
      content: "English, UR Language",
      y: 200,
    },
    {
      title: "Additional Details",
      content: "Driving License: Full",
      y: 220,
    },
  ];

  sections.forEach((section) => {
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(section.title, 15, section.y);

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255); // White text color for the left section
    doc.text(section.content, 15, section.y + 10);
  });

  // Add Work Experience section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Work Experience", 105, 90);

  const workExperience = [
    {
      title: "Senior Graphic Designer at GlowPixel Ltd, Orlando (2015 - 2016)",
      content: "Customer-oriented Graphic Designer with a strong history...",
    },
    {
      title: "Graphic Designer at Lorem Ipsum, New York (2014 - 2015)",
      content: "Customer-oriented Graphic Designer with a strong history...",
    },
    {
      title:
        "Graphic & Web Designer at Pixelate Agency, New Jersey (2013 - 2014)",
      content: "Customer-oriented Graphic Designer with a strong history...",
    },
    {
      title: "Senior Graphic Designer at GlowPixel Ltd, Orlando (2015 - 2016)",
      content: "Customer-oriented Graphic Designer with a strong history...",
    },
    {
      title: "Graphic Designer at Lorem Ipsum, New York (2014 - 2015)",
      content: "Customer-oriented Graphic Designer with a strong history...",
    },
    {
      title:
        "Graphic & Web Designer at Pixelate Agency, New Jersey (2013 - 2014)",
      content: "Customer-oriented Graphic Designer with a strong history...",
    },
  ];

  let yPosition = 100;
  workExperience.forEach((job) => {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(job.title, 105, yPosition);
    doc.text(job.content, 105, yPosition + 10);
    yPosition += 20;
  });

  // Add Education section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Education", 105, yPosition);

  const education = [
    {
      title: "Master in Web Develop at University of UK, Toronto (2010 - 2012)",
      content: "Customer-oriented Graphic Designer with a strong history...",
    },
    {
      title:
        "Bachelor in Graphic Design at College of Art, New Ark (2006 - 2010)",
      content: "Customer-oriented Graphic Designer with a strong history...",
    },
    {
      title: "Master in Web Develop at University of UK, Toronto (2010 - 2012)",
      content: "Customer-oriented Graphic Designer with a strong history...",
    },
    {
      title:
        "Bachelor in Graphic Design at College of Art, New Ark (2006 - 2010)",
      content: "Customer-oriented Graphic Designer with a strong history...",
    },
  ];

  yPosition += 10;
  education.forEach((edu) => {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(edu.title, 105, yPosition);
    doc.text(edu.content, 105, yPosition + 10);
    yPosition += 20;
  });

  // Add Skills section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Skills", 105, yPosition);

  const skills = [
    { name: "Adobe Photoshop", level: 80 },
    { name: "Adobe Illustrator", level: 75 },
    { name: "Adobe InDesign", level: 70 },
    { name: "HTML/CSS", level: 85 },
    { name: "WordPress", level: 60 },
  ];

  yPosition += 10;
  skills.forEach((skill) => {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(skill.name, 105, yPosition);

    // Draw skill bar
    doc.setFillColor(200, 200, 200);
    doc.rect(145, yPosition - 5, 50, 4, "F");
    doc.setFillColor(0, 0, 255);
    doc.rect(145, yPosition - 5, (50 * skill.level) / 100, 4, "F");

    yPosition += 10;
  });

  // Add Hobbies section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Hobbies", 105, yPosition);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Art, Traveling, Photography, Sports, Movie", 105, yPosition + 10);

  // Add Publications section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Publications", 105, yPosition + 30);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "Complex cognition: The psychology of human thought, Oxford University Press, New York, NY, 2001",
    105,
    yPosition + 40
  );
};

function templateCV1() {
  return (
    <div className="container" id="cv-page">
      <div className="left">
        {/* Avatar */}
        <div className="image-container">
          <img
            className="image"
            src="/public/images/avatar.jpg"
            alt="Profile"
          />
        </div>
        {/* Info */}
        <div className="section bottom-left">
          <h2 className="section-title">About Me</h2>
          <p className="text">Motivated with 8 years of area of expertise...</p>
        </div>
        {/* Website & link */}
        <div className="section bottom-left">
          <h2 className="section-title">Website & Social Links</h2>
          <p className="text">Facebook: facebook.com/robinson</p>
          <p className="text">Behance: behance.net/robinson</p>
          <p className="text">Twitter: twitter.com/robinson</p>
        </div>
        {/* Reference */}
        <div className="section bottom-left">
          <h2 className="section-title">References</h2>
          <ul className="list">
            <li className="list-item">
              <p className="text">Mr. Michel Robinson</p>
              <p className="text">Graphic and Web Designer</p>
              <p className="text">+1 212-941-7824</p>
              <p className="text">info@urmailname.com</p>
            </li>
          </ul>
        </div>
        {/* Language */}
        <div className="section bottom-left">
          <h2 className="section-title">Languages</h2>
          <p className="text">English, UR Language</p>
        </div>
        {/* Addition details */}
        <div className="section bottom-left">
          <h2 className="section-title">Additional Details</h2>
          <p className="text">Driving License: Full</p>
        </div>
      </div>

      <div className="right">
        {/* Name and contact method */}
        <div className="header bottom-right">
          <div>
            <h1 className="name">Michelle Robinson</h1>
            <p className="title">Graphic Designer</p>
          </div>
          <div className="contact">
            <p className="text">14585 10th Ave, Whitestone, NY</p>
            <p className="text">+1 212-941-7824</p>
            <p className="text">info@urmailaddress.com</p>
          </div>
        </div>
        {/* Work experience */}
        <div className="section bottom-right">
          <h2 className="section-title">Work Experience</h2>
          <ul className="list">
            <li className="list-item">
              <p className="text">
                Senior Graphic Designer at GlowPixel Ltd, Orlando (2015 - 2016)
              </p>
              <p className="text">
                Customer-oriented Graphic Designer with a strong history...
              </p>
            </li>
            <li className="list-item">
              <p className="text">
                Graphic Designer at Lorem Ipsum, New York (2014 - 2015)
              </p>
              <p className="text">
                Customer-oriented Graphic Designer with a strong history...
              </p>
            </li>
            <li className="list-item">
              <p className="text">
                Graphic & Web Designer at Pixelate Agency, New Jersey (2013 -
                2014)
              </p>
              <p className="text">
                Customer-oriented Graphic Designer with a strong history...
              </p>
            </li>
          </ul>
        </div>
        {/* Education */}
        <div className="section bottom-right">
          <h2 className="section-title">Education</h2>
          <ul className="list">
            <li className="list-item">
              <p className="text">
                Master in Web Develop at University of UK, Toronto (2010 - 2012)
              </p>
              <p className="text">
                Customer-oriented Graphic Designer with a strong history...
              </p>
            </li>
            <li className="list-item">
              <p className="text">
                Bachelor in Graphic Design at College of Art, New Ark (2006 -
                2010)
              </p>
              <p className="text">
                Customer-oriented Graphic Designer with a strong history...
              </p>
            </li>
          </ul>
        </div>
        {/* Skill */}
        <div className="section bottom-right">
          <h2 className="section-title">Skills</h2>
          <div className="skills">
            <div className="skill">
              <p className="text">Adobe Photoshop</p>
              <div className="skill-bar">
                <div className="skill-level" style={{ width: "80%" }} />
              </div>
            </div>
            <div className="skill">
              <p className="text">Adobe Illustrator</p>
              <div className="skill-bar">
                <div className="skill-level" style={{ width: "75%" }} />
              </div>
            </div>
            <div className="skill">
              <p className="text">Adobe InDesign</p>
              <div className="skill-bar">
                <div className="skill-level" style={{ width: "70%" }} />
              </div>
            </div>
            <div className="skill">
              <p className="text">HTML/CSS</p>
              <div className="skill-bar">
                <div className="skill-level" style={{ width: "85%" }} />
              </div>
            </div>
            <div className="skill">
              <p className="text">WordPress</p>
              <div className="skill-bar">
                <div className="skill-level" style={{ width: "60%" }} />
              </div>
            </div>
          </div>
        </div>
        {/* Hobbies */}
        <div className="section bottom-right">
          <h2 className="section-title">Hobbies</h2>
          <p className="text">Art, Traveling, Photography, Sports, Movie</p>
        </div>
        {/* Publication */}
        <div className="section bottom-right">
          <h2 className="section-title">Publications</h2>
          <p className="text">
            Complex cognition: The psychology of human thought, Oxford
            University Press, New York, NY, 2001
          </p>
        </div>
      </div>
    </div>
  );
}

templateCV1.generatePDF = generatePDF;

export default templateCV1;
