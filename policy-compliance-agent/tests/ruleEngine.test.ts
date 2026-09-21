import { deterministicRuleEngine } from '../rules/ruleEngine.js';
import { policyStore } from '../policies/policyStore.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`PASS: ${testName}`);
    passed++;
  } else {
    console.error(`FAIL: ${testName}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n=== Starting Deterministic Rule Engine Automated Test Suite ===\n');

  const policies = policyStore.getActivePolicies();
  const pwdPolicy = policies.find((p) => p.id === 'POL-PWD-001')!;
  const piiPolicy = policies.find((p) => p.id === 'POL-PII-002')!;
  const retPolicy = policies.find((p) => p.id === 'POL-RET-003')!;
  const accPolicy = policies.find((p) => p.id === 'POL-ACC-004')!;
  const docPolicy = policies.find((p) => p.id === 'POL-DOC-005')!;

  // -------------------------------------------------------------
  // Test 1: Password Rule Engine
  // -------------------------------------------------------------
  const ruleLen = pwdPolicy.rules.find((r) => r.id === 'RULE-PWD-001')!;
  const ruleDict = pwdPolicy.rules.find((r) => r.id === 'RULE-PWD-006')!;

  assert(deterministicRuleEngine.evaluateRule(ruleLen, 'Short9!').status === 'FAIL', 'Password < 12 characters fails');
  assert(deterministicRuleEngine.evaluateRule(ruleLen, '123456789012').status === 'PASS', 'Password == 12 characters passes boundary');
  assert(deterministicRuleEngine.evaluateRule(ruleLen, 'ValidSuperLongP@ss1234').status === 'PASS', 'Password > 12 characters passes');
  assert(deterministicRuleEngine.evaluateRule(ruleDict, 'adminPassword123!').status === 'FAIL', 'Password with dictionary word fails');
  assert(deterministicRuleEngine.evaluateRule(ruleDict, 'Z9#qL2$vM8!xK').status === 'PASS', 'High-entropy password passes dictionary check');

  // -------------------------------------------------------------
  // Test 2: PII Data Privacy Rules
  // -------------------------------------------------------------
  const ruleSsn = piiPolicy.rules.find((r) => r.id === 'RULE-PII-001')!;
  const ruleCard = piiPolicy.rules.find((r) => r.id === 'RULE-PII-002')!;
  const ruleSecret = piiPolicy.rules.find((r) => r.id === 'RULE-PII-003')!;

  assert(deterministicRuleEngine.evaluateRule(ruleSsn, 'Record for SSN: 123-45-6789').status === 'FAIL', 'Unmasked SSN pattern detected and failed');
  assert(deterministicRuleEngine.evaluateRule(ruleSsn, 'Record for Masked SSN: ***-**-6789').status === 'PASS', 'Masked SSN passes');
  assert(deterministicRuleEngine.evaluateRule(ruleCard, 'Card: 4111 2222 3333 4444').status === 'FAIL', 'Unmasked 16-digit credit card fails');
  assert(deterministicRuleEngine.evaluateRule(ruleSecret, 'AWS key: AKIAIOSFODNN7EXAMPLE').status === 'FAIL', 'AWS Access Key fails secret check');
  assert(deterministicRuleEngine.evaluateRule(ruleSecret, '-----BEGIN RSA PRIVATE KEY-----').status === 'FAIL', 'RSA Private Key header fails secret check');

  // -------------------------------------------------------------
  // Test 3: Data Retention Rules
  // -------------------------------------------------------------
  const ruleRetCap = retPolicy.rules.find((r) => r.id === 'RULE-RET-001')!;
  const ruleTelemetry = retPolicy.rules.find((r) => r.id === 'RULE-RET-002')!;
  const ruleGdpr = retPolicy.rules.find((r) => r.id === 'RULE-RET-003')!;

  assert(deterministicRuleEngine.evaluateRule(ruleRetCap, 'Retain transaction records indefinitely').status === 'FAIL', 'Indefinite retention fails 7-year rule');
  assert(deterministicRuleEngine.evaluateRule(ruleRetCap, 'Retain records for 10 years').status === 'FAIL', '10-year retention fails 7-year cap');
  assert(deterministicRuleEngine.evaluateRule(ruleRetCap, 'Retain records for 5 years').status === 'PASS', '5-year retention passes');
  assert(deterministicRuleEngine.evaluateRule(ruleRetCap, 'Retain records for 7 years').status === 'PASS', 'Exact 7-year boundary passes');
  assert(deterministicRuleEngine.evaluateRule(ruleTelemetry, 'Access logs stored for 180 days').status === 'FAIL', '180-day telemetry fails 90-day cap');
  assert(deterministicRuleEngine.evaluateRule(ruleTelemetry, 'Access logs stored for 60 days').status === 'PASS', '60-day telemetry passes');
  assert(deterministicRuleEngine.evaluateRule(ruleGdpr, 'Customer erasure requests executed in 60 days').status === 'FAIL', '60-day erasure fails 30-day SLA');
  assert(deterministicRuleEngine.evaluateRule(ruleGdpr, 'Customer erasure requests executed within 30 days').status === 'PASS', '30-day erasure passes');

  // -------------------------------------------------------------
  // Test 4: Access Control Rules
  // -------------------------------------------------------------
  const ruleMfa = accPolicy.rules.find((r) => r.id === 'RULE-ACC-001')!;
  const ruleShared = accPolicy.rules.find((r) => r.id === 'RULE-ACC-002')!;
  const ruleContractor = accPolicy.rules.find((r) => r.id === 'RULE-ACC-003')!;

  assert(deterministicRuleEngine.evaluateRule(ruleMfa, 'admin account provisioned with mfa disabled').status === 'FAIL', 'Admin with MFA disabled fails');
  assert(deterministicRuleEngine.evaluateRule(ruleMfa, 'admin account with mfa enforced via hardware token').status === 'PASS', 'Admin with MFA enforced passes');
  assert(deterministicRuleEngine.evaluateRule(ruleShared, 'created shared admin account for the team').status === 'FAIL', 'Shared generic account fails');
  assert(deterministicRuleEngine.evaluateRule(ruleContractor, 'external contractor expires in 365 days').status === 'FAIL', 'Contractor > 180 days fails');
  assert(deterministicRuleEngine.evaluateRule(ruleContractor, 'external contractor expires in 90 days').status === 'PASS', 'Contractor <= 180 days passes');

  // -------------------------------------------------------------
  // Test 5: Document Sharing Rules
  // -------------------------------------------------------------
  const ruleDocPublic = docPolicy.rules.find((r) => r.id === 'RULE-DOC-001')!;
  const ruleDocEmail = docPolicy.rules.find((r) => r.id === 'RULE-DOC-002')!;

  assert(deterministicRuleEngine.evaluateRule(ruleDocPublic, 'CONFIDENTIAL Q4 report shared via anyone with the link').status === 'FAIL', 'Confidential document with public link fails');
  assert(deterministicRuleEngine.evaluateRule(ruleDocEmail, 'Restricted file sent to target user@gmail.com').status === 'FAIL', 'Restricted file sent to public consumer webmail fails');
  assert(deterministicRuleEngine.evaluateRule(ruleDocEmail, 'Restricted file sent to partner@acme-corp.com').status === 'PASS', 'Approved corporate partner domain passes');

  // -------------------------------------------------------------
  // Test 6: Policy Applicability Selector
  // -------------------------------------------------------------
  const piiMatched = deterministicRuleEngine.identifyApplicablePolicies('Social Security SSN: 123-45-6789 in payload', policies);
  assert(piiMatched.some((p) => p.id === 'POL-PII-002'), 'Policy selector correctly identifies PII policy from text');

  const pwdMatched = deterministicRuleEngine.identifyApplicablePolicies('Update user password to MySecret123!', policies);
  assert(pwdMatched.some((p) => p.id === 'POL-PWD-001'), 'Policy selector correctly identifies Password policy from text');

  console.log(`\n=== Test Suite Finished: ${passed} Passed, ${failed} Failed ===\n`);
  return failed === 0;
}

// Run if called directly
runTestSuite().catch(console.error);
