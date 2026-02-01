import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, LogOut, Loader2, Check, X, Eye, KeyRound } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Certificate from '@/components/Certificate';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { searchRegistrations, updateRegistrationStatus, updateRegistrationStatusById } from '@/lib/api';
import type { PetRegistration } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function AuthorityPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingRegistrations, setPendingRegistrations] = useState<PetRegistration[]>([]);
  const [approvedRegistrations, setApprovedRegistrations] = useState<PetRegistration[]>([]);
  const [rejectedRegistrations, setRejectedRegistrations] = useState<PetRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterSpecies, setFilterSpecies] = useState('All');
  const [selectedReg, setSelectedReg] = useState<PetRegistration | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/authority/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Login failed');
    }
  };

  const handleChangePassword = async () => {
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
      const response = await fetch('/api/authority/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Password changed successfully' });
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.error || 'Failed to change password', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to change password', variant: 'destructive' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadRegistrations();
    }
  }, [isAuthenticated, search, filterDistrict, filterSpecies, activeTab]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      let status = 'pending_authority_approval';
      if (activeTab === 'approved') status = 'approved';
      if (activeTab === 'rejected') status = 'rejected';
      
      const data = await searchRegistrations({
        search,
        district: filterDistrict !== 'All' ? filterDistrict : undefined,
        species: filterSpecies !== 'All' ? filterSpecies : undefined,
        status,
      });
      if (activeTab === 'pending') {
        setPendingRegistrations(data);
      } else if (activeTab === 'approved') {
        setApprovedRegistrations(data);
      } else {
        setRejectedRegistrations(data);
      }
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBackToVet = async (reg: PetRegistration) => {
    setActionLoading(true);
    try {
      await updateRegistrationStatusById(reg.id, 'pending_vet_review', { authorityRemarks: 'Sent back for review' });
      toast({ title: 'Sent Back', description: 'Application sent back to veterinary officer for review.' });
      loadRegistrations();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReg) return;
    setActionLoading(true);
    try {
      await updateRegistrationStatusById(selectedReg.id, 'approved', { authorityRemarks: remarks });
      toast({ title: 'Approved', description: 'Registration approved. Certificate is now available.' });
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
      await updateRegistrationStatusById(selectedReg.id, 'rejected', { authorityRemarks: remarks });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_vet_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Vet Review</Badge>;
      case 'pending_authority_approval':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-primary">Authority Login</CardTitle>
            <CardDescription>Enter your official credentials to access the registry.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Password (admin123)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
                {error && <p className="text-sm text-destructive" data-testid="text-error">{error}</p>}
              </div>
              <Button type="submit" className="w-full" data-testid="button-login">Access Portal</Button>
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

  const getCurrentRegistrations = () => {
    if (activeTab === 'pending') return pendingRegistrations;
    if (activeTab === 'approved') return approvedRegistrations;
    return rejectedRegistrations;
  };
  const currentRegistrations = getCurrentRegistrations();
  const dogCount = currentRegistrations.filter(r => r.species === 'Dog').length;
  const catCount = currentRegistrations.filter(r => r.species === 'Cat').length;

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">JK</div>
            <h1 className="font-heading font-bold text-lg hidden md:block">Authority Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              Logged in as <span className="font-medium text-foreground">Admin Officer</span>
            </div>
            <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" data-testid="button-change-password">
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
                  <Button onClick={handleChangePassword} disabled={passwordLoading}>
                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Change Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2" data-testid="button-logout">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="pending" data-testid="tab-pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Pending Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-800" data-testid="text-pending-count">{pendingRegistrations.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Dogs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-dog-count">{dogCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-cat-count">{catCount}</div>
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
              <div className="flex gap-2 w-full md:w-auto">
                <Select value={filterSpecies} onValueChange={setFilterSpecies}>
                  <SelectTrigger className="w-[140px]" data-testid="select-filter-species">
                    <SelectValue placeholder="Species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Species</SelectItem>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-district">
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Districts</SelectItem>
                    <SelectItem value="Srinagar">Srinagar</SelectItem>
                    <SelectItem value="Jammu">Jammu</SelectItem>
                    <SelectItem value="Anantnag">Anantnag</SelectItem>
                    <SelectItem value="Baramulla">Baramulla</SelectItem>
                    <SelectItem value="Budgam">Budgam</SelectItem>
                    <SelectItem value="Pulwama">Pulwama</SelectItem>
                    <SelectItem value="Kupwara">Kupwara</SelectItem>
                    <SelectItem value="Bandipora">Bandipora</SelectItem>
                    <SelectItem value="Ganderbal">Ganderbal</SelectItem>
                    <SelectItem value="Kulgam">Kulgam</SelectItem>
                    <SelectItem value="Shopian">Shopian</SelectItem>
                    <SelectItem value="Udhampur">Udhampur</SelectItem>
                    <SelectItem value="Doda">Doda</SelectItem>
                    <SelectItem value="Kishtwar">Kishtwar</SelectItem>
                    <SelectItem value="Kathua">Kathua</SelectItem>
                    <SelectItem value="Samba">Samba</SelectItem>
                    <SelectItem value="Rajouri">Rajouri</SelectItem>
                    <SelectItem value="Poonch">Poonch</SelectItem>
                    <SelectItem value="Ramban">Ramban</SelectItem>
                    <SelectItem value="Reasi">Reasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reg. ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Pet</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Vet Remarks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10 text-muted-foreground" data-testid="text-no-results">
                            No pending approvals.
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
                              <div className="text-xs text-muted-foreground">{reg.breed} ({reg.species})</div>
                            </TableCell>
                            <TableCell>{reg.district}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">
                                {reg.submittedBy === 'vet' ? 'Vet Officer' : 'Owner'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                              {reg.vetRemarks || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" onClick={() => setSelectedReg(reg)} data-testid={`button-review-${reg.id}`}>
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Final Approval</DialogTitle>
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
                                    {reg.vetRemarks && (
                                      <div className="bg-green-50 p-3 rounded border border-green-200">
                                        <div className="text-sm font-medium text-green-800 mb-1">Veterinary Officer Remarks:</div>
                                        <div className="text-sm text-green-700">{reg.vetRemarks}</div>
                                      </div>
                                    )}
                                    <div>
                                      <label className="block text-sm font-medium mb-2">Authority Remarks (optional)</label>
                                      <Textarea 
                                        placeholder="Add any remarks..."
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
                                    <Button onClick={handleApprove} disabled={actionLoading} data-testid="button-approve">
                                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                      Approve
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Total Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800" data-testid="text-approved-count">{approvedRegistrations.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Dogs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{approvedRegistrations.filter(r => r.species === 'Dog').length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{approvedRegistrations.filter(r => r.species === 'Cat').length}</div>
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
                  data-testid="input-search-approved"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Select value={filterSpecies} onValueChange={setFilterSpecies}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Species</SelectItem>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Districts</SelectItem>
                    <SelectItem value="Srinagar">Srinagar</SelectItem>
                    <SelectItem value="Jammu">Jammu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reg. ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Pet</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedRegistrations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                            No approved registrations found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        approvedRegistrations.map((reg) => (
                          <TableRow key={reg.id} data-testid={`row-approved-${reg.id}`}>
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
                            <TableCell>{reg.district}</TableCell>
                            <TableCell>{getStatusBadge(reg.status)}</TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" data-testid={`button-view-cert-${reg.id}`}>
                                    <Eye className="w-4 h-4 mr-2" /> View Certificate
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
                                  <Certificate registration={reg} />
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
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reg. ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Pet</TableHead>
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
                                onClick={() => handleSendBackToVet(reg)} 
                                disabled={actionLoading}
                              >
                                Send Back to Vet
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
        </Tabs>
      </main>
    </div>
  );
}
