import init, { game_tick } from './pkg/wasm_proton_core.js'; // wasm-packが生成するラッパー

let ctx = null;
let lastSyscallLog = "システムコール待機中...";

// 1. 【sys_vic方式の本尊】Wasmの中から呼び出される「Linuxシステムコールの受け皿」
const sys_vic_implementation = {
    sys_vic_call: function(syscall_num, arg1, arg2) {
        console.log(`【sys_vic検知】Syscall No: ${syscall_num}, Arg1: ${arg1}, Arg2: ${arg2}`);
        
        // システムコール番号に応じて、ブラウザのAPIでOSのフリをする
        switch(syscall_num) {
            case 1: // 仮の SYS_WRITE (ファイル書き込み・文字出力)
                const char = String.fromCharCode(arg1);
                lastSyscallLog = `[SYS_WRITE] キー '${char}' のデータを仮想ディスクに書き込みました。`;
                break;
            default:
                lastSyscallLog = `未知のシステムコール: ${syscall_num}`;
        }

        return 0; // 成功ステータス（0）をWasmに返す
    }
};

self.onmessage = async function(e) {
    const msg = e.data;

    switch(msg.type) {
        case 'INIT':
            ctx = msg.canvas.getContext('2d');
            msg.canvas.width = 800;
            msg.canvas.height = 600;

            // 2. Rust製Wasmの初期化。インポート関数としてsys_vicを注入
            // (wasm-bindgenが裏で自動的に sys_vic_call をWasmと紐付けます)
            self.sys_vic_call = sys_vic_implementation.sys_vic_call;
            await init(); 

            startGameLoop();
            break;

        case 'KEY_DOWN':
            // 奴隷（メイン）から送られてきたキーをASCIIコードに変換してWasmに叩き込む
            const ascii = msg.key.charCodeAt(0) || 0;
            // Wasmのメインループを1ステップ進める
            game_tick(ascii);
            break;
    }
};

function startGameLoop() {
    function loop() {
        if (!ctx) return;

        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, 800, 600);

        ctx.fillStyle = '#00ff00';
        ctx.font = '22px monospace';
        ctx.fillText('--- WASM PROTON ENGINE (PHASE 2) ---', 50, 50);
        
        // WasmのシステムコールによってJS側が書き換えたログを表示
        ctx.fillStyle = '#ffff00';
        ctx.fillText(lastSyscallLog, 50, 120);

        requestAnimationFrame(loop);
    }
    loop();
}
