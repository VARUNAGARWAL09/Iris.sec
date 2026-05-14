import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ThreatType {
    name: string;
    category: string;
    severity: string;
    indicators: string[];
    response: string[];
    mitre: string[];
}

interface SeverityLevel {
    level: string;
    score: string;
    description: string;
    sla: string;
    actions: string[];
}

type RGBColor = [number, number, number];

export const generateDocumentationPDF = (
    threatTypes: ThreatType[],
    severityLevels: SeverityLevel[]
) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const primaryColor: RGBColor = [16, 185, 129];
    const darkColor: RGBColor = [15, 23, 42];
    const mutedColor: RGBColor = [100, 116, 139];
    const whiteColor: RGBColor = [255, 255, 255];
    const lightGray: RGBColor = [248, 250, 252];

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    // Helper to set RGB color
    const setFillRGB = (color: RGBColor) => doc.setFillColor(color[0], color[1], color[2]);
    const setTextRGB = (color: RGBColor) => doc.setTextColor(color[0], color[1], color[2]);
    const setDrawRGB = (color: RGBColor) => doc.setDrawColor(color[0], color[1], color[2]);

    // Helper function to add new page if needed
    const checkPageBreak = (neededSpace: number) => {
        if (currentY + neededSpace > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
            return true;
        }
        return false;
    };

    // Helper function to add footer
    const addFooter = (pageNum: number) => {
        doc.setFontSize(8);
        setTextRGB(mutedColor);
        doc.text(
            'IRIS Security Operations Center - Confidential',
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.text(
            `Page ${pageNum}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
        );
    };

    // ===== COVER PAGE =====
    setFillRGB(primaryColor);
    doc.rect(0, 0, pageWidth, 80, 'F');

    setFillRGB(whiteColor);
    doc.circle(pageWidth / 2, 40, 15, 'F');
    doc.setFontSize(20);
    setTextRGB(primaryColor);
    doc.text('🛡️', pageWidth / 2, 43, { align: 'center' });

    doc.setFontSize(28);
    setTextRGB(whiteColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Security Operations Center', pageWidth / 2, 100, { align: 'center' });

    doc.setFontSize(22);
    doc.text('Threat Detection & Response', pageWidth / 2, 115, { align: 'center' });
    doc.text('Documentation', pageWidth / 2, 130, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    setTextRGB(darkColor);
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Version 2.4.0`, pageWidth / 2, 155, { align: 'center' });
    doc.text(`Generated: ${currentDate}`, pageWidth / 2, 165, { align: 'center' });

    setDrawRGB(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, 175, pageWidth - margin, 175);

    doc.setFontSize(10);
    setTextRGB(mutedColor);
    doc.text('INTERNAL USE ONLY - CONFIDENTIAL', pageWidth / 2, pageHeight - 30, {
        align: 'center'
    });

    addFooter(1);

    // ===== Page 2: TABLE OF CONTENTS =====
    doc.addPage();
    currentY = margin;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    setTextRGB(darkColor);
    doc.text('Table of Contents', margin, currentY);
    currentY += 15;

    const tocItems = [
        { title: '1. System Overview', page: 3 },
        { title: '2. Platform Features', page: 4 },
        { title: '3. Severity Classification & SLAs', page: 5 },
        { title: '4. Threat Detection Categories', page: 6 },
        { title: '5. Risk Scoring Methodology', page: `${6 + threatTypes.length}` },
        { title: '6. Escalation Contacts', page: `${7 + threatTypes.length}` }
    ];

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    tocItems.forEach(item => {
        setTextRGB(darkColor);
        doc.text(item.title, margin + 5, currentY);
        setTextRGB(mutedColor);
        doc.text(String(item.page), pageWidth - margin - 10, currentY, { align: 'right' });
        currentY += 8;
    });

    addFooter(2);

    // ===== Page 3: SYSTEM OVERVIEW =====
    doc.addPage();
    currentY = margin;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    setTextRGB(primaryColor);
    doc.text('1. System Overview', margin, currentY);
    currentY += 12;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    setTextRGB(darkColor);
    const overviewText = `The IRIS Incident Response Platform is a comprehensive Security Operations Center (SOC) solution that provides real-time threat detection, automated analysis, and incident management capabilities.`;

    const splitOverview = doc.splitTextToSize(overviewText, pageWidth - 2 * margin);
    doc.text(splitOverview, margin, currentY);
    currentY += splitOverview.length * 6 + 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setTextRGB(primaryColor);
    doc.text('Key Capabilities', margin, currentY);
    currentY += 10;

    const features = [
        { title: 'Real-Time Detection', desc: 'Continuous monitoring with 15+ threat indicators' },
        { title: 'Auto-Escalation', desc: 'Critical alerts automatically escalate to incidents' },
        { title: 'Team Coordination', desc: 'Real-time collaboration with assignment tracking' },
        { title: 'AI Assistant (IRIS)', desc: 'Intelligent chatbot for operational insights' }
    ];

    features.forEach(feature => {
        checkPageBreak(15);

        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, 12, 2, 2, 'F');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setTextRGB(darkColor);
        doc.text(`• ${feature.title}`, margin + 3, currentY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setTextRGB(mutedColor);
        doc.text(feature.desc, margin + 3, currentY + 5);

        currentY += 17;
    });

    addFooter(3);

    // ===== Page 4: PLATFORM FEATURES =====
    doc.addPage();
    currentY = margin;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    setTextRGB(primaryColor);
    doc.text('2. Platform Features', margin, currentY);
    currentY += 12;

    doc.setFontSize(14);
    setTextRGB(darkColor);
    doc.text('Team Management', margin, currentY);
    currentY += 8;

    const teamFeatures = [
        'View Modes: Grid and list views',
        'Live Status: Real-time tracking',
        'Role Management: Admin, Analyst, Viewer',
        'Team Analytics: Statistics and assignments'
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    teamFeatures.forEach(feat => {
        setTextRGB(darkColor);
        doc.text('✓', margin + 2, currentY);
        setTextRGB(mutedColor);
        doc.text(feat, margin + 8, currentY);
        currentY += 6;
    });

    currentY += 5;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setTextRGB(darkColor);
    doc.text('IRIS AI Assistant', margin, currentY);
    currentY += 8;

    const aiFeatures = [
        'Incident Lookup by case number',
        'Search & Filter capabilities',
        'Alert Monitoring',
        'System Status checks',
        'Quick dashboard summaries'
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    aiFeatures.forEach(feat => {
        setTextRGB(darkColor);
        doc.text('✓', margin + 2, currentY);
        setTextRGB(mutedColor);
        doc.text(feat, margin + 8, currentY);
        currentY += 6;
    });

    addFooter(4);

    // ===== Page 5: SEVERITY LEVELS =====
    doc.addPage();
    currentY = margin;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    setTextRGB(primaryColor);
    doc.text('3. Severity Classification & SLAs', margin, currentY);
    currentY += 12;

    autoTable(doc, {
        startY: currentY,
        head: [['Level', 'Score', 'SLA', 'Description']],
        body: severityLevels.map(level => [
            level.level,
            level.score,
            level.sla,
            level.description
        ]),
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            fontSize: 10,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 9,
            textColor: darkColor
        },
        margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    addFooter(5);

    // ===== THREAT TYPES =====
    let pageNum = 6;
    threatTypes.forEach((threat, index) => {
        doc.addPage();
        currentY = margin;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        setTextRGB(primaryColor);
        doc.text(`${index + 1}. ${threat.name}`, margin, currentY);
        currentY += 10;

        const getSeverityColor = (sev: string): RGBColor => {
            switch (sev) {
                case 'critical': return [220, 38, 38];
                case 'high': return [234, 88, 12];
                case 'medium': return [234, 179, 8];
                default: return [100, 116, 139];
            }
        };

        const severityColor = getSeverityColor(threat.severity);
        setFillRGB(severityColor);
        doc.roundedRect(margin, currentY, 30, 6, 1, 1, 'F');
        setTextRGB(whiteColor);
        doc.setFontSize(10);
        doc.text(threat.severity.toUpperCase(), margin + 15, currentY + 4, { align: 'center' });

        currentY += 12;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        setTextRGB(darkColor);
        doc.text('Detection Indicators', margin, currentY);
        currentY += 7;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        setTextRGB(mutedColor);
        threat.indicators.forEach(indicator => {
            checkPageBreak(8);
            const indicatorLines = doc.splitTextToSize(`• ${indicator}`, pageWidth - 2 * margin - 5);
            doc.text(indicatorLines, margin + 2, currentY);
            currentY += indicatorLines.length * 5;
        });
        currentY += 5;

        checkPageBreak(15);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        setTextRGB(darkColor);
        doc.text('Response Procedures', margin, currentY);
        currentY += 7;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        setTextRGB(mutedColor);
        threat.response.forEach((step, i) => {
            checkPageBreak(8);
            const stepLines = doc.splitTextToSize(`${i + 1}. ${step}`, pageWidth - 2 * margin - 5);
            doc.text(stepLines, margin + 2, currentY);
            currentY += stepLines.length * 5;
        });

        addFooter(pageNum);
        pageNum++;
    });

    // ===== RISK SCORING =====
    doc.addPage();
    currentY = margin;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    setTextRGB(primaryColor);
    doc.text('5. Risk Scoring Methodology', margin, currentY);
    currentY += 12;

    autoTable(doc, {
        startY: currentY,
        head: [['Category', 'Examples', 'Max Impact']],
        body: [
            ['Network Anomalies', 'Data transfer, port scanning', '+35 points'],
            ['Authentication', 'Failed logins, impossible travel', '+40 points'],
            ['Endpoint Behavior', 'File encryption, escalation', '+50 points'],
            ['Threat Intel', 'Hash matches, domain age', '+50 points'],
            ['Email Security', 'SPF/DKIM, suspicious links', '+25 points']
        ],
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            fontSize: 10
        },
        bodyStyles: {
            fontSize: 9
        },
        margin: { left: margin, right: margin }
    });

    addFooter(pageNum);

    // ===== ESCALATION CONTACTS =====
    doc.addPage();
    pageNum++;
    currentY = margin;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    setTextRGB(primaryColor);
    doc.text('6. Escalation Contacts', margin, currentY);
    currentY += 12;

    const contacts = [
        { tier: 'Tier 1 - SOC Analysts', email: 'soc-team@company.com' },
        { tier: 'Tier 2 - Security Engineers', email: 'security-engineers@company.com' },
        { tier: 'Tier 3 - Incident Response', email: 'ir-team@company.com' },
        { tier: 'Management', email: 'ciso@company.com' }
    ];

    contacts.forEach(contact => {
        setFillRGB(lightGray);
        doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 12, 2, 2, 'F');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setTextRGB(darkColor);
        doc.text(contact.tier, margin + 3, currentY + 4);

        doc.setFont('helvetica', 'italic');
        setTextRGB(primaryColor);
        doc.setFontSize(9);
        doc.text(contact.email, margin + 3, currentY + 9);

        currentY += 17;

  datasetInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, currentY);
    currentY += 8;
  });

  // Data Split Table
  currentY += 10;
  checkPageBreak(40);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Data Distribution', margin, currentY);
  currentY += 15;

  const splitData = [
    ['Split', 'Percentage', 'Samples', 'Purpose'],
    ['Training', trainingData.dataSplit.training, Math.round(trainingData.totalSamples * 0.7).toLocaleString(), 'Model training'],
    ['Validation', trainingData.dataSplit.validation, Math.round(trainingData.totalSamples * 0.15).toLocaleString(), 'Hyperparameter tuning'],
    ['Testing', trainingData.dataSplit.testing, Math.round(trainingData.totalSamples * 0.15).toLocaleString(), 'Final evaluation']
  ];

  (doc as any).autoTable({
    head: [splitData[0]],
    body: splitData.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: primaryColor, textColor: whiteColor },
    alternateRowStyles: { fillColor: lightGray }
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;

  // Feature Engineering Section
  doc.addPage();
  currentY = margin;
  
  setTextRGB(darkColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Feature Engineering', margin, currentY);
  currentY += 25;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Engineered Features', margin, currentY);
  currentY += 15;

  const featureDetails = [
    {
      name: 'Failed Login Count',
      description: 'Number of unsuccessful authentication attempts',
      type: 'Numeric',
      range: '0-100',
      importance: 'High'
    },
    {
      name: 'Bytes Transferred',
      description: 'Total data volume transferred in the time window',
      type: 'Numeric',
      range: '0-10GB',
      importance: 'High'
    },
    {
      name: 'IP Reputation Score',
      description: 'Threat intelligence score for source IP',
      type: 'Numeric',
      range: '0-1',
      importance: 'High'
    },
    {
      name: 'Alert Frequency',
      description: 'Number of alerts from same source',
      type: 'Numeric',
      range: '0-50',
      importance: 'Medium'
    },
    {
      name: 'Time Window',
      description: 'Analysis time period in minutes',
      type: 'Numeric',
      range: '5-60',
      importance: 'Medium'
    }
  ];

  featureDetails.forEach((feature, index) => {
    checkPageBreak(50);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${feature.name}`, margin, currentY);
    currentY += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Description: ${feature.description}`, margin + 5, currentY);
    currentY += 6;
    doc.text(`Type: ${feature.type} | Range: ${feature.range} | Importance: ${feature.importance}`, margin + 5, currentY);
    currentY += 10;
  });

  // Model Architecture
  doc.addPage();
  currentY = margin;
  
  setTextRGB(darkColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Model Architecture', margin, currentY);
  currentY += 25;

  const modelData = [
    ['Model', 'Accuracy', 'Precision', 'Recall', 'F1-Score', 'Inference Time'],
    ['XGBoost', '95.25%', '95.30%', '95.20%', '95.24%', '15.2ms'],
    ['Random Forest', '93.56%', '93.80%', '93.32%', '93.56%', '12.8ms'],
    ['Logistic Regression', '95.25%', '95.40%', '95.10%', '95.25%', '8.5ms'],
    ['Ensemble (Weighted)', '95.48%', '95.52%', '95.44%', '95.48%', '18.3ms']
  ];

  (doc as any).autoTable({
    head: [modelData[0]],
    body: modelData.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: primaryColor, textColor: whiteColor },
    alternateRowStyles: { fillColor: lightGray }
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFont('helvetica', 'bold');
  doc.text('Ensemble Weights:', margin, currentY);
  currentY += 10;
  
  const weights = [
    ['Model', 'Weight', 'Role'],
    ['XGBoost', '50%', 'Primary decision maker'],
    ['Random Forest', '30%', 'Pattern recognition support'],
    ['Logistic Regression', '20%', 'Baseline calibration']
  ];

  (doc as any).autoTable({
    head: [weights[0]],
    body: weights.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [34, 197, 94], textColor: whiteColor },
    alternateRowStyles: { fillColor: lightGray }
  });

  // Performance Metrics
  doc.addPage();
  currentY = margin;
  
  setTextRGB(darkColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Performance Metrics', margin, currentY);
  currentY += 25;

  const performanceData = [
    ['Metric', 'Value', 'Benchmark', 'Status'],
    ['Detection Rate', `${performanceMetrics.detectionRate}%`, '>90%', '✓ Excellent'],
    ['False Positive Rate', `${performanceMetrics.falsePositiveRate}%`, '<10%', '✓ Good'],
    ['Mean Time to Detect', `${performanceMetrics.avgResponseTime} min`, '<5 min', '✓ Good'],
    ['Mean Time to Resolve', `${performanceMetrics.avgResolutionTime} min`, '<30 min', '✓ Good'],
    ['SLA Compliance', `${performanceMetrics.slaCompliance}%`, '>95%', '✓ Excellent'],
    ['System Uptime', `${performanceMetrics.uptime}%`, '>99.9%', '✓ Excellent'],
    ['Auto-Remediation Rate', `${performanceMetrics.automatedResponses}%`, '>80%', '✓ Excellent'],
    ['Analyst Efficiency', `+${performanceMetrics.analystEfficiency}%`, '>50%', '✓ Excellent']
  ];

  (doc as any).autoTable({
    head: [performanceData[0]],
    body: performanceData.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: primaryColor, textColor: whiteColor },
    alternateRowStyles: { fillColor: lightGray }
  });

  // Compliance Metrics
  doc.addPage();
  currentY = margin;
  
  setTextRGB(darkColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('8. Compliance & Governance', margin, currentY);
  currentY += 25;

  const complianceData = [
    ['Framework', 'Compliance Score', 'Requirements Met', 'Audit Status'],
    ['NIST CSF', `${complianceMetrics.nist}%`, '98/108', 'Passed'],
    ['ISO 27001', `${complianceMetrics.iso27001}%`, '93/114', 'Passed'],
    ['GDPR', `${complianceMetrics.gdpr}%`, '49/50', 'Passed'],
    ['HIPAA', `${complianceMetrics.hipaa}%`, '158/166', 'Passed'],
    ['SOX', `${complianceMetrics.sox}%`, '62/66', 'Passed'],
    ['PCI DSS', `${complianceMetrics.pciDss}%`, '232/239', 'Passed']
  ];

  (doc as any).autoTable({
    head: [complianceData[0]],
    body: complianceData.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [34, 197, 94], textColor: whiteColor },
    alternateRowStyles: { fillColor: lightGray }
  });

  // Technical Specifications
  doc.addPage();
  currentY = margin;
  
  setTextRGB(darkColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('9. Technical Specifications', margin, currentY);
  currentY += 25;

  const techSpecs = [
    ['Component', 'Specification'],
    ['ML Framework', 'XGBoost 1.7.6, Scikit-learn 1.3.0'],
    ['Hardware', 'Intel Xeon E5-2690 v4, 32GB RAM, NVIDIA Tesla V100'],
    ['Processing', 'GPU-accelerated inference'],
    ['API Response Time', '<50ms (P99)'],
    ['Concurrent Users', '1000+'],
    ['Data Storage', 'PostgreSQL 14 with TimescaleDB'],
    ['Cache Layer', 'Redis 7.0 with 5-minute TTL'],
    ['Monitoring', 'Prometheus + Grafana'],
    ['Deployment', 'Kubernetes on AWS EKS']
  ];

  (doc as any).autoTable({
    head: [techSpecs[0]],
    body: techSpecs.slice(1),
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [168, 85, 247], textColor: whiteColor },
    alternateRowStyles: { fillColor: lightGray }
  });

  // Footer on each page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setTextRGB(mutedColor);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - margin);
    doc.text('IRIS.SEC Incident Response Platform - Confidential', margin, pageHeight - margin);
  }

  // Save the PDF
  doc.save('IRIS_SEC_Documentation.pdf');
};
