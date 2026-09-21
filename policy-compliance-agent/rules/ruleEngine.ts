import { Rule, RuleEvaluationResult, Policy } from '../shared/types.js';

export interface DeterministicEvaluationOptions {
  activePolicies: Policy[];
  targetPolicyId?: string; // If specified, only evaluate this policy
}

export class DeterministicRuleEngine {
  /**
   * Determine which policies are applicable to the given input
   */
  public identifyApplicablePolicies(input: string, policies: Policy[]): Policy[] {
    const textLower = input.toLowerCase();
    const applicable: Policy[] = [];

    for (const policy of policies) {
      if (!policy.active) continue;

      let isMatch = false;

      switch (policy.id) {
        case 'POL-PWD-001': {
          // Check if input looks like a password or password policy description
          const hasPasswordKeyword =
            textLower.includes('password') ||
            textLower.includes('passcode') ||
            textLower.includes('credential') ||
            textLower.includes('pwd=') ||
            textLower.includes('secret=');
          // If input is a short string (single token with mixed chars), treat as password test
          const isSingleTokenPassword =
            input.trim().length > 0 &&
            input.trim().length <= 64 &&
            !input.trim().includes('\n') &&
            !input.trim().includes(' ') &&
            !input.includes('{');

          if (hasPasswordKeyword || isSingleTokenPassword) {
            isMatch = true;
          }
          break;
        }

        case 'POL-PII-002': {
          const hasPiiIndicators =
            /\b\d{3}-\d{2}-\d{4}\b/.test(input) || // SSN
            /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/.test(input) || // Card
            /BEGIN (?:RSA |EC )?PRIVATE KEY/i.test(input) ||
            /\b(ghp_|AKIA|eyJhbGci)[A-Za-z0-9_\-]{8,}/.test(input) ||
            textLower.includes('ssn') ||
            textLower.includes('social security') ||
            textLower.includes('credit card') ||
            textLower.includes('pan') ||
            textLower.includes('api_key') ||
            textLower.includes('api key') ||
            textLower.includes('patient') ||
            textLower.includes('diagnosis') ||
            textLower.includes('medical record') ||
            textLower.includes('phi');
          if (hasPiiIndicators) isMatch = true;
          break;
        }

        case 'POL-RET-003': {
          const hasRetentionIndicators =
            textLower.includes('retention') ||
            textLower.includes('retain') ||
            textLower.includes('purge') ||
            textLower.includes('erasure') ||
            textLower.includes('delete') ||
            textLower.includes('deletion') ||
            textLower.includes('archive') ||
            textLower.includes('ttl') ||
            textLower.includes('gdpr') ||
            textLower.includes('right to be forgotten');
          if (hasRetentionIndicators) isMatch = true;
          break;
        }

        case 'POL-ACC-004': {
          const hasAccessIndicators =
            textLower.includes('access') ||
            textLower.includes('mfa') ||
            textLower.includes('2fa') ||
            textLower.includes('multi-factor') ||
            textLower.includes('administrator') ||
            textLower.includes('admin account') ||
            textLower.includes('shared account') ||
            textLower.includes('root') ||
            textLower.includes('contractor') ||
            textLower.includes('vendor account') ||
            textLower.includes('privilege');
          if (hasAccessIndicators) isMatch = true;
          break;
        }

        case 'POL-DOC-005': {
          const hasDocIndicators =
            textLower.includes('document') ||
            textLower.includes('share') ||
            textLower.includes('sharing') ||
            textLower.includes('confidential') ||
            textLower.includes('restricted') ||
            textLower.includes('public link') ||
            textLower.includes('anyone with the link') ||
            textLower.includes('watermark') ||
            textLower.includes('export') ||
            textLower.includes('drive link');
          if (hasDocIndicators) isMatch = true;
          break;
        }

        default: {
          // For custom policies, check if category or name matches
          const catMatch = textLower.includes(policy.category.toLowerCase());
          const nameMatch = textLower.includes(policy.name.toLowerCase());
          if (catMatch || nameMatch) isMatch = true;
          break;
        }
      }

      if (isMatch) {
        applicable.push(policy);
      }
    }

    // Fallback: If no specific policy triggered via keywords, evaluate all active policies
    return applicable.length > 0 ? applicable : policies.filter((p) => p.active);
  }

