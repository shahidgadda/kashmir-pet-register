import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { getRegistrationById } from '@/lib/api';
import Certificate from '@/components/Certificate';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { PetRegistration } from '@shared/schema';

export default function Success() {
  const [, params] = useRoute('/success/:id');
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const [registration, setRegistration] = useState<PetRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getRegistrationById(id)
        .then(setRegistration)
        .catch(() => setError('Application not found'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (registration.status) {
      case 'pending_vet_review':
        return {
          icon: <Clock className="w-8 h-8 text-orange-600" />,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconBg: 'bg-orange-100',
          title: 'Application Submitted!',
          subtitle: 'Your application is pending veterinary verification.',
          description: 'A veterinary officer will review your application and verify all details. You will receive a certificate once approved by the final authority.',
          step: 1,
        };
      case 'pending_authority_approval':
        return {
          icon: <Clock className="w-8 h-8 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100',
          title: 'Veterinary Verification Complete!',
          subtitle: 'Your application is pending final authority approval.',
          description: 'The veterinary officer has certified your application. It is now awaiting final approval from the authority.',
          step: 2,
        };
      case 'approved':
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-green-600" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100',
          title: 'Registration Approved!',
          subtitle: 'Your pet has been successfully registered.',
          description: 'Your registration certificate is ready for download.',
          step: 3,
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="w-8 h-8 text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          title: 'Application Rejected',
          subtitle: 'Your application could not be approved.',
          description: registration.vetRemarks || registration.authorityRemarks || 'Please contact the authority for more details.',
          step: 0,
        };
      default:
        return {
          icon: <Clock className="w-8 h-8 text-gray-600" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          title: 'Application Submitted',
          subtitle: 'Status unknown',
          description: '',
          step: 0,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isApproved = registration.status === 'approved';

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Card className={`${statusInfo.bgColor} ${statusInfo.borderColor}`}>
           <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className={`w-16 h-16 ${statusInfo.iconBg} rounded-full flex items-center justify-center`}>
                {statusInfo.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{statusInfo.title}</h1>
                <p className="text-muted-foreground mt-2">{statusInfo.subtitle}</p>
              </div>
              {registration.status === 'approved' && registration.registrationNumber && (
                <div className="bg-white px-6 py-3 rounded-md border shadow-sm mt-4">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Registration Number</span>
                   <span className="text-2xl font-mono font-bold" data-testid="text-success-reg-number">{registration.registrationNumber}</span>
                </div>
              )}
              {registration.status !== 'approved' && (
                <div className="bg-white px-6 py-3 rounded-md border shadow-sm mt-4">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Application Reference</span>
                   <span className="text-lg font-mono font-bold" data-testid="text-success-ref-number">
                     {registration.dispensary}-{registration.id}-{new Date(registration.createdAt).toLocaleDateString('en-GB')}
                   </span>
                </div>
              )}
              
              {registration.status !== 'rejected' && registration.status !== 'approved' && (
                <div className="w-full max-w-md mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Application Progress</span>
                    <span className="text-sm text-muted-foreground">{statusInfo.step}/3</span>
                  </div>
                  <div className="flex gap-2">
                    <div className={`h-2 flex-1 rounded ${statusInfo.step >= 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded ${statusInfo.step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded ${statusInfo.step >= 3 ? 'bg-green-500' : 'bg-gray-200'}`} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Submitted</span>
                    <span>Vet Review</span>
                    <span>Approved</span>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground max-w-md mt-4">{statusInfo.description}</p>
           </CardContent>
        </Card>

        {isApproved && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Certificate</h2>
              <Link href="/">
                <Button variant="outline" className="gap-2" data-testid="button-home">
                  <Home className="w-4 h-4" /> Return Home
                </Button>
              </Link>
            </div>
            <Certificate registration={registration} />
          </>
        )}

        {!isApproved && (
          <div className="flex justify-center">
            <Link href="/">
              <Button variant="outline" className="gap-2" data-testid="button-home">
                <Home className="w-4 h-4" /> Return Home
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
