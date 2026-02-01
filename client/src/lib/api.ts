import type { PetRegistration, InsertPetRegistration } from '@shared/schema';

export interface VetSession {
  id: number;
  username: string;
  dispensary: string;
  block: string;
  officerName?: string;
}

export async function vetLogin(username: string, password: string): Promise<VetSession> {
  const response = await fetch('/api/vet/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

export async function createRegistration(data: InsertPetRegistration & { submittedBy?: string }): Promise<PetRegistration> {
  const response = await fetch('/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create registration');
  }

  return response.json();
}

export async function getRegistration(registrationNumber: string): Promise<PetRegistration> {
  const response = await fetch(`/api/registrations/${encodeURIComponent(registrationNumber)}`);

  if (!response.ok) {
    throw new Error('Registration not found');
  }

  return response.json();
}

export async function searchRegistrations(params: {
  search?: string;
  district?: string;
  species?: string;
  status?: string;
  dispensary?: string;
}): Promise<PetRegistration[]> {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.set('search', params.search);
  if (params.district) queryParams.set('district', params.district);
  if (params.species) queryParams.set('species', params.species);
  if (params.status) queryParams.set('status', params.status);
  if (params.dispensary) queryParams.set('dispensary', params.dispensary);

  const response = await fetch(`/api/registrations?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch registrations');
  }

  return response.json();
}

export async function updateRegistrationStatus(
  registrationNumber: string, 
  status: string, 
  remarks?: { vetRemarks?: string; authorityRemarks?: string }
): Promise<PetRegistration> {
  const response = await fetch(`/api/registrations/${encodeURIComponent(registrationNumber)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, ...remarks }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update status');
  }

  return response.json();
}

export async function updateRegistrationStatusById(
  id: number, 
  status: string, 
  remarks?: { vetRemarks?: string; authorityRemarks?: string }
): Promise<PetRegistration> {
  const response = await fetch(`/api/registrations/by-id/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, ...remarks }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update status');
  }

  return response.json();
}

export async function getRegistrationById(id: number): Promise<PetRegistration> {
  const response = await fetch(`/api/registrations/by-id/${id}`);

  if (!response.ok) {
    throw new Error('Registration not found');
  }

  return response.json();
}

export async function changeVetPassword(
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/vet/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to change password');
  }

  return response.json();
}
