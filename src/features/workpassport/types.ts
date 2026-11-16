export type Activity = 'Find employment' | 'Offer freelance services' | 'Hire workers' | 'Manage a business';
export const activities: Activity[] = ['Find employment', 'Offer freelance services', 'Hire workers', 'Manage a business'];
export const categories = ['IT', 'Construction', 'Agriculture', 'Cleaning', 'Carpentry', 'Gardening', 'Design', 'General labour'];
export const locations = ['Windhoek', 'Swakopmund', 'Walvis Bay', 'Oshakati', 'Rundu', 'Otjiwarongo'];
export const jobTypes = ['Permanent', 'Temporary gig', 'Freelance project', 'Skilled labour'];
export interface Job { id: string; title: string; company: string; location: string; category: string; type: string; pay: string; description: string; skills: string[]; owner?: string; }
export interface Worker { id: string; name: string; role: string; location: string; skills: string[]; initials: string; available: boolean; bio: string; experience: string[]; portfolio: string[]; references: string[]; }
export interface Account { id: string; name: string; email: string; kind: 'Individual' | 'Business'; activities: Activity[]; location: string; skills: string[]; }
export interface Application { id: string; jobId: string; accountId: string; message: string; }
export interface Quote { id: string; workerId: string; accountId: string; description: string; budget: string; }
export interface Service { id: string; accountId: string; title: string; price: string; }
export interface DemoState { account: Account | null; jobs: Job[]; applications: Application[]; quotes: Quote[]; services: Service[]; }
