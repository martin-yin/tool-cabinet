import { container } from 'tsyringe'
import { AA, BB, CC } from './index'
import { container } from 'tsyringe'
import { AA, BB, CC } from './index'

//------ inject start ------
container.register('ArticleRepository', {
  useClass: AA
})
container.register('ArticleRepository', {
  useClass: BB
})
container.register('ArticleRepository', {
  useClass: CC
})
//------ inject end ------

//------ inject start ------
container.register('ArticleRepository', {
  useClass: AA
})
container.register('ArticleRepository', {
  useClass: BB
})
container.register('ArticleRepository', {
  useClass: CC
})
//------ inject end ------
