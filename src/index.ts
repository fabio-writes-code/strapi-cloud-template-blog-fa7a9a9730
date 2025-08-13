import type { Core } from '@strapi/strapi';
import { sendExpo } from './services/expo-notifications';

const UIDS = ['api::notification.notification']

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */

  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (ctx, next) => {

      if (!UIDS.includes(ctx.uid)) return next()
      const result = await next()

      if (ctx.action == 'publish' && result) {
        const { title, body, deeplink } = await strapi
          .documents('api::notification.notification')
          .findOne({ documentId: ctx.params.documentId })

        const devices = await strapi
          .documents('api::device.device')
          .findMany({ filters: { enabled: true }, fields: ['token'] })

        const tokens = devices.map(d => d.token).filter(Boolean)

        const tickets = await sendExpo({
          tokens,
          title,
          body,
          data: { deeplink }
        })

        await strapi.documents('api::notification.notification')
          .update({
            documentId: ctx.params.documentId,
            data: {
              sentAt: new Date().toISOString(),
              sendCount: tokens.length,
              errors: tickets.filter(t => t.status != 'ok')
            }
          })
      }

      return result
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
