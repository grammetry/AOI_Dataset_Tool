export const openImgInNewTab = (url: string) => {
  window.open(url, '_blank');
};

export const flattenObject = (inputObj: Record<string, any>): Record<string, any> => {
  const outputObj: Record<string, any> = {};

  for (const key in inputObj) {
    const innerObj = inputObj[key];
    for (const innerKey in innerObj) {
      outputObj[innerKey] = innerObj[innerKey];
    }
  }

  return outputObj;
};
