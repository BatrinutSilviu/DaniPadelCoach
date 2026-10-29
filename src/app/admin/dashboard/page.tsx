import BookingsList from "@/components/admin/BookingsList";
import AvailabilityEditor from "@/components/admin/AvailabilityEditor";
import PricesEditor from "@/components/admin/PricesEditor";
import SlotLengthsEditor from "@/components/admin/SlotLengthsEditor";
import EventsEditor from "@/components/admin/EventsEditor";

export default function DashboardPage() {
  return (
    <div className="space-y-14">
      <section>
        <h2 className="text-2xl font-extrabold text-brand-forest">Programări</h2>
        <div className="mt-4">
          <BookingsList />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-brand-forest">Disponibilitate</h2>
        <div className="mt-4">
          <AvailabilityEditor />
        </div>
        <div className="mt-6">
          <SlotLengthsEditor />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-brand-forest">Prețuri</h2>
        <div className="mt-4">
          <PricesEditor />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-brand-forest">Evenimente</h2>
        <div className="mt-4">
          <EventsEditor />
        </div>
      </section>
    </div>
  );
}
