import { create } from 'zustand';

export type District = 
  | 'Srinagar' | 'Budgam' | 'Anantnag' | 'Pulwama' | 'Kulgam' | 'Shopian' | 'Baramulla' | 'Bandipora' | 'Kupwara' | 'Ganderbal'
  | 'Jammu' | 'Samba' | 'Kathua' | 'Udhampur' | 'Reasi' | 'Rajouri' | 'Poonch' | 'Doda' | 'Kishtwar' | 'Ramban';

export type Species = 'Dog' | 'Cat';

export interface PetRegistration {
  id: string; // Generated ID
  registrationDate: string;
  ownerName: string;
  ownerAddress: string;
  mobile: string;
  email: string;
  district: District;
  species: Species;
  breed: string;
  petName: string;
  sex: 'Male' | 'Female';
  age: string;
  color: string;
  markOfIdentification: string;
  vaccinationStatus: 'Vaccinated' | 'Not Vaccinated';
  vaccinationDate?: string;
  microchipNumber?: string;
  photoUrl?: string; // Blob URL
  otherDetails?: string;
}

interface AppState {
  registrations: PetRegistration[];
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  registerPet: (data: Omit<PetRegistration, 'id' | 'registrationDate'>) => string;
  getRegistration: (id: string) => PetRegistration | undefined;
}

export const useStore = create<AppState>((set, get) => ({
  registrations: [],
  isAuthenticated: false,

  login: (password: string) => {
    if (password === 'admin123') { // Simple mock auth
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => set({ isAuthenticated: false }),

  registerPet: (data) => {
    const state = get();
    const year = new Date().getFullYear();
    
    // Count existing registrations for this district + species to increment serial
    const count = state.registrations.filter(
      r => r.district === data.district && r.species === data.species
    ).length + 1;

    const serial = count.toString().padStart(5, '0');
    const id = `JK/${data.district}/${data.species}/${year}/${serial}`;

    const newRegistration: PetRegistration = {
      ...data,
      id,
      registrationDate: new Date().toISOString().split('T')[0],
    };

    set(state => ({
      registrations: [...state.registrations, newRegistration]
    }));

    return id;
  },

  getRegistration: (id) => {
    return get().registrations.find(r => r.id === id);
  }
}));

export const KASHMIR_DISTRICTS: District[] = [
  'Srinagar', 'Budgam', 'Anantnag', 'Pulwama', 'Kulgam', 'Shopian', 'Baramulla', 'Bandipora', 'Kupwara', 'Ganderbal'
];

export const JAMMU_DISTRICTS: District[] = [
  'Jammu', 'Samba', 'Kathua', 'Udhampur', 'Reasi', 'Rajouri', 'Poonch', 'Doda', 'Kishtwar', 'Ramban'
];

export const ALL_DISTRICTS = [...KASHMIR_DISTRICTS, ...JAMMU_DISTRICTS].sort();
