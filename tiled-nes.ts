/// <reference types="@mapeditor/tiled-api" />

const name = 'tiled-nes';

const attributeLayerName = "Attribute";
const tileLayerName = "Tile";
const defaultLayerNames = [tileLayerName,attributeLayerName];

const mapPaletteNamePrefix = "Palette ";
const attributeTilesetName = "Palette";

let globalPalette:string[] = new Array(16);
let globalPalettePath:string;

// Crystalis town palettes because i just needed something here
// const defaultPalette : string[] = [
//     "19", "27", "16", "0f",
//     "19", "20", "28", "0f",
//     "19", "3a", "1b", "0f",
//     "19", "30", "11", "0f",
// ];

function num2Hexstr(num: number): string {
    return ("0" + num.toString(16)).slice(-2);
}

function RGB2Hex(rgb: number[]): number {
    return 0xff << 24 | rgb[0] << 16 | rgb[1] << 8 | rgb[2] << 0;
}

const basePaletteColors: number[][] = [
    [ 84,  84,  84], [  0,  30, 116], [  8,  16, 144], [ 48,   0, 136], [ 68,   0, 100], [ 92,   0,  48], [ 84,   4,   0], [ 60,  24,   0], [ 32,  42,   0], [  8,  58,   0], [  0,  64,   0], [  0,  60,   0], [  0,  50,  60], [  0,   0,   0], [  0,   0,   0], [  0,   0,   0],
    [152, 150, 152], [  8,  76, 196], [ 48,  50, 236], [ 92,  30, 228], [136,  20, 176], [160,  20, 100], [152,  34,  32], [120,  60,   0], [ 84,  90,   0], [ 40, 114,   0], [  8, 124,   0], [  0, 118,  40], [  0, 102, 120], [  0,   0,   0], [  0,   0,   0], [  0,   0,   0],
    [236, 238, 236], [ 76, 154, 236], [120, 124, 236], [176,  98, 236], [228,  84, 236], [236,  88, 180], [236, 106, 100], [212, 136,  32], [160, 170,   0], [116, 196,   0], [ 76, 208,  32], [ 56, 204, 108], [ 56, 180, 204], [ 60,  60,  60], [  0,   0,   0], [  0,   0,   0],
    [236, 238, 236], [168, 204, 236], [188, 188, 236], [212, 178, 236], [236, 174, 236], [236, 174, 212], [236, 180, 176], [228, 196, 144], [204, 210, 120], [180, 222, 120], [168, 226, 144], [152, 226, 180], [160, 214, 228], [160, 162, 160], [  0,   0,   0], [  0,   0,   0],
];

const emphasisMultiplier: number[][] = [
	[100.0,100.0,100.0],
	[ 74.3, 91.5,123.9],
	[ 88.2,108.6, 79.4],
	[ 65.3, 98.0,101.9],
	[127.7,102.6, 90.5],
	[ 97.9, 90.8,102.3],
	[100.1, 98.7, 74.1],
	[ 75.0, 75.0, 75.0],
];

class Emphasis {
    constructor(r: boolean, g: boolean, b: boolean) {
        this.r = r; this.g = g; this.b = b;
    }
    r: boolean;
    g: boolean;
    b: boolean;
    get():number {
        return (this.r?1:0) << 2 | (this.g?1:0) << 1 | (this.b?1:0);
    };
};

type Palette = {
    p: number[],
    em: Emphasis,
};

function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
}

function RGB2HexWithEmphasis(rgb: number[], emp: Emphasis): number {
    const em = emphasisMultiplier[emp.get()];
    return RGB2Hex(rgb.map((c, i) => clamp(Math.floor(c * (em[i] / 100.0)), 0, 255)));
}

function GetColor(idx: number, em: Emphasis): number {
    return lookupPaletteToColor[em.get()][idx];
}

/**
 * 2 layer lookup for the RGB color for a palette color. First array is emphasis bits, second is palette idx
 */
const lookupPaletteToColor: number[][] = [
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(false, false, false))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(false, false,  true))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(false,  true, false))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis(false,  true,  true))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis( true, false, false))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis( true, false,  true))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis( true,  true, false))),
    basePaletteColors.map(x => RGB2HexWithEmphasis(x, new Emphasis( true,  true,  true))),
];

function paletteToColor(pal: Palette): number[] {
    return pal.p.map(n => lookupPaletteToColor[pal.em.get()][n]);
}

function paletteifyTileset(tileset: Tileset) {
    let image = new Image(tileset.image);
}

