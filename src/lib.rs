use wasm_bindgen::prelude::*;

// 1. 【最重要】JS側（Worker）に用意してもらうsys_vicの受け皿を宣言
#[wasm_bindgen]
extern "C" {
    // syscall_num: システムコール番号 (例: 1=SYS_WRITE, 9=SYS_MMAP)
    // args: ゲームやWineから渡された引数のメモリ番地（ポインタ）など
    fn sys_vic_call(syscall_num: u32, arg1: u32, arg2: u32) -> u32;
}

// 2. Worker（JS）から毎フレーム呼ばれるゲームのメイン処理
#[wasm_bindgen]
pub fn game_tick(pressed_key_ascii: u32) {
    // キーボードが押されたら、OSに「ファイル書き込み（SYS_WRITE）」を要求したと仮定して
    // sys_vicシステムコールを発行してみる
    if pressed_key_ascii != 0 {
        
        // システムコール番号「1番（仮にSYS_WRITEとする）」をJSへ横流し！
        let return_code = unsafe { 
            sys_vic_call(1, pressed_key_ascii, 777) 
        };
        
        // OS（JS）から返ってきた結果を処理（ここではデバッグ用に何かしてもいい）
        if return_code == 0 {
            // 正常終了
        }
    }
}
