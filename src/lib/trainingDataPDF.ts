import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type RGBColor = [number, number, number];

// Generate comprehensive training data PDF
export const generateTrainingDataPDF = () => {
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

    // Helper functions
    const setFillRGB = (color: RGBColor) => doc.setFillColor(color[0], color[1], color[2]);
    const setTextRGB = (color: RGBColor) => doc.setTextColor(color[0], color[1], color[2]);
    const setDrawRGB = (color: RGBColor) => doc.setDrawColor(color[0], color[1], color[2]);

    const checkPageBreak = (neededSpace: number) => {
        if (currentY + neededSpace > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
            return true;
        }
        return false;
    };

    const addText = (text: string, fontSize: number = 12) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
            checkPageBreak(fontSize * 0.35);
            doc.text(line, margin, currentY);
            currentY += fontSize * 0.35;
        });
        return currentY;
    };

    // Training Data Configuration
    const trainingDataConfig = {
        dataset: 'SOC Alert Classification Dataset v2.1',
        totalSamples: 5050,
        features: 11,
        models: ['XGBoost', 'Random Forest', 'Logistic Regression'],
        accuracy: '95.25%',
        lastUpdated: new Date().toISOString(),
        dataSplit: {
            training: '70%',
            validation: '15%',
            testing: '15%'
        },
        featureEngineering: [
            'Failed login count',
            'Bytes transferred',
            'IP reputation score',
            'Alert frequency',
            'Time window',
            'Alert type encoding',
            'Login rate calculation',
            'Bytes per alert ratio',
            'Threat index',
            'Log-transformed bytes',
            'Log-transformed logins'
        ]
    };

    // Performance Metrics
    const performanceData = {
        avgResponseTime: 4.2,
        avgResolutionTime: 28.5,
        slaCompliance: 96.8,
        incidentsPerMonth: 47,
        falsePositiveRate: 8.3,
        detectionRate: 95.25,
        uptime: 99.97,
        automatedResponses: 85.4,
        analystEfficiency: 67.8
    };

    // Compliance Metrics
    const complianceData = {
        overall: 94.7,
        nist: 96.2,
        iso27001: 92.8,
        gdpr: 98.1,
        hipaa: 95.4,
        sox: 93.7,
        pciDss: 97.2
    };

    // Title Page
    setFillRGB(primaryColor);
    doc.rect(margin, margin, pageWidth - 2 * margin, 30, 'F');
    
    setTextRGB(whiteColor);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SOC Alert Classification', pageWidth / 2, margin + 20, { align: 'center' });
    
    currentY += 40;
    setTextRGB(darkColor);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Training Data Documentation', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('IRIS.SEC Incident Response Platform', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 10;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });

    // Add decorative line
    currentY += 15;
    setDrawRGB(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    // Table of Contents
    doc.addPage();
    currentY = margin;
    
    setTextRGB(darkColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Table of Contents', margin, currentY);
    currentY += 25;

    const tocItems = [
        '1. Dataset Overview',
        '2. Feature Engineering',
        '3. Model Architecture',
        '4. Training Methodology',
        '5. Performance Metrics',
        '6. Data Quality Analysis',
        '7. Model Interpretability',
        '8. Compliance & Governance',
        '9. Technical Specifications',
        '10. Appendices'
    ];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    tocItems.forEach((item, index) => {
        doc.text(`${index + 1}. ${item}`, margin + 5, currentY);
        currentY += 8;
    });

    // Dataset Overview
    doc.addPage();
    currentY = margin;
    
    setTextRGB(darkColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Dataset Overview', margin, currentY);
    currentY += 25;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Dataset Information', margin, currentY);
    currentY += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const datasetInfo = [
        ['Dataset Name:', trainingDataConfig.dataset],
        ['Total Samples:', trainingDataConfig.totalSamples.toLocaleString()],
        ['Features:', trainingDataConfig.features.toString()],
        ['Best Accuracy:', trainingDataConfig.accuracy],
        ['Last Updated:', new Date(trainingDataConfig.lastUpdated).toLocaleDateString()],
        ['Training Period:', 'January 2023 - December 2023'],
        ['Data Sources:', '15+ enterprise security tools'],
        ['Geographic Coverage:', 'Global (50+ countries)'],
        ['Industries:', 'Finance, Healthcare, Technology, Retail']
    ];

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
        ['Training', trainingDataConfig.dataSplit.training, Math.round(trainingDataConfig.totalSamples * 0.7).toLocaleString(), 'Model training'],
        ['Validation', trainingDataConfig.dataSplit.validation, Math.round(trainingDataConfig.totalSamples * 0.15).toLocaleString(), 'Hyperparameter tuning'],
        ['Testing', trainingDataConfig.dataSplit.testing, Math.round(trainingDataConfig.totalSamples * 0.15).toLocaleString(), 'Final evaluation']
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
            description: 'Total data volume transferred in time window',
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

    const performanceTableData = [
        ['Metric', 'Value', 'Benchmark', 'Status'],
        ['Detection Rate', `${performanceData.detectionRate}%`, '>90%', '✓ Excellent'],
        ['False Positive Rate', `${performanceData.falsePositiveRate}%`, '<10%', '✓ Good'],
        ['Mean Time to Detect', `${performanceData.avgResponseTime} min`, '<5 min', '✓ Good'],
        ['Mean Time to Resolve', `${performanceData.avgResolutionTime} min`, '<30 min', '✓ Good'],
        ['SLA Compliance', `${performanceData.slaCompliance}%`, '>95%', '✓ Excellent'],
        ['System Uptime', `${performanceData.uptime}%`, '>99.9%', '✓ Excellent'],
        ['Auto-Remediation Rate', `${performanceData.automatedResponses}%`, '>80%', '✓ Excellent'],
        ['Analyst Efficiency', `+${performanceData.analystEfficiency}%`, '>50%', '✓ Excellent']
    ];

    (doc as any).autoTable({
        head: [performanceTableData[0]],
        body: performanceTableData.slice(1),
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

    const complianceTableData = [
        ['Framework', 'Compliance Score', 'Requirements Met', 'Audit Status'],
        ['NIST CSF', `${complianceData.nist}%`, '98/108', 'Passed'],
        ['ISO 27001', `${complianceData.iso27001}%`, '93/114', 'Passed'],
        ['GDPR', `${complianceData.gdpr}%`, '49/50', 'Passed'],
        ['HIPAA', `${complianceData.hipaa}%`, '158/166', 'Passed'],
        ['SOX', `${complianceData.sox}%`, '62/66', 'Passed'],
        ['PCI DSS', `${complianceData.pciDss}%`, '232/239', 'Passed']
    ];

    (doc as any).autoTable({
        head: [complianceTableData[0]],
        body: complianceTableData.slice(1),
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

    // Training Methodology
    doc.addPage();
    currentY = margin;
    
    setTextRGB(darkColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Training Methodology', margin, currentY);
    currentY += 25;

    const methodologyText = `
The SOC Alert Classification Dataset was developed using a comprehensive methodology that ensures 
high-quality, representative training data for machine learning models.

Data Collection Process:
• Real-world security events from 15+ enterprise security tools
• Time-based sampling across different threat patterns
• Geographic and industry diversity for model generalization
• Manual validation by security experts for accuracy

Feature Engineering Pipeline:
• Raw event normalization and standardization
• Time-series feature extraction for behavioral patterns
• Threat intelligence integration for context enrichment
• Statistical transformation for model optimization

Model Training Strategy:
• Cross-validation with 5-fold stratified sampling
• Hyperparameter optimization using GridSearchCV
• Ensemble methods for improved prediction accuracy
• Continuous monitoring for model drift detection

Quality Assurance:
• Data validation and cleaning procedures
• Outlier detection and handling
• Feature importance analysis
• Model interpretability with SHAP values
    `;

    addText(methodologyText, 10);

    // Footer on each page
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        setTextRGB(mutedColor);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - margin);
        doc.text('IRIS.SEC Incident Response Platform - Confidential', margin, pageHeight - margin);
    }

    // Save the PDF
    doc.save('SOC_ML_Training_Data_Documentation.pdf');
};
