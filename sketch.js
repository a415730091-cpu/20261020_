// p5.js 響應式英文單字拖曳題測驗系統 (全螢幕、純程式碼動態圖示、彩帶特效、中文註解)

// 宣告全域變數
let questions = [];          // 儲存所有題目資料
let score = 0;               // 總得分
let totalQuestions = 6;      // 題目總數（對應 6 個選項）
let isQuizFinished = false;  // 測驗是否已結束
let submitButton;            // 交卷按鈕
let restartButton;           // 重新測驗按鈕
let confettiParticles = [];  // 彩帶粒子陣列

// 拖曳狀態變數
let draggedOption = null;    // 目前正在被拖曳的選項物件
let offsetX = 0;             // 滑鼠與選項左上角的 X 軸偏移量
let offsetY = 0;             // 滑鼠與選項左上角的 Y 軸偏移量

function setup() {
  // 建立全螢幕響應式畫布
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('display', 'block');
  
  // 初始化英文單字拖曳題資料庫（包含 6 個題目/選項）
  initQuestions();
  
  // 建立「交卷看成績」按鈕
  submitButton = createButton('交卷看成績');
  submitButton.style('font-size', '18px');
  submitButton.style('padding', '10px 20px');
  submitButton.style('background-color', '#4CAF50');
  submitButton.style('color', 'white');
  submitButton.style('border', 'none');
  submitButton.style('border-radius', '8px');
  submitButton.style('cursor', 'pointer');
  submitButton.mousePressed(submitQuiz);
  
  // 調整按鈕位置與尺寸
  positionUI();
}

function draw() {
  // 設定背景顏色（柔和灰白質感）
  background(245, 247, 250);
  
  // 如果測驗尚未結束，繪製作答介面
  if (!isQuizFinished) {
    drawQuizHeader();
    drawTargetDropZones();
    drawDraggableOptions();
  } else {
    // 測驗結束，顯示成績與彩帶特效
    drawScoreScreen();
  }
}

// 初始化 6 個簡易英文單字測驗題目與選項
function initQuestions() {
  let rawData = [
    { word: 'Apple', hint: '蘋果', type: 'apple' },
    { word: 'Cat', hint: '貓', type: 'cat' },
    { word: 'Dog', hint: '狗', type: 'dog' },
    { word: 'Sun', hint: '太陽', type: 'sun' },
    { word: 'Book', hint: '書本', type: 'book' },
    { word: 'Fish', hint: '魚', type: 'fish' }
  ];
  
  questions = [];
  
  // 計算下方選項的初始排列位置
  let startX = width * 0.1;
  let startY = height * 0.72;
  let spacingX = width * 0.14;
  
  // 隨機打亂選項順序，增加互動性
  let shuffledData = shuffle([...rawData]);
  
  for (let i = 0; i < rawData.length; i++) {
    // 目標格子位置（上方 6 個圖片放置區）
    let targetX = width * 0.08 + i * (width * 0.145);
    let targetY = height * 0.32;
    let targetW = width * 0.13;
    let targetH = height * 0.32;
    
    questions.push({
      id: i,
      correctWord: rawData[i].word,      // 正確答案單字
      hint: rawData[i].hint,             // 中文提示
      graphicType: rawData[i].type,      // 動態圖示類型
      targetX: targetX,                  // 上方放置區 X 座標
      targetY: targetY,                  // 上方放置區 Y 座標
      targetW: targetW,                  // 放置區寬度
      targetH: targetH,                  // 放置區高度
      currentPlacedWord: null,           // 目前被拖曳放置進來的單字
      
      // 下方可拖曳選項的初始位置
      optionX: startX + (i % 6) * spacingX,
      optionY: startY,
      optionW: width * 0.12,
      optionH: height * 0.08,
      text: shuffledData[i].word,       // 選項顯示文字
      isPlaced: false                    // 是否已經被放置到上方格子中
    });
  }
}

