const name = 'tiled-nes';
const attributeLayerName = "Attribute";
const tileLayerName = "Tile";
const defaultLayerNames = [tileLayerName, attributeLayerName];
const mapPaletteNamePrefix = "Palette ";
const attributeTilesetName = "Palette";
let globalPalette = new Array(16);
let globalPalettePath;
let globalCHRCache = {};
const defaultPalette = [
    "19", "27", "16", "0f",
    "19", "20", "28", "0f",
    "19", "3a", "1b", "0f",
    "19", "30", "11", "0f",
];
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
    if (pal.filter(s => 0x00 <= parseInt(s, 16) && parseInt(s, 16) <= 0x3f).length != 16) {
        return false;
    }
    return true;
}
function tilesetLoaded(tileset) {
    tiled.log("Loading tileset");
}
function initMapLayers(map) {
    let tileLayer = getLayerIfExists(map, tileLayerName);
    if (!tileLayer || !tileLayer.isTileLayer) {
        tiled.log("Map doesn't have " + tileLayerName + " layer. Adding now");
        tileLayer = new TileLayer(tileLayerName);
        map.addLayer(tileLayer);
    }
    let attributeLayer = getLayerIfExists(map, attributeLayerName);
    if (!attributeLayer || !attributeLayer.isTileLayer) {
        tiled.log("Map doesn't have " + attributeLayerName + " layer. Adding now");
        attributeLayer = new TileLayer(attributeLayerName);
        const atl = attributeLayer;
        map.addLayer(atl);
        atl.locked = true;
        atl.visible = false;
        const attrtiles = map.tilesets.find(ts => ts.name == attributeTilesetName);
        const defaultPaletteTile = attrtiles.tiles.find(tile => tile.resolvedProperty("Palette").toString() == "0");
        const editor = atl.edit();
        for (let w = 0; w < atl.width; ++w) {
            for (let h = 0; h < atl.height; ++h) {
                editor.setTile(w, h, defaultPaletteTile);
            }
        }
        editor.apply();
    }
    let width = attributeLayer.resolvedProperty("AttributeWidth");
    if (!width || !(parseInt(width.toString()))) {
        attributeLayer.setProperty("AttributeWidth", 16);
    }
    let height = attributeLayer.resolvedProperty("AttributeHeight");
    if (!height || !(parseInt(height.toString()))) {
        attributeLayer.setProperty("AttributeHeight", 16);
    }
    let offsetX = attributeLayer.resolvedProperty("AttributeOffsetX");
    if (!offsetX || !(parseInt(offsetX.toString()))) {
        attributeLayer.setProperty("AttributeOffsetX", 0);
    }
    let offsetY = attributeLayer.resolvedProperty("AttributeOffsetY");
    if (!offsetY || !(parseInt(offsetY.toString()))) {
        attributeLayer.setProperty("AttributeOffsetY", 0);
    }
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
function createAttributeTileset(pal) {
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
function createOrUpdateMapPalette(map) {
    const tileset = map.tilesets.find(ts => ts.name == attributeTilesetName);
    if (!tileset) {
        tiled.log("Tileset missing, creating new one");
        const globalPalette = createAttributeTileset(defaultPalette);
        globalPalette.name = attributeTilesetName;
        map.setProperty(mapPaletteNamePrefix + "bg", defaultPalette[0]);
        map.setProperty(mapPaletteNamePrefix + "0", defaultPalette.slice(1, 4).join(","));
        map.setProperty(mapPaletteNamePrefix + "1", defaultPalette.slice(5, 8).join(","));
        map.setProperty(mapPaletteNamePrefix + "2", defaultPalette.slice(9, 12).join(","));
        map.setProperty(mapPaletteNamePrefix + "3", defaultPalette.slice(13, 16).join(","));
        map.addTileset(globalPalette);
    }
}
function reloadCHRAfterPaletteChange(map) {
    map.usedTilesets().forEach(ts => {
        tiled.log("applying palette to image");
        const im = globalCHRCache[ts.image];
        if (!im) {
            tiled.log(`failed to find image : ${im}`);
        }
        else {
            const propBg = map.property(mapPaletteNamePrefix + "bg");
            const prop0 = map.property(mapPaletteNamePrefix + "0");
            const prop1 = map.property(mapPaletteNamePrefix + "1");
            const prop2 = map.property(mapPaletteNamePrefix + "2");
            const prop3 = map.property(mapPaletteNamePrefix + "3");
            tiled.log(`props: ${propBg} ${prop0} ${prop1} ${prop2} ${prop3}`);
            const colorTable = paletteToColor(getMapPalette(map));
            tiled.log(`setting to color table: ${colorTable}`);
            im.setColorTable(colorTable);
            ts.loadFromImage(im, ts.image);
        }
    });
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
function mapModified(map) {
    tiled.log(`map modified: ${map.fileName}`);
    reloadCHRAfterPaletteChange(map);
}
function newMapLoaded(map) {
    tiled.log("Loading map");
    createOrUpdateMapPalette(map);
    initMapLayers(map);
    map.modifiedChanged.connect(() => mapModified(map));
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
function getCurrentMapPaletteOrDefault() {
    const current = tiled.activeAsset;
    if (current && current.isTileMap) {
        const pal = getMapPalette(current);
        if (pal) {
            return pal;
        }
    }
    return defaultPalette;
}
function assetLoaded(asset) {
    tiled.log(`asset loaded ${asset.fileName}`);
    if (asset.isTileset) {
        const tileset = asset;
    }
    else if (asset.isTileMap) {
        const map = asset;
        map.modifiedChanged.connect(() => mapModified(map));
        if (isMapDirty(map)) {
            asset.macro("Generating NES Tilemap", () => newMapLoaded(asset));
        }
        map.regionEdited.connect((r, l) => mapRegionEdited(map, l, r));
        map.usedTilesets().forEach(ts => {
            if (ts.property("isCHRTileset")) {
                tiled.log(`forcing a reload for ${ts.name}`);
                tiled.open(ts.fileName);
            }
        });
    }
}
tiled.registerTilesetFormat("nespal", {
    name: "NES Palette",
    extension: "pal",
    read: (filename) => {
        const file = new BinaryFile(filename, BinaryFile.ReadOnly);
        const buffer = file.readAll();
        file.close();
        if (buffer.byteLength != 16) {
            tiled.error("Imported NES Palette is not 16 bytes!", () => { });
            return null;
        }
        const palette = new Uint8Array(buffer, 0, 16);
        const hex = Array.from(palette).map(v => ("0" + v.toString(16)).slice(-2));
        const tileset = createAttributeTileset(hex);
        return tileset;
    },
    write: (tileset, filename) => {
        const bgtile = tileset.tiles.find(tile => tile.property("Palette").toString() == "bg");
        const bgcolor = parseInt(bgtile.property("Palette Color").toString(), 16);
        const bytes = new ArrayBuffer(16);
        const buffer = new Uint8Array(bytes);
        for (let i = 0; i < 4; ++i) {
            const palette = tileset.tiles.find(tile => tile.property("Palette").toString() == "" + i);
            buffer[i * 4] = bgcolor;
            for (let j = 1; j < 4; ++j) {
                const color = palette.property("Palette Color " + j).toString();
                const val = parseInt(color, 16);
                buffer[i * 4 + j] = val;
            }
        }
        const file = new BinaryFile(filename, BinaryFile.WriteOnly);
        file.write(bytes);
        file.commit();
        return "";
    },
});
tiled.registerTilesetFormat("neschr", {
    name: "NES CHR",
    extension: "chr",
    read: (filename) => {
        tiled.log(`loading chr: ${filename}`);
        const file = new BinaryFile(filename, BinaryFile.ReadOnly);
        const buffer = file.readAll();
        const tileCount = buffer.byteLength / 16;
        const pixelsPerTile = 8;
        const tilesPerRow = 16;
        const tileColumns = tileCount / tilesPerRow;
        const im = new Image(pixelsPerTile * tilesPerRow, pixelsPerTile * tileColumns * 4, Image.Format_Indexed8);
        im.setColorTable(paletteToColor(getCurrentMapPaletteOrDefault()));
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
                    const index = bit0 | bit1;
                    const offY = tileColumns * pixelsPerTile;
                    im.setPixel(x + i, y + j, index);
                    im.setPixel(x + i, y + j + offY, index + 4);
                    im.setPixel(x + i, y + j + offY * 2, index + 8);
                    im.setPixel(x + i, y + j + offY * 3, index + 12);
                }
            }
        }
        const tileset = new Tileset();
        tileset.name = filename.substring(filename.lastIndexOf('/') + 1);
        tileset.setTileSize(8, 8);
        tileset.loadFromImage(im, filename);
        tiled.log("saving in global chr cache");
        globalCHRCache[tileset.image] = im;
        for (const tile of tileset.tiles) {
            const palette = Math.floor(tile.id / (tileColumns * tilesPerRow));
            tile.setProperty("Palette", palette);
        }
        tileset.setProperty("isCHRTileset", true);
        return tileset;
    },
    write: (tileset, filename) => {
        return "";
    },
});
const loadPaletteAction = tiled.registerAction("ApplyPalette", action => {
    const map = tiled.activeAsset;
    reloadCHRAfterPaletteChange(map);
});
loadPaletteAction.enabled = false;
loadPaletteAction.text = "Apply Global Palette";
loadPaletteAction.iconVisibleInMenu = false;
const setPaletteAction = tiled.registerAction("SetPalette", action => {
    const pal = tiled.activeAsset;
    for (let i = 0; i < 4; ++i) {
        globalPalette[i * 4] = pal.tiles.find(t => t.property("Palette") == "bg").property("Palette Color").toString();
        globalPalette[i * 4 + 1] = pal.tiles.find(t => t.property("Palette") == "" + i).property("Palette Color 1").toString();
        globalPalette[i * 4 + 2] = pal.tiles.find(t => t.property("Palette") == "" + i).property("Palette Color 2").toString();
        globalPalette[i * 4 + 3] = pal.tiles.find(t => t.property("Palette") == "" + i).property("Palette Color 3").toString();
    }
    globalPalettePath = pal.fileName;
    loadPaletteAction.enabled = true;
});
setPaletteAction.enabled = true;
setPaletteAction.text = "Set As Global Palette";
setPaletteAction.iconVisibleInMenu = false;
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
    { action: "ApplyPalette", before: "MapProperties" },
    { action: "Palette0" },
    { action: "Palette1" },
    { action: "Palette2" },
    { action: "Palette3" },
    { separator: true },
]);
tiled.extendMenu("Tileset", [
    { action: "SetPalette", before: "TilesetProperties" },
    { separator: true },
]);
tiled.assetCreated.connect(assetLoaded);
tiled.assetOpened.connect(assetLoaded);
//# sourceMappingURL=tiled-nes.js.map