class HexRenderer {
    constructor() {
        this.hexPathCache = {}; // 六角形パスのキャッシュ
    }

    /**
     * 六角形の Path2D を生成（ジオメトリ計算の一元化）
     * @param {number} pixelX - ピクセル座標 X
     * @param {number} pixelY - ピクセル座標 Y
     * @param {number} size - 六角形サイズ（半径）
     * @returns {Path2D} 六角形のパス
     */
    _createHexPath(pixelX, pixelY, size = HexCoordinateSystem.hexSize) {
        const path = new Path2D();
        // オリエンテーションに応じて開始角度を調整
        const startAngle = HexCoordinateSystem.orientation === false ? Math.PI / 6 : 0;
        
        for (let i = 0; i < 6; i++) {
            const angle = startAngle + (Math.PI / 3) * i;
            const hx = pixelX + size * Math.cos(angle);
            const hy = pixelY + size * Math.sin(angle);
            if (i === 0) path.moveTo(hx, hy);
            else path.lineTo(hx, hy);
        }
        path.closePath();
        return path;
    }

    /**
     * 六角形を描画（DrawConfig 対応）
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} q - 六角座標 Q
     * @param {number} r - 六角座標 R
     * @param {string|DrawConfig} colorOrConfig - 色 または DrawConfig オブジェクト
     * @param {string} [borderColor] - 枠線色（DrawConfig 非使用時）
     * @param {number} [lineWidth] - 枠線幅（DrawConfig 非使用時）
     */
    drawHex(context, q, r, colorOrConfig, borderColor = '#000', lineWidth = 1) {
        const {x, y} = HexCoordinateSystem.toPixel(
            q, r, context.canvas.width, context.canvas.height
        );

        // DrawConfig か従来のパラメータか判定
        const config = colorOrConfig instanceof DrawConfig ? 
            colorOrConfig : 
            new DrawConfig({
                fillColor: colorOrConfig,
                strokeColor: borderColor,
                lineWidth: lineWidth
            });

        const path = this._createHexPath(x, y);
        
        // 塗りつぶし
        context.fillStyle = config.fillColor;
        context.globalAlpha = config.opacity;
        context.fill(path);
        
        // 枠線
        context.strokeStyle = config.strokeColor;
        context.lineWidth = config.lineWidth;
        context.globalAlpha = 1.0;
        context.stroke(path);
    }

    /**
     * 六角形の枠線のみ描画（ハイライト用）
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} q - 六角座標 Q
     * @param {number} r - 六角座標 R
     * @param {string|DrawConfig} colorOrConfig - 色 または DrawConfig オブジェクト
     * @param {number} [lineWidth] - 枠線幅（DrawConfig 非使用時）
     */
    drawHexOutline(context, q, r, colorOrConfig, lineWidth = 1) {
        const {x, y} = HexCoordinateSystem.toPixel(
            q, r, context.canvas.width, context.canvas.height
        );

        // DrawConfig か従来のパラメータか判定
        const config = colorOrConfig instanceof DrawConfig ? 
            colorOrConfig : 
            new DrawConfig({
                strokeColor: colorOrConfig,
                lineWidth: lineWidth
            });

        const path = this._createHexPath(x, y);
        context.strokeStyle = config.strokeColor;
        context.lineWidth = config.lineWidth;
        context.stroke(path);
    }

    /**
     * 六角形にテキストを描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {number} q - 六角座標 Q
     * @param {number} r - 六角座標 R
     * @param {string} text - 描画するテキスト
     * @param {string|DrawConfig} colorOrConfig - 色 または DrawConfig オブジェクト
     * @param {string} [align] - テキスト配置（DrawConfig 非使用時）
     */
    drawHexText(context, q, r, text, colorOrConfig, align = 'center') {
        const {x, y} = HexCoordinateSystem.toPixel(
            q, r, context.canvas.width, context.canvas.height
        );

        // DrawConfig か従来のパラメータか判定
        const config = colorOrConfig instanceof DrawConfig ? 
            colorOrConfig : 
            new DrawConfig({
                textColor: colorOrConfig,
                textAlign: align,
                fontSize: 12,
                fontFamily: 'Arial'
            });

        context.fillStyle = config.textColor;
        context.font = config.getFontString();
        context.textAlign = config.textAlign;
        context.textBaseline = 'middle';
        context.fillText(text, x, y);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     * @param {Object[]} hexes 
     * @param {number} opacity
     * @param {DrawConfig} textConfig
     */
    drawHexes(context, hexes, opacity, textConfig, defaultBorderColor="#000000aa") {
        hexes.sort((a,b) => a.borderWidth-b.borderWidth); 

        hexes.forEach(hex => {
            // hex 固有の値、またはデフォルト値を使用
            const hexBorderColor = hex.borderColor || defaultBorderColor;
            const hexLineWidth = hex.borderWidth !== undefined ? hex.borderWidth : 1;
            
            // DrawConfig を使用した統一的な描画
            const drawConfig = new DrawConfig({
                fillColor: hex.color,
                strokeColor: hexBorderColor,
                lineWidth: hexLineWidth,
                opacity: opacity
            });
            
            this.drawHex(context, hex.q, hex.r, drawConfig);

            // テキスト描画
            if (textConfig) {
                this.drawHexText(
                    context, hex.q, hex.r,
                    hex.GetID(),
                    textConfig
                );
            }
        });
    }

    /**
     * キャッシュをクリア（メモリ管理用）
     */
    clearCache() {
        this.hexPathCache = {};
    }
}