class MapEditor {
    get currentColor() {
        return this.toolConfig.get('tileColor');
    }
    set currentColor(value) {        
        this.toolConfig.set('tileColor', value);
    }
    get currentBorderColor() {
        return this.toolConfig.get('BorderColor');
    }
    set currentBorderColor(value) {
        this.toolConfig.set('BorderColor', value);
    }
    get currentBorderWidth() {
        return this.toolConfig.get('BorderWidth');
    }
    set currentBorderWidth(value) {
        this.toolConfig.set('BorderWidth', value);
    }
    get currentCategory() {
        return this.toolConfig.get('category');
    }
    set currentCategory(value) {
        this.toolConfig.set('category', value);
    }
    get currentId() {
        return this.toolConfig.get('nextId');
    }
    set currentId(value) {
        this.toolConfig.set('nextId', value);
    }

    constructor(canvasId, overlayCanvasId, configManager) {
        this.canvas = document.getElementById(canvasId);
        this.overlayCanvas = document.getElementById(overlayCanvasId);
        this.ctx = this.canvas.getContext('2d');
        this.overlayCtx = this.overlayCanvas.getContext('2d');

        this.configManager = configManager;
        this.toolConfig = new ConfigManager();
        this.dataManager = new HexDataManager();
        this.renderer = new HexRenderer();
        this.gridHelper = new GridDrawHelper(this.renderer);

        this.currentTool = ToolFactory.createTool('generate', this.dataManager);
        this.presets = this.loadPresets();

        this._initialize();
    }

    _initialize() {
        // ConfigManager のフィールド登録（自動バインディング設定）
        this._registerConfigFields();
        
        this._attachEventListeners();
        this.dataManager.subscribe((event, data) => this._onDataChanged(event, data));
        this.configManager.subscribe((event, data) => this._onConfigChanged(event, data));
        this.configManager.applyToDOM(
            config => ({
                // タイル番号表示
                showTileNumbers: true,
                tileNumberColor: '#000000',
                tileNumberAlign: 'center',
                
                // グリッド表示
                showGrid: true,
                borderColor: '#000000',
                borderWidth: 1,           // NEW: グリッド枠線幅
                
                // ハイライト表示
                highlightInterval: 5,
                highlightColor: '#000000',
                highlightWidth: 2,        // NEW: ハイライト枠線幅
                
                // キャンバス設定
                tileCols: 26,
                tileRows: 17,
                marginWidth: 0,
                marginHeight: 0,
                offsetWidth: 0,
                offsetHeight: 0,
                opacity: 0.8
            })
        );
        this.toolConfig.applyToDOM({
            tileColor: '#506ab9',
            BorderColor: '#7c84fe',
            BorderWidth: 1
        });
        this._drawColorPreview();
        this.updatePresetDropdown();
        this.render();
    }

    /**
     * ConfigManager に DOM フィールドを登録（自動バインディング）
     * @private
     */
    _registerConfigFields() {
        // 設定フィールドを一括登録
        this.configManager.registerFields([
            // タイル番号表示
            { domId: 'showTileNumbers', configKey: 'showTileNumbers', type: 'checkbox' },
            { domId: 'tileNumberColor', configKey: 'tileNumberColor', type: 'color' },
            { domId: 'tileNumberAlign', configKey: 'tileNumberAlign', type: 'select' },
            
            // グリッド表示
            { domId: 'showGrid', configKey: 'showGrid', type: 'checkbox' },
            { domId: 'borderColor', configKey: 'borderColor', type: 'color' },
            { domId: 'borderWidth', configKey: 'borderWidth', type: 'number' },
            
            // ハイライト表示
            { domId: 'showHighlight', configKey: 'showHigh', type: 'checkbox'},
            { domId: 'highlightInterval', configKey: 'highlightInterval', type: 'number' },
            { domId: 'highlightColor', configKey: 'highlightColor', type: 'color' },
            { domId: 'highlightWidth', configKey: 'highlightWidth', type: 'number' },
            
            // キャンバス設定
            { domId: 'tileCols', configKey: 'tileCols', type: 'number' },
            { domId: 'tileRows', configKey: 'tileRows', type: 'number' },
            { domId: 'marginWidth', configKey: 'marginWidth', type: 'number' },
            { domId: 'marginHeight', configKey: 'marginHeight', type: 'number' },
            { domId: 'offsetWidth', configKey: 'offsetWidth', type: 'number' },
            { domId: 'offsetHeight', configKey: 'offsetHeight', type: 'number' },
            { domId: 'opacity', configKey: 'opacity', type: 'range' },
        ]);
        this.toolConfig.registerFields([
            { domId: 'colorInput', configKey: 'tileColor', type: 'color' },
            { domId: 'tileBorderColor', configKey: 'BorderColor', type: 'color' },
            { domId: 'lineWidthInput', configKey: 'BorderWidth', type: 'number' },
            { domId: 'categorySelect', configKey: 'category', type: 'select' },
            { domId: 'categoryIdInput', configKey: 'nextId', type: 'number' }
        ]);
    }

