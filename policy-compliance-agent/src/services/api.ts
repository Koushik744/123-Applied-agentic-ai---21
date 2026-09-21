import {
  AuditLogEntry,
  ComplianceDecision,
  ComplianceReport,
  EvaluationMetrics,
  Policy,
  Rule,
  SyntheticTestCase,
} from '../../shared/types.js';

export interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  totalRules: number;
  activeRules: number;
  totalTestCases: number;
  complianceRate: number;
  nonComplianceRate: number;
  needsReviewRate: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  topViolatedRules: Array<{
    ruleId: string;
    ruleName: string;
    policy: string;
    severity: string;
    count: number;
  }>;
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
}

export const api = {
  async getHealth(): Promise<{ status: string; geminiConfigured: boolean; engine: string }> {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats');
    return res.json();
  },

  async getPolicies(): Promise<Policy[]> {
    const res = await fetch('/api/policies');
    return res.json();
  },

  async savePolicy(policy: Partial<Policy> & { name: string; category: string }): Promise<Policy> {
    const res = await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    return res.json();
  },

  async togglePolicy(id: string): Promise<Policy> {
    const res = await fetch(`/api/policies/${id}/toggle`, { method: 'POST' });
    return res.json();
  },

  async getRules(): Promise<Rule[]> {
    const res = await fetch('/api/rules');
    return res.json();
  },

  async toggleRule(id: string): Promise<Rule> {
    const res = await fetch(`/api/rules/${id}/toggle`, { method: 'POST' });
    return res.json();
  },

  async evaluate(input: string, targetPolicyId?: string, inputSource?: string): Promise<ComplianceDecision> {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, targetPolicyId, inputSource }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Evaluation failed');
    }
    return res.json();
  },

  async generateSynthetic(params: {
    policyId?: string;
    count?: number;
    compliantPct?: number;
    nonCompliantPct?: number;
    edgeCasesCount?: number;
  }): Promise<{ count: number; records: SyntheticTestCase[] }> {
    const res = await fetch('/api/synthetic/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async getSyntheticTestCases(): Promise<SyntheticTestCase[]> {
    const res = await fetch('/api/synthetic/testcases');
    return res.json();
  },

  async resetTestCases(): Promise<{ message: string; testCases: SyntheticTestCase[] }> {
    const res = await fetch('/api/synthetic/testcases/reset', { method: 'POST' });
    return res.json();
  },

  async runEvaluationSuite(testCaseIds?: string[]): Promise<EvaluationMetrics> {
    const res = await fetch('/api/evaluation/run-suite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testCaseIds }),
    });
    return res.json();
  },

  async getLatestEvaluation(): Promise<EvaluationMetrics> {
    const res = await fetch('/api/evaluation/latest');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch('/api/audit-logs');
    return res.json();
  },

  async getReports(): Promise<ComplianceReport[]> {
    const res = await fetch('/api/reports');
    return res.json();
  },

  async saveReport(payload: {
    decision: ComplianceDecision;
    title?: string;
    domain?: string;
    evaluator?: string;
  }): Promise<ComplianceReport> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
