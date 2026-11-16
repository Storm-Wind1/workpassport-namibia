import { createFileRoute, Link } from '@tanstack/react-router';
import { workers } from '@/features/workpassport/data';
import { Profile } from '@/features/workpassport/profile';
import { Empty, pageHead } from '@/features/workpassport/shared';
export const Route=createFileRoute('/talent/$id')({head:()=>pageHead('Worker WorkPassport','Explore a Namibian worker’s self-declared skills, work experience, portfolio and references.'),component:WorkerDetail});
function WorkerDetail(){const {id}=Route.useParams();const worker=workers.find(w=>w.id===id);return worker?<Profile worker={worker}/>:<main className="container page-main"><Empty title="WorkPassport not found"><Link to="/talent">Browse talent</Link></Empty></main>}
