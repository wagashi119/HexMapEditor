/**
 * GridDrawHelper - グリッド描画ロジックの独立モジュール
 * MapEditor から描画ロジックを分離
 */
class GridDrawHelper {
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * グリッドを描画
     * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
     * @param {Array<Hex>} hexes - 既存のヘックスデータ（生成済み六角形）
     * @param {DrawConfig} config - 描画設定
     */
    drawGrid(context, hexes, config) {
        if (!config) return;

        // グリッドの描画範囲を計算
        const corners = [
            HexCoordinateSystem.toHex(0, 0, context.canvas.width, context.canvas.height),
            HexCoordinateSystem.toHex(context.canvas.width, 0, context.canvas.width, context.canvas.height),
            HexCoordinateSystem.toHex(0, context.canvas.height, context.canvas.width, context.canvas.height),
            HexCoordinateSystem.toHex(context.canvas.width, context.canvas.height, context.canvas.width, context.canvas.height)
        ];

        let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
        for (const c of corners) {
            minQ = Math.min(minQ, c.q);
            maxQ = Math.max(maxQ, c.q);
            minR = Math.min(minR, c.r);
            maxR = Math.max(maxR, c.r);
        }

        // パディングを追加
        const pad = 4;
        minQ -= pad;
        maxQ += pad;
        minR -= pad;
        maxR += pad;

        // グリッド内の全ての座標に対して六角形を描画（データがない場合）
        const existingHexCoords = new Set(hexes.map(h => `${h.q},${h.r}`));

        for (let q = minQ; q <= maxQ; q++) {
            for (let r = minR; r <= maxR; r++) {
                if (!existingHexCoords.has(`${q},${r}`)) {
                    this.renderer.drawHex(
                        context, q, r,
                        new DrawConfig({
                            fillColor: 'transparent',
                            strokeColor: config.strokeColor || '#000000',
                            lineWidth: config.lineWidth || 1
                        })
                    );
                }
            }
        }
    }

    /**
     * グリッドを描画（シンプル版）
     * @param {CanvasRenderingContext2D} context
     * @param {number} minQ
     * @param {number} maxQ
     * @param {number} minR
     * @param {number} maxR
     * @param {Set<string>} existingHexCoords - 既存六角形の座標セット
     * @param {DrawConfig} config
     */
    drawGridRange(context, minQ, maxQ, minR, maxR, existingHexCoords, config) {
        for (let q = minQ; q <= maxQ; q++) {
            for (let r = minR; r <= maxR; r++) {
                if (!existingHexCoords.has(`${q},${r}`)) {
                    this.renderer.drawHex(
                        context, q, r,
                        new DrawConfig({
                            fillColor: 'transparent',
                            strokeColor: config.strokeColor || '#000000',
                            lineWidth: config.lineWidth || 1
                        })
                    );
                }
            }
        }
    }
}