function isValidPalette(pal: Palette) {
    if (!pal.p) {
        return false;
    }
    // check that the string converts into 16 bytes that are all in the generated lookup
    if (pal.p.length != 16) {
        return false;
    }
    if (pal.p.filter(s => lookupPaletteToColor[s] !== undefined).length != 16) {
        return false;
    }
    return true;
}

function chunk(str: string, size: number): string[] {
    return str.match(new RegExp('.{1,' + size + '}', 'g'));
}

function hexstrToBytes(str: string): ArrayBuffer {
    const bytes = chunk(str, 2).map(s => parseInt(s, 16));
    return new Uint8Array(bytes);
}

function hex2Num(strs: string[]): number[] {
    return strs.map(s => parseInt(s, 16));
}

function tilesetLoaded(tileset:Tileset) {
    tiled.log("Loading tileset");
}

// function initMapLayers(map:TileMap) {
//     let tileLayer = getLayerIfExists(map, tileLayerName);
//     if (!tileLayer || !tileLayer.isTileLayer) {
//         tiled.log("Map doesn't have " + tileLayerName + " layer. Adding now");
//         tileLayer = new TileLayer(tileLayerName);
//         map.addLayer(tileLayer);
//     }
//     let attributeLayer = getLayerIfExists(map, attributeLayerName);
//     if (!attributeLayer || !attributeLayer.isTileLayer) {
//         tiled.log("Map doesn't have " + attributeLayerName + " layer. Adding now");
//         attributeLayer = new TileLayer(attributeLayerName);
//         const atl : TileLayer = attributeLayer as TileLayer;
//         map.addLayer(atl);
//         // set the layer to locked to hopefully slow down user level editing (for now)
//         atl.locked = true;
//         atl.visible = false;
//         // find the first attribute tile and fill the layer with it
//         const attrtiles = map.tilesets.find(ts => ts.name == attributeTilesetName);
//         const defaultPaletteTile = attrtiles.tiles.find(tile => tile.resolvedProperty("Palette").toString() == "0");
//         const editor = atl.edit();
//         for (let w=0; w<atl.width; ++w) {
//             for (let h=0; h<atl.height; ++h) {
//                 editor.setTile(w, h, defaultPaletteTile);
//             }
//         }
//         editor.apply();
//     }
//     let width = attributeLayer.resolvedProperty("AttributeWidth");
//     if (!width || !(parseInt(width.toString()))) {
//         attributeLayer.setProperty("AttributeWidth", 16);
//     }
//     let height = attributeLayer.resolvedProperty("AttributeHeight");
//     if (!height || !(parseInt(height.toString()))) {
//         attributeLayer.setProperty("AttributeHeight", 16);
//     }
//     let offsetX = attributeLayer.resolvedProperty("AttributeOffsetX");
//     if (!offsetX || !(parseInt(offsetX.toString()))) {
//         attributeLayer.setProperty("AttributeOffsetX", 0);
//     }
//     let offsetY = attributeLayer.resolvedProperty("AttributeOffsetY");
//     if (!offsetY || !(parseInt(offsetY.toString()))) {
//         attributeLayer.setProperty("AttributeOffsetY", 0);
//     }
// }

function drawFilledSquare(im: Image, index: number, x: number, y: number, size: number) {
    for (let i=x; i<x+size; ++i) {
        for (let j=y; j<y+size; ++j) {
            im.setPixel(i,j,index);
        }
    }
}

function generateTileForBackground(pal:Palette): Image {
    // Typescript typing is wrong, Image.Format_Indexed8 converts to a number just fine
    // @ts-ignore
    let paletteImage = new Image(8,8,Image.Format_Indexed8);
    paletteImage.setColorTable(paletteToColor(pal));
    drawFilledSquare(paletteImage, 0, 0, 0, 8);
    return paletteImage;
}

function generateTileFromPalette(pal:Palette): Image {
    const clear = 0;
    // Typescript typing is wrong, Image.Format_Indexed8 converts to a number just fine
    // @ts-ignore
    let paletteImage = new Image(8,8,Image.Format_Indexed8);
    tiled.log("plaette: " + pal);
    paletteImage.setColorTable([clear].concat(paletteToColor(pal)));
    paletteImage.fill(0);
    drawFilledSquare(paletteImage, 1, 2, 6, 2);
    drawFilledSquare(paletteImage, 2, 4, 6, 2);
    drawFilledSquare(paletteImage, 3, 6, 6, 2);
    return paletteImage;
}

