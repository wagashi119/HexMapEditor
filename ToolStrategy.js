class BaseTool {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    execute(q, r, params, toolConfig) {
        throw new Error('execute() must be implemented');
    }
}

class GenerateTool extends BaseTool {
    execute(q, r, params, toolConfig) {
        const hex = new Hex(
            params.color,
            params.borderColor,
            params.borderWidth,
            params.id,
            params.category
        );
        this.dataManager.addHex(q, r, hex);
    }
}

class DeleteTool extends BaseTool {
    execute(q, r, params, toolConfig) {
        this.dataManager.removeHex(q, r);
    }
}

class Adjustment extends BaseTool {

    // ツールUIの設定とタイルの設定を入れ替える
    execute(q, r, params, toolConfig) {
        const hex = this.dataManager.getHex(q, r);
        //console.log(`Adjusting hex at (${q}, ${r}) with params:`, params);

        // ツールUIの設定をタイルに適用
        const hexSettings = new Hex(
            params.color,
            params.borderColor,
            params.borderWidth,
            params.id,
            params.category
        );
        this.dataManager.addHex(q, r, hexSettings);

        // タイルの設定をツールUIに適用
        toolConfig.import(JSON.parse(JSON.stringify(hex)));
    }
}

class ToolFactory {
    static createTool(toolType, dataManager) {
        switch (toolType) {
            case 'generate':
                return new GenerateTool(dataManager);
            case 'delete':
                return new DeleteTool(dataManager);
            case 'adjustment':
                return new Adjustment(dataManager);
            default:
                throw new Error(`Unknown tool: ${toolType}`);
        }
    }
}