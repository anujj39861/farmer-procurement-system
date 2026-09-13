import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchCentreQueue, patchQueueStatus, submitWeighing,
  requestWeightCorrection, confirmProcurement
} from '../../services/api';
import {
  Users, ShieldCheck, Scale, CheckCircle2, AlertOctagon,
  Search, ArrowRight, Lock, FileText, QrCode
} from 'lucide-react';
import QRModal from '../../components/QRModal';

export default function CentreOperatorPortal() {
  const { user, selectedCentreId } = useAuth();
  const [queue, setQueue] = useState([]);
  const [activeToken, setActiveToken] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Weighing Form
  const [grossWeight, setGrossWeight] = useState(520.0);
  const [tareWeight, setTareWeight] = useState(20.0);
  const [weightLocked, setWeightLocked] = useState(false);

  // Weight Correction Request Form
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [corrWeight, setCorrWeight] = useState(515.0);
  const [corrReason, setCorrReason] = useState("");

  // Procurement result & QR Modal
  const [procurementResult, setProcurementResult] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 4000);
    return () => clearInterval(interval);
  }, [selectedCentreId, statusFilter]);

  const loadQueue = async () => {
    try {
      const res = await fetchCentreQueue(selectedCentreId);
      let data = res.data;
      if (statusFilter !== "all") {
        data = data.filter(t => t.status === statusFilter);
      }
      setQueue(data);
      if (!activeToken && data.length > 0) {
        setActiveToken(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectToken = (token) => {
    setActiveToken(token);
    setWeightLocked(false);
  };


  const handleWeighingSubmit = async (e) => {
    e.preventDefault();
    if (!activeToken) return;
    try {
      await submitWeighing({
        token_id: activeToken.id,
        scale_id: "SCALE-01",
        gross_weight_kg: Number(grossWeight),
        tare_weight_kg: Number(tareWeight)
      });
      setWeightLocked(true);
      loadQueue();
      alert("Weight locked successfully!");
    } catch (err) {
      alert("Error saving weight reading");
    }
  };

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!activeToken || !corrReason) return;
    try {
      await requestWeightCorrection(activeToken.id, {
        requested_net_weight_kg: Number(corrWeight),
        reason: corrReason
      });
      setShowCorrectionModal(false);
      setCorrReason("");
      loadQueue();
      alert("Correction request sent to Centre Supervisor for approval!");
    } catch (err) {
      alert("Error requesting weight correction");
    }
  };

  const handleConfirmProcurement = async () => {
    if (!activeToken) return;
    try {
      const res = await confirmProcurement({ token_id: activeToken.id });
      setProcurementResult(res.data);
      setShowQR(true);
      loadQueue();
    } catch (err) {
      alert(err.response?.data?.detail || "Procurement confirmation error");
    }
  };

  const filteredQueue = queue.filter(t =>
    t.token_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.farmer_name && t.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-cyan-900 text-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="bg-blue-500/20 text-blue-200 text-xs px-3 py-1 rounded-full font-semibold border border-blue-400/30 flex items-center gap-1 w-fit">
              <Scale className="w-3.5 h-3.5" /> Scale Operator & Procurement Desk
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">Weighing & Procurement Station</h2>
            <p className="text-xs text-blue-200 mt-1">Queue Management • Scale Weighing • Anti-Manipulation Lock • Procurement Confirmation</p>
          </div>
          <Scale className="w-16 h-16 text-blue-300/20" />
        </div>
      </div>

      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Total Tokens in Queue</span>
            <span className="text-2xl font-bold text-gray-900">{queue.length}</span>
          </div>
          <Users className="w-8 h-8 text-blue-600 p-1 bg-blue-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Active Processing Token</span>
            <span className="text-2xl font-bold text-amber-600">
              {activeToken ? `#${activeToken.token_number}` : 'None'}
            </span>
          </div>
          <Scale className="w-8 h-8 text-amber-600 p-1 bg-amber-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Active Counter Staff</span>
            <span className="text-2xl font-bold text-emerald-800">4 Counters</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-600 p-1 bg-emerald-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-500 block">Centre Status</span>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Operational
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-600 p-1 bg-emerald-50 rounded-xl" />
        </div>
      </div>

      {/* Main Grid: Queue Table & Station Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Searchable Queue List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> Live Queue Feed
            </h3>
            <span className="text-xs text-gray-400 font-mono">Auto-refreshed</span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search token code or farmer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div className="flex gap-1 overflow-x-auto pb-1">
              {['all', 'waiting', 'in_quality', 'in_weighing', 'in_procurement'].map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium text-[11px] whitespace-nowrap ${
                    statusFilter === f ? 'bg-emerald-700 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Token List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredQueue.map(t => (
              <div
                key={t.id}
                onClick={() => handleSelectToken(t)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                  activeToken?.id === t.id
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div>
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    <span>Token #{t.token_number}</span>
                    <span className="text-[10px] text-gray-500 font-mono">({t.token_code})</span>
                  </div>
                  <div className="text-gray-500 text-[11px]">{t.farmer_name || 'Farmer Ramesh'} • {t.farmer_phone || '9876543210'}</div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                    t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    t.status === 'in_weighing' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t.status.replace('_', ' ')}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-1">Pos: #{t.position}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Active Processing Workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {activeToken ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              
              {/* Token Header Banner */}
              <div className="bg-emerald-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-300 font-medium">Processing Active Farmer Token</span>
                  <h3 className="text-2xl font-bold text-amber-300">Token #{activeToken.token_number}</h3>
                  <p className="text-xs text-emerald-200 font-mono mt-0.5">{activeToken.token_code}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="bg-emerald-800 px-3 py-1 rounded-full text-emerald-200 font-semibold uppercase">
                    Stage: {activeToken.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Station 1: Anti-Manipulation Digital Scale Entry */}
              <div className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-600" /> Station 1: Scale Weighing (Anti-Manipulation Lock)
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">Scale ID: SCALE-KARNAL-01</span>
                </div>

                <form onSubmit={handleWeighingSubmit} className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Gross Weight (kg)</label>
                    <input
                      type="number"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 font-mono font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Tare Bag (kg)</label>
                    <input
                      type="number"
                      value={tareWeight}
                      onChange={(e) => setTareWeight(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Net Weight (kg)</label>
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 font-bold font-mono text-center">
                      {Math.max(0, grossWeight - tareWeight)} kg
                    </div>
                  </div>

                  <div className="col-span-2">
                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" /> Lock Weight Record
                    </button>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowCorrectionModal(true)}
                      className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-xs transition border border-red-300"
                    >
                      Request Correction
                    </button>
                  </div>
                </form>
              </div>

              {/* Station 3: 1-Click Procurement & Lot QR Generator */}
              <div className="pt-2">
                <button
                  onClick={handleConfirmProcurement}
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-amber-400" /> Confirm Procurement & Issue Unique Lot QR Code
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center space-y-3 text-gray-400">
              <Users className="w-12 h-12 mx-auto text-gray-300" />
              <p className="text-sm font-medium">Select a token from the live queue feed to begin processing.</p>
            </div>
          )}

        </div>

      </div>

      {/* Weight Correction Request Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-600" /> Request Weight Correction
            </h3>
            <p className="text-gray-500">
              Anti-manipulation workflow requires supervisor approval for modifying locked scale weights.
            </p>

            <form onSubmit={handleCorrectionSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">New Requested Net Weight (kg)</label>
                <input
                  type="number"
                  value={corrWeight}
                  onChange={(e) => setCorrWeight(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Audit Reason / Calibration Slip Note</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State clear rationale for correction..."
                  value={corrReason}
                  onChange={(e) => setCorrReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="w-1/2 py-2 bg-gray-200 text-gray-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                >
                  Submit to Supervisor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} procurementData={procurementResult} />
    </div>
  );
}
