import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import {
  ANATOMICAL_REGIONS,
  TRUNK_SEGMENTS,
  IMAGE_ASSETS,
  AnatomicalRegion,
} from '../data/scolopendraData';

export const AnatomicalAtlas: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<AnatomicalRegion>(
    ANATOMICAL_REGIONS[1] // Default to Forcipular Venom Apparatus
  );
  const [filterMode, setFilterMode] = useState<'all' | 'orange' | 'blue-black' | 'spiracles'>('all');
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    title: string;
    caption: string;
  } | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const filteredSegments = TRUNK_SEGMENTS.filter((seg) => {
    if (filterMode === 'orange') return seg.tergiteColor === 'orange';
    if (filterMode === 'blue-black') return seg.tergiteColor === 'blue-black';
    if (filterMode === 'spiracles') return seg.hasSpiracle;
    return true;
  });

  const handleRegionSelect = (region: AnatomicalRegion) => {
    setSelectedRegion(region);
  };

  return (
    <section
      id="anatomical-atlas"
      className="max-w-[1360px] mx-auto px-6 py-16 border-b border-[#E4DFD5]"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78716C] mb-2">
            <span>02. Morphological Monograph</span>
            <span aria-hidden="true">·</span>
            <span>Exoskeletal Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Venom & Sensory Systems</span>
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-[#1C1917] tracking-tight text-balance">
            Armour of Vermilion and Midnight: Interactive Anatomical Atlas
          </h2>
        </div>

        {/* Segment Filter Controls */}
        <div
          role="group"
          aria-label="Filter trunk segments by anatomical attribute"
          className="flex flex-wrap items-center gap-1 p-1.5 bg-[#EBE6DF] rounded-lg border border-[#DCD5C9]"
        >
          {(
            [
              { id: 'all', label: 'All 21 Tergites' },
              { id: 'orange', label: 'Vermilion Bands (11)' },
              { id: 'blue-black', label: 'Blue-Black Bands (10)' },
              { id: 'spiracles', label: 'Spiraculate Segments (9)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 21-Tergite Dorsal Armor Schematic Bar */}
      <div className="p-6 rounded-xl bg-[#F4F0E8] border border-[#DFD8CA] mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1C1917]">
              Dorsal Chromatic Banding & Spiracle Map (Segments I – XXI)
            </h3>
            <p className="text-xs text-[#57534E]">
              Select any anatomical system below or filter the 21 sclerotized tergite plates to examine cuticular dimensions and pleural spiracle valves.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[#44403C] tabular-nums">
            <span>Showing: {filteredSegments.length} / 21 segments</span>
            <span aria-hidden="true">·</span>
            <span>Adult Scale: 168.4 mm</span>
          </div>
        </div>

        {/* Visual Dorsal Segment Chain */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px] flex items-center justify-between gap-1.5 py-4 px-3 bg-[#EAE4D8] rounded-lg border border-[#DCD5C9]">
            {TRUNK_SEGMENTS.map((seg) => {
              const isDimmed =
                (filterMode === 'orange' && seg.tergiteColor !== 'orange') ||
                (filterMode === 'blue-black' && seg.tergiteColor !== 'blue-black') ||
                (filterMode === 'spiracles' && !seg.hasSpiracle);

              const mappedRegionId =
                seg.segmentNumber === 1
                  ? 'cephalic'
                  : seg.segmentNumber === 21
                  ? 'ultimate'
                  : seg.hasSpiracle && selectedRegion.id === 'spiracles'
                  ? 'spiracles'
                  : 'tergites';

              const isHighlightedRegion = selectedRegion.id === mappedRegionId;

              const heightPx = Math.round(seg.widthMm * 4.2);

              return (
                <button
                  key={seg.segmentNumber}
                  type="button"
                  onClick={() => {
                    const targetRegion =
                      ANATOMICAL_REGIONS.find((r) => r.id === mappedRegionId) ||
                      ANATOMICAL_REGIONS[2];
                    setSelectedRegion(targetRegion);
                  }}
                  style={{ height: `${heightPx}px` }}
                  className={`relative flex-1 rounded-md flex flex-col items-center justify-between py-1.5 transition-opacity cursor-pointer border ${
                    isDimmed ? 'opacity-20' : 'opacity-100'
                  } ${
                    seg.tergiteColor === 'orange'
                      ? 'bg-[#D94E1F] text-white border-[#B83710]'
                      : 'bg-[#0F172A] text-stone-100 border-[#334155]'
                  } ${isHighlightedRegion ? 'ring-2 ring-offset-1 ring-[#1C1917]' : ''}`}
                  title={`Segment ${seg.segmentNumber} (${seg.colorLabel}) — ${seg.widthMm}mm W`}
                >
                  <span className="font-mono text-[10px] font-semibold tabular-nums">
                    {seg.segmentNumber}
                  </span>
                  {seg.hasSpiracle && (
                    <span
                      className="w-2 h-2 rounded-full bg-sky-300 ring-1 ring-slate-900"
                      title="Cribriform Tracheal Spiracle"
                    />
                  )}
                  <span className="font-mono text-[9px] opacity-80 tabular-nums">
                    {seg.widthMm}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 text-xs text-[#57534E]">
          <div className="flex items-center gap-4">
            <span>
              <strong className="text-[#D94E1F]">■</strong> Flame Vermilion Tergite (#D94E1F)
            </span>
            <span>
              <strong className="text-[#0F172A]">■</strong> Iridescent Blue-Black Tergite (#0F172A)
            </span>
            <span>
              <strong className="text-sky-600">●</strong> Pleural Cribriform Spiracle (Segs 3, 5, 8, 10, 12, 14, 16, 18, 20)
            </span>
          </div>
          <span className="font-mono text-[11px] tabular-nums">
            Numbers inside plates indicate segment index (top) and dorsal width in mm (bottom)
          </span>
        </div>
      </div>

      {/* Main Two-Column Anatomical System Inspector + Archival Specimen Plates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT COLUMN (7 cols): 5 Anatomical Systems Selector & Detailed Dissection Readout */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {ANATOMICAL_REGIONS.map((region) => {
              const isSelected = selectedRegion.id === region.id;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => handleRegionSelect(region)}
                  className={`p-3 rounded-lg text-left transition-colors border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917]'
                      : 'bg-[#F4F0E8] text-[#1C1917] border-[#DFD8CA] hover:bg-[#EBE6DF]'
                  }`}
                >
                  <div
                    className={`font-mono text-xs mb-1 tabular-nums ${
                      isSelected ? 'text-[#D94E1F]' : 'text-[#78716C]'
                    }`}
                  >
                    {region.indexNumber}
                  </div>
                  <div className="text-xs font-semibold leading-snug line-clamp-2">
                    {region.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Region Deep-Dive Specification Card */}
          <div className="p-8 rounded-xl bg-[#F4F0E8] border border-[#DFD8CA] space-y-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#DFD8CA] pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#78716C] font-mono mb-1">
                  <span>SYSTEM {selectedRegion.indexNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span className="italic font-serif text-sm text-[#44403C]">
                    {selectedRegion.latinTerm}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedRegion.segmentRange}</span>
                </div>
                <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-[#1C1917]">
                  {selectedRegion.title}
                </h3>
              </div>

              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-[#78716C]">
                  {selectedRegion.keyMetricLabel}
                </div>
                <div className="font-mono text-sm font-semibold text-[#D94E1F] tabular-nums">
                  {selectedRegion.keyMetricValue}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1">
                  Morphological Overview
                </h4>
                <p className="text-base text-[#1C1917] leading-relaxed max-w-[68ch]">
                  {selectedRegion.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded-lg bg-[#EBE6DF] border border-[#DCD5C9]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9A3412] mb-1.5">
                    Functional Biomechanics
                  </h4>
                  <p className="text-sm text-[#292524] leading-relaxed">
                    {selectedRegion.biomechanics}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#EBE6DF] border border-[#DCD5C9]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A] mb-1.5">
                    Ultrastructure & Biochemistry
                  </h4>
                  <p className="text-sm text-[#292524] leading-relaxed">
                    {selectedRegion.biochemistryOrStructure}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Archival Lithograph & Macro Exoskeleton Plates */}
        <div className="lg:col-span-5 space-y-6">
          {/* Plate 1: 19th-Century Natural History Lithograph */}
          <figure className="p-4 rounded-xl bg-[#F4F0E8] border border-[#DFD8CA]">
            <div className="relative rounded-lg overflow-hidden bg-[#EBE6DF] aspect-4/3 group">
              {!imgErrors.litho ? (
                <img
                  src={IMAGE_ASSETS.lithographPlate}
                  alt="Scientific natural history lithograph plate illustrating Scolopendra hardwickei dorsal banding and ventral forcipules"
                  referrerPolicy="no-referrer"
                  onError={() => setImgErrors((prev) => ({ ...prev, litho: true }))}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#EBE6DF] text-[#57534E]">
                  <span className="font-serif italic text-lg text-[#1C1917]">
                    Plate IV — Scolopendra hardwickei (Newport, 1844)
                  </span>
                  <span className="text-xs mt-1">
                    Archival Copperplate Lithograph · Ceylon Natural History Collection
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  setLightboxImage({
                    src: IMAGE_ASSETS.lithographPlate,
                    title: 'Plate IV — Scolopendra hardwickei (Newport, 1844)',
                    caption:
                      'Comparative dorsal and ventral anatomical study illustrating the 21 alternating vermilion and blue-black tergites, cephalic shield, and maxilliped venom claws.',
                  })
                }
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-md bg-[#1C1917]/85 text-[#FBF9F5] text-xs font-medium flex items-center gap-1.5 hover:bg-[#1C1917] transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Inspect Plate
              </button>
            </div>
            <figcaption className="mt-3 flex items-baseline justify-between gap-2 text-xs font-serif italic text-[#57534E]">
              <span>
                Fig. 1 — Archival lithograph plate of the Ceylon banded morph, showing dorsal aposematic alternation.
              </span>
              <span className="font-mono not-italic text-[11px] text-[#78716C] shrink-0">
                PLATE IV · 1844
              </span>
            </figcaption>
          </figure>

          {/* Plate 2: Extreme Macro Chitin Exoskeleton */}
          <figure className="p-4 rounded-xl bg-[#F4F0E8] border border-[#DFD8CA]">
            <div className="relative rounded-lg overflow-hidden bg-[#0F172A] aspect-4/3 group">
              {!imgErrors.armor ? (
                <img
                  src={IMAGE_ASSETS.chitinArmorDetail}
                  alt="Macro studio photograph of Scolopendra hardwickei glossy orange and blue-black chitinous armor plates"
                  referrerPolicy="no-referrer"
                  onError={() => setImgErrors((prev) => ({ ...prev, armor: true }))}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0F172A] text-stone-300">
                  <span className="font-serif italic text-lg text-amber-400">
                    Cuticular Ultrastructure — Tergite Junction
                  </span>
                  <span className="text-xs mt-1">
                    Alpha-Chitin & Hydrophobic Epicuticular Wax Lamellae
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  setLightboxImage({
                    src: IMAGE_ASSETS.chitinArmorDetail,
                    title: 'Cuticular Ultrastructure — Aposematic Sclerotization',
                    caption:
                      'Macro study of the arthrodial membrane articulation between flame-vermilion and deep iridescent blue-black tergites.',
                  })
                }
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-md bg-[#1C1917]/85 text-[#FBF9F5] text-xs font-medium flex items-center gap-1.5 hover:bg-[#1C1917] transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Inspect Cuticle
              </button>
            </div>
            <figcaption className="mt-3 flex items-baseline justify-between gap-2 text-xs font-serif italic text-[#57534E]">
              <span>
                Fig. 2 — Sclerotized alpha-chitin tergite boundary with hydrophobic epicuticular wax sheen.
              </span>
              <span className="font-mono not-italic text-[11px] text-[#78716C] shrink-0">
                MACRO 4:1
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* High-Resolution Plate Inspection Lightbox Modal */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxImage.title}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="max-w-4xl w-full bg-[#FBF9F5] rounded-xl overflow-hidden border border-[#DFD8CA] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4DFD5]">
              <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                {lightboxImage.title}
              </h3>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#EBE6DF] transition-colors cursor-pointer"
                aria-label="Close plate viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-[#1C1917] max-h-[70vh] flex items-center justify-center overflow-hidden">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="px-6 py-4 bg-[#F4F0E8] text-sm font-serif italic text-[#44403C]">
              {lightboxImage.caption}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
