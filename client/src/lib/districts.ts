export const KASHMIR_DISTRICTS = [
  'Srinagar', 'Budgam', 'Anantnag', 'Pulwama', 'Kulgam', 'Shopian', 'Baramulla', 'Bandipora', 'Kupwara', 'Ganderbal'
] as const;

export const JAMMU_DISTRICTS = [
  'Jammu', 'Samba', 'Kathua', 'Udhampur', 'Reasi', 'Rajouri', 'Poonch', 'Doda', 'Kishtwar', 'Ramban'
] as const;

export const ALL_DISTRICTS = [...KASHMIR_DISTRICTS, ...JAMMU_DISTRICTS].sort();

export type District = typeof ALL_DISTRICTS[number];
