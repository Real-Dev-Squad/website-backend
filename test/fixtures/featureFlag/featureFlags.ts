interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
}

const featureFlagData = [
  {
    id: "60b00c3a-3928-4f0c-8581-dfce71aa8605",
    name: "feature-flag",
    description: "It is a demo project",
    status: "ENABLED",
    createdAt: 1718139019,
    createdBy: "sduhasdjasdas",
    updatedAt: 1718139019,
    updatedBy: "sduhasdjasdas"
  },
  {
    id: "flag-1",
    name: "feature-flag-1",
    description: "First demo flag",
    status: "ENABLED",
    createdAt: 1718139019,
    createdBy: "user1",
    updatedAt: 1718139019,
    updatedBy: "user1"
  },
  {
    id: "flag-2",
    name: "feature-flag-2",
    description: "Second demo flag",
    status: "DISABLED",
    createdAt: 1718139019,
    createdBy: "user2",
    updatedAt: 1718139019,
    updatedBy: "user2"
  }
];

const newFeatureFlag = {
  Name: "Demo-feature",
  Description: "Description for demo feature",
  UserId: "superUserId"
};

const invalidFeatureFlag = {
  Description: "Missing required name",
  UserId: "superUserId"
};

module.exports = {
  featureFlagData,
  newFeatureFlag,
  invalidFeatureFlag
}; 