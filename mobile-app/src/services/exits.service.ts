import { apiClient, queries, ExitPermission, RequestExitInput } from '../config/api';
import { AuthService } from './auth.service';

export class ExitsService {
  /**
   * Get exit permissions for user's children
   */
  static async getExitPermissions(
    filter: 'all' | 'pending' | 'approved' | 'by_child' = 'all',
    studentId?: string
  ): Promise<ExitPermission[]> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return [];

      const response = await apiClient.graphql(queries.GET_EXIT_PERMISSIONS, {
        tenantId,
        filter,
        studentId,
      });

      return response.exitPermissions || [];
    } catch (error) {
      console.error('Error fetching exit permissions:', error);
      return [];
    }
  }

  /**
   * Get single exit permission
   */
  static async getExitPermissionById(permissionId: string): Promise<ExitPermission | null> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return null;

      const response = await apiClient.graphql(queries.GET_EXIT_PERMISSION, {
        id: permissionId,
        tenantId,
      });

      return response.exitPermission || null;
    } catch (error) {
      console.error('Error fetching exit permission:', error);
      return null;
    }
  }

  /**
   * Request new exit permission
   */
  static async requestExitPermission(
    studentId: string,
    data: {
      authorizedPersonName: string;
      authorizedPersonDocument?: string;
      authorizedPersonPhone?: string;
      relationship?: string;
      exitDate: string;
      exitTime?: string;
      returnTime?: string;
      reason?: string;
      transportationMethod?: string;
    }
  ): Promise<string | null> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return null;

      const requestInput: RequestExitInput = {
        tenantId,
        studentId,
        exitDate: data.exitDate,
        exitTime: data.exitTime,
        returnTime: data.returnTime,
        authorizedPersonName: data.authorizedPersonName,
        authorizedPersonDocument: data.authorizedPersonDocument,
        authorizedPersonPhone: data.authorizedPersonPhone,
        relationship: data.relationship,
        reason: data.reason,
        transportationMethod: data.transportationMethod,
      };

      const response = await apiClient.graphql(queries.REQUEST_EXIT, {
        input: requestInput,
      });

      return response.requestExit?.id || null;
    } catch (error) {
      console.error('Error requesting exit permission:', error);
      return null;
    }
  }

  /**
   * Cancel exit permission request (would need backend implementation)
   */
  static async cancelExitPermission(permissionId: string): Promise<boolean> {
    try {
      // This would need a cancel exit endpoint on the backend
      await apiClient.put(`/exits/${permissionId}/cancel`);
      return true;
    } catch (error) {
      console.error('Error cancelling exit permission:', error);
      return false;
    }
  }

  /**
   * Get upcoming exit permissions
   */
  static async getUpcomingExits(): Promise<ExitPermission[]> {
    try {
      const approvedExits = await this.getExitPermissions('approved');
      const today = new Date();

      // Filter to only future exits and limit to 5
      const upcomingExits = approvedExits
        .filter(exit => new Date(exit.exitDate) >= today)
        .slice(0, 5);

      return upcomingExits;
    } catch (error) {
      console.error('Error fetching upcoming exits:', error);
      return [];
    }
  }

  /**
   * Get exit permission history for a student
   */
  static async getStudentExitHistory(studentId: string): Promise<ExitPermission[]> {
    try {
      return await this.getExitPermissions('by_child', studentId);
    } catch (error) {
      console.error('Error fetching student exit history:', error);
      return [];
    }
  }

  /**
   * Get authorized persons for a student
   */
  static async getAuthorizedPersons(studentId: string): Promise<any[]> {
    try {
      const permissions = await this.getExitPermissions('approved', studentId);

      // Extract unique authorized persons
      const personsMap = new Map();
      permissions.forEach(permission => {
        const key = permission.authorizedPersonName;
        if (!personsMap.has(key)) {
          personsMap.set(key, {
            authorized_person_name: permission.authorizedPersonName,
            authorized_person_document: permission.authorizedPersonDocument,
            authorized_person_phone: permission.authorizedPersonPhone,
            relationship: permission.relationship,
          });
        }
      });

      return Array.from(personsMap.values());
    } catch (error) {
      console.error('Error fetching authorized persons:', error);
      return [];
    }
  }

  /**
   * Get pending exit permissions
   */
  static async getPendingExits(): Promise<ExitPermission[]> {
    try {
      return await this.getExitPermissions('pending');
    } catch (error) {
      console.error('Error fetching pending exits:', error);
      return [];
    }
  }

  /**
   * Get approved exit permissions
   */
  static async getApprovedExits(): Promise<ExitPermission[]> {
    try {
      return await this.getExitPermissions('approved');
    } catch (error) {
      console.error('Error fetching approved exits:', error);
      return [];
    }
  }
}