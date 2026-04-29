/**
 * DrawConfig - 描画設定の構造化クラス
 * 六角形の描画に必要なすべての設定を統一的に管理
 */
class DrawConfig {
    constructor(options = {}) {
        // 塗りつぶし色
        this.fillColor = options.fillColor || '#ff0000';
        
        // 枠線色
        this.strokeColor = options.strokeColor || '#000000';
        
        // 枠線幅
        this.lineWidth = options.lineWidth || 1;
        
        // テキスト色
        this.textColor = options.textColor || '#000000';
        
        // テキスト配置 ('center', 'left', 'right')
        this.textAlign = options.textAlign || 'center';
        
        // テキストサイズ (ピクセル)
        this.fontSize = options.fontSize || 12;
        
        // テキストフォント
        this.fontFamily = options.fontFamily || 'Arial';
        
        // 透明度
        this.opacity = options.opacity !== undefined ? options.opacity : 1;
    }

    /**
     * 複数オプションを一括更新
     * @param {Object} options - 更新するオプション
     */
    update(options) {
        Object.assign(this, options);
        return this;
    }

    /**
     * フォント文字列を生成
     * @returns {string} フォント指定文字列
     */
    getFontString() {
        return `${this.fontSize}px ${this.fontFamily}`;
    }

    /**
     * 設定を複製
     * @returns {DrawConfig} 新しい DrawConfig インスタンス
     */
    clone() {
        return new DrawConfig({
            fillColor: this.fillColor,
            strokeColor: this.strokeColor,
            lineWidth: this.lineWidth,
            textColor: this.textColor,
            textAlign: this.textAlign,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            opacity: this.opacity
        });
    }

    /**
     * 設定をプレーンオブジェクトに変換
     * @returns {Object} プレーンオブジェクト
     */
    toObject() {
        return {
            fillColor: this.fillColor,
            strokeColor: this.strokeColor,
            lineWidth: this.lineWidth,
            textColor: this.textColor,
            textAlign: this.textAlign,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            opacity: this.opacity
        };
    }
}