    _attachEventListeners() {
        this.toolConfig.subscribe((event, data) => {
            if (event === 'configChanged') {
                this._drawColorPreview();
            }
            // カテゴリが変化していたらリセット
            if (data.key === 'category') {
                this.toolConfig.set('nextId', 1, true);
            }

            document.getElementById('colorLabel').style.color = this.currentColor;
            document.getElementById('borderColorLabel').style.color = this.currentBorderColor;
        });
        
        this.canvas.addEventListener('mousedown', (e) => this._handleCanvasClick(e));
        document.getElementById('toolSelect').addEventListener('change', (e) => {
            this.setTool(e.target.value);
        });
        document.getElementById('backGround').addEventListener('change', (e) => this.changeBackGround(e))
        document.getElementById('exportBtn').addEventListener('click', () => this._exportImage());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this._exportJSON());
        document.getElementById('applySettingsBtn').addEventListener('click', () => this._applySettings());
        document.getElementById('presetSelect').addEventListener('change', (e) => this._onPresetChange(e));
        document.getElementById('addPresetBtn').addEventListener('click', () => this._onAddPreset());
        document.getElementById('deletePresetBtn').addEventListener('click', () => this._onDeletePreset());
    }

    _handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const {q, r} = HexCoordinateSystem.toHex(x, y, this.canvas.width, this.canvas.height);

        if (e.button === 1) {
            // webの既存操作はキャンセル
            e.preventDefault();
            this._eyedropper(q, r);
            return;
        }
        if (e.button === 2) {
            //console.warn('右クリックは現在サポートされていません。');
            e.preventDefault();

            ToolFactory.createTool('delete', this.dataManager).execute(q, r, {
                color: this.currentColor,
                borderColor: this.currentBorderColor,
                borderWidth: this.currentBorderWidth,
                id: this.currentId,
                category: this.currentCategory
            });
            return;
        }

        if (this.currentTool) {
            this.currentTool.execute(q, r, {
                color: this.currentColor,
                borderColor: this.currentBorderColor,
                borderWidth: this.currentBorderWidth,
                id: this.currentId,
                category: this.currentCategory
            });
        }
    }

    setTool(toolType) {
        this.currentTool = ToolFactory.createTool(toolType, this.dataManager);
    }

    _eyedropper(q, r) {
        const hex = this.dataManager.getHex(q, r);
        if (hex) {
            //console.log(`Eyedropper: Picked hex at (${q}, ${r}):`, hex);

            this.currentColor = hex.color;
            this.currentBorderColor = hex.borderColor || '#000000';
            this.currentBorderWidth = hex.borderWidth || 1;
            this.currentCategory = hex.category;
            this.currentId = hex.id + 1;
            this._drawColorPreview();
        }
    }

    _onDataChanged() {
        this.render();
    }

    _onConfigChanged(event, data) {
        this.render();

        // size関連の変更があったら、サイズ設定の背景を変える
        if (event === 'configChanged' && (data.key === 'tileCols' || data.key === 'tileRows' || data.key === 'marginWidth' || data.key === 'marginHeight' || data.key === 'offsetWidth' || data.key === 'offsetHeight')) {
            
            const { width, height } = HexCoordinateSystem.tileToCanvasSize(this.configManager.get('tileCols'), this.configManager.get('tileRows'));
            const settings = document.getElementById('sizeSetting');
            const btn = document.getElementById('applySettingsBtn');
            // 元の設定に戻ったら背景色も戻す
            if (width === this.canvas.width && height === this.canvas.height && HexCoordinateSystem.withMargin === this.configManager.get('marginWidth') && HexCoordinateSystem.heightMargin === this.configManager.get('marginHeight') && HexCoordinateSystem.offsetWidth === this.configManager.get('offsetWidth') && HexCoordinateSystem.offsetHeight === this.configManager.get('offsetHeight')) {
                settings.style.backgroundColor = '#e7e7e7';
                btn.style.backgroundColor = 'rgb(240, 240, 240)';

            } else {
                settings.style.backgroundColor = '#e6cfcf';
                btn.style.backgroundColor = '#ffffff';
            }
        }
    }

    changeBackGround(e) {

        const file = e.target.files[0];
        console.log(file, file === undefined, !file, file === null);

        if (file) {
            //console.log(file)
            const imageUrl = URL.createObjectURL(file);
            document.getElementById('canvasContainer').style.backgroundImage = `url("${imageUrl}")`;
        } else {
            document.getElementById('canvasContainer').style.backgroundImage = '';
        }
    }

    render() {
        this._clearCanvas()
        this._drawGrid();
        this._drawHexes();
        this._drawHighlights();
        this._drawColorPreview();
    }

    _clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    }

    /**
     * グリッドを描画
     * @private
     */
    _drawGrid() {
        if (!this.configManager.get('showGrid')) return;

        const gridConfig = new DrawConfig({
            fillColor: 'transparent',
            strokeColor: this.configManager.get('borderColor'),
            lineWidth: this.configManager.get('borderWidth')
        });

        this.gridHelper.drawGrid(this.ctx, this.dataManager.getAllHexes(), gridConfig);
    }

    /**
     * タイルを描画
     * @private
     */
    _drawHexes() {
        const defaultBorderColor = this.configManager.get('borderColor');
        const showNumbers = this.configManager.get('showTileNumbers');
        const opacity = this.configManager.get('opacity');

        let textConfig = null;
        if (showNumbers) {
            textConfig = new DrawConfig({
                textColor: this.configManager.get('tileNumberColor'),
                textAlign: this.configManager.get('tileNumberAlign'),
                fontSize: 12,
                fontFamily: 'Arial'
            })
        }
        this.renderer.drawHexes(this.ctx, this.dataManager.getAllHexes(), opacity, textConfig)
    }

    /**
     * ハイライトを描画
     * @private
     */
    _drawHighlights() {

        // configManagerからハイライト設定を取得する予定
        if (!this.configManager.get('showHigh')) return;

        const interval = this.configManager.get('highlightInterval');
        const color = this.configManager.get('highlightColor');
        const lineWidth = this.configManager.get('highlightWidth');

        this.dataManager.getAllHexes().forEach(hex => {
            if (hex.q % interval === 0 || hex.r % interval === 0) {
                const highlightConfig = new DrawConfig({
                    strokeColor: color,
                    lineWidth: lineWidth
                });
                this.renderer.drawHexOutline(this.overlayCtx, hex.q, hex.r, highlightConfig);
            }
        });
    }

    /**
     * カラープレビュー描画
     * @private
     */
    _drawColorPreview() {
        const canvas = document.getElementById('colorPreview');
        if (!canvas) return;

        // プレビューキャンバスに描画
        const ctx = canvas.getContext('2d');
        ctx.globalAlpha = configManager.get('opacity');
        const path = this.renderer._createHexPath(30, 30, 30);
        ctx.clearRect(0, 0, 60, 60);
        ctx.fillStyle = this.currentColor;
        ctx.fillRect(0, 0, 60, 60);
        ctx.strokeStyle = this.currentBorderColor;
        ctx.lineWidth = this.currentBorderWidth * 1.5;
        ctx.stroke(path);

        if (this.configManager.get('showTileNumbers')) {
            const textConfig = new DrawConfig({
                textColor: this.configManager.get('tileNumberColor'),
                textAlign: this.configManager.get('tileNumberAlign'),
                fontSize: 12,
                fontFamily: 'Arial'
            });
            this.renderer.drawHexText(
                ctx, 0, 0,
                `${this.currentCategory}-${this.currentId}`,
                textConfig
            );
        }
    }

    /**
     * 設定を適用（キャンバスサイズ更新）
     * @private
     */
    _applySettings() {

        // マージンを座標システムに反映
        HexCoordinateSystem.withMargin = this.configManager.get('marginWidth');
        HexCoordinateSystem.heightMargin = this.configManager.get('marginHeight');
        HexCoordinateSystem.offsetWidth = this.configManager.get('offsetWidth');
        HexCoordinateSystem.offsetHeight = this.configManager.get('offsetHeight');

        // キャンバスサイズを更新
        this._setCanvasSizeByTiles(
            this.configManager.get('tileCols'),
            this.configManager.get('tileRows')
        );

        // 表示を元に戻す
        document.getElementById('sizeSetting').style.backgroundColor = '#e7e7e7';
        document.getElementById('applySettingsBtn').style.backgroundColor = 'rgb(240, 240, 240)';
    }

    /**
     * タイル数からキャンバスサイズを計算して設定
     * @private
     */
    _setCanvasSizeByTiles(cols, rows) {
        const { width, height } = HexCoordinateSystem.tileToCanvasSize(cols, rows);

        this.canvas.width = width;
        this.canvas.height = height;
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;
        document.getElementById('canvasContainer').style.width = width + 'px';
        document.getElementById('canvasContainer').style.height = height + 'px';

        this.render();
    }

    _exportImage() {
        const filename = prompt('名前を入力', 'hexmap.png');
        //console.log(filename);
        if (filename === null) return;

        const opacity = parseFloat(document.getElementById('opacity').value);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.globalAlpha = opacity;
        tempCtx.drawImage(this.canvas, 0, 0);
        tempCtx.drawImage(this.overlayCanvas, 0, 0);
        const link = document.createElement('a');
        link.download = filename || 'hexmap.png';
        link.href = tempCanvas.toDataURL();
        link.click();
    }

    _exportJSON() {
        const filename = prompt('名前を入力', 'hexmap.json');
        //console.log(filename);
        if (filename === null) return;

        const data = this._collectMapData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'hexmap.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * マップデータを収集（エクスポート用）
     * @private
     */
    _collectMapData() {
        return {
            version: 1.1,
            canvas: {
                width: this.canvas.width,
                height: this.canvas.height
            },
            settings: {
                ...this.configManager.export(),
            },
            tool: {
                ...this.toolConfig.export(),
            },
            hexes: this.dataManager.getAllHexes()
        };
    }

    /**
     * JSON データをインポート
     */
    importJSON(text) {
        let data;
        try {
            data = JSON.parse(text);
        } catch (error) {
            throw new Error('JSON の解析に失敗しました。');
        }
        this._setMapData(data);
    }

    /**
     * マップデータを設定
     * @private
     */
    _setMapData(data) {
        if (!data || !Array.isArray(data.hexes)) {
            throw new Error('有効なマップデータ(JSON)ではありません。"hexes" 配列が必要です。');
        }
        // ツール設定を復元
        let toolSetting = data.tool;
        let configSeting = data.setting;
        if (data.version === 1) {
            toolSetting = data.setting;
        }

        // ヘックスデータを復元
        this.dataManager.clear();
        let maxId = 0;
        console.log('Importing hexes:', data.hexes);
        data.hexes.forEach((hex) => {
            if (typeof hex.q !== 'number' || typeof hex.r !== 'number') {
                throw new Error('hexes の各要素には数値の q, r が必要です。');
            }
            const key = `${hex.q},${hex.r}`;
            //console.log(`Importing hex at (${hex.q}, ${hex.r}) with data:`, hex);
            this.dataManager.addHex(hex.q, hex.r, Hex.convertToData(hex));
            if (typeof hex.id === 'number' && hex.id > maxId) {
                maxId = hex.id;
            }
        });

        this.currentId = Math.max(maxId + 1, 1);

        // キャンバスサイズを復元
        if (data.canvas && typeof data.canvas.width === 'number' && typeof data.canvas.height === 'number') {
            this.canvas.width = data.canvas.width;
            this.canvas.height = data.canvas.height;
            this.overlayCanvas.width = data.canvas.width;
            this.overlayCanvas.height = data.canvas.height;
            document.getElementById('canvasContainer').style.width = data.canvas.width + 'px';
            document.getElementById('canvasContainer').style.height = data.canvas.height + 'px';
        }

        // 設定を復元
        if (data.settings) {
            this.configManager.applyToDOM(data.settings);
        }

        if (toolSetting) {
            if (toolSetting.category) {
                this.currentCategory = toolSetting.category;
            }
            if (typeof toolSetting.nextId === 'number') {
                this.currentId = toolSetting.nextId;
            }
            if (toolSetting.currentColor) this.currentColor = toolSetting.currentColor;
            if (toolSetting.currentBorderColor) this.currentBorderColor = toolSetting.currentBorderColor;
            if (toolSetting.currentBorderWidth) this.currentBorderWidth = toolSetting.currentBorderWidth;
        }
        
        this._drawColorPreview();
        this.render();
    }

    loadPresets() {
        let stored = localStorage.getItem('hexMap-colorPresets');
        return stored ? JSON.parse(stored) : [];
    }

    savePresets() {
        localStorage.setItem('hexMap-colorPresets', JSON.stringify(this.presets));
    }

    addPreset(name, hex) {
        const existingIndex = this.presets.findIndex(p => p.name === name);
        if (existingIndex >= 0) {
            this.presets[existingIndex] = { name, tileColor: hex.color, borderColor: hex.borderColor, borderWidth: hex.borderWidth };
        } else {
            this.presets.push({ name, tileColor: hex.color, borderColor: hex.borderColor, borderWidth: hex.borderWidth});
        }
        this.savePresets();
        this.updatePresetDropdown();
    }

    deletePreset(name) {
        this.presets = this.presets.filter(p => p.name !== name);
        this.savePresets();
        this.updatePresetDropdown();
    }

    updatePresetDropdown() {
        const select = document.getElementById('presetSelect');
        if (!select) return;
        select.innerHTML = '<option value="">プリセットを選択</option>';
        this.presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.name;
            option.textContent = preset.name;
            select.appendChild(option);
        });
    }

    _onPresetChange(e) {
        const name = e.target.value;
        if (!name) return;
        const preset = this.presets.find(p => p.name === name);
        if (preset) {
            this.currentColor = preset.tileColor;
            this.currentBorderColor = preset.borderColor;
            this.currentBorderWidth = preset.borderWidth || 1;
            document.getElementById('colorInput').value = this.currentColor;
            document.getElementById('tileBorderColor').value = this.currentBorderColor;
            document.getElementById('lineWidthInput').value = this.currentBorderWidth;
            this._drawColorPreview();
        }
    }

    _onAddPreset() {
        const name = document.getElementById('presetNameInput').value.trim();
        if (name) {
            this.addPreset(name, new Hex(
                this.currentColor,
                this.currentBorderColor,
                this.currentBorderWidth
            ));
            document.getElementById('presetNameInput').value = '';
        } else {
            alert('プリセット名を入力してください。');
        }
    }

    _onDeletePreset() {
        const select = document.getElementById('presetSelect');
        const name = select.value;
        if (name) {
            this.deletePreset(name);
        } else {
            alert('削除するプリセットを選択してください。');
        }
    }
}