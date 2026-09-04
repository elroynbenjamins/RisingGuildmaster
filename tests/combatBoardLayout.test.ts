import { describe, it, expect } from "vitest";
import { getCombatTileLayout, getMovementBoundaryEdges, getMovementPathDots } from "../src/ui/combatBoardLayout";
import { getGroundTheme } from "../src/game/combat/grid/ambientGround";

describe("combat board presentation", () => {
  it("keeps all tiles on their logical rows at phone widths and zoom levels", () => {
    for (const [columns, rows] of [[9,7],[11,9],[19,15]]) {
      for (const width of [320,393,412]) for (const zoom of [1,1.35,2]) {
        const boardWidth = width * zoom;
        const boardHeight = boardWidth * rows! / columns!;
        for (let y=0;y<rows!;y++) for(let x=0;x<columns!;x++) {
          const tile = getCombatTileLayout({x,y},columns!,rows!);
          const tileWidth = parseFloat(tile.width)/100*boardWidth;
          const tileHeight = parseFloat(tile.height)/100*boardHeight;
          expect(tile.position).toBe("absolute");
          expect(tileWidth).toBeCloseTo(tileHeight);
          expect(parseFloat(tile.left)/100*boardWidth).toBeCloseTo(x*tileWidth);
          expect(parseFloat(tile.top)/100*boardHeight).toBeCloseTo(y*tileHeight);
        }
      }
    }
  });
  it("draws dots along both segments of a turning path without unit-center dots", () => {
    const dots=getMovementPathDots([{x:0,y:0},{x:1,y:0},{x:1,y:1}],9,7);
    expect(dots).toHaveLength(6);
    expect(parseFloat(dots[0]!.left)).toBeCloseTo(.75*100/9);
    expect(parseFloat(dots[3]!.top)).toBeCloseTo(.75*100/7);
    expect(getMovementPathDots([],9,7)).toEqual([]);
  });
  it("draws yellow movement boundaries only toward unreachable walkable tiles and board edges", () => {
    const reachable = new Set(["0,0", "1,0", "0,1", "1,1"]);
    const blocked = new Set(["2,0"]);
    expect(getMovementBoundaryEdges({x:1,y:0},reachable,blocked,4,3)).toEqual({top:true,right:false,bottom:false,left:false});
    expect(getMovementBoundaryEdges({x:1,y:1},reachable,blocked,4,3)).toEqual({top:false,right:true,bottom:true,left:false});
  });
  it("gives sewer walkways stone instead of cave dirt", () => {
    expect(getGroundTheme("guildhaven_sewer_channels")).toBe("stone");
    expect(getGroundTheme("guildhaven_sewer_cistern")).toBe("stone");
    expect(getGroundTheme("goblin_cave")).toBe("cave");
  });
});
