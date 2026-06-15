export interface DevLogEntry {
  id: string;
  date: string;
  completedFeatures: string[];
  technicalChallenges: string[];
  solutions: string[];
  hoursSpent: number;
  moodIndex: number;
  moodNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: "testing" | "submission" | "marketing" | "other";
}

export interface UserFeedback {
  id: string;
  versionId: string;
  rating: number;
  comment: string;
  source: string;
  date: string;
}

export interface GameVersion {
  id: string;
  versionNumber: string;
  releaseDate: string;
  isMilestone: boolean;
  milestoneLabel: string;
  newFeatures: string[];
  fixedBugs: string[];
  releaseChecklist: ChecklistItem[];
  userFeedbacks: UserFeedback[];
  createdAt: string;
}

export interface TestScenario {
  id: string;
  name: string;
  steps: string[];
  expectedResult: string;
  status: "pass" | "fail" | "skip";
}

export interface TestPlan {
  id: string;
  name: string;
  description: string;
  scenarios: TestScenario[];
  status: "pending" | "in_progress" | "completed";
  assignee: string;
  deadline: string;
  createdAt: string;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  reproductionSteps: string[];
  severity: "crash" | "experience" | "cosmetic";
  status: "open" | "in_progress" | "resolved" | "wont_fix";
  assignee: string;
  versionId: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface BetaTester {
  id: string;
  name: string;
  email: string;
  invitationStatus: "pending" | "accepted" | "declined";
  feedback: string;
  rating: number;
}

export interface BetaTestSession {
  id: string;
  name: string;
  testers: BetaTester[];
  startDate: string;
  endDate: string;
  summaryNotes: string;
}

export interface PlatformResearch {
  id: string;
  platformName: string;
  listingRequirements: string[];
  revenueShare: string;
  userDemographics: string;
  feeStructure: string;
  rating: number;
  notes: string;
}

export interface DiscountTier {
  label: string;
  percentage: number;
  condition: string;
}

export interface CompetitorPrice {
  gameName: string;
  price: number;
  platform: string;
}

export interface PricingStrategy {
  id: string;
  name: string;
  basePrice: number;
  discountTiers: DiscountTier[];
  competitorPrices: CompetitorPrice[];
  decisionNotes: string;
  decidedAt: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: string;
  budget: number;
  startDate: string;
  endDate: string;
  impressions: number;
  conversions: number;
  revenue: number;
  status: "planned" | "active" | "completed";
  notes: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface ProjectSettings {
  projectName: string;
  description: string;
  engine: string;
  targetPlatforms: string[];
  teamMembers: TeamMember[];
}
