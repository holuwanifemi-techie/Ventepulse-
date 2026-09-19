import React, { useState } from 'react';
import {
  Zap,
  Plus,
  ArrowRight,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  X,
  Sliders,
  Check,
  Power
} from 'lucide-react';

export type WhenTrigger =
  | 'New lead'
  | 'Lead stage changes'
  | 'Follow-up becomes overdue'
  | 'Calendar meeting created'
  | 'Calendar meeting completed';

export type IfCondition =
  | 'Lead score'
  | 'Lead stage'
  | 'Days since last contact'
  | 'Lead source';

export type ThenAction =
  | 'Update lead score'
  | 'Change lead stage'
  | 'Create follow-up'
  | 'Add priority'
  | 'Remove priority'
  | 'Add note';

export interface AutomationItem {
  id: string;
  name: string;
  when: WhenTrigger;
  whenDetail?: string;
  ifCondition: IfCondition;
  ifDetail?: string;
  then: ThenAction;
  thenDetail?: string;
  isActive: boolean;
  createdAt: string;
}

const INITIAL_AUTOMATIONS: AutomationItem[] = [
  {
    id: 'auto-1',
    name: 'High Score Meeting Follow-up',
    when: 'Calendar meeting completed',
    whenDetail: 'Any scheduled client meeting',
    ifCondition: 'Lead score',
    ifDetail: 'Score is 70 or higher (Warm / Hot)',
    then: 'Create follow-up',
    thenDetail: 'Schedule follow-up for tomorrow at 10:00 AM',
    isActive: true,
    createdAt: '2026-09-08T10:00:00Z',
  },
  {
    id: 'auto-2',
    name: 'Overdue Hot Lead Priority Alert',
    when: 'Follow-up becomes overdue',
    whenDetail: 'Due date passed',
    ifCondition: 'Lead score',
    ifDetail: 'Lead is Hot (Score 80–100)',
    then: 'Add priority',
    thenDetail: "Add lead to Today's Priorities board",
    isActive: true,
    createdAt: '2026-09-09T14:30:00Z',
  },
  {
    id: 'auto-3',
    name: 'Inbound Website Lead Fast Response',
    when: 'New lead',
    whenDetail: 'Captured via web form or direct',
    ifCondition: 'Lead source',
    ifDetail: "Source equals 'Website'",
    then: 'Create follow-up',
    thenDetail: 'Schedule same-day initial outreach',
    isActive: true,
    createdAt: '2026-09-10T09:15:00Z',
  },
  {
    id: 'auto-4',
    name: 'Stale Lead Score Decay',
    when: 'Lead stage changes',
    whenDetail: 'Changed to any active stage',
    ifCondition: 'Days since last contact',
    ifDetail: 'More than 7 days without contact',
    then: 'Update lead score',
    thenDetail: 'Deduct 15 points (Flag At Risk)',
    isActive: false,
    createdAt: '2026-09-11T16:00:00Z',
  },
];

const WHEN_OPTIONS: { label: WhenTrigger; desc: string; icon: any }[] = [
  { label: 'New lead', desc: 'When a new lead is created or captured', icon: Sparkles },
  { label: 'Lead stage changes', desc: 'When a lead moves to a different pipeline stage', icon: Layers },
  { label: 'Follow-up becomes overdue', desc: 'When a scheduled follow-up passes its due date', icon: Clock },
  { label: 'Calendar meeting created', desc: 'When a Google Calendar event is booked with a lead', icon: Calendar },
  { label: 'Calendar meeting completed', desc: 'When a scheduled calendar meeting has ended', icon: CheckCircle2 },
];

const IF_OPTIONS: { label: IfCondition; desc: string }[] = [
  { label: 'Lead score', desc: 'Check score threshold (Hot 80–100, Warm 50–79, At Risk 0–24)' },
  { label: 'Lead stage', desc: 'Check current stage (Contacted, Interested, Negotiating)' },
  { label: 'Days since last contact', desc: 'Check days of inactivity since last touch' },
  { label: 'Lead source', desc: 'Check origin channel (Website, Direct, Referral)' },
];

