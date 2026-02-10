/**
 * Game Core Class
 * 메인 루프 및 시스템 전반을 관리
 */
export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 시간 관리 변수 (FPS 독립 구조용)
        this.lastTime = 0;
        this.accumulator = 0;
        this.deltaTime = 0;

        this.init();
    }

    /**
     * 초기 설정 및 이벤트 바인딩
     */
    init() {
        // 반응형 및 모바일 회전 대응
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            // 회전 시 약간의 지연 후 리사이즈 처리 (브라우저 계산 시간 확보)
            setTimeout(() => this.handleResize(), 100);
        });
    }

    /**
     * 캔버스 크기를 화면에 맞게 자동 조절
     */
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 규칙: 렌더링 좌표 기준 통일 등을 위한 추가 로직 가능
        console.log(`Canvas Resized: ${this.canvas.width}x${this.canvas.height}`);
    }

    /**
     * 게임 루프 시작
     */
    start() {
        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * 메인 게임 루프 (requestAnimationFrame)
     * @param {number} timestamp 
     */
    loop(timestamp) {
        // deltaTime 계산 (초 단위)
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // 비정상적인 큰 deltaTime 방지 (탭 전환 등)
        if (this.deltaTime > 0.1) this.deltaTime = 0.016;

        this.update(this.deltaTime);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * 로직 업데이트 (위치 계산, 충돌 검사 등)
     */
    update(deltaTime) {
        // TODO: InputManager.update() 호출
        // TODO: 모든 게임 객체의 update(deltaTime) 호출
    }

    /**
     * 화면 렌더링 (그리기 전용)
     */
    draw() {
        // 배경 클리어
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // TODO: Camera 적용 후 객체 draw(this.ctx) 호출
        
        // 임시 확인용 텍스트
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText(`FPS: ${Math.round(1 / this.deltaTime)}`, 20, 30);
    }
}
