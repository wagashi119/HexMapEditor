class HexCoordinateSystem {
    static hexSize = 30;
    static heightMargin = 0; 
    static withMargin = 0;
    static offsetWidth = 0;
    static offsetHeight = 0;
    static orientation = false; // 'pointy'(false) or 'flat'(true)

    constructor(orientation = false) {
        HexCoordinateSystem.orientation = orientation;
    }

    static setOrientation(orientation) {
        if (typeof orientation !== 'boolean') {
            throw new Error('Orientation must be a boolean value');
        }
        this.orientation = orientation;
    }

    static getOrientation() {
        return this.orientation;
    }

    static toPixel(q, r, canvasWidth, canvasHeight) {
        let x, y;
        
        if (this.orientation === false) {
            // Pointy-top orientation
            x = this.hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r) + q * this.withMargin;
            y = this.hexSize * (3 / 2 * r) + r * this.heightMargin;
        } else {
            // Flat-top orientation (default)
            x = this.hexSize * (3 / 2 * q) + q * this.withMargin;
            y = this.hexSize * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r) + r * this.heightMargin;
        }
        
        return {
            x: x + canvasWidth / 2 + this.offsetWidth * this.hexSize,
            y: y + canvasHeight / 2 + this.offsetHeight * this.hexSize
        };
    }

    static toHex(x, y, canvasWidth, canvasHeight) {
        x -= canvasWidth / 2 + this.offsetWidth * this.hexSize;
        y -= canvasHeight / 2 + this.offsetHeight * this.hexSize;

        let q, r;
        
        if (this.orientation === false) {
            // Pointy-top orientation
            const xScale = this.hexSize * Math.sqrt(3) + this.withMargin;
            const yScale = this.hexSize * 3 / 2 + this.heightMargin;
            
            q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / this.hexSize;
            r = (2 / 3 * y) / this.hexSize;
        } else {
            // Flat-top orientation (default)
            const xScale = this.hexSize * 3 / 2 + this.withMargin;
            const yQScale = this.hexSize * Math.sqrt(3) / 2;
            const yRScale = this.hexSize * Math.sqrt(3) + this.heightMargin;

            q = x / xScale;
            r = (y - yQScale * q) / yRScale;
        }

        return this.round(q, r);
    }
    static toGenerickPixel(q, r, canvasWidth, canvasHeight) {
        let x, y;
        
        if (this.orientation === false) {
            // Pointy-top orientation
            x = this.hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
            y = this.hexSize * (3 / 2 * r);
        } else {
            // Flat-top orientation (default)
            x = this.hexSize * (3 / 2 * q);
            y = this.hexSize * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
        }
        
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