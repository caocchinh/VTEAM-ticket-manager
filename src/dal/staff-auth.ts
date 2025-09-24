import {
  fetchOfflineStaffInfo,
  fetchOnlineCoordinatorInfo,
} from "@/lib/SpreadSheet";
import { ERROR_CODES } from "@/constants/errors";

export interface StaffAuthResult {
  isStaff: boolean;
  isOnlineCoordinator: boolean;
  staffInfo?: {
    name: string;
    email: string;
  };
  error?: string;
}

/**
 * Utility function to check if a user with the given email is authorized as staff
 * @param email - The email address to check for staff authorization
 * @returns Promise<StaffAuthResult> - Contains authorization status and staff info if authorized
 */
export const checkStaffAuthorization = async (
  email: string
): Promise<StaffAuthResult> => {
  try {
    // Fetch staff info for the provided email
    const [offlineStaffInfo, onlineCoordinatorInfo] = await Promise.all([
      fetchOfflineStaffInfo({ email }),
      fetchOnlineCoordinatorInfo({ email }),
    ]);

    if (offlineStaffInfo.error || onlineCoordinatorInfo.error) {
      return {
        isStaff: false,
        isOnlineCoordinator: false,
        error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      };
    }

    if (!offlineStaffInfo.data && !onlineCoordinatorInfo.data) {
      return {
        isStaff: false,
        isOnlineCoordinator: false,
        error: ERROR_CODES.UNAUTHORIZED,
      };
    }

    if (onlineCoordinatorInfo.data) {
      return {
        isStaff: true,
        isOnlineCoordinator: true,
        staffInfo: onlineCoordinatorInfo.data,
      };
    }

    return {
      isStaff: true,
      isOnlineCoordinator: false,
      staffInfo: offlineStaffInfo.data,
    };
  } catch {
    return {
      isStaff: false,
      isOnlineCoordinator: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    };
  }
};
