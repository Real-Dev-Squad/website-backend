export interface FeatureFlag {
  id?: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: number;
  updatedAt?: number;
  createdBy: string
  updatedBy: string
}

export interface FeatureFlagResponse {
  status: number;
  data?: FeatureFlag | FeatureFlag[];
  error?: {
    message: string;
  };
}

export interface FeatureFlagService {
  getAllFeatureFlags(): Promise<FeatureFlagResponse>;
  createFeatureFlag(flagData: Partial<FeatureFlag>): Promise<FeatureFlagResponse>;
  updateFeatureFlag(flagId: string, updateData: Partial<FeatureFlag>): Promise<FeatureFlagResponse>;
} 