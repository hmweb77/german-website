import { NextResponse } from 'next/server';

const PAYMENT_LABELS = {
  card: 'Carte Bancaire',
  bank: 'Virement Bancaire',
  cash: 'CashPlus / Wafacash',
};

const DEFAULT_PAYMENT_OPTIONS_LABEL =
  'Carte Bancaire · Virement Bancaire · CashPlus / Wafacash';

/** Web app deployments only; not the script editor. */
function normalizeAndValidateWebhookUrl(raw) {
  if (!raw || typeof raw !== 'string') return { ok: false, url: '', message: 'Missing URL' };
  const url = raw.trim().replace(/\/$/, '').split('?')[0];
  if (url.includes('/macros/edit')) {
    return {
      ok: false,
      url: '',
      message:
        'GOOGLE_SHEETS_WEBHOOK_URL must be the Web App URL (ends with /exec), not the script editor link.',
    };
  }
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url)) {
    return {
      ok: false,
      url: '',
      message:
        'GOOGLE_SHEETS_WEBHOOK_URL should look like: https://script.google.com/macros/s/DEPLOYMENT_ID/exec (Deploy → Web app → copy URL).',
    };
  }
  return { ok: true, url };
}

function looksLikeGoogleAccessDeniedPage(text) {
  return (
    typeof text === 'string' &&
    (text.includes('Accès refusé') ||
      text.includes('Access denied') ||
      text.includes('Une autorisation est nécessaire') ||
      text.includes('Authorization needed') ||
      text.includes('<!DOCTYPE html>'))
  );
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const paymentRaw = typeof body.payment === 'string' ? body.payment.trim() : '';
  const payment = paymentRaw || 'options';
  const paymentLabel = PAYMENT_LABELS[payment] || DEFAULT_PAYMENT_OPTIONS_LABEL;

  if (!name || !email || !phone) {
    return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
  }

  const rawEnv = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const validated = normalizeAndValidateWebhookUrl(rawEnv);
  if (!validated.ok) {
    console.error('Invalid GOOGLE_SHEETS_WEBHOOK_URL:', validated.message);
    return NextResponse.json(
      {
        error: 'إعدادات حفظ Google غير صحيحة. تحقق من الرابط في .env.local',
        detail: validated.message,
      },
      { status: 500 }
    );
  }

  const webhookUrl = validated.url;
  const payload = {
    name,
    email,
    phone,
    payment,
    paymentLabel,
  };
  const jsonBody = JSON.stringify(payload);

  async function postToSheets(headers) {
    return fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: jsonBody,
      cache: 'no-store',
      redirect: 'follow',
    });
  }

  function parseWebhookResponse(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  try {
    let res = await postToSheets({
      'Content-Type': 'application/json',
    });

    let text = await res.text();
    let json = parseWebhookResponse(text);

    if (json && json.ok === true) {
      return NextResponse.json({ ok: true, saved: true });
    }

    if (!res.ok || (text && looksLikeGoogleAccessDeniedPage(text))) {
      res = await postToSheets({
        'Content-Type': 'text/plain;charset=utf-8',
      });
      text = await res.text();
      json = parseWebhookResponse(text);
      if (json && json.ok === true) {
        return NextResponse.json({ ok: true, saved: true });
      }
    }

    if (!res.ok || looksLikeGoogleAccessDeniedPage(text) || !json) {
      console.error('Sheets webhook HTTP', res.status, text.slice(0, 400));
      return NextResponse.json(
        {
          error:
            'ما قدرناش نحفظ فـ Google Sheet. تأكد من رابط Web App (ينتهي بـ /exec) ومن Deploy مع «Anyone».',
          detail:
            'In Apps Script: Deploy → Manage deployments → Web app → copy URL ending in /exec. Not the editor URL.',
        },
        { status: 502 }
      );
    }

    if (json.ok === false) {
      console.error('Sheets webhook rejected:', json);
      return NextResponse.json({ error: 'تعذر حفظ التسجيل فالجدول' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, saved: true });
  } catch (err) {
    console.error('Sheets webhook fetch failed:', err);
    return NextResponse.json({ error: 'تعذر الاتصال بالخادم' }, { status: 502 });
  }
}
