/**
 * Camera Class
 * 플레이어를 추적하고 월드 좌표를 스크린 좌표로 변환
 */
import { GAME_CONFIG } from '../config/gameConfig.js';

export default class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // 카메라 설정
        this.lerpAmount = 0.1; // 부드러운 따라가기 계수 (0~1)
        this.zoom = 1.0;
        
        // 월드 크기 (경계 제한용 - 추후 Map 클래스에서 가져올 수 있음)
        this.worldBounds = {
            width: 3000,
            height: 3000
        };

        window.addEventListener('resize', () => this.updateViewport());
    }

    /**
     * 화면 크기 변경 대응
     */
    updateViewport() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    /**
     * 대상(플레이어)을 부드럽게 추적
     * @param {Object} target - x, y 좌표를 가진 객체
     */
    follow(target) {
        // 대상의 중심점 계산
        const targetCenterX = target.x + (target.width / 2);
        const targetCenterY = target.y + (target.height / 2);

        // 카메라가 화면 중앙에 대상을 위치시키기 위한 목표 좌표
        const goalX = targetCenterX - (this.width / 2) / this.zoom;
        const goalY = targetCenterY - (this.height / 2) / this.zoom;

        // 선형 보간(Lerp)으로 부드러운 이동 구현
        this.x += (goalX - this.x) * this.lerpAmount;
        this.y += (goalY - this.y) * this.lerpAmount;

        this.applyBounds();
    }

    /**
     * 월드 경계를 벗어나지 않도록 제한
     */
    applyBounds() {
        const viewW = this.width / this.zoom;
        const viewH = this.height / this.zoom;

        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        
        if (this.x + viewW > this.worldBounds.width) {
            this.x = this.worldBounds.width - viewW;
        }
        if (this.y + viewH > this.worldBounds.height) {
            this.y = this.worldBounds.height - viewH;
        }
    }

    /**
     * 월드 좌표를 스크린 좌표로 변환하는 오프셋 적용
     * @param {CanvasRenderingContext2D} ctx 
     */
    applyTransform(ctx) {
        ctx.save();
        // 확대/축소 적용
        ctx.scale(this.zoom, this.zoom);
        // 카메라 좌표만큼 반대 방향으로 이동 (Translation)
        ctx.translate(-this.x, -this.y);
    }

    /**
     * 렌더링 종료 후 호출
     * @param {CanvasRenderingContext2D} ctx 
     */
    resetTransform(ctx) {
        ctx.restore();
    }

    /**
     * 줌 배율 설정
     * @param {number} value 
     */
    setZoom(value) {
        this.zoom = Math.max(0.5, Math.min(value, 2.0)); // 최소 0.5배 ~ 최대 2배
    }
}
