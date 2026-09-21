import { Router, Request, Response } from 'express';
import { policyStore } from '../policies/policyStore.js';
import { complianceAgent } from '../agent/complianceAgent.js';
import { syntheticGenerator } from '../synthetic_data/syntheticGenerator.js';
import { evaluationEngine } from '../evaluation/evaluationEngine.js';
import { db } from '../database/db.js';
import { ComplianceReport } from '../shared/types.js';

export const apiRouter = Router();

// -------------------------------------------------------------
// Health Check
// -------------------------------------------------------------
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    engine: 'Deterministic Rule Engine + Gemini Flash Agent',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// -------------------------------------------------------------
// Policy Management Endpoints
// -------------------------------------------------------------
apiRouter.get('/policies', (_req: Request, res: Response) => {
  res.json(policyStore.getAllPolicies());
});

apiRouter.post('/policies', (req: Request, res: Response) => {
  const { name, category, description, severity, rules } = req.body;
  if (!name || !category) {
    res.status(400).json({ error: 'Name and Category are required' });
    return;
  }
  const policy = policyStore.savePolicy(req.body);
  db.addAuditLog({
    eventType: 'POLICY_MODIFIED',
    actor: 'Compliance Officer',
    details: `Policy "${policy.name}" (${policy.id}) saved with ${policy.rules.length} rules.`,
    status: 'INFO',
  });
  res.json(policy);
});

apiRouter.post('/policies/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const policy = policyStore.togglePolicyActive(id);
  if (!policy) {
    res.status(404).json({ error: 'Policy not found' });
    return;
  }
  db.addAuditLog({
    eventType: 'POLICY_MODIFIED',
    actor: 'Compliance Officer',
    details: `Policy "${policy.name}" (${policy.id}) status toggled to ${policy.active ? 'ACTIVE' : 'INACTIVE'}.`,
    status: 'INFO',
  });
  res.json(policy);
});

// -------------------------------------------------------------
// Rule Management Endpoints
// -------------------------------------------------------------
apiRouter.get('/rules', (_req: Request, res: Response) => {
  res.json(policyStore.getAllRules());
});

apiRouter.post('/rules/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const rule = policyStore.toggleRuleActive(id);
  if (!rule) {
    res.status(404).json({ error: 'Rule not found' });
    return;
  }
  db.addAuditLog({
    eventType: 'RULE_TOGGLED',
    actor: 'Compliance Officer',
    details: `Rule "${rule.name}" (${rule.id}) toggled to ${rule.active ? 'ACTIVE' : 'INACTIVE'}.`,
    status: 'INFO',
  });
  res.json(rule);
});

// -------------------------------------------------------------
// Compliance Evaluation (Agent Workflow)
// -------------------------------------------------------------
apiRouter.post('/evaluate', async (req: Request, res: Response) => {
  try {
    const { input, targetPolicyId, inputSource } = req.body;
    if (!input || typeof input !== 'string') {
      res.status(400).json({ error: 'Input text is required' });
      return;
    }

    const decision = await complianceAgent.executeWorkflow({
      input,
      targetPolicyId: targetPolicyId || 'ALL',
      inputSource: inputSource || 'direct_text',
    });

    // Register audit log
    db.addAuditLog({
      eventType: 'COMPLIANCE_EVALUATION',
      actor: 'AI Agent',
      details: `Evaluated input against ${decision.applicablePolicies.join(', ')}. Final Status: ${decision.finalStatus} (${decision.passedRules.length} PASS, ${decision.failedRules.length} FAIL).`,
      status: decision.finalStatus === 'COMPLIANT' ? 'SUCCESS' : decision.finalStatus === 'NON_COMPLIANT' ? 'VIOLATION' : 'WARNING',
      metadata: {
        decisionId: decision.id,
        latencyMs: decision.latencyMs,
        failedRules: decision.failedRules,
      },
    });

    res.json(decision);
  } catch (err: any) {
    console.error('Evaluation endpoint error:', err);
    res.status(500).json({ error: err.message || 'Failed to evaluate compliance' });
  }
});

// -------------------------------------------------------------
// Synthetic Data Generator Endpoints
// -------------------------------------------------------------
apiRouter.post('/synthetic/generate', async (req: Request, res: Response) => {
  try {
    const { policyId = 'ALL', count = 5, compliantPct = 50, nonCompliantPct = 40, edgeCasesCount = 1 } = req.body;
    const generated = await syntheticGenerator.generate({
      policyId,
      count: Number(count),
      compliantPct: Number(compliantPct),
      nonCompliantPct: Number(nonCompliantPct),
      edgeCasesCount: Number(edgeCasesCount),
    });

    // Save to test cases
    db.addTestCases(generated);

    db.addAuditLog({
      eventType: 'SYNTHETIC_DATA_GENERATED',
      actor: 'System',
      details: `Generated ${generated.length} synthetic test cases for policy target "${policyId}".`,
      status: 'SUCCESS',
      metadata: { count: generated.length, policyId },
    });

    res.json({ count: generated.length, records: generated });
  } catch (err: any) {
    console.error('Synthetic generator error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate synthetic data' });
  }
});

apiRouter.get('/synthetic/testcases', (_req: Request, res: Response) => {
  res.json(db.getTestCases());
});

apiRouter.post('/synthetic/testcases/reset', (_req: Request, res: Response) => {
  db.resetTestCases();
  res.json({ message: 'Reset to 24 default test cases', testCases: db.getTestCases() });
});

