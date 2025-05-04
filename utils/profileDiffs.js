const generateNextLink = (nextPageParams) => {
  const urlSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(nextPageParams)) {
    if (!value) continue;
    urlSearchParams.append(key, value);
  }
  const nextLink = `/profileDiffs?${urlSearchParams.toString()}`;
  return nextLink;
};

export { generateNextLink };
