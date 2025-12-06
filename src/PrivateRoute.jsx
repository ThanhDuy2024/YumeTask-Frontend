import { useQuery } from "@tanstack/react-query"
import { profile } from "./services/auth/profileService"
import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: profile,
    retry: false
  });

  if(isLoading) {
     return <span>Loading...</span>
  }

  if (isError || data.code === "error") {
    return <Navigate to="/login" replace />;
  };

  return children
}