import { LineChart, Line, ResponsiveContainer } from 'recharts'

export default function Sparkline({ data = [] }) {
  return (
    <div className="h-12 w-full theme-text">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke="currentColor"
            strokeWidth={2}
            dot={false}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
