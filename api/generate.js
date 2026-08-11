export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, targetAudience, contentGoal, tone, affiliateLink, threadCount = 5 } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key belum diatur di Vercel.' });
  }

  const promptText = `Kamu adalah pakar Copywriter dan Content Creator media sosial. 
Buatlah sebuah thread/utas media sosial yang menarik, bernarasi, dan mudah dibaca berdasarkan parameter berikut:
- Topik: ${topic}
- Target Pembaca: ${targetAudience}
- Tujuan Konten: ${contentGoal}
- Nada/Emosi: ${tone}
${affiliateLink ? `- Link Afiliasi: ${affiliateLink} (Sematkan link ini secara alami di bagian akhir atau poin rekomendasi yang relevan)` : ''}

Ketentuan Format:
1. Wajib membagi utas menjadi TEPAT ${threadCount} post/tweet terpisah, beri nomor secara berurutan (misal: 1/${threadCount}, 2/${threadCount}, dst).
2. Gunakan kalimat pembuka (hook) yang memancing rasa penasaran di postingan 1.
3. Gunakan bahasa yang natural dan sesuai dengan nada yang diminta.
4. Sertakan Call to Action (CTA) di bagian akhir pada postingan terakhir.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(response.status).json({ error: data.error?.message || 'Gagal memproses ke AI.' });
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ result: generatedText });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}