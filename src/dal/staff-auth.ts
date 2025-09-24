import { fetchOfflineStaffInfo } from "@/lib/SpreadSheet";
import { ERROR_CODES } from "@/constants/errors";

export interface StaffAuthResult {
  isStaff: boolean;
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
    const staffInfo = await fetchOfflineStaffInfo({ email });

    if (staffInfo.error) {
      return {
        isStaff: false,
        error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      };
    }

    if (!staffInfo.data) {
      return {
        isStaff: false,
        error: ERROR_CODES.UNAUTHORIZED,
      };
    }

    return {
      isStaff: true,
      staffInfo: {
        name: staffInfo.data.name,
        email: email,
      },
    };
  } catch {
    return {
      isStaff: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    };
  }
};
