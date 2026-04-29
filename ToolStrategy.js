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

class ToolFactory {
    static createTool(toolType, dataManager) {
        switch (toolType) {
            case 'generate':
                return new GenerateTool(dataManager);
            case 'delete':
                return new DeleteTool(dataManager);
            default:
                throw new Error(`Unknown tool: ${toolType}`);
        }
    }
}