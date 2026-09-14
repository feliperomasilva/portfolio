// Funções matemáticas puras compartilhadas.

// Interpolação linear: mistura start -> end conforme amount (0 a 1).
// Mantida para futuros efeitos de perseguição/suavização (ex: cursor, parallax com inércia).
export const lerp = (start, end, amount) => start + (end - start) * amount;
