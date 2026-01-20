const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a certificate PDF with the template background
 * @param {Object} data - Certificate data
 * @param {string} data.name - Recipient name
 * @param {string} data.role - 'Author' | 'Participant' | 'Reviewer'
 * @param {string} data.conferenceName - Conference name
 * @param {string} data.conferenceDate - Conference date string
 * @param {string} data.uniqueId - Unique certificate ID
 * @param {string} [data.paperTitle] - Paper title (for authors)
 * @param {string} [data.organizerName] - Organizer/Session chair name
 * @param {string} [data.chairTitle] - Label for the chair/organizer (e.g., "General Chair")
 * @param {string} [data.signaturePath] - Optional file path for signature image
 * @returns {Promise<Buffer>} - PDF as buffer
 */
async function generateCertificate(data) {
    return new Promise((resolve, reject) => {
        try {
            // Create landscape A4 PDF
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 0
            });

            const buffers = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Template path
            const templatePath = path.join(__dirname, '../certificates/certificate_template.png');

            // Check if template exists
            if (fs.existsSync(templatePath)) {
                // Add template as background (A4 landscape: 842 x 595 points)
                doc.image(templatePath, 0, 0, {
                    width: 842,
                    height: 595
                });
            } else {
                // Fallback: Create a simple background
                doc.rect(0, 0, 842, 595).fill('#FAFAFA');
                doc.rect(20, 20, 802, 555).lineWidth(3).stroke('#D4AF37');
                doc.rect(30, 30, 782, 535).lineWidth(1).stroke('#D4AF37');
            }

            const centerX = 421; // Center of A4 landscape

            // "CERTIFICATE" title is already in the template, so we skip it
            // Start content below the template header

            // "This is to certify that"
            doc.fontSize(18)
                .font('Helvetica')
                .fillColor('#333333')
                .text('This is to certify that', 0, 160, {
                    align: 'center',
                    width: 842
                });

            // Recipient Name
            doc.fontSize(36)
                .font('Helvetica-Bold')
                .fillColor('#1a1a1a')
                .text(data.name, 0, 195, {
                    align: 'center',
                    width: 842
                });

            // Role description
            let roleText = '';
            switch (data.role.toLowerCase()) {
                case 'author':
                    roleText = 'has presented a paper as Author at';
                    break;
                case 'reviewer':
                    roleText = 'has served as Reviewer at';
                    break;
                case 'participant':
                default:
                    roleText = 'has participated in';
                    break;
            }

            // Slightly increase spacing before role line
            doc.fontSize(18)
                .font('Helvetica')
                .fillColor('#333333')
                .text(roleText, 0, 265, {
                    align: 'center',
                    width: 842
                });

            // Conference Name
            doc.fontSize(28)
                .font('Helvetica-Bold')
                .fillColor('#1a1a1a')
                .text(data.conferenceName, 50, 310, {
                    align: 'center',
                    width: 742
                });

            // Calculate Y position based on whether there's a paper title
            let currentY = 370;

            // Paper title (for authors only)
            if (data.paperTitle && data.role.toLowerCase() === 'author') {
                doc.fontSize(14)
                    .font('Helvetica-Oblique')
                    .fillColor('#444444')
                    .text('for the paper titled:', 0, currentY, {
                        align: 'center',
                        width: 842
                    });

                currentY += 22;

                doc.fontSize(16)
                    .font('Helvetica-Bold')
                    .fillColor('#333333')
                    .text(`"${data.paperTitle}"`, 80, currentY, {
                        align: 'center',
                        width: 682
                    });

                currentY += 50;
            }

            // Extra spacing before date line
            currentY += 20;

            // Conference Date
            doc.fontSize(16)
                .font('Helvetica')
                .fillColor('#333333')
                .text(`Date: ${data.conferenceDate}`, 0, currentY, {
                    align: 'center',
                    width: 842
                });

            currentY += 30;

            // Certificate ID
            doc.fontSize(11)
                .font('Helvetica')
                .fillColor('#666666')
                .text(`Certificate ID: ${data.uniqueId}`, 0, currentY, {
                    align: 'center',
                    width: 842
                });

            // Organizer/General Chair signature area (bottom right)
            if (data.organizerName) {
                const sigX = 550;
                const sigY = 480;

                // Optional signature image just above the line
                if (data.signaturePath && fs.existsSync(data.signaturePath)) {
                    try {
                        doc.image(data.signaturePath, sigX + 40, sigY - 60, {
                            width: 120,
                            height: 40,
                            fit: [140, 50]
                        });
                    } catch (e) {
                        // If signature image fails, continue with text-only signature
                        console.error('Error rendering signature image:', e.message);
                    }
                }

                // Signature line
                doc.moveTo(sigX, sigY)
                    .lineTo(sigX + 200, sigY)
                    .lineWidth(1)
                    .stroke('#333333');

                // Organizer / Chair name
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#333333')
                    .text(data.organizerName, sigX, sigY + 8, {
                        align: 'center',
                        width: 200
                    });

                // Title
                const chairLabel = data.chairTitle || 'Conference Organizer';
                doc.fontSize(11)
                    .font('Helvetica')
                    .fillColor('#666666')
                    .text(chairLabel, sigX, sigY + 26, {
                        align: 'center',
                        width: 200
                    });
            }

            // Add issue date (bottom left)
            const issueDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            doc.fontSize(10)
                .font('Helvetica')
                .fillColor('#666666')
                .text(`Issued on: ${issueDate}`, 80, 520, {
                    align: 'left',
                    width: 200
                });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Format conference dates for display
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {string}
 */
function formatConferenceDates(startDate, endDate) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const start = new Date(startDate).toLocaleDateString('en-US', options);
    const end = new Date(endDate).toLocaleDateString('en-US', options);

    if (start === end) {
        return start;
    }
    return `${start} - ${end}`;
}

module.exports = {
    generateCertificate,
    formatConferenceDates
};
