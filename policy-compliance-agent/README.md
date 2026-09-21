# Policy Compliance Agent

An enterprise AI-powered policy compliance system that evaluates text, payloads, and synthetic records against predefined organizational policies using a hybrid architecture:

1. **Deterministic Rule Engine**: Zero-trust, algorithmically bound rule validation that returns definitive `PASS`, `FAIL`, or `INCONCLUSIVE` statuses with verifiable evidence and remediation guidance.
2. **AI Compliance Agent**: LLM-based interpretation (`gemini-3.8-flash`) for natural-language understanding, evidence extraction, narrative explanation, and human-review dispatching.
3. **Synthetic Compliance Data Generator**: Configurable generator synthesizing realistic test records across 9 distinct compliance scenarios (fully compliant, single/multi violations, boundary values, ambiguous input, etc.) with zero real PII.
4. **Automated Evaluation Engine & Dashboard**: Rigorous statistical benchmarking computing Accuracy, Precision, Recall, F1 Score, Rule-Level Accuracy, Confusion Matrix, and comparative Expected vs. Actual results tables.

---

## Key Architecture & Core Tenet

> **Absolute Rule Determinism**: The LLM is **never allowed to override deterministic rule results**. If a deterministic rule check fails, the final status is strictly `NON_COMPLIANT`. The LLM serves to understand unstructured input, synthesize user-facing explanations, extract exact quotes as evidence, and identify ambiguous criteria requiring human audit.

### Execution Workflow

```text
User Input / Document
  → 1. Input Preprocessing & Entropy Analysis
  → 2. Applicable Policy Identification
  → 3. Deterministic Rule Selection
  → 4. Rule-Based Evaluation (Deterministic Engine)
  → 5. Evidence Extraction
  → 6. Decision Synthesis & Non-Override Guard (COMPLIANT / NON_COMPLIANT / NEEDS_REVIEW)
  → 7. Explanation & Remediation Generation (Gemini Flash or Deterministic Fallback)
  → 8. Tamper-Evident Audit Logging
```

---

## Demonstration Policy Domain: "Data Privacy and Security"

1. **Password Security Policy (`POL-PWD-001`)**:
   - `RULE-PWD-001`: Minimum length >= 12 characters
   - `RULE-PWD-002`: Uppercase letter requirement [A-Z]
   - `RULE-PWD-003`: Lowercase letter requirement [a-z]
   - `RULE-PWD-004`: Numeric digit requirement [0-9]
   - `RULE-PWD-005`: Special symbol requirement
   - `RULE-PWD-006`: Common dictionary and trivial sequence blacklist

2. **Personal Data Handling / PII Policy (`POL-PII-002`)**:
   - `RULE-PII-001`: Unencrypted SSN / National ID prohibition
   - `RULE-PII-002`: Payment card primary account number (PAN) masking
   - `RULE-PII-003`: Embedded private keys and API credentials leak prevention
   - `RULE-PII-004`: Health/medical records patient consent and authorization mandate

3. **Data Retention & Disposal Policy (`POL-RET-003`)**:
   - `RULE-RET-001`: Transaction records finite retention cap <= 7 years (no indefinite retention)
   - `RULE-RET-002`: Telemetry and web access log maximum TTL <= 90 days
   - `RULE-RET-003`: GDPR right-to-erasure statutory SLA <= 30 days

4. **Access Control & Least Privilege Policy (`POL-ACC-004`)**:
   - `RULE-ACC-001`: Privileged administrative account MFA enforcement
   - `RULE-ACC-002`: Prohibition of generic shared operator logins
   - `RULE-ACC-003`: Third-party vendor and contractor account expiration <= 180 days

5. **Document & Asset Sharing Policy (`POL-DOC-005`)**:
   - `RULE-DOC-001`: Confidential document public anonymous link prohibition
   - `RULE-DOC-002`: External document recipient domain boundary restrictions
   - `RULE-DOC-003`: Bulk data export watermarking and encryption requirement

---

## User Interface Pages

1. **Dashboard**: High-level compliance KPIs, active policy and rule counts, compliance distributions, severity breakdown, top violated rules, and evaluation health.
2. **Policies**: Policy manager to view, create, edit, and toggle policies.
3. **Rules**: Comprehensive rule inventory with conditions, expected behaviors, severity tiers, and remediations.
4. **Compliance Checker**: Interactive workspace to paste text or upload documents, run the 8-step agent execution trace, view evidence highlights, and export reports.
5. **Synthetic Data Generator**: Generate parameterized synthetic records by policy, record count, compliant percentage, and edge case volume.
6. **Evaluation**: Automated evaluation suite comparing expected vs actual agent outcomes with full confusion matrix and rule-level accuracy tables.
7. **Reports**: Repository of generated compliance audit reports with print and JSON export capabilities.
8. **Audit Logs**: Immutable timeline of all evaluations, rule toggles, policy edits, and synthetic data generations.

---

## Setup & Running Locally

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Environment Variables
Configure your Gemini API key in `.env`:
```env
GEMINI_API_KEY="your_api_key_here"
```
*(Note: If no API key is provided, the deterministic rule engine and fallback explainability modules continue to function at 100% capacity).*

### Running the Application
```bash
npm run dev
```
The application will boot at `http://0.0.0.0:3000`.

### Running Automated Tests
```bash
npx tsx tests/ruleEngine.test.ts
```
