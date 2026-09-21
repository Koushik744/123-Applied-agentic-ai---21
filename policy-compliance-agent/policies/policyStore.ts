import { Policy, Rule } from '../shared/types.js';
import { DEFAULT_POLICIES } from './defaultPolicies.js';

class PolicyStore {
  private policies: Policy[] = [];

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults(): void {
    // Deep clone default policies
    this.policies = JSON.parse(JSON.stringify(DEFAULT_POLICIES));
  }

  public getAllPolicies(): Policy[] {
    return [...this.policies];
  }

  public getActivePolicies(): Policy[] {
    return this.policies
      .filter((p) => p.active)
      .map((p) => ({
        ...p,
        rules: p.rules.filter((r) => r.active),
      }));
  }

  public getPolicyById(id: string): Policy | undefined {
    return this.policies.find((p) => p.id === id);
  }

  public getAllRules(): Rule[] {
    return this.policies.flatMap((p) => p.rules);
  }

  public getActiveRules(): Rule[] {
    return this.policies
      .filter((p) => p.active)
      .flatMap((p) => p.rules.filter((r) => r.active));
  }

  public getRuleById(id: string): Rule | undefined {
    for (const p of this.policies) {
      const r = p.rules.find((rule) => rule.id === id);
      if (r) return r;
    }
    return undefined;
  }

  public togglePolicyActive(id: string): Policy | undefined {
    const policy = this.getPolicyById(id);
    if (policy) {
      policy.active = !policy.active;
      policy.updatedAt = new Date().toISOString();
    }
    return policy;
  }

  public toggleRuleActive(ruleId: string): Rule | undefined {
    for (const policy of this.policies) {
      const rule = policy.rules.find((r) => r.id === ruleId);
      if (rule) {
        rule.active = !rule.active;
        policy.updatedAt = new Date().toISOString();
        return rule;
      }
    }
    return undefined;
  }

  public savePolicy(policyData: Partial<Policy> & { name: string; category: string }): Policy {
    const now = new Date().toISOString();
    if (policyData.id) {
      const index = this.policies.findIndex((p) => p.id === policyData.id);
      if (index >= 0) {
        const existing = this.policies[index];
        const updated: Policy = {
          ...existing,
          ...policyData,
          updatedAt: now,
          rules: policyData.rules || existing.rules,
        };
        this.policies[index] = updated;
        return updated;
      }
    }

    const newId = policyData.id || `POL-CUSTOM-${Date.now().toString().slice(-4)}`;
    const newPolicy: Policy = {
      id: newId,
      name: policyData.name,
      description: policyData.description || 'Custom corporate compliance policy',
      category: policyData.category,
      severity: policyData.severity || 'MEDIUM',
      active: policyData.active !== undefined ? policyData.active : true,
      rules: (policyData.rules || []).map((r, i) => ({
        ...r,
        id: r.id || `RULE-${newId.replace('POL-', '')}-${(i + 1).toString().padStart(3, '0')}`,
        policyId: newId,
        active: r.active !== undefined ? r.active : true,
      })),
      createdAt: now,
      updatedAt: now,
    };
    this.policies.push(newPolicy);
    return newPolicy;
  }

  public addRuleToPolicy(policyId: string, ruleData: Omit<Rule, 'id' | 'policyId'>): Rule | undefined {
    const policy = this.getPolicyById(policyId);
    if (!policy) return undefined;

    const count = policy.rules.length + 1;
    const rulePrefix = policyId.replace('POL-', '');
    const newRule: Rule = {
      ...ruleData,
      id: `RULE-${rulePrefix}-${count.toString().padStart(3, '0')}`,
      policyId,
    };
    policy.rules.push(newRule);
    policy.updatedAt = new Date().toISOString();
    return newRule;
  }
}

export const policyStore = new PolicyStore();
