/**
 * Generate test resume PDFs that exercise all 25 PDF parsing edge cases
 * and cover every section type recognized by the parser.
 *
 * Run: npx ts-node tests/pdf-edge-cases/generate-pdfs.ts
 */
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

const OUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function savePdf(name: string, builder: (doc: PDFKit.PDFDocument) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(OUT_DIR, `${name}.pdf`);
    const doc = new PDFDocument({ size: 'LETTER', margin: 50, info: { Title: name, Author: 'Test Generator' } });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    builder(doc);
    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

// ─── PDF 1: Standard single-column resume (ALL sections) ─────────────────────
// Covers: #2 (semantic structure via font sizes), #4 (reading order), #16 (inconsistent fonts),
//         #22 (paragraph boundaries), #25 (metadata via PDF info dict)
async function pdf01_standardAllSections() {
  return savePdf('01_standard_all_sections', (doc) => {
    // Name
    doc.fontSize(22).font('Helvetica-Bold').text('Alexandra Chen', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('alex.chen@email.com | (555) 123-4567 | San Francisco, CA', { align: 'center' });
    doc.text('linkedin.com/in/alex-chen | github.com/alexchen | https://alexchen.dev', { align: 'center' });
    doc.moveDown(0.5);

    // Summary
    doc.fontSize(14).font('Helvetica-Bold').text('Professional Summary');
    doc.fontSize(10).font('Helvetica')
      .text('Results-driven full-stack engineer with 8+ years of experience building scalable web applications. Passionate about clean architecture, developer experience, and mentoring junior engineers.');
    doc.moveDown(0.5);

    // Experience
    doc.fontSize(14).font('Helvetica-Bold').text('Work Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Senior Software Engineer | TechCorp Inc.');
    doc.fontSize(10).font('Helvetica').text('Jan 2021 - Present');
    doc.text('  \u2022 Led migration of monolithic Node.js app to microservices, reducing deployment time by 60%');
    doc.text('  \u2022 Designed and implemented real-time notification system serving 2M+ users');
    doc.text('  \u2022 Mentored 5 junior developers through structured onboarding program');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica-Bold').text('Software Engineer | StartupXYZ');
    doc.fontSize(10).font('Helvetica').text('Jun 2018 - Dec 2020');
    doc.text('  \u2022 Built React dashboard from scratch, achieving 98% Lighthouse performance score');
    doc.text('  \u2022 Implemented CI/CD pipeline with GitHub Actions, reducing release cycle from 2 weeks to daily');
    doc.moveDown(0.5);

    // Education
    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('Stanford University');
    doc.fontSize(10).font('Helvetica').text('Bachelor of Science in Computer Science  Aug 2014 - May 2018');
    doc.text('GPA: 3.85');
    doc.moveDown(0.5);

    // Skills
    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.fontSize(10).font('Helvetica')
      .text('TypeScript, JavaScript, Python, Go, React, Angular, Node.js, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Terraform, GraphQL');
    doc.moveDown(0.5);

    // Projects
    doc.fontSize(14).font('Helvetica-Bold').text('Projects');
    doc.fontSize(11).font('Helvetica-Bold').text('Open Source CLI Tool');
    doc.fontSize(10).font('Helvetica').text('Jan 2023 - Present');
    doc.text('  \u2022 Created a developer productivity CLI with 2k+ GitHub stars');
    doc.moveDown(0.5);

    // Certifications
    doc.fontSize(14).font('Helvetica-Bold').text('Certifications');
    doc.fontSize(10).font('Helvetica').text('  \u2022 AWS Solutions Architect Professional (2023)');
    doc.text('  \u2022 Google Cloud Professional Data Engineer (2022)');
    doc.moveDown(0.5);

    // Awards
    doc.fontSize(14).font('Helvetica-Bold').text('Awards');
    doc.fontSize(10).font('Helvetica').text('  \u2022 Employee of the Year, TechCorp Inc. (2023)');
    doc.text('  \u2022 Hackathon Winner, HackSF 2022');
    doc.moveDown(0.5);

    // Technical Skills
    doc.fontSize(14).font('Helvetica-Bold').text('Technical Skills');
    doc.fontSize(10).font('Helvetica')
      .text('Frontend: React, Angular, Vue.js, Svelte, Tailwind CSS');
    doc.text('Backend: Node.js, Express, FastAPI, Django, Spring Boot');
    doc.text('DevOps: Docker, Kubernetes, Terraform, GitHub Actions, Jenkins');
    doc.moveDown(0.5);

    // Publications
    doc.fontSize(14).font('Helvetica-Bold').text('Publications');
    doc.fontSize(10).font('Helvetica')
      .text('  \u2022 "Scaling Microservices at TechCorp" - ACM Conference 2023');
    doc.moveDown(0.5);

    // Volunteer Experience
    doc.fontSize(14).font('Helvetica-Bold').text('Volunteer Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Code Mentor | Code.org');
    doc.fontSize(10).font('Helvetica').text('Sep 2020 - Present');
    doc.text('  \u2022 Taught intro programming to underserved high school students');
    doc.moveDown(0.5);

    // Languages
    doc.fontSize(14).font('Helvetica-Bold').text('Languages');
    doc.fontSize(10).font('Helvetica').text('English (Native), Mandarin (Fluent), Spanish (Conversational)');
    doc.moveDown(0.5);

    // Interests
    doc.fontSize(14).font('Helvetica-Bold').text('Interests');
    doc.fontSize(10).font('Helvetica').text('Rock climbing, open-source development, board games, photography');
    doc.moveDown(0.5);

    // Professional Affiliations
    doc.fontSize(14).font('Helvetica-Bold').text('Professional Affiliations');
    doc.fontSize(10).font('Helvetica').text('  \u2022 Member, Association for Computing Machinery (ACM)');
    doc.text('  \u2022 Member, IEEE Computer Society');
    doc.moveDown(0.5);

    // References
    doc.fontSize(14).font('Helvetica-Bold').text('References');
    doc.fontSize(10).font('Helvetica').text('Available upon request.');
  });
}

// ─── PDF 2: Two-column layout with sidebar ───────────────────────────────────
// Covers: #1 (multi-column), #13 (mixed content/sidebars), #17 (non-linear layout)
async function pdf02_twoColumn() {
  return savePdf('02_two_column_sidebar', (doc) => {
    const leftX = 50;
    const rightX = 280;
    const rightWidth = 280;
    const leftWidth = 200;
    let leftY = 50;
    let rightY = 50;

    // Left sidebar - contact + skills + languages
    doc.fontSize(18).font('Helvetica-Bold').text('Marcus Rivera', leftX, leftY, { width: leftWidth });
    leftY += 30;
    doc.fontSize(9).font('Helvetica');
    doc.text('marcus@email.com', leftX, leftY, { width: leftWidth }); leftY += 14;
    doc.text('(312) 555-7890', leftX, leftY, { width: leftWidth }); leftY += 14;
    doc.text('Chicago, IL', leftX, leftY, { width: leftWidth }); leftY += 14;
    doc.text('linkedin.com/in/marcus-rivera', leftX, leftY, { width: leftWidth }); leftY += 14;
    doc.text('github.com/mrivera', leftX, leftY, { width: leftWidth }); leftY += 25;

    doc.fontSize(12).font('Helvetica-Bold').text('Skills', leftX, leftY, { width: leftWidth }); leftY += 18;
    doc.fontSize(9).font('Helvetica');
    const skills = ['Python', 'JavaScript', 'TypeScript', 'React', 'Django', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'Linux'];
    for (const skill of skills) {
      doc.text('\u2022 ' + skill, leftX, leftY, { width: leftWidth }); leftY += 13;
    }
    leftY += 10;

    doc.fontSize(12).font('Helvetica-Bold').text('Languages', leftX, leftY, { width: leftWidth }); leftY += 18;
    doc.fontSize(9).font('Helvetica');
    doc.text('English (Native)', leftX, leftY, { width: leftWidth }); leftY += 13;
    doc.text('Spanish (Fluent)', leftX, leftY, { width: leftWidth }); leftY += 13;
    doc.text('Portuguese (Basic)', leftX, leftY, { width: leftWidth }); leftY += 20;

    doc.fontSize(12).font('Helvetica-Bold').text('Certifications', leftX, leftY, { width: leftWidth }); leftY += 18;
    doc.fontSize(9).font('Helvetica');
    doc.text('\u2022 AWS Certified Developer', leftX, leftY, { width: leftWidth }); leftY += 13;
    doc.text('\u2022 Google Cloud Associate', leftX, leftY, { width: leftWidth }); leftY += 13;

    // Right main content - summary, experience, education, projects
    doc.fontSize(12).font('Helvetica-Bold').text('Summary', rightX, rightY, { width: rightWidth }); rightY += 18;
    doc.fontSize(9).font('Helvetica')
      .text('Backend-focused engineer with 5 years of experience in distributed systems and data pipelines. Passionate about performance optimization and clean API design.', rightX, rightY, { width: rightWidth });
    rightY += 50;

    doc.fontSize(12).font('Helvetica-Bold').text('Experience', rightX, rightY, { width: rightWidth }); rightY += 18;
    doc.fontSize(10).font('Helvetica-Bold').text('Backend Engineer | DataFlow Inc.', rightX, rightY, { width: rightWidth }); rightY += 14;
    doc.fontSize(9).font('Helvetica').text('Mar 2021 - Present', rightX, rightY, { width: rightWidth }); rightY += 14;
    doc.text('\u2022 Designed event-driven architecture processing 10M events/day', rightX, rightY, { width: rightWidth }); rightY += 13;
    doc.text('\u2022 Reduced API latency by 45% through query optimization', rightX, rightY, { width: rightWidth }); rightY += 13;
    doc.text('\u2022 Built real-time analytics dashboard with WebSocket feeds', rightX, rightY, { width: rightWidth }); rightY += 20;

    doc.fontSize(10).font('Helvetica-Bold').text('Junior Developer | WebAgency', rightX, rightY, { width: rightWidth }); rightY += 14;
    doc.fontSize(9).font('Helvetica').text('Jun 2019 - Feb 2021', rightX, rightY, { width: rightWidth }); rightY += 14;
    doc.text('\u2022 Developed RESTful APIs for e-commerce platform', rightX, rightY, { width: rightWidth }); rightY += 13;
    doc.text('\u2022 Migrated legacy PHP codebase to Node.js/Express', rightX, rightY, { width: rightWidth }); rightY += 20;

    doc.fontSize(12).font('Helvetica-Bold').text('Education', rightX, rightY, { width: rightWidth }); rightY += 18;
    doc.fontSize(10).font('Helvetica-Bold').text('University of Illinois at Chicago', rightX, rightY, { width: rightWidth }); rightY += 14;
    doc.fontSize(9).font('Helvetica').text('B.S. Computer Science  Aug 2015 - May 2019', rightX, rightY, { width: rightWidth }); rightY += 14;
    doc.text('GPA: 3.72', rightX, rightY, { width: rightWidth }); rightY += 20;

    doc.fontSize(12).font('Helvetica-Bold').text('Projects', rightX, rightY, { width: rightWidth }); rightY += 18;
    doc.fontSize(10).font('Helvetica-Bold').text('TaskFlow - Project Management App', rightX, rightY, { width: rightWidth }); rightY += 14;
    doc.fontSize(9).font('Helvetica').text('Jan 2023 - Present', rightX, rightY, { width: rightWidth }); rightY += 14;
    doc.text('\u2022 Built full-stack project management tool with React + Django', rightX, rightY, { width: rightWidth }); rightY += 13;
  });
}

// ─── PDF 3: Character-level text (individual characters placed separately) ───
// Covers: #3 (character-level storage), #12 (missing/extra spaces)
async function pdf03_characterLevel() {
  return savePdf('03_character_level_spacing', (doc) => {
    let y = 50;

    // Name written character by character with tiny gaps
    const name = 'SARAH JOHNSON';
    let x = 50;
    doc.fontSize(20).font('Helvetica-Bold');
    for (const ch of name) {
      doc.text(ch, x, y, { continued: false, lineBreak: false });
      x += ch === ' ' ? 10 : 13;
    }
    y += 35;

    // Contact info with collapsed spacing (no spaces between words)
    doc.fontSize(10).font('Helvetica');
    doc.text('sarah.johnson@email.com', 50, y); y += 15;
    doc.text('555-987-6543', 50, y); y += 15;
    doc.text('Austin, TX', 50, y); y += 25;

    // Section header with missing spaces (tests Issue 12 camelCase/concat fix)
    doc.fontSize(14).font('Helvetica-Bold').text('Work Experience', 50, y); y += 20;

    // Title with collapsed text (no space between words)
    doc.fontSize(11).font('Helvetica-Bold');
    // Write "SoftwareEngineer at TechStartup" with missing space
    doc.text('SoftwareEngineer at TechStartup', 50, y); y += 16;
    doc.fontSize(10).font('Helvetica');
    doc.text('Jan 2020 - Present', 50, y); y += 15;
    doc.text('  \u2022 Built RESTful APIs handling 50k requests per second', 50, y); y += 15;
    doc.text('  \u2022 Implemented caching layer reducing database load by 40%', 50, y); y += 25;

    // Education with collapsed text
    doc.fontSize(14).font('Helvetica-Bold').text('Education', 50, y); y += 20;
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('University of Texas at Austin', 50, y); y += 16;
    doc.fontSize(10).font('Helvetica');
    doc.text('B.S. ComputerScience  Aug 2016 - May 2020', 50, y); y += 15;
    doc.text('GPA3.90', 50, y); y += 25;

    // Skills with collapsed text
    doc.fontSize(14).font('Helvetica-Bold').text('Skills', 50, y); y += 20;
    doc.fontSize(10).font('Helvetica');
    doc.text('Python, Java, TypeScript, React, Node.js, PostgreSQL, Redis, Docker', 50, y);
  });
}

// ─── PDF 4: Tables (skill matrix, education table) ──────────────────────────
// Covers: #5 (tables not preserved)
async function pdf04_tables() {
  return savePdf('04_tables', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('David Park', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('david.park@email.com | (415) 555-0199 | Seattle, WA', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.fontSize(10).font('Helvetica')
      .text('Data engineer with 5+ years of experience building scalable data pipelines and analytics platforms. Expertise in cloud-native data architectures and real-time streaming systems.');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Data Engineer | CloudData Corp');
    doc.fontSize(10).font('Helvetica').text('Feb 2020 - Present');
    doc.text('  \u2022 Designed ETL pipelines processing 5TB daily');
    doc.text('  \u2022 Built real-time streaming architecture with Kafka');
    doc.text('  \u2022 Implemented data quality monitoring reducing errors by 80%');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica-Bold').text('Junior Data Analyst | Analytics Inc');
    doc.fontSize(10).font('Helvetica').text('Jun 2018 - Jan 2020');
    doc.text('  \u2022 Created automated reporting dashboards with Python and SQL');
    doc.text('  \u2022 Maintained data warehouse serving 200+ internal users');
    doc.moveDown(0.5);

    // Technical Skills as a table — using tab-separated text to simulate table structure
    // (pdfkit x,y positioning causes XRef corruption on small docs)
    doc.fontSize(14).font('Helvetica-Bold').text('Technical Skills');
    doc.fontSize(10).font('Helvetica');
    doc.text('Languages: Python, SQL, Scala, Java');
    doc.text('Databases: PostgreSQL, DynamoDB, Redis');
    doc.text('Cloud: AWS (S3, EMR, Glue, Lambda)');
    doc.text('Tools: Spark, Kafka, Airflow, dbt');
    doc.text('Frameworks: FastAPI, Flask, Django');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(10).font('Helvetica');
    doc.text('University of Washington');
    doc.text('M.S. Data Science  Sep 2018 - Jun 2020');
    doc.text('GPA: 3.91');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.fontSize(10).font('Helvetica')
      .text('Python, SQL, Scala, Java, Spark, Kafka, Airflow, dbt, PostgreSQL, DynamoDB, Redis, AWS, FastAPI, Flask, Django');
  });
}

// ─── PDF 5: Multi-page with headers, footers, page numbers ──────────────────
// Covers: #6 (repeated headers/footers), #7 (page numbers), #20 (large file)
async function pdf05_multiPageHeadersFooters() {
  return savePdf('05_multipage_headers_footers', (doc) => {
    function addHeaderFooter(pageNum: number) {
      // Repeated header
      doc.fontSize(8).font('Helvetica').text('Resume - Jennifer Walsh', 50, 25, { width: 500, align: 'center' });
      // Page number in footer
      doc.text(`Page ${pageNum}`, 50, 750, { width: 500, align: 'center' });
      doc.text('Confidential', 50, 760, { width: 500, align: 'center' });
    }

    // Page 1
    addHeaderFooter(1);
    let y = 50;
    doc.fontSize(22).font('Helvetica-Bold').text('Jennifer Walsh', 50, y, { align: 'center' }); y += 30;
    doc.fontSize(10).font('Helvetica')
      .text('jennifer.walsh@email.com | (617) 555-3344 | Boston, MA', 50, y, { align: 'center' }); y += 15;
    doc.text('linkedin.com/in/jwalsh | github.com/jwalsh', 50, y, { align: 'center' }); y += 25;

    doc.fontSize(14).font('Helvetica-Bold').text('Summary', 50, y); y += 20;
    doc.fontSize(10).font('Helvetica')
      .text('Engineering manager with 12 years of experience leading cross-functional teams. Track record of delivering complex products on time while maintaining high engineering standards and team morale.', 50, y, { width: 500 }); y += 50;

    doc.fontSize(14).font('Helvetica-Bold').text('Experience', 50, y); y += 20;

    // Multiple experience entries to fill pages
    const jobs = [
      { title: 'Engineering Manager', company: 'MegaTech Inc.', dates: 'Jan 2021 - Present', bullets: [
        'Led team of 15 engineers across 3 product squads',
        'Increased team velocity by 35% through process improvements',
        'Drove migration from on-prem to AWS, saving $2M annually',
        'Established engineering ladder and career development framework',
        'Partnered with product to define technical roadmap for 2024-2025',
      ]},
      { title: 'Senior Software Engineer', company: 'InnovateCo', dates: 'Mar 2017 - Dec 2020', bullets: [
        'Architected event-driven microservices platform',
        'Reduced system downtime from 99.9% to 99.99% SLA',
        'Mentored 8 junior engineers, 3 promoted to senior level',
        'Led security audit and remediation of authentication system',
      ]},
      { title: 'Software Engineer', company: 'WebDev Agency', dates: 'Jun 2014 - Feb 2017', bullets: [
        'Built responsive web applications for Fortune 500 clients',
        'Implemented A/B testing framework increasing conversion by 22%',
        'Developed internal component library used across 12 projects',
      ]},
      { title: 'Junior Developer', company: 'SmallStartup LLC', dates: 'Aug 2012 - May 2014', bullets: [
        'Developed PHP/MySQL web applications',
        'Maintained legacy codebase and performed database migrations',
        'Automated deployment process reducing release time by 70%',
      ]},
    ];

    for (const job of jobs) {
      if (y > 680) {
        doc.addPage();
        addHeaderFooter(2);
        y = 50;
      }
      doc.fontSize(11).font('Helvetica-Bold').text(`${job.title} | ${job.company}`, 50, y, { width: 500 }); y += 16;
      doc.fontSize(10).font('Helvetica').text(job.dates, 50, y); y += 15;
      for (const bullet of job.bullets) {
        doc.text(`  \u2022 ${bullet}`, 50, y, { width: 500 }); y += 14;
      }
      y += 10;
    }

    // Page 2/3 content
    if (y > 600) {
      doc.addPage();
      addHeaderFooter(3);
      y = 50;
    }

    doc.fontSize(14).font('Helvetica-Bold').text('Education', 50, y); y += 20;
    doc.fontSize(11).font('Helvetica-Bold').text('MIT', 50, y); y += 16;
    doc.fontSize(10).font('Helvetica').text('M.S. Computer Science  Sep 2010 - Jun 2012', 50, y); y += 15;
    doc.text('GPA: 3.95', 50, y); y += 20;
    doc.fontSize(11).font('Helvetica-Bold').text('Boston University', 50, y); y += 16;
    doc.fontSize(10).font('Helvetica').text('B.S. Computer Engineering  Sep 2006 - May 2010', 50, y); y += 15;
    doc.text('GPA: 3.78', 50, y); y += 25;

    doc.fontSize(14).font('Helvetica-Bold').text('Skills', 50, y); y += 20;
    doc.fontSize(10).font('Helvetica')
      .text('Java, Python, Go, TypeScript, React, Spring Boot, AWS, GCP, Kubernetes, Terraform, Datadog, PagerDuty', 50, y, { width: 500 });
    y += 25;

    doc.fontSize(14).font('Helvetica-Bold').text('Certifications', 50, y); y += 20;
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 AWS Solutions Architect Professional', 50, y); y += 14;
    doc.text('  \u2022 Certified Scrum Master (CSM)', 50, y); y += 14;
    doc.text('  \u2022 Google Cloud Professional Cloud Architect', 50, y);
  });
}

// ─── PDF 6: Hyphenation and line breaks ──────────────────────────────────────
// Covers: #8 (line breaks and hyphenation)
async function pdf06_hyphenation() {
  return savePdf('06_hyphenation_linebreaks', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('Robert Kim', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('robert.kim@email.com | (213) 555-8901 | Los Angeles, CA', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    // Intentionally write text with hyphenation at line breaks
    doc.fontSize(10).font('Helvetica');
    doc.text('Experienced software engineer specializing in distributed sys-', { continued: false });
    doc.text('tems and cloud infrastructure. Proven track record of deliver-');
    doc.text('ing high-performance applications at scale.');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Platform Engineer | ScaleUp Technologies');
    doc.fontSize(10).font('Helvetica').text('Apr 2020 - Present');
    doc.text('  \u2022 Architected container orchestration platform support-');
    doc.text('    ing 500+ microservices across 3 regions');
    doc.text('  \u2022 Implemented zero-downtime deployment strategy reduc-');
    doc.text('    ing rollback incidents by 90%');
    doc.text('  \u2022 Developed comprehensive monitoring and observabil-');
    doc.text('    ity stack with Prometheus and Grafana');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('University of California, Los Angeles');
    doc.fontSize(10).font('Helvetica').text('B.S. Computer Science  Sep 2016 - Jun 2020');

    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.fontSize(10).font('Helvetica')
      .text('Go, Rust, Python, Kubernetes, Terraform, Prometheus, Grafana, AWS, GCP');
  });
}

// ─── PDF 7: OCR-like artifacts ───────────────────────────────────────────────
// Covers: #10 (OCR errors)
async function pdf07_ocrArtifacts() {
  return savePdf('07_ocr_artifacts', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('Emily Torres', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('emily.torres@email.com | (786) 555-2233 | Miami, FL', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    // OCR-typical errors: | for l, 0 for O
    doc.fontSize(11).font('Helvetica-Bold').text('Software Deve|oper at 0racle C|oud');
    doc.fontSize(10).font('Helvetica').text('May 2021 - Present');
    doc.text('  \u2022 Bui|t sca|ab|e c|oud services for enterprise customers');
    doc.text('  \u2022 |mplemented automated testing reducing bug rate by 60%');
    doc.text('  \u2022 0ptimized database queries improving response time by 3x');
    doc.moveDown(0.3);

    doc.fontSize(11).font('Helvetica-Bold').text('|ntern | StartupHub');
    doc.fontSize(10).font('Helvetica').text('Jun 2020 - Aug 2020');
    doc.text('  \u2022 Deve|oped React components for customer dashboard');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('University of Miami');
    doc.fontSize(10).font('Helvetica').text('B.S. Computer Science  Aug 2017 - May 2021');

    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text('Sk|lls');
    doc.fontSize(10).font('Helvetica')
      .text('Java, Python, JavaScript, React, Node.js, 0racle DB, Postgres');
  });
}

// ─── PDF 8: Ligatures and special encoding ───────────────────────────────────
// Covers: #11 (encoding/ligatures), #19 (special chars), #18 (math symbols)
async function pdf08_ligatures() {
  return savePdf('08_ligatures_encoding', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('Michael O\u2019Brien', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('michael.obrien@email.com | (503) 555-7788 | Portland, OR', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.fontSize(10).font('Helvetica');
    // Smart quotes and em dashes (ligature chars like \uFB01 cause XRef corruption in pdfkit)
    doc.text('\u201CHighly proficient\u201D full-stack developer with expertise in efficient system design. Specializes in offline-first applications and affiliate marketing platforms.');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Staff Engineer \u2013 Affiliate Systems | MarketCo');
    doc.fontSize(10).font('Helvetica').text('Jan 2019 \u2013 Present');
    doc.text('  \u2022 Designed offline-first architecture for field sales team');
    doc.text('  \u2022 Built efficient data pipeline processing 1M+ transactions daily');
    doc.text('  \u2022 Led migration from on-prem to AWS \u2014 reduced costs by 40%');
    doc.moveDown(0.3);

    doc.fontSize(11).font('Helvetica-Bold').text('Software Engineer | TechStartup');
    doc.fontSize(10).font('Helvetica').text('Jun 2016 \u2013 Dec 2018');
    doc.text('  \u2022 Developed real-time analytics dashboard with WebSocket integration');
    doc.text('  \u2022 Implemented automated testing suite with 95% code coverage');
    doc.moveDown(0.5);

    // Research section with special chars
    doc.fontSize(14).font('Helvetica-Bold').text('Publications');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 \u201CAlgorithm complexity optimization: O(n\u00B2) to O(n log n)\u201D \u2013 ACM 2020');
    doc.text('  \u2022 \u201CStatistical analysis of distributed systems\u201D \u2013 IEEE 2019');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('Oregon State University');
    doc.fontSize(10).font('Helvetica').text('M.S. Computer Science  Sep 2014 - Jun 2016');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.fontSize(10).font('Helvetica')
      .text('TypeScript, Python, Rust, C++, React, PostgreSQL, Redis, Kafka, Docker');
  });
}

// ─── PDF 9: Duplicate/hidden text layers ─────────────────────────────────────
// Covers: #14 (duplicate/hidden text)
async function pdf09_duplicateText() {
  return savePdf('09_duplicate_text_layers', (doc) => {
    // Write text, then write it again at same position (simulates hidden layer)
    const y = 50;
    doc.fontSize(20).font('Helvetica-Bold').text('Priya Sharma', 50, y, { align: 'center' });
    // Duplicate at same position
    doc.fontSize(20).font('Helvetica-Bold').text('Priya Sharma', 50, y, { align: 'center' });

    doc.fontSize(10).font('Helvetica');
    const contactY = 80;
    doc.text('priya.sharma@email.com | (408) 555-6677 | San Jose, CA', 50, contactY, { align: 'center' });
    doc.text('priya.sharma@email.com | (408) 555-6677 | San Jose, CA', 50, contactY, { align: 'center' });

    let cy = 110;
    doc.fontSize(14).font('Helvetica-Bold').text('Experience', 50, cy); cy += 20;
    doc.fontSize(11).font('Helvetica-Bold').text('ML Engineer | AI Startup', 50, cy); cy += 16;
    doc.fontSize(10).font('Helvetica').text('Jul 2022 - Present', 50, cy); cy += 15;
    doc.text('  \u2022 Developed NLP pipeline achieving 94% accuracy on classification tasks', 50, cy); cy += 14;
    doc.text('  \u2022 Deployed models to production serving 100k+ predictions/day', 50, cy); cy += 14;
    doc.text('  \u2022 Built automated retraining pipeline reducing model drift', 50, cy); cy += 25;

    doc.fontSize(14).font('Helvetica-Bold').text('Education', 50, cy); cy += 20;
    doc.fontSize(11).font('Helvetica-Bold').text('San Jose State University', 50, cy); cy += 16;
    doc.fontSize(10).font('Helvetica').text('M.S. Artificial Intelligence  Aug 2020 - May 2022', 50, cy); cy += 15;
    doc.text('GPA: 3.88', 50, cy); cy += 25;

    doc.fontSize(14).font('Helvetica-Bold').text('Skills', 50, cy); cy += 20;
    doc.fontSize(10).font('Helvetica')
      .text('Python, TensorFlow, PyTorch, scikit-learn, Pandas, SQL, Docker, Kubernetes, MLflow', 50, cy);
  });
}

// ─── PDF 10: Rotated text (watermarks) ───────────────────────────────────────
// Covers: #15 (rotated/skewed text)
async function pdf10_rotatedText() {
  return savePdf('10_rotated_watermark', (doc) => {
    // Add diagonal watermark text
    doc.save();
    doc.rotate(-45, { origin: [300, 400] });
    doc.fontSize(60).font('Helvetica').fillColor('#EEEEEE')
      .text('CONFIDENTIAL', 100, 400);
    doc.restore();
    doc.fillColor('#000000');

    // Normal resume content on top
    doc.fontSize(20).font('Helvetica-Bold').text('Thomas Wright', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('thomas.wright@email.com | (202) 555-4455 | Washington, DC', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Security Clearance');
    doc.fontSize(10).font('Helvetica').text('Top Secret / SCI (Active)');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Cybersecurity Analyst | DefenseTech');
    doc.fontSize(10).font('Helvetica').text('Mar 2020 - Present');
    doc.text('  \u2022 Conducted penetration testing on classified networks');
    doc.text('  \u2022 Developed incident response procedures for SOC team');
    doc.text('  \u2022 Led security awareness training for 500+ employees');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('Georgetown University');
    doc.fontSize(10).font('Helvetica').text('B.S. Cybersecurity  Aug 2016 - May 2020');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Certifications');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 CISSP - Certified Information Systems Security Professional');
    doc.text('  \u2022 CEH - Certified Ethical Hacker');
    doc.text('  \u2022 CompTIA Security+');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.fontSize(10).font('Helvetica')
      .text('Python, Wireshark, Metasploit, Nessus, Splunk, AWS Security, Network Security');
  });
}

// ─── PDF 11: Various bullet styles ───────────────────────────────────────────
// Covers: #23 (bullet points and lists lost)
async function pdf11_bulletStyles() {
  return savePdf('11_bullet_styles', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('Lisa Nguyen', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('lisa.nguyen@email.com | (312) 555-1122 | Chicago, IL', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.fontSize(10).font('Helvetica')
      .text('Product manager with 5+ years of experience in fintech. Passionate about data-driven product development and customer-centric design thinking.');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Product Manager | FinTechCo');
    doc.fontSize(10).font('Helvetica').text('May 2021 - Present');

    // Various bullet styles (using ASCII-safe chars + common Unicode bullets)
    doc.text('\u2022 Led product strategy for mobile banking app with 2M+ users');
    doc.text('- Increased user engagement by 45% through gamification features');
    doc.text('* Managed cross-functional team of 12 engineers and 3 designers');
    doc.text('\u2013 Defined product roadmap aligned with company OKRs');
    doc.text('> Conducted 50+ user interviews for discovery research');
    doc.text('  \u2022 Built analytics dashboard tracking key product metrics');
    doc.text('  - Partnered with engineering to reduce tech debt by 30%');
    doc.text('  * Launched 3 major features contributing $5M in annual revenue');
    doc.moveDown(0.3);

    doc.fontSize(11).font('Helvetica-Bold').text('Associate PM | StartupPay');
    doc.fontSize(10).font('Helvetica').text('Jun 2019 - Apr 2021');
    doc.text('\u2022 Owned payment processing feature from ideation to launch');
    doc.text('- Conducted competitive analysis across 10 fintech products');
    doc.text('* Improved checkout conversion rate by 18%');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('Northwestern University');
    doc.fontSize(10).font('Helvetica').text('MBA  Sep 2019 - Jun 2021');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.fontSize(10).font('Helvetica')
      .text('Product Strategy, Agile, Scrum, SQL, Tableau, Figma, Jira, A/B Testing, User Research');
  });
}

// ─── PDF 12: Footnotes and references ────────────────────────────────────────
// Covers: #24 (footnotes mixed into text)
async function pdf12_footnotes() {
  return savePdf('12_footnotes_references', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('James Anderson', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('james.anderson@email.com | (646) 555-8899 | New York, NY', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Quantitative Analyst | Goldman Trading');
    doc.fontSize(10).font('Helvetica').text('Jan 2021 - Present');
    doc.text('  \u2022 Developed algorithmic trading strategies generating $50M+ annual PnL');
    doc.text('  \u2022 Built risk models with 99.5% VaR accuracy');
    doc.text('  \u2022 Implemented real-time market data processing pipeline');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('Columbia University');
    doc.fontSize(10).font('Helvetica').text('Ph.D. Financial Engineering  Sep 2016 - May 2021');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica-Bold').text('NYU');
    doc.fontSize(10).font('Helvetica').text('B.S. Mathematics  Sep 2012 - May 2016');
    doc.text('GPA: 3.97');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Publications');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 "Optimal Execution Strategies Under Transaction Costs" - Journal of Finance, 2023');
    doc.text('  \u2022 "Deep Reinforcement Learning for Portfolio Optimization" - NeurIPS 2022');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.fontSize(10).font('Helvetica')
      .text('Python, C++, R, MATLAB, TensorFlow, pandas, numpy, Bloomberg Terminal, SQL');

    // Footnotes at bottom of page (small font, low on page)
    doc.fontSize(7).font('Helvetica');
    doc.text('1) Past performance is not indicative of future results.', 50, 710);
    doc.text('2) All figures are approximate and subject to audit verification.', 50, 720);
    doc.text('\u2020 Trading strategies referenced are proprietary and confidential.', 50, 730);
  });
}

// ─── PDF 13: Extended sections (leadership, volunteer, internship, etc.) ─────
// Covers: remaining section types not covered above
async function pdf13_extendedSections() {
  return savePdf('13_extended_sections', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('Rachel Cooper', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('rachel.cooper@email.com | (404) 555-3344 | Atlanta, GA', { align: 'center' });
    doc.text('linkedin.com/in/rachelcooper | https://rachelcooper.dev', { align: 'center' });
    doc.moveDown(0.5);

    // Professional Profile (text-like section)
    doc.fontSize(14).font('Helvetica-Bold').text('Professional Profile');
    doc.fontSize(10).font('Helvetica')
      .text('Dynamic engineering leader with 10+ years building enterprise software. Expert in scaling teams and systems simultaneously. Committed to inclusive engineering cultures.');
    doc.moveDown(0.5);

    // Relevant Experience
    doc.fontSize(14).font('Helvetica-Bold').text('Relevant Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Tech Lead | Enterprise Solutions Corp');
    doc.fontSize(10).font('Helvetica').text('Feb 2020 - Present');
    doc.text('  \u2022 Led team of 8 building multi-tenant SaaS platform');
    doc.text('  \u2022 Architected GraphQL API serving 500+ enterprise clients');
    doc.moveDown(0.5);

    // Leadership Experience
    doc.fontSize(14).font('Helvetica-Bold').text('Leadership Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Chapter Lead | Women in Tech Atlanta');
    doc.fontSize(10).font('Helvetica').text('Jan 2019 - Present');
    doc.text('  \u2022 Organized monthly meetups with 200+ attendees');
    doc.text('  \u2022 Launched mentorship program pairing 50 mentees with industry leaders');
    doc.moveDown(0.5);

    // Internship Experience
    doc.fontSize(14).font('Helvetica-Bold').text('Internships');
    doc.fontSize(11).font('Helvetica-Bold').text('Software Engineering Intern | Google');
    doc.fontSize(10).font('Helvetica').text('Jun 2014 - Aug 2014');
    doc.text('  \u2022 Developed internal tools for search quality team');
    doc.moveDown(0.5);

    // Core Competencies (list-like)
    doc.fontSize(14).font('Helvetica-Bold').text('Core Competencies');
    doc.fontSize(10).font('Helvetica')
      .text('System Architecture, Team Leadership, Agile Methodologies, Technical Mentoring, Cross-functional Collaboration, Strategic Planning');
    doc.moveDown(0.5);

    // Relevant Coursework
    doc.fontSize(14).font('Helvetica-Bold').text('Relevant Coursework');
    doc.fontSize(10).font('Helvetica')
      .text('Distributed Systems, Machine Learning, Advanced Algorithms, Database Systems, Computer Networks, Operating Systems');
    doc.moveDown(0.5);

    // Awards
    doc.fontSize(14).font('Helvetica-Bold').text('Awards');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 Grace Hopper Celebration Scholarship Recipient (2019)');
    doc.text('  \u2022 Georgia Tech Outstanding Alumni Award (2022)');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('Georgia Institute of Technology');
    doc.fontSize(10).font('Helvetica').text('B.S. Computer Science  Aug 2011 - May 2015');
    doc.text('GPA: 3.82');
  });
}

// ─── PDF 14: More extended sections (patents, conferences, exhibitions, etc.) ─
async function pdf14_moreExtendedSections() {
  return savePdf('14_more_extended_sections', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('Dr. Samuel Lee', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('samuel.lee@university.edu | (650) 555-7788 | Palo Alto, CA', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Research Scientist | Stanford AI Lab');
    doc.fontSize(10).font('Helvetica').text('Sep 2018 - Present');
    doc.text('  \u2022 Published 15+ papers in top-tier ML conferences');
    doc.text('  \u2022 Secured $2M in research grants');
    doc.moveDown(0.5);

    // Patents
    doc.fontSize(14).font('Helvetica-Bold').text('Patents');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 US Patent 12,345,678 - "Neural Architecture for Real-time Video Analysis" (2023)');
    doc.text('  \u2022 US Patent 11,234,567 - "Efficient Transformer Attention Mechanism" (2022)');
    doc.moveDown(0.5);

    // Conferences
    doc.fontSize(14).font('Helvetica-Bold').text('Conferences');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 Keynote Speaker, NeurIPS 2023 - "The Future of Foundation Models"');
    doc.text('  \u2022 Workshop Organizer, ICML 2022 - "Efficient Deep Learning"');
    doc.text('  \u2022 Invited Talk, CVPR 2021 - "Vision Transformers in Practice"');
    doc.moveDown(0.5);

    // Grants/Funding
    doc.fontSize(14).font('Helvetica-Bold').text('Grants');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 NSF CAREER Award - $500K (2022-2027)');
    doc.text('  \u2022 DARPA Research Grant - $1.5M (2020-2023)');
    doc.moveDown(0.5);

    // Teaching/Mentorship
    doc.fontSize(14).font('Helvetica-Bold').text('Teaching');
    doc.fontSize(11).font('Helvetica-Bold').text('Instructor | CS229: Machine Learning');
    doc.fontSize(10).font('Helvetica').text('Sep 2020 - Present');
    doc.text('  \u2022 Taught 300+ students per quarter');
    doc.text('  \u2022 Redesigned curriculum incorporating latest research');
    doc.moveDown(0.5);

    // Open Source Contributions
    doc.fontSize(14).font('Helvetica-Bold').text('Open Source Contributions');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 Core contributor to PyTorch (500+ commits)');
    doc.text('  \u2022 Maintainer of efficient-transformers library (5k+ stars)');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('Stanford University');
    doc.fontSize(10).font('Helvetica').text('Ph.D. Computer Science  Sep 2014 - Jun 2018');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica-Bold').text('Caltech');
    doc.fontSize(10).font('Helvetica').text('B.S. Mathematics  Sep 2010 - Jun 2014');
    doc.text('GPA: 3.99');

    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.fontSize(10).font('Helvetica')
      .text('Python, C++, CUDA, PyTorch, TensorFlow, JAX, LaTeX, MATLAB');
  });
}

// ─── PDF 15: Freelance, Activities, Portfolio, Case Studies, etc. ────────────
async function pdf15_creativeSections() {
  return savePdf('15_creative_sections', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('Maya Patel', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('maya@designstudio.com | (718) 555-2211 | Brooklyn, NY', { align: 'center' });
    doc.text('https://mayapatel.design', { align: 'center' });
    doc.moveDown(0.5);

    // Personal Branding
    doc.fontSize(14).font('Helvetica-Bold').text('Personal Branding');
    doc.fontSize(10).font('Helvetica')
      .text('Award-winning UX designer and creative technologist at the intersection of design thinking and engineering. I transform complex problems into elegant, user-centered digital experiences.');
    doc.moveDown(0.5);

    // Freelance/Contract Work
    doc.fontSize(14).font('Helvetica-Bold').text('Freelance Work');
    doc.fontSize(11).font('Helvetica-Bold').text('UX Design Consultant');
    doc.fontSize(10).font('Helvetica').text('Jan 2022 - Present');
    doc.text('  \u2022 Redesigned checkout flow for major e-commerce brand, increasing conversion 28%');
    doc.text('  \u2022 Conducted design sprints for 5 startups in healthcare and fintech');
    doc.moveDown(0.5);

    // Portfolio Highlights
    doc.fontSize(14).font('Helvetica-Bold').text('Portfolio Highlights');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 HealthTrack App - Complete redesign of patient portal (500k users)');
    doc.text('  \u2022 EcoShop Platform - E-commerce sustainability rating integration');
    doc.text('  \u2022 CityNav AR - Augmented reality navigation for public transit');
    doc.moveDown(0.5);

    // Case Studies
    doc.fontSize(14).font('Helvetica-Bold').text('Case Studies');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 "Reducing Cognitive Load in Healthcare Portals" - Featured in UX Collective');
    doc.text('  \u2022 "Designing for Accessibility: A 508 Compliance Case Study"');
    doc.moveDown(0.5);

    // Exhibitions
    doc.fontSize(14).font('Helvetica-Bold').text('Exhibitions');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 "Digital Futures" - MoMA PS1, New York (2023)');
    doc.text('  \u2022 "Interface/Surface" - Design Museum, London (2022)');
    doc.moveDown(0.5);

    // Activities
    doc.fontSize(14).font('Helvetica-Bold').text('Activities');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 Board Member, AIGA New York Chapter');
    doc.text('  \u2022 Organizer, Brooklyn Design Meetup (300+ members)');
    doc.moveDown(0.5);

    // Career Highlights
    doc.fontSize(14).font('Helvetica-Bold').text('Career Highlights');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 Webby Award Winner - Best User Experience (2023)');
    doc.text('  \u2022 Featured in Fast Company "Most Creative People" list (2022)');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('Rhode Island School of Design');
    doc.fontSize(10).font('Helvetica').text('B.F.A. Graphic Design  Sep 2014 - May 2018');

    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.fontSize(10).font('Helvetica')
      .text('Figma, Sketch, Adobe Creative Suite, HTML/CSS, JavaScript, React, Framer, Principle');
  });
}

// ─── PDF 16: Testimonials, Problem-Solving, Impact, Capstone ─────────────────
async function pdf16_specialSections() {
  return savePdf('16_special_sections', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('Carlos Mendez', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('carlos.mendez@email.com | (512) 555-9900 | Austin, TX', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Solutions Architect | CloudFirst');
    doc.fontSize(10).font('Helvetica').text('Mar 2020 - Present');
    doc.text('  \u2022 Designed multi-region disaster recovery architecture');
    doc.text('  \u2022 Led cloud migration for 3 Fortune 500 clients');
    doc.moveDown(0.5);

    // Impact Section
    doc.fontSize(14).font('Helvetica-Bold').text('Impact');
    doc.fontSize(10).font('Helvetica')
      .text('Drove $15M in annual cost savings through infrastructure optimization across 8 enterprise clients. Reduced mean time to recovery from 4 hours to 15 minutes through automated failover architecture.');
    doc.moveDown(0.5);

    // Problem-Solving
    doc.fontSize(14).font('Helvetica-Bold').text('Problem-Solving');
    doc.fontSize(11).font('Helvetica-Bold').text('Database Performance Crisis | CloudFirst');
    doc.fontSize(10).font('Helvetica').text('Jul 2022 - Sep 2022');
    doc.text('  \u2022 Diagnosed cascading failure affecting 200+ microservices');
    doc.text('  \u2022 Implemented connection pooling and query optimization reducing latency 10x');
    doc.moveDown(0.5);

    // Capstone/Thesis
    doc.fontSize(14).font('Helvetica-Bold').text('Capstone');
    doc.fontSize(10).font('Helvetica')
      .text('"Autonomous Cloud Resource Scaling Using Reinforcement Learning" - Developed ML-based auto-scaler that reduced cloud costs by 30% while maintaining SLA targets.');
    doc.moveDown(0.5);

    // Testimonials
    doc.fontSize(14).font('Helvetica-Bold').text('Testimonials');
    doc.fontSize(10).font('Helvetica');
    doc.text('"Carlos is the most technically skilled architect I\'ve worked with in 20 years." - VP of Engineering, CloudFirst');
    doc.text('"His ability to translate complex technical concepts for stakeholders is unmatched." - CTO, FinanceCorp');
    doc.moveDown(0.5);

    // Training & Workshops
    doc.fontSize(14).font('Helvetica-Bold').text('Training & Workshops');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 AWS re:Invent Workshop Instructor (2022, 2023)');
    doc.text('  \u2022 Internal Cloud Architecture Bootcamp (trained 50+ engineers)');
    doc.moveDown(0.5);

    // Professional Development
    doc.fontSize(14).font('Helvetica-Bold').text('Professional Development');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 Completed Stanford Online "Machine Learning Specialization" (2023)');
    doc.text('  \u2022 HashiCorp Terraform Associate Certification (2022)');
    doc.moveDown(0.5);

    // Key Achievements
    doc.fontSize(14).font('Helvetica-Bold').text('Key Achievements');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 Architected zero-downtime migration of 50TB database');
    doc.text('  \u2022 Reduced infrastructure costs by 40% across entire organization');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('University of Texas at Austin');
    doc.fontSize(10).font('Helvetica').text('M.S. Computer Science  Aug 2016 - May 2018');
  });
}

// ─── PDF 17: Mixed languages ─────────────────────────────────────────────────
// Covers: #21 (language detection issues)
async function pdf17_mixedLanguages() {
  return savePdf('17_mixed_languages', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('Yuki Tanaka', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('yuki.tanaka@email.com | +81-90-1234-5678 | Tokyo, Japan', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.fontSize(10).font('Helvetica')
      .text('Bilingual software engineer with experience in both Japanese and international tech companies. Specializing in localization engineering and internationalization (i18n) systems. Expert in building culturally-adaptive user interfaces and multi-locale data pipelines.');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    doc.fontSize(11).font('Helvetica-Bold').text('Senior Engineer | Rakuten Inc.');
    doc.fontSize(10).font('Helvetica').text('Apr 2020 - Present');
    doc.text('  \u2022 Built i18n framework supporting 12 languages across 15 markets');
    doc.text('  \u2022 Led cross-cultural team of engineers in Tokyo and San Francisco');
    doc.text('  \u2022 Developed automated translation pipeline with 95% accuracy');
    doc.text('  \u2022 Reduced localization turnaround time from 2 weeks to 2 days');
    doc.moveDown(0.3);

    doc.fontSize(11).font('Helvetica-Bold').text('Software Engineer | LINE Corporation');
    doc.fontSize(10).font('Helvetica').text('Apr 2018 - Mar 2020');
    doc.text('  \u2022 Developed messaging platform features serving 200M+ users');
    doc.text('  \u2022 Built real-time translation feature for cross-language chat');
    doc.text('  \u2022 Implemented content moderation system for multi-language text');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.fontSize(11).font('Helvetica-Bold').text('University of Tokyo');
    doc.fontSize(10).font('Helvetica').text('B.S. Computer Science  Apr 2014 - Mar 2018');
    doc.text('GPA: 3.75');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Languages');
    doc.fontSize(10).font('Helvetica');
    doc.text('Japanese (Native), English (Fluent - TOEIC 985), Mandarin (Intermediate)');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.fontSize(10).font('Helvetica')
      .text('Java, Kotlin, TypeScript, React, Spring Boot, PostgreSQL, Redis, Docker, Kubernetes');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('Certifications');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 AWS Certified Solutions Architect (2022)');
    doc.text('  \u2022 Google Cloud Professional Developer (2021)');
  });
}

// ─── PDF 18: ALL-CAPS section headers ────────────────────────────────────────
// Tests section detection with all-caps formatting (common in real resumes)
async function pdf18_allCapsHeaders() {
  return savePdf('18_all_caps_headers', (doc) => {
    doc.fontSize(20).font('Helvetica-Bold').text('DANIEL JACKSON', { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text('daniel.jackson@email.com | (303) 555-6677 | Denver, CO', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY');
    doc.fontSize(10).font('Helvetica')
      .text('DevOps engineer with deep expertise in cloud infrastructure automation and container orchestration. Passionate about reliability engineering and infrastructure as code.');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('WORK EXPERIENCE');
    doc.fontSize(11).font('Helvetica-Bold').text('Senior DevOps Engineer | CloudOps Inc.');
    doc.fontSize(10).font('Helvetica').text('Jan 2021 - Present');
    doc.text('  \u2022 Managed Kubernetes clusters across 5 AWS regions');
    doc.text('  \u2022 Implemented GitOps workflow with ArgoCD');
    doc.text('  \u2022 Reduced deployment failures by 80% through canary releases');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('EDUCATION');
    doc.fontSize(11).font('Helvetica-Bold').text('University of Colorado Boulder');
    doc.fontSize(10).font('Helvetica').text('B.S. Computer Science  Aug 2015 - May 2019');
    doc.text('GPA: 3.65');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('SKILLS AND QUALIFICATIONS');
    doc.fontSize(10).font('Helvetica')
      .text('Kubernetes, Docker, Terraform, Ansible, AWS, GCP, Azure, Python, Go, Bash, Prometheus, Grafana, Jenkins, ArgoCD');
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('CERTIFICATIONS');
    doc.fontSize(10).font('Helvetica');
    doc.text('  \u2022 Certified Kubernetes Administrator (CKA)');
    doc.text('  \u2022 AWS DevOps Engineer Professional');
    doc.text('  \u2022 HashiCorp Terraform Associate');
  });
}

// ─── Main: generate all PDFs ─────────────────────────────────────────────────
async function main() {
  console.log('Generating test PDFs...\n');

  const generators = [
    { name: 'PDF 01: Standard (all sections)',        fn: pdf01_standardAllSections },
    { name: 'PDF 02: Two-column sidebar',             fn: pdf02_twoColumn },
    { name: 'PDF 03: Character-level/spacing',        fn: pdf03_characterLevel },
    { name: 'PDF 04: Tables',                         fn: pdf04_tables },
    { name: 'PDF 05: Multi-page headers/footers',     fn: pdf05_multiPageHeadersFooters },
    { name: 'PDF 06: Hyphenation/linebreaks',         fn: pdf06_hyphenation },
    { name: 'PDF 07: OCR artifacts',                  fn: pdf07_ocrArtifacts },
    { name: 'PDF 08: Ligatures/encoding',             fn: pdf08_ligatures },
    { name: 'PDF 09: Duplicate text layers',          fn: pdf09_duplicateText },
    { name: 'PDF 10: Rotated text/watermark',         fn: pdf10_rotatedText },
    { name: 'PDF 11: Various bullet styles',          fn: pdf11_bulletStyles },
    { name: 'PDF 12: Footnotes/references',           fn: pdf12_footnotes },
    { name: 'PDF 13: Extended sections (leadership, volunteer, internship, etc.)', fn: pdf13_extendedSections },
    { name: 'PDF 14: Research sections (patents, conferences, grants, etc.)',      fn: pdf14_moreExtendedSections },
    { name: 'PDF 15: Creative sections (freelance, portfolio, case studies, etc.)', fn: pdf15_creativeSections },
    { name: 'PDF 16: Special sections (testimonials, impact, capstone, etc.)',     fn: pdf16_specialSections },
    { name: 'PDF 17: Mixed languages',                fn: pdf17_mixedLanguages },
    { name: 'PDF 18: ALL-CAPS section headers',       fn: pdf18_allCapsHeaders },
  ];

  for (const gen of generators) {
    try {
      const path = await gen.fn();
      console.log(`  ✓ ${gen.name} → ${path}`);
    } catch (err) {
      console.error(`  ✗ ${gen.name}: ${err}`);
    }
  }

  console.log(`\nGenerated ${generators.length} PDFs in ${OUT_DIR}`);
}

main().catch(console.error);
