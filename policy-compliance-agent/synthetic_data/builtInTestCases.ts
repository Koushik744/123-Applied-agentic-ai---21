import { SyntheticTestCase } from '../shared/types.js';

export const BUILT_IN_TEST_CASES: SyntheticTestCase[] = [
  // 1. Fully Compliant Password
  {
    test_case_id: 'TC-PWD-001',
    policy_id: 'POL-PWD-001',
    category: 'Authentication',
    title: 'Strong Multi-Factor Compliant Password',
    input: 'K9#mX2$vL8!qZ5',
    applicable_rules: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-003', 'RULE-PWD-004', 'RULE-PWD-005', 'RULE-PWD-006'],
    expected_status: 'COMPLIANT',
    expected_violations: [],
    expected_severity: 'NONE',
    tag: 'fully_compliant',
    rationale: '14 characters, uppercase, lowercase, numbers, symbols, zero dictionary words.',
  },

  // 2. Single-Rule Violation: Password length too short (11 chars)
  {
    test_case_id: 'TC-PWD-002',
    policy_id: 'POL-PWD-001',
    category: 'Authentication',
    title: 'Password Length Shortfall (11 Chars)',
    input: 'K9#mX2$vL8!',
    applicable_rules: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-003', 'RULE-PWD-004', 'RULE-PWD-005', 'RULE-PWD-006'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-PWD-001'],
    expected_severity: 'HIGH',
    tag: 'single_violation',
    rationale: 'Contains symbols and numbers but has exactly 11 characters (minimum is 12).',
  },

  // 3. Boundary Value: Exact minimum length boundary (12 chars)
  {
    test_case_id: 'TC-PWD-003',
    policy_id: 'POL-PWD-001',
    category: 'Authentication',
    title: 'Password Exact 12-Character Boundary',
    input: 'Abc!12345678',
    applicable_rules: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-003', 'RULE-PWD-004', 'RULE-PWD-005', 'RULE-PWD-006'],
    expected_status: 'COMPLIANT',
    expected_violations: [],
    expected_severity: 'NONE',
    tag: 'boundary_value',
    rationale: 'Exactly 12 characters, passes minimum boundary with upper, lower, number, and special character.',
  },

  // 4. Multiple-Rule Violations: Password missing uppercase, special symbol, and too short
  {
    test_case_id: 'TC-PWD-004',
    policy_id: 'POL-PWD-001',
    category: 'Authentication',
    title: 'Trivial Password with Multi-Rule Failures',
    input: 'welcome123',
    applicable_rules: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-003', 'RULE-PWD-004', 'RULE-PWD-005', 'RULE-PWD-006'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-005', 'RULE-PWD-006'],
    expected_severity: 'CRITICAL',
    tag: 'multiple_violations',
    rationale: 'Under 12 chars, no uppercase, no symbol, and contains blacklisted word "welcome".',
  },

  // 5. Single Violation: Blacklisted sequence in 14-char password
  {
    test_case_id: 'TC-PWD-005',
    policy_id: 'POL-PWD-001',
    category: 'Authentication',
    title: 'High-Entropy Password with Embedded Dictionary Word',
    input: 'SecurePassword!99',
    applicable_rules: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-003', 'RULE-PWD-004', 'RULE-PWD-005', 'RULE-PWD-006'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-PWD-006'],
    expected_severity: 'CRITICAL',
    tag: 'single_violation',
    rationale: '17 characters with symbols and numbers, but contains blacklisted word "password".',
  },

  // 6. Missing Information: Empty password field
  {
    test_case_id: 'TC-PWD-006',
    policy_id: 'POL-PWD-001',
    category: 'Authentication',
    title: 'Unspecified Empty Password Parameter',
    input: 'user: analyst_01; authentication_type: password; password: ',
    applicable_rules: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-003', 'RULE-PWD-004', 'RULE-PWD-005', 'RULE-PWD-006'],
    expected_status: 'NEEDS_REVIEW',
    expected_violations: [],
    expected_severity: 'MEDIUM',
    tag: 'missing_information',
    rationale: 'Password field declared but contains no credential characters for evaluation.',
  },

  // 7. Fully Compliant PII Handling: Tokenized Customer Record
  {
    test_case_id: 'TC-PII-007',
    policy_id: 'POL-PII-002',
    category: 'Data Privacy',
    title: 'Tokenized Synthetic Customer Payload',
    input: 'Customer Record: ID=CUST-88391; MaskedSSN=***-**-4912; TokenCard=tok_visa_4242; Status=Active',
    applicable_rules: ['RULE-PII-001', 'RULE-PII-002', 'RULE-PII-003', 'RULE-PII-004'],
    expected_status: 'COMPLIANT',
    expected_violations: [],
    expected_severity: 'NONE',
    tag: 'fully_compliant',
    rationale: 'All sensitive identifiers are masked and tokenized pursuant to PCI-DSS and privacy standards.',
  },

  // 8. Single-Rule Violation: Exposed Plaintext SSN
  {
    test_case_id: 'TC-PII-008',
    policy_id: 'POL-PII-002',
    category: 'Data Privacy',
    title: 'Plaintext Social Security Number Leak',
    input: 'Applicant profile: John Doe, SSN: 452-89-1029, Department: Logistics',
    applicable_rules: ['RULE-PII-001', 'RULE-PII-002', 'RULE-PII-003', 'RULE-PII-004'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-PII-001'],
    expected_severity: 'CRITICAL',
    tag: 'single_violation',
    rationale: 'Unmasked Social Security Number directly exposed in employee text record.',
  },

  // 9. Single-Rule Violation: Unmasked Credit Card Number
  {
    test_case_id: 'TC-PII-009',
    policy_id: 'POL-PII-002',
    category: 'Data Privacy',
    title: 'Unmasked Primary Account Number in Billing Payload',
    input: 'Payment processing error: card_number 4111 2222 3333 4444 failed with code DECLINED_02',
    applicable_rules: ['RULE-PII-001', 'RULE-PII-002', 'RULE-PII-003', 'RULE-PII-004'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-PII-002'],
    expected_severity: 'CRITICAL',
    tag: 'single_violation',
    rationale: 'Full 16-digit payment card PAN logged in plain text without tokenization.',
  },

  // 10. Multiple-Rule Violations: Leaked Secret and Unmasked SSN
  {
    test_case_id: 'TC-PII-010',
    policy_id: 'POL-PII-002',
    category: 'Data Privacy',
    title: 'Dual Leak: Plaintext SSN and AWS Access Key',
    input: 'Config dump: SSN 123-45-6789; cloud_auth=AKIAIOSFODNN7EXAMPLE; bucket=prod-backups',
    applicable_rules: ['RULE-PII-001', 'RULE-PII-002', 'RULE-PII-003', 'RULE-PII-004'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-PII-001', 'RULE-PII-003'],
    expected_severity: 'CRITICAL',
    tag: 'multiple_violations',
    rationale: 'Exposes both an unencrypted national identifier and an AWS production access key.',
  },

  // 11. Edge Case: Ambiguous Health Record Missing Consent
  {
    test_case_id: 'TC-PII-011',
    policy_id: 'POL-PII-002',
    category: 'Data Privacy',
    title: 'Clinical Medical Note Without Documented Authorization',
    input: 'Clinical intake note: Patient diagnosed with Type II diabetes and hypertension. Ref: RX-9921.',
    applicable_rules: ['RULE-PII-001', 'RULE-PII-002', 'RULE-PII-003', 'RULE-PII-004'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-PII-004'],
    expected_severity: 'HIGH',
    tag: 'edge_case',
    rationale: 'Explicit diagnosis details disclosed without HIPAA patient authorization or de-identification tag.',
  },

  // 12. Fully Compliant Data Retention Policy
  {
    test_case_id: 'TC-RET-012',
    policy_id: 'POL-RET-003',
    category: 'Compliance & Governance',
    title: 'Compliant 5-Year Financial Retention with 30-Day Erasure SLA',
    input: 'Archival policy: Customer financial transaction logs are retained for 5 years. GDPR deletion requests purged within 30 days.',
    applicable_rules: ['RULE-RET-001', 'RULE-RET-002', 'RULE-RET-003'],
    expected_status: 'COMPLIANT',
    expected_violations: [],
    expected_severity: 'NONE',
    tag: 'fully_compliant',
    rationale: '5 years is strictly within 7-year ceiling, and GDPR deletion SLA commits to 30 days.',
  },

  // 13. Single Violation: Indefinite Data Retention
  {
    test_case_id: 'TC-RET-013',
    policy_id: 'POL-RET-003',
    category: 'Compliance & Governance',
    title: 'Illegal Indefinite Data Storage Clause',
    input: 'Storage policy: All customer financial logs and transaction history shall be kept indefinitely for deep historical research.',
    applicable_rules: ['RULE-RET-001', 'RULE-RET-002', 'RULE-RET-003'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-RET-001'],
    expected_severity: 'HIGH',
    tag: 'single_violation',
    rationale: 'Indefinite retention violates mandatory 7-year regulatory maximum.',
  },

  // 14. Boundary Value: Exact 7-Year Retention Boundary
  {
    test_case_id: 'TC-RET-014',
    policy_id: 'POL-RET-003',
    category: 'Compliance & Governance',
    title: 'Exact 7-Year Regulatory Retention Boundary',
    input: 'Audit Schedule: Billing and ledger records are retained for exactly 7 years and thereafter purged automatically.',
    applicable_rules: ['RULE-RET-001', 'RULE-RET-002', 'RULE-RET-003'],
    expected_status: 'COMPLIANT',
    expected_violations: [],
    expected_severity: 'NONE',
    tag: 'boundary_value',
    rationale: '7 years is the exact maximum allowed boundary; meets compliance requirements.',
  },

  // 15. Single Violation: 180-Day Telemetry Log TTL Exceeds 90-Day Cap
  {
    test_case_id: 'TC-RET-015',
    policy_id: 'POL-RET-003',
    category: 'Compliance & Governance',
    title: 'Telemetry Log Lifespan Exceeding 90-Day Maximum',
    input: 'Logging Infrastructure: Web access logs and IP address traces are stored for 180 days on cold storage.',
    applicable_rules: ['RULE-RET-001', 'RULE-RET-002', 'RULE-RET-003'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-RET-002'],
    expected_severity: 'MEDIUM',
    tag: 'single_violation',
    rationale: '180 days telemetry retention exceeds mandatory 90-day ceiling.',
  },

  // 16. Conflicting Information: Erasure SLA Stated as Both 20 Days and 60 Days
  {
    test_case_id: 'TC-RET-016',
    policy_id: 'POL-RET-003',
    category: 'Compliance & Governance',
    title: 'Conflicting Contractual Erasure Durations',
    input: 'Contract section 4 specifies right to be forgotten deletion in 60 days, whereas section 9 states deletion within 20 days.',
    applicable_rules: ['RULE-RET-001', 'RULE-RET-002', 'RULE-RET-003'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-RET-003'],
    expected_severity: 'CRITICAL',
    tag: 'conflicting_information',
    rationale: 'Section 4 permits 60 days which exceeds the statutory 30-day requirement.',
  },

  // 17. Fully Compliant Access Control
  {
    test_case_id: 'TC-ACC-017',
    policy_id: 'POL-ACC-004',
    category: 'Identity & Access',
    title: 'Privileged Role with Hardware MFA and 90-Day Vendor Expiration',
    input: 'User: sarah.connor@corp.internal; Role: System Administrator; MFA: hardware token required; Contractor: true; expires in 90 days.',
    applicable_rules: ['RULE-ACC-001', 'RULE-ACC-002', 'RULE-ACC-003'],
    expected_status: 'COMPLIANT',
    expected_violations: [],
    expected_severity: 'NONE',
    tag: 'fully_compliant',
    rationale: 'MFA enforced, individualized identity, contractor lifespan 90 days <= 180 days.',
  },

  // 18. Single Violation: Administrator Account with MFA Disabled
  {
    test_case_id: 'TC-ACC-018',
    policy_id: 'POL-ACC-004',
    category: 'Identity & Access',
    title: 'Elevated Root Account with MFA Disabled',
    input: 'IAM Policy: admin account "devops-root" provisioned with mfa disabled for automated deployments.',
    applicable_rules: ['RULE-ACC-001', 'RULE-ACC-002', 'RULE-ACC-003'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-ACC-001'],
    expected_severity: 'CRITICAL',
    tag: 'single_violation',
    rationale: 'Privileged administrative credential bypasses mandatory Multi-Factor Authentication.',
  },

  // 19. Single Violation: Shared Generic Administrative Login
  {
    test_case_id: 'TC-ACC-019',
    policy_id: 'POL-ACC-004',
    category: 'Identity & Access',
    title: 'Generic Shared Operator Account Detected',
    input: 'Credential provisioning: Created shared admin account "team_ops_generic" for night shift staff.',
    applicable_rules: ['RULE-ACC-001', 'RULE-ACC-002', 'RULE-ACC-003'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-ACC-002'],
    expected_severity: 'HIGH',
    tag: 'single_violation',
    rationale: 'Generic shared administrative logins violate individual accountability standards.',
  },

  // 20. Ambiguous Input: Contractor Account with Missing Expiration
  {
    test_case_id: 'TC-ACC-020',
    policy_id: 'POL-ACC-004',
    category: 'Identity & Access',
    title: 'Contractor Provisioning with Unspecified Expiration Date',
    input: 'Access Request: Onboard external third-party vendor audit analyst for quarterly review with database read access.',
    applicable_rules: ['RULE-ACC-001', 'RULE-ACC-002', 'RULE-ACC-003'],
    expected_status: 'NEEDS_REVIEW',
    expected_violations: [],
    expected_severity: 'MEDIUM',
    tag: 'ambiguous_input',
    rationale: 'External vendor identified but record lacks explicit expiration timestamp; human review recommended.',
  },

  // 21. Fully Compliant Document Sharing
  {
    test_case_id: 'TC-DOC-021',
    policy_id: 'POL-DOC-005',
    category: 'Information Security',
    title: 'Restricted Asset Shared Directly to Verified Corporate Partner',
    input: 'Document: Q3 Financial Strategy.pdf; Classification: CONFIDENTIAL; Access: Direct invitation to legal@partner-corp.com; Public link: disabled; Watermark: enabled.',
    applicable_rules: ['RULE-DOC-001', 'RULE-DOC-002', 'RULE-DOC-003'],
    expected_status: 'COMPLIANT',
    expected_violations: [],
    expected_severity: 'NONE',
    tag: 'fully_compliant',
    rationale: 'Confidential document avoids public link, uses partner domain, and enables watermark.',
  },

  // 22. Single Violation: Confidential Document with Public Link
  {
    test_case_id: 'TC-DOC-022',
    policy_id: 'POL-DOC-005',
    category: 'Information Security',
    title: 'Confidential Internal Memo Configured with Public Link',
    input: 'Drive Link: "CONFIDENTIAL M&A Valuation Model.xlsx" shared with "Anyone with the link can view".',
    applicable_rules: ['RULE-DOC-001', 'RULE-DOC-002', 'RULE-DOC-003'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-DOC-001'],
    expected_severity: 'CRITICAL',
    tag: 'single_violation',
    rationale: 'Confidential enterprise document configured with open public link violates asset sharing rules.',
  },

  // 23. Invalid / Corrupted Input Payload
  {
    test_case_id: 'TC-SYS-023',
    policy_id: 'POL-PWD-001',
    category: 'Authentication',
    title: 'Malformed or Corrupt Truncated Packet',
    input: '###MALFORMED_HEADER###\x00\x01\xFF??--UNKNOWN_ENCODING',
    applicable_rules: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-003', 'RULE-PWD-004', 'RULE-PWD-005', 'RULE-PWD-006'],
    expected_status: 'NEEDS_REVIEW',
    expected_violations: [],
    expected_severity: 'LOW',
    tag: 'invalid_input',
    rationale: 'Binary corrupted text cannot be mapped reliably to standard policy attributes.',
  },

  // 24. Edge Case: Document Shared to Personal Consumer Gmail
  {
    test_case_id: 'TC-DOC-024',
    policy_id: 'POL-DOC-005',
    category: 'Information Security',
    title: 'Restricted Customer Roster Shared to Personal Consumer Email',
    input: 'Transfer Record: Sharing quarterly customer payroll report with personal account john.doe1985@gmail.com.',
    applicable_rules: ['RULE-DOC-001', 'RULE-DOC-002', 'RULE-DOC-003'],
    expected_status: 'NON_COMPLIANT',
    expected_violations: ['RULE-DOC-002'],
    expected_severity: 'HIGH',
    tag: 'edge_case',
    rationale: 'Sharing company restricted data to free public webmail addresses is prohibited.',
  },
];
