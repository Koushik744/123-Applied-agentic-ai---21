import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Layers,
  Shield,
  Trash2,
} from 'lucide-react';
import { Policy, Rule, SeverityLevel } from '../../shared/types.js';

interface PoliciesViewProps {
  policies: Policy[];
  loading: boolean;
  onTogglePolicy: (id: string) => Promise<void>;
  onSavePolicy: (policy: Partial<Policy> & { name: string; category: string }) => Promise<void>;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  policies,
  loading,
  onTogglePolicy,
  onSavePolicy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(policies[0]?.id || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Policy form state
  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyCategory, setNewPolicyCategory] = useState('Compliance & Governance');
  const [newPolicyDescription, setNewPolicyDescription] = useState('');
  const [newPolicySeverity, setNewPolicySeverity] = useState<SeverityLevel>('HIGH');
  const [newRules, setNewRules] = useState<Array<Omit<Rule, 'id' | 'policyId'>>>([
    {
      name: 'Mandatory Compliance Verification',
      description: 'Requirement must be explicitly satisfied.',
      condition: 'text.length > 0',
      expectedBehavior: 'Input contains mandatory parameters.',
      severity: 'HIGH',
      remediation: 'Provide all required compliance parameters in the payload.',
      isMandatory: true,
      active: true,
      category: 'Compliance & Governance',
    },
  ]);

  const categories = Array.from(new Set(policies.map((p) => p.category)));

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddRuleField = () => {
    setNewRules([
      ...newRules,
      {
        name: `Rule constraint #${newRules.length + 1}`,
        description: 'Specify constraint requirements.',
        condition: 'matches(/pattern/)',
        expectedBehavior: 'Expected compliant behavior description.',
        severity: 'MEDIUM',
        remediation: 'Corrective action guidance for compliance officers.',
        isMandatory: true,
        active: true,
        category: newPolicyCategory,
      },
    ]);
  };

  const handleRemoveRuleField = (index: number) => {
    setNewRules(newRules.filter((_, i) => i !== index));
  };

  const handleCreatePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyName.trim()) return;

    await onSavePolicy({
      name: newPolicyName,
      category: newPolicyCategory,
      description: newPolicyDescription || 'Custom enterprise policy domain',
      severity: newPolicySeverity,
      active: true,
      rules: newRules as any,
    });

    setIsCreateModalOpen(false);
    // Reset form
    setNewPolicyName('');
    setNewPolicyDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>Policy Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure enterprise policy domains, active states, and deterministic rule bindings.
          </p>
        </div>

        <button
          id="btn-create-policy"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Policy Domain</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search policies by name, description, or policy ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            <option value="ALL">All Categories ({policies.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Policies List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading policy registry...</div>
      ) : filteredPolicies.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No policies found matching your search criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPolicies.map((policy) => {
            const isExpanded = expandedPolicyId === policy.id;
            const activeRulesCount = policy.rules.filter((r) => r.active).length;

            return (
              <div
                key={policy.id}
                className={`bg-white rounded-xl border transition-all ${
                  policy.active ? 'border-slate-200 shadow-sm' : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                }`}
              >
                {/* Policy Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {policy.id}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {policy.category}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                          policy.severity === 'CRITICAL'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : policy.severity === 'HIGH'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {policy.severity}
                      </span>
                    </div>

                    <h2 className="text-base font-semibold text-slate-900">{policy.name}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{policy.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-auto">
                    {/* Active Toggle Switch */}
                    <button
                      onClick={() => onTogglePolicy(policy.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                        policy.active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {policy.active ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>

                    {/* Expand Rules Button */}
                    <button
                      onClick={() => setExpandedPolicyId(isExpanded ? null : policy.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>{activeRulesCount} Rules</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Rules Section */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 rounded-b-xl space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Enforced Rules within {policy.name}
                      </h3>
                      <span className="text-[11px] text-slate-500">Deterministic checks executed at runtime</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {policy.rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs shadow-2xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-[11px] font-semibold text-slate-800 mr-2">
                                {rule.id}
                              </span>
                              <span className="font-medium text-slate-900">{rule.name}</span>
                            </div>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                                rule.severity === 'CRITICAL'
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : rule.severity === 'HIGH'
                                  ? 'bg-orange-50 text-orange-600 border-orange-200'
                                  : 'bg-amber-50 text-amber-600 border-amber-200'
                              }`}
                            >
                              {rule.severity}
                            </span>
                          </div>

                          <p className="text-slate-600 text-[11px]">{rule.description}</p>

                          <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                            <div className="font-mono text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 overflow-x-auto">
                              <span className="text-slate-400 mr-1 font-sans font-semibold">Condition:</span>
                              {rule.condition}
                            </div>
                            <p className="text-slate-500">
                              <strong className="text-slate-700">Expected:</strong> {rule.expectedBehavior}
                            </p>
                            <p className="text-emerald-700 bg-emerald-50/50 p-1.5 rounded border border-emerald-100">
                              <strong>Remediation:</strong> {rule.remediation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Custom Policy Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Add New Policy Domain</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePolicySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Policy Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Model Safety & Bias Governance"
                    value={newPolicyName}
                    onChange={(e) => setNewPolicyName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Governance, Export Controls"
                    value={newPolicyCategory}
                    onChange={(e) => setNewPolicyCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Outline the statutory requirements and organizational objectives..."
                  value={newPolicyDescription}
                  onChange={(e) => setNewPolicyDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Default Severity Tier</label>
                <select
                  value={newPolicySeverity}
                  onChange={(e) => setNewPolicySeverity(e.target.value as SeverityLevel)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {/* Policy Rules Configuration */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Policy Rules ({newRules.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRuleField}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {newRules.map((rule, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Rule #{idx + 1}</span>
                        {newRules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRuleField(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Rule Name"
                          value={rule.name}
                          onChange={(e) => {
                            const updated = [...newRules];
                            updated[idx].name = e.target.value;
                            setNewRules(updated);
                          }}
                          className="p-1.5 border border-slate-200 rounded bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Deterministic Condition (e.g. text.length > 0)"
                          value={rule.condition}
                          onChange={(e) => {
                            const updated = [...newRules];
                            updated[idx].condition = e.target.value;
                            setNewRules(updated);
                          }}
                          className="p-1.5 border border-slate-200 rounded bg-white font-mono text-[11px]"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Remediation Guidance"
                        value={rule.remediation}
                        onChange={(e) => {
                          const updated = [...newRules];
                          updated[idx].remediation = e.target.value;
                          setNewRules(updated);
                        }}
                        className="w-full p-1.5 border border-slate-200 rounded bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm"
                >
                  Save Policy Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
