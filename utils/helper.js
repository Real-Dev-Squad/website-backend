export const getQualifiers = (query) => {
  const combinations = query.split(" "); // split the query string by white-space
  const qualifiers = {};

  combinations.forEach((combination) => {
    const [qualifier, value] = combination.split(":");
    qualifiers[qualifier] = value;
  });

  return qualifiers;
};
