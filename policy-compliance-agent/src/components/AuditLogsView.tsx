import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AuditLogEntry } from '../../shared/types.js';

interface AuditLogsViewProps {
  logs: AuditLogEntry[];
  loading: boolean;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || log.eventType === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || log.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-600" />
            <span>Tamper-Evident Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological audit trail tracking all compliance evaluations, policy changes, rule modifications, and synthetic runs.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Total Events: <strong className="text-slate-900">{logs.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit records by actor, event details, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            <option value="ALL">All Event Types</option>
            <option value="COMPLIANCE_EVALUATION">Compliance Evaluation</option>
            <option value="POLICY_MODIFIED">Policy Modified</option>
            <option value="RULE_TOGGLED">Rule Toggled</option>
            <option value="SYNTHETIC_DATA_GENERATED">Synthetic Data Generated</option>
            <option value="EVALUATION_RUN">Evaluation Run</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            <option value="ALL">All Status Outcomes</option>
            <option value="SUCCESS">Success / Compliant</option>
            <option value="VIOLATION">Violation Detected</option>
            <option value="WARNING">Needs Review / Warning</option>
            <option value="INFO">Administrative Info</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No audit events match your search filters.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;

              return (
                <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500'
                            : log.status === 'VIOLATION'
                            ? 'bg-red-500'
                            : log.status === 'WARNING'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className="font-mono font-bold text-slate-900">{log.id}</span>
                      <span className="font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                        {log.eventType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] text-slate-500">
                        Actor: <strong className="text-slate-700">{log.actor}</strong>
                      </span>
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-slate-700 pl-5 leading-relaxed">{log.details}</p>

                  {isExpanded && log.metadata && (
                    <div className="mt-3 ml-5 p-3 bg-slate-900 text-slate-200 rounded font-mono text-[11px] overflow-x-auto">
                      <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
