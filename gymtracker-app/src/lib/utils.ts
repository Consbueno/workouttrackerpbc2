import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { BLOCK_COLORS } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return d.toLocaleDateString('pt-BR')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-BR')
}

export function formatWeight(value: number | null | undefined, unit: 'kg' | 'lb' = 'kg'): string {
  if (value == null) return '—'
  if (unit === 'lb') return `${(value * 2.20462).toFixed(1)} lb`
  return `${value} kg`
}

export function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100
  return Math.round((weightKg / (h * h)) * 10) / 10
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Sobrepeso'
  if (bmi < 35) return 'Obesidade Grau I'
  if (bmi < 40) return 'Obesidade Grau II'
  return 'Obesidade Grau III'
}

export function calcAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate + 'T00:00:00')
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function getBlockColorConfig(color: string) {
  return BLOCK_COLORS.find(c => c.value === color) ?? BLOCK_COLORS[0]
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m}min ${s > 0 ? s + 's' : ''}`.trim()
  return `${s}s`
}

export function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
}

export function adherencePct(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}
