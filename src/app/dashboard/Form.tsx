"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const Form = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: studentList,
    isFetching: isFetchingStudentList,
    isFetched: isStudentListFetched,
    isError: isStudentListError,
    refetch: refetchStudentList,
  } = useQuery({
    queryKey: ["student_list"],
    queryFn: async () => {
      const response = await fetch("/api/studentList");
      if (!response.ok) {
        throw new Error("Failed to fetch student list");
      }
      const data = await response.json();
      return data;
    },
    enabled: mounted,
  });

  return <div></div>;
};

export default Form;
