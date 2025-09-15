import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const usageData = [
  { date: "Jan 1", requests: 1200, errors: 12 },
  { date: "Jan 2", requests: 1800, errors: 8 },
  { date: "Jan 3", requests: 2200, errors: 15 },
  { date: "Jan 4", requests: 1900, errors: 5 },
  { date: "Jan 5", requests: 2400, errors: 3 },
  { date: "Jan 6", requests: 2800, errors: 7 },
  { date: "Jan 7", requests: 3200, errors: 2 },
];

interface UsageChartProps {
  type?: "line" | "bar";
  title?: string;
  description?: string;
}

export function UsageChart({ 
  type = "line", 
  title = "API Usage", 
  description = "Daily API requests and errors over the last 7 days" 
}: UsageChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === "line" ? (
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-muted-foreground"
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="requests" 
                stroke="#a854f7" 
                strokeWidth={2}
                name="Requests"
              />
              <Line 
                type="monotone" 
                dataKey="errors" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="Errors"
              />
            </LineChart>
          ) : (
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-muted-foreground"
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Bar 
                dataKey="requests" 
                fill="#a854f7" 
                name="Requests"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}