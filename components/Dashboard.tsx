
import React from 'react';
import { 
  Users, 
  PhoneIncoming, 
  PhoneOutgoing, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Mon', revenue: 4200, calls: 45 },
  { name: 'Tue', revenue: 5100, calls: 52 },
  { name: 'Wed', revenue: 3800, calls: 38 },
  { name: 'Thu', revenue: 6200, calls: 61 },
  { name: 'Fri', revenue: 5800, calls: 55 },
  { name: 'Sat', revenue: 2100, calls: 24 },
  { name: 'Sun', revenue: 1800, calls: 19 },
];

const StatsCard = ({ title, value, icon, trend, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>{icon}</div>
      <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
        {trend} <ArrowUpRight size={14} />
      </div>
    </div>
    <div>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-slate-400">Live performance stats for your AI agents.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Recovered" 
          value="$14,400" 
          icon={<DollarSign />} 
          trend="+12.5%" 
          color="bg-yellow-500 text-yellow-500" 
        />
        <StatsCard 
          title="Leads Captured" 
          value="248" 
          icon={<Users />} 
          trend="+8.2%" 
          color="bg-blue-500 text-blue-500" 
        />
        <StatsCard 
          title="Inbound Handled" 
          value="1,240" 
          icon={<PhoneIncoming />} 
          trend="+15.3%" 
          color="bg-green-500 text-green-500" 
        />
        <StatsCard 
          title="Outbound Calls" 
          value="412" 
          icon={<PhoneOutgoing />} 
          trend="+4.1%" 
          color="bg-purple-500 text-purple-500" 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Revenue Recovery Trend</h3>
            <select className="bg-slate-800 text-sm border-none rounded-lg px-3 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#eab308' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#eab308" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-8">Active Agent Stats</h3>
          <div className="space-y-6">
            {[
              { name: "Basketball Training Lead Gen", usage: 85, status: "Active", time: "2m 14s avg" },
              { name: "General Inbound Concierge", usage: 62, status: "Active", time: "1m 45s avg" },
              { name: "Membership Upgrader", usage: 45, status: "Paused", time: "3m 10s avg" }
            ].map((agent, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${agent.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                  <div>
                    <p className="font-semibold">{agent.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> {agent.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-500">{agent.usage}% Load</p>
                  <p className="text-xs text-slate-500 uppercase tracking-tighter">{agent.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
