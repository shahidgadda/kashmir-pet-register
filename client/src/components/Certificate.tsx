import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { PetRegistration } from '@shared/schema';

export default function Certificate({ registration }: { registration: PetRegistration }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Pet Registration Certificate</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Times New Roman', serif; 
              padding: 20px;
              background: white;
            }
            .certificate {
              max-width: 700px;
              margin: 0 auto;
              padding: 30px;
              border: 8px double #ccc;
              background: white;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .header img { width: 80px; height: 80px; object-fit: contain; margin-bottom: 10px; }
            .header h2 { font-size: 18px; color: #444; margin-bottom: 5px; }
            .header p { font-size: 12px; color: #666; text-transform: uppercase; }
            .header h1 { font-size: 24px; margin-top: 15px; text-transform: uppercase; letter-spacing: 3px; }
            .certify-text { text-align: center; font-size: 14px; color: #555; margin: 20px 0; }
            .details-box { 
              background: #f9f9f9; 
              border: 1px solid #ddd; 
              padding: 20px; 
              border-radius: 8px;
              display: flex;
              gap: 20px;
            }
            .details-left { flex: 2; }
            .details-right { flex: 1; text-align: center; }
            .detail-row { margin-bottom: 10px; display: flex; }
            .detail-label { font-weight: bold; width: 120px; font-size: 11px; text-transform: uppercase; color: #555; }
            .detail-value { font-size: 14px; }
            .detail-value.mono { font-family: monospace; font-size: 16px; font-weight: bold; color: #1e3a8a; }
            .pet-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
            .pet-detail { }
            .pet-detail-label { font-size: 10px; text-transform: uppercase; color: #555; font-weight: bold; }
            .pet-detail-value { font-size: 14px; }
            .photo-box { width: 100px; height: 100px; border: 2px solid #ddd; border-radius: 8px; overflow: hidden; margin-bottom: 15px; }
            .photo-box img { width: 100%; height: 100%; object-fit: cover; }
            .no-photo { width: 100px; height: 100px; border: 2px solid #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; font-size: 10px; color: #999; margin-bottom: 15px; }
            .qr-box { padding: 8px; background: white; border: 1px solid #eee; border-radius: 4px; display: inline-block; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; align-items: flex-end; }
            .footer-left { font-size: 10px; color: #666; max-width: 250px; }
            .footer-right { text-align: center; }
            .signature-line { width: 180px; border-bottom: 1px solid #666; margin-bottom: 5px; }
            .signatory { font-weight: bold; font-size: 12px; text-transform: uppercase; }
            .signatory-sub { font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <img src="/attached_assets/Animal_Husbandry_1765369588408.jpg" alt="Logo" onerror="this.style.display='none'" />
              <h2>Government of Jammu & Kashmir</h2>
              <p>Department of Animal Husbandry, Kupwara</p>
              <h1>Certificate of Registration</h1>
            </div>
            <p class="certify-text">This is to certify that the pet described below has been duly registered with the Authority.</p>
            <div class="details-box">
              <div class="details-left">
                <div class="detail-row">
                  <span class="detail-label">Registration No:</span>
                  <span class="detail-value mono">${registration.registrationNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date of Reg:</span>
                  <span class="detail-value">${registration.registrationDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Owner Name:</span>
                  <span class="detail-value">${registration.ownerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Mobile:</span>
                  <span class="detail-value">${registration.mobile}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${registration.ownerAddress}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">District:</span>
                  <span class="detail-value">${registration.district}</span>
                </div>
                <div class="pet-details">
                  <div class="pet-detail">
                    <div class="pet-detail-label">Pet Name</div>
                    <div class="pet-detail-value">${registration.petName || 'N/A'}</div>
                  </div>
                  <div class="pet-detail">
                    <div class="pet-detail-label">Species/Breed</div>
                    <div class="pet-detail-value">${registration.species} / ${registration.breed}</div>
                  </div>
                  <div class="pet-detail">
                    <div class="pet-detail-label">Sex/Age</div>
                    <div class="pet-detail-value">${registration.sex} / ${registration.age}</div>
                  </div>
                  <div class="pet-detail">
                    <div class="pet-detail-label">Color/Mark</div>
                    <div class="pet-detail-value">${registration.color} / ${registration.markOfIdentification || 'N/A'}</div>
                  </div>
                </div>
              </div>
              <div class="details-right">
                ${registration.photoUrl ? `<div class="photo-box"><img src="${registration.photoUrl}" alt="Pet" /></div>` : '<div class="no-photo">No Photo</div>'}
                <div class="qr-box">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`https://pet-registration-kupwara.replit.app/verify/${registration.registrationNumber?.replace(/\//g, '-')}`)}" alt="QR Code" />
                </div>
              </div>
            </div>
            <div class="footer">
              <div class="footer-left">
                <p>This is a computer generated certificate.</p>
                <p>Valid throughout the Union Territory of Jammu & Kashmir.</p>
              </div>
              <div class="footer-right">
                <div class="signature-line"></div>
                <p class="signatory">Superintendent DVH, Kupwara</p>
                <p class="signatory-sub">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2" data-testid="button-print">
          <Printer className="w-4 h-4" /> Print Certificate
        </Button>
      </div>

      <div 
        ref={printRef}
        className="bg-white text-black p-12 border-[12px] border-double border-gray-300 shadow-xl relative overflow-hidden print:shadow-none print:border-4 print:p-8"
        data-testid="container-certificate"
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <div className="w-[80%] h-[80%] rounded-full border-[20px] border-black" />
        </div>

        <div className="text-center space-y-4 mb-12 relative z-10">
          <div className="flex flex-col items-center justify-center gap-4">
             <div className="w-28 h-28 flex items-center justify-center">
               <img 
                 src="/attached_assets/Animal_Husbandry_1765369588408.jpg" 
                 alt="J&K Animal Husbandry Department" 
                 className="w-28 h-28 object-contain"
                 onError={(e) => { e.currentTarget.style.display = 'none'; }}
               />
             </div>
             <div>
               <h2 className="text-xl font-medium text-gray-600">Government of Jammu & Kashmir</h2>
               <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Department of Animal Husbandry, Kupwara</p>
               <h1 className="text-3xl font-bold font-serif uppercase tracking-widest text-gray-900 mt-4">Certificate of Registration</h1>
             </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="text-center">
             <p className="text-lg text-gray-600">This is to certify that the pet described below has been duly registered with the Authority.</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg grid grid-cols-[2fr_1fr] gap-8 items-start">
             <div className="space-y-4">
                <div className="grid grid-cols-[140px_1fr] gap-2 items-baseline">
                   <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Registration No:</span>
                   <span className="font-mono text-xl font-bold text-blue-900" data-testid="text-registration-number">{registration.registrationNumber}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-2 items-baseline">
                   <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Date of Reg:</span>
                   <span className="text-lg text-gray-900" data-testid="text-registration-date">{registration.registrationDate}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-2 items-baseline">
                   <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Owner Name:</span>
                   <span className="text-lg font-semibold text-gray-900" data-testid="text-owner-name">{registration.ownerName}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-2 items-baseline">
                   <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Mobile:</span>
                   <span className="text-lg text-gray-900" data-testid="text-mobile">{registration.mobile}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-2 items-baseline">
                   <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Address:</span>
                   <span className="text-sm text-gray-900" data-testid="text-address">{registration.ownerAddress}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-2 items-baseline">
                   <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">District:</span>
                   <span className="text-lg text-gray-900" data-testid="text-district">{registration.district}</span>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block font-bold text-gray-700 uppercase text-xs tracking-wider mb-1">Pet Name</span>
                        <span className="text-lg font-medium" data-testid="text-pet-name">{registration.petName}</span>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-700 uppercase text-xs tracking-wider mb-1">Species/Breed</span>
                        <span className="text-lg font-medium" data-testid="text-species-breed">{registration.species} / {registration.breed}</span>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-700 uppercase text-xs tracking-wider mb-1">Sex/Age</span>
                        <span className="text-lg font-medium" data-testid="text-sex-age">{registration.sex} / {registration.age}</span>
                    </div>
                    <div>
                        <span className="block font-bold text-gray-700 uppercase text-xs tracking-wider mb-1">Color/Mark</span>
                        <span className="text-lg font-medium" data-testid="text-color-mark">{registration.color} / {registration.markOfIdentification}</span>
                    </div>
                </div>
             </div>

             <div className="flex flex-col items-center gap-6">
                {registration.photoUrl ? (
                  <div className="w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
                    <img src={registration.photoUrl} alt="Pet" className="w-full h-full object-cover" data-testid="img-pet-photo" />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    No Photo
                  </div>
                )}
                
                <div className="p-2 bg-white rounded border border-gray-100 shadow-sm" data-testid="container-qr-code">
                  <QRCode 
                    value={`https://pet-registration-kupwara.replit.app/verify/${registration.registrationNumber?.replace(/\//g, '-')}`} 
                    size={100}
                    level="M"
                  />
                </div>
             </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end relative z-10">
          <div className="text-xs text-gray-500 max-w-[300px]">
            <p>This is a computer generated certificate.</p>
            <p>Valid throughout the Union Territory of Jammu & Kashmir.</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b border-gray-400 mb-2"></div>
            <p className="font-bold text-gray-800 uppercase text-sm">Superintendent DVH, Kupwara</p>
            <p className="text-xs text-gray-500">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
