export interface TrunkSegmentSpec {
  segmentNumber: number;
  tergiteColor: 'orange' | 'blue-black';
  colorHex: string;
  colorLabel: string;
  widthMm: number;
  lengthMm: number;
  hasSpiracle: boolean;
  anatomicalRole: string;
  kinematicNote: string;
}

export interface AnatomicalRegion {
  id: string;
  indexNumber: string;
  title: string;
  latinTerm: string;
  segmentRange: string;
  summary: string;
  biomechanics: string;
  biochemistryOrStructure: string;
  keyMetricLabel: string;
  keyMetricValue: string;
}

export interface LocomotionStagePreset {
  id: string;
  stageLabel: string;
  title: string;
  velocityCmPerSec: number;
  phaseLagDeg: number;
  undulationPct: number;
  strideFrequencyHz: number;
  dutyFactorPct: number;
  annotation: string;
  equationNote: string;
}

export interface MicrohabitatStratum {
  id: string;
  name: string;
  elevationMeters: string;
  forestZone: string;
  humidityPct: string;
  substrateTempC: string;
  canopyClosurePct: string;
  nocturnalPeakWindow: string;
  primaryPrey: string;
  microhabitatDescription: string;
  conservationNote: string;
}

export const IMAGE_ASSETS = {
  heroMacro: '/src/assets/images/hero_scolopendra_sinharaja_1790869809644.jpg',
  lithographPlate: '/src/assets/images/plate_anatomical_specimen_1790869821674.jpg',
  sinharajaCanopy: '/src/assets/images/habitat_sinharaja_canopy_1790869834054.jpg',
  chitinArmorDetail: '/src/assets/images/detail_forcipules_armor_1790869846975.jpg',
};

// Classic Scolopendra spiracle distribution: segments 3, 5, 8, 10, 12, 14, 16, 18, 20
const SPIRACLE_SEGMENTS = new Set([3, 5, 8, 10, 12, 14, 16, 18, 20]);

// Authentic alternating aposematic banding of Scolopendra hardwickei (Sinharaja morph)
const ORANGE_SEGMENTS = new Set([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]);

export const TRUNK_SEGMENTS: TrunkSegmentSpec[] = Array.from({ length: 21 }, (_, idx) => {
  const seg = idx + 1;
  const isOrange = ORANGE_SEGMENTS.has(seg);
  const hasSpiracle = SPIRACLE_SEGMENTS.has(seg);

  // Taper profile across 21 tergites (total length ~165 mm)
  const normalizedPos = (seg - 1) / 20;
  const archCurve = Math.sin(normalizedPos * Math.PI);
  const widthMm = Number((9.2 + archCurve * 4.6 - (seg === 1 ? 1.2 : 0) - (seg === 21 ? 1.8 : 0)).toFixed(1));
  const lengthMm = Number((5.8 + archCurve * 2.7 - (seg === 1 ? 1.4 : 0)).toFixed(1));

  let anatomicalRole = 'Mid-trunk locomotory metamere with paired 7-podomere walking appendages.';
  let kinematicNote = 'Transmits metachronal wave thrust to damp leaf-litter substrate via tarsal claw anchor.';

  if (seg === 1) {
    anatomicalRole = 'First pedigerous tergite overarching the massive ventral forcipular coxosternite.';
    kinematicNote = 'Stabilizes cephalic capsule during rapid predatory strikes and antennal probing.';
  } else if (seg === 21) {
    anatomicalRole = 'Terminal tergite bearing enlarged, heavily sclerotized ultimate sensory-defensive legs.';
    kinematicNote = 'Elevated off the ground during forward locomotion; functions as posterior tactile antennae and pincer defense.';
  } else if (hasSpiracle) {
    anatomicalRole = 'Spiraculate trunk metamere housing lateral triangular cribriform tracheal valves.';
    kinematicNote = 'Synchronizes lateral pleural compression with high-velocity undulatory bursts to ventilate tracheae.';
  }

  return {
    segmentNumber: seg,
    tergiteColor: isOrange ? 'orange' : 'blue-black',
    colorHex: isOrange ? '#D94E1F' : '#0F172A',
    colorLabel: isOrange ? 'Flame Vermilion (#D94E1F)' : 'Iridescent Blue-Black (#0F172A)',
    widthMm,
    lengthMm,
    hasSpiracle,
    anatomicalRole,
    kinematicNote,
  };
});

