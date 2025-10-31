import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/utils';

export interface ChartDataItem {
  [key: string]: string | number | boolean | null | undefined;
}

export interface BarConfig {
  dataKey: string;
  fill: string;
  name: string;
}

export interface BarChartProps {
  data: ChartDataItem[];
  bars: BarConfig[];
  xAxisDataKey: string;
  title?: string;
  height?: number;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  bars,
  xAxisDataKey,
  title,
  height = 300,
  className = '',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  orientation = 'vertical',
}) => {
  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-chinese">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis
            dataKey={orientation === 'horizontal' ? undefined : xAxisDataKey}
            type={orientation === 'horizontal' ? 'number' : 'category'}
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            dataKey={orientation === 'horizontal' ? xAxisDataKey : undefined}
            type={orientation === 'horizontal' ? 'category' : 'number'}
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#111827', fontWeight: 'bold' }}
            />
          )}
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;