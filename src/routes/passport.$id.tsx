import { createFileRoute, Link } from '@tanstack/react-router';
import { Profile } from '@/features/workpassport/profile';
import { useDemo } from '@/features/workpassport/context';
import { Empty, pageHead } from '@/features/workpassport/shared';
export const Route=createFileRoute('/passport/$id')({head:()=>pageHead('Your digital WorkPassport','Your demo WorkPassport brings your skills and ambitions together in one personal work profile.'),component:Passport});
function Passport(){const {id}=Route.useParams();const {state,ready}=useDemo();const a=state.account;if(!ready)return <main className="loading-state">Loading WorkPassport…</main>;return a?.id===id?<Profile own worker={{id:a.id,name:a.name,role:a.kind==='Business'?'Business owner':'Independent professional',location:a.location,skills:a.skills,initials:a.name.split(' ').slice(0,2).map(x=>x[0]).join(''),available:true,bio:`Based in ${a.location}, ready for new connections and opportunities.`,experience:[],portfolio:[],references:[]}}/>:<main className="container page-main"><Empty title="This device-only demo passport is not available"><Link to="/talent">Explore shareable demo profiles</Link></Empty></main>}
