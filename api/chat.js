export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const { message } = JSON.parse(req.body);
    const apiKey = process.env.OPENAI_API_KEY;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await aiRes.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
