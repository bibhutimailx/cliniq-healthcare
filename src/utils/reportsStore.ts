import { TranscriptEntry, MedicalEntity } from '@/types/consultation';

export interface PatientReport {
  id: string;
  patientName: string;
  visitDate: string;
  visitTime: string;
  language: string;
  transcriptEntries: TranscriptEntry[];
  medicalEntities: MedicalEntity[];
  summary: {
    mainConcerns: string[];
    discussedSymptoms: string[];
    mentionedMedications: string[];
    identifiedConditions: string[];
  };
  nextSteps: string[];
  importantNotes: string[];
  status: 'draft' | 'completed' | 'archived';
  reportUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

class ReportsStore {
  private reports: PatientReport[] = [];
  private storageKey = 'clinique_patient_reports';

  constructor() {
    this.loadReports();
  }

  private loadReports() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.reports = JSON.parse(stored).map((report: any) => ({
          ...report,
          createdAt: new Date(report.createdAt),
          updatedAt: new Date(report.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      this.reports = [];
    }
  }

  private saveReports() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reports));
    } catch (error) {
      console.error('Error saving reports:', error);
    }
  }

  generateReport(
    patientName: string,
    transcriptEntries: TranscriptEntry[],
    medicalEntities: MedicalEntity[],
    detectedLanguage: string
  ): PatientReport {
    const symptoms = medicalEntities.filter(e => e.type === 'symptom');
    const medications = medicalEntities.filter(e => e.type === 'medication');
    const conditions = medicalEntities.filter(e => e.type === 'condition');

    const report: PatientReport = {
      id: `RPT_${Date.now()}`,
      patientName,
      visitDate: new Date().toLocaleDateString(),
      visitTime: new Date().toLocaleTimeString(),
      language: detectedLanguage,
      transcriptEntries,
      medicalEntities,
      summary: {
        mainConcerns: symptoms.length > 0 ? symptoms.map(s => s.text) : ['General consultation'],
        discussedSymptoms: symptoms.map(s => s.text),
        mentionedMedications: medications.map(m => m.text),
        identifiedConditions: conditions.map(c => c.text)
      },
      nextSteps: [
        'Continue taking prescribed medications as directed',
        'Monitor symptoms and report any changes',
        'Schedule follow-up appointment as recommended',
        'Contact us if you have any questions or concerns'
      ],
      importantNotes: [
        'This report is generated from your consultation with AI assistance',
        'Keep this report for your personal health records',
        'Share with family members or caregivers as needed',
        'If you have urgent concerns, contact your healthcare provider immediately'
      ],
      status: 'completed',
      reportUrl: `/report/RPT_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reports.unshift(report); // Add to beginning of array
    this.saveReports();
    return report;
  }

  getReports(): PatientReport[] {
    return [...this.reports];
  }

  getReportById(id: string): PatientReport | undefined {
    return this.reports.find(report => report.id === id);
  }

  updateReport(id: string, updates: Partial<PatientReport>): PatientReport | null {
    const index = this.reports.findIndex(report => report.id === id);
    if (index !== -1) {
      this.reports[index] = {
        ...this.reports[index],
        ...updates,
        updatedAt: new Date()
      };
      this.saveReports();
      return this.reports[index];
    }
    return null;
  }

  deleteReport(id: string): boolean {
    const index = this.reports.findIndex(report => report.id === id);
    if (index !== -1) {
      this.reports.splice(index, 1);
      this.saveReports();
      return true;
    }
    return false;
  }

  getReportsByPatient(patientName: string): PatientReport[] {
    return this.reports.filter(report => 
      report.patientName.toLowerCase().includes(patientName.toLowerCase())
    );
  }

  getReportsByLanguage(language: string): PatientReport[] {
    return this.reports.filter(report => 
      report.language.toLowerCase() === language.toLowerCase()
    );
  }

  getReportsByDateRange(startDate: Date, endDate: Date): PatientReport[] {
    return this.reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      return reportDate >= startDate && reportDate <= endDate;
    });
  }

  getReportsStats() {
    const total = this.reports.length;
    const completed = this.reports.filter(r => r.status === 'completed').length;
    const languages = [...new Set(this.reports.map(r => r.language))];
    const patients = [...new Set(this.reports.map(r => r.patientName))];

    return {
      total,
      completed,
      languages: languages.length,
      patients: patients.length,
      recentReports: this.reports.slice(0, 5) // Last 5 reports
    };
  }

  clearAllReports(): void {
    this.reports = [];
    this.saveReports();
  }

  exportReports(): string {
    return JSON.stringify(this.reports, null, 2);
  }

  importReports(reportsData: string): boolean {
    try {
      const reports = JSON.parse(reportsData);
      this.reports = reports.map((report: any) => ({
        ...report,
        createdAt: new Date(report.createdAt),
        updatedAt: new Date(report.updatedAt)
      }));
      this.saveReports();
      return true;
    } catch (error) {
      console.error('Error importing reports:', error);
      return false;
    }
  }
}

// Export singleton instance
export const reportsStore = new ReportsStore(); 