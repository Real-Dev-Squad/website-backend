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
};
