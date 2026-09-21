import { GoogleGenAI, Type } from '@google/genai';
import { SyntheticTestCase, ComplianceStatus, SeverityLevel } from '../shared/types.js';
import { policyStore } from '../policies/policyStore.js';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export interface SyntheticGeneratorOptions {
  policyId: string;
  count: number;
  compliantPct: number;
  nonCompliantPct: number;
  edgeCasesCount: number;
}

export class SyntheticDataGenerator {
  public async generate(options: SyntheticGeneratorOptions): Promise<SyntheticTestCase[]> {
    const { policyId, count, compliantPct, edgeCasesCount } = options;
    const policy = policyId !== 'ALL' ? policyStore.getPolicyById(policyId) : null;
    const activePolicies = policyStore.getActivePolicies();

    // Calculate quotas
    const edgeCount = Math.min(edgeCasesCount, count);
    const remaining = count - edgeCount;
    const compliantCount = Math.round((remaining * compliantPct) / 100);
    const nonCompliantCount = Math.max(0, remaining - compliantCount);

    const results: SyntheticTestCase[] = [];
    let idCounter = 1;

    // Try generating with Gemini if available for realism, otherwise procedural fallback
    const ai = getGeminiClient();
    if (ai && count <= 20) {
      try {
        const generatedFromAI = await this.generateViaGemini(options, compliantCount, nonCompliantCount, edgeCount);
        if (generatedFromAI && generatedFromAI.length > 0) {
          return generatedFromAI;
        }
      } catch (err: any) {
        console.warn('Gemini synthetic generation failed, falling back to procedural engine:', err?.message);
      }
    }

    // Procedural Synthetic Generator
    // 1. Generate compliant items
    for (let i = 0; i < compliantCount; i++) {
      const pol = policy || activePolicies[i % activePolicies.length];
      const item = this.createProceduralCase(pol.id, 'COMPLIANT', idCounter++, 'fully_compliant');
      results.push(item);
    }

    // 2. Generate non-compliant items
    for (let i = 0; i < nonCompliantCount; i++) {
      const pol = policy || activePolicies[(i + 1) % activePolicies.length];
      const tag = i % 2 === 0 ? 'single_violation' : 'multiple_violations';
      const item = this.createProceduralCase(pol.id, 'NON_COMPLIANT', idCounter++, tag);
      results.push(item);
    }

    // 3. Generate edge cases / ambiguous / boundary items
    for (let i = 0; i < edgeCount; i++) {
      const pol = policy || activePolicies[(i + 2) % activePolicies.length];
      const tagOptions: SyntheticTestCase['tag'][] = ['boundary_value', 'ambiguous_input', 'missing_information'];
      const tag = tagOptions[i % tagOptions.length];
      const status: ComplianceStatus = tag === 'boundary_value' ? 'COMPLIANT' : 'NEEDS_REVIEW';
      const item = this.createProceduralCase(pol.id, status, idCounter++, tag);
      results.push(item);
    }

    return results;
  }

