export async function generateMusic(analysisData) {
  const apiKey = import.meta.env.VITE_FREESOUND_API_KEY;
  const query = analysisData.soundQuery || "ambient texture loop";
  
  // Clean up the query (Freesound works best with space-separated tags)
  const cleanedQuery = query.toLowerCase().replace(/[^a-z0-9 ]/g, '');

  console.log(`Searching Freesound for: "${cleanedQuery}"`);

  // Search parameters: 
  // - filter for mp3 previews
  // - sort by relevancy
  // - fields: name, username, previews (the high-quality mp3 clip)
  const searchUrl = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(cleanedQuery)}&token=${apiKey}&fields=name,username,previews,id,duration&filter=duration:[20 TO 300]&sort=score&page_size=5`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Pick the first result that has a high-quality mp3 preview
      const bestMatch = data.results[0];
      const audioUrl = bestMatch.previews['preview-hq-mp3'];

      console.log(`Freesound match found: "${bestMatch.name}" by ${bestMatch.username}`);

      return {
        success: true,
        audioUrl: audioUrl,
        soundName: bestMatch.name,
        creator: bestMatch.username,
        isFreesound: true
      };
    } else {
      // If no results, try a broader search for "ambient texture"
      console.warn("No results for specific query. Using broad fallback.");
      return await fallbackSearch(apiKey);
    }
  } catch (error) {
    console.error("Freesound API Error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function fallbackSearch(apiKey) {
  const fallbackUrl = `https://freesound.org/apiv2/search/text/?query=ambient texture loop&token=${apiKey}&fields=name,username,previews,duration&filter=duration:[20 TO 100]&page_size=1`;
  try {
    const response = await fetch(fallbackUrl);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const match = data.results[0];
      return {
        success: true,
        audioUrl: match.previews['preview-hq-mp3'],
        soundName: match.name,
        creator: match.username
      };
    }
    throw new Error("Completely failed to find any sounds.");
  } catch (err) {
    return { success: false, error: err.message };
  }
}
