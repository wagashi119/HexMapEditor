class BaseTool {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    execute(q, r, params) {
        throw new Error('execute() must be implemented');
    }
}

class GenerateTool extends BaseTool {
    execute(q, r, params) {
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
    execute(q, r) {
        this.dataManager.removeHex(q, r);
    }
}

class Adjustment extends BaseTool {
    execute(q, r, params) {
        const hex = this.dataManager.getHex(q, r);
        if (hex) {
            // hexのプロパティを調整できるwindowを表示
            console.log(`Adjusting hex at (${q}, ${r}) with params:`, params);
            console.log('Current hex data:', hex);

            // ここでwindowを表示して、ユーザーがhexのプロパティを変更できるようにする
            


        } else {
            console.log(`No hex found at (${q}, ${r}) to adjust.`);
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
            case 'adjustment':
                return new Adjustment(dataManager);
            default:
                throw new Error(`Unknown tool: ${toolType}`);
        }
    }
}