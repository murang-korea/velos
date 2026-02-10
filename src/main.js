/**
 * Velos Conquest - Main Entry Point
 */
import Game from './core/Game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    // 게임 인스턴스 생성 및 시작
    const game = new Game(canvas);
    game.start();
});
