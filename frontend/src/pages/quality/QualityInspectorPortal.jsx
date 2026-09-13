import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCentreQueue, submitQuality } from '../../services/api';
import {
  Search, FlaskConical, Microscope, ClipboardCheck, Droplets,
  Wheat, CheckCircle2, Clock, AlertTriangle, FileCheck
} from 'lucide-react';

export default function QualityInspectorPortal() {
  const { user, selectedCentreId } = useAuth();
  const [queue, setQueue] = useState([]);
  const [activeToken, setActiveToken] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectionsDone, setInspectionsDone] = useState([]);

  // Quality Form
  const [moisture, setMoisture] = useState(12.0);
  const [foreignMatter, setForeignMatter] = useState(1.0);
  const [grainGrade, setGrainGrade] = useState('A');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 4000);
    return () => clearInterval(interval);
  }, [selectedCentreId]);

  const loadQueue = async () => {
    try {
      const res = await fetchCentreQueue(selectedCentreId);
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const pendingQueue = queue.filter(t =>
    t.status === 'waiting' || t.status === 'in_quality'
  );

  const filteredQueue = pendingQueue.filter(t =>
    t.token_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.farmer_name && t.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectToken = (token) => {
    setActiveToken(token);
    setMoisture(12.0);
    setForeignMatter(1.0);
    setGrainGrade('A');
    setInspectionNotes('');
    setSuccessMsg('');
  };

  const handleQualitySubmit = async (e) => {
    e.preventDefault();
    if (!activeToken) return;
    setSubmitting(true);
    try {
      await submitQuality({
        token_id: activeToken.id,
        moisture_pct: Number(moisture),
        foreign_matter_pct: Number(foreignMatter),
        evidence_notes: `Grade: ${grainGrade} | ${inspectionNotes}`
      });
      setInspectionsDone(prev => [...prev, {
        token: activeToken,
        moisture: Number(moisture),
        foreignMatter: Number(foreignMatter),
        grade: grainGrade,
        time: new Date().toLocaleTimeString()
      }]);
      setSuccessMsg(`Token #${activeToken.token_number} — Quality inspection passed! Grade: ${grainGrade}`);
      setActiveToken(null);
      loadQueue();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error submitting quality parameters');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoistureStatus = (val) => {
    if (val <= 12) return { label: 'Optimal', color: 'text-emerald-700 bg-emerald-100' };
    if (val <= 14) return { label: 'Acceptable', color: 'text-amber-700 bg-amber-100' };
    return { label: 'High Risk', color: 'text-red-700 bg-red-100' };
  };

  const getFMStatus = (val) => {
    if (val <= 1) return { label: 'Clean', color: 'text-emerald-700 bg-emerald-100' };
    if (val <= 2.5) return { label: 'Moderate', color: 'text-amber-700 bg-amber-100' };
    return { label: 'Excess', color: 'text-red-700 bg-red-100' };
  };

  const moistureStatus = getMoistureStatus(Number(moisture));
  const fmStatus = getFMStatus(Number(foreignMatter));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-800 to-yellow-900 text-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="bg-amber-500/20 text-amber-200 text-xs px-3 py-1 rounded-full font-semibold border border-amber-400/30 flex items-center gap-1 w-fit">
              <Microscope className="w-3.5 h-3.5" /> Quality Inspection & Grain Testing Lab
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">Crop Quality Assessment Station</h2>
            <p className="text-xs text-amber-200 mt-1">Moisture Analysis • Foreign Matter Detection • Grain Grading • Inspection Reports</p>
          </div>
          <FlaskConical className="w-16 h-16 text-amber-300/20" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Inspections Today</span>
            <span className="text-2xl font-bold text-amber-700">{inspectionsDone.length}</span>
          </div>
          <ClipboardCheck className="w-8 h-8 text-amber-600 p-1 bg-amber-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Pending in Queue</span>
            <span className="text-2xl font-bold text-orange-600">{pendingQueue.length}</span>
          </div>
          <Clock className="w-8 h-8 text-orange-500 p-1 bg-orange-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Avg Moisture %</span>
            <span className="text-2xl font-bold text-cyan-700">
              {inspectionsDone.length > 0 
                ? (inspectionsDone.reduce((s, i) => s + i.moisture, 0) / inspectionsDone.length).toFixed(1) + '%'
                : '--'}
            </span>
          </div>
          <Droplets className="w-8 h-8 text-cyan-500 p-1 bg-cyan-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Pass Rate</span>
            <span className="text-2xl font-bold text-emerald-700">
              {inspectionsDone.length > 0 ? '100%' : '--'}
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 p-1 bg-emerald-50 rounded-xl" />
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Pending Inspection Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Wheat className="w-4 h-4 text-amber-600" /> Pending Inspections
            </h3>
            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              {pendingQueue.length} pending
            </span>
          </div>

          <div className="relative text-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search token or farmer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {filteredQueue.length === 0 && (
              <div className="text-center text-gray-400 py-8 text-xs">
                <Wheat className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                No pending inspections
              </div>
            )}
            {filteredQueue.map(t => (
              <div
                key={t.id}
                onClick={() => handleSelectToken(t)}
                className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                  activeToken?.id === t.id
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">Token #{t.token_number}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{t.token_code}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{t.farmer_name || 'Farmer'}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                    t.status === 'in_quality' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t.status === 'in_quality' ? 'Testing' : 'Waiting'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Inspection Station */}
        <div className="lg:col-span-8 space-y-6">
          {activeToken ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">

              {/* Token Header */}
              <div className="bg-gradient-to-r from-amber-700 to-yellow-800 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-200 font-medium">Active Grain Inspection</span>
                  <h3 className="text-2xl font-bold text-white">Token #{activeToken.token_number}</h3>
                  <p className="text-xs text-amber-200 font-mono mt-0.5">
                    {activeToken.token_code} • {activeToken.farmer_name || 'Farmer'}
                  </p>
                </div>
                <Microscope className="w-10 h-10 text-amber-300/50" />
              </div>

              {/* Inspection Form */}
              <form onSubmit={handleQualitySubmit} className="space-y-5">
                
                {/* Moisture & Foreign Matter Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Moisture Card */}
                  <div className="border border-amber-200 rounded-xl p-4 space-y-3 bg-amber-50/30">
                    <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-600" /> Moisture Content Analysis
                    </h4>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 text-xs">Moisture Level (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={moisture}
                        onChange={(e) => setMoisture(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 font-mono font-bold text-lg text-center"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Standard: ≤ 12%</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${moistureStatus.color}`}>
                        {moistureStatus.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${Number(moisture) <= 12 ? 'bg-emerald-500' : Number(moisture) <= 14 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, (Number(moisture) / 20) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Foreign Matter Card */}
                  <div className="border border-amber-200 rounded-xl p-4 space-y-3 bg-amber-50/30">
                    <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" /> Foreign Matter Detection
                    </h4>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 text-xs">Foreign Matter (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={foreignMatter}
                        onChange={(e) => setForeignMatter(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 font-mono font-bold text-lg text-center"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Standard: ≤ 1%</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${fmStatus.color}`}>
                        {fmStatus.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${Number(foreignMatter) <= 1 ? 'bg-emerald-500' : Number(foreignMatter) <= 2.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, (Number(foreignMatter) / 5) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Grade & Notes Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2 mb-3">
                      <FileCheck className="w-4 h-4 text-amber-600" /> Grain Grade Classification
                    </h4>
                    <div className="flex gap-2">
                      {['A', 'B', 'C'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrainGrade(g)}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${
                            grainGrade === g
                              ? 'bg-amber-600 text-white shadow-lg scale-105'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          Grade {g}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 text-center">
                      {grainGrade === 'A' ? 'Premium Quality — MSP + bonus eligible' :
                       grainGrade === 'B' ? 'Standard Quality — MSP rate applicable' :
                       'Below Standard — Requires supervisor review'}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2 mb-3">
                      <ClipboardCheck className="w-4 h-4 text-amber-600" /> Inspector Notes
                    </h4>
                    <textarea
                      rows={3}
                      placeholder="Additional observations, sample remarks, lab notes..."
                      value={inspectionNotes}
                      onChange={(e) => setInspectionNotes(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-300 text-xs resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {submitting ? 'Submitting Inspection...' : 'Pass Quality Inspection & Forward to Weighing'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center space-y-3 text-gray-400">
              <Microscope className="w-14 h-14 mx-auto text-amber-200" />
              <p className="text-sm font-medium text-gray-500">Select a token from the pending queue to begin grain inspection.</p>
              <p className="text-xs text-gray-400">Moisture analysis, foreign matter detection, and grade classification.</p>
            </div>
          )}

          {/* Today's Completed Inspections */}
          {inspectionsDone.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-4">
                <FileCheck className="w-4 h-4 text-emerald-600" /> Today's Completed Inspections
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-2 pr-4">Token</th>
                      <th className="pb-2 pr-4">Farmer</th>
                      <th className="pb-2 pr-4">Moisture</th>
                      <th className="pb-2 pr-4">Foreign Matter</th>
                      <th className="pb-2 pr-4">Grade</th>
                      <th className="pb-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectionsDone.map((insp, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-bold">#{insp.token.token_number}</td>
                        <td className="py-2 pr-4 text-gray-600">{insp.token.farmer_name || 'Farmer'}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getMoistureStatus(insp.moisture).color}`}>
                            {insp.moisture}%
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getFMStatus(insp.foreignMatter).color}`}>
                            {insp.foreignMatter}%
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            insp.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                            insp.grade === 'B' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Grade {insp.grade}
                          </span>
                        </td>
                        <td className="py-2 text-gray-500 font-mono">{insp.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
