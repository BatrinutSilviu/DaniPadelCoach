"use client";

import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { schedule } from "@/lib/site";

export default function Schedule() {
  const [activeId, setActiveId] = useState(schedule[0].id);
  const active = schedule.find((d) => d.id === activeId) ?? schedule[0];

  return (
    <section id="program" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Program & Disponibilitate"
          title="Zile de Antrenament"
          subtitle={`Organizăm sesiuni constante în ${schedule.length} zile din săptămână. Alege ziua care ți se potrivește.`}
        />

        <div className="mx-auto max-w-4xl">
          <div role="tablist" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {schedule.map((day) => {
              const selected = day.id === active.id;
              return (
                <button
                  key={day.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(day.id)}
                  className={`rounded-xl border-2 p-4 text-center font-bold transition-all ${
                    selected
                      ? "border-brand-forest bg-brand-forest text-white"
                      : "border-brand-gold/30 bg-brand-beigeLight text-brand-forest hover:border-brand-forest"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            className="space-y-4 rounded-2xl border border-brand-gold/30 bg-brand-beigeLight/50 p-6 sm:p-8"
          >
            {active.sessions.map((s) => (
              <div
                key={s.title}
                className="flex flex-col gap-3 rounded-xl border border-brand-gold/20 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h4 className="font-bold text-brand-forest">{s.title}</h4>
                  <p className="text-xs text-gray-500">{s.details}</p>
                </div>
                <span className="text-sm font-bold text-brand-forest">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
