/// <reference types="@mapeditor/tiled-api" />

const name = 'tiled-nes';

const attributeLayerName = "Attribute";
const tileLayerName = "Tile";
const defaultLayerNames = [tileLayerName,attributeLayerName];

const paletteNamePrefix = "Palette ";
const attributeTilesetName = "AttributeTileset";

let globalPalette:string[] = new Array(16);
let globalPalettePath:string;
const globalLoadedCHR:Image[] = [];

// Crystalis town palettes because i just needed something here
const defaultPalette : string[] = [
    "19", "27", "16", "0f",
    "19", "20", "28", "0f",
    "19", "3a", "1b", "0f",
    "19", "30", "11", "0f",
];

function RGB2Hex(r: number, g: number, b: number): number {
    return 0xff << 24 | r << 16 | g << 8 | b << 0;
}

const lookupPaletteToColor: { [key: string]: number } = {
    "00": RGB2Hex( 84,  84,  84), "01": RGB2Hex(  0,  30, 116), "02": RGB2Hex(  8,  16, 144), "03": RGB2Hex( 48,   0, 136), "04": RGB2Hex( 68,   0, 100), "05": RGB2Hex( 92,   0,  48), "06": RGB2Hex( 84,   4,   0), "07": RGB2Hex( 60,  24,   0), "08": RGB2Hex( 32,  42,   0), "09": RGB2Hex(  8,  58,   0), "0a": RGB2Hex(  0,  64,   0), "0b": RGB2Hex(  0,  60,   0), "0c": RGB2Hex(  0,  50,  60), "0d": RGB2Hex(  0,   0,   0), "0e": RGB2Hex(  0,   0,   0), "0f": RGB2Hex(  0,   0,   0),
    "10": RGB2Hex(152, 150, 152), "11": RGB2Hex(  8,  76, 196), "12": RGB2Hex( 48,  50, 236), "13": RGB2Hex( 92,  30, 228), "14": RGB2Hex(136,  20, 176), "15": RGB2Hex(160,  20, 100), "16": RGB2Hex(152,  34,  32), "17": RGB2Hex(120,  60,   0), "18": RGB2Hex( 84,  90,   0), "19": RGB2Hex( 40, 114,   0), "1a": RGB2Hex(  8, 124,   0), "1b": RGB2Hex(  0, 118,  40), "1c": RGB2Hex(  0, 102, 120), "1d": RGB2Hex(  0,   0,   0), "1e": RGB2Hex(  0,   0,   0), "1f": RGB2Hex(  0,   0,   0),
    "20": RGB2Hex(236, 238, 236), "21": RGB2Hex( 76, 154, 236), "22": RGB2Hex(120, 124, 236), "23": RGB2Hex(176,  98, 236), "24": RGB2Hex(228,  84, 236), "25": RGB2Hex(236,  88, 180), "26": RGB2Hex(236, 106, 100), "27": RGB2Hex(212, 136,  32), "28": RGB2Hex(160, 170,   0), "29": RGB2Hex(116, 196,   0), "2a": RGB2Hex( 76, 208,  32), "2b": RGB2Hex( 56, 204, 108), "2c": RGB2Hex( 56, 180, 204), "2d": RGB2Hex( 60,  60,  60), "2e": RGB2Hex(  0,   0,   0), "2f": RGB2Hex(  0,   0,   0),
    "30": RGB2Hex(236, 238, 236), "31": RGB2Hex(168, 204, 236), "32": RGB2Hex(188, 188, 236), "33": RGB2Hex(212, 178, 236), "34": RGB2Hex(236, 174, 236), "35": RGB2Hex(236, 174, 212), "36": RGB2Hex(236, 180, 176), "37": RGB2Hex(228, 196, 144), "38": RGB2Hex(204, 210, 120), "39": RGB2Hex(180, 222, 120), "3a": RGB2Hex(168, 226, 144), "3b": RGB2Hex(152, 226, 180), "3c": RGB2Hex(160, 214, 228), "3d": RGB2Hex(160, 162, 160), "3e": RGB2Hex(  0,   0,   0), "3f": RGB2Hex(  0,   0,   0),
};

