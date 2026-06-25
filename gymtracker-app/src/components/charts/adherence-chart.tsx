import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface WeekStat { week_number: number; completed: number; total: number }

export function AdherenceChart({ data }: { data: WeekStat[] }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-8">Sem dados de aderência ainda.</p>
  }
  const chartData = data.map(d => ({
    semana: `S${d.week_number}`,
    pct: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
  }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
        <Tooltip formatter={(v: number) => [`${v}%`, 'Aderência']} />
        <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.pct >= 75 ? 'hsl(var(--primary))' : entry.pct >= 50 ? '#eab308' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
