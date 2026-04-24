import { Navigate } from "react-router-dom";
import { useRize } from "@/lib/store";

const Index = () => {
  const onboarded = useRize((s) => s.onboarded);
  return <Navigate to={onboarded ? "/home" : "/welcome"} replace />;
};

export default Index;
