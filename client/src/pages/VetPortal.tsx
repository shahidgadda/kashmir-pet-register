import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, LogOut, Loader2, Check, X, Plus, Stethoscope, MapPin, KeyRound, Printer } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { searchRegistrations, updateRegistrationStatus, updateRegistrationStatusById, createRegistration, vetLogin, changeVetPassword, type VetSession } from '@/lib/api';
import RegistrationForm from '@/components/RegistrationForm';
import Certificate from '@/components/Certificate';
import type { PetRegistration, InsertPetRegistration } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function VetPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vetSession, setVetSession] = useState<VetSession | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [pendingRegistrations, setPendingRegistrations] = useState<PetRegistration[]>([]);
  const [approvedRegistrations, setApprovedRegistrations] = useState<PetRegistration[]>([]);
  const [rejectedRegistrations, setRejectedRegistrations] = useState<PetRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<PetRegistration | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [certificateReg, setCertificateReg] = useState<PetRegistration | null>(null);
  const { toast } = useToast();

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleChangePassword = async () => {
    if (!vetSession) return;
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setPasswordLoading(true);
    try {
      await changeVetPassword(vetSession.username, currentPassword, newPassword);
      toast({ title: 'Success', description: 'Password changed successfully' });
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
    try {
      const session = await vetLogin(username, password);
      setVetSession(session);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setVetSession(null);
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    if (isAuthenticated && vetSession) {
      loadRegistrations();
    }
  }, [isAuthenticated, vetSession, search, activeTab]);

  const loadRegistrations = async () => {
    if (!vetSession) return;
    setLoading(true);
    try {
      let status = 'pending_vet_review';
      if (activeTab === 'rejected') {
        status = 'rejected';
      } else if (activeTab === 'approved') {
        status = 'pending_authority_approval,approved';
      }
      
      const data = await searchRegistrations({
        search,
        status,
        dispensary: vetSession.dispensary,
      });
      
      if (activeTab === 'rejected') {
        setRejectedRegistrations(data);
      } else if (activeTab === 'approved') {
        setApprovedRegistrations(data);
      } else {
        setPendingRegistrations(data);
      }
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReg) return;
    setActionLoading(true);
    try {
      await updateRegistrationStatusById(selectedReg.id, 'pending_authority_approval', { vetRemarks: remarks });
      toast({ title: 'Approved', description: 'Registration forwarded to authority for final approval.' });
      setSelectedReg(null);
      setRemarks('');
      loadRegistrations();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReg || !remarks.trim()) {
      toast({ title: 'Error', description: 'Please provide rejection reason', variant: 'destructive' });
      return;
    }
    setActionLoading(true);
    try {
      await updateRegistrationStatusById(selectedReg.id, 'rejected', { vetRemarks: remarks });
      toast({ title: 'Rejected', description: 'Registration has been rejected.' });
      setSelectedReg(null);
      setRemarks('');
      loadRegistrations();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (reg: PetRegistration) => {
    setActionLoading(true);
    try {
      await updateRegistrationStatusById(reg.id, 'pending_vet_review');
      toast({ title: 'Reactivated', description: 'Application moved back to pending review.' });
      loadRegistrations();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectRegistration = async (data: InsertPetRegistration) => {
    const registration = await createRegistration({ ...data, submittedBy: 'vet' });
    toast({ title: 'Success', description: `Application #${registration.id} created and forwarded to authority for approval.` });
    setActiveTab('pending');
  };

  const currentRegistrations = activeTab === 'rejected' ? rejectedRegistrations : pendingRegistrations;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-green-700" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">Veterinary Officer Portal</CardTitle>
            <CardDescription>Animal Husbandry Department, Kupwara</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  type="text" 
                  placeholder="e.g. vet_kupwara" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="input-vet-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="Enter password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-vet-password"
                />
                {error && <p className="text-sm text-destructive" data-testid="text-error">{error}</p>}
              </div>
              <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={loginLoading} data-testid="button-vet-login">
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Access Portal
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/">
                <Button variant="link" className="text-sm" data-testid="link-back">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <header className="bg-green-800 text-white sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-green-800 font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h1 className="font-heading font-bold text-lg hidden md:block">Veterinary Officer Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-green-100 hidden sm:block">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium text-white">{vetSession?.dispensary}</span>
                <span className="text-green-200">({vetSession?.block})</span>
              </div>
            </div>
            <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-green-300 text-white hover:bg-green-700" data-testid="button-change-password">
                  <KeyRound className="w-4 h-4" /> Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword"
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      data-testid="input-current-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword"
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      data-testid="input-new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword"
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowChangePassword(false)}>Cancel</Button>
                  <Button onClick={handleChangePassword} disabled={passwordLoading} className="bg-green-700 hover:bg-green-800">
                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Change Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2 border-green-300 text-white hover:bg-green-700" data-testid="button-logout">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">Register New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Pending Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-800" data-testid="text-pending-count">{pendingRegistrations.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by ID, Owner, Pet Name..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Badge variant="outline" className="text-green-700 border-green-300 px-3 py-2">
                <MapPin className="w-4 h-4 mr-2" />
                Dispensary: {vetSession?.dispensary}
              </Badge>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-green-700" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reg. ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Pet Details</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Vaccination</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-muted-foreground" data-testid="text-no-results">
                            No pending applications.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingRegistrations.map((reg) => (
                          <TableRow key={reg.id} data-testid={`row-registration-${reg.id}`}>
                            <TableCell className="font-mono font-medium text-xs">{reg.registrationNumber || `#${reg.id}`}</TableCell>
                            <TableCell>{reg.registrationDate || 'Pending'}</TableCell>
                            <TableCell>
                              <div className="font-medium">{reg.ownerName}</div>
                              <div className="text-xs text-muted-foreground">{reg.mobile}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{reg.petName || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">{reg.breed} ({reg.species}), {reg.color}, {reg.sex}</div>
                            </TableCell>
                            <TableCell>{reg.district}</TableCell>
                            <TableCell>
                              <Badge variant={reg.vaccinationStatus === 'Vaccinated' ? 'default' : 'destructive'} className="text-[10px]">
                                {reg.vaccinationStatus}
                              </Badge>
                              {reg.vaccinationDate && <div className="text-xs text-muted-foreground mt-1">{reg.vaccinationDate}</div>}
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="bg-green-700 hover:bg-green-800" onClick={() => setSelectedReg(reg)} data-testid={`button-review-${reg.id}`}>
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Review Application</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {reg.photoUrl && (
                                      <div className="flex justify-center">
                                        <div className="w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
                                          <img src={reg.photoUrl} alt="Pet" className="w-full h-full object-cover" />
                                        </div>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div><span className="font-medium">Owner:</span> {reg.ownerName}</div>
                                      <div><span className="font-medium">Mobile:</span> {reg.mobile}</div>
                                      <div><span className="font-medium">District:</span> {reg.district}</div>
                                      <div><span className="font-medium">Address:</span> {reg.ownerAddress}</div>
                                      <div><span className="font-medium">Pet:</span> {reg.petName || 'N/A'}</div>
                                      <div><span className="font-medium">Species:</span> {reg.species}</div>
                                      <div><span className="font-medium">Breed:</span> {reg.breed}</div>
                                      <div><span className="font-medium">Color:</span> {reg.color}</div>
                                      <div><span className="font-medium">Sex:</span> {reg.sex}</div>
                                      <div><span className="font-medium">Age:</span> {reg.age}</div>
                                      <div className="col-span-2"><span className="font-medium">Identification:</span> {reg.markOfIdentification || 'N/A'}</div>
                                      <div><span className="font-medium">Vaccination:</span> {reg.vaccinationStatus}</div>
                                      {reg.microchipNumber && <div><span className="font-medium">Microchip:</span> {reg.microchipNumber}</div>}
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-2">Veterinary Remarks</label>
                                      <Textarea 
                                        placeholder="Add any remarks or observations..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        data-testid="input-remarks"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter className="flex gap-2">
                                    <Button variant="destructive" onClick={handleReject} disabled={actionLoading} data-testid="button-reject">
                                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                                      Reject
                                    </Button>
                                    <Button className="bg-green-700 hover:bg-green-800" onClick={handleApprove} disabled={actionLoading} data-testid="button-approve">
                                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                      Certify & Forward
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Approved / Pending Authority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800">{approvedRegistrations.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-green-700" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reg. ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Pet Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            No approved applications.
                          </TableCell>
                        </TableRow>
                      ) : (
                        approvedRegistrations.map((reg) => (
                          <TableRow key={reg.id}>
                            <TableCell className="font-mono font-medium text-xs">{reg.registrationNumber || `#${reg.id}`}</TableCell>
                            <TableCell>{reg.registrationDate || 'Pending'}</TableCell>
                            <TableCell>
                              <div className="font-medium">{reg.ownerName}</div>
                              <div className="text-xs text-muted-foreground">{reg.mobile}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{reg.petName || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">{reg.breed} ({reg.species})</div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={reg.status === 'approved' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-blue-50 text-blue-700 border-blue-300'}
                              >
                                {reg.status === 'approved' ? 'Fully Approved' : 'Awaiting Authority'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {reg.status === 'approved' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setCertificateReg(reg)} data-testid={`button-print-cert-${reg.id}`}>
                                      <Printer className="w-4 h-4" /> Print Certificate
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Registration Certificate</DialogTitle>
                                    </DialogHeader>
                                    <div className="print:block">
                                      <Certificate registration={reg} />
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={handlePrintCertificate} className="gap-2">
                                        <Printer className="w-4 h-4" /> Print
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-700">Rejected Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-800">{rejectedRegistrations.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-green-700" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reg. ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Pet Details</TableHead>
                        <TableHead>Rejection Reason</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            No rejected applications.
                          </TableCell>
                        </TableRow>
                      ) : (
                        rejectedRegistrations.map((reg) => (
                          <TableRow key={reg.id}>
                            <TableCell className="font-mono font-medium text-xs">{reg.registrationNumber || `#${reg.id}`}</TableCell>
                            <TableCell>{reg.registrationDate || 'Pending'}</TableCell>
                            <TableCell>
                              <div className="font-medium">{reg.ownerName}</div>
                              <div className="text-xs text-muted-foreground">{reg.mobile}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{reg.petName || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">{reg.breed} ({reg.species})</div>
                            </TableCell>
                            <TableCell className="max-w-[200px] text-sm text-red-700">
                              {reg.vetRemarks || reg.authorityRemarks || 'No reason provided'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReactivate(reg)} 
                                disabled={actionLoading}
                              >
                                Reactivate
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Register New Pet
                </CardTitle>
                <CardDescription>
                  Register a pet directly. This will skip owner submission and go directly to authority for final approval.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegistrationForm 
                  onSubmit={handleDirectRegistration} 
                  submitLabel="Register & Forward to Authority"
                  defaultBlock={vetSession?.block}
                  defaultDispensary={vetSession?.dispensary}
                  lockDispensary={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