function paletteToColor(pal: string[]): number[] {
    return pal.map(s => lookupPaletteToColor[s.toLowerCase()]);
}

function paletteifyTileset(tileset: Tileset) {
    let image = new Image(tileset.image);
}

function tilesetLoaded(tileset:Tileset) {
    tiled.log("Loading tileset");
    if (tileset.name == attributeTilesetName) {

    } else {
        paletteifyTileset(tileset);
    }
}

// function createPalettePropertiesIfNotExist(map:TileMap) {
//     for (let i=0; i<=3; ++i) {
//         for (let j=1; j<=3; ++j) {
//             let name = paletteNamePrefix+i+":"+j;
//             if (!map.resolvedProperty(name)) {
//                 tiled.log("Creating Default palette attribute: "+name);
//                 map.setProperty(name, defaultPalette[i][j-1]);
//             }
//         }
//     }
//     let bgName = paletteNamePrefix + "BG";
//     if (!map.resolvedProperty(bgName)) {
//         tiled.log("Creating Default palette attribute: "+bgName);
//         map.setProperty(bgName, defaultBGColor);
//     }
// }

function initMapLayers(map:TileMap) {
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
        const atl : TileLayer = attributeLayer as TileLayer;
        map.addLayer(atl);
        // set the layer to locked to hopefully slow down user level editing (for now)
        atl.locked = true;
        atl.visible = false;
        // find the first attribute tile and fill the layer with it
        const attrtiles = map.tilesets.find(ts => ts.name == attributeTilesetName);
        const defaultPaletteTile = attrtiles.tiles.find(tile => tile.resolvedProperty("Palette").toString() == "0");
        const editor = atl.edit();
        for (let w=0; w<atl.width; ++w) {
            for (let h=0; h<atl.height; ++h) {
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

function drawFilledSquare(im: Image, index: number, x: number, y: number, size: number) {
    for (let i=x; i<x+size; ++i) {
        for (let j=y; j<y+size; ++j) {
            im.setPixel(i,j,index);
        }
    }
}

function generateTileForBackground(color:string): Image {
    // Typescript typing is wrong, Image.Format_Indexed8 converts to a number just fine
    // @ts-ignore
    let paletteImage = new Image(8,8,Image.Format_Indexed8);
    paletteImage.setColorTable(paletteToColor([color]));
    drawFilledSquare(paletteImage, 0, 0, 0, 8);
    return paletteImage;
}

function generateTileFromPalette(pal:string[]): Image {
    const clear = 0;
    // Typescript typing is wrong, Image.Format_Indexed8 converts to a number just fine
    // @ts-ignore
    let paletteImage = new Image(8,8,Image.Format_Indexed8);
    tiled.log("plaette: " + pal);
    paletteImage.setColorTable([clear].concat(paletteToColor([pal[1],pal[2],pal[3]])));
    paletteImage.fill(0);
    drawFilledSquare(paletteImage, 1, 2, 6, 2);
    drawFilledSquare(paletteImage, 2, 4, 6, 2);
    drawFilledSquare(paletteImage, 3, 6, 6, 2);
    return paletteImage;
}

function updateTileFromPalette(tile:Tile, pal:string[]) {
    tile.setImage(generateTileFromPalette(pal));
    for (let j=1; j<4; ++j) {
        tile.setProperty("Palette Color "+j, pal[j]);
    }
}

function createAttributeTileset(pal:string[]):Tileset {
    const tileset = new Tileset();

    tiled.log("adding new tiles");
    const tile = tileset.addTile();
    tile.setProperty("Palette", "bg");
    tile.setImage(generateTileForBackground(pal[0]));
    tile.setProperty("Palette Color", pal[0]);
    for (let i=0; i<4; ++i) {
        const tile = tileset.addTile();
        tile.setProperty("Palette", ""+i);
        updateTileFromPalette(tile, pal.slice(i*4, i*4 + 4));
    }
    return tileset;
}

function createOrUpdateGlobalPalette(map:TileMap) {
    const tileset = map.tilesets.find(ts => ts.name == attributeTilesetName);
    if (!tileset) {
        tiled.log("Tileset missing, creating new one");
        const globalPalette = createAttributeTileset(defaultPalette);
        globalPalette.name = "Palette";
        map.setProperty("Loaded Palette", "default");
        map.addTileset(globalPalette);
        return;
    }
    // tiled.log("updating existing palette tileset");
    // for (let i=0; i<4; ++i) {
    //     const tile = tileset.tiles.find(t => t.resolvedProperty("Palette").toString() == ""+i);
    //     updateTileFromPalette(tile, pal.slice(i*4, i*4 + 4));
    // }
}

function mapRegionEdited(map: TileMap, layer: TileLayer, r:region) {
    if (layer.name == attributeLayerName) {
        for (let rect of r.rects) {
            // rect.
        }
    }
}

function mapLoaded(map:TileMap) {
    tiled.log("Loading map");
    createOrUpdateGlobalPalette(map);
    initMapLayers(map);
}

function getLayerIfExists(map:TileMap, name:string):Layer | undefined {
    let layer = map.layers.find(lay => lay.name == name);
    if (layer && layer.isTileLayer)
        return layer;
    return undefined;
}

function isMapDirty(map:TileMap): boolean {
    // check if the expected tile layers exist
    for (let layer of defaultLayerNames) {
        if (!getLayerIfExists(map, layer)) {
            tiled.log("Missing layer " + layer + ". Recreating the NES defaults");
            return true;
        }
    }
    return false;
}

function isPalette(tileset:Tileset): boolean {
    return false;
}

function checkForPaletteChange(): boolean {

    return false;
}

function getCurrentPaletteOrDefault(): string[] {
    if (globalPalettePath) {
        tiled.log("palette " + globalPalettePath);
        tiled.log("paletteasdas " + globalPalette);
        return globalPalette;
    }
    return defaultPalette;
}

function assetLoaded(asset:Asset) {
    if (asset.isTileset) {
        const tileset = asset as Tileset;
        // if (isPalette(tileset)) {
        //     // create or update global palette.
            
        // }
        // asset.macro("Generating NES Tileset", () => tilesetLoaded(asset as Tileset));
    } else if (asset.isTileMap) {
        const map = asset as TileMap;
        if (isMapDirty(map)) {
            asset.macro("Generating NES Tilemap", () => mapLoaded(asset as TileMap));
        }
        // The regionEdited signal is documented incorrectly. It sends two params (but typesig only mentions one)
        // @ts-ignore
        map.regionEdited.connect((r:region, l: TileLayer) => mapRegionEdited(map, l, r));
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
            tiled.error("Imported NES Palette is not 16 bytes!", () => {});
            return null;
        }
        const palette = new Uint8Array(buffer, 0, 16);
        const hex = Array.from(palette).map( v => ("0" + v.toString(16)).slice(-2) );
        const tileset = createAttributeTileset(hex);
        return tileset;
    },
    write: (tileset, filename) => {
        const bgtile = tileset.tiles.find( tile => tile.property("Palette").toString() == "bg");
        const bgcolor = parseInt(bgtile.property("Palette Color").toString(), 16);
        const bytes = new ArrayBuffer(16);
        const buffer = new Uint8Array(bytes);
        for (let i=0; i<4; ++i) {
            const palette = tileset.tiles.find( tile => tile.property("Palette").toString() == ""+i);
            buffer[i*4] = bgcolor;
            for (let j=1; j<4; ++j) {
                const color = palette.property("Palette Color "+j).toString();
                const val = parseInt(color, 16);
                buffer[i*4+j] = val;
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
        const file = new BinaryFile(filename, BinaryFile.ReadOnly);
        const buffer = file.readAll();
        const tileCount = buffer.byteLength / 16; // 16 bytes per tile
        const pixelsPerTile = 8;
        const tilesPerRow = 16;
        const tileColumns = tileCount / tilesPerRow;

        // Create the new indexed image that with a default grayscale palette color
        // Typescript typing is wrong, Image.Format_Indexed8 converts to a number just fine
        // * 2 because we are duplicating the image 
        // @ts-ignore
        const im = new Image(pixelsPerTile * tilesPerRow * 2, pixelsPerTile * tileColumns * 2, Image.Format_Indexed8);
        im.setColorTable(paletteToColor(getCurrentPaletteOrDefault()));

        const view = new Uint8Array(buffer);
        for (let n=0; n < tileCount; ++n) {
            const offset = n * 16;
            const x = (n % 16) * 8;
            const y = Math.floor(n / 16) * 8;
            for (let j=0; j < 8; ++j) {
                const plane0 = view[offset + j];
                const plane1 = view[offset + j + 8];
                for (let i=0; i < 8; ++i) {
                    const pixelbit = 7-i;
                    const bit0 = (plane0>>pixelbit) & 1;
                    const bit1 = ((plane1>>pixelbit) & 1) << 1;
                    const index = bit0 | bit1;
                    const offX = tilesPerRow * pixelsPerTile;
                    const offY = tileColumns * pixelsPerTile;
                    im.setPixel(x + i,        y + j,        index);
                    im.setPixel(x + i + offX, y + j,        index + 4);
                    im.setPixel(x + i,        y + j + offY, index + 8);
                    im.setPixel(x + i + offX, y + j + offY, index + 12);
                }
            }
        }
        globalLoadedCHR.push(im);
        const tileset = new Tileset();
        tileset.name = filename.substring(filename.lastIndexOf('/')+1);
        tileset.setTileSize(8,8); // must be called before loadFromImage
        tileset.loadFromImage(im, filename);
        return tileset;
    },
    write: (tileset, filename) => {
        // Don't write any changes intentionally since we don't support updating CHR files.
        return "";
    },
});

const loadPaletteAction = tiled.registerAction("ApplyPalette", action => {
    globalLoadedCHR.forEach( im => {
        tiled.log("applying palette to image");
        im.setColorTable(paletteToColor(globalPalette));
    });
});
loadPaletteAction.enabled = false;
loadPaletteAction.text = "Apply Global Palette";
loadPaletteAction.iconVisibleInMenu = false;

const setPaletteAction = tiled.registerAction("SetPalette", action => {
    const pal = tiled.activeAsset as Tileset;
    for (let i=0; i < 4; ++i) {
        globalPalette[i*4] = pal.tiles.find(t => t.property("Palette") == "bg").property("Palette Color").toString();
        globalPalette[i*4+1] = pal.tiles.find(t => t.property("Palette") == ""+i).property("Palette Color 1").toString();
        globalPalette[i*4+2] = pal.tiles.find(t => t.property("Palette") == ""+i).property("Palette Color 2").toString();
        globalPalette[i*4+3] = pal.tiles.find(t => t.property("Palette") == ""+i).property("Palette Color 3").toString();
    }
    globalPalettePath = pal.fileName;
    loadPaletteAction.enabled = true;
});

setPaletteAction.enabled = true;
setPaletteAction.text = "Set As Global Palette";
setPaletteAction.iconVisibleInMenu = false;

for (let i=0; i<4; ++i) {
    const action = tiled.registerAction("Palette"+i, (action) => {
        action.id
    });

    action.enabled = true;
    action.text = "Color with Palette "+i;
    action.checkable = true;
    action.iconVisibleInMenu = false;
    action.shortcut = "Shift+"+(i+1);
}

tiled.extendMenu("Map", [
    { action: "ApplyPalette", before: "MapProperties" },
    { action: "Palette0"},
    { action: "Palette1"},
    { action: "Palette2"},
    { action: "Palette3"},
    { separator: true },
]);

tiled.extendMenu("Tileset", [
    { action: "SetPalette", before: "TilesetProperties" },
    { separator: true },
])

tiled.assetCreated.connect(assetLoaded);
tiled.assetOpened.connect(assetLoaded);
