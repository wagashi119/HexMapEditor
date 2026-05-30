class BaseTool {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    execute(q, r, toolConfig) {
        throw new Error('execute() must be implemented');
    }
}

class GenerateTool extends BaseTool {
    execute(q, r, toolConfig) {

        const hex = Hex.fromData(toolConfig.config);
        this.dataManager.addHex(q, r, hex);

        toolConfig.set('id', toolConfig.config.id + 1);
    }
}

class DeleteTool extends BaseTool {
    execute(q, r, toolConfig) {
        this.dataManager.removeHex(q, r);
    }
}

class AdjustmentTool extends BaseTool {

    // ツールUIの設定とタイルの設定を入れ替える
    execute(q, r, toolConfig) {
        const hex = this.dataManager.getHex(q, r);
        //console.log(`Adjusting hex at (${q}, ${r}) with params:`, params);

        // ツールUIの設定をタイルに適用
        const hexSettings = Hex.fromData(toolConfig.config);
        this.dataManager.addHex(q, r, hexSettings);

        // タイルの設定をツールUIに適用
        toolConfig.import(JSON.parse(JSON.stringify(hex)));
    }
}

class CopyTool extends BaseTool {
    execute(q, r, toolConfig) {
        const hex = this.dataManager.getHex(q, r);
        if (hex) {
            //console.log(`Eyedropper: Picked hex at (${q}, ${r}):`, hex);

            toolConfig.set('color', hex.color, true);
            toolConfig.set('borderColor', hex.borderColor || '#000000', true);
            toolConfig.set('borderWidth', hex.borderWidth || 1, true);
            toolConfig.set('category', hex.category, true);
            toolConfig.set('id', hex.id + 1);
        }
    }
}

class NumberTool extends BaseTool {
    execute(q, r, toolConfig) {
        let hex = this.dataManager.getHex(q, r);
        if (hex) {
            hex.id = toolConfig.get('id') || 1;
            hex.category = toolConfig.get('category');
            this.dataManager.addHex(q, r, hex); // 更新

            toolConfig.set('id', toolConfig.config.id + 1);
        }
    }
}

class ToolFactory {
    static createTool(toolType, dataManager) {
        switch (toolType) {
            case 'generate':
                return new GenerateTool(dataManager);
            case 'delete':
                return new DeleteTool(dataManager);
            case 'copy':
                return new CopyTool(dataManager);
            case 'adjustment':
                return new AdjustmentTool(dataManager);
            case 'number':
                return new NumberTool(dataManager);
            default:
                throw new Error(`Unknown tool: ${toolType}`);
        }
    }
}