import BookingsList from "@/components/admin/BookingsList";
import AvailabilityEditor from "@/components/admin/AvailabilityEditor";

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
      </section>
    </div>
  );
}
