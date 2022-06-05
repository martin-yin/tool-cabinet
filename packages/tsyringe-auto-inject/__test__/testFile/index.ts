import { TestArticleRepository as TestArticleRepository14 } from './abstract/article'

export class TestArticleWebRepository implements TestArticleRepository14 {
  getArticle(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  delteArticle(id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

class TestArticleWebRepository2 implements TestArticleRepository14 {
  getArticle(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  delteArticle(id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export class TestArticleWebRepository3 implements TestArticleRepository14 {
  getArticle(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  delteArticle(id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export { TestArticleWebRepository3 as CC, TestArticleWebRepository2 as BB, TestArticleWebRepository as AA }
export default TestArticleWebRepository2
