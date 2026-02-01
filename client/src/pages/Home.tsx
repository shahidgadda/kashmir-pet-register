import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PawPrint, ShieldCheck, FileText, Search, Stethoscope } from 'lucide-react';
import heroImage from '@assets/generated_images/scenic_j&k_landscape_with_pets.png';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[500px] w-full bg-slate-900 overflow-hidden">
        <img 
          src={heroImage} 
          alt="J&K Landscape" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white max-w-4xl leading-tight">
            Pet Registration System <br/>
            <span className="text-primary-foreground/80">Kupwara</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Animal Husbandry Department, Kupwara - Registration portal for pet dogs and cats.
          </p>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="container mx-auto px-4 -mt-24 relative z-20 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Owner Card */}
          <Link href="/owner">
            <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 ring-1 ring-border/50 group overflow-hidden">
              <div className="h-2 bg-primary w-full" />
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <PawPrint className="w-8 h-8 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Pet Owner</h2>
                  <p className="text-sm text-muted-foreground">
                    Register your pet dog or cat and download certificate after approval.
                  </p>
                </div>
                <Button size="lg" className="w-full mt-4" data-testid="button-owner-portal">Register a Pet</Button>
              </CardContent>
            </Card>
          </Link>

          {/* Veterinary Officer Card */}
          <Link href="/vet">
            <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 ring-1 ring-border/50 group overflow-hidden">
              <div className="h-2 bg-green-700 w-full" />
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-700 group-hover:text-white transition-colors duration-300">
                  <Stethoscope className="w-8 h-8 text-green-700 group-hover:text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Veterinary Officer</h2>
                  <p className="text-sm text-muted-foreground">
                    Verify owner applications or register pets directly.
                  </p>
                </div>
                <Button variant="outline" size="lg" className="w-full mt-4 border-green-700 text-green-700 hover:bg-green-50" data-testid="button-vet-portal">Vet Login</Button>
              </CardContent>
            </Card>
          </Link>

          {/* Authority Card */}
          <Link href="/authority">
            <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 ring-1 ring-border/50 group overflow-hidden">
              <div className="h-2 bg-slate-700 w-full" />
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300">
                  <ShieldCheck className="w-8 h-8 text-slate-700 group-hover:text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Authority Portal</h2>
                  <p className="text-sm text-muted-foreground">
                    Final approval of registrations certified by veterinary officers.
                  </p>
                </div>
                <Button variant="outline" size="lg" className="w-full mt-4" data-testid="button-authority-portal">Authority Login</Button>
              </CardContent>
            </Card>
          </Link>

        </div>

        {/* Features Section */}
        <div className="mt-24 text-center space-y-12">
           <h3 className="text-3xl font-heading font-bold">Why Register?</h3>
           <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary">
                    <FileText className="w-6 h-6" />
                 </div>
                 <h4 className="font-bold text-lg mb-2">Legal Compliance</h4>
                 <p className="text-sm text-muted-foreground">Mandatory registration ensures your pet is legally recognized by the municipal corporation.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary">
                    <Search className="w-6 h-6" />
                 </div>
                 <h4 className="font-bold text-lg mb-2">Lost & Found</h4>
                 <p className="text-sm text-muted-foreground">Microchip and registration details help in tracing lost pets quickly.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <h4 className="font-bold text-lg mb-2">Health Tracking</h4>
                 <p className="text-sm text-muted-foreground">Keep track of vaccination records and ensure public safety.</p>
              </div>
           </div>
        </div>
      </div>

      <footer className="mt-auto bg-slate-900 text-slate-400 py-6 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center space-y-2">
           <p className="text-sm">Animal Husbandry Department, Kupwara</p>
           <p className="text-xs text-slate-500">Developed by Arshid Syed</p>
        </div>
      </footer>
    </div>
  );
}
