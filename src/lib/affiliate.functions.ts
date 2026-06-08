import { createServerFn } from "@tanstack/react-start";

async function checkUrl(url: string, timeoutMs = 4000): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // Try HEAD first (cheaper). Some affiliate domains reject HEAD — fall back to GET.
    let res: Response;
    try {
      res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; ZadaniomatLinkCheck/1.0; +https://zadaniomat.pl)",
          accept: "*/*",
        },
      });
      if (res.status === 405 || res.status === 501) throw new Error("retry-get");
    } catch {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; ZadaniomatLinkCheck/1.0; +https://zadaniomat.pl)",
          accept: "text/html,*/*",
        },
      });
    }
    // Treat 2xx and 3xx as alive. 404/410/5xx => dead.
    return res.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export const resolveAffiliateUrl = createServerFn({ method: "POST" })
  .inputValidator((data: { urls: string[] }) => {
    if (!data || !Array.isArray(data.urls) || data.urls.length === 0) {
      throw new Error("urls required");
    }
    const urls = data.urls
      .filter((u): u is string => typeof u === "string" && /^https?:\/\//i.test(u))
      .slice(0, 6);
    if (urls.length === 0) throw new Error("no valid urls");
    return { urls };
  })
  .handler(async ({ data }) => {
    for (const url of data.urls) {
      // Check sequentially so we prefer the first working URL.
      const ok = await checkUrl(url);
      if (ok) return { url, fallback: url !== data.urls[0] };
    }
    // Nothing worked — return the first URL so the user still goes somewhere.
    return { url: data.urls[0], fallback: false, allDead: true };
  });
