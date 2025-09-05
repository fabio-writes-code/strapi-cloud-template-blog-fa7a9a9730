import type { Core } from '@strapi/strapi';
import { sendExpo } from './services/expo-notifications';
import { Expo } from "expo-server-sdk"

const UIDS = ['api::notification.notification']
// Guard to prevent re-entrancy when we republish programmatically
const INTERNAL_PUBLISHING = new Set<string>();

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
        // Skip if this publish was triggered internally to sync changes
        if (INTERNAL_PUBLISHING.has(String(ctx.params.documentId))) {
          INTERNAL_PUBLISHING.delete(String(ctx.params.documentId))
          return result
        }
        const { title, body, deeplink } = await strapi
          .documents('api::notification.notification')
          .findOne({ documentId: ctx.params.documentId })

        const devices = await strapi
          .documents('api::device.device')
          .findMany({ filters: { enabled: true }, fields: ['token'] })

        const tokens = devices.map(d => d.token).filter(Boolean)

        let expo = new Expo({
          useFcmV1: true
        })

        // for()

        const tickets = await sendExpo({
          tokens,
          title,
          body,
          data: { deeplink }
        })

        // Update the draft with send metadata, then republish to keep status clean
        await strapi.documents('api::notification.notification').update({
          documentId: ctx.params.documentId,
          status: 'draft',
          data: {
            sentAt: new Date().toISOString(),
            sendCount: tokens.length,
            errors: tickets.filter(t => t.status != 'ok'),
          }
        })

        // Republish to ensure the entry stays Published (not Modified)
        INTERNAL_PUBLISHING.add(String(ctx.params.documentId))
        await strapi.documents('api::notification.notification').publish({
          documentId: ctx.params.documentId,
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
