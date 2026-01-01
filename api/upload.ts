import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, name } = req.body; // Expecting base64 image string
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error('DISCORD_WEBHOOK_URL is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        if (!image) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Convert base64 to Blob/Buffer
        // image format expected: "data:image/png;base64,..."
        const base64Data = image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        const formData = new FormData();
        // We need to append the buffer. In Node's native fetch/FormData, we might need a Blob.
        // Or we can use the buffer directly if supported, but standard FormData expects Blob/File.
        const blob = new Blob([buffer], { type: 'image/png' }); // Defaulting to png or detect from header
        formData.append("file", blob, name || "image.png");

        const response = await fetch(`${webhookUrl}?wait=true`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Discord upload failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.attachments && data.attachments.length > 0) {
            return res.status(200).json({ url: data.attachments[0].url });
        }

        throw new Error("No attachment URL received from Discord");

    } catch (error: any) {
        console.error('Upload Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
