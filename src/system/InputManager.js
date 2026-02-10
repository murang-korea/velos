/**
 * InputManager Class
 * 키보드, 마우스, 터치 입력을 통합 관리
 */
class InputManager {
    constructor() {
        // 입력 상태 저장
        this.keys = {};
        this.mouse = { x: 0, y: 0, isDown: false };
        this.touch = { x: 0, y: 0, isTouching: false, identifier: null };

        // 이동 방향 벡터
        this.axis = { x: 0, y: 0 };

        this.init();
    }

    init() {
        // 키보드 이벤트
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        // 마우스 이벤트
        window.addEventListener('mousedown', (e) => this.handlePointerDown(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => this.handlePointerMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', () => this.handlePointerUp());

        // 터치 이벤트 (멀티 터치 중 첫 번째 터치 위주)
        window.addEventListener('touchstart', (e) => {
            const touch = e.changedTouches[0];
            this.touch.identifier = touch.identifier;
            this.handlePointerDown(touch.clientX, touch.clientY);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.touch.identifier) {
                    this.handlePointerMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                }
            }
        }, { passive: false });

        window.addEventListener('touchend', () => this.handlePointerUp());
    }

    handlePointerDown(x, y) {
        this.mouse.isDown = true;
        this.touch.isTouching = true;
        this.updatePointerCoords(x, y);
    }

    handlePointerMove(x, y) {
        this.updatePointerCoords(x, y);
    }

    handlePointerUp() {
        this.mouse.isDown = false;
        this.touch.isTouching = false;
        this.touch.identifier = null;
    }

    updatePointerCoords(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.touch.x = x;
        this.touch.y = y;
    }

    /**
     * 매 프레임 Game.update에서 호출하여 axis 계산
     */
    update() {
        // 축 초기화
        this.axis.x = 0;
        this.axis.y = 0;

        // 1. 키보드 입력 처리 (WASD + 방향키)
        if (this.keys['KeyW'] || this.keys['ArrowUp']) this.axis.y -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) this.axis.y += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.axis.x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) this.axis.x += 1;

        // 2. 터치/마우스 입력 처리 (화면 중앙 기준 방향 계산 예시)
        // 실제 게임에서는 조이스틱 UI 영역 내에서만 작동하도록 확장 가능합니다.
        if (this.touch.isTouching) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // 단순 구현: 터치 지점이 중앙보다 멀면 이동
            const dx = this.touch.x - centerX;
            const dy = this.touch.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 20) { // 데드존 설정
                this.axis.x = dx / dist;
                this.axis.y = dy / dist;
            }
        }

        // 대각선 이동 속도 정규화
        const length = Math.sqrt(this.axis.x * this.axis.x + this.axis.y * this.axis.y);
        if (length > 0) {
            this.axis.x /= length;
            this.axis.y /= length;
        }
    }

    /**
     * 외부(Player 등)에서 이동 방향을 가져가는 함수
     * @returns {{x: number, y: number}}
     */
    getMovement() {
        return { x: this.axis.x, y: this.axis.y };
    }
}

export default new InputManager();
