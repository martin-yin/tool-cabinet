import { ModelSourceCodeType } from '../interface/sourceCode'

export const modelTemplate = ({ modelTypeContent }: ModelSourceCodeType) => {
  return `
  ${modelTypeContent.join('\n')}
`
}
