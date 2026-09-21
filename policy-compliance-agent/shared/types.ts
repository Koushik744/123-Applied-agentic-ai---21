/**
 * Policy Compliance Agent - Shared Types and Interfaces
 */

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW';

export type RuleStatus = 'PASS' | 'FAIL' | 'INCONCLUSIVE';

export interface Rule {
  id: string;
  policyId: string;
  name: string;
  description: string;
  condition: string;
  expectedBehavior: string;
  severity: SeverityLevel;
  remediation: string;
  isMandatory: boolean;
  active: boolean;
  category: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: SeverityLevel;
  active: boolean;
  rules: Rule[];
  createdAt: string;
  updatedAt: string;
}

export interface RuleEvaluationResult {
  rule_id: string;
  policy_id: string;
  rule_name: string;
  status: RuleStatus;
  severity: SeverityLevel;
  reason: string;
  evidence?: string;
  remediation: string;
  isMandatory: boolean;
}

export interface AgentExecutionStep {
  step: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'warning';
  outputSummary?: string;
  timestamp: string;
  latencyMs: number;
  details?: Record<string, any>;
}

export interface ComplianceDecision {
  id: string;
  timestamp: string;
  inputExcerpt: string;
  fullInput: string;
  inputSource: 'direct_text' | 'file_upload' | 'synthetic_test';
  finalStatus: ComplianceStatus;
  severity: SeverityLevel | 'NONE';
  applicablePolicies: string[];
  rulesEvaluated: RuleEvaluationResult[];
  passedRules: string[];
  failedRules: string[];
  inconclusiveRules: string[];
  explanation: string;
  deterministicSummary: string;
  recommendedRemediation: string[];
  humanReviewRequired: boolean;
  humanReviewReason?: string;
  executionTrace: AgentExecutionStep[];
  isSynthetic?: boolean;
  latencyMs: number;
  modelUsed?: string;
}

export interface SyntheticTestCase {
  test_case_id: string;
  policy_id: string;
  category: string;
  title: string;
  input: string;
  applicable_rules: string[];
  expected_status: ComplianceStatus;
  expected_violations: string[];
  expected_severity: SeverityLevel | 'NONE';
  tag:
    | 'fully_compliant'
    | 'single_violation'
    | 'multiple_violations'
    | 'boundary_value'
    | 'missing_information'
    | 'invalid_input'
    | 'ambiguous_input'
    | 'conflicting_information'
    | 'edge_case';
  rationale: string;
  isCustom?: boolean;
}

export interface EvaluationResultRow {
  testCaseId: string;
  title: string;
  tag: string;
  expected: ComplianceStatus;
  actual: ComplianceStatus;
  result: 'PASS' | 'FAIL';
  expectedViolations: string[];
  actualViolations: string[];
  humanReviewRequired: boolean;
  ruleMatchAccuracy: number;
  explanation: string;
}

export interface EvaluationMetrics {
  totalTestCases: number;
  passCount: number;
  failCount: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  ruleLevelAccuracy: Record<string, number>;
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
  needsReviewRate: number;
  complianceRate: number;
  nonComplianceRate: number;
  evaluatedAt: string;
  resultsTable: EvaluationResultRow[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType:
    | 'COMPLIANCE_EVALUATION'
    | 'POLICY_MODIFIED'
    | 'POLICY_CREATED'
    | 'RULE_TOGGLED'
    | 'SYNTHETIC_DATA_GENERATED'
    | 'EVALUATION_RUN'
    | 'HUMAN_REVIEW_DISPATCHED';
  actor: 'System' | 'Compliance Officer' | 'AI Agent' | 'Deterministic Engine';
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'VIOLATION' | 'INFO';
  metadata?: Record<string, any>;
}

export interface ComplianceReport {
  id: string;
  title: string;
  generatedAt: string;
  evaluator: string;
  decision: ComplianceDecision;
  domain: string;
  overallHealthScore: number;
}
