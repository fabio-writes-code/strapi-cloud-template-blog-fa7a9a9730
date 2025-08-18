
import { unstable_useContentManagerContext, useFetchClient } from '@strapi/strapi/admin';
import { Button, Typography } from '@strapi/design-system';

import type { StrapiApp } from '@strapi/strapi/admin';
import { useEffect, useState } from 'react';

export default {
  config: {
    locales: [
    ],
  },
  bootstrap(app: StrapiApp) {
    app.getPlugin('content-manager').injectComponent('editView', 'right-links', { name: 'modal-nofity', Component: AutoNotifyPanel })
  },
};

function AutoNotifyPanel() {
  const { slug, id } = unstable_useContentManagerContext(); // v5
  const { post, get } = useFetchClient()
  const [isPublished, setIsPublised] = useState(false)
  if (slug !== 'api::article.article') return null

  useEffect(() => {
    const getArticleData = async () => {
      const { data } = await get(`/content-manager/collection-types/api::article.article/${id}`)
      setIsPublised(data.data.status === "published")
    }

    getArticleData()
  }, [])


  const onConfirm = async () => {
    const { data } = await post('/api/push', { articleId: id })
    window.location.assign(
      `/admin/content-manager/collection-types/api::notification.notification/${data.notificationDocumentId}`
    )
  };

  return (
    <>
      {isPublished
        ? (<Button onClick={onConfirm} fullWidth={true}>
          <Typography id="auto-notify-title">
            Create Notification
          </Typography>
        </Button>)
        : null
      }
    </>
  );
}

