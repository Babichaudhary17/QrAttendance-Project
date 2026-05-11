// The original QR icon used on the LoginPage
export function QRIcon({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="5"  y="5"  width="35" height="35" rx="4" stroke="currentColor" strokeWidth="6" fill="none"/>
      <rect x="15" y="15" width="15" height="15" rx="1" fill="currentColor"/>
      <rect x="60" y="5"  width="35" height="35" rx="4" stroke="currentColor" strokeWidth="6" fill="none"/>
      <rect x="70" y="15" width="15" height="15" rx="1" fill="currentColor"/>
      <rect x="5"  y="60" width="35" height="35" rx="4" stroke="currentColor" strokeWidth="6" fill="none"/>
      <rect x="15" y="70" width="15" height="15" rx="1" fill="currentColor"/>
      <rect x="60" y="60" width="10" height="10" rx="1" fill="currentColor"/>
      <rect x="75" y="60" width="10" height="10" rx="1" fill="currentColor"/>
      <rect x="60" y="75" width="10" height="10" rx="1" fill="currentColor"/>
      <rect x="75" y="75" width="20" height="20" rx="1" fill="currentColor"/>
    </svg>
  );
}

// Coloured QR visual used on dashboards
export function QRVisual({ size = 80, color = "#06b6d4" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="4"  y="4"  width="38" height="38" rx="5" stroke={color} strokeWidth="5" fill="none"/>
      <rect x="14" y="14" width="18" height="18" rx="2" fill={color}/>
      <rect x="58" y="4"  width="38" height="38" rx="5" stroke={color} strokeWidth="5" fill="none"/>
      <rect x="68" y="14" width="18" height="18" rx="2" fill={color}/>
      <rect x="4"  y="58" width="38" height="38" rx="5" stroke={color} strokeWidth="5" fill="none"/>
      <rect x="14" y="68" width="18" height="18" rx="2" fill={color}/>
      <rect x="58" y="58" width="16" height="16" rx="2" fill={color}/>
      <rect x="80" y="58" width="16" height="16" rx="2" fill={color}/>
      <rect x="58" y="80" width="16" height="16" rx="2" fill={color}/>
      <rect x="80" y="80" width="16" height="16" rx="2" fill={color}/>
    </svg>
  );
}