function updateTileFromPalette(tile:Tile, pal:Palette) {
    tile.setImage(generateTileFromPalette(pal));
    for (let j=1; j<4; ++j) {
        tile.setProperty("Palette Color "+j, num2Hexstr(pal.p[j]));
    }
}

function createPaletteTileset(pal:Palette):Tileset {
    const tileset = new Tileset();

    tiled.log("adding new tiles");
    const tile = tileset.addTile();
    tile.setProperty("Palette", "bg");
    tile.setImage(generateTileForBackground({p: [pal.p[0]], em: pal.em}));
    tile.setProperty("Palette Color", num2Hexstr(pal.p[0]));
    for (let i=0; i<4; ++i) {
        const tile = tileset.addTile();
        tile.setProperty("Palette", ""+i);
        updateTileFromPalette(tile, {p: pal.p.slice(i*4, i*4 + 4), em: pal.em});
    }
    return tileset;
}

// function createOrUpdateMapPalette(map:TileMap) {
//     const tileset = map.tilesets.find(ts => ts.name == attributeTilesetName);
//     if (!tileset) {
//         tiled.log("Tileset missing, creating new one");
//         const globalPalette = createPaletteTileset(defaultPalette);
//         globalPalette.name = attributeTilesetName;
//         map.setProperty(mapPaletteNamePrefix + "bg", defaultPalette[0]);
//         map.setProperty(mapPaletteNamePrefix + "0", defaultPalette.slice(1,4).join(","));
//         map.setProperty(mapPaletteNamePrefix + "1", defaultPalette.slice(5,8).join(","));
//         map.setProperty(mapPaletteNamePrefix + "2", defaultPalette.slice(9,12).join(","));
//         map.setProperty(mapPaletteNamePrefix + "3", defaultPalette.slice(13,16).join(","));
//         map.addTileset(globalPalette);
//     }

//     // tiled.log("updating palette tileset");
//     // for (let i=0; i<4; ++i) {
//     //     const tile = tileset.tiles.find(t => t.resolvedProperty("Palette").toString() == ""+i);
//     //     updateTileFromPalette(tile, pal.slice(i*4, i*4 + 4));
//     // }
// }

// function reloadCHRAfterPaletteChange(map: TileMap) {
//     map.usedTilesets().forEach( ts => {
//         tiled.log("applying palette to image");
//         // const propBg = map.property(mapPaletteNamePrefix + "bg");
//         // const prop0 = map.property(mapPaletteNamePrefix + "0");
//         // const prop1 = map.property(mapPaletteNamePrefix + "1");
//         // const prop2 = map.property(mapPaletteNamePrefix + "2");
//         // const prop3 = map.property(mapPaletteNamePrefix + "3");
//         // tiled.log(`props: ${propBg} ${prop0} ${prop1} ${prop2} ${prop3}`);
//         const palette = getMapPalette(map);
//         if (!palette) {
//             tiled.log("could not validate palette");
//             return;
//         }
//         const colorTable = paletteToColor(palette);
//         tiled.log(`setting to color table: ${colorTable} tsFilename: ${ts.fileName}`);
//         const file = new BinaryFile(ts.fileName, BinaryFile.ReadOnly);
//         const buffer = file.readAll();
//         file.close();
//         const im = createImageFromCHR(buffer);
//         im.setColorTable(colorTable);
//         ts.loadFromImage(im, ts.image);
//     });
// }

function setMapPalette(map: TileMap, palette: Palette) {
    map.setProperty(mapPaletteNamePrefix + "bg", palette.p[0] + "");
    map.setProperty(mapPaletteNamePrefix + "0", palette.p.slice(1,4).map(num2Hexstr).join(","));
    map.setProperty(mapPaletteNamePrefix + "1", palette.p.slice(5,8).map(num2Hexstr).join(","));
    map.setProperty(mapPaletteNamePrefix + "2", palette.p.slice(9,12).map(num2Hexstr).join(","));
    map.setProperty(mapPaletteNamePrefix + "3", palette.p.slice(13,16).map(num2Hexstr).join(","));
    map.setProperty("Emphasize Red",   palette.em.r);
    map.setProperty("Emphasize Green", palette.em.g);
    map.setProperty("Emphasize Blue",  palette.em.b);
}

