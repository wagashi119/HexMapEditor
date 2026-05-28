class ConfigManager extends EventEmitter {
    constructor(domPrefix = '') {
        super();
        this.domPrefix = domPrefix;
        this.registeredFields = {}; // フィールド登録情報

        this.config = {
        };
    }

    get(key) {
        if (!(key in this.config)) {
            console.warn(`ConfigManager: Key "${key}" not found in config.`);
            return undefined;
        }
        return this.config[key];
    }

    set(key, value, silent=false) {
        if (this.config[key] !== value) {
            this.config[key] = value;
            if (this.registeredFields[key].type !== 'file') {

                if (this.registeredFields[key].type === 'checkbox') {
                    this.registeredFields[key].element.checked = value;
                }
                this.registeredFields[key].element.value = value; // DOM にも反映
            }
            if (!silent) this.notify('configChanged', {key, value});
        }
    }

    /**
     * DOM フィールドを設定に登録し、自動バインディングを設定
     * @param {string} domId - DOM 要素の ID
     * @param {string} configKey - 設定キー（省略時は domId をキャメルケース化）
     * @param {string} type - 入力タイプ ('text', 'number', 'checkbox', 'color', 'range')
     */
    registerField(domId, configKey = null, type = null) {
        const element = document.getElementById(domId);
        if (!element) {
            console.warn(`ConfigManager: Element not found for ID: ${domId}`);
            return;
        }

        // configKey が指定されない場合、domId をキャメルケース化
        const key = configKey || this._toCamelCase(domId);
        const fieldType = type || element.getAttribute('type') || element.tagName.toLowerCase();
        if (fieldType === 'file') console.warn(`typeが${fieldType}のバインディング処理を検知しました。\n set関数のDOM変更が機能しない点にご注意ください`);

        // 登録情報を保存
        this.registeredFields[key] = {domId, element: element, type: fieldType};

        // DOM から値を読み込み
        this._loadFieldValue(element, key, fieldType);

        // DOM 変更リスナーを設定
        element.addEventListener('change', () => {
            this._loadFieldValue(element, key, fieldType);
            this.applyToDOM({[key]: this.config[key]});
        });
        
        // リアルタイム更新（range/number）
        if (fieldType === 'range' || fieldType === 'number') {
            element.addEventListener('input', () => {
                this._loadFieldValue(element, key, fieldType);
            });
        }
    }

    /**
     * DOM 要素から値を読み込んで config に反映
     * @private
     */
    _loadFieldValue(element, key, fieldType) {
        let value;
        if (fieldType === 'checkbox') {
            value = element.checked;
        } else if (fieldType === 'number' || fieldType === 'range') {
            value = parseFloat(element.value) || 0;
        } else if (fieldType === 'color') {
            value = element.value;
        } else {
            value = element.value;
        }
        this.set(key, value);
    }

    /**
     * キャメルケースに変換（snakeCase/kebab-case → camelCase）
     * @private
     */
    _toCamelCase(str) {
        return str.replace(/[-_]([a-z])/g, (match, letter) => letter.toUpperCase());
    }

    /**
     * 複数フィールドを一括登録
     * @param {Array} fields - [{domId, configKey, type}, ...] の配列
     */
    registerFields(fields) {
        fields.forEach(({domId, configKey, type}) => {
            this.registerField(domId, configKey, type);
        });
    }

    /**
     * 旧メソッド: DOM から複数フィールドを読み込み（後方互換性）
     * @deprecated registerField を使用してください
     */
    loadFromDOM(elementIds) {
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const type = element.type;
                const value = type === 'checkbox' ? element.checked :
                              type === 'number' || type === 'range' ?
                              parseFloat(element.value) : element.value;
                const key = this._toCamelCase(id);
                this.config[key] = value;
            }
        });
    }

    /**
     * 設定を DOM に適用
     */
    applyToDOM(config) {
        Object.entries(config).forEach(([key, value]) => {
            if (!this.registeredFields[key]) return; 

            this.set(key, value);
        });
        this.notify('configImported', this.config);
    }


    /**
     * 設定をエクスポート
     */
    export() {
        return JSON.parse(JSON.stringify(this.config));
    }

    /**
     * 設定をインポート（不足フィールドはデフォルト値で補完）
     */
    import(config) {
        // デフォルト値と入力を merge
        const merged = {
            ...this.config,
            ...config
        };
        console.log(merged);
        Object.assign(this.config, merged);
        this.notify('configImported', this.config);
        
        // DOM に反映
        this.applyToDOM(this.config);
    }
}