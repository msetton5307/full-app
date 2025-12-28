const axios = require("axios");

const ASIN_REGEX = /(?:dp|gp\/product|dp\/product|gp\/aw\/d|gp\/offer-listing|o\/ASIN|gp\/registry\/wishlist)\/([A-Z0-9]{10})/i;

async function extractAsinFromUrl(url) {
  if (!url) {
    return null;
  }

  try {
    const response = await axios.get(url, {
      maxRedirects: 5,
      timeout: 5000,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const finalUrl =
      response?.request?.res?.responseUrl || response?.request?.path || url;
    const match = finalUrl.match(ASIN_REGEX);
    return match ? match[1] : null;
  } catch (error) {
    console.error(`Failed to resolve Amazon URL: ${error.message}`);
    return null;
  }
}

function extractFirstMatch(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return "";
}

function extractAllMatches(html, pattern) {
  const matches = [];
  const regex = new RegExp(pattern, "gi");
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      matches.push(match[1].trim());
    }
  }
  return matches;
}

function parsePriceDetails(html) {
  const primaryPrice = extractFirstMatch(html, [
    /id=["']priceblock_dealprice["'][^>]*>([^<]+)</i,
    /id=["']priceblock_ourprice["'][^>]*>([^<]+)</i,
    /"priceToPay"[^}]*"displayPrice"\s*:\s*"([^\"]+)"/i,
    /apexPriceToPay[^]*?<span[^>]*class=\"a-offscreen\"[^>]*>\s*([^<]+)\s*<\/span>/i,
  ]);

  const offscreenPrices = extractAllMatches(
    html,
    'class="a-offscreen"[^>]*>\\s*([^<]+)\\s*<\\/span>'
  );

  const crossedOut = extractFirstMatch(html, [
    /class=\"a-price a-text-price[^\"]*\"[^>]*>\s*<span[^>]*>\s*([^<]+)\s*<\/span>/i,
    /id=["']listPrice["'][^>]*>\s*<span[^>]*>\s*([^<]+)\s*<\/span>/i,
  ]);

  const price1 = primaryPrice || offscreenPrices[0] || "";
  const price2 = crossedOut || offscreenPrices[1] || "";

  let off = null;
  if (price1 && price2) {
    const numeric = (value) => Number(value.replace(/[^0-9.]/g, ""));
    const current = numeric(price1);
    const original = numeric(price2);
    if (current && original && original > current) {
      off = Math.round(((original - current) / original) * 100);
    }
  }

  if (off === null) {
    const percentText = extractFirstMatch(html, [/([0-9]{1,3})%\s*off/i]);
    off = percentText ? Number(percentText.replace(/[^0-9]/g, "")) : null;
  }

  return { price1, price2, off };
}

async function fetchItemDetailsByAsin(asin) {
  if (!asin) {
    return null;
  }

  const productUrl = `https://www.amazon.com/dp/${asin}`;
  try {
    const response = await axios.get(productUrl, {
      timeout: 8000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const html = response?.data || "";

    const titleMatch =
      html.match(/<span[^>]*id=["']productTitle["'][^>]*>\s*([^<]+)\s*<\/span>/i) ||
      html.match(/<title>\s*([^<]+)\s*<\/title>/i);
    const imageMatch = html.match(/"large"\s*:\s*"([^\"]+)"/i);
    const { price1, price2, off } = parsePriceDetails(html);

    return {
      asin,
      title: titleMatch ? titleMatch[1].trim() : "",
      price1,
      price2,
      off,
      image: imageMatch ? imageMatch[1] : "",
      url: productUrl,
    };
  } catch (error) {
    console.error(`Failed to fetch product page for ASIN ${asin}: ${error.message}`);
    return {
      asin,
      title: "",
      price1: "",
      price2: "",
      off: null,
      image: "",
      url: productUrl,
    };
  }
}

module.exports = {
  extractAsinFromUrl,
  fetchItemDetailsByAsin,
};
