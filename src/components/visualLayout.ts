export function getIssueTileColumns(width: number): 1 | 2 {
  return width < 360 ? 1 : 2;
}
