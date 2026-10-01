import React, { useState } from 'react';
import {
  SINHARAJA_STRATA,
  ACCESSION_METADATA,
  IMAGE_ASSETS,
  MicrohabitatStratum,
} from '../data/scolopendraData';

export const SinharajaMonograph: React.FC = () => {
  const [activeStratum, setActiveStratum] = useState<MicrohabitatStratum>(
    SINHARAJA_STRATA[0]
  );
  const [habitatImgError, setHabitatImgError] = useState<boolean>(false);

  return (
    <section
      id="sinharaja-ecology"
      className="max-w-[1360px] mx-auto px-6 py-16 border-b border-[#E4DFD5]"
    >
      {/* Section Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78716C] mb-2">
          <span>03. Ecological & Curatorial Monograph</span>
          <span aria-hidden="true">·</span>
          <span>Sinharaja UNESCO Biosphere Reserve</span>
          <span aria-hidden="true">·</span>
          <span>6°24′N 80°24′E</span>
        </div>
        <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-[#1C1917] tracking-tight text-balance">
          In the Heart of Sinharaja: Microhabitat Strata & Natural Heritage
        </h2>
      </div>

      {/* Interactive Rainforest Microhabitat Stratum Explorer */}
      <div className="mb-16 p-6 lg:p-8 rounded-xl bg-[#F4F0E8] border border-[#DFD8CA]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#DFD8CA]">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
              Sinharaja Elevational & Microhabitat Transect
            </h3>
            <p className="text-xs text-[#57534E] mt-0.5">
              Explore the three primary ecological niches occupied by Scolopendra hardwickei across the Sinharaja rainforest massif.
            </p>
          </div>

          {/* Interactive Stratum Selector Buttons */}
          <div
            role="group"
            aria-label="Sinharaja elevation strata"
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#EBE6DF] rounded-lg border border-[#DCD5C9]"
          >
            {SINHARAJA_STRATA.map((stratum) => {
              const isSelected = activeStratum.id === stratum.id;
              return (
                <button
                  key={stratum.id}
                  type="button"
                  onClick={() => setActiveStratum(stratum)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                      : 'text-[#44403C] hover:text-[#1C1917]'
                  }`}
                >
                  {stratum.name.split(' ')[0]} {stratum.name.split(' ')[1]} ({stratum.elevationMeters.split(' ')[0]} m)
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stratum Data & Habitat View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#9A3412] tabular-nums mb-1">
                <span>ELEVATION: {activeStratum.elevationMeters}</span>
                <span aria-hidden="true">·</span>
                <span>PEAK FORAGING: {activeStratum.nocturnalPeakWindow}</span>
              </div>
              <h4 className="font-serif text-2xl font-semibold text-[#1C1917]">
                {activeStratum.name}
              </h4>
              <p className="text-xs text-[#57534E] mt-0.5">{activeStratum.forestZone}</p>
            </div>

            <p className="text-base text-[#292524] leading-relaxed max-w-[68ch]">
              {activeStratum.microhabitatDescription}
            </p>

            {/* Telemetry Grid (Tabular Numerals) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-lg bg-[#EBE6DF] border border-[#DCD5C9]">
                <div className="text-[11px] uppercase tracking-wider text-[#78716C]">
                  Relative Humidity
                </div>
                <div className="font-mono text-base font-semibold text-[#1C1917] mt-0.5 tabular-nums">
                  {activeStratum.humidityPct}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#EBE6DF] border border-[#DCD5C9]">
                <div className="text-[11px] uppercase tracking-wider text-[#78716C]">
                  Substrate Thermal Range
                </div>
                <div className="font-mono text-base font-semibold text-[#1C1917] mt-0.5 tabular-nums">
                  {activeStratum.substrateTempC}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#EBE6DF] border border-[#DCD5C9]">
                <div className="text-[11px] uppercase tracking-wider text-[#78716C]">
                  Canopy Architecture
                </div>
                <div className="font-mono text-sm font-semibold text-[#1C1917] mt-0.5 tabular-nums">
                  {activeStratum.canopyClosurePct}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DFD8CA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#44403C]">
              <div>
                <strong className="text-[#1C1917]">Trophic Guild & Prey:</strong>{' '}
                {activeStratum.primaryPrey}
              </div>
            </div>
          </div>

          {/* Habitat Photography Figure */}
          <figure className="lg:col-span-5">
            <div className="rounded-lg overflow-hidden bg-[#14261C] aspect-16/9 border border-[#DCD5C9]">
              {!habitatImgError ? (
                <img
                  src={IMAGE_ASSETS.sinharajaCanopy}
                  alt="Mossy buttress roots and dipterocarp forest floor in the heart of Sinharaja Rainforest, Sri Lanka"
                  referrerPolicy="no-referrer"
                  onError={() => setHabitatImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-stone-200">
                  <span className="font-serif italic text-lg">
                    Sinharaja Lowland Dipterocarp Sanctuary
                  </span>
                  <span className="text-xs text-stone-400 mt-1">
                    UNESCO World Heritage Biosphere · 8,864 Hectares
                  </span>
                </div>
              )}
            </div>
            <figcaption className="mt-2.5 text-xs font-serif italic text-[#57534E]">
              Fig. 3 — Buttress root microhabitat and damp dipterocarp leaf litter in the Sinharaja core reserve. Conservation status: {activeStratum.conservationNote}
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Pattern D: Two-Column Asymmetric Reading Canvas (70% Main Essay / 30% Margin Notes & Museum Accession) */}
      <div id="archival-monograph" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Editorial Essay (8 cols) */}
        <article className="lg:col-span-8 space-y-6">
          <div className="text-xs uppercase tracking-widest text-[#78716C]">
            Curatorial Essay · Monograph Vol. XIV
          </div>
          <h3 className="font-serif text-3xl lg:text-4xl font-medium text-[#1C1917] tracking-tight text-balance">
            Paradox of the Forest Floor: Aposematic Brilliance in Perpetual Twilight
          </h3>

          <div className="border-b border-[#D6CEBE] pb-2 text-xs text-[#57534E] flex flex-wrap items-center gap-2">
            <span>By Department of Tropical Myriapodology</span>
            <span aria-hidden="true">·</span>
            <span>Sinharaja Field Station Archive</span>
            <span aria-hidden="true">·</span>
            <span>6 min reading time</span>
          </div>

          <p className="text-base text-[#1C1917] leading-relaxed max-w-2xl first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#9A3412]">
            In the heart of Sinharaja Rainforest lives <em>Scolopendra hardwickei</em> — Sri Lanka’s banded giant centipede. Cloaked in brilliant orange and deep blue-black armour, it glides across the forest floor in a mesmerising wave of motion. While most nocturnal arthropods of the tropical understory evolve muted umber, ochre, or moss-green cuticles to dissolve into the rotting dipterocarp humus, this extraordinary chilopod announces its presence through one of the sharpest chromatic contrasts in the animal kingdom.
          </p>

          <p className="text-base text-[#1C1917] leading-relaxed max-w-2xl">
            First formally described by the English naturalist George Newport in 1844 from specimens collected during early natural history surveys, the Sri Lankan island form of <em>Scolopendra hardwickei</em> exhibits a remarkably consistent metameric rhythm. Whereas mainland Indian populations occasionally display irregular or coalesced dark saddles, the Sinharaja lineage maintains crisp, high-saturation vermilion tergites alternating with mirror-glossy indigo-black segments along the entire trunk.
          </p>

          {/* Editorial Pull Quote */}
          <blockquote className="my-8 py-6 px-6 border-l-2 border-[#D94E1F] bg-[#F4F0E8] rounded-r-lg max-w-2xl">
            <p className="font-serif italic text-2xl lg:text-3xl text-[#1C1917] leading-snug">
              “To watch twenty pairs of amber legs translate a mathematical phase wave into silent, fluid velocity across uneven mossy roots is to witness four hundred million years of arthropod mechanical perfection.”
            </p>
            <footer className="mt-3 text-xs font-sans not-italic uppercase tracking-wider text-[#57534E]">
              — Field Observation Log, Kudawa Entrance Sector, Sinharaja Reserve
            </footer>
          </blockquote>

          <p className="text-base text-[#1C1917] leading-relaxed max-w-2xl">
            Biomechanical high-speed videography reveals why its progression appears so effortlessly liquid. Unlike hexapods that rely on alternating tripod stances, <em>Scolopendra hardwickei</em> propagates a retrograde metachronal wave from its anterior walking appendages toward the posterior. Consecutive legs touch down at nearly identical substrate coordinates—a strategy that minimizes energy lost to slipping on wet biofilm while allowing the centipede’s body to pour through root interstices narrower than its own dorsal width.
          </p>

          <p className="text-base text-[#1C1917] leading-relaxed max-w-2xl">
            Both beauty and power, <em>Scolopendra hardwickei</em> serves as a keystone nocturnal regulator of the rainforest floor food web. Protected within the damp, mist-laden sanctuary of Sinharaja, it remains an irreplaceable living emblem of Sri Lanka’s evolutionary heritage.
          </p>
        </article>

        {/* Margin Sidebar & Museum Accession Record (4 cols) */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Museum Accession Metadata Grid (Pattern B) */}
          <div className="p-6 rounded-xl bg-[#F4F0E8] border border-[#DFD8CA]">
            <div className="text-xs uppercase tracking-widest text-[#78716C] mb-1">
              Specimen Registry
            </div>
            <h4 className="font-serif text-xl font-semibold text-[#1C1917] pb-3 border-b border-[#D6CEBE]">
              Museum Accession Record
            </h4>

            <dl className="divide-y divide-[#DFD8CA] text-xs">
              {ACCESSION_METADATA.map((item) => (
                <div key={item.label} className="py-3 flex flex-col gap-0.5">
                  <dt className="uppercase tracking-wider text-[10px] text-[#78716C] font-medium">
                    {item.label}
                  </dt>
                  <dd className="text-[#1C1917] font-medium font-mono text-xs tabular-nums">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Margin Note Callout */}
          <div className="p-5 rounded-xl bg-[#EBE6DF] border border-[#DCD5C9] space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9A3412]">
              Margin Note · Optical Physics
            </div>
            <h5 className="font-serif text-lg font-semibold text-[#1C1917]">
              Structural Iridescence in Tergites II–XX
            </h5>
            <p className="text-xs text-[#292524] leading-relaxed">
              The dark bands of <em>Scolopendra hardwickei</em> are not pure melanin black; multilayer thin-film interference within the outer epicuticle refracts oblique rainforest light into a deep cobalt and indigo sheen.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};