export const ANATOMICAL_REGIONS: AnatomicalRegion[] = [
  {
    id: 'cephalic',
    indexNumber: '01',
    title: 'Cephalic Capsule & Antennae',
    latinTerm: 'Lamina Cephalica',
    segmentRange: 'Head + Tergite I',
    summary:
      'Flattened bright vermilion cephalic shield bearing four simple ocelli on each lateral margin and a pair of 17-articulated sensory antennae.',
    biomechanics:
      'Because vision in the dark Sinharaja understory is restricted to light-dark discrimination, the 17-jointed antennae sweep a 140° arc ahead of the body at 6–10 Hz, reading chemotactile and vibrational signatures on damp dipterocarp leaves.',
    biochemistryOrStructure:
      'Densely arrayed with trichoid sensilla and hygroreceptors tuned to tropical forest floor humidity gradients (85–98% RH).',
    keyMetricLabel: 'Antennal Articles',
    keyMetricValue: '17 segments · 4+4 Ocelli',
  },
  {
    id: 'forcipules',
    indexNumber: '02',
    title: 'Forcipular Venom Apparatus',
    latinTerm: 'Maxillipedes / Forcipulae',
    segmentRange: 'Ventral Segment I',
    summary:
      'Modified first trunk appendages curving beneath the head into heavily sclerotized, sickle-shaped venom claws with sub-terminal orifices.',
    biomechanics:
      'Driven by massive adductor muscle bundles occupying the coxosternite, the forcipules snap shut in under 18 milliseconds, puncturing arthropod cuticles or vertebrate dermis while simultaneously injecting venom from internal cylindrical glands.',
    biochemistryOrStructure:
      'Venom cocktail comprises high-molecular-weight pore-forming proteins, voltage-gated sodium/potassium/calcium channel neurotoxins, and phospholipase A2 enzymes.',
    keyMetricLabel: 'Strike Closure Latency',
    keyMetricValue: '14–18 ms · Dual Gland Injection',
  },
  {
    id: 'tergites',
    indexNumber: '03',
    title: 'Alternating Aposematic Tergites',
    latinTerm: 'Terga Corporis (II–XX)',
    segmentRange: 'Segments II – XX',
    summary:
      'Dorsal exoskeletal armor plates alternating rhythmically between brilliant flame-orange and deep midnight blue-black chitin.',
    biomechanics:
      'Overlapping sclerotized tergites are linked by flexible arthrodial membranes and longitudinal paramedian sutures, allowing tight 45° lateral bending through root crevices without exposing soft tissue.',
    biochemistryOrStructure:
      'Multi-layered alpha-chitin and scleroprotein cuticular lamellae coated in a hydrophobic epicuticular wax barrier that repels fungal pathogens and rainforest deluge.',
    keyMetricLabel: 'Coloration Pattern',
    keyMetricValue: 'Aposematic Banding · 21 Tergites',
  },
  {
    id: 'spiracles',
    indexNumber: '04',
    title: 'Cribriform Tracheal Spiracles',
    latinTerm: 'Stigmata Respiratoria',
    segmentRange: 'Segments 3, 5, 8, 10, 12, 14, 16, 18, 20',
    summary:
      'Nine pairs of lateral pleural respiratory openings protected by microscopic water-repellent cuticular sieve plates (trichomes).',
    biomechanics:
      'In flooded monsoon leaf litter, microscopic hydrophobic hairs across the spiracular atrium trap an air plastron, preventing drowning while sustaining aerobic metabolism during sprinting.',
    biochemistryOrStructure:
      'Anastomosing tracheal trunks deliver atmospheric oxygen directly to segmental coxal and longitudinal muscles without reliance on hemolymph oxygen transport.',
    keyMetricLabel: 'Respiratory Distribution',
    keyMetricValue: '9 Paired Pleural Spiracles',
  },
  {
    id: 'ultimate',
    indexNumber: '05',
    title: 'Ultimate Sensory & Defensive Legs',
    latinTerm: 'Pedes Ultimi (Segment XXI)',
    segmentRange: 'Segment XXI',
    summary:
      'Elongated, spinose terminal appendages held slightly elevated behind the body rather than participating in the walking gait.',
    biomechanics:
      'Act as a functional "false head" (automimicry) and defensive grappling hooks. When threatened from behind, the centipede raises and spreads the bright orange ultimate legs to deflect predator strikes away from the true cephalic capsule.',
    biochemistryOrStructure:
      'Armed with medial prefemoral spines and dense mechanoreceptive bristles sensitive to air currents generated by approaching nocturnal predators.',
    keyMetricLabel: 'Locomotory Participation',
    keyMetricValue: '0% Stride · 100% Tactile/Defense',
  },
];

