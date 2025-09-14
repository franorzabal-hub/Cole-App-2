import { apiClient, queries, Report } from '../config/api';
import { AuthService } from './auth.service';

export class ReportsService {
  /**
   * Get reports for user's children
   */
  static async getReports(
    studentId?: string,
    type?: 'grade_report' | 'behavior_report' | 'attendance_report' | 'general_report'
  ): Promise<Report[]> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return [];

      const response = await apiClient.graphql(queries.GET_REPORTS, {
        tenantId,
        studentId,
        type,
      });

      return response.reports || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  /**
   * Get single report
   */
  static async getReportById(reportId: string): Promise<Report | null> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return null;

      const response = await apiClient.graphql(queries.GET_REPORT, {
        id: reportId,
        tenantId,
      });

      return response.report || null;
    } catch (error) {
      console.error('Error fetching report:', error);
      return null;
    }
  }

  /**
   * Get reports by type
   */
  static async getReportsByType(
    type: 'grade_report' | 'behavior_report' | 'attendance_report' | 'general_report'
  ): Promise<Report[]> {
    try {
      return await this.getReports(undefined, type);
    } catch (error) {
      console.error('Error fetching reports by type:', error);
      return [];
    }
  }

  /**
   * Get reports for a specific period
   */
  static async getReportsByPeriod(
    period: string,
    studentId?: string
  ): Promise<Report[]> {
    try {
      const reports = await this.getReports(studentId);
      return reports.filter(report => report.period === period);
    } catch (error) {
      console.error('Error fetching reports by period:', error);
      return [];
    }
  }

  /**
   * Get latest report for each student
   */
  static async getLatestReports(): Promise<Report[]> {
    try {
      const students = await AuthService.getUserChildren();
      const reports: Report[] = [];

      for (const student of students) {
        const studentReports = await this.getReports(student.id);
        if (studentReports.length > 0) {
          // Sort by creation date and get the latest
          const latestReport = studentReports.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          reports.push(latestReport);
        }
      }

      return reports;
    } catch (error) {
      console.error('Error fetching latest reports:', error);
      return [];
    }
  }

  /**
   * Download report file
   */
  static async downloadReport(reportId: string): Promise<string | null> {
    try {
      const report = await this.getReportById(reportId);
      return report?.fileUrl || null;
    } catch (error) {
      console.error('Error downloading report:', error);
      return null;
    }
  }

  /**
   * Get report statistics for a student
   */
  static async getStudentReportStats(studentId: string): Promise<any> {
    try {
      const reports = await this.getReports(studentId);

      const stats = {
        total: reports.length,
        byType: {
          grade_report: 0,
          behavior_report: 0,
          attendance_report: 0,
          general_report: 0,
        },
        lastReport: null as Date | null,
      };

      if (reports.length > 0) {
        reports.forEach(report => {
          stats.byType[report.type]++;
        });

        stats.lastReport = new Date(
          Math.max(...reports.map(r => new Date(r.createdAt).getTime()))
        );
      }

      return stats;
    } catch (error) {
      console.error('Error fetching report stats:', error);
      return null;
    }
  }

  /**
   * Get recent reports (last 30 days)
   */
  static async getRecentReports(): Promise<Report[]> {
    try {
      const allReports = await this.getReports();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return allReports.filter(report =>
        new Date(report.createdAt) >= thirtyDaysAgo
      );
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      return [];
    }
  }

  /**
   * Get report periods
   */
  static async getAvailablePeriods(studentId?: string): Promise<string[]> {
    try {
      const reports = await this.getReports(studentId);

      // Get unique periods
      const periods = [...new Set(reports
        .map(r => r.period)
        .filter(period => period !== null && period !== undefined)
      )];

      return periods.sort().reverse();
    } catch (error) {
      console.error('Error fetching periods:', error);
      return [];
    }
  }
}