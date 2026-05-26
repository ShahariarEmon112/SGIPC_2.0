import { EventsList } from "@/components/public/EventsList";
import { serverFetch } from "@/lib/server-api";
import type { Event } from "@/types/api";

export const metadata = { title: "Events · SGIPC" };

export default async function EventsPage() {
  const events = (await serverFetch<Event[]>("/events")) ?? [];

  return (
    <main className="container py-16">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-wider text-primary">Past events</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Events</h1>
        <p className="mt-2 text-muted-foreground">
          Bootcamps, contests, and meetups hosted by SGIPC over the years.
        </p>
      </div>
      <EventsList events={events} />
    </main>
  );
}
