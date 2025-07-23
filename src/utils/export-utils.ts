import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CompensationPackage, CompensationCalculation } from '@/types';

// PDF Export functionality
export const exportToPDF = async (elementId: string, fileName: string = 'compensation-report.pdf'): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for PDF export');
  }

  try {
    // Create canvas from element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

// Generate detailed PDF report with multiple sections
export const generateDetailedPDFReport = async (
  package_: CompensationPackage,
  calculation: CompensationCalculation | null,
  fileName: string = 'detailed-compensation-report.pdf'
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  let yPosition = 20;

  // Helper function to add text with proper spacing
  const addText = (text: string, size: number = 12, style: 'normal' | 'bold' = 'normal') => {
    pdf.setFontSize(size);
    pdf.setFont('helvetica', style);
    pdf.text(text, 20, yPosition);
    yPosition += size * 0.5;
  };

  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Title
  addText('🇮🇱 Israeli Tech Compensation Report', 20, 'bold');
  yPosition += 10;

  // Package Info
  addText(`Package: ${package_.name}`, 14, 'bold');
  addText(`Generated: ${new Date().toLocaleDateString('en-IL')}`, 10);
  yPosition += 10;

  // Salary Section
  checkNewPage();
  addText('💰 SALARY BREAKDOWN', 16, 'bold');
  yPosition += 5;
  
  const annualSalary = package_.salary.frequency === 'monthly' 
    ? package_.salary.baseSalary * 12 
    : package_.salary.baseSalary;
  
  addText(`Base Salary: ${package_.salary.currency} ${package_.salary.baseSalary.toLocaleString()} (${package_.salary.frequency})`);
  addText(`Annual Equivalent: ₪${annualSalary.toLocaleString()}`);
  
  if (package_.salary.bonus) {
    addText(`Bonus: ${package_.salary.currency} ${package_.salary.bonus.amount.toLocaleString()} (${package_.salary.bonus.frequency})`);
    addText(`Guaranteed: ${package_.salary.bonus.guaranteed ? 'Yes' : 'No'}`);
  }
  yPosition += 10;

  // Benefits Section
  checkNewPage();
  addText('📈 BENEFITS', 16, 'bold');
  yPosition += 5;
  
  addText(`Pension Fund: Employee ${package_.benefits.pensionFund.employeeContribution}%, Employer ${package_.benefits.pensionFund.employerContribution}%`);
  addText(`Study Fund: Employee ${package_.benefits.studyFund.employeeContribution}%, Employer ${package_.benefits.studyFund.employerContribution}%`);
  addText(`Health Insurance: ${package_.benefits.healthInsurance.coverage} (₪${package_.benefits.healthInsurance.employerContribution}/month)`);
  addText(`Vacation Days: ${package_.benefits.vacationDays} days`);
  addText(`Sick Days: ${package_.benefits.sickDays}`);
  addText(`Parental Leave: ${package_.benefits.parentalLeave} extra days`);
  yPosition += 10;

  // Perks Section
  checkNewPage();
  addText('🎁 PERKS & BENEFITS', 16, 'bold');
  yPosition += 5;
  
  if (package_.perks.laptop.provided) {
    addText(`Laptop Provided: ₪${(package_.perks.laptop.annualValue || 0).toLocaleString()}/year value`);
  }
  if (package_.perks.meals.value > 0) {
    addText(`Meals: ${package_.perks.meals.type} - ₪${package_.perks.meals.value}/month`);
  }
  if (package_.perks.transportation > 0) {
    addText(`Transportation: ₪${package_.perks.transportation}/month`);
  }
  if (package_.perks.internetStipend > 0) {
    addText(`Internet Stipend: ₪${package_.perks.internetStipend}/month`);
  }
  if (package_.perks.phoneStipend > 0) {
    addText(`Phone Stipend: ₪${package_.perks.phoneStipend}/month`);
  }
  if (package_.perks.gymMembership > 0) {
    addText(`Gym Membership: ₪${package_.perks.gymMembership}/month`);
  }
  if (package_.perks.learningBudget > 0) {
    addText(`Learning Budget: ₪${package_.perks.learningBudget}/year`);
  }
  
  addText(`Remote Work: ${package_.perks.flexibleWork.remoteAllowed ? `Yes (${package_.perks.flexibleWork.hybridDays} days/week)` : 'No'}`);
  yPosition += 10;

  // Calculation Results (if available)
  if (calculation) {
    checkNewPage();
    addText('📊 CALCULATION RESULTS', 16, 'bold');
    yPosition += 5;
    
    addText(`Total Annual Compensation: ₪${calculation.totalAnnualCompensation.toLocaleString()}`);
    addText(`Net Compensation: ₪${calculation.netCompensation.toLocaleString()}`);
    yPosition += 5;
    
    addText('Breakdown:', 14, 'bold');
    addText(`• Base Salary: ₪${calculation.breakdown.baseSalary.gross.toLocaleString()} gross, ₪${calculation.breakdown.baseSalary.net.toLocaleString()} net`);
    addText(`• Benefits: ₪${calculation.breakdown.benefits.gross.toLocaleString()} gross, ₪${calculation.breakdown.benefits.net.toLocaleString()} net`);
    addText(`• Equity: ₪${calculation.breakdown.equity.gross.toLocaleString()} gross, ₪${calculation.breakdown.equity.net.toLocaleString()} net`);
    addText(`• Perks: ₪${calculation.breakdown.perks.gross.toLocaleString()} gross, ₪${calculation.breakdown.perks.net.toLocaleString()} net`);
    yPosition += 10;

    // Tax Information
    addText('🏛️ TAX BREAKDOWN', 14, 'bold');
    addText(`Income Tax: ₪${calculation.taxImplications.incomeTax.toLocaleString()}`);
    addText(`Bituach Leumi: ₪${calculation.taxImplications.bituachLeumi.toLocaleString()}`);
    addText(`Pension Contributions: ₪${calculation.taxImplications.pensionContributions.toLocaleString()}`);
    addText(`Total Deductions: ₪${calculation.taxImplications.totalDeductions.toLocaleString()}`);
    addText(`Effective Tax Rate: ${(calculation.taxImplications.effectiveTaxRate * 100).toFixed(1)}%`);
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Generated by Israeli Tech Compensation Calculator', pageWidth / 2, pageHeight - 10, { align: 'center' });
  pdf.text('Disclaimer: This calculator is for educational purposes only. Consult a tax professional for official advice.', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // Save the PDF
  pdf.save(fileName);
};

// JSON Export functionality
export const exportToJSON = (package_: CompensationPackage, calculation?: CompensationCalculation | null): void => {
  const exportData = {
    package: package_,
    calculation: calculation,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${package_.name.replace(/\s+/g, '-').toLowerCase()}-compensation.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// CSV Export functionality
export const exportToCSV = (package_: CompensationPackage, calculation?: CompensationCalculation | null): void => {
  const rows: string[][] = [
    ['Israeli Tech Compensation Report'],
    [''],
    ['Package Name', package_.name],
    ['Generated', new Date().toLocaleDateString('en-IL')],
    [''],
    ['SALARY'],
    ['Base Salary', `${package_.salary.currency} ${package_.salary.baseSalary.toLocaleString()} (${package_.salary.frequency})`],
  ];

  if (package_.salary.bonus) {
    rows.push(['Bonus', `${package_.salary.currency} ${package_.salary.bonus.amount.toLocaleString()} (${package_.salary.bonus.frequency})`]);
    rows.push(['Bonus Guaranteed', package_.salary.bonus.guaranteed ? 'Yes' : 'No']);
  }

  rows.push(
    [''],
    ['BENEFITS'],
    ['Pension Employee %', package_.benefits.pensionFund.employeeContribution.toString()],
    ['Pension Employer %', package_.benefits.pensionFund.employerContribution.toString()],
    ['Study Fund Employee %', package_.benefits.studyFund.employeeContribution.toString()],
    ['Study Fund Employer %', package_.benefits.studyFund.employerContribution.toString()],
    ['Health Insurance Coverage', package_.benefits.healthInsurance.coverage],
    ['Health Insurance Contribution', `₪${package_.benefits.healthInsurance.employerContribution}/month`],
    ['Vacation Days', package_.benefits.vacationDays.toString()],
    ['Sick Days', package_.benefits.sickDays.toString()],
    ['Parental Leave', `${package_.benefits.parentalLeave} days`],
    [''],
    ['PERKS'],
    ['Laptop Provided', package_.perks.laptop.provided ? 'Yes' : 'No'],
    ['Laptop Annual Value', `₪${package_.perks.laptop.annualValue || 0}`],
    ['Meals Type', package_.perks.meals.type],
    ['Meals Value', `₪${package_.perks.meals.value}/month`],
    ['Transportation', `₪${package_.perks.transportation}/month`],
    ['Internet Stipend', `₪${package_.perks.internetStipend}/month`],
    ['Phone Stipend', `₪${package_.perks.phoneStipend}/month`],
    ['Gym Membership', `₪${package_.perks.gymMembership}/month`],
    ['Learning Budget', `₪${package_.perks.learningBudget}/year`],
    ['Remote Work Allowed', package_.perks.flexibleWork.remoteAllowed ? 'Yes' : 'No'],
    ['Hybrid Days per Week', (package_.perks.flexibleWork.hybridDays || 0).toString()]
  );

  if (calculation) {
    rows.push(
      [''],
      ['CALCULATION RESULTS'],
      ['Total Annual Compensation', `₪${calculation.totalAnnualCompensation.toLocaleString()}`],
      ['Net Compensation', `₪${calculation.netCompensation.toLocaleString()}`],
      [''],
      ['BREAKDOWN'],
      ['Base Salary Gross', `₪${calculation.breakdown.baseSalary.gross.toLocaleString()}`],
      ['Base Salary Net', `₪${calculation.breakdown.baseSalary.net.toLocaleString()}`],
      ['Benefits Gross', `₪${calculation.breakdown.benefits.gross.toLocaleString()}`],
      ['Benefits Net', `₪${calculation.breakdown.benefits.net.toLocaleString()}`],
      ['Equity Gross', `₪${calculation.breakdown.equity.gross.toLocaleString()}`],
      ['Equity Net', `₪${calculation.breakdown.equity.net.toLocaleString()}`],
      ['Perks Gross', `₪${calculation.breakdown.perks.gross.toLocaleString()}`],
      ['Perks Net', `₪${calculation.breakdown.perks.net.toLocaleString()}`],
      [''],
      ['TAX BREAKDOWN'],
      ['Income Tax', `₪${calculation.taxImplications.incomeTax.toLocaleString()}`],
      ['Bituach Leumi', `₪${calculation.taxImplications.bituachLeumi.toLocaleString()}`],
      ['Pension Contributions', `₪${calculation.taxImplications.pensionContributions.toLocaleString()}`],
      ['Total Deductions', `₪${calculation.taxImplications.totalDeductions.toLocaleString()}`],
      ['Effective Tax Rate', `${(calculation.taxImplications.effectiveTaxRate * 100).toFixed(1)}%`]
    );
  }

  // Convert to CSV format
  const csvContent = rows.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  // Create and download file
  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${package_.name.replace(/\s+/g, '-').toLowerCase()}-compensation.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import JSON functionality
export const importFromJSON = (file: File): Promise<{ package: CompensationPackage; calculation?: CompensationCalculation }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the imported data structure
        if (!data.package || !data.package.id || !data.package.name) {
          throw new Error('Invalid compensation package format');
        }
        
        resolve({
          package: data.package,
          calculation: data.calculation || null
        });
      } catch (error) {
        reject(new Error('Failed to parse JSON file: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// Utility to format currency for exports
export const formatCurrencyForExport = (amount: number, currency: 'ILS' | 'USD' = 'ILS'): string => {
  const symbol = currency === 'ILS' ? '₪' : '$';
  return `${symbol}${amount.toLocaleString()}`;
};

// Utility to generate export filename
export const generateExportFilename = (packageName: string, type: 'pdf' | 'json' | 'csv'): string => {
  const cleanName = packageName.replace(/\s+/g, '-').toLowerCase();
  const timestamp = new Date().toISOString().split('T')[0];
  return `${cleanName}-compensation-${timestamp}.${type}`;
}; 