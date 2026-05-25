export function getCategoryIcon(nombre = '', size = 16) {
  const n = nombre.toLowerCase()
  const sw = size <= 20 ? '1.5' : '1.2'
  const s = size

  if (n.includes('procesador') || n.includes('cpu')) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}">
      <rect x="7" y="7" width="10" height="10" rx="1"/>
      <path d="M9 7V4M12 7V4M15 7V4M9 17v3M12 17v3M15 17v3M7 9H4M7 12H4M7 15H4M17 9h3M17 12h3M17 15h3"/>
    </svg>`
  }
  if (n.includes('tarjeta') || n.includes('video') || n.includes('gpu')) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}">
      <rect x="2" y="7" width="20" height="10" rx="1"/>
      <circle cx="11" cy="12" r="2.5"/>
      <path d="M6 17v3M9 17v3M5 7V5M8 7V5M11 7V5M14 7V5M17 7V5"/>
    </svg>`
  }
  if (n.includes('placa') || n.includes('madre') || n.includes('motherboard')) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}">
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <rect x="6" y="6" width="5" height="5" rx="0.5"/>
      <rect x="13" y="6" width="5" height="5" rx="0.5"/>
      <path d="M6 15h12M6 18h7"/>
    </svg>`
  }
  if (n.includes('memoria') || n.includes('ram')) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}">
      <rect x="3" y="8" width="8" height="11" rx="0.5"/>
      <rect x="13" y="8" width="8" height="11" rx="0.5"/>
      <path d="M5 8V5M7 8V5M9 8V5M15 8V5M17 8V5M19 8V5"/>
    </svg>`
  }
  if (n.includes('almacenamiento') || n.includes('ssd') || n.includes('hdd') || n.includes('disco')) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}">
      <rect x="3" y="8" width="18" height="8" rx="1"/>
      <circle cx="17" cy="12" r="1.5"/>
      <path d="M6 12h6"/>
    </svg>`
  }
  if (n.includes('fuente') || n.includes('alimentaci') || n.includes('psu')) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}">
      <rect x="3" y="6" width="18" height="12" rx="1"/>
      <circle cx="8" cy="12" r="2.5"/>
      <path d="M14 9h5M14 12h5M14 15h5"/>
    </svg>`
  }
  if (n.includes('gabinete') || n.includes('case') || n.includes('torre')) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}">
      <rect x="5" y="2" width="14" height="20" rx="1"/>
      <circle cx="12" cy="7" r="1.5"/>
      <rect x="9" y="11" width="6" height="3" rx="0.5"/>
      <path d="M9 17h6"/>
    </svg>`
  }
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>`
}
