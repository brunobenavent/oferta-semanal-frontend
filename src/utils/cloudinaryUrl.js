// Añade transformaciones a URLs raw de Cloudinary según el contexto
// URL raw:    .../upload/v1/oferta-semanal/XXXXX.jpg
// URL medium: .../upload/c_scale,q_auto,w_800/v1/oferta-semanal/XXXXX.jpg

const SIZES = {
  medium: 'c_scale,q_auto,w_800',
  small: 'c_scale,q_auto,w_400',
  real: '',
};

export function getCloudinaryUrl(url, size = 'real') {
  if (!url) return url;
  const transformation = SIZES[size];
  if (!transformation) return url;
  return url.replace('/upload/', `/upload/${transformation}/`);
}
