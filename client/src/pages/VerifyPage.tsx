import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';

interface Registration {
  id: number;
  registrationNumber: string | null;
  status: string;
  ownerName: string;
  ownerAddress: string;
  mobile: string;
  district: string;
  block: string;
  dispensary: string;
  species: string;
  breed: string;
  petName: string | null;
  sex: string;
  age: string;
  color: string;
  markOfIdentification: string | null;
  vaccinationStatus: string;
  vaccinationDate: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export default function VerifyPage() {
  const [, params] = useRoute('/verify/:registrationNumber');
  const registrationNumberParam = params?.registrationNumber;
  // Convert dashes back to slashes for API lookup
  const registrationNumber = registrationNumberParam?.replace(/-/g, '/');

  const { data: registration, isLoading, error } = useQuery<Registration>({
    queryKey: ['verify', registrationNumber],
    queryFn: async () => {
      const res = await fetch(`/api/registrations/verify/${encodeURIComponent(registrationNumber || '')}`);
      if (!res.ok) {
        throw new Error('Registration not found');
      }
      return res.json();
    },
    enabled: !!registrationNumber,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white gap-1"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      case 'pending_authority_approval':
        return <Badge className="bg-yellow-500 text-white gap-1"><Clock className="w-3 h-3" /> Pending Authority Approval</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Pending Review</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Registration Not Found</h2>
            <p className="text-gray-600">
              The registration number <strong>{registrationNumber}</strong> could not be verified. 
              Please check the registration number and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <CardTitle className="text-xl">Pet Registration Verification</CardTitle>
                <p className="text-green-100 text-sm">Animal Husbandry Department, Kupwara</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-500">Registration Number</p>
                <p className="text-lg font-bold text-gray-800" data-testid="text-reg-number">{registration.registrationNumber}</p>
              </div>
              <div data-testid="badge-status">
                {getStatusBadge(registration.status)}
              </div>
            </div>

            {registration.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">This registration is verified and approved.</span>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Owner Details</h3>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium" data-testid="text-owner-name">{registration.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium" data-testid="text-address">{registration.ownerAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Block / Dispensary</p>
                  <p className="font-medium" data-testid="text-block">{registration.block} / {registration.dispensary}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Pet Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Species</p>
                    <p className="font-medium" data-testid="text-species">{registration.species}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Breed</p>
                    <p className="font-medium" data-testid="text-breed">{registration.breed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pet Name</p>
                    <p className="font-medium" data-testid="text-pet-name">{registration.petName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sex / Age</p>
                    <p className="font-medium" data-testid="text-sex-age">{registration.sex} / {registration.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium" data-testid="text-color">{registration.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vaccination</p>
                    <p className="font-medium" data-testid="text-vaccination">{registration.vaccinationStatus}</p>
                  </div>
                </div>
                {registration.photoUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Pet Photo</p>
                    <img 
                      src={registration.photoUrl} 
                      alt="Pet" 
                      className="w-24 h-24 object-cover rounded-lg border"
                      data-testid="img-pet-photo"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>Government of Jammu & Kashmir</p>
              <p>Animal Husbandry Department, District Kupwara</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
