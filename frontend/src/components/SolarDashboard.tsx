import React from 'react';
import { LayoutGrid, Zap, Sun, BarChart3, Wallet, Leaf } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  meta: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  accentColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  unit,
  meta,
  trend,
  trendDirection,
  accentColor,
}) => {
  const trendStyles = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const accentBgMap = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
  };

  const accentIconMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600',
  };

  return (
    <div className={`${accentBgMap[accentColor as keyof typeof accentBgMap]} rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg bg-white border border-gray-100 ${accentIconMap[accentColor as keyof typeof accentIconMap]}`}>
          {icon}
        </div>
        <span className={`text-xs font-semibold ${trendStyles[trendDirection]}`}>
          {trendDirection === 'up' && '↑'} {trendDirection === 'down' && '↓'} {trendDirection === 'neutral' && '→'} {trend}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
      <div className="mb-3">
        <p className="text-3xl font-bold text-gray-900">
          {value}
          {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
        </p>
      </div>
      <p className="text-xs text-gray-600">{meta}</p>
    </div>
  );
};

export const SolarDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Solar Energy Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring and analytics for your solar installations</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Installations */}
          <MetricCard
            icon={<LayoutGrid size={24} strokeWidth={2} />}
            label="Total Installations"
            value="1,245"
            meta="Active projects in portfolio"
            trend="15%"
            trendDirection="up"
            accentColor="blue"
          />

          {/* Daily Energy */}
          <MetricCard
            icon={<Zap size={24} strokeWidth={2} />}
            label="Daily Energy"
            value="2,450"
            unit="kWh"
            meta="Today's generation vs. average"
            trend="8%"
            trendDirection="up"
            accentColor="amber"
          />

          {/* Total Capacity */}
          <MetricCard
            icon={<Sun size={24} strokeWidth={2} />}
            label="Total Capacity"
            value="45.2"
            unit="kW"
            meta="5 peak sun hours per day average"
            trend="12%"
            trendDirection="up"
            accentColor="amber"
          />

          {/* System Efficiency */}
          <MetricCard
            icon={<BarChart3 size={24} strokeWidth={2} />}
            label="System Efficiency"
            value="94.8%"
            meta="Average performance across all systems"
            trend="0%"
            trendDirection="neutral"
            accentColor="blue"
          />

          {/* Monthly Savings */}
          <MetricCard
            icon={<Wallet size={24} strokeWidth={2} />}
            label="Monthly Savings"
            value="₱18,520"
            meta="At ₱8.50/kWh electricity rate"
            trend="5%"
            trendDirection="up"
            accentColor="green"
          />

          {/* CO₂ Offset */}
          <MetricCard
            icon={<Leaf size={24} strokeWidth={2} />}
            label="CO₂ Offset"
            value="1,245"
            unit="kg/mo"
            meta="Equivalent to 24.8 tons per year"
            trend="10%"
            trendDirection="up"
            accentColor="green"
          />
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Icon System</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <LayoutGrid size={24} className="text-blue-600" strokeWidth={2} />
              </div>
              <span className="text-xs text-gray-600">LayoutGrid</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Zap size={24} className="text-amber-600" strokeWidth={2} />
              </div>
              <span className="text-xs text-gray-600">Zap</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Sun size={24} className="text-amber-600" strokeWidth={2} />
              </div>
              <span className="text-xs text-gray-600">Sun</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 size={24} className="text-blue-600" strokeWidth={2} />
              </div>
              <span className="text-xs text-gray-600">BarChart3</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <Wallet size={24} className="text-green-600" strokeWidth={2} />
              </div>
              <span className="text-xs text-gray-600">Wallet</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <Leaf size={24} className="text-green-600" strokeWidth={2} />
              </div>
              <span className="text-xs text-gray-600">Leaf</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarDashboard;
