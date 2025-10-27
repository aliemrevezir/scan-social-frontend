interface BrandTileProps {
  name: string;
  logoUrl: string;
}

export function BrandTile({ name, logoUrl }: BrandTileProps) {
  return (
    <div
      className="logo-tile"
      role="img"
      aria-label={`${name} logo`}
      style={{
        backgroundImage: `url(${logoUrl})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
      }}
    />
  );
}
