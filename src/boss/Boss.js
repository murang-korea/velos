/**
 * Boss Class
 * Enemy 클래스를 상속받으며, 페이즈 변화와 패턴 공격 로직을 포함
 */
import Enemy from './Enemy.js';
import { STATES } from '../config/gameConfig.js';
import EventManager from '../core/EventManager.js';

// 보스 전용 상태 추가
const BOSS_STATES = {
    PHASE_TRANSITION: 'PHASE_TRANSITION',
    PATTERN_A: 'PATTERN_A',
    PATTERN_B: 'PATTERN_B'
};

export default class Boss extends Enemy {
    constructor(x, y, config) {
        super(x, y, config);
        
        this.maxHp = config.hp || 500;
        this.hp = this.maxHp;
        
        // 페이즈 관리
        this.phase = 1;
        this.isInvulnerable = false; // 페이즈 전환 시 무적 상태
        
        // 패턴 타이머
        this.patternTimer = 0;
        this.patternInterval = 3.0; // 3초마다 패턴 변경
    }

    /**
     * 보스 로직 업데이트
     */
    update(deltaTime, player) {
        if (this.isDead || this.isInvulnerable) return;

        // 패턴 교체 타이머 계산
        this.patternTimer += deltaTime;
        if (this.patternTimer >= this.patternInterval) {
            this.changePattern();
        }

        // 현재 상태(패턴)에 따른 행동
        switch (this.state) {
            case BOSS_STATES.PATTERN_A:
                this.moveTowardsPlayer(deltaTime, player); // 기본 추적
                break;
            case BOSS_STATES.PATTERN_B:
                // 패턴 B: 제자리에 서서 공격 (예시)
                break;
            default:
                super.update(deltaTime, player);
        }

        // HP 기반 페이즈 체크
        this.checkPhaseTransition();
    }

    /**
     * 공격 패턴 무작위 변경
     */
    changePattern() {
        this.patternTimer = 0;
        const patterns = [STATES.MOVE, BOSS_STATES.PATTERN_A, BOSS_STATES.PATTERN_B];
        this.state = patterns[Math.floor(Math.random() * patterns.length)];
    }

    /**
     * 페이즈 전환 검사
     */
    checkPhaseTransition() {
        if (this.phase === 1 && this.hp <= this.maxHp * 0.5) {
            this.startPhaseTransition(2);
        }
    }

    /**
     * 페이즈 전환 연출 및 강화
     */
    startPhaseTransition(nextPhase) {
        this.phase = nextPhase;
        this.isInvulnerable = true;
        this.state = BOSS_STATES.PHASE_TRANSITION;
        
        console.log(`Boss Phase ${nextPhase} Started!`);
        
        // 2초 뒤 무적 해제 및 강화된 스탯 적용
        setTimeout(() => {
            this.isInvulnerable = false;
            this.speed *= 1.5; // 페이즈 2에서 속도 증가
            this.patternInterval = 1.5; // 패턴 주기 단축
            this.changePattern();
        }, 2000);

        // UI 연동을 위한 이벤트 발생
        EventManager.emit('BOSS_PHASE_CHANGED', { phase: this.phase });
    }

    /**
     * 데미지 처리 오버라이드 (UI 연동 포함)
     */
    takeDamage(amount) {
        if (this.isInvulnerable) return;

        super.takeDamage(amount);
        
        // 보스 전용 HP UI 업데이트 이벤트
        EventManager.emit('BOSS_HP_UPDATED', { 
            current: this.hp, 
            max: this.maxHp,
            percentage: (this.hp / this.maxHp) * 100 
        });
    }

    /**
     * 보스 렌더링
     */
    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        
        // 페이즈에 따른 외형 변화
        ctx.fillStyle = (this.phase === 1) ? '#8e44ad' : '#c0392b';
        
        // 무적 상태일 때 깜빡임 효과
        if (this.isInvulnerable) {
            ctx.globalAlpha = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        }

        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 보스 표식 (왕관 등 단순 형태)
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(this.x + this.width/4, this.y - 15, this.width/2, 10);

        ctx.restore();
    }
}