function getMapPalette(map: TileMap): Palette | undefined {
    const propBg = map.property(mapPaletteNamePrefix + "bg");
    const prop0 = map.property(mapPaletteNamePrefix + "0");
    const prop1 = map.property(mapPaletteNamePrefix + "1");
    const prop2 = map.property(mapPaletteNamePrefix + "2");
    const prop3 = map.property(mapPaletteNamePrefix + "3");
    if (propBg && prop0&& prop1 && prop2 && prop3) {
        const palette : string[] = new Array(16);
        palette[0] = palette[4] = palette[8] = palette[12] = propBg.toString();
        palette.splice(1, 3, ...prop0.toString().split(","));
        palette.splice(5, 3, ...prop1.toString().split(","));
        palette.splice(9, 3, ...prop2.toString().split(","));
        palette.splice(13, 3, ...prop3.toString().split(","));
        const emR = map.property("Emphasize Red")   as boolean;
        const emG = map.property("Emphasize Green") as boolean;
        const emB = map.property("Emphasize Blue")  as boolean;
        const pal = {p: hex2Num(palette), em: new Emphasis(emR, emG, emB)};
        if (isValidPalette(pal)) {
            return pal;
        }
    }
    return undefined;
}

function mapRegionEdited(map: TileMap, layer: TileLayer, r:region) {
    if (layer.name == attributeLayerName) {
        for (let rect of r.rects) {
            // rect.
        }
    }
}

// function mapModified(map: TileMap) {
//     tiled.log(`map modified: ${map.fileName}`);
//     reloadCHRAfterPaletteChange(map);
// }

// function newMapLoaded(map:TileMap) {
//     tiled.log("Loading map");
//     createOrUpdateMapPalette(map);
//     initMapLayers(map);
//     map.modifiedChanged.connect(() => mapModified(map));
// }

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
    tiled.log("checking is valid palette from map");
    if (!isValidPalette(getMapPalette(map))) {
        return true;
    }
    return false;
}

// function getCurrentMapPaletteOrDefault(): string[] {
//     const current = tiled.activeAsset;
//     if (current && current.isTileMap) {
//         const pal = getMapPalette(current as TileMap);
//         if (pal) {
//             return pal;
//         }
//     }
//     return defaultPalette;
// }

// function assetLoaded(asset:Asset) {
//     tiled.log(`asset loaded ${asset.fileName}`);
//     if (asset.isTileset) {
//         const tileset = asset as Tileset;
//         // if (isPalette(tileset)) {
//         //     // create or update global palette.
//         // }
//         // asset.macro("Generating NES Tileset", () => tilesetLoaded(asset as Tileset));
//     } else if (asset.isTileMap) {
//         const map = asset as TileMap;
//         map.modifiedChanged.connect(() => mapModified(map));
//         if (isMapDirty(map)) {
//             asset.macro("Generating NES Tilemap", () => newMapLoaded(asset as TileMap));
//         }
//         // The regionEdited signal is documented incorrectly. It sends two params (but typesig only mentions one)
//         // @ts-ignore
//         map.regionEdited.connect((r:region, l: TileLayer) => mapRegionEdited(map, l, r));
//         map.usedTilesets().forEach(ts => {
//             if (ts.property("isCHRTileset")) {
//                 // Force a reload to get the original image added to the CHR cache
//                 // tiled.log(`forcing a reload for ${ts.name}`);
//                 // tiled.open(ts.fileName);
//             }
//         });
//     }
// }

/**
 * Text based RLE decoder. There are two types of tokens in this format.
 * - xx ASCII hex value
 * - [xx] the number of times to repeat the previous value. Note that this number includes the byte in the stream
 *        so if you have 02[3] then it expands to 020202 (as opposed to 02020202)
 * @param d - RLE encoded value
 */
function unRLE(d: string): string {
    let buffer = "";
    let current = "";
    let i=0;
    while (i < d.length) {
        if (d[i] === "[") {
            ++i;
            const nextI = d.indexOf("]",i);
            // Subtract one because we already added the current byte to the buffer once
            const rle = parseInt(d.slice(i, nextI), 16) - 1;
            buffer += current.repeat(rle);
            i = nextI+1; // +1 to skip the "]"
        } else {
            current = d.slice(i, i+2);
            buffer += current;
            i += 2;
        }
    }
    return buffer;
}

// tiled.registerTilesetFormat("nespal", {
//     name: "NES Palette",
//     extension: "pal",

