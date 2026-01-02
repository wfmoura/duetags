// src/utils/colorUtils.js
import tinycolor from 'tinycolor2';

/**
 * Extracts the dominant color from a base64 image string.
 * Uses a hidden canvas to sample pixels.
 */
export const getDominantColor = (base64) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 50; // Small size for performance
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);

            const imageData = ctx.getImageData(0, 0, 50, 50).data;
            let r = 0, g = 0, b = 0, count = 0;

            // Skip white/near-white pixels as they are usually background
            for (let i = 0; i < imageData.length; i += 4) {
                const pr = imageData[i];
                const pg = imageData[i + 1];
                const pb = imageData[i + 2];
                const pa = imageData[i + 3];

                if (pa > 0 && (pr < 240 || pg < 240 || pb < 240)) {
                    r += pr;
                    g += pg;
                    b += pb;
                    count++;
                }
            }

            if (count === 0) {
                resolve('#4A90E2'); // Fallback blue
                return;
            }

            const hex = tinycolor({ r: r / count, g: g / count, b: b / count }).toHexString();
            resolve(hex);
        };
        img.onerror = () => resolve('#4A90E2');
        img.src = base64;
    });
};

/**
 * Suggests background and text colors based on a dominant character color.
 */
export const suggestColorsForTheme = (dominantColor) => {
    const color = tinycolor(dominantColor);
    const isDark = color.isDark();

    // Text Color: Start with dominant color
    let textColor = color.toHexString();

    // If it's a very light color, it won't be legible as text
    if (color.getBrightness() > 180) {
        textColor = color.clone().darken(40).toHexString();
    } else if (color.getBrightness() < 50) {
        // If it's too dark, maybe it's too harsh? Keep it but we'll check contrast
    }

    // Background Color: Tone-on-tone approach using mix with white
    // Changed from 92% to 78% to make it significantly darker/more vibrant
    let backgroundTiny = tinycolor.mix(color, "#FFFFFF", 78);

    // Saturation Safeguard: Ensure the tint isn't too "dead"
    if (color.toHsl().s > 0.1 && backgroundTiny.toHsl().s < 0.08) {
        backgroundTiny = backgroundTiny.saturate(15);
    }

    // Brightness Safeguard: Ensure it's not perceived as pure white
    if (backgroundTiny.getBrightness() > 248) {
        backgroundTiny = backgroundTiny.darken(3);
    }

    let backgroundColor = backgroundTiny.toHexString();

    // Final sanity check: Contrast
    // We want at least a 4.5:1 ratio for accessibility (AA)
    if (!tinycolor.isReadable(backgroundColor, textColor, { level: "AA", size: "small" })) {
        // If not readable, darken text or lighten background (rare with 92% mix)
        textColor = tinycolor(textColor).darken(20).toHexString();
    }

    return { backgroundColor, textColor };
};

/**
 * Converts a hex color to CMYK.
 */
export const hexToCmyk = (hex) => {
    let r, g, b;
    if (hex.startsWith('#')) {
        r = parseInt(hex.slice(1, 3), 16) / 255;
        g = parseInt(hex.slice(3, 5), 16) / 255;
        b = parseInt(hex.slice(5, 7), 16) / 255;
    } else {
        const color = tinycolor(hex).toRgb();
        r = color.r / 255;
        g = color.g / 255;
        b = color.b / 255;
    }

    let k = Math.min(1 - r, 1 - g, 1 - b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

    let c = Math.round(((1 - r - k) / (1 - k)) * 100);
    let m = Math.round(((1 - g - k) / (1 - k)) * 100);
    let y = Math.round(((1 - b - k) / (1 - k)) * 100);
    k = Math.round(k * 100);

    return { c, m, y, k };
};

/**
 * Converts a hex color to RGB object.
 */
export const hexToRgb = (hex) => {
    const color = tinycolor(hex).toRgb();
    return { r: color.r, g: color.g, b: color.b };
};
export { tinycolor };
