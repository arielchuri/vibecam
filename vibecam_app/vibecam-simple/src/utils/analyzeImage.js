export async function analyzeImage(base64Image) {
  try {
    // In production, call the Netlify Function
    // In development with netlify dev, it uses /.netlify/functions/analyzeImage
    const response = await fetch('/.netlify/functions/analyzeImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze image');
    }

    return data;

  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
