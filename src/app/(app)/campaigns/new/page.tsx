'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign, type CreateCampaignInput } from '@/lib/api/campaigns';

export default function NewCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCampaignInput>({
    name: '',
    description: '',
    goals: '',
    brief: '',
    deliverables: '',
    dueDate: '',
    deadline: '',
    budget: 0,
    currency: 'USD'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = <K extends keyof CreateCampaignInput>(field: K, value: CreateCampaignInput[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Campaign name must be at least 3 characters';
    }
    
    if (formData.budget && formData.budget < 0) {
      newErrors.budget = 'Budget must be a positive number';
    }
    
    if (formData.dueDate && formData.deadline && new Date(formData.dueDate) > new Date(formData.deadline)) {
      newErrors.deadline = 'Deadline must be after due date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const campaign = await createCampaign(formData);
      router.push(`/campaigns/${campaign.slug}`);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-with-header max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create New Campaign</h1>
        <p className="text-text-secondary">Set up your influencer marketing campaign</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                Campaign Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`input ${errors.name ? 'border-error' : ''}`}
                placeholder="Enter campaign name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-error mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="input resize-none"
                placeholder="Describe your campaign"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                Goals
              </label>
              <textarea
                value={formData.goals || ''}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="What are the main goals of this campaign?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                Brief
              </label>
              <textarea
                value={formData.brief || ''}
                onChange={(e) => handleInputChange('brief', e.target.value)}
                rows={4}
                className="input resize-none"
                placeholder="Provide a detailed brief for influencers"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">
                Deliverables
              </label>
              <textarea
                value={formData.deliverables || ''}
                onChange={(e) => handleInputChange('deliverables', e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="What deliverables are expected? (e.g., 3 Instagram posts, 5 stories)"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Budget
                </label>
              <input
                type="number"
                min="0"
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                className={`input ${errors.budget ? 'border-error' : ''}`}
                placeholder="0"
                aria-invalid={!!errors.budget}
                aria-describedby={errors.budget ? 'budget-error' : undefined}
              />
              {errors.budget && (
                <p id="budget-error" className="text-sm text-error mt-1">
                  {errors.budget}
                </p>
              )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency || 'USD'}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="input"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="sticky bottom-0 bg-surface border-t border-border p-6 -mx-6 -mb-6 mt-8">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}