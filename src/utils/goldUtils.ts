export const TOLA_IN_GRAMS = 11.6638
export const MASHA_IN_GRAMS = 0.9720
export const RATI_IN_GRAMS = 0.1215
export const TOLA_IN_MASHA = 12
export const MASHA_IN_RATI = 8

export interface WeightResult {
  tola: number
  masha: number
  rati: number
}

export interface PurityResult {
  khaalisSona: number
  milawat: number
}

export function gramsToTolaMashaRati(grams: number): WeightResult {
  const totalMasha = grams / MASHA_IN_GRAMS
  const tola = Math.floor(totalMasha / TOLA_IN_MASHA)
  const remainingMasha = totalMasha - tola * TOLA_IN_MASHA
  const masha = Math.floor(remainingMasha)
  const rati = Math.round((remainingMasha - masha) * MASHA_IN_RATI)
  return { tola, masha, rati }
}

export function tolaMashaRatiToGrams(tola: number, masha: number, rati: number): number {
  return tola * TOLA_IN_GRAMS + masha * MASHA_IN_GRAMS + rati * RATI_IN_GRAMS
}

export function calcKhaalisSona(wazan: number, point: number): number {
  return (wazan * point) / 100
}

export function calcQeemat(khaalisSona: number, ratePerTola: number): number {
  return (khaalisSona / TOLA_IN_GRAMS) * ratePerTola
}

export function calcRatePerGram(ratePerTola: number): number {
  return ratePerTola / TOLA_IN_GRAMS
}

const DENSITIES: Record<string, number> = {
  gold: 19.3,
  silver: 10.5,
  copper: 8.96,
  standard: 14.0,
  puresilver: 10.5,
}

export function archimedesPurityCalc(
  kandaWazan: number,
  paniWazan: number,
  metalType: string
): PurityResult {
  const density = DENSITIES[metalType] || 14.0
  const volumeLoss = kandaWazan - paniWazan
  const khaalisSona = volumeLoss * density
  const milawat = kandaWazan - khaalisSona
  return { khaalisSona, milawat }
}

export function calcMilawatRates(
  milawat: number,
  khaalis: number
): { fiGram: number; fiTola: number } {
  const fiGram = khaalis > 0 ? milawat / khaalis : 0
  const fiTola = fiGram * TOLA_IN_GRAMS
  return { fiGram, fiTola }
}

export function calcCaret(khaalis: number, total: number): number {
  return total > 0 ? (khaalis / total) * 24 : 0
}
