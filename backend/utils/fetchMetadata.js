const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetches the title of a webpage from its URL
 * @param {string} url - The URL to fetch metadata from
 * @returns {Promise<string|null>} - The page title or null if not found
 */
const fetchPageTitle = async (url) => {
  try {
    // Ensure URL has protocol
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }

    const response = await axios.get(fullUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Try to get title from various sources
    let title = $('title').first().text().trim();
    
    if (!title) {
      title = $('meta[property="og:title"]').attr('content');
    }
    
    if (!title) {
      title = $('meta[name="title"]').attr('content');
    }

    return title || null;
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error.message);
    return null;
  }
};

module.exports = { fetchPageTitle };
