/**
 * ViewController.java
 *
 * ▶ 此控制器負責處理遊戲正式開始後的頁面轉向邏輯。
 *
 * ▶ 功能總覽：
 *   - 接收前端進入正式遊戲頁面的請求 `/game-play/{roomId}`
 *   - 將使用者重新導向到帶有 roomId 的前端 HTML 頁面 `game-front-page.html`
 *
 * ▶ 備註：
 *   若日後遊戲頁面名稱或轉向邏輯有變動，請修改這裡。
 */

package com.example.myweb.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class ViewController {

    // 當用戶打開 /game-play/{roomId}，就會轉向對應房間的前端頁面
    @GetMapping("/game-play/{roomId}")
    public String redirectToFrontPage(@PathVariable String roomId) {
        // 將使用者重導向至前端靜態頁面，並帶上 roomId 查詢參數
        return "redirect://game-front-page.html?roomId=" + roomId;
    }


}
