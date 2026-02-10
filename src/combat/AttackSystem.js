/**
 * AttackSystem Class
 * 플레이어의 공격 로직, 쿨타임 및 범위 충돌 감지 처리
 */
import { GAME_CONFIG } from '../config/gameConfig.js';
import InputManager from '../system/InputManager.js';
import EventManager from '../core/EventManager.js';

export default class AttackSystem {
    constructor(player) {
        this.player = player;
        
        // 공격 관련 설정 (추후 config로 분리 가능)
        this.ATTACK_RANGE = 80;
        this.ATTACK_DAMAGE = 20;
        this.ATTACK_COOLDOWN = 0.5; // 초 단위
        
        this.currentCooldown = 0;
        this.isAttacking = false;
        this.attackDuration = 0.15; // 공격 판정 지속 시간
        this.attackTimer = 0;
    }

    /**
     * 매 프레임 공격 입력 및 쿨타임 업데이트
     */
    update(deltaTime, enemies) {
        // 쿨타임 감소
        if (this.currentCooldown > 0) {
            this.currentCooldown -= deltaTime;
        }

        // 공격 입력 감지 (PC: Space / Mobile: 터치 혹은 전용 버튼)
        // InputManager에 isActionPressed()가 있다고 가정하거나 마우스/터치 다운 활용
        const isActionTriggered = InputManager.keys['Space'] || (InputManager.touch.isTouching && !this.isAttacking);

        if (isActionTriggered && this.currentCooldown <= 0) {
            this.performAttack(enemies);
        }

        // 공격 애니메이션/판정 타이머 관리
        if (this.isAttacking) {
            this.attackTimer -= deltaTime;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
            }
        }
    }

    /**
     * 공격 수행 및 범위 내 적 데미지 처리
     */
    performAttack(enemies) {
        this.isAttacking = true;
        this.attackTimer = this.attackDuration;
        this.currentCooldown = this.ATTACK_COOLDOWN;

        // 플레이어 중심점 계산
        const pCenterX = this.player.x + (this.player.width / 2);
        const pCenterY = this.player.y + (this.player.height / 2);

        // 범위 내 적 검사 (단순 원형 범위 충돌)
        enemies.forEach(enemy => {
            if (enemy.isDead) return;

            const eCenterX = enemy.x + (enemy.width / 2);
            const eCenterY = enemy.y + (enemy.height / 2);

            const dx = eCenterX - pCenterX;
            const dy = eCenterY - pCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 공격 범위 내에 있으면 데미지 전달
            if (distance <= this.ATTACK_RANGE) {
                enemy.takeDamage(this.ATTACK_DAMAGE);
                
                // 이벤트 발생 (사운드나 이펙트 처리용)
                EventManager.emit('ENTITY_HIT', { target: enemy, damage: this.ATTACK_DAMAGE });
            }
        });

        console.log("Player Attacked!");
    }

    /**
     * 공격 시각 효과 그리기
     */
    draw(ctx) {
        if (!this.isAttacking) return;

        ctx.save();
        ctx.beginPath();
        ctx.arc(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            this.ATTACK_RANGE,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.stroke();
        ctx.restore();
    }
}
