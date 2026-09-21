import React, { useState, useEffect } from 'react';
import { Navbar, NavigationPage } from './components/Navbar.js';
import { DashboardView } from './components/DashboardView.js';
import { PoliciesView } from './components/PoliciesView.js';
import { RulesView } from './components/RulesView.js';
import { ComplianceCheckerView } from './components/ComplianceCheckerView.js';
import { SyntheticGeneratorView } from './components/SyntheticGeneratorView.js';
import { EvaluationView } from './components/EvaluationView.js';
import { ReportsView } from './components/ReportsView.js';
import { AuditLogsView } from './components/AuditLogsView.js';
import { api, DashboardStats } from './services/api.js';
import {
  AuditLogEntry,
  ComplianceDecision,
  ComplianceReport,
  EvaluationMetrics,
  Policy,
  Rule,
  SyntheticTestCase,
} from '../shared/types.js';

export default function App() {
  const [activePage, setActivePage] = useState<NavigationPage>('dashboard');
  const [geminiActive, setGeminiActive] = useState<boolean>(false);

  // Core domain states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [testCases, setTestCases] = useState<SyntheticTestCase[]>([]);
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  // Initial load
  const loadAppData = async () => {
    try {
      setLoading(true);
      const [healthRes, statsRes, policiesRes, rulesRes, casesRes, evalRes, reportsRes, logsRes] =
        await Promise.all([
          api.getHealth(),
          api.getStats(),
          api.getPolicies(),
          api.getRules(),
          api.getSyntheticTestCases(),
          api.getLatestEvaluation(),
          api.getReports(),
          api.getAuditLogs(),
        ]);

      setGeminiActive(healthRes.geminiConfigured);
      setStats(statsRes);
      setPolicies(policiesRes);
      setRules(rulesRes);
      setTestCases(casesRes);
      setMetrics(evalRes);
      setReports(reportsRes);
      setAuditLogs(logsRes);
    } catch (err) {
      console.error('Failed to load initial application state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  // Policy operations
  const handleTogglePolicy = async (id: string) => {
    const updated = await api.togglePolicy(id);
    setPolicies((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    // Refresh stats & rules
    const [updatedStats, updatedRules, updatedLogs] = await Promise.all([
      api.getStats(),
      api.getRules(),
      api.getAuditLogs(),
    ]);
    setStats(updatedStats);
    setRules(updatedRules);
    setAuditLogs(updatedLogs);
  };

  const handleSavePolicy = async (policy: Partial<Policy> & { name: string; category: string }) => {
    const saved = await api.savePolicy(policy);
    setPolicies((prev) => [saved, ...prev]);
    const [updatedStats, updatedRules, updatedLogs] = await Promise.all([
      api.getStats(),
      api.getRules(),
      api.getAuditLogs(),
    ]);
    setStats(updatedStats);
    setRules(updatedRules);
    setAuditLogs(updatedLogs);
  };

  // Rule operations
  const handleToggleRule = async (id: string) => {
    const updated = await api.toggleRule(id);
    setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    // Also update in policies state
    setPolicies((prev) =>
      prev.map((pol) => {
        if (pol.id === updated.policyId) {
          return {
            ...pol,
            rules: pol.rules.map((r) => (r.id === updated.id ? updated : r)),
          };
        }
        return pol;
      })
    );
    const [updatedStats, updatedLogs] = await Promise.all([api.getStats(), api.getAuditLogs()]);
    setStats(updatedStats);
    setAuditLogs(updatedLogs);
  };

  // Compliance evaluation
  const handleEvaluate = async (input: string, policyId?: string, source?: string) => {
    const decision = await api.evaluate(input, policyId, source);
    // Refresh audit logs
    api.getAuditLogs().then(setAuditLogs);
    return decision;
  };

  // Save report
  const handleSaveReport = async (decision: ComplianceDecision) => {
    const saved = await api.saveReport({ decision });
    setReports((prev) => [saved, ...prev]);
    api.getAuditLogs().then(setAuditLogs);
  };

  // Synthetic Data generation
  const handleGenerateSynthetic = async (params: {
    policyId?: string;
    count?: number;
    compliantPct?: number;
    nonCompliantPct?: number;
    edgeCasesCount?: number;
  }) => {
    const res = await api.generateSynthetic(params);
    setTestCases((prev) => [...res.records, ...prev]);
    const [updatedStats, updatedLogs] = await Promise.all([api.getStats(), api.getAuditLogs()]);
    setStats(updatedStats);
    setAuditLogs(updatedLogs);
  };

  const handleResetSynthetic = async () => {
    const res = await api.resetTestCases();
    setTestCases(res.testCases);
    const updatedStats = await api.getStats();
    setStats(updatedStats);
  };

  // Run automated evaluation suite
  const handleRunEvaluationSuite = async () => {
    const evalResults = await api.runEvaluationSuite();
    setMetrics(evalResults);
    const [updatedStats, updatedLogs] = await Promise.all([api.getStats(), api.getAuditLogs()]);
    setStats(updatedStats);
    setAuditLogs(updatedLogs);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        geminiActive={geminiActive}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activePage === 'dashboard' && (
          <DashboardView stats={stats} loading={loading} onNavigate={setActivePage} />
        )}

        {activePage === 'checker' && (
          <ComplianceCheckerView
            policies={policies}
            onEvaluate={handleEvaluate}
            onSaveReport={handleSaveReport}
          />
        )}

        {activePage === 'policies' && (
          <PoliciesView
            policies={policies}
            loading={loading}
            onTogglePolicy={handleTogglePolicy}
            onSavePolicy={handleSavePolicy}
          />
        )}

        {activePage === 'rules' && (
          <RulesView rules={rules} loading={loading} onToggleRule={handleToggleRule} />
        )}

        {activePage === 'synthetic' && (
          <SyntheticGeneratorView
            policies={policies}
            testCases={testCases}
            loading={loading}
            onGenerate={handleGenerateSynthetic}
            onReset={handleResetSynthetic}
            onNavigateToEvaluation={() => setActivePage('evaluation')}
          />
        )}

        {activePage === 'evaluation' && (
          <EvaluationView
            metrics={metrics}
            loading={loading}
            onRunSuite={handleRunEvaluationSuite}
          />
        )}

        {activePage === 'reports' && (
          <ReportsView
            reports={reports}
            loading={loading}
            onNavigateToChecker={() => setActivePage('checker')}
          />
        )}

        {activePage === 'logs' && <AuditLogsView logs={auditLogs} loading={loading} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">Policy Compliance Agent</span>
            <span>&middot;</span>
            <span>Enterprise Security & Regulatory Governance</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Deterministic Core</span>
            <span>&middot;</span>
            <span>Zero Real PII</span>
            <span>&middot;</span>
            <span>Immutable Audit Logging</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
