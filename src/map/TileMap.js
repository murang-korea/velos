/**
 * TileMap Class
 * 타일 기반 맵 생성, 렌더링 및 타일 충돌 판정 담당
 */
export default class TileMap {
    constructor(config) {
        // 데이터 구조 정의 (추후 외부 JSON 로드 방식)
        this.tileSize = config.tileSize || 64;
        this.mapData = config.data || [[]];
        this.cols = this.mapData[0].length;
        this.rows = this.mapData.length;

        // 월드 전체 크기 계산
        this.worldWidth = this.cols * this.tileSize;
        this.worldHeight = this.rows * this.tileSize;

        // 충돌 타일 ID 정의 (예: 1번은 벽)
        this.COLLISION_TILES = [1];
    }

    /**
     * 월드 좌표를 타일 인덱스로 변환
     */
    getTileAt(worldX, worldY) {
        const col = Math.floor(worldX / this.tileSize);
        const row = Math.floor(worldY / this.tileSize);

        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            return this.mapData[row][col];
        }
        return -1; // 맵 밖
    }

    /**
     * 해당 좌표가 충돌 타일인지 확인
     * @param {number} worldX 
     * @param {number} worldY 
     * @returns {boolean}
     */
    isSolidTile(worldX, worldY) {
        const tileId = this.getTileAt(worldX, worldY);
        return this.COLLISION_TILES.includes(tileId);
    }

    /**
     * 맵 렌더링 (카메라 시야 내 타일만 그리는 최적화 가능)
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     */
    draw(ctx, camera) {
        // 성능 최적화: 화면에 보이는 타일 범위만 계산 (Culling)
        const startCol = Math.max(0, Math.floor(camera.x / this.tileSize));
        const endCol = Math.min(this.cols, Math.ceil((camera.x + camera.width / camera.zoom) / this.tileSize));
        const startRow = Math.max(0, Math.floor(camera.y / this.tileSize));
        const endRow = Math.min(this.rows, Math.ceil((camera.y + camera.height / camera.zoom) / this.tileSize));

        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const tileId = this.mapData[row][col];
                const posX = col * this.tileSize;
                const posY = row * this.tileSize;

                this.renderTile(ctx, tileId, posX, posY);
            }
        }
    }

    /**
     * 타일 개별 렌더링 (임시 색상 처리)
     */
    renderTile(ctx, id, x, y) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);

        if (id === 1) { // 벽 타일
            ctx.fillStyle = "#34495e";
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
        } else if (id === 0) { // 바닥 타일
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
        }
    }
}
