import { describe,it,expect } from 'vitest';
import { matchReasons, dashboardSections, demoRepository, initialState } from './service';
import { jobs,workers } from './data';
describe('WorkPassport rules',()=>{
 it('matches self-declared skills without a rating or previous experience',()=>{expect(matchReasons(jobs[0],{skills:['React'],location:'Rundu'})).toEqual(['Skills match: React']);});
 it('matches location independently of skills',()=>{expect(matchReasons(jobs[0],{skills:[],location:'Windhoek'})).toEqual(['In your area: Windhoek']);});
 it('does not match unrelated skills and locations',()=>{expect(matchReasons(jobs[0],workers[1])).toEqual([]);});
 it('limits job seeker dashboard to employment',()=>{expect(dashboardSections(['Find employment'])).toEqual({employment:true,services:false,hiring:false});});
 it('allows multiple activities including hiring later',()=>{expect(dashboardSections(['Find employment','Offer freelance services','Hire workers'])).toEqual({employment:true,services:true,hiring:true});});
 it('allows business management to access hiring',()=>{expect(dashboardSections(['Manage a business']).hiring).toBe(true);});
 it('persists demo applications and quotations locally',()=>{const state=initialState();state.applications.push({id:'app-1',accountId:'user-1',jobId:'carpenter',message:'I have carpentry experience.'});state.quotes.push({id:'quote-1',accountId:'user-1',workerId:'anna',description:'Design my cafe logo',budget:'4500'});demoRepository.save(state);expect(demoRepository.load().applications[0].jobId).toBe('carpenter');expect(demoRepository.load().quotes[0].budget).toBe('4500');demoRepository.reset();});
});