export const LOCOMOTION_STAGES: LocomotionStagePreset[] = [
  {
    id: 'stage-1',
    stageLabel: 'Stage 1: Cryptic Probing Glide',
    title: 'Low-Undulation Leaf-Litter Recon',
    velocityCmPerSec: 7.5,
    phaseLagDeg: 26,
    undulationPct: 12,
    strideFrequencyHz: 2.1,
    dutyFactorPct: 68,
    annotation:
      'During nocturnal foraging beneath damp dipterocarp leaves, lateral body undulation is suppressed. Over two-thirds of the 20 walking leg pairs remain in simultaneous ground contact, producing a silent, fluid glide.',
    equationNote: 'High duty factor (D = 0.68) ensures static stability across uneven mossy twigs.',
  },
  {
    id: 'stage-2',
    stageLabel: 'Stage 2: Metachronal Wave Cruise',
    title: 'Balanced Aposematic Undulation',
    velocityCmPerSec: 15.0,
    phaseLagDeg: 36,
    undulationPct: 45,
    strideFrequencyHz: 3.8,
    dutyFactorPct: 52,
    annotation:
      'As velocity increases across open forest floor, a retrograde metachronal wave ripples along the legs while the orange-and-black trunk forms traveling S-waves. Multiple consecutive legs converge on shared substrate pivot points.',
    equationNote: 'Phase lag Δφ = 36° creates 3.5 complete metachronal leg waves along the 21-segment body.',
  },
  {
    id: 'stage-3',
    stageLabel: 'Stage 3: High-Velocity Predatory Sprint',
    title: 'High-Amplitude Axial Propulsion',
    velocityCmPerSec: 25.5,
    phaseLagDeg: 48,
    undulationPct: 85,
    strideFrequencyHz: 6.2,
    dutyFactorPct: 34,
    annotation:
      'In rapid pursuit or evasive escape, axial musculature drives wide lateral body waves that amplify effective stride length. Brief aerial phases occur between clustered footfall pivots.',
    equationNote: 'Low duty factor (D = 0.34) shifts biomechanics from static tripod support to dynamic axial-appendicular coupling.',
  },
];

