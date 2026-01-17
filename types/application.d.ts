export type ApplicationRole = "developer" | "designer" | "product_manager" | "project_manager" | "qa" | "social_media";

export type SocialLink = {
  phoneNo?: string;
  github?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  peerlist?: string;
  behance?: string;
  dribbble?: string;
};

export type Feedback = {
  status: "rejected" | "accepted" | "changes_requested";
  feedback?: string;
  reviewerName: string;
  createdAt: string | Date;
};

export type application = {
  userId: string;
  biodata: {
    firstName: string;
    lastName: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
  };
  professional: {
    institution: string;
    skills: string;
  };
  intro: {
    introduction: string;
    funFact: string;
    forFun: string;
    whyRds: string;
    numberOfHours: number;
  };
  status?: string;
  createdAt?: string;
  foundFrom: string;
  role?: ApplicationRole;
  isNew?: boolean;
  imageUrl?: string;
  nudgeCount?: number;
  lastNudgeAt?: string | Date;
  lastEditAt?: string | Date;
  socialLink?: SocialLink;
  score?: number;
  feedback?: Feedback[];
};

export type applicationPayload = {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  country: string;
  college: string;
  skills: string;
  introduction: string;
  funFact: string;
  forFun: string;
  numberOfHours: number;
  whyRds: string;
  foundFrom: string;
  role: ApplicationRole;
  imageUrl?: string;
  socialLink?: SocialLink;
};
