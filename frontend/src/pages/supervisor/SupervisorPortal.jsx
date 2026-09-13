import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchPendingCorrections, verifyWeightCorrection, fetchAuditLogs, checkAnomalyML, fetchCentres
} from '../../services/api';
import {
  ShieldAlert, CheckCircle2, XCircle, AlertTriangle, History,
  FileCheck, Lock, Sparkles, Scale, RefreshCw, Building2
} from 'lucide-react';

export default function SupervisorPortal() {
  const { user, selectedCentreId } = useAuth();
  const [centres, setCentres] = useState([]);
  const [selectedMandi, setSelectedMandi] = useState('all');
  const [pendingCorrections, setPendingCorrections] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [anomalyTestResult, setAnomalyTestResult] = useState(null);
  const [notesDict, setNotesDict] = useState({});

  useEffect(() => {
    loadCentres();
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [selectedCentreId, selectedMandi]);

  const loadCentres = async () => {
    try {
      const res = await fetchCentres();
      setCentres(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    try {
      const cRes = await fetchPendingCorrections();
      setPendingCorrections(cRes.data);

      const aRes = await fetchAuditLogs();
      setAuditLogs(aRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecision = async (tokenId, approve) => {
    try {
      await verifyWeightCorrection(tokenId, {
        approve: approve,
        supervisor_notes: notesDict[tokenId] || (approve ? "Verified against calibration slip" : "Rejected due to insufficient proof")
      });
      loadData();
      alert(`Correction request ${approve ? 'APPROVED' : 'REJECTED'}! Audit trail updated.`);
    } catch (err) {
      alert("Error submitting decision");
    }
  };

  const handleRunAnomalyCheck = async () => {
    try {
      const res = await checkAnomalyML({
        operator_id: 2,
        token_id: 42,
        processing_time_sec: 18.0,
        weight_kg: 5200.0,
        corrections_count: 3
      });
      setAnomalyTestResult(res.data);
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="bg-amber-400/20 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold border border-amber-400/30 flex items-center gap-1 w-fit">
              <ShieldAlert className="w-3.5 h-3.5" /> Supervisor Oversight & Governance Desk
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">Anti-Fraud & Weight Correction Authorization</h2>
            <p className="text-xs text-indigo-200 mt-1">Review locked weight modifications, investigate AI risk flags, and inspect the immutable audit log.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-right">
              <span className="text-[10px] text-indigo-200 uppercase font-semibold block">Supervised Centre</span>
              <div className="font-bold text-sm text-white flex items-center gap-1.5 justify-end mt-0.5">
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>
                  {centres.find(c => c.id === (user?.centre_id || selectedCentreId))?.name || `Centre #${user?.centre_id || selectedCentreId}`}
                </span>
              </div>
              <span className="text-[10px] text-indigo-300 font-mono">
                Centre ID: #{user?.centre_id || selectedCentreId} • {centres.find(c => c.id === (user?.centre_id || selectedCentreId))?.district || 'Haryana'}
              </span>
            </div>

            <button
              onClick={loadData}
              className="p-2.5 bg-indigo-800/60 hover:bg-indigo-700 text-indigo-200 rounded-xl border border-indigo-600 transition text-xs font-semibold flex items-center gap-1 h-fit"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Mandi Selector Tabs */}
        <div className="mt-4 pt-3 border-t border-indigo-900/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-indigo-200 uppercase">Filter by Mandi:</span>
          {[
            { key: 'all', label: 'All Mandis' },
            { key: 'Karnal Mandi', label: 'Karnal Mandi' },
            { key: 'Ludhiana Mandi', label: 'Ludhiana Mandi' },
            { key: 'Bareilly Mandi', label: 'Bareilly Mandi' }
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setSelectedMandi(m.key)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                selectedMandi === m.key
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'bg-indigo-900/60 text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Pending Approvals</span>
            <span className="text-2xl font-bold text-amber-600">{pendingCorrections.length}</span>
          </div>
          <FileCheck className="w-8 h-8 text-amber-500 p-1 bg-amber-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Approved Today</span>
            <span className="text-2xl font-bold text-emerald-700">
              {auditLogs.filter(l => l.action?.includes('approved')).length}
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 p-1 bg-emerald-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Rejected</span>
            <span className="text-2xl font-bold text-red-600">
              {auditLogs.filter(l => l.action?.includes('rejected')).length}
            </span>
          </div>
          <XCircle className="w-8 h-8 text-red-500 p-1 bg-red-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Audit Trail Entries</span>
            <span className="text-2xl font-bold text-indigo-700">{auditLogs.length}</span>
          </div>
          <History className="w-8 h-8 text-indigo-500 p-1 bg-indigo-50 rounded-xl" />
        </div>
      </div>

      {/* Main Grid: Pending Approvals & AI Anomaly Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Pending Weight Correction Approvals (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-600" /> Pending Weight Correction Approvals
            </h3>
            <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {pendingCorrections.length} Pending Ticket(s)
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {pendingCorrections.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-medium">No pending weight correction approval tickets!</p>
              </div>
            ) : (
              pendingCorrections.map(rec => (
                <div key={rec.id} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3 text-xs">
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm font-mono">
                      Token #{rec.token_id} • Scale: {rec.scale_id}
                    </span>
                    <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      Correction Requested
                    </span>
                  </div>

                  {/* Before vs After Weight Comparison Card */}
                  <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-amber-100 font-mono">
                    <div className="border-r border-gray-100 pr-2">
                      <span className="text-gray-400 block text-[10px] uppercase font-sans">Original Locked Net</span>
                      <span className="text-base font-bold text-red-600 line-through">{rec.net_weight_kg} kg</span>
                    </div>

                    <div className="pl-2">
                      <span className="text-amber-700 block text-[10px] uppercase font-sans font-bold">Requested New Net</span>
                      <span className="text-base font-bold text-emerald-700">{rec.requested_net_weight_kg} kg</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-gray-700 block">Operator Stated Reason:</span>
                    <p className="text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200 mt-1 italic">
                      "{rec.correction_reason || 'Tare bag offset calibration error'}"
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Optional supervisor notes..."
                      value={notesDict[rec.token_id] || ""}
                      onChange={(e) => setNotesDict({ ...notesDict, [rec.token_id]: e.target.value })}
                      className="flex-1 p-2 rounded-xl border border-gray-300 text-xs"
                    />

                    <button
                      onClick={() => handleDecision(rec.token_id, true)}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>

                    <button
                      onClick={() => handleDecision(rec.token_id, false)}
                      className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: AI Fraud & Anomaly Radar (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> AI Anomaly & Fraud Radar
            </h3>
            <button
              onClick={handleRunAnomalyCheck}
              className="text-[11px] font-bold text-indigo-600 hover:underline"
            >
              Test ML Scanner
            </button>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs space-y-2">
            <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-600" /> Scikit-Learn Isolation Forest Engine
            </h4>
            <p className="text-indigo-800 text-[11px]">
              Continuously scans live scale transactions, operator correction frequencies, and processing duration anomalies.
            </p>
          </div>

          {anomalyTestResult && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-900 uppercase">ML Flag Status</span>
                <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                  {anomalyTestResult.risk_level}
                </span>
              </div>
              <ul className="space-y-1 text-red-800 list-disc list-inside text-[11px]">
                {anomalyTestResult.flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Active Monitoring Rules</h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <span>Fast Processing (&lt; 30s)</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <span>Multiple Edits (&gt;= 2 per token)</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <span>Weight Outlier Detection</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* System Audit Trail Viewer */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" /> Immutable System Audit Trail
          </h3>
          <span className="text-xs text-gray-400 font-mono">Who • What • When • Reason</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100/70 text-gray-600 font-semibold uppercase text-[10px] border-b border-gray-200">
                <th className="py-2.5 px-3">Actor / Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity ID</th>
                <th className="py-2.5 px-3">Old Value</th>
                <th className="py-2.5 px-3">New Value</th>
                <th className="py-2.5 px-3">Reason / Justification</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 font-medium">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-gray-900">{log.actor_role}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{log.action}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-500">#{log.entity_id}</td>
                  <td className="py-2.5 px-3 text-red-600 font-mono">{log.old_value || '-'}</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-mono">{log.new_value || '-'}</td>
                  <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate">{log.reason || '-'}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