export const SINHARAJA_STRATA: MicrohabitatStratum[] = [
  {
    id: 'leaf-litter',
    name: 'Lowland Dipterocarp Leaf Litter',
    elevationMeters: '320 – 540 m ASL',
    forestZone: 'Primary Alluvial Valley Floor (Gin & Kalu River Basins)',
    humidityPct: '92% – 97% RH',
    substrateTempC: '24.2°C – 26.1°C',
    canopyClosurePct: '94% Dense Multi-Story Canopy',
    nocturnalPeakWindow: '20:30 – 03:15 LKT',
    primaryPrey: 'Giant forest cockroaches (Blaberidae), katydids, huntsman spiders (Heteropoda), and microhylid frogs',
    microhabitatDescription:
      'Beneath towering Shorea and Dipterocarpus zeylanicus giants, a 15 cm carpet of decomposing leaves and fungal mycelia creates a perpetual twilight labyrinth. Here, the high-contrast orange and blue-black bands of S. hardwickei act simultaneously as disruptive camouflage in dappled light and bold aposematic warning when exposed.',
    conservationNote:
      'Sensitive to canopy fragmentation and soil desiccation; requires continuous old-growth leaf-litter moisture retention.',
  },
  {
    id: 'buttress-logs',
    name: 'Decaying Buttress & Heartwood Galleries',
    elevationMeters: '540 – 860 m ASL',
    forestZone: 'Mid-Elevation Mesua-Doona Climax Forest',
    humidityPct: '94% – 99% RH',
    substrateTempC: '22.8°C – 24.5°C',
    canopyClosurePct: '91% Closed Evergreen Canopy',
    nocturnalPeakWindow: '21:00 – 04:00 LKT',
    primaryPrey: 'Passalid beetles, Gryllacridid raspy crickets, endemic geckos (Cnemaspis), and skinks (Lankascincus)',
    microhabitatDescription:
      'Fallen hardwood trunks and deep buttress-root cavities provide diurnal refugia and maternal brooding chambers. Female Scolopendra hardwickei coil their armored segments around 35–60 amber-colored eggs inside rotting heartwood, grooming them continuously with oral secretions to prevent mold colonization.',
    conservationNote:
      'Removal of deadwood or illegal selective logging directly eliminates maternal brooding microsites.',
  },
  {
    id: 'cloud-ridge',
    name: 'Sub-Montane Mossy Ridge & Rock Fissures',
    elevationMeters: '860 – 1,170 m ASL',
    forestZone: 'Eastern Sinharaja Upper Montane Transition (Morningside)',
    humidityPct: '95% – 100% RH (Frequent Mist)',
    substrateTempC: '19.5°C – 22.3°C',
    canopyClosurePct: '86% Epiphyte-Laden Stunted Canopy',
    nocturnalPeakWindow: '19:45 – 01:30 LKT',
    primaryPrey: 'Endemic shrub frogs (Pseudophilautus), harvestmen, and large mygalomorph spiders',
    microhabitatDescription:
      'Along mist-shrouded granite outcrops blanketed in bryophytes and filmy ferns, S. hardwickei shelters beneath exfoliating gneiss slabs during heavy southwest monsoon downpours (3,600–5,000 mm annual rainfall).',
    conservationNote:
      'UNESCO World Heritage core zone protection shields these high-elevation endemic genetic lineages.',
  },
];

export const ACCESSION_METADATA = [
  { label: 'Catalog Accession', value: 'SNH-CHIL-1844-09' },
  { label: 'Binomial Authority', value: 'Scolopendra hardwickei Newport, 1844' },
  { label: 'Vernacular Designation', value: 'Sri Lankan Banded Giant Centipede / Indian Tiger Centipede' },
  { label: 'Type Locality & Range', value: 'Sinharaja Biosphere Reserve, Sabaragamuwa & Southern Provinces, Sri Lanka' },
  { label: 'Morphometric Scale', value: '155 – 185 mm Adult Total Length · 21 Pedigerous Tergites' },
  { label: 'Chromatophore Formula', value: 'Alternating Vermilion Orange (#D94E1F) & Iridescent Blue-Black (#0F172A)' },
  { label: 'Conservation Context', value: 'Endemic Island Morph · Protected Strictly Within Forest Reserves' },
];
