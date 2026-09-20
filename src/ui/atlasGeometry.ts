export interface AtlasCropGeometry {
  contentSize: number;
  imageWidth: number;
  imageHeight: number;
  left: number;
  top: number;
}

export interface AtlasSourceRect { x: number; y: number; width: number; height: number }

/** Calculates a square cover crop for atlases whose generated cells are not evenly spaced. */
export function getAtlasSourceRectGeometry({ size, borderWidth, sourceWidth, sourceHeight, rect }: {
  size: number;
  borderWidth: number;
  sourceWidth: number;
  sourceHeight: number;
  rect: AtlasSourceRect;
}): AtlasCropGeometry {
  const contentSize = Math.max(1, size - borderWidth * 2);
  const scale = Math.max(contentSize / rect.width, contentSize / rect.height);
  const scaledCellWidth = rect.width * scale;
  const scaledCellHeight = rect.height * scale;
  return {
    contentSize,
    imageWidth: sourceWidth * scale,
    imageHeight: sourceHeight * scale,
    left: -rect.x * scale - (scaledCellWidth - contentSize) / 2,
    top: -rect.y * scale - (scaledCellHeight - contentSize) / 2,
  };
}

/**
 * Calculates a centered, border-aware square crop from a regular atlas.
 *
 * `sourceCellAspectRatio` is the native width / height of one atlas cell.
 * Landscape and portrait cells are both scaled with `cover`, so neither is
 * stretched merely because the UI frame is square.
 */
export function getAtlasCropGeometry({ size, borderWidth, columns, rows, column, row, sourceCellAspectRatio = 1 }: {
  size: number;
  borderWidth: number;
  columns: number;
  rows: number;
  column: number;
  row: number;
  sourceCellAspectRatio?: number;
}): AtlasCropGeometry {
  const contentSize = Math.max(1, size - borderWidth * 2);
  const sourceCellWidth = contentSize * Math.max(1, sourceCellAspectRatio);
  const sourceCellHeight = contentSize * Math.max(1, 1 / sourceCellAspectRatio);
  return {
    contentSize,
    imageWidth: sourceCellWidth * columns,
    imageHeight: sourceCellHeight * rows,
    left: -column * sourceCellWidth - (sourceCellWidth - contentSize) / 2,
    top: -row * sourceCellHeight - (sourceCellHeight - contentSize) / 2,
  };
}
