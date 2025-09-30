'use server';

import { createClient } from '@/lib/supabase/server';

export type FormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

const initialState: FormState = {
  status: 'idle',
  message: ''
};

export async function submitForm(
  _prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const supabase = createClient();

  const name = formData.get('name')?.toString().trim() ?? '';
  const menu = formData.get('menu')?.toString().trim() ?? '';
  const openTime = formData.get('open-time')?.toString() ?? '';
  const closeTime = formData.get('close-time')?.toString() ?? '';
  const iftar = formData.get('iftar')?.toString().trim() ?? '';
  const iftarMenu = formData.get('iftar-menu')?.toString().trim() || null;
  const sehri = formData.get('sehri')?.toString().trim() ?? '';
  const sehriMenu = formData.get('sehri-menu')?.toString().trim() || null;
  const sehriStartTime = formData.get('sehri-start-time')?.toString() || null;
  const sehriEndTime = formData.get('sehri-end-time')?.toString() || null;

  if (!name || !menu || !openTime || !closeTime || !iftar || !sehri) {
    return {
      status: 'error',
      message: 'সমস্ত আবশ্যিক ঘর পূরণ করুন।'
    };
  }

  const now = new Date();

  try {
    const [iftarImageUrl, sehriImageUrl] = await Promise.all([
      uploadIfPresent(supabase, formData.get('iftar-file'), 'iftar'),
      uploadIfPresent(supabase, formData.get('sehri-file'), 'sehri')
    ]);

    const { error } = await supabase.from('form_responses').insert({
      name,
      menu,
      open_time: openTime,
      close_time: closeTime,
      iftar,
      iftar_menu: iftarMenu,
      iftar_image_url: iftarImageUrl,
      sehri,
      sehri_menu: sehriMenu,
      sehri_image_url: sehriImageUrl,
      sehri_start_time: sehriStartTime,
      sehri_end_time: sehriEndTime,
      submitted_at: now.toISOString()
    });

    if (error) {
      console.error('Error inserting form response', error);
      return {
        status: 'error',
        message: 'সার্ভার সমস্যার কারণে ফর্ম জমা করা যায়নি। পরে আবার চেষ্টা করুন।'
      };
    }

    return {
      status: 'success',
      message: '✅ ফর্ম সফলভাবে জমা হয়েছে!'
    };
  } catch (error) {
    console.error('Failed to submit Ramadan form', error);
    return {
      status: 'error',
      message: 'ফর্ম জমা করার সময় অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে। পরে চেষ্টা করুন।'
    };
  }
}

async function uploadIfPresent(
  supabase: ReturnType<typeof createClient>,
  maybeFile: FormDataEntryValue | null,
  folder: string
) {
  if (!(maybeFile instanceof File) || maybeFile.size === 0) {
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedName = maybeFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${folder}/${timestamp}-${sanitizedName}`;

  const arrayBuffer = await maybeFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from('form_files')
    .upload(path, buffer, {
      contentType: maybeFile.type || 'application/octet-stream',
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from('form_files').getPublicUrl(path);

  return publicUrl;
}

export { initialState };