//     read: (filename) => {
//         const file = new BinaryFile(filename, BinaryFile.ReadOnly);
//         const buffer = file.readAll();
//         file.close();
//         if (buffer.byteLength != 16) {
//             tiled.error("Imported NES Palette is not 16 bytes!", () => {});
//             return null;
//         }
//         const palette = new Uint8Array(buffer, 0, 16);
//         const hex = Array.from(palette).map( v => ("0" + v.toString(16)).slice(-2) );
//         const tileset = createPaletteTileset(hex);
//         return tileset;
//     },
//     write: (tileset, filename) => {
//         const bgtile = tileset.tiles.find( tile => tile.property("Palette").toString() == "bg");
//         const bgcolor = parseInt(bgtile.property("Palette Color").toString(), 16);
//         const bytes = new ArrayBuffer(16);
//         const buffer = new Uint8Array(bytes);
//         for (let i=0; i<4; ++i) {
//             const palette = tileset.tiles.find( tile => tile.property("Palette").toString() == ""+i);
//             buffer[i*4] = bgcolor;
//             for (let j=1; j<4; ++j) {
//                 const color = palette.property("Palette Color "+j).toString();
//                 const val = parseInt(color, 16);
//                 buffer[i*4+j] = val;
//             }
//         }
        
//         const file = new BinaryFile(filename, BinaryFile.WriteOnly);
//         file.write(bytes);
//         file.commit();
//         return "";
//     },
// });

function createImageFromCHR(buffer: ArrayBuffer, palette:Palette, paletteIdx: number): Image {
    const tileCount = buffer.byteLength / 16; // 16 bytes per tile
    const pixelsPerTile = 8;
    const tilesPerRow = 16;
    const tileColumns = tileCount / tilesPerRow;

    // Create the new indexed image that with a default grayscale palette color
    // Typescript typing is wrong, Image.Format_Indexed8 converts to a number just fine
    // * 4 because we are duplicating the image vertically 4 times
    // @ts-ignore
    const im = new Image(pixelsPerTile * tilesPerRow, pixelsPerTile * tileColumns, Image.Format_Indexed8);
    im.setColorTable(paletteToColor(palette));

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
                const color = (bit0 | bit1) + (paletteIdx * 4);
                im.setPixel(x + i, y + j, color);
            }
        }
    }
    return im;
}

function createTilesetFromCHR(buffer: ArrayBuffer, palette:Palette, paletteIdx: number): Tileset {
    const tileset = new Tileset();
    tileset.setTileSize(8,8); // must be called before loadFromImage
    const im = createImageFromCHR(buffer, palette, paletteIdx);
    tileset.loadFromImage(im);
    tileset.setProperty("isCHRTileset", true);
    return tileset;
}

// tiled.registerTilesetFormat("neschr", {
//     name: "NES CHR",
//     extension: "chr",
//     read: (filename) => {
//         const file = new BinaryFile(filename, BinaryFile.ReadOnly);
//         const buffer = file.readAll();
//         file.close();
//         tiled.log(`loading chr: ${filename}`);
//         const tileset = createTilesetFromCHR(buffer)
//         tileset.name = filename.substring(filename.lastIndexOf('/')+1);
//         tileset.image = filename;
//         return tileset;
//     },
//     write: (tileset, filename) => {
//         // Don't write any changes intentionally since we don't support updating CHR files.
//         return "";
//     },
// });

