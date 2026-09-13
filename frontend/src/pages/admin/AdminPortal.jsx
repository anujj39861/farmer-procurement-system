import React, { useEffect, useState } from 'react';
import { fetchKPIs, fetchAnalyticsCharts } from '../../services/api';
import {
  TrendingUp, Scale, IndianRupee, Clock, ShieldAlert,
  Building2, Users, AlertCircle, BarChart3, PieChart
} from 'lucide-react';

export default function AdminPortal() {
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const kRes = await fetchKPIs();
      setKpis(kRes.data);

      const cRes = await fetchAnalyticsCharts();
      setCharts(cRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Admin Dashboard Title */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1 w-fit">
            <Building2 className="w-3.5 h-3.5" /> State Administrative Procurement Dashboard
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">Executive System Analytics & Intelligence</h2>
          <p className="text-xs text-slate-300 mt-1">Cross-district procurement volume, transparency audit counts, queue wait times, and anomaly metrics.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span>Total Procured Volume</span>
              <Scale className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">
              {kpis.total_procured_weight_kg?.toLocaleString()} kg
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Across {kpis.completed_procurements} Verified Lots
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span>Disbursed MSP Payout</span>
              <IndianRupee className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">
              ₹{kpis.total_disbursed_payout_inr?.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              Direct DB-linked transfer calculation
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span>Avg Queue Wait Time</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">
              {kpis.avg_queue_wait_min} min
            </div>
            <span className="text-[11px] text-amber-700 font-semibold">
              ML ETA Optimized
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span>Open Grievances</span>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-extrabold text-red-600">
              {kpis.open_issues_count} Tickets
            </div>
            <span className="text-[11px] text-red-700 font-semibold">
              Pending Resolution
            </span>
          </div>

        </div>
      )}

      {/* Main Grid: Centre Wise Analytics & Queue Breakdown */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Centre Performance Table (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" /> Procurement Centre Performance Breakdown
              </h3>
              <span className="text-xs text-gray-400">Live operational data</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-semibold uppercase text-[10px] border-b border-gray-200">
                    <th className="py-2.5 px-3">Centre Name</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Total Tokens</th>
                    <th className="py-2.5 px-3">Procured Volume (kg)</th>
                    <th className="py-2.5 px-3">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {charts.centre_analytics.map((c) => (
                    <tr key={c.centre_id} className="hover:bg-gray-50 font-medium">
                      <td className="py-3 px-3 font-bold text-gray-900">{c.centre_name}</td>
                      <td className="py-3 px-3 text-gray-500">{c.district}</td>
                      <td className="py-3 px-3 font-bold text-gray-800">{c.tokens_count}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">{c.total_procured_kg} kg</td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mandi Wise Breakdown Section */}
            {charts.mandi_analytics && (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" /> Mandi / Collection Point Breakdown (Centre #1 Circle)
                  </h4>
                  <span className="text-[11px] text-gray-400">Independent Mandi Queues</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {charts.mandi_analytics.map(m => (
                    <div key={m.mandi_name} className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1">
                      <div className="font-bold text-blue-950 text-xs flex items-center justify-between">
                        <span>{m.mandi_name}</span>
                        <span className="bg-blue-200 text-blue-900 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                          {m.tokens_count} Tokens
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 flex justify-between">
                        <span>Procured Volume:</span>
                        <span className="font-bold font-mono text-gray-900">{m.total_procured_kg} kg</span>
                      </div>
                      <div className="text-[11px] text-gray-600 flex justify-between">
                        <span>Disbursed Payout:</span>
                        <span className="font-bold font-mono text-emerald-700">₹{m.total_payout_inr?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Distribution Breakdown (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" /> Queue Status Distribution
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {Object.entries(charts.queue_status_distribution).map(([status, count]) => (
                <div key={status} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <span className="capitalize font-bold text-gray-700">{status.replace('_', ' ')}</span>
                  <span className="font-mono font-extrabold text-emerald-800 text-sm">{count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
