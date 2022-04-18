export const modelTemplate = ({ modelTypeList }) => {
  return `
  ${modelTypeList.join("\n")}
`;
};
