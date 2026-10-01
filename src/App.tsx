/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowDownRight, BookOpen, X } from 'lucide-react';
import { IMAGE_ASSETS } from './data/scolopendraData';
import { LocomotionSandbox } from './components/LocomotionSandbox';
import { AnatomicalAtlas } from './components/AnatomicalAtlas';
import { SinharajaMonograph } from './components/SinharajaMonograph';

const COMPARATIVE_TAXA = [
  {
    species: 'Scolopendra hardwickei (Sinharaja Morph)',
    authority: 'Newport, 1844',
    maxLengthMm: '165 – 185 mm',
    coloration: 'Alternating high-contrast Vermilion Orange & Iridescent Blue-Black tergites',
    spiracleForm: 'Triangular cribriform valves on segments 3, 5, 8, 10, 12, 14, 16, 18, 20',
    distribution: 'Wet-zone rainforests & mid-elevation ridges of Sri Lanka (Sinharaja)',
  },
  {
    species: 'Scolopendra subspinipes',
    authority: 'Leach, 1815',
    maxLengthMm: '160 – 200 mm',
    coloration: 'Uniform mahogany brown or dark chestnut tergites with yellow-orange legs',
    spiracleForm: 'Oval-triangular cribriform valves along standard scolopendrid segments',
    distribution: 'Pantropical lowland habitats across South & Southeast Asia',
  },
  {
    species: 'Scolopendra dehaani',
    authority: 'Brandt, 1840',
    maxLengthMm: '200 – 250 mm',
    coloration: 'Unicolored cherry-red, burnt umber, or dark olive-brown dorsal plates',
    spiracleForm: 'Large laterally compressed spiracular atria',
    distribution: 'Mainland Southeast Asia & Indo-Malayan archipelago',
  },
];

