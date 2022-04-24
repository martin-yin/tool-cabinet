import { ModelCodeType } from '../interface'

export const modelTemplate = (modelCode: ModelCodeType) => {
  return `
  ${modelCode.join('\n')}
`
}
