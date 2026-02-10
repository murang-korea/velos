import { GAME_CONFIG } from '../config/gameConfig.js';
import InputManager from '../system/InputManager.js';
import Player from '../player/Player.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 인스턴스 생성
        this.player = new Player();
        
        // 게임 루프 시작
        requestAnimationFrame(this.loop.bind(this));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * 메인 게임 루프
     */
    loop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        // 입력 처리 로직 및 물리 계산
        InputManager.update();
        this.player.update(deltaTime);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 렌더링 호출
        this.player.draw(this.ctx);
    }
}
