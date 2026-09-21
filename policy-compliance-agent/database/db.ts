import {
  AuditLogEntry,
  ComplianceReport,
  EvaluationMetrics,
  SyntheticTestCase,
} from '../shared/types.js';
import { BUILT_IN_TEST_CASES } from '../synthetic_data/builtInTestCases.js';

class InMemoryDatabase {
  private testCases: SyntheticTestCase[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private reports: ComplianceReport[] = [];
  private latestEvaluation: EvaluationMetrics | null = null;

  constructor() {
    this.testCases = JSON.parse(JSON.stringify(BUILT_IN_TEST_CASES));
    this.seedInitialAuditLogs();
  }

  private seedInitialAuditLogs(): void {
    const now = Date.now();
    this.auditLogs = [
      {
        id: 'LOG-1001',
        timestamp: new Date(now - 3600000 * 24).toISOString(),
        eventType: 'POLICY_CREATED',
        actor: 'System',
        details: 'Initial policy bundle loaded: 5 core policies, 19 deterministic rules.',
        status: 'INFO',
        metadata: { policiesCount: 5, rulesCount: 19 },
      },
      {
        id: 'LOG-1002',
        timestamp: new Date(now - 3600000 * 12).toISOString(),
        eventType: 'SYNTHETIC_DATA_GENERATED',
        actor: 'System',
        details: 'Bootstrapped 24 benchmark synthetic test cases spanning edge cases & boundary scenarios.',
        status: 'SUCCESS',
        metadata: { datasetSize: 24 },
      },
      {
        id: 'LOG-1003',
        timestamp: new Date(now - 3600000 * 2).toISOString(),
        eventType: 'COMPLIANCE_EVALUATION',
        actor: 'Deterministic Engine',
        details: 'Automated baseline integrity check completed with 100% deterministic rule parity.',
        status: 'SUCCESS',
        metadata: { engineStatus: 'HEALTHY' },
      },
    ];
  }

  // Test Cases
  public getTestCases(): SyntheticTestCase[] {
    return [...this.testCases];
  }

  public addTestCases(cases: SyntheticTestCase[]): void {
    this.testCases = [...cases, ...this.testCases];
  }

  public resetTestCases(): void {
    this.testCases = JSON.parse(JSON.stringify(BUILT_IN_TEST_CASES));
  }

  // Audit Logs
  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  public addAuditLog(log: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const entry: AuditLogEntry = {
      ...log,
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
    return entry;
  }

  // Reports
  public getReports(): ComplianceReport[] {
    return [...this.reports];
  }

  public saveReport(report: ComplianceReport): void {
    this.reports.unshift(report);
  }

  // Evaluation
  public getLatestEvaluation(): EvaluationMetrics | null {
    return this.latestEvaluation;
  }

  public setLatestEvaluation(metrics: EvaluationMetrics): void {
    this.latestEvaluation = metrics;
  }
}

export const db = new InMemoryDatabase();
