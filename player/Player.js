import { GAME_CONFIG, STATES } from '../config/gameConfig.js';
import InputManager from '../system/InputManager.js';

export default class Player {
    constructor() {
        this.x = 100;
        this.y = 100;
        this.hp = GAME_CONFIG.PLAYER.MAX_HP;
        this.speed = GAME_CONFIG.PLAYER.DEFAULT_SPEED;
        this.state = STATES.IDLE;
    }

    /**
     * 플레이어 상태 및 위치 업데이트
     */
    update(deltaTime) {
        const movement = InputManager.getMovement();
        
        if (movement.x !== 0 || movement.y !== 0) {
            this.state = STATES.MOVE;
            this.x += movement.x * this.speed * deltaTime;
            this.y += movement.y * this.speed * deltaTime;
        } else {
            this.state = STATES.IDLE;
        }
    }

    /**
     * 플레이어 렌더링
     */
    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, GAME_CONFIG.PLAYER.SIZE, GAME_CONFIG.PLAYER.SIZE);
    }
}