tiled.registerMapFormat("nexxt", {
    name: "NEXXT Session",
    extension: "nss",
    read: (filename: string) => {
        const file = new TextFile(filename, TextFile.ReadOnly);
        const nss = new Map(file.readAll().split("\n").filter(s => s.includes("=")).map(s => s.split("=")).map(s => [s[0], s[1]]));

        const map = new TileMap();
        map.setTileSize(8, 8);
        const width = parseInt(nss.get("VarNameW"));
        const height = parseInt(nss.get("VarNameH"));
        map.setSize(width, height);
        // Palette has 4 different palettes "A,B,C,D" selected by the user
        // The field isn't RLE encoded, so its a fixed length of 16 (num bytes in palette) * 2 (ascii hex byte length) * 4

        const palettes:string[] = [];

        const palnum = hex2Num(chunk(unRLE(nss.get("Palette")).slice(0, 32), 2));
        const ppuMask = parseInt(nss.get("VarPPUMask"),10);
        const em = new Emphasis((ppuMask&(1<<7))>0, (ppuMask&(1<<6))>0, (ppuMask&(1<<5))>0);
        const pal = {p: palnum, em: em};
        setMapPalette(map, pal);
        const paletteTileset = createPaletteTileset(pal);
        paletteTileset.name = "Palette";
        map.addTileset(paletteTileset);
        // const paletteTileset = new Tileset();
        // paletteTileset.name = "Palette";
        // for (let i=0; i<4; ++i) {
        //     const pal = chunk(nss.get("Palette").slice(i*32, (i+1)*32), 2);
        //     // const palette = createPaletteTileset(pal);
        //     // palette.name = `Palette ${i+1}`;
        //     palettes.push(pal.join(","));
        //     // palette.setProperty("Palette", pal.join(","));
        //     // map.addTileset(palette);
        // }

        // CHRMain is an ASCII RLE encoded hex string containing the A and B pattern table. 
        const chrBuffer = hexstrToBytes(unRLE(nss.get("CHRMain")));
        const chrs:Tileset[] = [];
        for (let i=0; i<4; ++i) {
            const chr = createTilesetFromCHR(chrBuffer, pal, i);
            chr.name = `CHR (Pal ${i+1})`;
            chrs.push(chr);
            map.addTileset(chr);
        }
        
        // Attribute data is a ASCII RLE encoded hex string that contains the raw PPU attribute table
        const attrtable = new Uint8Array(hexstrToBytes(unRLE(nss.get("AttrTable"))));
        // Expand the attribute table into 8x8 mapping for the map size
        const attrs:number[][] = Array.from(Array(height), () => new Array(width));
        const attrLayer = new TileLayer("Attribute");
        const attrEdit = attrLayer.edit();
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                // x,y/4 because the conversion for 32x32 to 8x8
                const coarseIdx = Math.floor(Math.floor(y/4) * (width/4) + x/4);
                const xshift = ((x % 4) < 2) ? 0 : 2;
                const yshift = ((y % 4) < 2) ? 0 : 4;
                const mask = 0b11 << (xshift + yshift);
                const palette = (attrtable[coarseIdx] & mask) >> (xshift + yshift);
                attrs[y][x] = palette;
                attrEdit.setTile(x, y, paletteTileset.tile(palette+1));
            }
        }
        attrEdit.apply();

        // NameTable is an ASCII RLE encoded hex string that contains the A pattern table. (B is in NameCopy)
        const nmt = unRLE(nss.get("NameTable"));
        const bgLayer = new TileLayer("Background");
        const bgEdit = bgLayer.edit();
        const tiles = chunk(nmt, 2).map(s => parseInt(s, 16));
        for (let y=0; y<height; ++y) {
            for (let x=0; x<width; ++x) {
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
})

// const loadPaletteAction = tiled.registerAction("ApplyPalette", action => {
//     // This menu action is on the Map menu, so we must be on a TileMap to use it...
//     // TODO double check for sanity in case they weasle around that with the console.
//     const map = tiled.activeAsset as TileMap;
//     reloadCHRAfterPaletteChange(map);
// });
// loadPaletteAction.enabled = false;
// loadPaletteAction.text = "Apply Global Palette";
// loadPaletteAction.iconVisibleInMenu = false;

// const setPaletteAction = tiled.registerAction("SetPalette", action => {
//     const pal = tiled.activeAsset as Tileset;
//     for (let i=0; i < 4; ++i) {
//         globalPalette[i*4] = pal.tiles.find(t => t.property("Palette") == "bg").property("Palette Color").toString();
//         globalPalette[i*4+1] = pal.tiles.find(t => t.property("Palette") == ""+i).property("Palette Color 1").toString();
//         globalPalette[i*4+2] = pal.tiles.find(t => t.property("Palette") == ""+i).property("Palette Color 2").toString();
//         globalPalette[i*4+3] = pal.tiles.find(t => t.property("Palette") == ""+i).property("Palette Color 3").toString();
//     }
//     globalPalettePath = pal.fileName;
//     loadPaletteAction.enabled = true;
// });

// setPaletteAction.enabled = true;
// setPaletteAction.text = "Set As Global Palette";
// setPaletteAction.iconVisibleInMenu = false;

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
    // { action: "ApplyPalette", before: "MapProperties" },
    { action: "Palette0", before: "MapProperties" },
    { action: "Palette1"},
    { action: "Palette2"},
    { action: "Palette3"},
    { separator: true },
]);

// tiled.extendMenu("Tileset", [
//     { action: "SetPalette", before: "TilesetProperties" },
//     { separator: true },
// ])

// tiled.assetCreated.connect(assetLoaded);
// tiled.assetOpened.connect(assetLoaded);
