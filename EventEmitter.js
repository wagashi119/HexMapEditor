/**
 * EventEmitter - リスナーパターンの基底クラス
 * subscribe, unsubscribe, notify の一元化
 */
class EventEmitter {
    constructor() {
        this.listeners = [];
    }

    /**
     * イベントリスナーを登録
     * @param {Function} listener - コールバック関数 (event, data) => {}
     */
    subscribe(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }
    }

    /**
     * イベントリスナーを削除
     * @param {Function} listener - 削除するリスナー
     */
    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    /**
     * 全リスナーに通知
     * @param {string} event - イベント名
     * @param {*} data - イベントデータ
     */
    notify(event, data) {
        this.listeners.forEach(listener => listener(event, data));
    }

    /**
     * 全リスナーをクリア
     */
    clearListeners() {
        this.listeners = [];
    }
}
