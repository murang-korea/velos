/**
 * Enemy Class
 * 적의 상태, AI 추적 및 데미지 처리를 담당
 */
import { STATES } from '../config/gameConfig.js';

export default class Enemy {
    /**
     * @param {number} x - 초기 X 위치
     * @param {number} y - 초기 Y 위치
     * @param {Object} config - 적의 스탯 데이터 (hp, speed, size 등)
     */
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.width = config.size || 40;
        this.height = config.size || 40;
        
        // 스탯 설정
        this.hp = config.hp || 50;
        this.maxHp = this.hp;
        this.speed = config.speed || 100;
        this.state = STATES.IDLE;
        
        this.isDead = false;
    }

    /**
     * 적 로직 업데이트
     * @param {number} deltaTime 
     * @param {Object} player - 추적 대상 플레이어 객체
     */
    update(deltaTime, player) {
        if (this.isDead) return;

        this.moveTowardsPlayer(deltaTime, player);
    }

    /**
     * 플레이어 위치를 기반으로 이동 방향 계산
     */
    moveTowardsPlayer(deltaTime, player) {
        // 플레이어 중심점 계산
        const targetX = player.x + (player.width / 2);
        const targetY = player.y + (player.height / 2);
        const selfCenterX = this.x + (this.width / 2);
        const selfCenterY = this.y + (this.height / 2);

        // 거리 및 방향 벡터 계산
        const dx = targetX - selfCenterX;
        const dy = targetY - selfCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 일정 거리 이상일 때만 추적 (겹침 방지 데드존)
        if (distance > 5) {
            this.state = STATES.MOVE;
            const dirX = dx / distance;
            const dirY = dy / distance;

            this.x += dirX * this.speed * deltaTime;
            this.y += dirY * this.speed * deltaTime;
        } else {
            this.state = STATES.IDLE;
        }
    }

    /**
     * 데미지 처리 함수
     * @param {number} amount - 입힐 데미지 수치
     */
    takeDamage(amount) {
        if (this.isDead) return;

        this.hp -= amount;
        console.log(`Enemy Hit! Remaining HP: ${this.hp}`);

        if (this.hp <= 0) {
            this.die();
        }
    }

    /**
     * 사망 처리
     */
    die() {
        this.hp = 0;
        this.isDead = true;
        this.state = STATES.DEAD;
        // TODO: EventManager.emit('ENEMY_DIED', this);
    }

    /**
     * 적 렌더링
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        
        // 적 본체 렌더링
        ctx.fillStyle = '#e74c3c'; // 빨간색
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 체력바 표시 (심플 버전)
        const healthBarWidth = this.width;
        const currentHealthWidth = (this.hp / this.maxHp) * healthBarWidth;

        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x, this.y - 10, healthBarWidth, 5);
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(this.x, this.y - 10, currentHealthWidth, 5);

        ctx.restore();
    }
}
