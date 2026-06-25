import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatDate } from '@/lib/utils'

interface MeasurementPoint {
  measurement_date: string
  chest_cm?: number
  right_arm_relaxed_cm?: number
  waist_cm?: number
  hip_cm?: number
  right_thigh_cm?: number
}

const LINES = [
  { key: 'chest_cm', label: 'Peito', color: '#3b82f6' },
  { key: 'right_arm_relaxed_cm', label: 'Braço D.', color: '#f59e0b' },
  { key: 'waist_cm', label: 'Cintura', color: '#ef4444' },
  { key: 'hip_cm', label: 'Quadril', color: '#8b5cf6' },
  { key: 'right_thigh_cm', label: 'Coxa D.', color: '#10b981' },
]

export function MeasurementsChart({ data }: { data: MeasurementPoint[] }) {
  if (!data || data.length < 2) {
    return <p className="text-center text-sm text-muted-foreground py-8">Dados insuficientes para o gráfico.</p>
  }
  const chartData = data.map(d => ({ date: formatDate(d.measurement_date), ...d }))
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} unit="cm" />
        <Tooltip formatter={(v: number, name: string) => [`${v} cm`, name]} />
        <Legend />
        {LINES.map(l => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
