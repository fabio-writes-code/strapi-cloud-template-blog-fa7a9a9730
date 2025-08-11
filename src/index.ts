import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (ctx, next) => {
      if (ctx.uid! == 'api::notification.notification') return next()

      let wasPublished = false;
      console.log(ctx, typeof ctx.params, !!ctx.params)

      if (ctx.action! == 'create') {
        console.log('create')
      }


      // if (ctx.action! == 'create' && ctx.params?.documentId) {
      //   const prev = await strapi
      //     .documents('api::notification.notification')
      //     .findOne({ documentId: ctx.params.lookup, status: 'published' })
      //   wasPublished = !!prev?.publishedAt;
      // }

      // const result = await next()
      return next()
    })
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) { },
};
