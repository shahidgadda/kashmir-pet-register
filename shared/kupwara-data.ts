export const BLOCKS = [
  'Kupwara',
  'Trehgam',
  'Kralpora',
  'Karnah',
  'Sogam',
  'Handwara',
  'DVH'
] as const;

export type Block = typeof BLOCKS[number];

export const BLOCK_DISPENSARIES: Record<Block, string[]> = {
  'Kupwara': ['Kupwara', 'Kandi Kupwara', 'Batpora', 'Drugmulla'],
  'Trehgam': ['Trehgam', 'Jumagund', 'Awoora'],
  'Kralpora': ['Kralpora', 'Budnambal', 'Harie', 'Chowkibal', 'Keran'],
  'Karnah': ['Kandi', 'Chiterkote', 'Nachian'],
  'Sogam': ['Sogam', 'Tikipora', 'Machil', 'Doniwari', 'Kurhama', 'Kalaroos', 'Lalpora'],
  'Handwara': ['Handwara', 'Langate', 'Vilgam', 'Chogal', 'Mawar', 'Shatgund Bala'],
  'DVH': ['DVH']
};

export const ALL_DISPENSARIES = Object.values(BLOCK_DISPENSARIES).flat();

export const DEFAULT_VET_CREDENTIALS: Record<string, { username: string; password: string }> = {
  'Kupwara': { username: 'vet_kupwara', password: 'vet123' },
  'Kandi Kupwara': { username: 'vet_kandi_kupwara', password: 'vet123' },
  'Batpora': { username: 'vet_batpora', password: 'vet123' },
  'Drugmulla': { username: 'vet_drugmulla', password: 'vet123' },
  'Trehgam': { username: 'vet_trehgam', password: 'vet123' },
  'Jumagund': { username: 'vet_jumagund', password: 'vet123' },
  'Awoora': { username: 'vet_awoora', password: 'vet123' },
  'Kralpora': { username: 'vet_kralpora', password: 'vet123' },
  'Budnambal': { username: 'vet_budnambal', password: 'vet123' },
  'Harie': { username: 'vet_harie', password: 'vet123' },
  'Chowkibal': { username: 'vet_chowkibal', password: 'vet123' },
  'Keran': { username: 'vet_keran', password: 'vet123' },
  'Kandi': { username: 'vet_kandi', password: 'vet123' },
  'Chiterkote': { username: 'vet_chiterkote', password: 'vet123' },
  'Nachian': { username: 'vet_nachian', password: 'vet123' },
  'Sogam': { username: 'vet_sogam', password: 'vet123' },
  'Tikipora': { username: 'vet_tikipora', password: 'vet123' },
  'Machil': { username: 'vet_machil', password: 'vet123' },
  'Doniwari': { username: 'vet_doniwari', password: 'vet123' },
  'Kurhama': { username: 'vet_kurhama', password: 'vet123' },
  'Kalaroos': { username: 'vet_kalaroos', password: 'vet123' },
  'Lalpora': { username: 'vet_lalpora', password: 'vet123' },
  'Handwara': { username: 'vet_handwara', password: 'vet123' },
  'Langate': { username: 'vet_langate', password: 'vet123' },
  'Vilgam': { username: 'vet_vilgam', password: 'vet123' },
  'Chogal': { username: 'vet_chogal', password: 'vet123' },
  'Mawar': { username: 'vet_mawar', password: 'vet123' },
  'Shatgund Bala': { username: 'vet_shatgund', password: 'vet123' },
  'DVH': { username: 'vet_dvh', password: 'vet123' },
};
