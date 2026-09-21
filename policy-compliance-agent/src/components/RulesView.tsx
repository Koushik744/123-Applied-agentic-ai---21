import React, { useState } from 'react';
import {
  ListChecks,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { Rule, SeverityLevel } from '../../shared/types.js';

interface RulesViewProps {
  rules: Rule[];
  loading: boolean;
  onToggleRule: (id: string) => Promise<void>;
}

export const RulesView: React.FC<RulesViewProps> = ({ rules, loading, onToggleRule }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [filterActiveOnly, setFilterActiveOnly] = useState<boolean>(false);

  const policyIds = Array.from(new Set(rules.map((r) => r.policyId)));

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPolicy = selectedPolicy === 'ALL' || r.policyId === selectedPolicy;
    const matchesSeverity = selectedSeverity === 'ALL' || r.severity === selectedSeverity;
    const matchesActive = !filterActiveOnly || r.active;

    return matchesSearch && matchesPolicy && matchesSeverity && matchesActive;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <ListChecks className="w-5 h-5 text-emerald-600" />
            <span>Deterministic Rule Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic constraints, regex patterns, and security assertions executed by the zero-trust evaluation engine.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Total Rules: <strong className="text-slate-900">{rules.length}</strong> ({rules.filter((r) => r.active).length} Active)
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by rule ID (e.g. RULE-PWD-001) or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedPolicy}
            onChange={(e) => setSelectedPolicy(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            <option value="ALL">All Policy Domains</option>
            {policyIds.map((pid) => (
              <option key={pid} value={pid}>
                {pid}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center justify-end">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-600 select-none">
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={(e) => setFilterActiveOnly(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Active Only</span>
          </label>
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading rule registry...</div>
      ) : filteredRules.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No rules found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white rounded-xl p-4 border transition-all space-y-3 ${
                rule.active ? 'border-slate-200 shadow-sm' : 'border-slate-200/60 bg-slate-50/50 opacity-75'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {rule.id}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {rule.policyId}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                        rule.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : rule.severity === 'HIGH'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {rule.severity}
                    </span>
                    {rule.isMandatory && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{rule.name}</h3>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => onToggleRule(rule.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
                    rule.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {rule.active ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>

              {/* Technical Rule Specifications */}
              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[11px] text-slate-700 overflow-x-auto">
                  <span className="text-slate-400 mr-1 font-sans font-semibold">Assertion:</span>
                  {rule.condition}
                </div>

                <div className="text-[11px] text-slate-600">
                  <strong className="text-slate-800">Expected Behavior:</strong> {rule.expectedBehavior}
                </div>

                <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 text-[11px] text-emerald-800">
                  <strong>Remediation:</strong> {rule.remediation}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
