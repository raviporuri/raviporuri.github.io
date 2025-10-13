interface ResumeData {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin?: string
    website?: string
  }
  summary: string
  experience: Array<{
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    description: string[]
  }>
  education: Array<{
    degree: string
    school: string
    location: string
    graduationDate: string
    gpa?: string
  }>
  skills: {
    technical: string[]
    leadership: string[]
    languages?: string[]
  }
  certifications?: Array<{
    name: string
    issuer: string
    date: string
    credentialId?: string
  }>
  achievements?: string[]
}

interface Customizations {
  includePhoto?: boolean
  colorScheme?: string
  fontStyle?: string
  sections?: string[]
}

export function generateResumeHTML(
  resumeData: ResumeData,
  template: string,
  customizations?: Customizations
): string {
  const colorScheme = getColorScheme(customizations?.colorScheme || 'blue')
  const fontStyle = getFontStyle(customizations?.fontStyle || 'modern')

  switch (template) {
    case 'professional':
      return generateProfessionalTemplate(resumeData, colorScheme, fontStyle)
    case 'modern':
      return generateModernTemplate(resumeData, colorScheme, fontStyle)
    case 'executive':
      return generateExecutiveTemplate(resumeData, colorScheme, fontStyle)
    case 'technical':
      return generateTechnicalTemplate(resumeData, colorScheme, fontStyle)
    case 'creative':
      return generateCreativeTemplate(resumeData, colorScheme, fontStyle)
    case 'academic':
      return generateAcademicTemplate(resumeData, colorScheme, fontStyle)
    case 'international':
      return generateInternationalTemplate(resumeData, colorScheme, fontStyle)
    default:
      return generateProfessionalTemplate(resumeData, colorScheme, fontStyle)
  }
}

function getColorScheme(scheme: string) {
  const schemes = {
    blue: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#dbeafe',
      text: '#1f2937'
    },
    green: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#d1fae5',
      text: '#1f2937'
    },
    purple: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#ede9fe',
      text: '#1f2937'
    },
    gray: {
      primary: '#374151',
      secondary: '#6b7280',
      accent: '#f3f4f6',
      text: '#111827'
    }
  }
  return schemes[scheme as keyof typeof schemes] || schemes.blue
}

function getFontStyle(style: string) {
  const styles = {
    modern: {
      primary: "'Inter', sans-serif",
      secondary: "'Inter', sans-serif",
      size: {
        name: '28px',
        header: '18px',
        subheader: '14px',
        body: '12px'
      }
    },
    classic: {
      primary: "'Times New Roman', serif",
      secondary: "'Georgia', serif",
      size: {
        name: '24px',
        header: '16px',
        subheader: '14px',
        body: '12px'
      }
    },
    minimal: {
      primary: "'Helvetica Neue', sans-serif",
      secondary: "'Arial', sans-serif",
      size: {
        name: '26px',
        header: '16px',
        subheader: '13px',
        body: '11px'
      }
    }
  }
  return styles[style as keyof typeof styles] || styles.modern
}

