import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const OLD_DOMAIN = 'https://roaming-roads-cms.vercel.app'
const NEW_DOMAIN = 'https://www.roamingroads.nl'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const result = await db.execute(sql`
    UPDATE media
    SET
      url                   = REPLACE(url,                   ${OLD_DOMAIN}, ${NEW_DOMAIN}),
      "thumbnail_u_r_l"     = REPLACE("thumbnail_u_r_l",     ${OLD_DOMAIN}, ${NEW_DOMAIN}),
      sizes_thumbnail_url   = REPLACE(sizes_thumbnail_url,   ${OLD_DOMAIN}, ${NEW_DOMAIN}),
      sizes_card_url        = REPLACE(sizes_card_url,        ${OLD_DOMAIN}, ${NEW_DOMAIN}),
      sizes_tablet_url      = REPLACE(sizes_tablet_url,      ${OLD_DOMAIN}, ${NEW_DOMAIN}),
      sizes_hero_url        = REPLACE(sizes_hero_url,        ${OLD_DOMAIN}, ${NEW_DOMAIN})
    WHERE
      url LIKE ${OLD_DOMAIN + '%'}
      OR "thumbnail_u_r_l" LIKE ${OLD_DOMAIN + '%'}
      OR sizes_thumbnail_url LIKE ${OLD_DOMAIN + '%'}
  `)

  console.log(`[fix_media_urls] Updated ${result.rowCount ?? result.rows?.length ?? '?'} media rows`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE media
    SET
      url                   = REPLACE(url,                   ${NEW_DOMAIN}, ${OLD_DOMAIN}),
      "thumbnail_u_r_l"     = REPLACE("thumbnail_u_r_l",     ${NEW_DOMAIN}, ${OLD_DOMAIN}),
      sizes_thumbnail_url   = REPLACE(sizes_thumbnail_url,   ${NEW_DOMAIN}, ${OLD_DOMAIN}),
      sizes_card_url        = REPLACE(sizes_card_url,        ${NEW_DOMAIN}, ${OLD_DOMAIN}),
      sizes_tablet_url      = REPLACE(sizes_tablet_url,      ${NEW_DOMAIN}, ${OLD_DOMAIN}),
      sizes_hero_url        = REPLACE(sizes_hero_url,        ${NEW_DOMAIN}, ${OLD_DOMAIN})
    WHERE
      url LIKE ${NEW_DOMAIN + '%'}
      OR "thumbnail_u_r_l" LIKE ${NEW_DOMAIN + '%'}
      OR sizes_thumbnail_url LIKE ${NEW_DOMAIN + '%'}
  `)
}
