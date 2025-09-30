import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeightStore } from "@/hooks/use-weight-store";
import { TrendingUp, Info } from 'lucide-react';
import { calculateWeightStats } from '@/lib/utils';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Weight</span>
            <span className="font-bold">{`${payload[0].value.toFixed(1)} kg`}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
export function WeightChart() {
  const entries = useWeightStore((state) => state.entries);
  if (entries.length === 0) {
    return null;
  }
  const chartData = entries.map((entry, index) => {
    const prevWeight = index > 0 ? entries[index - 1].weight : null;
    const weightChange = prevWeight !== null ? entry.weight - prevWeight : 0;
    let fill = 'rgb(71 85 105)'; // Default slate gray
    if (weightChange < 0) {
      fill = 'rgb(34 197 94)'; // Green for weight loss
    }
    return {
      ...entry,
      date: format(new Date(entry.date), 'MMM d'),
      weight: parseFloat(entry.weight.toFixed(1)),
      fill,
    };
  });
  const weights = entries.map(e => e.weight);
  const { mean, standardDeviation } = calculateWeightStats(weights);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const yAxisDomain: [number, number] = [
    Math.floor(minWeight - 2),
    Math.ceil(maxWeight + 2)
  ];
  return (
    <Card className="w-full animate-fade-in" style={{ animationDelay: '150ms' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-slate-800 dark:text-slate-200">
            <TrendingUp className="h-6 w-6 text-slate-500" />
            Your Progress
          </CardTitle>
          <TooltipProvider>
            <UiTooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  <span className="font-bold text-green-500">Green bars</span> indicate weight loss from the previous entry.
                  <br />
                  <span className="font-bold text-red-500">Red dashed lines</span> show ±1 standard deviation from your average weight.
                </p>
              </TooltipContent>
            </UiTooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}kg`}
                domain={yAxisDomain}
                allowDataOverflow={true}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
              {mean !== null && standardDeviation !== null && (
                <>
                  <ReferenceLine y={mean + standardDeviation} label={{ value: '+1σ', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="3 3" />
                  <ReferenceLine y={mean - standardDeviation} label={{ value: '-1σ', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="3 3" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}