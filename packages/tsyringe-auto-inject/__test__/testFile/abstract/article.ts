export abstract class ArticleRepository {
  abstract getArticle(): Promise<void>

  abstract delteArticle(id: string): Promise<void>
}

export { ArticleRepository as TestArticleRepository, ArticleRepository as TestArticleRepository2 }

export default ArticleRepository
