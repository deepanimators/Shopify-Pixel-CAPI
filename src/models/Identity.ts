export interface IdentityRecord {
  userId: string;
  emails: string[];
  phones: string[];
  externalIds: string[];
  domains: string[];
  fbps: string[];
  fbcs: string[];
  lastSeen: Date;
  createdAt: Date;
}
