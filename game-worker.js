let ctx = null;
let keyStatus = "なし";

// メインスレッド（奴隷）からのメッセージを監視
self.onmessage = function(e) {
    const msg = e.data;

    switch(msg.type) {
        case 'INIT':
            // 剥ぎ取られたCanvasを受け取る
            const canvas = msg.canvas;
            ctx = canvas.getContext('2d'); // 将来的にはここが webgpu になる
            
            // キャンバスのサイズを設定
            canvas.width = 800;
            canvas.height = 600;
            
            // 独自のゲームループを開始（メインスレッドの都合に一切縛られない）
            startGameLoop();
            break;

        case 'KEY_DOWN':
            keyStatus = `${msg.key} が押されている`;
            break;

        case 'KEY_UP':
            keyStatus = "なし";
            break;
    }
};

function startGameLoop() {
    function loop() {
        if (!ctx) return;

        // 画面をクリア
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, 800, 600);

        // デバッグ情報の描画
        ctx.fillStyle = '#00ff00';
        ctx.font = '24px monospace';
        ctx.fillText('--- WASM PROTON WORKER RUNNING ---', 50, 50);
        ctx.fillText(`検知したキー入力: ${keyStatus}`, 50, 100);
        ctx.fillText(`Worker独自のタイムスタンプ: ${performance.now().toFixed(2)}`, 50, 150);

        // メインスレッドを完全に無視して秒間60フレームでループ
        requestAnimationFrame(loop);
    }
    loop();
}
