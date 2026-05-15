import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProjectCreate from "./pages/ProjectCreate";
import ProjectHearing from "./pages/ProjectHearing";
import ProjectProposal from "./pages/ProjectProposal";
import ProjectMandala from "./pages/ProjectMandala";
import ProjectMatrix from "./pages/ProjectMatrix";
import ProjectFlow from "./pages/ProjectFlow";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/project/new" component={ProjectCreate} />
      <Route path="/project/:id/hearing" component={ProjectHearing} />
      <Route path="/project/:id/proposal" component={ProjectProposal} />
      <Route path="/project/:id/mandala" component={ProjectMandala} />
      <Route path="/project/:id/matrix/:matrixId" component={ProjectMatrix} />
      <Route path="/project/:id/flow/:flowId" component={ProjectFlow} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
