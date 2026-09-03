export class CmsStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CmsStoreError";
  }
}

export const CMS_UNWRITABLE =
  "This environment has no writable CMS store. Set POSTGRES_URL (Vercel Marketplace Supabase) or BLOB_READ_WRITE_TOKEN. data/cms.json is read-only on Vercel.";

export const CMS_STALE =
  "This draft changed in another tab. Reload, then save again so you do not overwrite a newer revision.";
