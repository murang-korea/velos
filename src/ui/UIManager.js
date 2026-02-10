/**
 * UIManager Class
 * 게임 내 HUD, 체력바, 스킬 쿨타임 및 모바일 컨트롤 UI 관리
 */
import EventManager from '../core/EventManager.js';
import { GAME_CONFIG } from '../config/gameConfig.js';

export default class UIManager {
    constructor() {
        this.playerData = {
            hp: 100,
            maxHp: 100,
            skillCooldown: 0,
            maxSkillCooldown: 1
        };

        // UI 요소의 화면 위치 및 크기 (반응형 기준)
        this.padding = 20;
        this.barWidth = 200;
        this.barHeight = 25;

        this.init();
    }

    init() {
        // 이벤트 수신 등록 (데이터 동기화)
        EventManager.on('PLAYER_STATS_UPDATED', (data) => {
            this.playerData.hp = data.hp;
            this.playerData.maxHp = data.maxHp;
        });

        EventManager.on('SKILL_COOLDOWN_UPDATED', (data) => {
            this.playerData.skillCooldown = data.current;
            this.playerData.maxSkillCooldown = data.max;
        });
    }

    /**
     * UI 업데이트 및 그리기
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.save();
        
        // 1. 플레이어 HP 바 (상단 좌측)
        this.drawHealthBar(ctx);

        // 2. 스킬 쿨타임 아이콘 (하단 우측)
        this.drawSkillUI(ctx);

        // 3. 모바일 HUD 버튼 가이드 (필요 시 시각적 표시)
        this.drawMobileHUD(ctx);

        ctx.restore();
    }

    /**
     * 플레이어 체력바 렌더링
     */
    drawHealthBar(ctx) {
        const x = this.padding;
        const y = this.padding;
        const hpRatio = Math.max(0, this.playerData.hp / this.playerData.maxHp);

        // 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, this.barWidth, this.barHeight);

        // 체력 (그라데이션 효과 가능)
        ctx.fillStyle = hpRatio > 0.3 ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(x, y, this.barWidth * hpRatio, this.barHeight);

        // 테두리
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, this.barWidth, this.barHeight);

        // 텍스트 수치
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(`HP: ${Math.ceil(this.playerData.hp)} / ${this.playerData.maxHp}`, x + 5, y + 18);
    }

    /**
     * 스킬 쿨타임 표시 UI
     */
    drawSkillUI(ctx) {
        const size = 60;
        const x = window.innerWidth - size - this.padding;
        const y = window.innerHeight - size - this.padding;
        const cdRatio = this.playerData.skillCooldown / this.playerData.maxSkillCooldown;

        // 스킬 아이콘 배경
        ctx.fillStyle = '#34495e';
        ctx.fillRect(x, y, size, size);

        // 쿨타임 오버레이 (부채꼴 애니메이션)
        if (cdRatio > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.moveTo(x + size / 2, y + size / 2);
            ctx.arc(x + size / 2, y + size / 2, size / 2, -Math.PI / 2, (Math.PI * 2 * cdRatio) - Math.PI / 2);
            ctx.fill();
            
            // 남은 초 표시
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(this.playerData.skillCooldown.toFixed(1), x + size / 2, y + size / 2 + 6);
        }

        ctx.strokeStyle = '#f1c40f';
        ctx.strokeRect(x, y, size, size);
    }

    /**
     * 모바일용 가상 버튼 가이드 그리기
     * (실제 클릭 판정은 InputManager가 담당)
     */
    drawMobileHUD(ctx) {
        // 모바일 기기일 경우에만 가상 조이스틱 영역이나 공격 버튼 가이드를 흐리게 표시
        if ('ontouchstart' in window) {
            ctx.globalAlpha = 0.3;
            // 공격 버튼 영역 예시
            ctx.beginPath();
            ctx.arc(window.innerWidth - 80, window.innerHeight - 150, 40, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }
}
