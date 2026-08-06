import { api } from './client';

export interface Organisation {
  id:           string;
  name:         string;
  slug:         string;   // read-only
  logo:         string | null;
  website:      string | null;
  email:        string | null;
  phone:        string | null;
  isActive:     boolean;
  addrLine1:    string;
  addrLine2:    string | null;
  addrCity:     string;
  addrState:    string;
  addrCountry:  string;
  addrPostCode: string;
  createdAt:    string;
  updatedAt:    string;
}

export type UpdateOrganisationInput = Partial<Omit<Organisation, 'id' | 'slug' | 'createdAt' | 'updatedAt'>>;

export const organisationApi = {
  get:    ():                              Promise<Organisation> => api.get<Organisation>('/admin/organisation'),
  update: (data: UpdateOrganisationInput): Promise<Organisation> => api.patch<Organisation>('/admin/organisation', data),
};