const THEN_OPTIONS: { label: ThenAction; desc: string }[] = [
  { label: 'Update lead score', desc: 'Add, deduct, or set lead score (0–100)' },
  { label: 'Change lead stage', desc: 'Advance or update the lead to a target stage' },
  { label: 'Create follow-up', desc: 'Automatically schedule a follow-up task' },
  { label: 'Add priority', desc: "Pin lead to Today's Priorities on dashboard" },
  { label: 'Remove priority', desc: 'Unpin lead from priority status' },
  { label: 'Add note', desc: 'Append an automated timeline note to lead' },
];

export const AutomationsView: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationItem[]>(INITIAL_AUTOMATIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AutomationItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formWhen, setFormWhen] = useState<WhenTrigger>('New lead');
  const [formWhenDetail, setFormWhenDetail] = useState('');
  const [formIf, setFormIf] = useState<IfCondition>('Lead score');
  const [formIfDetail, setFormIfDetail] = useState('');
  const [formThen, setFormThen] = useState<ThenAction>('Create follow-up');
  const [formThenDetail, setFormThenDetail] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormWhen('Calendar meeting completed');
    setFormWhenDetail('Any client meeting');
    setFormIf('Lead score');
    setFormIfDetail('Score is 70 or higher (Warm / Hot)');
    setFormThen('Create follow-up');
    setFormThenDetail('Schedule follow-up for tomorrow');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AutomationItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormWhen(item.when);
    setFormWhenDetail(item.whenDetail || '');
    setFormIf(item.ifCondition);
    setFormIfDetail(item.ifDetail || '');
    setFormThen(item.then);
    setFormThenDetail(item.thenDetail || '');
    setFormActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAutomations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.isActive;
          showToast(`Automation "${item.name}" ${nextState ? 'enabled' : 'disabled'}.`);
          return { ...item, isActive: nextState };
        }
        return item;
      })
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = automations.find((a) => a.id === id);
    if (!target) return;
    if (window.confirm(`Delete automation "${target.name}"?`)) {
      setAutomations((prev) => prev.filter((a) => a.id !== id));
      showToast(`Automation "${target.name}" deleted.`);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter an automation name.');
      return;
    }

    if (editingItem) {
      setAutomations((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: formName.trim(),
                when: formWhen,
                whenDetail: formWhenDetail.trim() || undefined,
                ifCondition: formIf,
                ifDetail: formIfDetail.trim() || undefined,
                then: formThen,
                thenDetail: formThenDetail.trim() || undefined,
                isActive: formActive,
              }
            : item
        )
      );
      showToast(`Automation "${formName}" updated.`);
    } else {
      const newItem: AutomationItem = {
        id: `auto-${Date.now()}`,
        name: formName.trim(),
        when: formWhen,
        whenDetail: formWhenDetail.trim() || undefined,
        ifCondition: formIf,
        ifDetail: formIfDetail.trim() || undefined,
        then: formThen,
        thenDetail: formThenDetail.trim() || undefined,
        isActive: formActive,
        createdAt: new Date().toISOString(),
      };
      setAutomations((prev) => [newItem, ...prev]);
      showToast(`Automation "${formName}" created.`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Automations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium">
            Automate your follow-ups without complicated workflows.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Automation</span>
        </button>
      </div>

      {/* Model Overview Banner */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-400 overflow-x-auto gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">Simple Logic:</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-medium">
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 font-bold">
            WHEN Trigger
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 font-bold">
            IF Condition
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 font-bold">
            THEN Action
          </span>
        </div>
        <div className="hidden sm:block text-[11px] text-slate-500 shrink-0">
          {automations.filter((a) => a.isActive).length} active / {automations.length} total
        </div>
      </div>

      {/* Existing Automations Cards */}
      <div className="space-y-3">
        {automations.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">No Automations Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first lightweight rule to automate follow-up dates, lead stages, and priorities.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Rule</span>
            </button>
          </div>
        ) : (
          automations.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900/80 border rounded-2xl p-4 sm:p-5 transition-all space-y-3.5 shadow-sm group ${
                item.isActive
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-900/90 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Card Top: Name, Status & Action Controls */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                      {item.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-2.5 h-2.5 text-slate-500" />
                          <span>Inactive</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Control Actions: Toggle, Edit, Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Enable / Disable Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleStatus(item.id, e)}
                    title={item.isActive ? 'Disable Automation' : 'Enable Automation'}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      item.isActive
                        ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-700/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Power className={`w-3.5 h-3.5 ${item.isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="hidden sm:inline">{item.isActive ? 'Enabled' : 'Disabled'}</span>
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    title="Edit Automation"
                    className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    title="Delete Automation"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* WHEN -> IF -> THEN Grid Visualizer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* WHEN Box */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    <Clock className="w-3 h-3" />
                    <span>WHEN</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-100">{item.when}</p>
                  {item.whenDetail && (
                    <p className="text-[11px] text-slate-400 line-clamp-1">{item.whenDetail}</p>
                  )}
                </div>

                {/* IF Box */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    <Sliders className="w-3 h-3" />
                    <span>IF</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-100">{item.ifCondition}</p>
                  {item.ifDetail && (
                    <p className="text-[11px] text-slate-400 line-clamp-1">{item.ifDetail}</p>
                  )}
                </div>

                {/* THEN Box */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <Sparkles className="w-3 h-3" />
                    <span>THEN</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-100">{item.then}</p>
                  {item.thenDetail && (
                    <p className="text-[11px] text-slate-400 line-clamp-1">{item.thenDetail}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Automation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingItem ? 'Edit Automation' : 'Create Automation'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Configure your WHEN → IF → THEN execution rule
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              
              {/* Field 1: Automation Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  Automation Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., High Score Meeting Follow-up"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Field 2: WHEN Trigger */}
              <div className="space-y-1.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>WHEN Trigger</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Event starting the rule</span>
                </div>
                <select
                  value={formWhen}
                  onChange={(e) => setFormWhen(e.target.value as WhenTrigger)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  {WHEN_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={formWhenDetail}
                  onChange={(e) => setFormWhenDetail(e.target.value)}
                  placeholder="Optional detail (e.g. Any calendar meeting, or specific stage)"
                  className="w-full px-3 py-1.5 bg-slate-900/70 border border-slate-800/80 rounded-lg text-slate-300 placeholder-slate-500 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                />
              </div>

              {/* Field 3: IF Condition */}
              <div className="space-y-1.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>IF Condition</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Criteria that must be met</span>
                </div>
                <select
                  value={formIf}
                  onChange={(e) => setFormIf(e.target.value as IfCondition)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {IF_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label} — {opt.desc}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={formIfDetail}
                  onChange={(e) => setFormIfDetail(e.target.value)}
                  placeholder="Condition rule (e.g. Score >= 70, or Stage = 'Interested', or Days > 3)"
                  className="w-full px-3 py-1.5 bg-slate-900/70 border border-slate-800/80 rounded-lg text-slate-300 placeholder-slate-500 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                />
              </div>

              {/* Field 4: THEN Action */}
              <div className="space-y-1.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>THEN Action</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Action to execute</span>
                </div>
                <select
                  value={formThen}
                  onChange={(e) => setFormThen(e.target.value as ThenAction)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {THEN_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label} — {opt.desc}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={formThenDetail}
                  onChange={(e) => setFormThenDetail(e.target.value)}
                  placeholder="Action detail (e.g. Schedule follow-up for tomorrow, or Set score to 80)"
                  className="w-full px-3 py-1.5 bg-slate-900/70 border border-slate-800/80 rounded-lg text-slate-300 placeholder-slate-500 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              {/* Active / Inactive Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="auto-active"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/50 bg-slate-950 border-slate-800 cursor-pointer"
                />
                <label htmlFor="auto-active" className="text-slate-300 font-semibold cursor-pointer">
                  Activate this rule immediately
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Create Automation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
