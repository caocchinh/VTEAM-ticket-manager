"use client";

import { useQuery } from "@tanstack/react-query";
import { TeacherVerificationInfo } from "@/constants/types";

const fetchTeacherVerificationData = async (): Promise<
  TeacherVerificationInfo[]
> => {
  const response = await fetch("/api/teacher-verification");

  if (!response.ok) {
    throw new Error("Failed to fetch teacher verification data");
  }

  return response.json();
};

export const useTeacherVerification = ({
  enabled = false,
}: {
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["teacher-verification"],
    queryFn: fetchTeacherVerificationData,
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in newer versions)
  });
};
