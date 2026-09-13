import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchCentres, fetchCentreQueue, createToken, raiseIssue, fetchIssues,
  classifyComplaintNLP, fetchProcurementByToken, fetchFarmerTokens
} from '../../services/api';
import StatusTimeline from '../../components/StatusTimeline';
import QRModal from '../../components/QRModal';
import CentreMap from '../../components/CentreMap';
import {
  Ticket, Calendar, Clock, AlertTriangle, ShieldCheck,
  Send, HelpCircle, CheckCircle2, QrCode, MapPin, Sparkles
} from 'lucide-react';

export default function FarmerPortal() {
  const { user } = useAuth();
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(user?.centre_id || 1);
  const [currentToken, setCurrentToken] = useState(null);
  const [centreQueue, setCentreQueue] = useState([]);
  const [procurement, setProcurement] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Slot Booking Form state
  const [timeSlot, setTimeSlot] = useState("09:00 - 10:00 AM");
  const [cropType, setCropType] = useState("Wheat");
  const [qtyKg, setQtyKg] = useState(500);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Issue Form state
  const [issueSubject, setIssueSubject] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [aiSuggest, setAiSuggest] = useState(null);
  const [myIssues, setMyIssues] = useState([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [selectedCentre]);

  const loadData = async () => {
    try {
      const cRes = await fetchCentres();
      setCentres(cRes.data);

      const qRes = await fetchCentreQueue(selectedCentre);
      const queueList = qRes.data || [];
      setCentreQueue(queueList);

      // Fetch farmer's own tokens directly from the dedicated farmer tokens API
      let myTok = null;
      try {
        const ftRes = await fetchFarmerTokens(user.id);
        const myAllTokens = ftRes.data || [];
        if (myAllTokens.length > 0) {
          myTok = myAllTokens[myAllTokens.length - 1]; // latest token
        }
      } catch (err) {
        // Fallback to queue list if endpoint fails
        const userTokens = queueList.filter(t => String(t.farmer_id) === String(user.id));
        myTok = userTokens.length > 0 ? userTokens[userTokens.length - 1] : null;
      }
      
      setCurrentToken(myTok);
      if (myTok && myTok.status === 'completed') {
        try {
          const pRes = await fetchProcurementByToken(myTok.id);
          setProcurement(pRes.data);
        } catch (e) {}
      } else if (!myTok) {
        setProcurement(null);
      }

      const issRes = await fetchIssues(user.id);
      setMyIssues(issRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookSlot = async (e) => {
    e.preventDefault();
    try {
      const tokRes = await createToken({
        centre_id: Number(selectedCentre),
        farmer_id: user?.id || 1
      });
      setCurrentToken(tokRes.data);
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 4000);
      loadData();
    } catch (err) {
      alert("Error generating Smart Token");
    }
  };

  const handleIssueTextChange = async (desc) => {
    setIssueDesc(desc);
    if (desc.length > 5) {
      try {
        const res = await classifyComplaintNLP(desc);
        setAiSuggest(res.data);
      } catch (e) {}
    }
  };

  const handleRaiseIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueSubject || !issueDesc) return;
    try {
      await raiseIssue({
        token_id: currentToken?.id,
        centre_id: Number(selectedCentre),
        subject: issueSubject,
        description: issueDesc
      });
      setIssueSubject("");
      setIssueDesc("");
      setAiSuggest(null);
      loadData();
      alert("Issue submitted successfully to Centre Supervisor!");
    } catch (err) {
      alert("Error submitting issue");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner / Hero Ticker */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Ticket className="w-96 h-96" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Smart Token Box */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30 font-semibold flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5" /> Live Queue Token Status
              </span>
              {currentToken && (
                <>
                  <span className="bg-white/10 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full border border-white/20 font-medium">
                    Centre: {centres.find(c => c.id === currentToken.centre_id)?.name || `Centre #${currentToken.centre_id}`}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    currentToken.delay_risk === 'High' ? 'bg-red-500 text-white' :
                    currentToken.delay_risk === 'Medium' ? 'bg-amber-400 text-gray-900' : 'bg-emerald-400 text-emerald-950'
                  }`}>
                    Risk: {currentToken.delay_risk}
                  </span>
                </>
              )}
            </div>

            {currentToken ? (
              <div>
                <div className="flex items-baseline gap-4">
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-amber-300 tracking-tight">
                    Token #{currentToken.token_number}
                  </h2>
                  <span className="text-sm text-emerald-200 font-mono">({currentToken.token_code})</span>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-700/50">
                    <span className="text-emerald-400 block text-[11px]">Farmers Ahead</span>
                    <span className="text-2xl font-bold text-white">{currentToken.position - 1} Farmers</span>
                  </div>

                  <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-700/50">
                    <span className="text-emerald-400 block text-[11px]">ML Estimated Wait Time</span>
                    <span className="text-2xl font-bold text-amber-300">~{currentToken.estimated_wait_min} mins</span>
                  </div>

                  <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-700/50 col-span-2 sm:col-span-1">
                    <span className="text-emerald-400 block text-[11px]">Current Stage</span>
                    <span className="text-lg font-bold text-white capitalize">{currentToken.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white">No active queue token for today</h2>
                <p className="text-xs text-emerald-200 mt-1">Book a slot below to get a smart queue token & estimated arrival time.</p>
              </div>
            )}

            {/* Stage Progress Timeline */}
            {currentToken && (
              <div className="bg-white/95 rounded-2xl p-4 shadow-lg text-gray-900 mt-4">
                <StatusTimeline currentStatus={currentToken.status} />
              </div>
            )}
          </div>

          {/* Quick Receipt / Action Side Card */}
          <div className="bg-emerald-950/80 rounded-2xl p-5 border border-emerald-700 flex flex-col justify-between h-full space-y-4">
            <div>
              <h3 className="font-bold text-emerald-200 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" /> Digital Procurement Receipt
              </h3>
              <p className="text-xs text-emerald-300 mt-1">
                {procurement ? "Your crop has been verified & payment confirmed!" : "Receipt & QR will generate automatically upon weighing & procurement lock."}
              </p>
            </div>

            {procurement ? (
              <button
                onClick={() => setShowQR(true)}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5" /> View Verified Lot QR Code
              </button>
            ) : (
              <div className="p-3 bg-emerald-900/50 rounded-xl border border-emerald-800 text-xs text-emerald-400 text-center">
                Awaiting Procurement Confirmation...
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Grid: Slot Booking & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Slot Booking Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-base">Book Slot & Smart Token</h3>
          </div>

          {bookingSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Token successfully generated!
            </div>
          )}

          <form onSubmit={handleBookSlot} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Select Procurement Centre</label>
              <select
                value={selectedCentre}
                onChange={(e) => setSelectedCentre(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              >
                {centres.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.district})</option>
                ))}
              </select>

              {/* Live Centre Token Status & Sequence Box */}
              <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-emerald-900">
                  <span>Centre ID: #{selectedCentre} Live Status</span>
                  <span className="bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full text-[10px]">
                    {centreQueue.length} Active in Queue
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Last Issued Token:</span>
                  <span className="font-bold font-mono text-gray-900">
                    {centreQueue.length > 0 
                      ? `#${Math.max(...centreQueue.map(t => t.token_number))}` 
                      : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-emerald-800 font-medium pt-1 border-t border-emerald-200/60">
                  <span>Next Token for You:</span>
                  <span className="font-extrabold font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                    #{centreQueue.length > 0 
                      ? Math.max(...centreQueue.map(t => t.token_number)) + 1 
                      : 1}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Expected Crop</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Wheat">Wheat (Kanak)</option>
                  <option value="Paddy">Paddy (Chawal)</option>
                  <option value="Mustard">Mustard (Sarson)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Est. Weight (kg)</label>
                <input
                  type="number"
                  value={qtyKg}
                  onChange={(e) => setQtyKg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Preferred Arrival Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="08:00 - 09:00 AM">08:00 - 09:00 AM (Early Slot)</option>
                <option value="09:00 - 10:00 AM">09:00 - 10:00 AM</option>
                <option value="10:00 - 11:00 AM">10:00 - 11:00 AM</option>
                <option value="11:00 - 12:00 PM">11:00 - 12:00 PM</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
            >
              Generate Smart Token
            </button>
          </form>
        </div>

        {/* Nearby Centres Map */}
        <div className="lg:col-span-2">
          <CentreMap centres={centres} />
        </div>

      </div>

      {/* Issue Desk & NLP Classifier Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Submit Issue Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-base">Raise Dispute or Grievance Issue</h3>
          </div>

          <form onSubmit={handleRaiseIssueSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Subject</label>
              <input
                type="text"
                placeholder="e.g. Weight mismatch on kanta scale / Payment delay"
                value={issueSubject}
                onChange={(e) => setIssueSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Issue Description (Type in Hindi/English)</label>
              <textarea
                rows={3}
                placeholder="Describe your issue in detail..."
                value={issueDesc}
                onChange={(e) => handleIssueTextChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* AI NLP Live Suggestion Pill */}
            {aiSuggest && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>
                    <strong>AI Suggested Category:</strong> {aiSuggest.suggested_category}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  aiSuggest.suggested_priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-800'
                }`}>
                  Priority: {aiSuggest.suggested_priority}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="py-2.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow flex items-center gap-2 text-xs"
            >
              <Send className="w-4 h-4" /> Submit Issue to Supervisor Desk
            </button>
          </form>
        </div>

        {/* My Raised Issues List */}
        <div className="space-y-3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
          <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">My Active Grievance Tickets</h4>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {myIssues.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No open issues raised.</p>
            ) : (
              myIssues.map(iss => (
                <div key={iss.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{iss.subject}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      iss.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {iss.status}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{iss.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} procurementData={procurement} />
    </div>
  );
}
