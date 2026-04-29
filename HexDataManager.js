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
        return this.category+"-"+this.id;
    }
}


class HexDataManager extends EventEmitter {
    constructor() {
        super();
        this.hexes = {};
        this.nextId = 1;
        this.category = 'A';
    }

    addHex(q, r, hex) {
        const key = `${q},${r}`;
        this.hexes[key] = hex;
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

    setNextId(id) {
        this.nextId = id;
    }

    getNextId() {
        return this.nextId++;
    }

    setCategory(category) {
        this.category = category;
        this.nextId = 1;
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