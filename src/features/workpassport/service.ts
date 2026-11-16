import { jobs } from './data';
import type { Account, DemoState, Job, Worker } from './types';
const KEY = 'workpassport-demo-v1';
export const initialState = (): DemoState => ({account:null,jobs:[...jobs],applications:[],quotes:[],services:[]});
// Device-only persistence boundary. Replace this adapter with the future API client.
export const demoRepository = {
 load(): DemoState { const raw = localStorage.getItem(KEY); if (!raw) return initialState(); const value = JSON.parse(raw) as DemoState; if (!value || !Array.isArray(value.jobs) || !Array.isArray(value.applications) || !Array.isArray(value.quotes) || !Array.isArray(value.services)) throw new Error('Invalid demo data'); return value; },
 save(value: DemoState) { localStorage.setItem(KEY,JSON.stringify(value)); },
 reset() { localStorage.removeItem(KEY); }
};
export function matchReasons(job: Job, profile: Pick<Account | Worker,'skills'|'location'>): string[] {
 const reasons: string[] = [];
 const skills = job.skills.filter(s => profile.skills.some(p => p.toLowerCase() === s.toLowerCase()));
 if (skills.length) reasons.push(`Skills match: ${skills.join(', ')}`);
 if (job.location === profile.location) reasons.push(`In your area: ${job.location}`);
 return reasons;
}
export function dashboardSections(activities: Account['activities']) {
 return { employment:activities.includes('Find employment'), services:activities.includes('Offer freelance services'), hiring:activities.includes('Hire workers') || activities.includes('Manage a business') };
}
