import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrandLoader } from "@/components/BrandLoader";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Welcome from "./pages/Welcome.tsx";
import Signup from "./pages/Signup.tsx";
import Quiz from "./pages/Quiz.tsx";
import Goal from "./pages/Goal.tsx";
import GapReport from "./pages/GapReport.tsx";
import Home from "./pages/Home.tsx";
import Roadmap from "./pages/Roadmap.tsx";
import Skills from "./pages/Skills.tsx";
import Profile from "./pages/Profile.tsx";
import Resume from "./pages/Resume.tsx";
import Admin from "./pages/Admin.tsx";
import Insights from "./pages/Insights.tsx";
import Settings from "./pages/Settings.tsx";
import CareerEngine from "./pages/CareerEngine.tsx";
import CodingLab from "./pages/CodingLab.tsx";

const App = () => (
  <TooltipProvider>
      <BrandLoader />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/goal" element={<Goal />} />
          <Route path="/gap" element={<GapReport />} />
          <Route path="/home" element={<Home />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/career-engine" element={<CareerEngine />} />
          <Route path="/coding-lab" element={<CodingLab />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  </TooltipProvider>
);

export default App;
