import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from 'wouter';
import { BLOCKS, BLOCK_DISPENSARIES, type Block } from '@shared/kupwara-data';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { createRegistration } from '@/lib/api';

const formSchema = z.object({
  ownerName: z.string().min(2, "Name is required"),
  ownerAddress: z.string().min(5, "Address is required"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Invalid mobile number"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  block: z.string().min(1, "Block is required"),
  dispensary: z.string().min(1, "Dispensary is required"),
  species: z.enum(['Dog', 'Cat']),
  breed: z.string().min(1, "Breed is required"),
  petName: z.string().optional(),
  sex: z.enum(['Male', 'Female']),
  age: z.string().min(1, "Age is required"),
  color: z.string().min(1, "Colour is required"),
  markOfIdentification: z.string().optional(),
  vaccinationStatus: z.enum(['Vaccinated', 'Not Vaccinated']),
  vaccinationDate: z.string().optional(),
  microchipNumber: z.string().optional(),
  otherDetails: z.string().optional(),
}).refine((data) => {
  if (data.vaccinationStatus === 'Vaccinated' && !data.vaccinationDate) {
    return false;
  }
  return true;
}, {
  message: "Vaccination date is required for vaccinated pets",
  path: ["vaccinationDate"],
});

type FormData = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  isAuthority?: boolean;
  onSubmit?: (data: FormData) => Promise<void>;
  submitLabel?: string;
  defaultBlock?: string;
  defaultDispensary?: string;
  lockDispensary?: boolean;
}

export default function RegistrationForm({ 
  isAuthority = false, 
  onSubmit: customOnSubmit, 
  submitLabel,
  defaultBlock,
  defaultDispensary,
  lockDispensary = false
}: RegistrationFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      species: 'Dog',
      sex: 'Male',
      vaccinationStatus: 'Vaccinated',
      block: defaultBlock || '',
      dispensary: defaultDispensary || '',
    },
  });

  const selectedBlock = useWatch({ control: form.control, name: 'block' });
  const vaccinationStatus = useWatch({ control: form.control, name: 'vaccinationStatus' });
  const availableDispensaries = selectedBlock ? BLOCK_DISPENSARIES[selectedBlock as Block] || [] : [];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(values: FormData) {
    setIsSubmitting(true);

    try {
      if (customOnSubmit) {
        await customOnSubmit({ ...values, photoUrl: photoPreview || undefined } as any);
        form.reset();
        setPhotoPreview(null);
      } else {
        const registration = await createRegistration({
          ...values,
          photoUrl: photoPreview || undefined,
        });

        const applicationDate = new Date().toLocaleDateString('en-GB');
        const referenceNumber = `${registration.dispensary}-${registration.id}-${applicationDate}`;

        toast({
          title: "Application Submitted",
          description: `Your application has been submitted for veterinary review. Reference: ${referenceNumber}`,
        });

        setLocation(`/success/${registration.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-t-4 border-t-primary" data-testid="card-registration-form">
      <CardHeader className="bg-muted/30 pb-8">
        <CardTitle className="text-2xl text-primary">{isAuthority ? 'Authority Registration Portal' : 'Pet Registration Application'}</CardTitle>
        <CardDescription>
          Please fill in all the details accurately. Fields marked with * are mandatory.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Owner Details
              </h3>
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name of Owner *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" data-testid="input-owner-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit mobile number" data-testid="input-mobile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" data-testid="input-email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="block"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Block *</FormLabel>
                      {lockDispensary ? (
                        <FormControl>
                          <Input value={field.value} disabled className="bg-muted" data-testid="input-block-locked" />
                        </FormControl>
                      ) : (
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('dispensary', '');
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-block">
                              <SelectValue placeholder="Select Block" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOCKS.map((b) => (
                              <SelectItem key={b} value={b} data-testid={`option-block-${b}`}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dispensary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veterinary Dispensary *</FormLabel>
                      {lockDispensary ? (
                        <FormControl>
                          <Input value={field.value} disabled className="bg-muted" data-testid="input-dispensary-locked" />
                        </FormControl>
                      ) : (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!selectedBlock}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-dispensary">
                              <SelectValue placeholder={selectedBlock ? "Select Dispensary" : "Select Block first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableDispensaries.map((d) => (
                              <SelectItem key={d} value={d} data-testid={`option-dispensary-${d}`}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownerAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Residential Address *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full address including pin code" className="resize-none" data-testid="input-address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Pet Details
              </h3>
              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Species *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Dog" data-testid="radio-species-dog" />
                            </FormControl>
                            <FormLabel className="font-normal">Dog</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Cat" data-testid="radio-species-cat" />
                            </FormControl>
                            <FormLabel className="font-normal">Cat</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sex *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sex">
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male" data-testid="option-sex-male">Male</SelectItem>
                          <SelectItem value="Female" data-testid="option-sex-female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="petName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of Pet</FormLabel>
                      <FormControl>
                        <Input placeholder="Pet's name" data-testid="input-pet-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Labrador, Persian" data-testid="input-breed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (Years/Months) *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2 Years" data-testid="input-age" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colour *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Golden, Black" data-testid="input-color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="markOfIdentification"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Mark of Identification</FormLabel>
                      <FormControl>
                        <Input placeholder="Any visible mark" data-testid="input-mark" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/80">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Health & Documents
              </h3>
              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vaccinationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vaccination Status *</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vaccination-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Vaccinated" data-testid="option-vaccinated">Vaccinated</SelectItem>
                          <SelectItem value="Not Vaccinated" data-testid="option-not-vaccinated">Not Vaccinated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {vaccinationStatus === 'Vaccinated' && (
                  <FormField
                    control={form.control}
                    name="vaccinationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Vaccination Date *</FormLabel>
                        <FormControl>
                          <Input type="date" data-testid="input-vaccination-date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="microchipNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Microchip Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter chip ID if available" data-testid="input-microchip" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                   <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Upload Pet Photo (Optional)</label>
                   <div className="mt-2 flex items-center gap-4">
                     <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30 flex items-center justify-center" data-testid="container-photo-preview">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" data-testid="img-photo-preview" />
                        ) : (
                          <Upload className="w-8 h-8 text-muted-foreground/50" />
                        )}
                     </div>
                     <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoChange}
                      className="max-w-xs cursor-pointer"
                      data-testid="input-photo-upload"
                     />
                   </div>
                </div>

                <FormField
                  control={form.control}
                  name="otherDetails"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Other Important Details</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any other remarks..." data-testid="input-other-details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" className="w-full md:w-auto min-w-[200px]" disabled={isSubmitting} data-testid="button-submit">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  submitLabel || 'Submit Application'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
