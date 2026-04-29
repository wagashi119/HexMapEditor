class HexCoordinateSystem {
    constructor(hexSize = 30) {
        this.hexSize = hexSize;
        this.heightOffset = 0; // Add some spacing between hexes
        this.withOffset = 0; // Add some spacing between hexes
    }

    toPixel(q, r, canvasWidth, canvasHeight) {
        const x = this.hexSize * (3/2 * q) + q*this.withOffset;
        const y = this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r) + r*this.heightOffset;
        return {
            x: x + canvasWidth / 2,
            y: y + canvasHeight / 2
        };
    }

    toHex(x, y, canvasWidth, canvasHeight) {
        x -= canvasWidth / 2;
        y -= canvasHeight / 2;

        const xScale = this.hexSize * 3 / 2 + this.withOffset;
        const yQScale = this.hexSize * Math.sqrt(3) / 2;
        const yRScale = this.hexSize * Math.sqrt(3) + this.heightOffset;

        const q = x / xScale;
        const r = (y - yQScale * q) / yRScale;

        return this.round(q, r);
    }

    round(q, r) {
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

    getKey(q, r) {
        return `${q},${r}`;
    }

    parseKey(key) {
        const [q, r] = key.split(',').map(Number);
        return {q, r};
    }
}