// -------------------------------------------------------------
// Automated Evaluation Engine Endpoints
// -------------------------------------------------------------
apiRouter.post('/evaluation/run-suite', async (req: Request, res: Response) => {
  try {
    const { testCaseIds } = req.body;
    let suite = db.getTestCases();
    if (Array.isArray(testCaseIds) && testCaseIds.length > 0) {
      suite = suite.filter((tc) => testCaseIds.includes(tc.test_case_id));
    }

    const metrics = await evaluationEngine.evaluateSuite(suite);
    db.setLatestEvaluation(metrics);

    db.addAuditLog({
      eventType: 'EVALUATION_RUN',
      actor: 'System',
      details: `Automated test suite completed: ${metrics.totalTestCases} test cases evaluated. Accuracy: ${metrics.accuracy}%, F1: ${metrics.f1Score}%.`,
      status: 'SUCCESS',
      metadata: { accuracy: metrics.accuracy, f1Score: metrics.f1Score },
    });

    res.json(metrics);
  } catch (err: any) {
    console.error('Evaluation runner error:', err);
    res.status(500).json({ error: err.message || 'Failed to run evaluation suite' });
  }
});

apiRouter.get('/evaluation/latest', async (_req: Request, res: Response) => {
  let latest = db.getLatestEvaluation();
  if (!latest) {
    // Run an initial evaluation if none exists
    const cases = db.getTestCases();
    latest = await evaluationEngine.evaluateSuite(cases);
    db.setLatestEvaluation(latest);
  }
  res.json(latest);
});

// -------------------------------------------------------------
// Audit Logs Endpoints
// -------------------------------------------------------------
apiRouter.get('/audit-logs', (_req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

apiRouter.post('/audit-logs', (req: Request, res: Response) => {
  const { eventType, actor, details, status, metadata } = req.body;
  const entry = db.addAuditLog({
    eventType: eventType || 'COMPLIANCE_EVALUATION',
    actor: actor || 'Compliance Officer',
    details: details || 'Manual compliance audit entry',
    status: status || 'INFO',
    metadata,
  });
  res.json(entry);
});

// -------------------------------------------------------------
// Reports Endpoints
// -------------------------------------------------------------
apiRouter.get('/reports', (_req: Request, res: Response) => {
  res.json(db.getReports());
});

apiRouter.post('/reports', (req: Request, res: Response) => {
  const { decision, title, domain, evaluator } = req.body;
  if (!decision) {
    res.status(400).json({ error: 'Decision payload is required' });
    return;
  }

  const passedCount = decision.passedRules?.length || 0;
  const totalCount = (decision.rulesEvaluated?.length) || 1;
  const healthScore = Math.round((passedCount / totalCount) * 100);

  const report: ComplianceReport = {
    id: `RPT-${Date.now().toString().slice(-6)}`,
    title: title || `Compliance Audit: ${decision.applicablePolicies?.join(', ') || 'Policy Review'}`,
    generatedAt: new Date().toISOString(),
    evaluator: evaluator || 'AI Compliance Agent',
    decision,
    domain: domain || 'Data Privacy and Security',
    overallHealthScore: healthScore,
  };

  db.saveReport(report);
  db.addAuditLog({
    eventType: 'COMPLIANCE_EVALUATION',
    actor: 'Compliance Officer',
    details: `Published compliance audit report #${report.id} (${report.title}).`,
    status: 'INFO',
  });

  res.json(report);
});

// -------------------------------------------------------------
// Dashboard Analytics & Stats Endpoints
// -------------------------------------------------------------
apiRouter.get('/stats', async (_req: Request, res: Response) => {
  const allPolicies = policyStore.getAllPolicies();
  const activePolicies = policyStore.getActivePolicies();
  const allRules = policyStore.getAllRules();
  const activeRules = policyStore.getActiveRules();
  const testCases = db.getTestCases();

  let latestEval = db.getLatestEvaluation();
  if (!latestEval) {
    latestEval = await evaluationEngine.evaluateSuite(testCases);
    db.setLatestEvaluation(latestEval);
  }

  // Calculate rule violation frequencies from test cases and evaluation results
  const ruleViolationCounts: Record<string, { name: string; count: number; policy: string; severity: string }> = {};
  for (const tc of testCases) {
    for (const rId of tc.expected_violations) {
      if (!ruleViolationCounts[rId]) {
        const rule = policyStore.getRuleById(rId);
        ruleViolationCounts[rId] = {
          name: rule?.name || rId,
          count: 0,
          policy: rule?.policyId || 'N/A',
          severity: rule?.severity || 'HIGH',
        };
      }
      ruleViolationCounts[rId].count++;
    }
  }

  const topViolatedRules = Object.entries(ruleViolationCounts)
    .map(([id, info]) => ({
      ruleId: id,
      ruleName: info.name,
      policy: info.policy,
      severity: info.severity,
      count: info.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  res.json({
    totalPolicies: allPolicies.length,
    activePolicies: activePolicies.length,
    totalRules: allRules.length,
    activeRules: activeRules.length,
    totalTestCases: testCases.length,
    complianceRate: latestEval.complianceRate,
    nonComplianceRate: latestEval.nonComplianceRate,
    needsReviewRate: latestEval.needsReviewRate,
    accuracy: latestEval.accuracy,
    precision: latestEval.precision,
    recall: latestEval.recall,
    f1Score: latestEval.f1Score,
    topViolatedRules,
    confusionMatrix: latestEval.confusionMatrix,
  });
});
