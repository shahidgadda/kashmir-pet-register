import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import OwnerPortal from "@/pages/OwnerPortal";
import VetPortal from "@/pages/VetPortal";
import AuthorityPortal from "@/pages/AuthorityPortal";
import Success from "@/pages/Success";
import VerifyPage from "@/pages/VerifyPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/owner" component={OwnerPortal} />
      <Route path="/vet" component={VetPortal} />
      <Route path="/authority" component={AuthorityPortal} />
      <Route path="/success/:id" component={Success} />
      <Route path="/verify/:registrationNumber" component={VerifyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
