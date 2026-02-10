/**
 * Game Core Class
 * 모든 시스템을 통합하고 메인 루프를 실행함
 */
import { GAME_CONFIG } from '../config/gameConfig.js';
import EventManager from './EventManager.js';
import Camera from './Camera.js';
import InputManager from '../system/InputManager.js';
import SaveManager from '../system/SaveManager.js';
import TileMap from '../map/TileMap.js';
import Player from '../player/Player.js';
import Enemy from '../enemy/Enemy.js';
import Boss from '../boss/Boss.js';
import AttackSystem from '../combat/AttackSystem.js';
import PlanetProgress from '../progress/PlanetProgress.js';
import UIManager from '../ui/UIManager.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;

        // 1. 코어 시스템 초기화
        this.camera = new Camera();
        this.progress = new PlanetProgress();
        this.uiManager = new UIManager();
        
        // 2. 게임 객체 초기화
        this.tileMap = new TileMap({ tileSize: 64, data: this.generateMap() });
        this.player = new Player();
        this.attackSystem = new AttackSystem(this.player);
        
        // 3. 엔티티 관리 (적군 등)
        this.enemies = [];
        
        this.init();
    }

    init() {
        // 리사이즈 이벤트
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();

        // 초기 적 생성 (예시)
        this.spawnEnemies();
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.updateViewport();
    }

    spawnEnemies() {
        for (let i = 0; i < 5; i++) {
            this.enemies.push(new Enemy(Math.random() * 1000, Math.random() * 1000, { hp: 50, speed: 80 }));
        }
    }

    /**
     * 메인 루프 시작
     */
    start() {
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timestamp) {
        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        // 시스템 업데이트
        InputManager.update();
        SaveManager.update(deltaTime);

        // 플레이어 및 카메라 업데이트
        this.player.update(deltaTime);
        this.camera.follow(this.player);

        // 전투 및 적군 업데이트
        this.attackSystem.update(deltaTime, this.enemies);
        this.enemies.forEach(enemy => enemy.update(deltaTime, this.player));

        // 사망한 적 제거 (배열 필터링)
        if (this.enemies.some(e => e.isDead)) {
            this.enemies = this.enemies.filter(e => !e.isDead);
        }
    }

    draw() {
        // 1. 배경 클리어
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. 카메라 적용 (월드 좌표계 시작)
        this.camera.applyTransform(this.ctx);

        this.tileMap.draw(this.ctx, this.camera);
        this.player.draw(this.ctx);
        this.attackSystem.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // 3. 카메라 해제 (스크린 좌표계 시작)
        this.camera.resetTransform(this.ctx);

        // 4. UI 렌더링 (카메라의 영향을 받지 않음)
        this.uiManager.draw(this.ctx);
    }

    // 임시 맵 데이터 생성기
    generateMap() {
        const map = [];
        for (let r = 0; r < 20; r++) {
            map[r] = [];
            for (let c = 0; c < 20; c++) {
                map[r][c] = (r === 0 || r === 19 || c === 0 || c === 19) ? 1 : 0;
            }
        }
        return map;
    }
}
