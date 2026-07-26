"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PointsChart({ data, drivers }: { data: any[], drivers: any[] }) {
  // Map constructor IDs to their official F1 colors
  const getConstructorColor = (constructorId?: string) => {
    const colors: Record<string, string> = {
      red_bull: '#3671C6',
      mercedes: '#27F4D2',
      ferrari: '#E80020',
      mclaren: '#FF8000',
      aston_martin: '#229971',
      alpine: '#0093cc',
      williams: '#64C4FF',
      rb: '#6692FF',
      sauber: '#52E252',
      haas: '#B6BABD',
    };
    return constructorId ? (colors[constructorId] || '#ffffff') : '#ffffff';
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          
          {drivers.map((driver) => (
            <Line 
              key={driver.Driver.driverId}
              type="monotone" 
              dataKey={driver.Driver.driverId} 
              name={driver.Driver.familyName}
              stroke={getConstructorColor(driver.Constructors?.[0]?.constructorId)} 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
