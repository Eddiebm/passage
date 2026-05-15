import { createHash, randomInt } from 'crypto'

export function hashPin(pin: string): string {
  return createHash('sha256').update(pin, 'utf8').digest('hex')
}

export function verifyPin(pin: string, pinHash: string): boolean {
  return hashPin(pin) === pinHash
}

export function generateCoordinatorPin(): string {
  return String(randomInt(100000, 1000000))
}
