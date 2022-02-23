const name = 'tiled-nes';
const attributeLayerName = "Attribute";
const tileLayerName = "Tile";
const defaultLayerNames = [tileLayerName, attributeLayerName];
const mapPaletteNamePrefix = "Palette ";
const attributeTilesetName = "Palette";
let globalPalette = new Array(16);
let globalPalettePath;
function RGB2Hex(r, g, b) {
    return 0xff << 24 | r << 16 | g << 8 | b << 0;
}
const lookupPaletteToColor = {
    "00": RGB2Hex(84, 84, 84), "01": RGB2Hex(0, 30, 116), "02": RGB2Hex(8, 16, 144), "03": RGB2Hex(48, 0, 136), "04": RGB2Hex(68, 0, 100), "05": RGB2Hex(92, 0, 48), "06": RGB2Hex(84, 4, 0), "07": RGB2Hex(60, 24, 0), "08": RGB2Hex(32, 42, 0), "09": RGB2Hex(8, 58, 0), "0a": RGB2Hex(0, 64, 0), "0b": RGB2Hex(0, 60, 0), "0c": RGB2Hex(0, 50, 60), "0d": RGB2Hex(0, 0, 0), "0e": RGB2Hex(0, 0, 0), "0f": RGB2Hex(0, 0, 0),
    "10": RGB2Hex(152, 150, 152), "11": RGB2Hex(8, 76, 196), "12": RGB2Hex(48, 50, 236), "13": RGB2Hex(92, 30, 228), "14": RGB2Hex(136, 20, 176), "15": RGB2Hex(160, 20, 100), "16": RGB2Hex(152, 34, 32), "17": RGB2Hex(120, 60, 0), "18": RGB2Hex(84, 90, 0), "19": RGB2Hex(40, 114, 0), "1a": RGB2Hex(8, 124, 0), "1b": RGB2Hex(0, 118, 40), "1c": RGB2Hex(0, 102, 120), "1d": RGB2Hex(0, 0, 0), "1e": RGB2Hex(0, 0, 0), "1f": RGB2Hex(0, 0, 0),
    "20": RGB2Hex(236, 238, 236), "21": RGB2Hex(76, 154, 236), "22": RGB2Hex(120, 124, 236), "23": RGB2Hex(176, 98, 236), "24": RGB2Hex(228, 84, 236), "25": RGB2Hex(236, 88, 180), "26": RGB2Hex(236, 106, 100), "27": RGB2Hex(212, 136, 32), "28": RGB2Hex(160, 170, 0), "29": RGB2Hex(116, 196, 0), "2a": RGB2Hex(76, 208, 32), "2b": RGB2Hex(56, 204, 108), "2c": RGB2Hex(56, 180, 204), "2d": RGB2Hex(60, 60, 60), "2e": RGB2Hex(0, 0, 0), "2f": RGB2Hex(0, 0, 0),
    "30": RGB2Hex(236, 238, 236), "31": RGB2Hex(168, 204, 236), "32": RGB2Hex(188, 188, 236), "33": RGB2Hex(212, 178, 236), "34": RGB2Hex(236, 174, 236), "35": RGB2Hex(236, 174, 212), "36": RGB2Hex(236, 180, 176), "37": RGB2Hex(228, 196, 144), "38": RGB2Hex(204, 210, 120), "39": RGB2Hex(180, 222, 120), "3a": RGB2Hex(168, 226, 144), "3b": RGB2Hex(152, 226, 180), "3c": RGB2Hex(160, 214, 228), "3d": RGB2Hex(160, 162, 160), "3e": RGB2Hex(0, 0, 0), "3f": RGB2Hex(0, 0, 0),
};
function paletteToColor(pal) {
    return pal.map(s => lookupPaletteToColor[s.toLowerCase()]);
}
function paletteifyTileset(tileset) {
    let image = new Image(tileset.image);
}
function isValidPalette(pal) {
    if (!pal) {
        return false;
    }
    if (pal.length != 16) {
        return false;
    }
    if (pal.filter(s => lookupPaletteToColor[s] !== undefined).length != 16) {
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
function generateTileForBackground(color) {
    let paletteImage = new Image(8, 8, Image.Format_Indexed8);
    paletteImage.setColorTable(paletteToColor([color]));
    drawFilledSquare(paletteImage, 0, 0, 0, 8);
    return paletteImage;
}
function generateTileFromPalette(pal) {
    const clear = 0;
    let paletteImage = new Image(8, 8, Image.Format_Indexed8);
    tiled.log("plaette: " + pal);
    paletteImage.setColorTable([clear].concat(paletteToColor([pal[1], pal[2], pal[3]])));
    paletteImage.fill(0);
    drawFilledSquare(paletteImage, 1, 2, 6, 2);
    drawFilledSquare(paletteImage, 2, 4, 6, 2);
    drawFilledSquare(paletteImage, 3, 6, 6, 2);
    return paletteImage;
}
function updateTileFromPalette(tile, pal) {
    tile.setImage(generateTileFromPalette(pal));
    for (let j = 1; j < 4; ++j) {
        tile.setProperty("Palette Color " + j, pal[j]);
    }
}
function createPaletteTileset(pal) {
    const tileset = new Tileset();
    tiled.log("adding new tiles");
    const tile = tileset.addTile();
    tile.setProperty("Palette", "bg");
    tile.setImage(generateTileForBackground(pal[0]));
    tile.setProperty("Palette Color", pal[0]);
    for (let i = 0; i < 4; ++i) {
        const tile = tileset.addTile();
        tile.setProperty("Palette", "" + i);
        updateTileFromPalette(tile, pal.slice(i * 4, i * 4 + 4));
    }
    return tileset;
}
function setMapPalette(map, palette) {
    map.setProperty(mapPaletteNamePrefix + "bg", palette[0]);
    map.setProperty(mapPaletteNamePrefix + "0", palette.slice(1, 4).join(","));
    map.setProperty(mapPaletteNamePrefix + "1", palette.slice(5, 8).join(","));
    map.setProperty(mapPaletteNamePrefix + "2", palette.slice(9, 12).join(","));
    map.setProperty(mapPaletteNamePrefix + "3", palette.slice(13, 16).join(","));
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
        if (isValidPalette(palette)) {
            return palette;
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
        const width = parseInt(nss.get("VarSpriteGridX"));
        const height = parseInt(nss.get("VarSpriteGridY"));
        map.setSize(width, height);
        const palettes = [];
        const paletteIdx = parseInt(nss.get("VarPalActive")) - 1;
        const pal = chunk(nss.get("Palette").slice(paletteIdx * 32, (paletteIdx + 1) * 32), 2);
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
                tiled.log(`x: ${x} y: ${y} idx: ${coarseIdx} attr: ${attrtable[coarseIdx]} table: ${palette}`);
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