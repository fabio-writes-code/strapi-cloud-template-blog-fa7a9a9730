/**
 * A set of functions called "actions" for `push`
 */


export default {
  async createFromArticle(ctx) {
    const { articleId } = ctx.request.body; const article = await strapi.documents('api::article.article').findOne({ documentId: articleId, status: 'draft' });
    const notification = await strapi.documents('api::notification.notification').create({
      data: { title: article.title, body: article.description ?? `New: ${article.title}`, deeplink: `the-news://article/${article.slug}`, article: article.documentId },
      status: 'draft',
    });
    ctx.body = { notificationDocumentId: notification.documentId };
  },
};