  private async generateViaGemini(
    options: SyntheticGeneratorOptions,
    compliantCount: number,
    nonCompliantCount: number,
    edgeCount: number
  ): Promise<SyntheticTestCase[] | null> {
    const ai = getGeminiClient();
    if (!ai) return null;

    const policies = options.policyId !== 'ALL'
      ? [policyStore.getPolicyById(options.policyId)!].filter(Boolean)
      : policyStore.getActivePolicies();

    const policyContext = policies.map((p) => ({
      id: p.id,
      name: p.name,
      rules: p.rules.map((r) => ({ id: r.id, name: r.name, condition: r.condition, severity: r.severity })),
    }));

    const prompt = `Generate realistic synthetic test case data for compliance testing.
Target specifications:
- Compliant count: ${compliantCount}
- Non-compliant count: ${nonCompliantCount}
- Edge case / ambiguous count: ${edgeCount}
Total records: ${compliantCount + nonCompliantCount + edgeCount}

CRITICAL RULES:
1. Do NOT use real personal information (PII). All records must be strictly synthetic and fictional.
2. Clearly mark all inputs with [SYNTHETIC DATA].
3. For NON_COMPLIANT cases, accurately list the expected_violations matching the provided rule IDs.
4. For COMPLIANT cases, expected_violations MUST be empty.
5. Use only the provided policies:
${JSON.stringify(policyContext, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              test_case_id: { type: Type.STRING },
              policy_id: { type: Type.STRING },
              category: { type: Type.STRING },
              title: { type: Type.STRING },
              input: { type: Type.STRING },
              applicable_rules: { type: Type.ARRAY, items: { type: Type.STRING } },
              expected_status: { type: Type.STRING, enum: ['COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW'] },
              expected_violations: { type: Type.ARRAY, items: { type: Type.STRING } },
              expected_severity: { type: Type.STRING, enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
              tag: {
                type: Type.STRING,
                enum: [
                  'fully_compliant',
                  'single_violation',
                  'multiple_violations',
                  'boundary_value',
                  'missing_information',
                  'invalid_input',
                  'ambiguous_input',
                  'conflicting_information',
                  'edge_case',
                ],
              },
              rationale: { type: Type.STRING },
            },
            required: [
              'test_case_id',
              'policy_id',
              'category',
              'title',
              'input',
              'applicable_rules',
              'expected_status',
              'expected_violations',
              'expected_severity',
              'tag',
              'rationale',
            ],
          },
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim()) as SyntheticTestCase[];
      return parsed.map((item, idx) => ({
        ...item,
        test_case_id: `TC-SYN-${String(idx + 1).padStart(3, '0')}`,
        isCustom: true,
      }));
    }

    return null;
  }

  private createProceduralCase(
    policyId: string,
    status: ComplianceStatus,
    index: number,
    tag: SyntheticTestCase['tag']
  ): SyntheticTestCase {
    const id = `TC-SYN-${String(index).padStart(3, '0')}`;

    switch (policyId) {
      case 'POL-PWD-001': {
        if (status === 'COMPLIANT') {
          const pass = tag === 'boundary_value' ? 'Aa1!Bb2@Cc3#' : `V#9xL@${index}qZ$77Wk`;
          return {
            test_case_id: id,
            policy_id: 'POL-PWD-001',
            category: 'Authentication',
            title: `[SYNTHETIC] ${tag === 'boundary_value' ? 'Boundary 12-char' : 'Strong Compliant'} Password Credential`,
            input: `[SYNTHETIC DATA] password: "${pass}"`,
            applicable_rules: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-003', 'RULE-PWD-004', 'RULE-PWD-005', 'RULE-PWD-006'],
            expected_status: 'COMPLIANT',
            expected_violations: [],
            expected_severity: 'NONE',
            tag,
            rationale: 'Passes minimum 12 chars, upper, lower, numbers, and special symbols without dictionary words.',
            isCustom: true,
          };
        } else if (status === 'NON_COMPLIANT') {
          const isMulti = tag === 'multiple_violations';
          const pass = isMulti ? `admin${index}` : `Short9!${index}`;
          const violations = isMulti
            ? ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-005', 'RULE-PWD-006']
            : ['RULE-PWD-001'];
          return {
            test_case_id: id,
            policy_id: 'POL-PWD-001',
            category: 'Authentication',
            title: `[SYNTHETIC] Password Violation (${isMulti ? 'Multi-Rule' : 'Length Shortfall'})`,
            input: `[SYNTHETIC DATA] password: "${pass}"`,
            applicable_rules: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-003', 'RULE-PWD-004', 'RULE-PWD-005', 'RULE-PWD-006'],
            expected_status: 'NON_COMPLIANT',
            expected_violations: violations,
            expected_severity: isMulti ? 'CRITICAL' : 'HIGH',
            tag,
            rationale: `Fails ${violations.join(', ')}.`,
            isCustom: true,
          };
        } else {
          return {
            test_case_id: id,
            policy_id: 'POL-PWD-001',
            category: 'Authentication',
            title: '[SYNTHETIC] Ambiguous Incomplete Password Field',
            input: `[SYNTHETIC DATA] authentication_entry: { username: "synth_user_${index}", password: null }`,
            applicable_rules: ['RULE-PWD-001', 'RULE-PWD-002', 'RULE-PWD-003', 'RULE-PWD-004', 'RULE-PWD-005', 'RULE-PWD-006'],
            expected_status: 'NEEDS_REVIEW',
            expected_violations: [],
            expected_severity: 'MEDIUM',
            tag,
            rationale: 'Credential field is null; requires manual compliance verification.',
            isCustom: true,
          };
        }
      }

      case 'POL-PII-002': {
        if (status === 'COMPLIANT') {
          return {
            test_case_id: id,
            policy_id: 'POL-PII-002',
            category: 'Data Privacy',
            title: '[SYNTHETIC] Tokenized Customer Profile Record',
            input: `[SYNTHETIC DATA] UserProfile: { id: "SYNTH-${index}", nationalId: "***-**-9912", cardToken: "tok_simulated_pan", consent: "granted" }`,
            applicable_rules: ['RULE-PII-001', 'RULE-PII-002', 'RULE-PII-003', 'RULE-PII-004'],
            expected_status: 'COMPLIANT',
            expected_violations: [],
            expected_severity: 'NONE',
            tag,
            rationale: 'Masked national ID and tokenized card number comply with privacy governance.',
            isCustom: true,
          };
        } else {
          const fakeSsn = `987-65-${String(4000 + index).slice(0, 4)}`;
          return {
            test_case_id: id,
            policy_id: 'POL-PII-002',
            category: 'Data Privacy',
            title: '[SYNTHETIC] Plaintext National ID Exposed',
            input: `[SYNTHETIC DATA] Account setup log: applicant_ssn: ${fakeSsn}, verification_status: pending`,
            applicable_rules: ['RULE-PII-001', 'RULE-PII-002', 'RULE-PII-003', 'RULE-PII-004'],
            expected_status: 'NON_COMPLIANT',
            expected_violations: ['RULE-PII-001'],
            expected_severity: 'CRITICAL',
            tag: 'single_violation',
            rationale: 'Plaintext national ID pattern exposed in synthetic log line.',
            isCustom: true,
          };
        }
      }

      case 'POL-RET-003': {
        if (status === 'COMPLIANT') {
          return {
            test_case_id: id,
            policy_id: 'POL-RET-003',
            category: 'Compliance & Governance',
            title: '[SYNTHETIC] 5-Year Archival Policy Record',
            input: `[SYNTHETIC DATA] Ledger retention specification: retain transaction logs for 5 years, right to be forgotten deletion within 30 days.`,
            applicable_rules: ['RULE-RET-001', 'RULE-RET-002', 'RULE-RET-003'],
            expected_status: 'COMPLIANT',
            expected_violations: [],
            expected_severity: 'NONE',
            tag,
            rationale: '5 years satisfies <= 7 years; deletion SLA complies with 30-day mandate.',
            isCustom: true,
          };
        } else {
          return {
            test_case_id: id,
            policy_id: 'POL-RET-003',
            category: 'Compliance & Governance',
            title: '[SYNTHETIC] Indefinite Data Retention Clause',
            input: `[SYNTHETIC DATA] Data storage directive: retain customer billing history indefinitely without purge schedule.`,
            applicable_rules: ['RULE-RET-001', 'RULE-RET-002', 'RULE-RET-003'],
            expected_status: 'NON_COMPLIANT',
            expected_violations: ['RULE-RET-001'],
            expected_severity: 'HIGH',
            tag: 'single_violation',
            rationale: 'Indefinite retention violates mandatory 7-year regulatory maximum.',
            isCustom: true,
          };
        }
      }

      default: {
        return {
          test_case_id: id,
          policy_id: policyId,
          category: 'Information Security',
          title: `[SYNTHETIC] Document Access Test Case #${index}`,
          input: `[SYNTHETIC DATA] Document: "Internal Q${(index % 4) + 1} Strategy.pdf"; classification: internal; access: authenticated staff; public link: disabled.`,
          applicable_rules: ['RULE-DOC-001', 'RULE-DOC-002'],
          expected_status: 'COMPLIANT',
          expected_violations: [],
          expected_severity: 'NONE',
          tag: 'fully_compliant',
          rationale: 'No public link exposure; access restricted to authenticated staff.',
          isCustom: true,
        };
      }
    }
  }
}

export const syntheticGenerator = new SyntheticDataGenerator();
