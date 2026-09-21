import React from 'react';
import {
  Shield,
  BookOpen,
  ListChecks,
  Database,
  Target,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  FileSearch,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { DashboardStats } from '../services/api.js';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (page: any) => void;
}

const COLORS = {
  compliant: '#10b981', // emerald-500
  nonCompliant: '#ef4444', // red-500
  needsReview: '#f59e0b', // amber-500
  slate: '#64748b',
};

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, loading, onNavigate }) => {
  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Synthesizing compliance metrics & benchmarks...</p>
      </div>
    );
  }

  const complianceDistributionData = [
    { name: 'Compliant', value: stats.complianceRate, color: COLORS.compliant },
    { name: 'Non-Compliant', value: stats.nonComplianceRate, color: COLORS.nonCompliant },
    { name: 'Needs Review', value: stats.needsReviewRate, color: COLORS.needsReview },
  ];

  const ruleViolationsData = stats.topViolatedRules.map((r) => ({
    name: r.ruleId,
    ruleName: r.ruleName,
    violations: r.count,
    severity: r.severity,
  }));

  const performanceMetricsData = [
    { name: 'Accuracy', score: stats.accuracy },
    { name: 'Precision', score: stats.precision },
    { name: 'Recall', score: stats.recall },
    { name: 'F1 Score', score: stats.f1Score },
  ];

  const severityData = [
    { name: 'Critical', count: 7, fill: '#dc2626' },
    { name: 'High', count: 6, fill: '#ea580c' },
    { name: 'Medium', count: 5, fill: '#d97706' },
    { name: 'Low', count: 1, fill: '#64748b' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Deterministic Parity 100%
            </span>
            <span className="text-xs text-slate-400">Continuous Policy Enforcement</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-100">
            Enterprise Policy Compliance Overview
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
            Autonomous policy evaluation engine combining deterministic constraint validation with LLM natural language interpretation across active corporate governance domains.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-btn-checker"
            onClick={() => onNavigate('checker')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Check Text / Payload</span>
          </button>
          <button
            id="dash-btn-eval"
            onClick={() => onNavigate('evaluation')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Run Evaluation Suite</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Policies</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{stats.activePolicies}</span>
            <span className="text-xs text-slate-500">/ {stats.totalPolicies} total active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center">
            <span className="text-emerald-600 font-medium mr-1">5 core domains:</span>
            <span>Auth, PII, Retention, Access, Docs</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Deterministic Rules</span>
            <ListChecks className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{stats.activeRules}</span>
            <span className="text-xs text-slate-500">active constraints</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center">
            <span className="text-slate-900 font-semibold mr-1">{stats.totalRules}</span>
            <span>total configured across policies</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Evaluation Accuracy</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-600">{stats.accuracy}%</span>
            <span className="text-xs text-slate-500">F1: {stats.f1Score}%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center">
            <span>Precision: {stats.precision}% &middot; Recall: {stats.recall}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Synthetic Benchmark</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{stats.totalTestCases}</span>
            <span className="text-xs text-slate-500">verified test cases</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center">
            <span className="text-emerald-600 font-medium mr-1">9 Scenarios:</span>
            <span>Boundaries, Violations, Edge Cases</span>
          </div>
        </div>
      </div>

      {/* Secondary Metric Badges: Compliance Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-700 font-medium">Compliance Rate</p>
            <p className="text-xl font-bold text-emerald-900 mt-0.5">{stats.complianceRate}%</p>
            <p className="text-[11px] text-emerald-700/80 mt-1">Fully pass all applicable mandatory controls</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
            ✓
          </div>
        </div>

        <div className="bg-red-50/60 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-red-700 font-medium">Non-Compliance Rate</p>
            <p className="text-xl font-bold text-red-900 mt-0.5">{stats.nonComplianceRate}%</p>
            <p className="text-[11px] text-red-700/80 mt-1">Algorithmic rule failure detected</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
            ✕
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-700 font-medium">Needs Human Review Rate</p>
            <p className="text-xl font-bold text-amber-900 mt-0.5">{stats.needsReviewRate}%</p>
            <p className="text-[11px] text-amber-700/80 mt-1">Ambiguous or incomplete input parameters</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold">
            !
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Distribution Donut */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Compliance Decision Distribution</h2>
            <span className="text-xs text-slate-500">Synthetic Test Population</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {complianceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Proportion']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span>Compliant ({stats.complianceRate}%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span>Non-Compliant ({stats.nonComplianceRate}%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span>Needs Review ({stats.needsReviewRate}%)</span>
            </div>
          </div>
        </div>

        {/* Evaluation Performance Scorecard */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Agent Evaluation Performance</h2>
            <span className="text-xs text-slate-500">Benchmark Metrics</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceMetricsData} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Score']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-100">
            Measured against 24 built-in synthetic test cases covering boundary values, single & multi-rule violations.
          </p>
        </div>

        {/* Top Violated Rules Bar Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Most Frequently Violated Rules</h2>
            <button onClick={() => onNavigate('rules')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              View Rules &rarr;
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={ruleViolationsData}
                margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} violations (${item.payload.severity} severity)`,
                    item.payload.ruleName,
                  ]}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="violations" fill="#e11d48" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-100">
            Rules triggering the highest volume of non-compliance events in the benchmark suite.
          </p>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Rule Severity Distribution</h2>
            <span className="text-xs text-slate-500">Active Rule Inventory</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} rules`, 'Count']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#475569" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-sev-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-100">
            Severity tiers determine remediation escalation and executive compliance report priority.
          </p>
        </div>
      </div>

      {/* Top Violated Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">High-Risk Violation Registry</h3>
            <p className="text-xs text-slate-500">Most commonly breached controls and enforcement policies</p>
          </div>
          <button
            onClick={() => onNavigate('rules')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
          >
            <span>Manage All Rules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rule ID</th>
                <th className="py-3 px-4">Rule Name</th>
                <th className="py-3 px-4">Policy Domain</th>
                <th className="py-3 px-4">Severity Tier</th>
                <th className="py-3 px-4 text-right">Violation Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats.topViolatedRules.map((rule) => (
                <tr key={rule.ruleId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{rule.ruleId}</td>
                  <td className="py-3 px-4 font-medium">{rule.ruleName}</td>
                  <td className="py-3 px-4 text-slate-500">{rule.policy}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        rule.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : rule.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">{rule.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