// 繪製頂部標題與說明
function drawQuizHeader() {
  push();
  textAlign(CENTER, CENTER);
  fill(33, 37, 41);
  textSize(Math.max(22, width * 0.025));
  text("英文單字配對拖曳測驗", width / 2, height * 0.06);
  
  textSize(Math.max(14, width * 0.015));
  fill(108, 117, 125);
  text("請將下方的英文單字選項拖曳至上方對應的圖片提示下方格子中", width / 2, height * 0.12);
  pop();
}

// 繪製上方 6 個動畫圖示與放置目標區
function drawTargetDropZones() {
  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    
    push();
    // 繪製放置區外框與背景
    stroke(200);
    strokeWeight(2);
    fill(255, 255, 255, 220);
    rect(q.targetX, q.targetY, q.targetW, q.targetH, 10);
    
    // 繪製上方動畫效果（隨時間變化的動態向量圖示，取代外部 GIF）
    drawAnimatedGraphic(q.graphicType, q.targetX + q.targetW / 2, q.targetY + q.targetH * 0.32, q.targetW * 0.35);
    
    // 顯示中文提示
    noStroke();
    fill(50);
    textSize(Math.max(12, width * 0.012));
    textAlign(CENTER, CENTER);
    text(`提示: ${q.hint}`, q.targetX + q.targetW / 2, q.targetY + q.targetH * 0.68);
    
    // 如果使用者已經將選項拖入此格子，則顯示該選項文字
    if (q.currentPlacedWord) {
      fill(30, 144, 255);
      rect(q.targetX + 8, q.targetY + q.targetH * 0.78, q.targetW - 16, q.targetH * 0.18, 5);
      fill(255);
      textSize(Math.max(14, width * 0.014));
      text(q.currentPlacedWord, q.targetX + q.targetW / 2, q.targetY + q.targetH * 0.87);
    }
    pop();
  }
}

// 根據單字類型繪製帶有微動畫的圖形（替代 GIF 動畫效果）
function drawAnimatedGraphic(type, x, y, size) {
  push();
  let pulse = sin(frameCount * 0.05) * 4; // 計算呼吸燈動畫起伏效果
  
  if (type === 'apple') {
    // 蘋果圖示
    fill(231, 76, 60);
    noStroke();
    ellipse(x, y + 5, size + pulse * 0.5, size + pulse * 0.5);
    fill(46, 204, 113);
    arc(x + size * 0.2, y - size * 0.3, size * 0.4, size * 0.3, PI, TWO_PI);
  } else if (type === 'cat') {
    // 貓咪頭部圖示
    fill(243, 156, 18);
    noStroke();
    ellipse(x, y + 5, size, size * 0.8);
    triangle(x - size * 0.4, y - size * 0.2, x - size * 0.2, y - size * 0.6, x, y - size * 0.2);
    triangle(x + size * 0.4, y - size * 0.2, x + size * 0.2, y - size * 0.6, x, y - size * 0.2);
  } else if (type === 'dog') {
    // 小狗圖示
    fill(211, 84, 0);
    noStroke();
    ellipse(x, y + 5, size * 1.1, size * 0.8);
    ellipse(x - size * 0.45, y + 2, size * 0.3, size * 0.5);
    ellipse(x + size * 0.45, y + 2, size * 0.3, size * 0.5);
  } else if (type === 'sun') {
    // 太陽圖示（會旋轉發光）
    push();
    translate(x, y);
    rotate(frameCount * 0.02);
    fill(241, 196, 15);
    noStroke();
    ellipse(0, 0, size * 0.8 + pulse, size * 0.8 + pulse);
    for (let i = 0; i < 8; i++) {
      rotate(QUARTER_PI);
      rect(size * 0.5, -2, size * 0.2, 4);
    }
    pop();
  } else if (type === 'book') {
    // 書本圖示
    fill(52, 152, 219);
    noStroke();
    rect(x - size * 0.5, y - size * 0.3, size, size * 0.6, 3);
    fill(255);
    rect(x - size * 0.45, y - size * 0.25, size * 0.4, size * 0.5);
    rect(x + size * 0.05, y - size * 0.25, size * 0.4, size * 0.5);
  } else if (type === 'fish') {
    // 魚圖示（左右擺動）
    push();
    translate(x + sin(frameCount * 0.1) * 3, y);
    fill(26, 188, 156);
    noStroke();
    ellipse(0, 0, size * 1.2, size * 0.7);
    triangle(-size * 0.6, 0, -size * 0.9, -size * 0.4, -size * 0.9, size * 0.4);
    pop();
  }
  pop();
}

