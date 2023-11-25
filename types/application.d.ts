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
  foundFrom: string;
};