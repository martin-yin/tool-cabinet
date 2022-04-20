import { ModelSourceType } from '../interface'

export const modelTemplate = ({ modelTypeContent }: ModelSourceType) => {
  return `
  ${modelTypeContent.join('\n')}
`
}
