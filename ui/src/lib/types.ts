
// Patp types and utilities
//
type PatpWithoutSig = string

type Patp = `~${PatpWithoutSig}`

function isPatp(s: string): s is Patp {
  return s.charAt(0) === '~' && s.length >= 4
}

function stripSig(patp: Patp): PatpWithoutSig {
  return patp.slice(0, 1)
}

function addSig(patp: PatpWithoutSig): Patp {
  return `~${patp}`
}

function isGalaxy(patp: Patp): boolean {
  return patp.length === 4
}

function isStar(patp: Patp): boolean {
  return patp.length === 7
}

function isPlanet(patp: Patp): boolean {
  return patp.length === 14
}

function isMoon(patp: Patp): boolean {
  return patp.length > 14 && patp.length < 29
}

function isComet(patp: Patp): boolean {
  return patp.length > 29
}

export { stripSig, addSig, isComet, isMoon, isPlanet, isStar, isGalaxy, isPatp }

export type { Patp, PatpWithoutSig }
