import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import User from "../models/User";
import fs from "fs";
import path from "path";

export const generateResume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const user = await User.findById(
      req.userId
    ).select("-password");

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const fileName =
      `${(user.name || "Professional_Profile")
        .replace(/[^a-zA-Z0-9-_]/g, "_")}_Professional_Resume.pdf`;

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    doc.pipe(res);

    // ==========================================
    // HEADER
    // ==========================================

    let headerTextX = 50;
    let headerTextWidth = 495;

    // Profile image
    if (user.profileImage) {
      try {
        const imagePath = getProfileImagePath(
          user.profileImage
        );

        if (imagePath && fs.existsSync(imagePath)) {
          doc.image(imagePath, 455, 50, {
            fit: [90, 90],
            align: "center",
            valign: "center",
          });

          // Keep text away from the photo
          headerTextWidth = 390;
        }
      } catch (imageError) {
        console.error(
          "PROFILE IMAGE ERROR:",
          imageError
        );
      }
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#111827")
      .text(
        user.name || "Professional Profile",
        headerTextX,
        50,
        {
          width: headerTextWidth,
        }
      );

    doc.moveDown(0.3);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#374151")
      .text(
        `${user.role || "Recruiter"}${
          user.company
            ? ` | ${user.company}`
            : ""
        }`,
        {
          width: headerTextWidth,
        }
      );

    doc.moveDown(0.4);

    const contactDetails = [
      user.email,
      user.contactNumber,
      user.whatsappNumber
        ? `WhatsApp: ${user.whatsappNumber}`
        : "",
    ]
      .filter(Boolean)
      .join(" | ");

    if (contactDetails) {
      doc
        .fontSize(9)
        .fillColor("#4b5563")
        .text(contactDetails, {
          width: headerTextWidth,
        });
    }

    // Make sure the next section starts below the header
    doc.y = Math.max(doc.y, 145);

    doc.moveDown();

    // ==========================================
    // PROFESSIONAL SUMMARY
    // ==========================================

    if (
      user.professionalSummary &&
      user.professionalSummary.trim()
    ) {
      addHeading(
        doc,
        "PROFESSIONAL SUMMARY"
      );

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#111827")
        .text(
          user.professionalSummary.trim(),
          {
            lineGap: 3,
          }
        );

      doc.moveDown();
    }

    // ==========================================
    // EXPERIENCE
    // ==========================================

    if (
      user.experience &&
      user.experience.trim()
    ) {
      addHeading(
        doc,
        "EXPERIENCE"
      );

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#111827")
        .text(
          user.experience.trim(),
          {
            lineGap: 3,
          }
        );

      doc.moveDown();
    }

    // ==========================================
    // EDUCATION
    // ==========================================

    if (
      user.education &&
      user.education.length > 0
    ) {
      addHeading(
        doc,
        "EDUCATION"
      );

      user.education.forEach(
        (education) => {
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#111827")
            .text(
              education.degree ||
                "Degree"
            );

          doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor("#374151")
            .text(
              education.college ||
                "College / University"
            );

          if (
            education.fieldOfStudy
          ) {
            doc.text(
              education.fieldOfStudy
            );
          }

          if (
            education.startYear ||
            education.graduationYear
          ) {
            doc
              .fontSize(9)
              .fillColor("#6b7280")
              .text(
                `${
                  education.startYear ||
                  "—"
                } - ${
                  education.graduationYear ||
                  "Present"
                }`
              );
          }

          doc.moveDown(0.7);
        }
      );
    }

    // ==========================================
    // SKILLS
    // ==========================================

    if (
      user.skills &&
      user.skills.length > 0
    ) {
      addHeading(
        doc,
        "SKILLS"
      );

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#111827")
        .text(
          user.skills.join(" • ")
        );

      doc.moveDown();
    }

    // ==========================================
    // CERTIFICATIONS
    // ==========================================

    if (
      user.certificates &&
      user.certificates.length > 0
    ) {
      addHeading(
        doc,
        "CERTIFICATIONS"
      );

      user.certificates.forEach(
        (certificate) => {
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#111827")
            .text(
              certificate.name ||
                "Certificate"
            );

          if (
            certificate.organization
          ) {
            doc
              .font("Helvetica")
              .fontSize(10)
              .fillColor("#374151")
              .text(
                certificate.organization
              );
          }

          if (
            certificate.yearEarned
          ) {
            doc
              .fontSize(9)
              .fillColor("#6b7280")
              .text(
                `Year: ${certificate.yearEarned}`
              );
          }

          doc.moveDown(0.7);
        }
      );
    }

    // ==========================================
    // HOBBIES
    // ==========================================

    if (
      user.hobbies &&
      user.hobbies.length > 0
    ) {
      addHeading(
        doc,
        "HOBBIES"
      );

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#111827")
        .text(
          user.hobbies.join(" • ")
        );

      doc.moveDown();
    }

    // ==========================================
    // SOCIAL MEDIA
    // ==========================================

    const socialLinks = [
      user.socialMedia?.linkedin
        ? `LinkedIn: ${user.socialMedia.linkedin}`
        : "",
      user.socialMedia?.instagram
        ? `Instagram: ${user.socialMedia.instagram}`
        : "",
      user.socialMedia?.facebook
        ? `Facebook: ${user.socialMedia.facebook}`
        : "",
    ].filter(Boolean);

    if (socialLinks.length > 0) {
      addHeading(
        doc,
        "SOCIAL MEDIA"
      );

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#111827");

      socialLinks.forEach(
        (link) => {
          doc.text(link);
        }
      );
    }

    // ==========================================
    // FOOTER
    // ==========================================

    doc.moveDown(2);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#9ca3af")
      .text(
        "Generated by SmartHire ATS",
        {
          align: "center",
        }
      );

    doc.end();
  } catch (error) {
    console.error(
      "GENERATE RESUME ERROR:",
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        message:
          "Server error while generating resume",
      });
    }
  }
};

// ==========================================
// PROFILE IMAGE PATH HELPER
// ==========================================

function getProfileImagePath(
  profileImage: string
): string | null {
  if (!profileImage) {
    return null;
  }

  // Remove leading slash
  let cleanPath = profileImage.replace(
    /^\/+/,
    ""
  );

  // If the database stores /uploads/...
  if (cleanPath.startsWith("uploads/")) {
    return path.join(
      process.cwd(),
      cleanPath
    );
  }

  // If a full URL was stored, extract /uploads/...
  try {
    if (
      cleanPath.startsWith("http://") ||
      cleanPath.startsWith("https://")
    ) {
      const url = new URL(cleanPath);

      const uploadsIndex =
        url.pathname.indexOf("/uploads/");

      if (uploadsIndex !== -1) {
        const uploadsPath =
          url.pathname.substring(
            uploadsIndex + 1
          );

        return path.join(
          process.cwd(),
          uploadsPath
        );
      }
    }
  } catch (error) {
    console.error(
      "PROFILE IMAGE URL ERROR:",
      error
    );
  }

  return null;
}

// ==========================================
// SECTION HEADING
// ==========================================

function addHeading(
  doc: InstanceType<typeof PDFDocument>,
  text: string
) {
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#111827")
    .text(text);

  doc
    .moveTo(50, doc.y + 3)
    .lineTo(545, doc.y + 3)
    .stroke();

  doc.moveDown(0.7);
}