// 繪製下方可拖曳的選項
function drawDraggableOptions() {
  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    
    // 如果該選項已經被放置到上方格子中，則在下方隱藏
    if (q.isPlaced) continue;
    
    push();
    // 判斷滑鼠是否懸停在選項上（增加互動視覺回饋）
    let isHovered = mouseX > q.optionX && mouseX < q.optionX + q.optionW &&
                    mouseY > q.optionY && mouseY < q.optionY + q.optionH;
                    
    if (isHovered || draggedOption === q) {
      fill(220, 235, 255);
      stroke(30, 144, 255);
      strokeWeight(2);
    } else {
      fill(255);
      stroke(180);
      strokeWeight(1);
    }
    
    // 繪製選項卡片
    rect(q.optionX, q.optionY, q.optionW, q.optionH, 8);
    
    // 繪製選項文字
    noStroke();
    fill(33, 37, 41);
    textSize(Math.max(14, width * 0.015));
    textAlign(CENTER, CENTER);
    text(q.text, q.optionX + q.optionW / 2, q.optionY + q.optionH / 2);
    pop();
  }
}

// 滑鼠按下事件：判定是否點擊到下方可拖曳選項
function mousePressed() {
  if (isQuizFinished) return;
  
  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    // 若選項尚未被放置，且滑鼠點擊在該選項範圍內
    if (!q.isPlaced &&
        mouseX >= q.optionX && mouseX <= q.optionX + q.optionW &&
        mouseY >= q.optionY && mouseY <= q.optionY + q.optionH) {
      draggedOption = q;
      offsetX = mouseX - q.optionX;
      offsetY = mouseY - q.optionY;
      break;
    }
  }
}

// 滑鼠拖曳中事件：更新被拖曳選項的位置跟隨滑鼠
function mouseDragged() {
  if (draggedOption) {
    draggedOption.optionX = mouseX - offsetX;
    draggedOption.optionY = mouseY - offsetY;
  }
}

// 滑鼠放開事件：判定是否將選項放入上方目標格子中
function mouseReleased() {
  if (draggedOption) {
    let droppedInTarget = false;
    
    // 檢查是否放進任何一個上方目標格子內
    for (let i = 0; i < questions.length; i++) {
      let target = questions[i];
      if (mouseX >= target.targetX && mouseX <= target.targetX + target.targetW &&
          mouseY >= target.targetY && mouseY <= target.targetY + target.targetH) {
        
        // 如果該格子原本已有選項，先將原本的選項釋放回下方
        if (target.currentPlacedWord) {
          let oldWord = target.currentPlacedWord;
          let originalQ = questions.find(item => item.text === oldWord);
          if (originalQ) {
            originalQ.isPlaced = false;
            resetOptionPosition(originalQ);
          }
        }
        
        // 將目前拖曳的選項放入此格子
        target.currentPlacedWord = draggedOption.text;
        draggedOption.isPlaced = true;
        droppedInTarget = true;
        break;
      }
    }
    
    // 如果沒有放到任何目標格子內，則回歸原位
    if (!droppedInTarget) {
      for (let i = 0; i < questions.length; i++) {
        let target = questions[i];
        if (target.currentPlacedWord === draggedOption.text) {
          target.currentPlacedWord = null;
        }
      }
      draggedOption.isPlaced = false;
      resetOptionPosition(draggedOption);
    }
    
    draggedOption = null;
  }
}

// 重設選項回到下方整齊排列位置
function resetOptionPosition(q) {
  let index = questions.indexOf(q);
  let startX = width * 0.1;
  let startY = height * 0.72;
  let spacingX = width * 0.14;
  q.optionX = startX + (index % 6) * spacingX;
  q.optionY = startY;
}