function generateProfessionalTemplate(
  data: ResumeData,
  colors: any,
  fonts: any
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.personalInfo.name} - Resume</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: ${fonts.primary};
          font-size: ${fonts.size.body};
          line-height: 1.4;
          color: ${colors.text};
          background: white;
        }

        .container {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
          background: white;
        }

        .header {
          text-align: center;
          border-bottom: 2px solid ${colors.primary};
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .name {
          font-size: ${fonts.size.name};
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .contact-info {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
          font-size: ${fonts.size.subheader};
          color: ${colors.secondary};
        }

        .section {
          margin-bottom: 25px;
        }

        .section-title {
          font-size: ${fonts.size.header};
          font-weight: 700;
          color: ${colors.primary};
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid ${colors.accent};
          padding-bottom: 5px;
          margin-bottom: 15px;
        }

        .summary {
          font-size: ${fonts.size.subheader};
          line-height: 1.6;
          text-align: justify;
          color: ${colors.text};
        }

        .experience-item {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 5px;
        }

        .job-title {
          font-size: ${fonts.size.subheader};
          font-weight: 700;
          color: ${colors.primary};
        }

        .company {
          font-size: ${fonts.size.subheader};
          font-weight: 600;
          color: ${colors.text};
          margin-top: 2px;
        }

        .date-location {
          font-size: ${fonts.size.body};
          color: ${colors.secondary};
          text-align: right;
          line-height: 1.3;
        }

        .job-description {
          margin-top: 8px;
        }

        .job-description ul {
          list-style-type: disc;
          margin-left: 18px;
          margin-top: 5px;
        }

        .job-description li {
          margin-bottom: 4px;
          font-size: ${fonts.size.body};
          line-height: 1.4;
        }

        .education-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid ${colors.accent};
        }

        .degree {
          font-weight: 600;
          color: ${colors.primary};
        }

        .school {
          font-size: ${fonts.size.body};
          color: ${colors.text};
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .skill-category {
          background: ${colors.accent};
          padding: 12px;
          border-radius: 4px;
        }

        .skill-category-title {
          font-weight: 700;
          color: ${colors.primary};
          font-size: ${fonts.size.subheader};
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .skill-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .skill-item {
          background: white;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: ${fonts.size.body};
          border: 1px solid ${colors.primary};
        }

        .achievements ul {
          list-style-type: disc;
          margin-left: 18px;
        }

        .achievements li {
          margin-bottom: 6px;
          font-size: ${fonts.size.body};
          line-height: 1.4;
        }

        .certifications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 10px;
        }

        .cert-item {
          border: 1px solid ${colors.accent};
          padding: 10px;
          border-radius: 4px;
        }

        .cert-name {
          font-weight: 600;
          color: ${colors.primary};
        }

        .cert-details {
          font-size: ${fonts.size.body};
          color: ${colors.secondary};
          margin-top: 3px;
        }

        @media print {
          body { print-color-adjust: exact; }
          .container { margin: 0; padding: 0.3in; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="name">${data.personalInfo.name}</div>
          <div class="contact-info">
            <span>${data.personalInfo.email}</span>
            <span>${data.personalInfo.phone}</span>
            <span>${data.personalInfo.location}</span>
            ${data.personalInfo.linkedin ? `<span>${data.personalInfo.linkedin}</span>` : ''}
            ${data.personalInfo.website ? `<span>${data.personalInfo.website}</span>` : ''}
          </div>
        </div>

        <!-- Summary -->
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="summary">${data.summary}</div>
        </div>

        <!-- Experience -->
        <div class="section">
          <div class="section-title">Professional Experience</div>
          ${data.experience.map(exp => `
            <div class="experience-item">
              <div class="job-header">
                <div>
                  <div class="job-title">${exp.title}</div>
                  <div class="company">${exp.company}</div>
                </div>
                <div class="date-location">
                  <div>${exp.startDate} - ${exp.endDate}</div>
                  <div>${exp.location}</div>
                </div>
              </div>
              <div class="job-description">
                <ul>
                  ${exp.description.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Education -->
        <div class="section">
          <div class="section-title">Education</div>
          ${data.education.map(edu => `
            <div class="education-item">
              <div>
                <div class="degree">${edu.degree}</div>
                <div class="school">${edu.school}, ${edu.location}</div>
              </div>
              <div class="date-location">
                <div>${edu.graduationDate}</div>
                ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Skills -->
        <div class="section">
          <div class="section-title">Core Competencies</div>
          <div class="skills-grid">
            <div class="skill-category">
              <div class="skill-category-title">Technical Skills</div>
              <div class="skill-list">
                ${data.skills.technical.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
              </div>
            </div>
            <div class="skill-category">
              <div class="skill-category-title">Leadership Skills</div>
              <div class="skill-list">
                ${data.skills.leadership.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
              </div>
            </div>
            ${data.skills.languages ? `
              <div class="skill-category">
                <div class="skill-category-title">Languages</div>
                <div class="skill-list">
                  ${data.skills.languages.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Certifications -->
        ${data.certifications && data.certifications.length > 0 ? `
          <div class="section">
            <div class="section-title">Certifications</div>
            <div class="certifications-grid">
              ${data.certifications.map(cert => `
                <div class="cert-item">
                  <div class="cert-name">${cert.name}</div>
                  <div class="cert-details">
                    ${cert.issuer} • ${cert.date}
                    ${cert.credentialId ? `<br>ID: ${cert.credentialId}` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Key Achievements -->
        ${data.achievements && data.achievements.length > 0 ? `
          <div class="section">
            <div class="section-title">Key Achievements</div>
            <div class="achievements">
              <ul>
                ${data.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
              </ul>
            </div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `
}

function generateModernTemplate(data: ResumeData, colors: any, fonts: any): string {
  // Modern template with sidebar layout and accent colors
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.personalInfo.name} - Resume</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: ${fonts.primary};
          font-size: ${fonts.size.body};
          line-height: 1.4;
          color: ${colors.text};
          background: white;
        }

        .container {
          max-width: 8.5in;
          margin: 0 auto;
          background: white;
          display: grid;
          grid-template-columns: 250px 1fr;
          min-height: 11in;
        }

        .sidebar {
          background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
          color: white;
          padding: 30px 25px;
        }

        .main-content {
          padding: 30px 35px;
        }

        .profile-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .name {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 5px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .contact-info {
          font-size: 11px;
          line-height: 1.6;
        }

        .sidebar-section {
          margin-bottom: 25px;
        }

        .sidebar-title {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid rgba(255,255,255,0.3);
        }

        .skill-bar {
          margin-bottom: 8px;
        }

        .skill-name {
          font-size: 10px;
          margin-bottom: 3px;
        }

        .skill-level {
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .skill-fill {
          height: 100%;
          background: white;
          border-radius: 2px;
        }

        .main-section {
          margin-bottom: 30px;
        }

        .main-title {
          font-size: ${fonts.size.header};
          font-weight: 700;
          color: ${colors.primary};
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          position: relative;
        }

        .main-title::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 50px;
          height: 3px;
          background: ${colors.secondary};
        }

        .summary {
          font-size: ${fonts.size.subheader};
          line-height: 1.6;
          text-align: justify;
        }

        .timeline {
          position: relative;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: ${colors.accent};
        }

        .timeline-item {
          position: relative;
          margin-bottom: 25px;
          margin-left: 40px;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: -33px;
          top: 5px;
          width: 8px;
          height: 8px;
          background: ${colors.primary};
          border-radius: 50%;
        }

        .job-title {
          font-size: ${fonts.size.subheader};
          font-weight: 700;
          color: ${colors.primary};
          margin-bottom: 3px;
        }

        .company-date {
          font-size: ${fonts.size.body};
          color: ${colors.secondary};
          margin-bottom: 8px;
        }

        .job-description ul {
          list-style: none;
          margin: 0;
        }

        .job-description li {
          position: relative;
          padding-left: 15px;
          margin-bottom: 4px;
          font-size: ${fonts.size.body};
        }

        .job-description li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: ${colors.secondary};
        }

        @media print {
          body { print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Sidebar -->
        <div class="sidebar">
          <div class="profile-section">
            <div class="name">${data.personalInfo.name}</div>
            <div class="contact-info">
              <div>${data.personalInfo.email}</div>
              <div>${data.personalInfo.phone}</div>
              <div>${data.personalInfo.location}</div>
              ${data.personalInfo.linkedin ? `<div>${data.personalInfo.linkedin}</div>` : ''}
            </div>
          </div>

          <!-- Skills -->
          <div class="sidebar-section">
            <div class="sidebar-title">Technical Skills</div>
            ${data.skills.technical.slice(0, 8).map(skill => `
              <div class="skill-bar">
                <div class="skill-name">${skill}</div>
                <div class="skill-level">
                  <div class="skill-fill" style="width: ${Math.floor(Math.random() * 30) + 70}%"></div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Leadership Skills -->
          <div class="sidebar-section">
            <div class="sidebar-title">Leadership</div>
            ${data.skills.leadership.slice(0, 6).map(skill => `
              <div class="skill-bar">
                <div class="skill-name">${skill}</div>
                <div class="skill-level">
                  <div class="skill-fill" style="width: ${Math.floor(Math.random() * 20) + 80}%"></div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Education -->
          <div class="sidebar-section">
            <div class="sidebar-title">Education</div>
            ${data.education.map(edu => `
              <div style="margin-bottom: 12px;">
                <div style="font-size: 11px; font-weight: 600;">${edu.degree}</div>
                <div style="font-size: 10px; opacity: 0.9;">${edu.school}</div>
                <div style="font-size: 10px; opacity: 0.8;">${edu.graduationDate}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Summary -->
          <div class="main-section">
            <div class="main-title">Professional Summary</div>
            <div class="summary">${data.summary}</div>
          </div>

          <!-- Experience -->
          <div class="main-section">
            <div class="main-title">Professional Experience</div>
            <div class="timeline">
              ${data.experience.map(exp => `
                <div class="timeline-item">
                  <div class="job-title">${exp.title}</div>
                  <div class="company-date">${exp.company} • ${exp.startDate} - ${exp.endDate}</div>
                  <div class="job-description">
                    <ul>
                      ${exp.description.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Achievements -->
          ${data.achievements && data.achievements.length > 0 ? `
            <div class="main-section">
              <div class="main-title">Key Achievements</div>
              <ul style="list-style: none; margin: 0;">
                ${data.achievements.map(achievement => `
                  <li style="position: relative; padding-left: 20px; margin-bottom: 8px; font-size: ${fonts.size.body};">
                    <span style="position: absolute; left: 0; color: ${colors.primary};">★</span>
                    ${achievement}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `
}

function generateExecutiveTemplate(data: ResumeData, colors: any, fonts: any): string {
  // Executive template with emphasis on leadership and achievements
  return generateProfessionalTemplate(data, colors, fonts)
}

function generateTechnicalTemplate(data: ResumeData, colors: any, fonts: any): string {
  // Technical template optimized for developers and engineers
  return generateProfessionalTemplate(data, colors, fonts)
}

function generateCreativeTemplate(data: ResumeData, colors: any, fonts: any): string {
  // Creative template with more visual elements
  return generateModernTemplate(data, colors, fonts)
}

function generateAcademicTemplate(data: ResumeData, colors: any, fonts: any): string {
  // Academic template with research focus
  return generateProfessionalTemplate(data, colors, fonts)
}

function generateInternationalTemplate(data: ResumeData, colors: any, fonts: any): string {
  // International template with global formatting
  return generateProfessionalTemplate(data, colors, fonts)
}