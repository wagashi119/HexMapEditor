class Hex {
    constructor(color, borderColor, borderWidth = 1, id, category) {
        this.color = color;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.id = id;
        this.category = category;
    }

    GetDrawData() {
        return {
            color: this.color,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth
        };
    }

    GetID() {
        return `${this.category}-${this.id}`;
    }

    static convertToData(data) {
        return new Hex(
            data.color || '#ff0000',
            data.borderColor || '#000000',
            data.borderWidth || 1,
            typeof data.id === 'number' ? data.id : 1,
            data.category || 'A'
        );
    }
}


class HexDataManager extends EventEmitter {
    constructor() {
        super();
        this.hexes = {};
    }

    addHex(q, r, hex) {
        const key = `${q},${r}`;
        this.hexes[key] = hex;
        //console.log(`Hex added at (${q}, ${r}):`, hex);
        this.notify('hexAdded', {q, r, hex});
    }

    removeHex(q, r) {
        const key = `${q},${r}`;
        const hex = this.hexes[key];
        delete this.hexes[key];
        this.notify('hexRemoved', {q, r, hex});
    }

    getHex(q, r) {
        const key = `${q},${r}`;
        return this.hexes[key];
    }

    getAllHexes() {
        return Object.entries(this.hexes).map(([key, hex]) => {
            const [q, r] = key.split(',').map(Number);
            return {q, r, ...hex};
        });
    }

    /**
     * 旧メソッド: リスナー登録（EventEmitter に移行）
     * @deprecated super.subscribe() を使用してください
     */
    subscribe(listener) {
        super.subscribe(listener);
    }

    /**
     * 旧メソッド: リスナー通知（EventEmitter に移行）
     * @deprecated super.notify() を使用してください
     */
    notify(event, data) {
        super.notify(event, data);
    }

    clear() {
        this.hexes = {};
        this.nextId = 1;
        this.notify('dataCleared', {});
    }
}