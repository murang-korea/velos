/**
 * Player Class
 * 플레이어의 상태, 이동 및 렌더링을 담당
 */
import { GAME_CONFIG, STATES } from '../config/gameConfig.js';
import InputManager from '../system/InputManager.js';

export default class Player {
    constructor() {
        // 초기 위치 및 속성 설정
        this.width = GAME_CONFIG.PLAYER.SIZE;
        this.height = GAME_CONFIG.PLAYER.SIZE;
        this.x = (window.innerWidth / 2) - (this.width / 2);
        this.y = (window.innerHeight / 2) - (this.height / 2);
        
        this.speed = GAME_CONFIG.PLAYER.DEFAULT_SPEED;
        this.hp = GAME_CONFIG.PLAYER.MAX_HP;
        this.state = STATES.IDLE;
    }

    /**
     * 플레이어 로직 업데이트
     * @param {number} deltaTime - 프레임 간 시간 간격 (초 단위)
     */
    update(deltaTime) {
        this.handleMovement(deltaTime);
        this.checkWorldBounds();
    }

    /**
     * InputManager를 통한 이동 처리
     */
    handleMovement(deltaTime) {
        const moveDir = InputManager.getMovement();

        if (moveDir.x !== 0 || moveDir.y !== 0) {
            this.state = STATES.MOVE;
            
            // 위치 계산: 속도 * 방향 * 시간
            this.x += moveDir.x * this.speed * deltaTime;
            this.y += moveDir.y * this.speed * deltaTime;
        } else {
            this.state = STATES.IDLE;
        }
    }

    /**
     * 화면 경계 밖으로 나가지 않도록 처리
     */
    checkWorldBounds() {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > screenW) this.x = screenW - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > screenH) this.y = screenH - this.height;
    }

    /**
     * 플레이어 렌더링
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        // 규칙: draw 내부에서는 로직 처리 금지, 렌더링만 수행
        ctx.save();
        
        // 상태에 따른 색상 변경 (예시)
        ctx.fillStyle = (this.state === STATES.MOVE) ? '#3498db' : '#2ecc71';
        
        // 사각형 그리기
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 테두리 추가
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }
}