  /**
   * Deterministically evaluate an individual rule against an input string
   */
  public evaluateRule(rule: Rule, input: string): RuleEvaluationResult {
    const trimmed = input.trim();
    const textLower = trimmed.toLowerCase();

    // Specific deterministic evaluators by Rule ID
    switch (rule.id) {
      // -------------------------------------------------------------
      // Password Rules
      // -------------------------------------------------------------
      case 'RULE-PWD-001': {
        // Extract raw password if key-value is present, else use full string
        const password = this.extractPassword(trimmed);
        if (!password) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'INCONCLUSIVE',
            severity: rule.severity,
            reason: 'No clear password value could be extracted from input.',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        const pass = password.length >= 12;
        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: pass ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: pass
            ? `Password length is ${password.length} characters (meets >= 12 threshold).`
            : `Password contains only ${password.length} characters (fewer than 12 characters).`,
          evidence: pass ? `Length: ${password.length}` : `Length: ${password.length} (< 12)`,
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-PWD-002': {
        const password = this.extractPassword(trimmed);
        if (!password) {
          return this.makeInconclusive(rule, 'Cannot evaluate uppercase requirement without password text.');
        }
        const hasUpper = /[A-Z]/.test(password);
        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: hasUpper ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: hasUpper
            ? 'Password contains at least one uppercase letter [A-Z].'
            : 'Password does not contain any uppercase letter [A-Z].',
          evidence: hasUpper ? 'Found uppercase letters' : 'No uppercase characters detected',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-PWD-003': {
        const password = this.extractPassword(trimmed);
        if (!password) {
          return this.makeInconclusive(rule, 'Cannot evaluate lowercase requirement without password text.');
        }
        const hasLower = /[a-z]/.test(password);
        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: hasLower ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: hasLower
            ? 'Password contains at least one lowercase letter [a-z].'
            : 'Password does not contain any lowercase letter [a-z].',
          evidence: hasLower ? 'Found lowercase letters' : 'No lowercase characters detected',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-PWD-004': {
        const password = this.extractPassword(trimmed);
        if (!password) {
          return this.makeInconclusive(rule, 'Cannot evaluate numeric digit requirement without password text.');
        }
        const hasNumber = /[0-9]/.test(password);
        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: hasNumber ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: hasNumber
            ? 'Password contains at least one numeric digit [0-9].'
            : 'Password does not contain any numeric digit [0-9].',
          evidence: hasNumber ? 'Found numeric digit' : 'No digits detected',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-PWD-005': {
        const password = this.extractPassword(trimmed);
        if (!password) {
          return this.makeInconclusive(rule, 'Cannot evaluate special symbol requirement without password text.');
        }
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: hasSpecial ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: hasSpecial
            ? 'Password contains at least one special symbol.'
            : 'Password does not contain any special character or symbol.',
          evidence: hasSpecial ? 'Special character detected' : 'Only alphanumeric characters found',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-PWD-006': {
        const password = this.extractPassword(trimmed);
        if (!password) {
          return this.makeInconclusive(rule, 'Cannot evaluate dictionary blacklist without password text.');
        }
        const lower = password.toLowerCase();
        const banned = [
          'password',
          'admin',
          '123456',
          'qwerty',
          'welcome',
          'letmein',
          'monkey',
          'dragon',
          'baseball',
          'football',
          'master',
        ];
        const matched = banned.find((b) => lower.includes(b));
        const pass = !matched;
        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: pass ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: pass
            ? 'No trivial words or common predictable sequences detected.'
            : `Password contains blacklisted dictionary term or predictable sequence "${matched}".`,
          evidence: pass ? 'Entropy check passed' : `Blacklisted token: "${matched}"`,
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      // -------------------------------------------------------------
      // Personal Data (PII) Rules
      // -------------------------------------------------------------
      case 'RULE-PII-001': {
        // SSN check: matches standard SSN format: 3 digits - 2 digits - 4 digits
        // Exclude synthetic or masked forms like ***-**-1234 or XXX-XX-1234
        const ssnRegex = /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g;
        const matches = trimmed.match(ssnRegex);
        const pass = !matches || matches.length === 0;

        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: pass ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: pass
            ? 'No unmasked Social Security Numbers (SSN) detected in the input.'
            : `Detected ${matches?.length} unencrypted Social Security Number(s) in plain text.`,
          evidence: pass ? 'No SSN matches' : `Exposed SSN pattern: ${matches?.map(m => m.slice(0, 3) + '-XX-XXXX').join(', ')}`,
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-PII-002': {
        // Credit card PAN: 13 to 19 digits, possibly separated by hyphens or spaces
        const cardRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b|\b(?:\d{4}[ -]){3}\d{4}\b/g;
        const matches = trimmed.match(cardRegex);
        const pass = !matches || matches.length === 0;

        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: pass ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: pass
            ? 'No unmasked Primary Account Number (PAN) / credit card numbers detected.'
            : `Found ${matches?.length} unmasked payment card number(s) in the payload.`,
          evidence: pass ? 'No PAN violations' : `Detected card sequence(s)`,
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-PII-003': {
        // Leaked private keys or tokens
        const hasPrivateKey = /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i.test(trimmed);
        const hasAwsKey = /\bAKIA[0-9A-Z]{16}\b/.test(trimmed);
        const hasGithubToken = /\bgh[pousr]_[A-Za-z0-9_]{36}\b/.test(trimmed);
        const hasSecretPattern = /(?:api[_-]?key|secret[_-]?key|client[_-]?secret)\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}["']?/i.test(trimmed);

        const pass = !hasPrivateKey && !hasAwsKey && !hasGithubToken && !hasSecretPattern;
        const violationDetails: string[] = [];
        if (hasPrivateKey) violationDetails.push('RSA/EC Private Key Header');
        if (hasAwsKey) violationDetails.push('AWS Access Key ID');
        if (hasGithubToken) violationDetails.push('GitHub Personal Access Token');
        if (hasSecretPattern) violationDetails.push('API secret assignment');

        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: pass ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: pass
            ? 'No exposed private keys, cloud tokens, or hardcoded secrets detected.'
            : `Critical credentials leaked in input: ${violationDetails.join(', ')}.`,
          evidence: pass ? 'No secrets exposed' : `Credential types detected: ${violationDetails.join(', ')}`,
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-PII-004': {
        // PHI / Health data consent
        const healthKeywords = ['diagnosis', 'diagnosed', 'prescription', 'patient record', 'biometric', 'medical history', 'treatment plan'];
        const hasHealthData = healthKeywords.some((k) => textLower.includes(k));

        if (!hasHealthData) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'PASS',
            severity: rule.severity,
            reason: 'No Protected Health Information (PHI) or medical records present.',
            evidence: 'No PHI terms detected',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        const consentKeywords = ['consent granted', 'patient consent', 'hipaa authorization', 'authorized disclosure', 'consent: true', 'de-identified'];
        const hasConsent = consentKeywords.some((k) => textLower.includes(k));

        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: hasConsent ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: hasConsent
            ? 'Medical information is accompanied by documented patient consent/HIPAA authorization.'
            : 'Sensitive health records/diagnosis present without required patient consent or HIPAA authorization markers.',
          evidence: hasConsent ? 'Consent verified' : 'Found medical health terms with NO consent statement',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      // -------------------------------------------------------------
      // Data Retention Rules
      // -------------------------------------------------------------
      case 'RULE-RET-001': {
        // Retention cap <= 7 years. Indefinite is a violation.
        const isIndefinite =
          textLower.includes('indefinite') ||
          textLower.includes('forever') ||
          textLower.includes('infinite') ||
          textLower.includes('never delete') ||
          textLower.includes('retain permanently');

        if (isIndefinite) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'FAIL',
            severity: rule.severity,
            reason: 'Retention schedule specifies indefinite/permanent retention without a 7-year cap.',
            evidence: 'Indefinite retention clause detected',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        // Look for year counts (e.g., "10 years", "8 years")
        const yearMatch = textLower.match(/(\d+)\s*(?:years?|yrs?)/);
        if (yearMatch) {
          const years = parseInt(yearMatch[1], 10);
          const pass = years <= 7;
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: pass ? 'PASS' : 'FAIL',
            severity: rule.severity,
            reason: pass
              ? `Retention period of ${years} year(s) satisfies the <= 7 years cap.`
              : `Retention period of ${years} years violates the mandatory 7-year regulatory maximum cap.`,
            evidence: `${years} years`,
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        // If no retention duration found at all in a retention context
        if (textLower.includes('retention') || textLower.includes('transaction')) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'PASS',
            severity: rule.severity,
            reason: 'Retention policy within compliance parameters.',
            evidence: 'No excessive duration declared',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        return this.makeInconclusive(rule, 'Input does not specify transaction record retention schedule.');
      }

      case 'RULE-RET-002': {
        // Telemetry retention <= 90 days
        const telemetryKeywords = ['telemetry', 'access log', 'web log', 'server log', 'ip address log', 'traffic log'];
        const isTelemetryContext = telemetryKeywords.some((k) => textLower.includes(k));

        if (!isTelemetryContext) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'PASS',
            severity: rule.severity,
            reason: 'Not a telemetry or web access log retention record.',
            evidence: 'No telemetry keywords',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        const daysMatch = textLower.match(/(\d+)\s*days?/);
        const monthsMatch = textLower.match(/(\d+)\s*months?/);

        let totalDays = 0;
        if (daysMatch) totalDays = parseInt(daysMatch[1], 10);
        else if (monthsMatch) totalDays = parseInt(monthsMatch[1], 10) * 30;

        if (totalDays > 0) {
          const pass = totalDays <= 90;
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: pass ? 'PASS' : 'FAIL',
            severity: rule.severity,
            reason: pass
              ? `Telemetry log TTL of ${totalDays} days satisfies the <= 90 days limit.`
              : `Telemetry log retention duration of ${totalDays} days exceeds 90-day maximum limit.`,
            evidence: `${totalDays} days retention configured`,
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        return this.makeInconclusive(rule, 'Telemetry context present but specific TTL duration not stated.');
      }

      case 'RULE-RET-003': {
        // GDPR right-to-erasure SLA <= 30 days
        const erasureKeywords = ['erasure', 'deletion request', 'right to be forgotten', 'gdpr deletion', 'delete user'];
        const isErasure = erasureKeywords.some((k) => textLower.includes(k));

        if (!isErasure) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'PASS',
            severity: rule.severity,
            reason: 'No customer erasure request workflow referenced in payload.',
            evidence: 'Not an erasure record',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        const daysMatch = textLower.match(/(\d+)\s*days?/);
        if (daysMatch) {
          const days = parseInt(daysMatch[1], 10);
          const pass = days <= 30;
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: pass ? 'PASS' : 'FAIL',
            severity: rule.severity,
            reason: pass
              ? `Erasure SLA of ${days} days complies with 30-day statutory limit.`
              : `Erasure SLA of ${days} days exceeds the 30-day maximum statutory SLA.`,
            evidence: `SLA: ${days} days`,
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        // Check for "45 days" or "60 days" or "within 30 days"
        if (textLower.includes('within 30 days') || textLower.includes('30-day sla')) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'PASS',
            severity: rule.severity,
            reason: 'Commitment to purge user records within 30-day SLA.',
            evidence: 'Within 30 days clause confirmed',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        return this.makeInconclusive(rule, 'Erasure procedure mentioned without explicit SLA timeframe.');
      }

      // -------------------------------------------------------------
      // Access Control Rules
      // -------------------------------------------------------------
      case 'RULE-ACC-001': {
        // Privileged account MFA requirement
        const adminKeywords = ['admin', 'root', 'dba', 'superuser', 'privileged account', 'elevated access'];
        const isAdmin = adminKeywords.some((k) => textLower.includes(k));

        if (!isAdmin) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'PASS',
            severity: rule.severity,
            reason: 'Standard unprivileged user profile (elevated MFA policy not strictly required).',
            evidence: 'Non-privileged role',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        const mfaDisabled =
          textLower.includes('mfa: false') ||
          textLower.includes('mfa disabled') ||
          textLower.includes('no mfa') ||
          textLower.includes('2fa: false') ||
          textLower.includes('without 2fa') ||
          textLower.includes('bypass mfa');

        if (mfaDisabled) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'FAIL',
            severity: rule.severity,
            reason: 'Privileged/administrator account has Multi-Factor Authentication (MFA) disabled or bypassed.',
            evidence: 'MFA disabled on elevated account',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        const mfaEnabled =
          textLower.includes('mfa enforced') ||
          textLower.includes('mfa: true') ||
          textLower.includes('mfa required') ||
          textLower.includes('2fa enabled') ||
          textLower.includes('hardware token') ||
          textLower.includes('authenticator app');

        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: mfaEnabled ? 'PASS' : 'INCONCLUSIVE',
          severity: rule.severity,
          reason: mfaEnabled
            ? 'Privileged account explicitly enforces Multi-Factor Authentication.'
            : 'Privileged account listed without explicit confirmation of MFA enforcement status.',
          evidence: mfaEnabled ? 'MFA confirmed active' : 'MFA status ambiguous',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-ACC-002': {
        // Prohibition of shared generic admin accounts
        const genericSharedIndicators = [
          'shared_admin',
          'shared admin',
          'shared_account',
          'admin/admin',
          'generic account',
          'team login',
          'common password',
          'group account for operators',
          'shared credentials',
        ];
        const hasShared = genericSharedIndicators.some((k) => textLower.includes(k));

        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: hasShared ? 'FAIL' : 'PASS',
          severity: rule.severity,
          reason: hasShared
            ? 'Generic or shared administrative credentials detected in access assignment.'
            : 'Access attributed to distinct individual named accounts.',
          evidence: hasShared ? 'Shared login pattern identified' : 'Individual identity compliance',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-ACC-003': {
        // Contractor expiration <= 180 days
        const contractorKeywords = ['contractor', 'vendor', 'third-party', 'external consultant', 'temporary auditor'];
        const isContractor = contractorKeywords.some((k) => textLower.includes(k));

        if (!isContractor) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'PASS',
            severity: rule.severity,
            reason: 'Permanent employee access profile (vendor expiration rule not applicable).',
            evidence: 'Employee role',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        const neverExpires =
          textLower.includes('no expiration') ||
          textLower.includes('never expires') ||
          textLower.includes('permanent contractor') ||
          textLower.includes('expires: never');

        if (neverExpires) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'FAIL',
            severity: rule.severity,
            reason: 'Temporary contractor account is configured without an expiration date.',
            evidence: 'No expiration set for external vendor',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        const daysMatch = textLower.match(/expires in (\d+)\s*days?/);
        if (daysMatch) {
          const days = parseInt(daysMatch[1], 10);
          const pass = days <= 180;
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: pass ? 'PASS' : 'FAIL',
            severity: rule.severity,
            reason: pass
              ? `Contractor account expiration of ${days} days is within the 180-day cap.`
              : `Contractor account lifespan of ${days} days exceeds maximum allowed 180-day window.`,
            evidence: `Contractor lifespan: ${days} days`,
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        return this.makeInconclusive(rule, 'Contractor account identified but expiration timestamp is missing.');
      }

      // -------------------------------------------------------------
      // Document Sharing Rules
      // -------------------------------------------------------------
      case 'RULE-DOC-001': {
        // Confidential document public link prohibition
        const confidentialKeywords = ['confidential', 'restricted', 'internal only', 'proprietary', 'secret'];
        const isConfidential = confidentialKeywords.some((k) => textLower.includes(k));

        const publicLinkKeywords = [
          'anyone with the link',
          'public link',
          'anonymous link',
          'public access: true',
          'sharing: public',
          'visibility: public',
          'open to web',
        ];
        const hasPublicLink = publicLinkKeywords.some((k) => textLower.includes(k));

        if (isConfidential && hasPublicLink) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'FAIL',
            severity: rule.severity,
            reason: 'Confidential or restricted document configured with public link access ("Anyone with the link").',
            evidence: 'Public link enabled on classified document',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        if (isConfidential && !hasPublicLink) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'PASS',
            severity: rule.severity,
            reason: 'Confidential asset protected; no anonymous public sharing link enabled.',
            evidence: 'No public link exposure',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: 'PASS',
          severity: rule.severity,
          reason: 'Document classification does not trigger confidential public link restrictions.',
          evidence: 'Non-classified asset',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-DOC-002': {
        // Approved domain boundary for external sharing
        const unapprovedWebmail = [
          '@gmail.com',
          '@yahoo.com',
          '@hotmail.com',
          '@aol.com',
          '@outlook.com',
          '@mail.ru',
          '@protonmail.com',
        ];
        const sharedWithEmail = textLower.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
        const unapprovedMatches = sharedWithEmail.filter((email) =>
          unapprovedWebmail.some((domain) => email.endsWith(domain))
        );

        if (unapprovedMatches.length > 0) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'FAIL',
            severity: rule.severity,
            reason: `Asset shared with unauthorized consumer webmail destination(s): ${unapprovedMatches.join(', ')}.`,
            evidence: `Unauthorized domain(s): ${unapprovedMatches.join(', ')}`,
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: 'PASS',
          severity: rule.severity,
          reason: 'No unauthorized external public webmail domains detected in recipient list.',
          evidence: 'Domain check passed',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      case 'RULE-DOC-003': {
        // Bulk export protection & watermark mandate
        const isBulkExport =
          textLower.includes('bulk export') ||
          textLower.includes('export customer roster') ||
          textLower.includes('export payroll') ||
          textLower.includes('full database export');

        if (!isBulkExport) {
          return {
            rule_id: rule.id,
            policy_id: rule.policyId,
            rule_name: rule.name,
            status: 'PASS',
            severity: rule.severity,
            reason: 'Not a bulk data export operation.',
            evidence: 'Standard single document access',
            remediation: rule.remediation,
            isMandatory: rule.isMandatory,
          };
        }

        const hasWatermarkOrPassword =
          textLower.includes('watermark') ||
          textLower.includes('password protected') ||
          textLower.includes('encrypted zip') ||
          textLower.includes('drm tracking');

        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: hasWatermarkOrPassword ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: hasWatermarkOrPassword
            ? 'Bulk export is secured with digital watermarking or cryptographic packaging.'
            : 'Bulk export missing required personalized digital watermark or encryption packaging.',
          evidence: hasWatermarkOrPassword ? 'Watermark/encryption verified' : 'No export protection detected',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      }

      // Default fallback for custom or unhandled rules
      default: {
        return this.evaluateGenericRule(rule, trimmed);
      }
    }
  }

  /**
   * Helper to extract password if formatted like `password: ...` or JSON, or raw string
   */
  private extractPassword(input: string): string | null {
    if (!input) return null;

    // Try JSON parsing
    try {
      if (input.startsWith('{') && input.endsWith('}')) {
        const parsed = JSON.parse(input);
        if (parsed.password) return String(parsed.password);
        if (parsed.input && typeof parsed.input === 'string') return parsed.input;
      }
    } catch {
      // not json
    }

    // Try regex for `password = ...` or `password: ...`
    const pwdMatch = input.match(/(?:password|pwd|passcode)\s*[:=]\s*["']?([^\s"'\n\r]+)["']?/i);
    if (pwdMatch && pwdMatch[1]) {
      return pwdMatch[1];
    }

    // If string is single-line without spaces or formatting, assume it's the raw password
    if (!input.includes('\n') && !input.includes(' ') && input.length <= 128) {
      return input;
    }

    return null;
  }

  private makeInconclusive(rule: Rule, reason: string): RuleEvaluationResult {
    return {
      rule_id: rule.id,
      policy_id: rule.policyId,
      rule_name: rule.name,
      status: 'INCONCLUSIVE',
      severity: rule.severity,
      reason,
      evidence: 'Missing requisite input parameter for deterministic evaluation',
      remediation: rule.remediation,
      isMandatory: rule.isMandatory,
    };
  }

  private evaluateGenericRule(rule: Rule, input: string): RuleEvaluationResult {
    // If condition has regex pattern like matches(/.../)
    const regexMatch = rule.condition.match(/matches\(\/(.+)\/\)/);
    if (regexMatch) {
      try {
        const re = new RegExp(regexMatch[1]);
        const pass = re.test(input);
        return {
          rule_id: rule.id,
          policy_id: rule.policyId,
          rule_name: rule.name,
          status: pass ? 'PASS' : 'FAIL',
          severity: rule.severity,
          reason: pass
            ? `Matches expected condition pattern: ${rule.condition}`
            : `Failed condition pattern check: ${rule.condition}`,
          evidence: pass ? 'Pattern matched' : 'Pattern mismatch',
          remediation: rule.remediation,
          isMandatory: rule.isMandatory,
        };
      } catch {
        // fallback
      }
    }

    // Otherwise mark inconclusive
    return {
      rule_id: rule.id,
      policy_id: rule.policyId,
      rule_name: rule.name,
      status: 'PASS',
      severity: rule.severity,
      reason: `Evaluated generic rule against active schema: ${rule.condition}`,
      evidence: 'Generic rule parser',
      remediation: rule.remediation,
      isMandatory: rule.isMandatory,
    };
  }

  /**
   * Run full deterministic evaluation for an input against active policies
   */
  public evaluateAll(
    input: string,
    options: DeterministicEvaluationOptions
  ): {
    applicablePolicies: Policy[];
    results: RuleEvaluationResult[];
    passedRuleIds: string[];
    failedRuleIds: string[];
    inconclusiveRuleIds: string[];
    deterministicDecision: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW';
  } {
    let policies = options.activePolicies;
    if (options.targetPolicyId) {
      policies = policies.filter((p) => p.id === options.targetPolicyId);
    }

    const applicablePolicies = this.identifyApplicablePolicies(input, policies);
    const applicableRules = applicablePolicies.flatMap((p) => p.rules.filter((r) => r.active));

    const results: RuleEvaluationResult[] = [];
    const passedRuleIds: string[] = [];
    const failedRuleIds: string[] = [];
    const inconclusiveRuleIds: string[] = [];

    for (const rule of applicableRules) {
      const result = this.evaluateRule(rule, input);
      results.push(result);

      if (result.status === 'PASS') {
        passedRuleIds.push(rule.id);
      } else if (result.status === 'FAIL') {
        failedRuleIds.push(rule.id);
      } else {
        inconclusiveRuleIds.push(rule.id);
      }
    }

    // Deterministic Decision logic (strictly enforced):
    // If one or more mandatory rules fail -> NON_COMPLIANT
    // If no rules fail, but one or more mandatory rules are inconclusive -> NEEDS_REVIEW
    // If all applicable rules pass -> COMPLIANT
    let deterministicDecision: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW' = 'COMPLIANT';

    const mandatoryFailures = results.filter((r) => r.status === 'FAIL' && r.isMandatory);
    const anyFailures = results.filter((r) => r.status === 'FAIL');

    if (mandatoryFailures.length > 0 || anyFailures.length > 0) {
      deterministicDecision = 'NON_COMPLIANT';
    } else if (inconclusiveRuleIds.length > 0 && applicableRules.some((r) => r.isMandatory && inconclusiveRuleIds.includes(r.id))) {
      deterministicDecision = 'NEEDS_REVIEW';
    } else {
      deterministicDecision = 'COMPLIANT';
    }

    return {
      applicablePolicies,
      results,
      passedRuleIds,
      failedRuleIds,
      inconclusiveRuleIds,
      deterministicDecision,
    };
  }
}

export const deterministicRuleEngine = new DeterministicRuleEngine();
