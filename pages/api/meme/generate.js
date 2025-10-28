import sharp from 'sharp';
import { query } from '../../../lib/db';
import { getWalletFromRequest } from '../../../lib/auth';
import { withRateLimit, memeRateLimit } from '../../../lib/rateLimit';

/**
 * Simple meme generator using sharp.js
 * Creates image with text overlay (top/bottom text format)
 * Kept under 100 LOC as requested
 */

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wallet = getWalletFromRequest(req);
  if (!wallet) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { battleId, topText = '', bottomText = '', template = 'default' } = req.body;

  if (!topText && !bottomText) {
    return res.status(400).json({ error: 'At least one text line required' });
  }

  try {
    // Create base image (1080x1080 gradient)
    const width = 1080;
    const height = 1080;

    const svgImage = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#14F195;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)"/>
        ${topText ? `<text x="50%" y="15%" font-family="Arial Black" font-size="80" font-weight="bold" fill="white" stroke="black" stroke-width="3" text-anchor="middle">${escapeXml(topText.toUpperCase())}</text>` : ''}
        ${bottomText ? `<text x="50%" y="90%" font-family="Arial Black" font-size="80" font-weight="bold" fill="white" stroke="black" stroke-width="3" text-anchor="middle">${escapeXml(bottomText.toUpperCase())}</text>` : ''}
      </svg>
    `;

    const imageBuffer = await sharp(Buffer.from(svgImage))
      .png()
      .toBuffer();

    // For MVP, return base64 encoded image
    // In production, upload to Cloudinary/S3 and return URL
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    // Optionally save to database
    if (battleId) {
      await query(
        `INSERT INTO clips (wallet, battle_id, type, storage_url)
         VALUES ($1, $2, $3, $4)`,
        [wallet, battleId, 'image', dataUrl.substring(0, 255)] // Truncate for storage
      );
    }

    return res.status(200).json({
      success: true,
      imageUrl: dataUrl,
      shareText: `${topText} ${bottomText} | MemeBattles`,
    });
  } catch (error) {
    console.error('Meme generation error:', error);
    return res.status(500).json({ error: 'Failed to generate meme' });
  }
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default withRateLimit(handler, memeRateLimit);
