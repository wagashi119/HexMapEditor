class HexCoordinateSystem {
    static hexSize = 30;
    static heightMargin = 0; 
    static withMargin = 0;
    static offsetWidth = 0;
    static offsetHeight = 0;

    constructor() {
    }

    static toPixel(q, r, canvasWidth, canvasHeight) {
        const x = this.hexSize * (3/2 * q) + q*this.withMargin;
        const y = this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r) + r*this.heightMargin;
        return {
            x: x + canvasWidth / 2 + this.offsetWidth*this.hexSize,
            y: y + canvasHeight / 2 + this.offsetHeight*this.hexSize
        };
    }

    static toHex(x, y, canvasWidth, canvasHeight) {
        x -= canvasWidth / 2 + this.offsetWidth*this.hexSize;
        y -= canvasHeight / 2 + this.offsetHeight*this.hexSize;

        const xScale = this.hexSize * 3 / 2 + this.withMargin;
        const yQScale = this.hexSize * Math.sqrt(3) / 2;
        const yRScale = this.hexSize * Math.sqrt(3) + this.heightMargin;

        const q = x / xScale;
        const r = (y - yQScale * q) / yRScale;

        return this.round(q, r);
    }
    static toGenerickPixel(q, r, canvasWidth, canvasHeight) {
        const x = this.hexSize * (3/2 * q);
        const y = this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
        return {
            x: x + canvasWidth / 2,
            y: y + canvasHeight / 2
        };
    }

    static round(q, r) {
        const s = -q - r;
        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(s);

        const qDiff = Math.abs(rq - q);
        const rDiff = Math.abs(rr - r);
        const sDiff = Math.abs(rs - s);

        if (qDiff > rDiff && qDiff > sDiff) {
            rq = -rr - rs;
        } else if (rDiff > sDiff) {
            rr = -rq - rs;
        }

        return {q: rq, r: rr};
    }

    static getKey(q, r) {
        return `${q},${r}`;
    }

    static parseKey(key) {
        const [q, r] = key.split(',').map(Number);
        return {q, r};
    }

    static tileToCanvasSize(tileWidth, tileHeight) {
        if (typeof tileWidth !== 'number' || typeof tileHeight !== 'number') {
            throw new Error('tileWidth と tileHeight は数値で指定してください');
        }

        // 最外のタイルのピクセル位置を計算
        const maxQ = tileWidth - 1;
        const maxR = tileHeight - 1;
        const {x: maxX} = this.toGenerickPixel(maxQ, 0, 0, 0);
        const {y: maxY} = this.toGenerickPixel(0, maxR, 0, 0);

        const width = Math.ceil(maxX + this.hexSize);
        const height = Math.ceil(maxY + this.hexSize);
        return { width, height };
    }
}