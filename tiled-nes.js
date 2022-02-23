const name = 'tiled-nes';
const attributeLayerName = "Attribute";
const tileLayerName = "Tile";
const defaultLayerNames = [tileLayerName, attributeLayerName];
const mapPaletteNamePrefix = "Palette ";
const attributeTilesetName = "Palette";
let globalPalette = new Array(16);
let globalPalettePath;
function num2Hexstr(num) {
    return ("0" + num.toString(16)).slice(-2);
}
function RGB2Hex(rgb) {
    return 0xff << 24 | rgb[0] << 16 | rgb[1] << 8 | rgb[2] << 0;
}
const basePaletteColors = [
    [84, 84, 84], [0, 30, 116], [8, 16, 144], [48, 0, 136], [68, 0, 100], [92, 0, 48], [84, 4, 0], [60, 24, 0], [32, 42, 0], [8, 58, 0], [0, 64, 0], [0, 60, 0], [0, 50, 60], [0, 0, 0], [0, 0, 0], [0, 0, 0],
    [152, 150, 152], [8, 76, 196], [48, 50, 236], [92, 30, 228], [136, 20, 176], [160, 20, 100], [152, 34, 32], [120, 60, 0], [84, 90, 0], [40, 114, 0], [8, 124, 0], [0, 118, 40], [0, 102, 120], [0, 0, 0], [0, 0, 0], [0, 0, 0],
    [236, 238, 236], [76, 154, 236], [120, 124, 236], [176, 98, 236], [228, 84, 236], [236, 88, 180], [236, 106, 100], [212, 136, 32], [160, 170, 0], [116, 196, 0], [76, 208, 32], [56, 204, 108], [56, 180, 204], [60, 60, 60], [0, 0, 0], [0, 0, 0],
    [236, 238, 236], [168, 204, 236], [188, 188, 236], [212, 178, 236], [236, 174, 236], [236, 174, 212], [236, 180, 176], [228, 196, 144], [204, 210, 120], [180, 222, 120], [168, 226, 144], [152, 226, 180], [160, 214, 228], [160, 162, 160], [0, 0, 0], [0, 0, 0],
];
const emphasisMultiplier = [
    [100.0, 100.0, 100.0],
    [74.3, 91.5, 123.9],
    [88.2, 108.6, 79.4],
    [65.3, 98.0, 101.9],
    [127.7, 102.6, 90.5],
    [97.9, 90.8, 102.3],
    [100.1, 98.7, 74.1],
    [75.0, 75.0, 75.0],
];
class Emphasis {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    get() {
        return (this.r ? 1 : 0) << 2 | (this.g ? 1 : 0) << 1 | (this.b ? 1 : 0);
    }
    ;
}
;
function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
function RGB2HexWithEmphasis(rgb, emp) {
    const em = emphasisMultiplier[emp.get()];
    return RGB2Hex(rgb.map((c, i) => clamp(Math.floor(c * (em[i] / 100.0)), 0, 255)));
}
function GetColor(idx, em) {
    return lookupPaletteToColor[em.get()][idx];
}
const lookupPaletteToColor = [
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(false, false, false))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(false, false, true))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(false, true, false))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(false, true, true))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(true, false, false))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(true, false, true))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(true, true, false))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(true, true, true))),
];
function paletteToColor(pal) {
    return pal.p.map(n => lookupPaletteToColor[pal.em.get()][n]);
}
function paletteifyTileset(tileset) {
    let image = new Image(tileset.image);
}
function isValidPalette(pal) {
    if (!pal.p) {
        return false;
    }
    if (pal.p.length != 16) {
        return false;
    }
    if (pal.p.filter(s => lookupPaletteToColor[s] !== undefined).length != 16) {
        return false;
    }
    return true;
}
function chunk(str, size) {
    return str.match(new RegExp('.{1,' + size + '}', 'g'));
}
function hexstrToBytes(str) {
    const bytes = chunk(str, 2).map(s => parseInt(s, 16));
    return new Uint8Array(bytes);
}
function hex2Num(strs) {
    return strs.map(s => parseInt(s, 16));
}
function tilesetLoaded(tileset) {
    tiled.log("Loading tileset");
}
function drawFilledSquare(im, index, x, y, size) {
    for (let i = x; i < x + size; ++i) {
        for (let j = y; j < y + size; ++j) {
            im.setPixel(i, j, index);
        }
    }
}
function generateTileForBackground(pal) {
    let paletteImage = new Image(8, 8, Image.Format_Indexed8);
    paletteImage.setColorTable(paletteToColor(pal));
    drawFilledSquare(paletteImage, 0, 0, 0, 8);
    return paletteImage;
}
function generateTileFromPalette(pal) {
    const clear = 0;
    let paletteImage = new Image(8, 8, Image.Format_Indexed8);
    tiled.log("plaette: " + pal);
    paletteImage.setColorTable([clear].concat(paletteToColor(pal)));
    paletteImage.fill(0);
    drawFilledSquare(paletteImage, 1, 2, 6, 2);
    drawFilledSquare(paletteImage, 2, 4, 6, 2);
    drawFilledSquare(paletteImage, 3, 6, 6, 2);
    return paletteImage;
}
function updateTileFromPalette(tile, pal) {
    tile.setImage(generateTileFromPalette(pal));
    for (let j = 1; j < 4; ++j) {
        tile.setProperty("Palette Color " + j, num2Hexstr(pal.p[j]));
    }
}
function createPaletteTileset(pal) {
    const tileset = new Tileset();
    tiled.log("adding new tiles");
    const tile = tileset.addTile();
    tile.setProperty("Palette", "bg");
    tile.setImage(generateTileForBackground({ p: [pal.p[0]], em: pal.em }));
    tile.setProperty("Palette Color", num2Hexstr(pal.p[0]));
    for (let i = 0; i < 4; ++i) {
        const tile = tileset.addTile();
        tile.setProperty("Palette", "" + i);
        updateTileFromPalette(tile, { p: pal.p.slice(i * 4, i * 4 + 4), em: pal.em });
    }
    return tileset;
}
function setMapPalette(map, palette) {
    map.setProperty(mapPaletteNamePrefix + "bg", palette.p[0] + "");
    map.setProperty(mapPaletteNamePrefix + "0", palette.p.slice(1, 4).map(num2Hexstr).join(","));
    map.setProperty(mapPaletteNamePrefix + "1", palette.p.slice(5, 8).map(num2Hexstr).join(","));
    map.setProperty(mapPaletteNamePrefix + "2", palette.p.slice(9, 12).map(num2Hexstr).join(","));
    map.setProperty(mapPaletteNamePrefix + "3", palette.p.slice(13, 16).map(num2Hexstr).join(","));
    map.setProperty("Emphasize Red", palette.em.r);
    map.setProperty("Emphasize Green", palette.em.g);
    map.setProperty("Emphasize Blue", palette.em.b);
}
function getMapPalette(map) {
    const propBg = map.property(mapPaletteNamePrefix + "bg");
    const prop0 = map.property(mapPaletteNamePrefix + "0");
    const prop1 = map.property(mapPaletteNamePrefix + "1");
    const prop2 = map.property(mapPaletteNamePrefix + "2");
    const prop3 = map.property(mapPaletteNamePrefix + "3");
    if (propBg && prop0 && prop1 && prop2 && prop3) {
        const palette = new Array(16);
        palette[0] = palette[4] = palette[8] = palette[12] = propBg.toString();
        palette.splice(1, 3, ...prop0.toString().split(","));
        palette.splice(5, 3, ...prop1.toString().split(","));
        palette.splice(9, 3, ...prop2.toString().split(","));
        palette.splice(13, 3, ...prop3.toString().split(","));
        const emR = map.property("Emphasize Red");
        const emG = map.property("Emphasize Green");
        const emB = map.property("Emphasize Blue");
        const pal = { p: hex2Num(palette), em: new Emphasis(emR, emG, emB) };
        if (isValidPalette(pal)) {
            return pal;
        }
    }
    return undefined;
}
function mapRegionEdited(map, layer, r) {
    if (layer.name == attributeLayerName) {
        for (let rect of r.rects) {
        }
    }
}
function getLayerIfExists(map, name) {
    let layer = map.layers.find(lay => lay.name == name);
    if (layer && layer.isTileLayer)
        return layer;
    return undefined;
}
function isMapDirty(map) {
    for (let layer of defaultLayerNames) {
        if (!getLayerIfExists(map, layer)) {
            tiled.log("Missing layer " + layer + ". Recreating the NES defaults");
            return true;
        }
    }
    tiled.log("checking is valid palette from map");
    if (!isValidPalette(getMapPalette(map))) {
        return true;
    }
    return false;
}
function unRLE(d) {
    let buffer = "";
    let current = "";
    let i = 0;
    while (i < d.length) {
        if (d[i] === "[") {
            ++i;
            const nextI = d.indexOf("]", i);
            const rle = parseInt(d.slice(i, nextI), 16) - 1;
            buffer += current.repeat(rle);
            i = nextI + 1;
        }
        else {
            current = d.slice(i, i + 2);
            buffer += current;
            i += 2;
        }
    }
    return buffer;
}
function createImageFromCHR(buffer, palette, paletteIdx) {
    const tileCount = buffer.byteLength / 16;
    const pixelsPerTile = 8;
    const tilesPerRow = 16;
    const tileColumns = tileCount / tilesPerRow;
    const im = new Image(pixelsPerTile * tilesPerRow, pixelsPerTile * tileColumns, Image.Format_Indexed8);
    im.setColorTable(paletteToColor(palette));
    const view = new Uint8Array(buffer);
    for (let n = 0; n < tileCount; ++n) {
        const offset = n * 16;
        const x = (n % 16) * 8;
        const y = Math.floor(n / 16) * 8;
        for (let j = 0; j < 8; ++j) {
            const plane0 = view[offset + j];
            const plane1 = view[offset + j + 8];
            for (let i = 0; i < 8; ++i) {
                const pixelbit = 7 - i;
                const bit0 = (plane0 >> pixelbit) & 1;
                const bit1 = ((plane1 >> pixelbit) & 1) << 1;
                const color = (bit0 | bit1) + (paletteIdx * 4);
                im.setPixel(x + i, y + j, color);
            }
        }
    }
    return im;
}
function createTilesetFromCHR(buffer, palette, paletteIdx) {
    const tileset = new Tileset();
    tileset.setTileSize(8, 8);
    const im = createImageFromCHR(buffer, palette, paletteIdx);
    tileset.loadFromImage(im);
    tileset.setProperty("isCHRTileset", true);
    return tileset;
}
tiled.registerMapFormat("nexxt", {
    name: "NEXXT Session",
    extension: "nss",
    read: (filename) => {
        const file = new TextFile(filename, TextFile.ReadOnly);
        const nss = new Map(file.readAll().split("\n").filter(s => s.includes("=")).map(s => s.split("=")).map(s => [s[0], s[1]]));
        const map = new TileMap();
        map.setTileSize(8, 8);
        const width = parseInt(nss.get("VarNameW"));
        const height = parseInt(nss.get("VarNameH"));
        map.setSize(width, height);
        const palettes = [];
        const palnum = hex2Num(chunk(unRLE(nss.get("Palette")).slice(0, 32), 2));
        const ppuMask = parseInt(nss.get("VarPPUMask"), 10);
        const em = new Emphasis((ppuMask & (1 << 7)) > 0, (ppuMask & (1 << 6)) > 0, (ppuMask & (1 << 5)) > 0);
        const pal = { p: palnum, em: em };
        setMapPalette(map, pal);
        const paletteTileset = createPaletteTileset(pal);
        paletteTileset.name = "Palette";
        map.addTileset(paletteTileset);
        const chrBuffer = hexstrToBytes(unRLE(nss.get("CHRMain")));
        const chrs = [];
        for (let i = 0; i < 4; ++i) {
            const chr = createTilesetFromCHR(chrBuffer, pal, i);
            chr.name = `CHR (Pal ${i + 1})`;
            chrs.push(chr);
            map.addTileset(chr);
        }
        const attrtable = new Uint8Array(hexstrToBytes(unRLE(nss.get("AttrTable"))));
        const attrs = Array.from(Array(height), () => new Array(width));
        const attrLayer = new TileLayer("Attribute");
        const attrEdit = attrLayer.edit();
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const coarseIdx = Math.floor(Math.floor(y / 4) * (width / 4) + x / 4);
                const xshift = ((x % 4) < 2) ? 0 : 2;
                const yshift = ((y % 4) < 2) ? 0 : 4;
                const mask = 0b11 << (xshift + yshift);
                const palette = (attrtable[coarseIdx] & mask) >> (xshift + yshift);
                attrs[y][x] = palette;
                attrEdit.setTile(x, y, paletteTileset.tile(palette + 1));
            }
        }
        attrEdit.apply();
        const nmt = unRLE(nss.get("NameTable"));
        const bgLayer = new TileLayer("Background");
        const bgEdit = bgLayer.edit();
        const tiles = chunk(nmt, 2).map(s => parseInt(s, 16));
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const idx = tiles[y * width + x];
                const attr = attrs[y][x];
                bgEdit.setTile(x, y, chrs[attr].tile(idx));
            }
        }
        bgEdit.apply();
        map.addLayer(bgLayer);
        map.addLayer(attrLayer);
        return map;
    }
});
for (let i = 0; i < 4; ++i) {
    const action = tiled.registerAction("Palette" + i, (action) => {
        action.id;
    });
    action.enabled = true;
    action.text = "Color with Palette " + i;
    action.checkable = true;
    action.iconVisibleInMenu = false;
    action.shortcut = "Shift+" + (i + 1);
}
tiled.extendMenu("Map", [
    { action: "Palette0", before: "MapProperties" },
    { action: "Palette1" },
    { action: "Palette2" },
    { action: "Palette3" },
    { separator: true },
]);
//# sourceMappingURL=tiled-nes.js.map