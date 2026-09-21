import {
  EvaluationMetrics,
  EvaluationResultRow,
  SyntheticTestCase,
} from '../shared/types.js';
import { complianceAgent } from '../agent/complianceAgent.js';

export class EvaluationEngine {
  public async evaluateSuite(testCases: SyntheticTestCase[]): Promise<EvaluationMetrics> {
    const resultsTable: EvaluationResultRow[] = [];
    const ruleAccuracyTracker: Record<string, { total: number; correct: number }> = {};

    let truePositives = 0; // Expected NON_COMPLIANT, Actual NON_COMPLIANT
    let falsePositives = 0; // Expected COMPLIANT, Actual NON_COMPLIANT
    let trueNegatives = 0; // Expected COMPLIANT, Actual COMPLIANT
    let falseNegatives = 0; // Expected NON_COMPLIANT, Actual COMPLIANT
    let needsReviewCount = 0;
    let compliantCount = 0;
    let nonCompliantCount = 0;
    let exactMatches = 0;

    for (const tc of testCases) {
      // Execute compliance agent workflow (fast deterministic evaluation mode for batch suites)
      const decision = await complianceAgent.executeWorkflow({
        input: tc.input,
        inputSource: 'synthetic_test',
        targetPolicyId: tc.policy_id,
        isSynthetic: true,
        skipAiExplanation: true,
      });

      const actualStatus = decision.finalStatus;
      const expectedStatus = tc.expected_status;
      const isMatch = actualStatus === expectedStatus;

      if (isMatch) exactMatches++;
      if (actualStatus === 'NEEDS_REVIEW') needsReviewCount++;
      if (actualStatus === 'COMPLIANT') compliantCount++;
      if (actualStatus === 'NON_COMPLIANT') nonCompliantCount++;

      // Confusion matrix calculations (focusing on non-compliance detection)
      if (expectedStatus === 'NON_COMPLIANT' && actualStatus === 'NON_COMPLIANT') {
        truePositives++;
      } else if (expectedStatus === 'COMPLIANT' && actualStatus === 'NON_COMPLIANT') {
        falsePositives++;
      } else if (expectedStatus === 'COMPLIANT' && actualStatus === 'COMPLIANT') {
        trueNegatives++;
      } else if (expectedStatus === 'NON_COMPLIANT' && actualStatus === 'COMPLIANT') {
        falseNegatives++;
      }

      // Rule-level tracking
      const actualFailedSet = new Set(decision.failedRules);
      const expectedFailedSet = new Set(tc.expected_violations);

      for (const rId of tc.applicable_rules) {
        if (!ruleAccuracyTracker[rId]) {
          ruleAccuracyTracker[rId] = { total: 0, correct: 0 };
        }
        ruleAccuracyTracker[rId].total++;
        const shouldBeFailed = expectedFailedSet.has(rId);
        const wasFailed = actualFailedSet.has(rId);
        if (shouldBeFailed === wasFailed) {
          ruleAccuracyTracker[rId].correct++;
        }
      }

      // Rule match accuracy for this test case
      let ruleMatches = 0;
      for (const rId of tc.applicable_rules) {
        const shouldBeFailed = expectedFailedSet.has(rId);
        const wasFailed = actualFailedSet.has(rId);
        if (shouldBeFailed === wasFailed) ruleMatches++;
      }
      const ruleMatchPct =
        tc.applicable_rules.length > 0 ? (ruleMatches / tc.applicable_rules.length) * 100 : 100;

      resultsTable.push({
        testCaseId: tc.test_case_id,
        title: tc.title,
        tag: tc.tag,
        expected: expectedStatus,
        actual: actualStatus,
        result: isMatch ? 'PASS' : 'FAIL',
        expectedViolations: tc.expected_violations,
        actualViolations: decision.failedRules,
        humanReviewRequired: decision.humanReviewRequired,
        ruleMatchAccuracy: Math.round(ruleMatchPct),
        explanation: decision.deterministicSummary,
      });
    }

    const total = testCases.length;
    const accuracy = total > 0 ? (exactMatches / total) * 100 : 0;

    const precisionDenom = truePositives + falsePositives;
    const precision = precisionDenom > 0 ? (truePositives / precisionDenom) * 100 : 100;

    const recallDenom = truePositives + falseNegatives;
    const recall = recallDenom > 0 ? (truePositives / recallDenom) * 100 : 100;

    const f1Score =
      precision + recall > 0 ? (2 * (precision * recall)) / (precision + recall) : 0;

    const ruleLevelAccuracy: Record<string, number> = {};
    for (const [rId, stats] of Object.entries(ruleAccuracyTracker)) {
      ruleLevelAccuracy[rId] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 100;
    }

    return {
      totalTestCases: total,
      passCount: exactMatches,
      failCount: total - exactMatches,
      accuracy: Math.round(accuracy * 10) / 10,
      precision: Math.round(precision * 10) / 10,
      recall: Math.round(recall * 10) / 10,
      f1Score: Math.round(f1Score * 10) / 10,
      ruleLevelAccuracy,
      confusionMatrix: {
        truePositives,
        falsePositives,
        trueNegatives,
        falseNegatives,
      },
      needsReviewRate: total > 0 ? Math.round((needsReviewCount / total) * 1000) / 10 : 0,
      complianceRate: total > 0 ? Math.round((compliantCount / total) * 1000) / 10 : 0,
      nonComplianceRate: total > 0 ? Math.round((nonCompliantCount / total) * 1000) / 10 : 0,
      evaluatedAt: new Date().toISOString(),
      resultsTable,
    };
  }
}

export const evaluationEngine = new EvaluationEngine();
