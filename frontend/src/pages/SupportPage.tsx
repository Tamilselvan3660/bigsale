import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Wrench, Shield, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const SupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ticket' | 'repair'>('ticket');

  // Support ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order & Shipping Inquiry');
  const [priority, setPriority] = useState('HIGH');
  const [message, setMessage] = useState('');
  const [ticketResult, setTicketResult] = useState<any>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  // Service repair request form
  const [productName, setProductName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [serviceType, setServiceType] = useState('Pickup & Repair');
  const [repairResult, setRepairResult] = useState<any>(null);
  const [loadingRepair, setLoadingRepair] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setLoadingTicket(true);
    try {
      const resp = await api.post('/support/tickets', { subject, category, priority, message });
      if (resp.data.success) {
        setTicketResult(resp.data.data);
        toast.success('Support ticket lodged successfully!');
      }
    } catch (err: any) {
      toast.error('Failed to submit support ticket');
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleSubmitRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !issueDescription.trim()) return;

    setLoadingRepair(true);
    try {
      const resp = await api.post('/service/requests', { productName, serialNumber, issueDescription, serviceType });
      if (resp.data.success) {
        setRepairResult(resp.data.data);
        toast.success('Repair request submitted successfully!');
      }
    } catch (err: any) {
      toast.error('Failed to submit repair request');
    } finally {
      setLoadingRepair(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-accent-700 text-xs font-bold px-3.5 py-1 rounded-full">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>TECHNICAL SUPPORT & AFTER-SALES HUB</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Customer Care & Repair Center
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Need assistance with an existing order, return verification, or authorized technician repair? Lodge a ticket or book hardware diagnostic service.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-200/80 p-1.5 rounded-2xl inline-flex gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('ticket')}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'ticket' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-accent-600" />
            <span>Customer Support Ticket</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('repair')}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'repair' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-accent-600" />
            <span>Service Center & Repairs</span>
          </button>
        </div>
      </div>

      {/* Ticket Panel */}
      {activeTab === 'ticket' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          {ticketResult ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-black text-slate-900">Support Ticket Logged: #{ticketResult.ticketId}</h3>
                  <p className="text-xs text-slate-500">Assigned: {ticketResult.agentAssigned}</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs">
                {ticketResult.messages.map((m: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{m.sender}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(m.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setTicketResult(null)}
                className="text-xs font-bold text-accent-600 hover:underline"
              >
                ← Create Another Support Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Inquiry Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
                  >
                    <option value="Order & Shipping Inquiry">Order & Shipping Inquiry</option>
                    <option value="Technical Specifications Assistance">Technical Specifications Assistance</option>
                    <option value="Billing & Tax Invoice Query">Billing & Tax Invoice Query</option>
                    <option value="Returns & RMA Authorization">Returns & RMA Authorization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
                  >
                    <option value="HIGH">High Priority (Urgent dispatch / billing)</option>
                    <option value="MEDIUM">Standard Priority (General query)</option>
                    <option value="LOW">Low Priority (Feedback / catalog request)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Inquiring about international customs clearance"
                  required
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Detailed Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide all relevant details, order numbers, or hardware issues..."
                  required
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loadingTicket}
                className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loadingTicket ? 'Transmitting Ticket...' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Repair Panel */}
      {activeTab === 'repair' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          {repairResult ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-black text-slate-900">Repair Case Lodged: #{repairResult.ticketNumber}</h3>
                  <p className="text-xs text-slate-500">Service Center: {repairResult.assignedCenter}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs space-y-2">
                <p><strong>Device:</strong> {repairResult.productName}</p>
                <p><strong>Issue Reported:</strong> {repairResult.issueDescription}</p>
                <p><strong>Service Type:</strong> {repairResult.serviceType}</p>
                <p><strong>Estimated Turnaround:</strong> ~{repairResult.estimatedResolutionDays} Business Days</p>
              </div>

              <button
                type="button"
                onClick={() => setRepairResult(null)}
                className="text-xs font-bold text-accent-600 hover:underline"
              >
                ← Book Another Repair Session
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitRepair} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Product / Device Model
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Apple MacBook Pro 16 M3 Max"
                    required
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Serial Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-849204"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Service Request Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
                >
                  <option value="Pickup & Repair">Doorstep Courier Pickup & Central Diagnostic Repair</option>
                  <option value="Walk-in Hub Service">Authorized Local Walk-in Service Hub Inspection</option>
                  <option value="On-site Technician Visit">On-Site Commercial Technician Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Hardware Problem Description
                </label>
                <textarea
                  rows={4}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe the failure symptoms (e.g. Display flicker, port non-responsive, battery drain)..."
                  required
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loadingRepair}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow transition-all"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{loadingRepair ? 'Lodging Repair Request...' : 'Schedule Hardware Service'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default SupportPage;