// 點擊交卷看成績按鈕
function submitQuiz() {
  score = 0;
  
  // 計算得分
  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    if (q.currentPlacedWord === q.correctWord) {
      score++;
    }
  }
  
  isQuizFinished = true;
  submitButton.hide();
  
  // 建立重新測驗按鈕
  if (!restartButton) {
    restartButton = createButton('重新測驗');
    restartButton.style('font-size', '18px');
    restartButton.style('padding', '10px 20px');
    restartButton.style('background-color', '#2196F3');
    restartButton.style('color', 'white');
    restartButton.style('border', 'none');
    restartButton.style('border-radius', '8px');
    restartButton.style('cursor', 'pointer');
    restartButton.mousePressed(restartQuiz);
  }
  restartButton.show();
  positionUI();
  
  // 若成績高於 60%（6題中大於等於 4 題），產生彩帶特效
  let percentage = (score / totalQuestions) * 100;
  if (percentage >= 60) {
    initConfetti();
  }
}

// 重新開始測驗
function restartQuiz() {
  isQuizFinished = false;
  score = 0;
  confettiParticles = [];
  initQuestions();
  
  if (restartButton) restartButton.hide();
  submitButton.show();
  positionUI();
}

// 顯示成績結算畫面
function drawScoreScreen() {
  push();
  background(245, 247, 250);
  
  // 繪製彩帶動畫粒子
  updateAndDrawConfetti();
  
  // 結算卡片背景
  fill(255);
  stroke(220);
  strokeWeight(2);
  rectMode(CENTER);
  rect(width / 2, height / 2 - 20, width * 0.5, height * 0.45, 15);
  
  // 結算文字
  textAlign(CENTER, CENTER);
  noStroke();
  fill(33, 37, 41);
  textSize(Math.max(26, width * 0.03));
  text("測驗結果", width / 2, height / 2 - height * 0.15);
  
  textSize(Math.max(20, width * 0.022));
  fill(70, 130, 180);
  text(`您的總得分：${score} / ${totalQuestions}`, width / 2, height / 2 - height * 0.05);
  
  let percentage = Math.round((score / totalQuestions) * 100);
  let passMessage = percentage >= 60 ? "🎉 太棒了！成績及格，恭喜獲得彩帶獎勵！" : "💪 再接再厲！多練習幾次一定會更好！";
  
  textSize(Math.max(16, width * 0.018));
  fill(percentage >= 60 ? 40 : 200, percentage >= 60 ? 160 : 50, 50);
  text(`正確率：${percentage}%  (${passMessage})`, width / 2, height / 2 + height * 0.05);
  pop();
}

// 初始化彩帶粒子
function initConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: random(width),
      y: random(-height, 0),
      size: random(8, 15),
      color: color(random(255), random(255), random(255)),
      speedY: random(2, 6),
      speedX: random(-2, 2),
      angle: random(TWO_PI),
      rotationSpeed: random(0.02, 0.1)
    });
  }
}

// 更新並繪製彩帶粒子動畫
function updateAndDrawConfetti() {
  for (let p of confettiParticles) {
    push();
    translate(p.x, p.y);
    rotate(p.angle);
    noStroke();
    fill(p.color);
    rect(0, 0, p.size, p.size * 0.6, 2);
    pop();
    
    // 移動彩帶
    p.y += p.speedY;
    p.x += p.speedX + sin(p.angle) * 0.5;
    p.angle += p.rotationSpeed;
    
    // 如果彩帶掉落出畫布下方，則從上方重新掉落
    if (p.y > height) {
      p.y = random(-50, 0);
      p.x = random(width);
    }
  }
}

// 視窗大小改變時觸發，確保網頁為響應式設計
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionUI();
}

// 定位 UI 按鈕的響應式座標
function positionUI() {
  if (!isQuizFinished) {
    submitButton.position(width / 2 - submitButton.width / 2, height * 0.88);
  } else {
    if (restartButton) {
      restartButton.position(width / 2 - restartButton.width / 2, height / 2 + height * 0.12);
    }
  }
}