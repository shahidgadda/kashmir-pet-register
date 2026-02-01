import { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import Certificate from '@/components/Certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Clock, CheckCircle, XCircle, Plus, FileText } from 'lucide-react';
import { Link } from 'wouter';
import { searchRegistrations, getRegistration } from '@/lib/api';
import type { PetRegistration } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function OwnerPortal() {
  const [activeTab, setActiveTab] = useState('register');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PetRegistration[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<PetRegistration | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: 'Enter search query', description: 'Please enter a mobile number or registration number', variant: 'destructive' });
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchRegistrations({ search: searchQuery.trim() });
      setSearchResults(results);
      if (results.length === 0) {
        toast({ title: 'No results', description: 'No registrations found for your search query.' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_vet_review':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" /> Pending Vet Review</Badge>;
      case 'pending_authority_approval':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300"><Clock className="w-3 h-3 mr-1" /> Pending Authority Approval</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingResults = searchResults.filter(r => r.status === 'pending_vet_review' || r.status === 'pending_authority_approval');
  const approvedResults = searchResults.filter(r => r.status === 'approved');
  const rejectedResults = searchResults.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <div className="bg-primary text-primary-foreground py-6 shadow-md">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="text-primary-foreground hover:bg-white/10 mb-4 pl-0 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-heading font-bold">Pet Owner Portal</h1>
          <p className="opacity-90 mt-2 max-w-2xl">
            Register your pet or check the status of your existing registration.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="register" className="gap-2" data-testid="tab-register">
              <Plus className="w-4 h-4" /> New Registration
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2" data-testid="tab-status">
              <Search className="w-4 h-4" /> Check Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <RegistrationForm />
          </TabsContent>

          <TabsContent value="status">
            <Card className="max-w-4xl mx-auto shadow-xl">
              <CardHeader>
                <CardTitle>Check Registration Status</CardTitle>
                <CardDescription>
                  Enter your mobile number, application reference number, or registration number to find your registration(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Mobile Number, Application Reference, or Registration Number</Label>
                    <Input 
                      id="search"
                      placeholder="e.g., 9876543210 or Handwara-29-22/12/2025 or JK/Kupwara/Dog/2025/00001"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      data-testid="input-search"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSearch} disabled={isSearching} data-testid="button-search">
                      <Search className="w-4 h-4 mr-2" />
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="pending" data-testid="tab-pending">
                        Pending ({pendingResults.length})
                      </TabsTrigger>
                      <TabsTrigger value="approved" data-testid="tab-approved">
                        Approved ({approvedResults.length})
                      </TabsTrigger>
                      <TabsTrigger value="rejected" data-testid="tab-rejected">
                        Rejected ({rejectedResults.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4 mt-4">
                      {pendingResults.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No pending registrations</p>
                      ) : (
                        pendingResults.map((reg) => (
                          <Card key={reg.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedRegistration(reg)}>
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <p className="font-mono font-bold text-sm">{reg.registrationNumber || `Application #${reg.id}`}</p>
                                <p className="text-sm text-muted-foreground">{reg.petName || reg.species} - {reg.breed}</p>
                                <p className="text-xs text-muted-foreground">Owner: {reg.ownerName}</p>
                              </div>
                              {getStatusBadge(reg.status)}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="approved" className="space-y-4 mt-4">
                      {approvedResults.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No approved registrations</p>
                      ) : (
                        approvedResults.map((reg) => (
                          <Card key={reg.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedRegistration(reg)}>
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <p className="font-mono font-bold text-sm">{reg.registrationNumber}</p>
                                <p className="text-sm text-muted-foreground">{reg.petName || reg.species} - {reg.breed}</p>
                                <p className="text-xs text-muted-foreground">Owner: {reg.ownerName}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(reg.status)}
                                <Button size="sm" variant="outline" className="gap-1">
                                  <FileText className="w-3 h-3" /> Certificate
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="rejected" className="space-y-4 mt-4">
                      {rejectedResults.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No rejected registrations</p>
                      ) : (
                        rejectedResults.map((reg) => (
                          <Card key={reg.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedRegistration(reg)}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-mono font-bold text-sm">{reg.registrationNumber || `Application #${reg.id}`}</p>
                                  <p className="text-sm text-muted-foreground">{reg.petName || reg.species} - {reg.breed}</p>
                                  <p className="text-xs text-muted-foreground">Owner: {reg.ownerName}</p>
                                </div>
                                {getStatusBadge(reg.status)}
                              </div>
                              {(reg.vetRemarks || reg.authorityRemarks) && (
                                <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                                  <strong>Reason:</strong> {reg.vetRemarks || reg.authorityRemarks}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                {selectedRegistration && selectedRegistration.status === 'approved' && (
                  <div className="mt-8 border-t pt-8">
                    <h3 className="text-xl font-bold mb-4">Registration Certificate</h3>
                    <Certificate registration={selectedRegistration} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