export default function App() {
  const [heroImgError, setHeroImgError] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex flex-col">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-xs border-b border-[#E4DFD5] px-6 py-4">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="font-serif text-xl font-bold tracking-tight text-[#1C1917] whitespace-nowrap"
          >
            Scolopendra hardwickei
          </a>

          {/* Zone 2: 4 clean text navigation links */}
          <nav
            aria-label="Primary Monograph Navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[#57534E]"
          >
            <a
              href="#locomotion-lab"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Locomotion Lab
            </a>
            <a
              href="#anatomical-atlas"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Anatomical Atlas
            </a>
            <a
              href="#sinharaja-ecology"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Sinharaja Ecology
            </a>
            <a
              href="#archival-monograph"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Archival Monograph
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDossierOpen(true)}
              className="px-4 py-2 text-xs font-medium text-[#FBF9F5] bg-[#1C1917] rounded-lg hover:bg-[#292524] transition-colors whitespace-nowrap cursor-pointer"
            >
              Taxonomic Field Dossier
            </button>
          </div>
        </div>
      </header>

      {/* MAIN EXHIBITION CONTENT */}
      <main className="flex-1">
        {/* HERO EXHIBITION MARQUEE */}
        <section className="max-w-[1360px] mx-auto px-6 pt-8 pb-12 border-b border-[#E4DFD5]">
          <div className="relative rounded-2xl overflow-hidden bg-[#0B1410] min-h-[520px] lg:min-h-[580px] flex flex-col justify-end border border-[#292524]">
            {/* Hero Macro Wildlife Photograph with Fallback */}
            {!heroImgError ? (
              <img
                src={IMAGE_ASSETS.heroMacro}
                alt="Scolopendra hardwickei, Sri Lanka's banded giant centipede in brilliant orange and deep blue-black armor gliding across the Sinharaja Rainforest floor"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgError(true)}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0B1410] via-[#14261C] to-[#0F172A]" />
            )}

            {/* Measured Contrast Scrim for WCAG AA Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/15" />

            {/* Hero Editorial Content */}
            <div className="relative z-10 p-8 sm:p-12 lg:p-14 max-w-4xl space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-amber-300/90 font-medium">
                <span>Sinharaja Rainforest Biosphere</span>
                <span aria-hidden="true">·</span>
                <span>Chilopoda : Scolopendromorpha</span>
                <span aria-hidden="true">·</span>
                <span>Endemic Island Heritage</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#FBF9F5] tracking-tight leading-[1.08] text-balance">
                Scolopendra hardwickei — Sri Lanka’s Banded Giant Centipede
              </h1>

              <p className="text-base sm:text-lg text-stone-200 leading-relaxed max-w-2xl">
                In the heart of Sinharaja Rainforest lives <em className="font-serif text-xl text-amber-200">Scolopendra hardwickei</em> — Sri Lanka’s banded giant centipede. Cloaked in brilliant orange and deep blue-black armour, it glides across the forest floor in a mesmerising wave of motion. Found nowhere else in this form, it is both beauty and power — a true icon of Sri Lanka’s extraordinary natural heritage.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#locomotion-lab"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#D94E1F] text-white text-xs font-semibold tracking-wide hover:bg-[#B83710] transition-colors whitespace-nowrap"
                >
                  Explore Locomotion Wave Simulator
                  <ArrowDownRight className="w-4 h-4" />
                </a>
                <a
                  href="#anatomical-atlas"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 text-[#FBF9F5] border border-white/25 text-xs font-medium hover:bg-white/20 transition-colors whitespace-nowrap"
                >
                  Inspect 21-Tergite Armor Atlas
                </a>
              </div>
            </div>
          </div>

          {/* Operational Utility & Morphometric Ribbon (Pattern A) */}
          <div className="mt-4 px-5 py-3.5 rounded-xl bg-[#F4F0E8] border border-[#DFD8CA] flex flex-wrap items-center justify-between gap-4 text-xs text-[#44403C]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                <strong className="text-[#1C1917]">Locality:</strong> Sinharaja Lowland Wet Zone (6°24′N 80°24′E)
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="text-[#1C1917]">Armor Formula:</strong> 21 Alternating Vermilion &amp; Blue-Black Tergites
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="text-[#1C1917]">Gait Mechanism:</strong> Retrograde Metachronal Wave
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDossierOpen(true)}
              className="text-xs font-semibold text-[#9A3412] hover:text-[#7C2D12] underline underline-offset-4 whitespace-nowrap cursor-pointer"
            >
              Compare Scolopendrid Taxa →
            </button>
          </div>
        </section>

        {/* SECTION 01: INTERACTIVE BIOMECHANICAL LOCOMOTION SANDBOX */}
        <LocomotionSandbox />

        {/* SECTION 02: INTERACTIVE 21-SEGMENT ANATOMICAL & TERGITE DISSECTION ATLAS */}
        <AnatomicalAtlas />

        {/* SECTION 03: SINHARAJA RAINFOREST MICROHABITAT & ARCHIVAL MONOGRAPH */}
        <SinharajaMonograph />
      </main>

      {/* QUIET INSTITUTIONAL FOOTER */}
      <footer className="bg-[#F4F0E8] border-t border-[#E4DFD5] px-6 py-10 text-xs text-[#57534E]">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-serif text-base font-semibold text-[#1C1917]">
              Sinharaja Natural History &amp; Biomechanics Monograph
            </div>
            <div>
              Dedicated to the conservation of Sri Lanka’s endemic myriapod fauna and primary dipterocarp rainforest ecosystems.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#locomotion-lab" className="hover:text-[#1C1917] transition-colors">
              Locomotion Lab
            </a>
            <a href="#anatomical-atlas" className="hover:text-[#1C1917] transition-colors">
              Anatomical Atlas
            </a>
            <a href="#sinharaja-ecology" className="hover:text-[#1C1917] transition-colors">
              Sinharaja Ecology
            </a>
            <button
              type="button"
              onClick={() => setIsDossierOpen(true)}
              className="text-[#9A3412] font-medium hover:underline underline-offset-4 cursor-pointer"
            >
              Taxonomic Dossier
            </button>
          </div>
        </div>
      </footer>

      {/* TAXONOMIC FIELD DOSSIER MODAL */}
      {isDossierOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Taxonomic Field Dossier: Scolopendra hardwickei"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsDossierOpen(false)}
        >
          <div
            className="max-w-3xl w-full bg-[#FBF9F5] rounded-xl border border-[#DFD8CA] shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#F4F0E8] border-b border-[#DFD8CA]">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#9A3412]" />
                <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                  Taxonomic &amp; Field Observation Dossier — Scolopendra hardwickei
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDossierOpen(false)}
                className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#EBE6DF] transition-colors cursor-pointer"
                aria-label="Close taxonomic dossier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#292524]">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-2">
                  Diagnostic Comparison with Sympatric Asian Scolopendrids
                </h3>
                <div className="overflow-x-auto border border-[#DFD8CA] rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#EBE6DF] text-[#1C1917] border-b border-[#DFD8CA]">
                        <th className="p-3 font-semibold">Taxon</th>
                        <th className="p-3 font-semibold">Adult Length</th>
                        <th className="p-3 font-semibold">Dorsal Tergite Chromatics</th>
                        <th className="p-3 font-semibold">Primary Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4DFD5] bg-[#FBF9F5]">
                      {COMPARATIVE_TAXA.map((row) => (
                        <tr key={row.species}>
                          <td className="p-3 font-serif italic font-semibold text-sm text-[#1C1917]">
                            {row.species}
                            <div className="font-sans not-italic text-[11px] font-normal text-[#78716C]">
                              {row.authority}
                            </div>
                          </td>
                          <td className="p-3 font-mono tabular-nums whitespace-nowrap">
                            {row.maxLengthMm}
                          </td>
                          <td className="p-3">{row.coloration}</td>
                          <td className="p-3 text-[#57534E]">{row.distribution}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#F4F0E8] border border-[#DFD8CA]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9A3412] mb-1.5">
                    Sinharaja Field Ethics &amp; Legal Protection
                  </h4>
                  <p className="text-xs leading-relaxed text-[#292524]">
                    All flora and fauna within the Sinharaja Forest Reserve are strictly protected under the Fauna and Flora Protection Ordinance of Sri Lanka. Disturbing rotting logs, turning exfoliating rock slabs, or collecting specimens is prohibited. Observe nocturnal foraging from established trails using diffused red-spectrum illumination.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#F4F0E8] border border-[#DFD8CA]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A] mb-1.5">
                    Toxinology &amp; Defensive Behavior
                  </h4>
                  <p className="text-xs leading-relaxed text-[#292524]">
                    <em>Scolopendra hardwickei</em> is non-aggressive toward humans and relies on its vivid orange-and-black banding to deter disturbance. If compressed, its forcipules deliver a painful defensive envenomation characterized by localized edema and transient neuropathic pain; hot-water immersion (42–45°C) denatures thermolabile venom peptides.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#F4F0E8] border-t border-[#DFD8CA] flex justify-end">
              <button
                type="button"
                onClick={() => setIsDossierOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#1C1917] text-[#FBF9F5] text-xs font-medium hover:bg-[#292524] transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
