/**
 * Menages text scaling logic for labels.
 * Standardizes dimensions to raw CM values for consistency between preview and validation.
 */

export const calculateFontSize = (text, maxWidthCm, maxHeightCm, campo, maxFontSize, fontSizeScale = 1, escalaExtraFonte = 1, tipo = 'retangular', minFontSizeNome) => {
    const minSizePx = 10;
    const maxWidthPx = maxWidthCm * 37.8;
    const maxHeightPx = maxHeightCm * 37.8;

    const isMini = maxWidthCm < 3.0;
    const isSmallArea = isMini || maxHeightCm <= 1.1; // Includes Pequena and Mini

    const charWidthRatio = isSmallArea ? 0.44 : 0.52;

    let fieldMaxFontSize = maxFontSize;

    if (!fieldMaxFontSize) {
        if (campo === 'nome') fieldMaxFontSize = 44;
        else if (campo === 'complemento') fieldMaxFontSize = 32;
        else if (campo === 'turma') fieldMaxFontSize = 24;
        else fieldMaxFontSize = 40;
    }

    const effectiveLength = Math.max(1, text.length);

    const margin = isMini ? 1.0 : (tipo === 'redonda' ? 0.9 : (isSmallArea ? 0.97 : 0.94));
    const safeMaxWidth = maxWidthPx * margin;

    let currentFontSize = fieldMaxFontSize;
    let estimatedWidth = effectiveLength * currentFontSize * charWidthRatio;

    if (estimatedWidth > safeMaxWidth) {
        currentFontSize = safeMaxWidth / (effectiveLength * charWidthRatio);
    }

    const heightMargin = isMini ? 1.0 : (tipo === 'redonda' ? 0.9 : (isSmallArea ? 0.94 : 0.88));
    currentFontSize = Math.min(currentFontSize, maxHeightPx * heightMargin);

    let finalSize = currentFontSize * fontSizeScale * escalaExtraFonte;

    // Respect min_font_size_nome if provided for the 'nome' field
    if (campo === 'nome' && minFontSizeNome) {
        const minAllowed = parseFloat(minFontSizeNome) * fontSizeScale;
        if (finalSize < minAllowed) {
            return {
                fontSize: minAllowed,
                shouldWrap: true
            };
        }
    }

    return {
        fontSize: Math.min(Math.max(finalSize, minSizePx), fieldMaxFontSize * fontSizeScale * escalaExtraFonte),
        shouldWrap: false
    };
};
