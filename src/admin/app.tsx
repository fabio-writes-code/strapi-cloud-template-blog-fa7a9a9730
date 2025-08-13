
import { unstable_useContentManagerContext, useFetchClient } from '@strapi/strapi/admin';
import { Button, Typography } from '@strapi/design-system';

import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [
    ],
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
    app.getPlugin('content-manager').injectComponent('editView', 'right-links', { name: 'modal-nofity', Component: AutoNotifyPanel })
  },
};

function AutoNotifyPanel() {
  const { slug, id } = unstable_useContentManagerContext(); // v5
  const { post, get } = useFetchClient()
  if (slug !== 'api::article.article') return null

  const onConfirm = async () => {
    const { data } = await post('/api/push', { articleId: id })
    window.location.assign(
      `/admin/content-manager/collection-types/api::notification.notification/${data.notificationDocumentId}`
    )
  };

  return (
    <Button onClick={onConfirm} fullWidth={true}>
      <Typography fontWeight="bold" id="auto-notify-title">
        Create Notification
      </Typography>
    </Button>
  );
}

