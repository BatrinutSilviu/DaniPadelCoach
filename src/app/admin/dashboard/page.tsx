import BookingsList from "@/components/admin/BookingsList";
import AvailabilityEditor from "@/components/admin/AvailabilityEditor";
import PricesEditor from "@/components/admin/PricesEditor";
import SlotLengthsEditor from "@/components/admin/SlotLengthsEditor";
import RecurringBlocksEditor from "@/components/admin/RecurringBlocksEditor";
import EventsEditor from "@/components/admin/EventsEditor";
import SponsorsEditor from "@/components/admin/SponsorsEditor";

export default function DashboardPage() {
  return (
    <div className="space-y-10 sm:space-y-14">
      <section id="programari" className="scroll-mt-16">
        <h2 className="text-2xl font-extrabold text-brand-forest">Programări</h2>
        <div className="mt-4">
          <BookingsList />
        </div>
      </section>

      <section id="disponibilitate" className="scroll-mt-16">
        <h2 className="text-2xl font-extrabold text-brand-forest">Disponibilitate</h2>
        <div className="mt-4">
          <AvailabilityEditor />
        </div>
        <div className="mt-6">
          <SlotLengthsEditor />
        </div>
        <div className="mt-6">
          <RecurringBlocksEditor />
        </div>
      </section>

      <section id="preturi" className="scroll-mt-16">
        <h2 className="text-2xl font-extrabold text-brand-forest">Prețuri</h2>
        <div className="mt-4">
          <PricesEditor />
        </div>
      </section>

      <section id="evenimente" className="scroll-mt-16">
        <h2 className="text-2xl font-extrabold text-brand-forest">Evenimente</h2>
        <div className="mt-4">
          <EventsEditor />
        </div>
      </section>

      <section id="sponsori" className="scroll-mt-16">
        <h2 className="text-2xl font-extrabold text-brand-forest">Sponsori</h2>
        <div className="mt-4">
          <SponsorsEditor />
        </div>
      </section>
    </div>
  );
}
