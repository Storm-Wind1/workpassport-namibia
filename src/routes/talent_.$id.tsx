import { createFileRoute, Link } from "@tanstack/react-router";
import { directoryWorkers } from "@/features/workpassport/service";
import { useDemo } from "@/features/workpassport/context";
import { Profile } from "@/features/workpassport/profile";
import { Empty, pageHead } from "@/features/workpassport/shared";
export const Route = createFileRoute("/talent_/$id")({
  head: () =>
    pageHead(
      "Worker WorkPassport",
      "Explore a Namibian worker’s self-declared skills, work experience, portfolio and references.",
    ),
  component: WorkerDetail,
});
function WorkerDetail() {
  const { id } = Route.useParams();
  const { state, ready } = useDemo();
  if (!ready) return <main className="loading-state">Loading worker profile…</main>;
  const worker = directoryWorkers(state).find((w) => w.id === id);
  return worker ? (
    <Profile worker={worker} own={state.account?.id === id} portable={!state.profiles?.some(a => a.id === id)} />
  ) : (
    <main className="container page-main">
      <Empty title="WorkPassport not found">
        <Link to="/talent">Browse talent</Link>
      </Empty>
    </main>
  );
}
