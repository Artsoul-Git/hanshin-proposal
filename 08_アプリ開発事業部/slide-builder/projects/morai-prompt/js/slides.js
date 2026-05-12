(function () {

  function H(t) {
    return '<header class="slide-header"><h2 class="slide-h2">' + t + '</h2></header>';
  }

  function slide01() {
    return '<section class="slide slide-cover" data-section="cover" data-title="タイトル" data-notes="本日はお集まりいただきありがとうございます。今日は難しい話は一切しません。コピペとおしゃべりだけでAIを使い倒す方法を一緒に体験していきましょう。">' +
      '<div class="slide-cover-bar"><div class="slide-cover-tag">有限会社アートソウル AI導入支援事業</div>' +
      '<h1 class="slide-cover-title">もらったプロンプトを<br>使い倒そう！</h1></div>' +
      '<div class="slide-cover-body"><p class="slide-cover-sub">〜コピペとおしゃべりだけで、仕事が変わる〜</p>' +
      '<div class="slide-cover-meta">2026.05 ｜ ひとやね AIふらっとラボ</div></div></section>';
  }

  function slide02() {
    return '<section class="slide slide-impact" data-section="cover" data-title="今日のメッセージ" data-notes="今日この場で持ち帰っていただきたいメッセージはたったひとつ。コピペひとつで、あなたの仕事は変わります。">' +
      '<div class="slide-content slide-content-center">' +
      '<div class="s-impact-tag">TODAY&#39;S MESSAGE</div>' +
      '<p class="s-impact-main">コピペひとつで、<br>仕事が変わる。</p></div></section>';
  }

  function slide03() {
    return '<section class="slide" data-section="cover" data-title="今日のゴール" data-notes="今日のゴールは3つです。もらったプロンプトを実際に使ってみる、プロンプトへの苦手意識をなくす、そして次の一手が見えた状態で帰っていただくことです。">' +
      H('今日のゴール') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">「もらったプロンプト」を今日、実際に使ってみる</li>' +
      '<li class="s-list-arrow">プロンプトへの苦手意識・怖さをなくす</li>' +
      '<li class="s-list-arrow">明日からの「次の一手」が見えた状態で帰る</li>' +
      '</ul></div></section>';
  }

  function slide04() {
    return '<section class="slide" data-section="cover" data-title="本日の流れ" data-notes="本日はこの4つの流れで進めます。基本の考え方、プロンプトの読み解き方、業務への実践、そしてライブデモとアクションプランです。">' +
      H('本日の流れ') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text"><strong>なぜ今プロンプトなのか</strong> — まず「怖くない」を実感する</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text"><strong>もらったプロンプトを読み解く</strong> — 構造を知ると使いやすくなる</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text"><strong>日常業務で使い倒す</strong> — 業種別の実例で具体化</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">④</div><div><div class="s-step-text"><strong>ライブデモ &amp; アクションプラン</strong> — 今日から動ける状態にする</div></div></div>' +
      '</div></div></section>';
  }

  /* --- PART 01 --- */

  function slide05() {
    return '<section class="slide slide-section" data-section="part1" data-title="PART 01" data-notes="">' +
      '<div class="slide-content"><div class="s-section-accent-bar"></div>' +
      '<div class="s-section-chapter">PART 01</div>' +
      '<h1 class="s-section-title">なぜ今、プロンプトなのか</h1>' +
      '<p class="s-section-lead">まず「怖くない」を実感しましょう</p></div></section>';
  }

  function slide06() {
    return '<section class="slide" data-section="part1" data-title="みなさん、使ってますか？" data-notes="まず確認です。ChatGPTやGeminiを聞いたことがある方は手を挙げてください。登録はしたけどあまり使えていない方は？今日はどの段階の方でも、必ず使えるようになって帰っていただきます。">' +
      H('みなさん、ChatGPTやGeminiって使ってますか？') +
      '<div class="slide-content"><div class="s-compare">' +
      '<div class="s-compare-col positive"><div class="s-compare-badge">よく使っている！</div>' +
      '<div class="s-compare-title">活用派</div>' +
      '<ul class="s-compare-items"><li>業務効率が上がった</li><li>もっと使いたい</li></ul></div>' +
      '<div class="s-compare-col neutral"><div class="s-compare-badge">登録はしたけど…</div>' +
      '<div class="s-compare-title">迷い中</div>' +
      '<ul class="s-compare-items"><li>何に使えばいいかわからない</li><li>プロンプトが難しそう</li></ul></div>' +
      '<div class="s-compare-col negative"><div class="s-compare-badge">まだ触ったことがない</div>' +
      '<div class="s-compare-title">これから</div>' +
      '<ul class="s-compare-items"><li>怖い・難しそう</li><li>自分には関係ない？</li></ul></div>' +
      '</div></div></section>';
  }

  function slide07() {
    return '<section class="slide" data-section="part1" data-title="宝の持ち腐れになっていませんか？" data-notes="「すごいプロンプトをもらったけど、どう使えばいいか分からない」という声をよく聞きます。呪文みたいで難しそう、どこに入力すればいいの、間違えたら壊れちゃいそう。そんな不安を今日は全部解消します。">' +
      H('「すごいプロンプトをもらったけど、どう使えばいいか分からない…」') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">宝の持ち腐れになっていませんか？</li>' +
      '<li class="s-list-arrow">呪文みたいで難しそう…</li>' +
      '<li class="s-list-arrow">どこに入力すればいいの？</li>' +
      '<li class="s-list-arrow">間違えたら壊れちゃいそう…</li>' +
      '<li class="s-list-head">→ 今日、この不安を全部解消します</li>' +
      '</ul></div></section>';
  }

  function slide08() {
    return '<section class="slide" data-section="part1" data-title="プロンプト＝お願いのお手紙" data-notes="難しく考える必要はありません。プロンプトはただのお願いのお手紙です。プロンプトがAIへのお手紙、ChatGPTやGeminiがそのお手紙を読んでくれる親切なアシスタント。これだけです。">' +
      H('難しく考える必要はありません') +
      '<div class="slide-content"><div class="s-compare">' +
      '<div class="s-compare-col negative"><div class="s-compare-badge">Before（思い込み）</div>' +
      '<div class="s-compare-title">呪文・暗号・コマンド</div>' +
      '<ul class="s-compare-items"><li>専門知識が必要</li><li>完璧に書かないといけない</li><li>難しそうで怖い</li></ul></div>' +
      '<div class="s-compare-col positive"><div class="s-compare-badge">After（正解）</div>' +
      '<div class="s-compare-title">プロンプト＝お願いのお手紙</div>' +
      '<ul class="s-compare-items"><li>日常の言葉でOK</li><li>失敗してもやり直せる</li><li>GPT/Gemini＝親切なアシスタント</li></ul></div>' +
      '</div></div></section>';
  }

  function slide09() {
    return '<section class="slide" data-section="part1" data-title="必要なスキルはコピペだけ" data-notes="今日必要なスキルはたったこれだけです。コピーするCtrl+Cと貼り付けるCtrl+V。これだけでいいんだ、という安心感を持ってください。">' +
      H('必要なスキルはたったこれだけ') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text"><strong>コピーする（Ctrl + C）</strong> — お手元の資料のプロンプトをコピー</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text"><strong>貼り付ける（Ctrl + V）</strong> — チャットボックスにペーストしてEnterキーを押す</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">これだけでいいんだ！という安心感を持ってください</li></ul>' +
      '</div></section>';
  }

  function slide10() {
    return '<section class="slide" data-section="part1" data-title="昔のPCvs今のAI" data-notes="パソコン操作のこれまでの常識を今日から捨てましょう。昔のコンピュータは正確なコマンドが必要でエラーが怖かった。でも今のAIは日常会話でOK、失敗してもすぐやり直せる。まったく別物です。">' +
      H('パソコン操作の「常識」を、今日から捨てましょう') +
      '<div class="slide-content"><div class="s-compare">' +
      '<div class="s-compare-col negative"><div class="s-compare-badge">昔のコンピュータ</div>' +
      '<div class="s-compare-title">コマンド型</div>' +
      '<ul class="s-compare-items"><li>正確なコマンドが必要</li><li>エラーが出て怒られそう（緊張）</li><li>一言一句間違えてはいけない</li></ul></div>' +
      '<div class="s-compare-col positive"><div class="s-compare-badge">今のAI / GPT</div>' +
      '<div class="s-compare-title">対話型</div>' +
      '<ul class="s-compare-items"><li>日常会話でOK</li><li>文脈を察してくれる（リラックス）</li><li>失敗してもすぐにやり直せる</li></ul></div>' +
      '</div></div></section>';
  }

  function slide11() {
    return '<section class="slide" data-section="part1" data-title="呪文思考→対話思考へ" data-notes="AIとの向き合い方には2種類あります。呪文思考は完璧な指示を出さなきゃいけないという考え方。対話思考は適当なお願いからスタートでOK、エラーが出たらAIに相談するという考え方。今日から対話思考に切り替えましょう。">' +
      H('「呪文思考」から「対話思考」へ') +
      '<div class="slide-content"><div class="s-compare">' +
      '<div class="s-compare-col negative"><div class="s-compare-badge">△ 呪文思考</div>' +
      '<div class="s-compare-title">やめましょう</div>' +
      '<ul class="s-compare-items"><li>完璧な指示を出さなきゃいけない</li><li>エラーが出たら自分のせい</li><li>AI＝ただの自動販売機</li></ul></div>' +
      '<div class="s-compare-col positive"><div class="s-compare-badge">○ 対話思考</div>' +
      '<div class="s-compare-title">これがベスト</div>' +
      '<ul class="s-compare-items"><li>適当なお願いからスタートでOK</li><li>エラーが出たらAIに相談する</li><li>AI＝隣の席の優しい同僚</li></ul></div>' +
      '</div></div></section>';
  }

  function slide12() {
    return '<section class="slide" data-section="part1" data-title="AIとの距離感3ステップ" data-notes="AIとの距離感は3段階で近づいていきます。最初は専門用語が怖い遠い壁の状態。次にコピペして使うツール段階。そして最終的にわからないことはAIに聞く双方向のバディ段階。今日は少なくともStep2をクリアしましょう。">' +
      H('AIとの新しい距離感') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">1</div><div><div class="s-step-text"><strong>遠い（壁）</strong> — 「プロンプト」という専門用語が怖い</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">2</div><div><div class="s-step-text"><strong>ツール（使う）</strong> — もらった手紙をコピペして使う（今日のゴール）</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">3</div><div><div class="s-step-text"><strong>バディ（対話）</strong> — わからないことはAIに聞く、双方向の相棒</div></div></div>' +
      '</div></div></section>';
  }

  function slide13() {
    return '<section class="slide slide-metric" data-section="part1" data-title="AI活用で変わる数字" data-notes="実際にAIを業務活用している経営者の調査では、定型業務の時間が平均約40%削減されたというデータがあります。メール返信、報告書作成、SNS投稿などに費やす時間が大幅に短縮できます。">' +
      '<div class="slide-content slide-content-center">' +
      '<p class="s-metric-lead">AI活用で定型業務の時間が</p>' +
      '<div class="s-metric-value">40%<span style="font-size:0.4em">削減</span></div>' +
      '<p class="s-metric-desc">メール・報告書・SNS投稿・マニュアル作成など<br>繰り返し業務の時間を圧縮</p>' +
      '<p class="s-metric-source">中小企業AI活用実態調査（参考値）</p>' +
      '</div></section>';
  }

  function slide14() {
    return '<section class="slide" data-section="part1" data-title="PART01 まとめ" data-notes="PART01のまとめです。プロンプトはお願いのお手紙、必要なスキルはコピペだけ、AIは隣の席の優しい同僚という3点を覚えておいてください。">' +
      H('PART 01 まとめ') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">プロンプト＝AIへの「お願いのお手紙」</li>' +
      '<li class="s-list-callout">必要なスキルはコピペ（Ctrl+C / Ctrl+V）だけ</li>' +
      '<li class="s-list-callout">AI＝隣の席の優しい同僚。対話思考で接する</li>' +
      '<li class="s-list-arrow">完璧じゃなくていい。まず貼り付けてみることが大事</li>' +
      '</ul></div></section>';
  }

  /* --- PART 02 --- */

  function slide15() {
    return '<section class="slide slide-section" data-section="part2" data-title="PART 02" data-notes="">' +
      '<div class="slide-content"><div class="s-section-accent-bar"></div>' +
      '<div class="s-section-chapter">PART 02</div>' +
      '<h1 class="s-section-title">もらったプロンプトを<br>読み解く</h1>' +
      '<p class="s-section-lead">構造を知ると、もっと使いやすくなる</p></div></section>';
  }

  function slide16() {
    return '<section class="slide" data-section="part2" data-title="プロンプトの中身を見てみよう" data-notes="お手元のプロンプト資料を開いてみてください。一見すると長くて難しそうですが、実は決まったパターンで書かれています。このパターンを知るだけで、使いこなし方が変わります。">' +
      H('プロンプトの中身を見てみよう') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">お手元のプロンプト資料を開いてみてください</li>' +
      '<li class="s-list-arrow">一見、長くて難しそうに見える…</li>' +
      '<li class="s-list-arrow">でも実は「決まったパターン」で書かれている</li>' +
      '<li class="s-list-head">→ パターンを知れば、自信を持って使えるようになる</li>' +
      '</ul></div></section>';
  }

  function slide17() {
    return '<section class="slide" data-section="part2" data-title="プロンプトの3つの要素" data-notes="プロンプトは3つの要素でできています。役割指示、文脈、そして出力形式です。この3つさえ理解すれば、どんなプロンプトも読み解けます。">' +
      H('プロンプトの3つの要素') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text"><strong>役割指示</strong> — 「あなたは〇〇の専門家です」AIに役を与える</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text"><strong>文脈（背景）</strong> — 「私の業種は〇〇で〜という状況です」状況を伝える</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text"><strong>出力形式</strong> — 「箇条書きで3つ答えてください」欲しい形を指定する</div></div></div>' +
      '</div></div></section>';
  }

  function slide18() {
    return '<section class="slide" data-section="part2" data-title="要素①役割指示" data-notes="役割指示とは、AIにあなたはこういう人ですと伝えることです。同じ質問でも役割によってAIの答えが変わります。マーケターとして答えてと言えばマーケター視点で、経営コンサルとして答えてと言えばコンサル視点で答えてくれます。">' +
      H('要素① 役割指示（ロール）') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">「あなたは〇〇の専門家です」とAIに役を与える</li>' +
      '<li class="s-list-arrow">例：「あなたは中小企業向けのマーケティング専門家です」</li>' +
      '<li class="s-list-arrow">例：「あなたは10年以上の経験を持つ採用担当者です」</li>' +
      '<li class="s-list-head">→ 役割で答えの質と視点が変わる</li>' +
      '<li class="s-list-sub">→ もらったプロンプトの先頭に書いてあることが多い</li>' +
      '</ul></div></section>';
  }

  function slide19() {
    return '<section class="slide" data-section="part2" data-title="要素②文脈" data-notes="文脈とは、AIに状況を伝える部分です。業種・商品・ターゲットなどを書くことで、AIがあなたに合った答えを出してくれます。ここが自分専用にカスタマイズできる部分です。">' +
      H('要素② 文脈（コンテキスト）') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">「私は〇〇業で〜という状況です」と背景を伝える</li>' +
      '<li class="s-list-arrow">業種・商品・ターゲット・課題を具体的に書く</li>' +
      '<li class="s-list-arrow">例：「私は地方の小さなカフェを経営しています。客層は30〜50代の女性です」</li>' +
      '<li class="s-list-head">→ ここを変えるだけで「自分専用プロンプト」になる</li>' +
      '<li class="s-list-sub">→ 【】や＿＿で埋める場所が用意されていることも多い</li>' +
      '</ul></div></section>';
  }

  function slide20() {
    return '<section class="slide" data-section="part2" data-title="要素③出力形式" data-notes="出力形式とは、欲しい答えの形を指定することです。箇条書き、表形式、メール文章など、どんな形で答えてほしいかを伝えると、そのまま使える形で出力されます。">' +
      H('要素③ 出力形式') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">「〇〇の形式で答えてください」と欲しい形を指定する</li>' +
      '<li class="s-list-arrow">「箇条書きで5つ」「メール文として」「表にして」など</li>' +
      '<li class="s-list-arrow">「300文字以内で」「です・ます調で」など語調も指定できる</li>' +
      '<li class="s-list-head">→ 形式を指定するとそのまま使えるアウトプットが出る</li>' +
      '</ul></div></section>';
  }

  function slide21() {
    return '<section class="slide" data-section="part2" data-title="カスタマイズOKな場所" data-notes="もらったプロンプトをカスタマイズするとき、変えていい場所と変えてはいけない場所があります。文脈の部分、つまりあなたの業種や商品の情報は積極的に自分のものに変えてください。">' +
      H('カスタマイズOKな場所・そのまま使う場所') +
      '<div class="slide-content"><div class="s-compare">' +
      '<div class="s-compare-col positive"><div class="s-compare-badge">積極的に変えてOK</div>' +
      '<div class="s-compare-title">文脈の部分</div>' +
      '<ul class="s-compare-items"><li>業種・商品名</li><li>ターゲット顧客</li><li>具体的な状況・課題</li><li>【】や＿＿の空欄</li></ul></div>' +
      '<div class="s-compare-col neutral"><div class="s-compare-badge">最初はそのまま使う</div>' +
      '<div class="s-compare-title">構造の部分</div>' +
      '<ul class="s-compare-items"><li>役割指示の書き方</li><li>出力形式の指定</li><li>制約条件</li></ul></div>' +
      '</div></div></section>';
  }

  function slide22() {
    return '<section class="slide" data-section="part2" data-title="わからなければAIに聞く" data-notes="プロンプトの意味がわからない部分があっても大丈夫です。そのプロンプトをAI自身に見せて、これはどういう意味ですか、どう使えばいいですかと聞いてしまいましょう。AIは自分への指示書を自分で説明してくれます。">' +
      H('お手紙の意味がわからない時は？') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">迷ったら、AI自身に聞いてしまおう！</li>' +
      '<li class="s-list-arrow">プロンプトをそのまま貼り付けて「これはどういう意味ですか？」</li>' +
      '<li class="s-list-arrow">「このプロンプトの〇〇の部分に何を入れればいいですか？」</li>' +
      '<li class="s-list-arrow">「私は〇〇業です。このプロンプトをカスタマイズしてください」</li>' +
      '<li class="s-list-head">→ AIは自分への指示書を自分で説明してくれる</li>' +
      '</ul></div></section>';
  }

  function slide23() {
    return '<section class="slide" data-section="part2" data-title="Feedback Loopの使い方" data-notes="プロンプトを一発で完璧にしようとしなくていいです。出てきた答えを見て、もう少し短くして、もっと丁寧なトーンでと対話を重ねていく。これがFeedback Loopです。最初から100点を目指さず、60点から始めてブラッシュアップしていきましょう。">' +
      H('Feedback Loop — 対話を重ねて精度を上げる') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">プロンプトをコピペして送る（60点でOK）</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">出力を見て「もう少し〇〇にして」と追加で指示</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">納得できるまで繰り返す → 100点に近づく</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">最初から完璧を目指さない。まず貼り付けることが大事</li></ul>' +
      '</div></section>';
  }

  function slide24() {
    return '<section class="slide" data-section="part2" data-title="PART02 まとめ" data-notes="PART02のまとめです。プロンプトは役割・文脈・出力形式の3要素でできている。文脈の部分だけ自分用に変えればOK。わからなければAI自身に聞く。この3点を覚えておいてください。">' +
      H('PART 02 まとめ') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">プロンプトは「役割・文脈・出力形式」の3要素でできている</li>' +
      '<li class="s-list-callout">【業種・商品・状況】の部分だけ自分用に書き換えればOK</li>' +
      '<li class="s-list-callout">わからなければ「このプロンプトをどう使えばいい？」とAIに聞く</li>' +
      '<li class="s-list-arrow">一発で完璧を目指さず、対話しながらブラッシュアップする</li>' +
      '</ul></div></section>';
  }

  /* --- PART 03 --- */

  function slide25() {
    return '<section class="slide slide-section" data-section="part3" data-title="PART 03" data-notes="">' +
      '<div class="slide-content"><div class="s-section-accent-bar"></div>' +
      '<div class="s-section-chapter">PART 03</div>' +
      '<h1 class="s-section-title">日常業務で<br>使い倒す！</h1>' +
      '<p class="s-section-lead">実践テクニックと業務別の使い方</p></div></section>';
  }

  function slide26() {
    return '<section class="slide" data-section="part3" data-title="メール返信・お礼文" data-notes="最初に試してほしいのがメール返信です。面倒なお断りメール、丁寧なお礼文、クレームへの初期対応文。これらはAIが最も得意とする分野です。">' +
      H('① メール返信・お礼文') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">AIが最も得意とする分野のひとつ</li>' +
      '<li class="s-list-arrow">お断りメール、お礼文、クレーム初期対応</li>' +
      '<li class="s-list-arrow">「丁寧なお断りメールを書いてください。相手は〇〇、理由は〇〇です」</li>' +
      '<li class="s-list-head">→ 30秒で使えるメール文が完成</li>' +
      '<li class="s-list-sub">→ 最後は必ず自分の目で確認・修正してから送る</li>' +
      '</ul></div></section>';
  }

  function slide27() {
    return '<section class="slide" data-section="part3" data-title="SNS投稿文の量産" data-notes="SNS投稿を毎日考えるのは大変です。AIに商品の特徴やターゲットを伝えると、Instagram、X、LINEなど複数のパターンを一気に作ってくれます。週1回まとめて作る運用もできます。">' +
      H('② SNS投稿文の量産') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">毎日のSNS投稿ネタ切れを解消</li>' +
      '<li class="s-list-arrow">Instagram・X・LINE告知・Google口コミ返信など</li>' +
      '<li class="s-list-arrow">「〇〇というカフェのInstagram投稿を3パターン作って」</li>' +
      '<li class="s-list-head">→ 週1回まとめ作成 → 毎日投稿の運用が可能に</li>' +
      '<li class="s-list-sub">→ ハッシュタグも一緒に提案してもらえる</li>' +
      '</ul></div></section>';
  }

  function slide28() {
    return '<section class="slide" data-section="part3" data-title="議事録・報告書" data-notes="会議のメモをAIに渡すと、整理された議事録に変換してくれます。決定事項・アクション・担当者の形式で出力してもらえば、そのまま共有できます。">' +
      H('③ 議事録・報告書') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">会議メモ → 整理済み議事録へ即変換</li>' +
      '<li class="s-list-arrow">「以下のメモを議事録にしてください。決定事項・アクション・担当者の形式で」</li>' +
      '<li class="s-list-arrow">月次報告書、日報の下書きも同様に対応</li>' +
      '<li class="s-list-head">→ ゼロから書く時間をほぼゼロにできる</li>' +
      '<li class="s-list-sub">→ 手書きメモを写真に撮って貼り付けることも可能</li>' +
      '</ul></div></section>';
  }

  function slide29() {
    return '<section class="slide" data-section="part3" data-title="見積書・提案書の下書き" data-notes="提案書の文章部分をAIが下書きしてくれます。プロジェクトの概要・目的・提供内容を箇条書きで渡すと、しっかりした提案文を作ってくれます。">' +
      H('④ 見積書・提案書の下書き') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">提案書の文章部分をAIが下書き</li>' +
      '<li class="s-list-arrow">「以下の概要で提案書の導入文を書いてください」</li>' +
      '<li class="s-list-arrow">会社紹介文、サービス説明文、実績紹介など</li>' +
      '<li class="s-list-head">→ 文章に悩む時間を8割削減</li>' +
      '<li class="s-list-sub">→ 金額・条件は必ず自分で確認する</li>' +
      '</ul></div></section>';
  }

  function slide30() {
    return '<section class="slide" data-section="part3" data-title="採用・求人文章" data-notes="求人票の作成もAIが得意です。職種・仕事内容・求める人物像を伝えると、応募したくなる求人文章を作ってくれます。IndeedやハローワークのフォーマットにAIが合わせてくれます。">' +
      H('⑤ 採用・求人文章') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">「応募したくなる求人文章」をAIが作成</li>' +
      '<li class="s-list-arrow">職種・仕事内容・求める人物像をざっくり伝えるだけ</li>' +
      '<li class="s-list-arrow">Indeed・ハローワーク・自社サイト向けに最適化</li>' +
      '<li class="s-list-head">→ 採用コンサルタントに頼むような文章が無料で完成</li>' +
      '<li class="s-list-sub">→ 「うちの雰囲気が伝わるように」と追加指示も有効</li>' +
      '</ul></div></section>';
  }

  function slide31() {
    return '<section class="slide" data-section="part3" data-title="クレーム対応文" data-notes="クレーム対応の文章を書くのは精神的に消耗します。AIに状況を伝えると、誠意が伝わりつつ会社を守る言い回しで文章を作ってくれます。感情的にならずに冷静な文章が出せるのがAIの強みです。">' +
      H('⑥ クレーム対応文') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">感情的にならず、誠意が伝わる文章をAIが作成</li>' +
      '<li class="s-list-arrow">「以下の状況でクレームをいただきました。丁寧なお詫び文を作成してください」</li>' +
      '<li class="s-list-arrow">状況・事実・対応策をメモ書きで渡すだけでOK</li>' +
      '<li class="s-list-head">→ 精神的消耗を減らしながら品質の高い対応文を作成</li>' +
      '<li class="s-list-sub">→ 必ず送信前に自分で内容を確認する</li>' +
      '</ul></div></section>';
  }

  function slide32() {
    return '<section class="slide" data-section="part3" data-title="商品説明文" data-notes="商品やサービスの説明文、チラシのコピーなども得意分野です。商品の特徴・ターゲット・価格帯を伝えると、購買意欲を刺激する文章を作ってくれます。">' +
      H('⑦ 商品説明文・チラシコピー') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">購買意欲を刺激する文章をAIが生成</li>' +
      '<li class="s-list-arrow">商品の特徴・ターゲット・価格帯を伝えるだけ</li>' +
      '<li class="s-list-arrow">「この商品の魅力を伝えるチラシのキャッチコピーを5つ作って」</li>' +
      '<li class="s-list-head">→ 複数パターンを一気に作成してベストを選ぶ</li>' +
      '<li class="s-list-sub">→ 「30代女性に刺さる言い方で」など絞り込み指示も有効</li>' +
      '</ul></div></section>';
  }

  function slide33() {
    return '<section class="slide" data-section="part3" data-title="社内マニュアル" data-notes="スタッフへの業務マニュアルを作るのも大変な作業ですが、AIに任せると整理してくれます。手順をメモ書きで渡してマニュアル形式で整理してと頼むだけで、新人でも読めるマニュアルが完成します。">' +
      H('⑧ 社内マニュアル・手順書') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">口頭で教えていた手順を、AIがマニュアルに変換</li>' +
      '<li class="s-list-arrow">「以下の手順をスタッフ向けのマニュアル形式にしてください」</li>' +
      '<li class="s-list-arrow">箇条書きのメモ → 番号付き手順書 → PDF化まで対応</li>' +
      '<li class="s-list-head">→ 引き継ぎ・教育コストが大幅に下がる</li>' +
      '<li class="s-list-sub">→ 「新人でもわかるように」と付け加えると噛み砕いた表現に</li>' +
      '</ul></div></section>';
  }

  function slide34() {
    return '<section class="slide" data-section="part3" data-title="定型化への3ステップ" data-notes="AIをうまく使い続けるコツは、良かったプロンプトを定型化することです。使ったプロンプトをメモ帳に保存して、次回は貼り付けるだけにする。これを繰り返すことでプロンプト資産が溜まっていきます。">' +
      H('繰り返し使うための「定型化」3ステップ') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text"><strong>使う</strong> — もらったプロンプトをコピペして試してみる</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text"><strong>保存</strong> — 良かったプロンプトをメモ帳・Notionに保存</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text"><strong>使い回す</strong> — 次回は保存したものを貼り付けるだけ</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">これを繰り返すとプロンプト資産が積み上がっていく</li></ul>' +
      '</div></section>';
  }

  function slide35() {
    return '<section class="slide" data-section="part3" data-title="プロンプトライブラリを作る" data-notes="プロンプトライブラリとは、自分専用のプロンプト集です。メモ帳、Notion、Googleドキュメントなどにカテゴリ別で保存しておくと、次回から検索して使えます。">' +
      H('プロンプトライブラリを作ろう') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">使ったプロンプトをカテゴリ別に保存する「自分専用プロンプト集」</li>' +
      '<li class="s-list-arrow">保存先：メモ帳・Notion・Googleドキュメント・スプレッドシート</li>' +
      '<li class="s-list-arrow">カテゴリ例：メール用 / SNS用 / 社内文書用 / 顧客対応用</li>' +
      '<li class="s-list-head">→ 積み上げるほど「あなただけのAI活用資産」になる</li>' +
      '<li class="s-list-sub">→ 最初は5個でOK。まず貯め始めることが大事</li>' +
      '</ul></div></section>';
  }

  function slide36() {
    return '<section class="slide" data-section="part3" data-title="チームへの展開" data-notes="プロンプトが使えるようになったら、スタッフにも展開しましょう。プロンプトをGoogleドライブで共有して、スタッフが誰でも使えるようにする。チーム全体で使うほうが効果は何倍にも広がります。">' +
      H('チームへの展開 — スタッフが使えるようにする') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">プロンプトライブラリをGoogleドライブで共有する</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">「このプロンプトを使ってこの仕事をやってみて」と小さく依頼</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">うまくいったらチーム全体のルーティンにする</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">一人で使うより、チームで使うほうが効果は何倍にも</li></ul>' +
      '</div></section>';
  }

  function slide37() {
    return '<section class="slide" data-section="part3" data-title="PART03 まとめ" data-notes="PART03のまとめです。AIは日常業務の8割をカバーできます。メール・SNS・議事録・提案書・採用・クレーム・商品説明・マニュアル、すべてに使えます。使ったプロンプトは保存して資産にしていきましょう。">' +
      H('PART 03 まとめ') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">AIは日常業務の8割をカバーできる万能アシスタント</li>' +
      '<li class="s-list-arrow">メール / SNS / 議事録 / 提案書 / 採用 / クレーム / 商品説明 / マニュアル</li>' +
      '<li class="s-list-callout">使ったプロンプトは必ず保存してライブラリ化する</li>' +
      '<li class="s-list-callout">チームで共有すると効果が何倍にも広がる</li>' +
      '</ul></div></section>';
  }

  /* --- PART 04 --- */

  function slide38() {
    return '<section class="slide slide-section" data-section="part4" data-title="PART 04" data-notes="">' +
      '<div class="slide-content"><div class="s-section-accent-bar"></div>' +
      '<div class="s-section-chapter">PART 04</div>' +
      '<h1 class="s-section-title">業種別<br>活用事例</h1>' +
      '<p class="s-section-lead">あなたの業種ではどう使う？</p></div></section>';
  }

  function slide39() {
    return '<section class="slide" data-section="part4" data-title="飲食店・カフェ" data-notes="飲食店やカフェでの活用事例です。Instagramのメニュー紹介投稿、口コミへの返信文、季節限定メニューの告知文など、毎日のSNS更新に使えます。">' +
      H('飲食店・カフェ の活用事例') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">Instagramのメニュー紹介投稿を量産</li>' +
      '<li class="s-list-arrow">「本日のランチメニューをインスタ映えする文章で紹介して」</li>' +
      '<li class="s-list-arrow">Googleマップ口コミへの返信文を丁寧に作成</li>' +
      '<li class="s-list-arrow">季節限定メニューの告知チラシ文章</li>' +
      '<li class="s-list-head">→ 毎日のSNS更新の悩みが解消</li>' +
      '</ul></div></section>';
  }

  function slide40() {
    return '<section class="slide" data-section="part4" data-title="小売・雑貨店" data-notes="小売・雑貨店での活用事例です。商品のポップ文章、セールの告知文、新商品紹介メールなどに活用できます。">' +
      H('小売・雑貨店 の活用事例') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">商品POPの文章をAIが作成</li>' +
      '<li class="s-list-arrow">「この雑貨の特徴を伝えるPOP文を3パターン作って」</li>' +
      '<li class="s-list-arrow">セール・新商品告知のSNS投稿</li>' +
      '<li class="s-list-arrow">メールマガジン・ニュースレターの下書き</li>' +
      '<li class="s-list-head">→ 商品説明に悩む時間をゼロにできる</li>' +
      '</ul></div></section>';
  }

  function slide41() {
    return '<section class="slide" data-section="part4" data-title="美容サロン" data-notes="美容サロンでの活用事例です。施術メニューの紹介文、お客様へのリマインドメッセージ、口コミへの返信などに使えます。">' +
      H('美容サロン の活用事例') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">施術メニューの魅力を伝えるInstagram投稿</li>' +
      '<li class="s-list-arrow">「〇〇コースの魅力を優しい文体で紹介して」</li>' +
      '<li class="s-list-arrow">来店前のリマインドLINEメッセージ</li>' +
      '<li class="s-list-arrow">口コミ返信文（丁寧&amp;感謝が伝わるトーン）</li>' +
      '<li class="s-list-head">→ 女性向けの柔らかい文体も得意分野</li>' +
      '</ul></div></section>';
  }

  function slide42() {
    return '<section class="slide" data-section="part4" data-title="士業・コンサル" data-notes="士業やコンサルタントでの活用事例です。提案書の文章、ニュースレター、専門用語をわかりやすく翻訳して伝える使い方が特に効果的です。">' +
      H('士業・コンサル の活用事例') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">専門用語をわかりやすく翻訳して伝える</li>' +
      '<li class="s-list-arrow">「この法改正の内容を経営者向けにわかりやすく説明して」</li>' +
      '<li class="s-list-arrow">提案書・報告書の文章下書き</li>' +
      '<li class="s-list-arrow">メールマガジン・ニュースレターの執筆</li>' +
      '<li class="s-list-head">→ 難しい内容をわかりやすく届けるのが得意</li>' +
      '</ul></div></section>';
  }

  function slide43() {
    return '<section class="slide" data-section="part4" data-title="建設・工務店" data-notes="建設・工務店での活用事例です。施工事例の紹介文、お客様へのアフターフォローメール、求人票の作成などに使えます。">' +
      H('建設・工務店 の活用事例') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">施工事例の紹介文をわかりやすく作成</li>' +
      '<li class="s-list-arrow">「〇〇の施工事例をホームページ掲載用に紹介して」</li>' +
      '<li class="s-list-arrow">お客様へのアフターフォローメール文</li>' +
      '<li class="s-list-arrow">現場スタッフ向け安全管理マニュアルの整理</li>' +
      '<li class="s-list-head">→ 技術を言葉にするのが苦手でもAIが代わりに</li>' +
      '</ul></div></section>';
  }

  function slide44() {
    return '<section class="slide" data-section="part4" data-title="教室・スクール" data-notes="教室やスクールでの活用事例です。体験レッスンの案内文、保護者へのお知らせ、カリキュラム紹介文などに使えます。">' +
      H('教室・スクール の活用事例') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">体験レッスンの案内文で入会者を増やす</li>' +
      '<li class="s-list-arrow">「〇〇教室の体験レッスン案内文を保護者向けに作って」</li>' +
      '<li class="s-list-arrow">生徒・保護者向けのお知らせ・ニュースレター</li>' +
      '<li class="s-list-arrow">レッスンの魅力を伝えるInstagram投稿</li>' +
      '<li class="s-list-head">→ 「通わせたい！」と思わせる文章をAIが生成</li>' +
      '</ul></div></section>';
  }

  function slide45() {
    return '<section class="slide" data-section="part4" data-title="介護・福祉" data-notes="介護・福祉事業での活用事例です。ご家族への月次レポート文章、求人票、研修資料の作成などに使えます。個人情報に注意しながら使うことが前提ですが、定型的な文章の作成は大幅に効率化できます。">' +
      H('介護・福祉 の活用事例') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">ご家族向け月次レポートの文章を効率化</li>' +
      '<li class="s-list-arrow">「以下の状況をご家族向けの温かい文体で報告文にして」</li>' +
      '<li class="s-list-arrow">スタッフ研修資料・業務手順書の整理</li>' +
      '<li class="s-list-arrow">求人票の文章（介護の魅力が伝わるように）</li>' +
      '<li class="s-list-head">→ 個人情報は入力せず「利用者Aさん」などで代替</li>' +
      '</ul></div></section>';
  }

  function slide46() {
    return '<section class="slide" data-section="part4" data-title="ECショップ" data-notes="ECショップでの活用事例です。商品説明文、レビュー返信、メールマガジンなどに使えます。大量の商品説明文を一気に作ることもできるので、商品数が多いショップほど効果を実感しやすいです。">' +
      H('ECショップ・通販 の活用事例') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">大量の商品説明文を一気に作成</li>' +
      '<li class="s-list-arrow">「〇〇という商品の特徴を魅力的な商品説明文にして」</li>' +
      '<li class="s-list-arrow">レビュー・口コミへの返信文</li>' +
      '<li class="s-list-arrow">カート落ちフォローメール・リピーター向けメルマガ</li>' +
      '<li class="s-list-head">→ 商品数が多いほどコスパが良い</li>' +
      '</ul></div></section>';
  }

  function slide47() {
    return '<section class="slide" data-section="part4" data-title="あなたの業種に当てはめると？" data-notes="今見てきた事例を参考に、あなたの業種では何に使えそうでしょうか。どんな業種でも、文章を書く作業が発生する場面なら必ずAIが役に立ちます。">' +
      H('あなたの業種に当てはめてみましょう') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">文章を書く作業が発生する場面 → AIが必ず役に立つ</li>' +
      '<li class="s-list-arrow">定期的に書いている文章は何ですか？</li>' +
      '<li class="s-list-arrow">苦手・面倒に感じている文章作業は何ですか？</li>' +
      '<li class="s-list-arrow">スタッフが毎回やり方を聞いてくる作業は何ですか？</li>' +
      '<li class="s-list-head">→ その作業、まずAIに試してみてください</li>' +
      '</ul></div></section>';
  }

  function slide48() {
    return '<section class="slide" data-section="part4" data-title="PART04 まとめ" data-notes="PART04のまとめです。どの業種でも、文章を書く場面があればAIが使えます。まず自分のビジネスで一番多く書いている文章を特定して、そこからAIを試してみましょう。">' +
      H('PART 04 まとめ') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">どの業種でも「文章を書く場面」があればAIが使える</li>' +
      '<li class="s-list-arrow">まず自分のビジネスで「一番よく書く文章」を特定する</li>' +
      '<li class="s-list-arrow">その文章のプロンプトをひとつ作ることが第一歩</li>' +
      '<li class="s-list-head">→ 小さく始めて、徐々に広げていく</li>' +
      '</ul></div></section>';
  }

  /* --- PART 05 --- */

  function slide49() {
    return '<section class="slide slide-section" data-section="part5" data-title="PART 05" data-notes="">' +
      '<div class="slide-content"><div class="s-section-accent-bar"></div>' +
      '<div class="s-section-chapter">PART 05</div>' +
      '<h1 class="s-section-title">よくある失敗と<br>その解決策</h1>' +
      '<p class="s-section-lead">知っておけば怖くない</p></div></section>';
  }

  function slide50() {
    return '<section class="slide" data-section="part5" data-title="失敗①結果が使えない" data-notes="一番多い失敗は、出てきた文章が使えないというものです。これはプロンプトに情報が足りていないことが原因です。解決策はシンプルで、もっと具体的に教えてとAIに追加で指示するだけです。">' +
      H('失敗① 出てきた文章が使えない') +
      '<div class="slide-content">' +
      '<div class="s-risk-list"><div class="s-risk-item">' +
      '<div class="s-risk-header"><span class="s-risk-badge high">よくある</span><span class="s-risk-title">出力が抽象的すぎる・的外れな内容になる</span></div>' +
      '<div class="s-risk-body">原因：プロンプトに業種・状況・条件の情報が足りていない<div class="s-risk-proposal">解決策：「もっと具体的に」「〇〇向けに書き直して」と追加指示する</div></div>' +
      '</div></div>' +
      '<ul class="s-list" style="margin-top:12px"><li class="s-list-callout">一発で完璧を目指さない。対話で精度を上げるのが正解</li></ul>' +
      '</div></section>';
  }

  /* --- PART 05 続き --- */

  function slide51() {
    return '<section class="slide" data-section="part5" data-title="失敗②毎回ゼロから入力" data-notes="毎回ゼロからプロンプトを書いている方は、その作業を見直してください。一度うまくいったプロンプトは必ず保存しておきましょう。保存して使い回すことで、AIの活用効率が劇的に上がります。">' +
      H('失敗② 毎回ゼロからプロンプトを書いている') +
      '<div class="slide-content">' +
      '<div class="s-risk-list"><div class="s-risk-item">' +
      '<div class="s-risk-header"><span class="s-risk-badge medium">もったいない</span><span class="s-risk-title">毎回同じ作業をゼロから繰り返している</span></div>' +
      '<div class="s-risk-body">原因：うまくいったプロンプトを保存していない<div class="s-risk-proposal">解決策：使うたびにメモ帳・Notionに保存してライブラリ化する</div></div>' +
      '</div></div>' +
      '<ul class="s-list" style="margin-top:12px"><li class="s-list-callout">プロンプトは資産。保存・蓄積・使い回しが鉄則</li></ul>' +
      '</div></section>';
  }

  function slide52() {
    return '<section class="slide" data-section="part5" data-title="失敗③AIが嘘をつく" data-notes="AIが事実と異なる情報を生成することがあります。これをハルシネーションといいます。特に数字・固有名詞・法律情報は必ず自分で確認してください。AIは文章の構造を作るのが得意ですが、事実確認は人間がする必要があります。">' +
      H('失敗③ AIが嘘をついた（ハルシネーション）') +
      '<div class="slide-content">' +
      '<div class="s-risk-list"><div class="s-risk-item">' +
      '<div class="s-risk-header"><span class="s-risk-badge high">要注意</span><span class="s-risk-title">AIが自信満々に間違った情報を提供することがある</span></div>' +
      '<div class="s-risk-body">特に危険：数字・法律・固有名詞・統計データ<div class="s-risk-proposal">対策：数字・法律・固有名詞は必ず自分で確認する。AIは「文章を作る」のが仕事、「事実を保証する」のは人間の仕事</div></div>' +
      '</div></div>' +
      '</div></section>';
  }

  function slide53() {
    return '<section class="slide" data-section="part5" data-title="失敗④スタッフに使わせられない" data-notes="スタッフにAIを使わせようとしても、なかなか浸透しないという相談をよく受けます。最初から全員に使わせようとせず、まずAIに興味を持っているスタッフ一人から始めることをお勧めします。">' +
      H('失敗④ スタッフになかなか浸透しない') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">まず自分が使いこなせるようになる（今日がそのスタート）</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">AIに興味があるスタッフを1人だけ選んで、一緒に使ってみる</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">成功事例を作ってから、チーム全体に広げる</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">全員一斉導入より「1人の成功事例」が最強の説得力</li></ul>' +
      '</div></section>';
  }

  function slide54() {
    return '<section class="slide" data-section="part5" data-title="失敗⑤セキュリティが心配" data-notes="AIにどこまでの情報を入力してよいかわからないという声をよく聞きます。基本的なルールは、顧客の個人情報・機密情報・社外秘の数字はAIに入力しないことです。文章の構造や一般的なビジネス課題の解決策を聞くのは問題ありません。">' +
      H('失敗⑤ セキュリティが心配で踏み出せない') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">入力してはいけないもの</li>' +
      '<li class="s-list-arrow">顧客の氏名・住所・電話番号などの個人情報</li>' +
      '<li class="s-list-arrow">社外秘の売上・財務数字</li>' +
      '<li class="s-list-arrow">取引先との機密契約内容</li>' +
      '<li class="s-list-callout">入力してOKなもの</li>' +
      '<li class="s-list-arrow">業種・サービス概要・一般的なビジネス課題</li>' +
      '<li class="s-list-arrow">架空のシナリオ・サンプルデータで置き換えた情報</li>' +
      '</ul></div></section>';
  }

  function slide55() {
    return '<section class="slide" data-section="part5" data-title="安全に使う3つのルール" data-notes="AIを安全に使うための3つのルールです。個人情報は入力しない、数字・法律は必ず確認する、送信前に自分の目で読む。この3つさえ守れば、安心してAIを活用できます。">' +
      H('安全に使う 3つのルール') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text"><strong>個人情報は入力しない</strong> — 顧客名・住所・電話番号はNG</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text"><strong>数字・法律は必ず確認する</strong> — AIの出力をそのまま信じない</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text"><strong>送信前に自分の目で読む</strong> — 最終確認は必ず人間が行う</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">この3つを守れば安心してAIを活用できる</li></ul>' +
      '</div></section>';
  }

  function slide56() {
    return '<section class="slide" data-section="part5" data-title="AIへの期待値の設定" data-notes="AIはすごく優秀なアシスタントですが、万能ではありません。文章を書く、アイデアを出す、情報を整理する、翻訳するのは得意。でも、最終判断・責任を取る・感情を読む・最新情報を確認するのは苦手です。得意不得意を理解して使うことが大切です。">' +
      H('AIに期待できること・できないこと') +
      '<div class="slide-content"><div class="s-compare">' +
      '<div class="s-compare-col positive"><div class="s-compare-badge">得意なこと</div>' +
      '<div class="s-compare-title">AIに任せる</div>' +
      '<ul class="s-compare-items"><li>文章を書く・整える</li><li>アイデアを大量に出す</li><li>情報を整理・構造化する</li><li>翻訳・言い換え</li></ul></div>' +
      '<div class="s-compare-col negative"><div class="s-compare-badge">苦手なこと</div>' +
      '<div class="s-compare-title">人間が担当する</div>' +
      '<ul class="s-compare-items"><li>最終判断・責任を取る</li><li>感情・空気を読む</li><li>最新情報の確認</li><li>数字・法律の保証</li></ul></div>' +
      '</div></div></section>';
  }

  function slide57() {
    return '<section class="slide" data-section="part5" data-title="PART05 まとめ" data-notes="PART05のまとめです。一発で完璧を求めない、プロンプトは保存する、数字と法律は自分で確認する、個人情報は入力しない。この4点を守れば安心してAIを使い続けられます。">' +
      H('PART 05 まとめ') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">一発で完璧を求めない — 対話で精度を上げるのが正解</li>' +
      '<li class="s-list-callout">使えたプロンプトは必ず保存する — 資産化が鉄則</li>' +
      '<li class="s-list-callout">数字・法律は必ず自分で確認する</li>' +
      '<li class="s-list-callout">個人情報・機密情報はAIに入力しない</li>' +
      '</ul></div></section>';
  }

  /* --- PART 06 --- */

  function slide58() {
    return '<section class="slide slide-section" data-section="part6" data-title="PART 06" data-notes="">' +
      '<div class="slide-content"><div class="s-section-accent-bar"></div>' +
      '<div class="s-section-chapter">PART 06</div>' +
      '<h1 class="s-section-title">もっと使い倒す！<br>上級テクニック</h1>' +
      '<p class="s-section-lead">コピペの次のステップへ</p></div></section>';
  }

  function slide59() {
    return '<section class="slide" data-section="part6" data-title="カスタム指示の設定" data-notes="ChatGPTにはカスタム指示という機能があります。毎回入力しなくても、自分の業種や好みの文体をAIに覚えさせておける機能です。一度設定すると、毎回のプロンプトが短くなります。">' +
      H('カスタム指示 — 毎回入力しない仕組みを作る') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">ChatGPTの設定 →「カスタム指示」を開く</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">「私は〇〇業の経営者です。〜を大切にしています」と入力</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">設定後は毎回の説明が不要になり、プロンプトが短くなる</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">一度設定するだけで、AIがあなたを知っている状態になる</li></ul>' +
      '</div></section>';
  }

  function slide60() {
    return '<section class="slide" data-section="part6" data-title="プロジェクトで整理する" data-notes="ChatGPTのプロジェクト機能やClaudeのプロジェクト機能を使うと、用途別にAIの会話を整理できます。採用用プロジェクト、SNS用プロジェクトなど分けておくと、使いたい時にすぐ見つかります。">' +
      H('プロジェクト・フォルダで用途別に整理する') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">ChatGPT・Claudeのプロジェクト機能で用途別に管理</li>' +
      '<li class="s-list-arrow">例：「SNS投稿用」「採用文章用」「お客様対応用」</li>' +
      '<li class="s-list-arrow">プロジェクトごとに背景情報を設定しておける</li>' +
      '<li class="s-list-head">→ 使いたい時にすぐ見つかる、散らからない</li>' +
      '<li class="s-list-sub">→ スタッフと共有プロジェクトを作ることも可能</li>' +
      '</ul></div></section>';
  }

  function slide61() {
    return '<section class="slide" data-section="part6" data-title="対話で精度を上げる" data-notes="AIとの会話は一問一答ではありません。最初の出力に対してフィードバックを返しながら精度を上げていく対話です。もっと短く、もっと丁寧に、具体例を追加してという指示を重ねるとどんどん良くなります。">' +
      H('AIと対話して精度を上げる') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">最初の出力に対してフィードバックを重ねる</li>' +
      '<li class="s-list-arrow">「もっと短くして（300文字以内で）」</li>' +
      '<li class="s-list-arrow">「もっと丁寧な敬語に書き直して」</li>' +
      '<li class="s-list-arrow">「具体的な数字の例を追加して」</li>' +
      '<li class="s-list-arrow">「〇〇歳の女性に向けた言い方に変えて」</li>' +
      '<li class="s-list-head">→ 対話を重ねるほど「思い通りの出力」に近づく</li>' +
      '</ul></div></section>';
  }

  function slide62() {
    return '<section class="slide" data-section="part6" data-title="プロンプトを連鎖させる" data-notes="複数のプロンプトをつなげて使う方法があります。最初に構成を作ってもらい、次にその構成を元に本文を書いてもらい、最後に校正してもらうという流れです。工程を分けることで完成度が上がります。">' +
      H('プロンプトを連鎖させる') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">「〇〇についての記事の構成を作って」→ 構成を得る</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">「この構成で本文を書いて」→ 下書きを得る</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">「この文章を校正・改善して」→ 完成度を上げる</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">工程を分けるほど、クオリティが上がる</li></ul>' +
      '</div></section>';
  }

  function slide63() {
    return '<section class="slide" data-section="part6" data-title="テンプレート化する" data-notes="毎回同じ用途で使うプロンプトはテンプレートにしておきましょう。業種・商品・状況などを【】で囲っておき、使うたびに【】の中だけ書き換えるだけにする。これで使い回しが格段に楽になります。">' +
      H('プロンプトをテンプレート化する') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">毎回変わる部分を【】で囲ったテンプレートを作る</li>' +
      '<li class="s-list-arrow">例：「私は【業種】を経営しています。【商品/サービス名】の【SNS/チラシ/求人】用の文章を作ってください」</li>' +
      '<li class="s-list-arrow">使うたびに【】の中だけ書き換えるだけでOK</li>' +
      '<li class="s-list-head">→ プロンプトを考える時間がゼロになる</li>' +
      '</ul></div></section>';
  }

  function slide64() {
    return '<section class="slide" data-section="part6" data-title="ChatGPT vs Claude vs Gemini" data-notes="主要なAIツールの使い分けについてです。ChatGPTは最も一般的で使いやすい、Geminiはグーグルと連携しやすい、Claudeは長い文章の処理が得意。どれを使っても基本は同じです。まずひとつを使い込むことが大切です。">' +
      H('ChatGPT / Claude / Gemini — どれを使う？') +
      '<div class="slide-content"><div class="s-compare">' +
      '<div class="s-compare-col positive"><div class="s-compare-badge">ChatGPT</div>' +
      '<div class="s-compare-title">最も定番</div>' +
      '<ul class="s-compare-items"><li>使いやすい・資料が多い</li><li>画像生成も対応</li></ul></div>' +
      '<div class="s-compare-col neutral"><div class="s-compare-badge">Gemini</div>' +
      '<div class="s-compare-title">Google連携</div>' +
      '<ul class="s-compare-items"><li>GmailやDocと連携</li><li>Google利用者におすすめ</li></ul></div>' +
      '<div class="s-compare-col neutral"><div class="s-compare-badge">Claude</div>' +
      '<div class="s-compare-title">長文・精度重視</div>' +
      '<ul class="s-compare-items"><li>長い文書の処理が得意</li><li>丁寧な回答が特徴</li></ul></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:12px"><li class="s-list-callout">どれでもOK。まずひとつを使い込むことが最優先</li></ul>' +
      '</div></section>';
  }

  function slide65() {
    return '<section class="slide" data-section="part6" data-title="プロンプト資産の棚卸し" data-notes="3ヶ月に1回は、保存したプロンプトを見直す棚卸しをしましょう。よく使うもの・あまり使わないものを整理して、最新の業務に合わせてアップデートする。プロンプトは生き物なので、育て続けることが大切です。">' +
      H('プロンプト資産の棚卸し') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">3ヶ月に1回、保存プロンプトを見直す</li>' +
      '<li class="s-list-arrow">よく使うもの → さらに磨いてテンプレート化</li>' +
      '<li class="s-list-arrow">あまり使わないもの → 削除 or 改善</li>' +
      '<li class="s-list-arrow">業務変化に合わせて内容をアップデート</li>' +
      '<li class="s-list-head">→ プロンプトは育て続けることで資産価値が上がる</li>' +
      '</ul></div></section>';
  }

  function slide66() {
    return '<section class="slide" data-section="part6" data-title="経営者のAI戦略" data-notes="AIを経営に組み込む視点を持ちましょう。どの業務をAIに任せ、どの業務は人間が担当するかを意識的に設計することが、これからの経営者に求められるスキルです。">' +
      H('経営者として持つべきAI戦略') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text"><strong>AI化できる業務を特定</strong> — 繰り返し・定型・文章系の業務</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text"><strong>人間にしかできない業務を守る</strong> — 判断・関係構築・創造</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text"><strong>チームのAIリテラシーを上げる</strong> — 経営者が先行して使う</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">AIを使いこなす経営者と、使えない経営者。差は開く一方</li></ul>' +
      '</div></section>';
  }

  function slide67() {
    return '<section class="slide" data-section="part6" data-title="PART06 まとめ" data-notes="PART06のまとめです。カスタム指示で毎回の入力を減らす、プロジェクトで整理する、対話して精度を上げる、テンプレート化する。これらを組み合わせることでAIが本当の業務パートナーになります。">' +
      H('PART 06 まとめ') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">カスタム指示で「毎回の説明」をゼロにする</li>' +
      '<li class="s-list-callout">プロジェクト機能で用途別に整理する</li>' +
      '<li class="s-list-callout">対話を重ねて精度を上げる、テンプレートで使い回す</li>' +
      '<li class="s-list-arrow">AI活用は「使うほど上手くなる」スキル</li>' +
      '</ul></div></section>';
  }

  /* --- PART 07: ライブデモ --- */

  function slide68() {
    return '<section class="slide slide-section" data-section="part7" data-title="PART 07" data-notes="">' +
      '<div class="slide-content"><div class="s-section-accent-bar"></div>' +
      '<div class="s-section-chapter">PART 07</div>' +
      '<h1 class="s-section-title">ライブデモ</h1>' +
      '<p class="s-section-lead">百聞は一見に如かず。さあ、AIとおしゃべりしてみましょう！</p></div></section>';
  }

  function slide69() {
    return '<section class="slide" data-section="part7" data-title="デモ準備" data-notes="それではいよいよ実際にAIを使ってみましょう。PCを開いてChatGPTまたはGeminiにアクセスしてください。お手元の資料のプロンプトも準備しておいてください。">' +
      H('まずPC・スマホを開いてください') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">ChatGPT（chatgpt.com）またはGemini（gemini.google.com）を開く</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">お手元のプロンプト資料を手元に置いておく</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">新しいチャットを開く</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">細かい説明や専門用語は使いません。触りながら慣れていきましょう！</li></ul>' +
      '</div></section>';
  }

  function slide70() {
    return '<section class="slide" data-section="part7" data-title="デモ①商品紹介文" data-notes="最初のデモです。まずプロンプトをコピーしてチャットボックスに貼り付けます。業種・商品の部分を自分のビジネスに書き換えてから送信してみましょう。30秒で商品紹介文が完成します。">' +
      H('デモ① 商品紹介文を作ってみよう') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">お手元のプロンプトをコピー（Ctrl+C）</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">チャットボックスに貼り付け（Ctrl+V）</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">【業種・商品名】の部分だけ自分のビジネスに書き換えてEnter</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">出てきた文章を見て「もっと短く」「もっと丁寧に」と追加指示してみましょう</li></ul>' +
      '</div></section>';
  }

  function slide71() {
    return '<section class="slide" data-section="part7" data-title="デモ②お礼メール" data-notes="次のデモはお礼メールです。相手の名前と感謝の理由をAIに伝えるだけで、丁寧なお礼メールが完成します。実際に試してみてください。">' +
      H('デモ② お礼メールを作ってみよう') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">このプロンプトを貼り付けて試してください</li>' +
      '<li class="s-list-arrow">「以下の状況でお礼メールを書いてください。相手：〇〇様、お礼の理由：〇〇、トーン：丁寧・温かみのある」</li>' +
      '<li class="s-list-head">→ 〇〇の部分を自分の状況に書き換えてから送信</li>' +
      '<li class="s-list-sub">→ 出てきた文章に「件名も追加して」と指示してみましょう</li>' +
      '</ul></div></section>';
  }

  function slide72() {
    return '<section class="slide" data-section="part7" data-title="デモ③SNS投稿3パターン" data-notes="3つ目のデモはSNS投稿文の量産です。お店や商品の特徴を伝えてInstagram投稿を3パターン作ってもらいましょう。どのパターンが自分のお店に合っているか選んでみてください。">' +
      H('デモ③ SNS投稿を3パターン作ってみよう') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">このプロンプトで試してください</li>' +
      '<li class="s-list-arrow">「私は【業種・店名】を経営しています。【商品・サービス】のInstagram投稿を3パターン作ってください。各200文字以内、ハッシュタグも追加してください」</li>' +
      '<li class="s-list-head">→ 3パターンの中から好きなものを選ぶだけ</li>' +
      '<li class="s-list-sub">→ 「もっとカジュアルに」「もっとフォーマルに」と調整も可能</li>' +
      '</ul></div></section>';
  }

  function slide73() {
    return '<section class="slide" data-section="part7" data-title="デモ④プロンプトをカスタマイズ" data-notes="4つ目のデモはプロンプトのカスタマイズです。お手元のプロンプトをAIに見せて、私の業種に合わせてカスタマイズしてと頼んでみましょう。AIが自動でカスタマイズしてくれます。">' +
      H('デモ④ プロンプト自体をAIにカスタマイズさせる') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">お手元のプロンプトをコピーして貼り付ける</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">「私は【業種】です。このプロンプトを私のビジネスに合わせてカスタマイズしてください」と追加</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">カスタマイズされたプロンプトをライブラリに保存する</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">プロンプトをカスタマイズするのもAIに任せてしまえばいい</li></ul>' +
      '</div></section>';
  }

  function slide74() {
    return '<section class="slide" data-section="part7" data-title="デモ⑤AIに聞いてみる" data-notes="5つ目のデモはAI自身に質問する体験です。使い方がわからないこと、もっとうまく使う方法、他に何に使えるかなど、なんでもAIに聞いてみましょう。AIはあなたのAIアドバイザーにもなれます。">' +
      H('デモ⑤ わからないことはAIに聞いてみよう') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">AIはあなたのAI活用アドバイザーにもなれる</li>' +
      '<li class="s-list-arrow">「私は〇〇業の経営者です。AIをどんな業務に使うと効果的ですか？」</li>' +
      '<li class="s-list-arrow">「このプロンプトを改善するには何を追加すればいいですか？」</li>' +
      '<li class="s-list-arrow">「ChatGPTをもっとうまく使う方法を教えてください」</li>' +
      '<li class="s-list-head">→ 何でも聞いていい。それがAIとの付き合い方</li>' +
      '</ul></div></section>';
  }

  function slide75() {
    return '<section class="slide" data-section="part7" data-title="自由実験タイム" data-notes="では少し自由に試す時間を取ります。普段の業務で使ってみたいことをAIに入力してみてください。うまくいかなければ追加で指示する、それを繰り返してみましょう。わからないことがあればどんどん質問してください。">' +
      H('フリータイム — 自分の業務で試してみよう') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">今日から使いたい業務に実際に試してみましょう</li>' +
      '<li class="s-list-arrow">普段書いているメール・SNS・案内文をAIで作ってみる</li>' +
      '<li class="s-list-arrow">うまくいかなければ「もっと〇〇にして」と追加指示</li>' +
      '<li class="s-list-arrow">よかったプロンプトはメモに保存しておく</li>' +
      '<li class="s-list-head">→ 困ったことは隣の方やスタッフと一緒に相談してOK</li>' +
      '</ul></div></section>';
  }

  function slide76() {
    return '<section class="slide" data-section="part7" data-title="PART07 まとめ" data-notes="ライブデモお疲れ様でした。実際に触ってみていかがでしたか？難しくなかったですよね。コピペして、自分の業種に書き換えて、追加指示する。この流れを今日体験できました。">' +
      H('PART 07 まとめ — 今日体験したこと') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">コピペして → 業種を書き換えて → Enterを押す</li>' +
      '<li class="s-list-callout">出てきた文章に「もっと〇〇にして」と追加指示する</li>' +
      '<li class="s-list-callout">わからないことはAI自身に聞けば教えてくれる</li>' +
      '<li class="s-list-arrow">この流れが「AIを使い倒す」の基本パターン</li>' +
      '</ul></div></section>';
  }

  /* --- PART 08 --- */

  function slide77() {
    return '<section class="slide slide-section" data-section="part8" data-title="PART 08" data-notes="">' +
      '<div class="slide-content"><div class="s-section-accent-bar"></div>' +
      '<div class="s-section-chapter">PART 08</div>' +
      '<h1 class="s-section-title">今日からの<br>アクションプラン</h1>' +
      '<p class="s-section-lead">「明日もやる」を仕組みにする</p></div></section>';
  }

  function slide78() {
    return '<section class="slide" data-section="part8" data-title="今日やること3つ" data-notes="今日帰ったらすぐにやること3つを決めておきましょう。目的を決める、コピペする、AIに聞く。この3ステップが今日の宿題です。">' +
      H('今日やること — 3ステップ') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text"><strong>目的を決める</strong> — 自分がAIで何をしたいか、ざっくり考える</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text"><strong>コピペする</strong> — お手元の資料のプロンプトをそのまま貼り付ける</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text"><strong>AIに聞く</strong> — 使い方がわからなければ、そのままAIにおしゃべり</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">細かい説明や専門用語は不要。触りながら慣れていきましょう！</li></ul>' +
      '</div></section>';
  }

  function slide79() {
    return '<section class="slide" data-section="part8" data-title="今週の目標" data-notes="今週1週間の目標を決めておきましょう。毎日何かひとつ、AIにやらせてみることです。メール、SNS投稿、議事録、何でも構いません。1週間続けると驚くほど慣れてきます。">' +
      H('今週の目標 — 毎日ひとつAIにやらせてみる') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">1日1回、何かひとつAIに任せてみる</li>' +
      '<li class="s-list-arrow">月：今日書く予定のメールをAIに下書きさせる</li>' +
      '<li class="s-list-arrow">火：SNS投稿のアイデアをAIに出してもらう</li>' +
      '<li class="s-list-arrow">水：議事録や報告書をAIに整理させる</li>' +
      '<li class="s-list-arrow">木・金：自分なりに応用してみる</li>' +
      '<li class="s-list-head">→ 1週間続けると驚くほど自然に使えるようになる</li>' +
      '</ul></div></section>';
  }

  function slide80() {
    return '<section class="slide" data-section="part8" data-title="習慣化の3つのコツ" data-notes="AIを習慣化するための3つのコツです。ハードルを下げる、毎日同じ時間に使う、そして良かった体験を記録する。特に最初は完璧を求めず、とにかく触れることが大切です。">' +
      H('習慣化の3つのコツ') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text"><strong>ハードルを下げる</strong> — 「完璧な文章」ではなく「下書き」を作るだけでOK</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text"><strong>毎日同じシーンで使う</strong> — 朝のメールチェック時、夕方のSNS投稿時など</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text"><strong>良かった体験を記録する</strong> — 「これが便利だった！」をメモしておく</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">習慣化の敵は「完璧主義」。まず触れることが最優先</li></ul>' +
      '</div></section>';
  }

  function slide81() {
    return '<section class="slide" data-section="part8" data-title="スタッフへの展開方法" data-notes="自分がある程度使えるようになったらスタッフへの展開を考えましょう。まず自分が使いこなせていることが前提です。AIに興味を持っているスタッフ1人に教えて、その人に他のスタッフへ広げてもらう方法がうまくいきます。">' +
      H('スタッフへの展開方法') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">①</div><div><div class="s-step-text">まず自分が使い方を覚える（今日がそのスタート）</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">②</div><div><div class="s-step-text">AIに興味がありそうなスタッフ1人に「一緒に使ってみよう」と声をかける</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">③</div><div><div class="s-step-text">その人を「AI担当」にして、チームへの橋渡しをしてもらう</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">「1人の成功事例」が最強の社内説得材料になる</li></ul>' +
      '</div></section>';
  }

  function slide82() {
    return '<section class="slide" data-section="part8" data-title="プロンプトノートを作る" data-notes="今日から始めてほしいのが、プロンプトノートの作成です。使ったプロンプトを貯めていくノートです。Googleドキュメント、メモ帳、ノート何でも構いません。まずひとつ、今日体験したプロンプトを保存することから始めましょう。">' +
      H('今日から始める「プロンプトノート」') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">使ったプロンプトを貯めていく自分専用ノートを作る</li>' +
      '<li class="s-list-arrow">ツール：Googleドキュメント・メモ帳・Notion・スプレッドシート何でもOK</li>' +
      '<li class="s-list-arrow">書く内容：プロンプト本文 + 用途 + うまくいったポイント</li>' +
      '<li class="s-list-head">→ まず今日体験したプロンプトを1つ保存することから</li>' +
      '<li class="s-list-sub">→ 積み上げると「あなただけのAI活用資産」になる</li>' +
      '</ul></div></section>';
  }

  function slide83() {
    return '<section class="slide slide-metric" data-section="part8" data-title="3ヶ月後のビジョン" data-notes="今日からAIを使い続けると、3ヶ月後には劇的に変わっています。定型業務の時間が減り、その分をお客様対応や事業成長に使えるようになります。今日の一歩が3ヶ月後の大きな差につながります。">' +
      '<div class="slide-content slide-content-center">' +
      '<p class="s-metric-lead">今日からAIを使い続けると、3ヶ月後に…</p>' +
      '<div class="s-metric-value">週5時間<span style="font-size:0.3em">が</span>浮く</div>' +
      '<p class="s-metric-desc">その時間をお客様対応・商品開発・スタッフ育成に<br>再投資できるようになる</p>' +
      '<p class="s-metric-source">実践者の平均体感値（参考）</p>' +
      '</div></section>';
  }

  function slide84() {
    return '<section class="slide" data-section="part8" data-title="AI活用の費用対効果" data-notes="ChatGPTの有料プランは月3000円程度です。週5時間の時間削減と考えると、時給換算で十分なコストパフォーマンスです。まず無料プランから始めて、使い込んでから有料を検討することをお勧めします。">' +
      H('AI活用の費用対効果') +
      '<div class="slide-content"><div class="s-compare">' +
      '<div class="s-compare-col neutral"><div class="s-compare-badge">コスト</div>' +
      '<div class="s-compare-title">無料〜月3,000円程度</div>' +
      '<ul class="s-compare-items"><li>ChatGPT無料版：機能制限あり</li><li>ChatGPT Plus：約3,000円/月</li><li>Gemini：Googleアカウントで無料</li></ul></div>' +
      '<div class="s-compare-col positive"><div class="s-compare-badge">リターン</div>' +
      '<div class="s-compare-title">週3〜5時間の削減</div>' +
      '<ul class="s-compare-items"><li>メール作成時間の削減</li><li>SNS投稿の時間削減</li><li>文章作成全般の効率化</li></ul></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:12px"><li class="s-list-callout">まず無料版から。使いこなせてから有料を検討</li></ul>' +
      '</div></section>';
  }

  function slide85() {
    return '<section class="slide" data-section="part8" data-title="経営者のAI習慣" data-notes="AIを使いこなす経営者に共通しているのは、毎日少しずつ使い続けているという習慣です。大きな変革より、小さな習慣の積み重ねが大切です。今日の一歩を続けることが、半年後の大きな差になります。">' +
      H('AI活用が定着している経営者の習慣') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">毎日何かひとつ、AIにやらせてみる</li>' +
      '<li class="s-list-arrow">良かったプロンプトは即座に保存する</li>' +
      '<li class="s-list-arrow">スタッフに「こんな使い方があるよ」と共有し続ける</li>' +
      '<li class="s-list-arrow">3ヶ月に1回、プロンプトライブラリを棚卸しする</li>' +
      '<li class="s-list-head">→ 大きな変革より「小さな習慣」が最強</li>' +
      '</ul></div></section>';
  }

  function slide86() {
    return '<section class="slide" data-section="part8" data-title="PART08 まとめ" data-notes="PART08のまとめです。今日やること3つ、目的を決める・コピペする・AIに聞く。これを今日帰ったらすぐ実行してください。プロンプトノートを作って、毎日少しずつ積み上げていきましょう。">' +
      H('PART 08 まとめ') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">今日帰ったらすぐ：目的を決める → コピペする → AIに聞く</li>' +
      '<li class="s-list-callout">今週中に：プロンプトノートを作り、毎日1つ保存する</li>' +
      '<li class="s-list-callout">来月中に：AI担当スタッフを1人決めて一緒に使い始める</li>' +
      '<li class="s-list-arrow">小さく始めて、毎日続ける。それだけでいい</li>' +
      '</ul></div></section>';
  }

  /* --- まとめ・CTA --- */

  function slide87() {
    return '<section class="slide slide-section" data-section="closing" data-title="まとめ" data-notes="">' +
      '<div class="slide-content"><div class="s-section-accent-bar"></div>' +
      '<div class="s-section-chapter">CLOSING</div>' +
      '<h1 class="s-section-title">まとめ &amp;<br>次のステップ</h1>' +
      '<p class="s-section-lead">今日から始まる、あなたのAI活用</p></div></section>';
  }

  function slide88() {
    return '<section class="slide" data-section="closing" data-title="今日のおさらい" data-notes="今日学んだことを3つにまとめます。プロンプトはお願いのお手紙でコピペだけでいい、文脈の部分を自分用に書き換えるだけでカスタマイズできる、そしてわからなければAI自身に聞けば教えてくれる。この3点が今日の核心です。">' +
      H('今日のおさらい — 3つのポイント') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">① プロンプト＝お願いのお手紙。必要なスキルはコピペだけ</li>' +
      '<li class="s-list-callout">② 文脈（業種・商品・状況）の部分を自分用に書き換えるだけ</li>' +
      '<li class="s-list-callout">③ わからなければ「これどう使えばいい？」とAI自身に聞く</li>' +
      '<li class="s-list-arrow">今日この3つを持って帰ってください</li>' +
      '</ul></div></section>';
  }

  function slide89() {
    return '<section class="slide" data-section="closing" data-title="宝の持ち腐れから使い倒しへ" data-notes="今日の前と後では何かが変わりましたね。もらったプロンプトが宝の持ち腐れだったものが、今日から使い倒せる強力な道具になりました。あとはやるだけです。">' +
      H('宝の持ち腐れ → 宝の使い倒しへ') +
      '<div class="slide-content"><div class="s-compare">' +
      '<div class="s-compare-col negative"><div class="s-compare-badge">今日の前</div>' +
      '<div class="s-compare-title">宝の持ち腐れ</div>' +
      '<ul class="s-compare-items"><li>呪文みたいで怖かった</li><li>どこに入力すればいいかわからなかった</li><li>使わないままだった</li></ul></div>' +
      '<div class="s-compare-col positive"><div class="s-compare-badge">今日の後</div>' +
      '<div class="s-compare-title">宝の使い倒し</div>' +
      '<ul class="s-compare-items"><li>コピペするだけでいい</li><li>対話思考で気軽に使える</li><li>今日から毎日使える！</li></ul></div>' +
      '</div></div></section>';
  }

  function slide90() {
    return '<section class="slide slide-quote" data-section="closing" data-title="名言" data-notes="最後にこの言葉を。百聞は一見に如かず。今日実際に触れたことが、どんな説明よりも価値があります。">' +
      '<div class="slide-content slide-content-center">' +
      '<blockquote class="s-quote">百聞は一見に如かず。<br>さあ、AIとおしゃべりしてみましょう！</blockquote>' +
      '</div></section>';
  }

  function slide91() {
    return '<section class="slide slide-metric" data-section="closing" data-title="コピペ1回で変わること" data-notes="コピペひとつの積み重ねが、半年後には大きな差になります。始めるなら今日。まずひとつ、やってみましょう。">' +
      '<div class="slide-content slide-content-center">' +
      '<p class="s-metric-lead">コピペひとつの積み重ねが</p>' +
      '<div class="s-metric-value">半年後<span style="font-size:0.3em">の</span>差</div>' +
      '<p class="s-metric-desc">始めた人と、始めなかった人の差は<br>半年で取り返せないほど広がる</p>' +
      '<p class="s-metric-source">AI活用実践者の実感</p>' +
      '</div></section>';
  }

  function slide92() {
    return '<section class="slide" data-section="closing" data-title="次のステップ" data-notes="今日の次のステップについてお伝えします。まず今日体験したことを明日も続けること。そして1ヶ月後にはプロンプトノートに10個以上のプロンプトが溜まっているはずです。その頃には自信を持ってAIを使いこなせるようになっています。">' +
      H('次のステップ') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">今日</div><div><div class="s-step-text">帰宅後に1回、今日のプロンプトを使ってみる</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">今週</div><div><div class="s-step-text">プロンプトノートを作り、毎日1つ保存する</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">来月</div><div><div class="s-step-text">プロンプトノートに10個以上が溜まり、スタッフ1人に展開できている</div></div></div>' +
      '</div></div></section>';
  }

  function slide93() {
    return '<section class="slide" data-section="closing" data-title="AI導入支援サービス" data-notes="有限会社アートソウルでは、今日学んだことをさらに深めたい方、自社に合ったプロンプトを一緒に作りたい方、スタッフへの展開を支援してほしい方向けに、個別のAI導入支援サービスを提供しています。">' +
      H('有限会社アートソウル — AI導入支援サービス') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">今日の内容をさらに深めたい方へ</li>' +
      '<li class="s-list-arrow">自社専用プロンプトライブラリの構築支援</li>' +
      '<li class="s-list-arrow">スタッフへのAI活用研修・ワークショップ</li>' +
      '<li class="s-list-arrow">業務フロー全体へのAI組み込み支援</li>' +
      '<li class="s-list-arrow">個別相談・伴走サポート</li>' +
      '<li class="s-list-head">→ 「一緒にやる」ことで確実に定着させます</li>' +
      '</ul></div></section>';
  }

  function slide94() {
    return '<section class="slide" data-section="closing" data-title="個別相談のご案内" data-notes="今日の参加者の方には、個別相談の機会を設けています。自分のビジネスにどう使えるか、もっと具体的に知りたい方はぜひご相談ください。お気軽にどうぞ。">' +
      H('個別相談のご案内') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">「自分のビジネスにどう使えばいい？」という方へ</li>' +
      '<li class="s-list-arrow">今日の参加者限定で個別相談を受け付けています</li>' +
      '<li class="s-list-arrow">業種・課題に合わせた具体的なプロンプトをご提案</li>' +
      '<li class="s-list-arrow">オンライン・訪問どちらにも対応</li>' +
      '<li class="s-list-head">→ セミナー後のアンケートにご記入ください</li>' +
      '</ul></div></section>';
  }

  function slide95() {
    return '<section class="slide" data-section="closing" data-title="今日の宿題" data-notes="今日の宿題を3つお伝えします。帰ったらすぐに今日体験したプロンプトをひとつ使ってみる、プロンプトノートを作る、そして一番困っている業務をAIに試してみる。この3つだけでOKです。">' +
      H('今日の宿題 — 3つのアクション') +
      '<div class="slide-content"><div class="s-steps">' +
      '<div class="s-step-row"><div class="s-step-num">宿題1</div><div><div class="s-step-text">帰ったらすぐに今日体験したプロンプトをひとつ実際に使ってみる</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">宿題2</div><div><div class="s-step-text">プロンプトノートを作り、今日使ったプロンプトを1つ保存する</div></div></div>' +
      '<div class="s-step-row"><div class="s-step-num">宿題3</div><div><div class="s-step-text">自分が一番困っている業務をAIに試してみる（失敗してもOK！）</div></div></div>' +
      '</div>' +
      '<ul class="s-list" style="margin-top:16px"><li class="s-list-callout">この3つだけ。完璧じゃなくていい。まず動くことが大事</li></ul>' +
      '</div></section>';
  }

  function slide96() {
    return '<section class="slide" data-section="closing" data-title="よくある質問" data-notes="最後によくある質問にお答えします。費用はかかりますか？無料版から始めてOKです。スマホでも使えますか？使えます。英語が必要ですか？日本語で大丈夫です。間違えたら怒られますか？怒られません。失敗してもリセットできます。">' +
      H('よくある質問') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-head">Q. 費用はかかりますか？</li>' +
      '<li class="s-list-sub">→ まず無料版で十分。慣れてから有料を検討すればOK</li>' +
      '<li class="s-list-head">Q. スマホでも使えますか？</li>' +
      '<li class="s-list-sub">→ 使えます。アプリをインストールすれば外出先でも活用可能</li>' +
      '<li class="s-list-head">Q. 英語が必要ですか？</li>' +
      '<li class="s-list-sub">→ 日本語で大丈夫です。今日のデモでも全部日本語でした</li>' +
      '<li class="s-list-head">Q. 間違えたら怒られますか？</li>' +
      '<li class="s-list-sub">→ 怒られません。失敗してもリセットできます。何度でも試せます</li>' +
      '</ul></div></section>';
  }

  function slide97() {
    return '<section class="slide" data-section="closing" data-title="参加者同士でシェア" data-notes="せっかくなので、今日学んで気づいたことをお隣の方と1分間シェアしてみましょう。自分の業種でどう使えそうか、一番試したいことは何かを話してみてください。">' +
      H('参加者同士でシェアしましょう') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">お隣の方と1分間、気づきをシェアしてください</li>' +
      '<li class="s-list-arrow">「自分の業種でどう使えそうか」</li>' +
      '<li class="s-list-arrow">「今日一番試してみたいことは何か」</li>' +
      '<li class="s-list-arrow">「どんなプロンプトを最初に作ってみたいか」</li>' +
      '<li class="s-list-head">→ 話すことで「やること」がより具体的になります</li>' +
      '</ul></div></section>';
  }

  function slide98() {
    return '<section class="slide" data-section="closing" data-title="連絡先・SNS" data-notes="今日のセミナーに関するご質問や、個別相談のご希望がある方はお気軽にご連絡ください。SNSでも情報発信していますので、フォローしていただけると嬉しいです。">' +
      H('有限会社アートソウル — 連絡先') +
      '<div class="slide-content"><ul class="s-list">' +
      '<li class="s-list-callout">今日の内容に関するご質問・ご相談はお気軽に</li>' +
      '<li class="s-list-arrow">担当：上村桂右（うえむら けいすけ）</li>' +
      '<li class="s-list-arrow">メール：uemura@artsoul.jp</li>' +
      '<li class="s-list-arrow">AI活用のヒント・事例を定期的に発信しています</li>' +
      '<li class="s-list-head">→ アンケートにご記入いただいた方に資料をお送りします</li>' +
      '</ul></div></section>';
  }

  function slide99() {
    return '<section class="slide slide-impact" data-section="closing" data-title="クロージング" data-notes="最後のメッセージです。百聞は一見に如かず。今日PCを開いて、実際に試したあなたはもう始まっています。続けることが唯一のコツです。">' +
      '<div class="slide-content slide-content-center">' +
      '<div class="s-impact-tag">KEEP GOING</div>' +
      '<p class="s-impact-main">続けることが、<br>唯一のコツ。</p>' +
      '</div></section>';
  }

  function slide100() {
    return '<section class="slide slide-cover" data-section="closing" data-title="ありがとうございました" data-notes="本日はご参加いただきありがとうございました。今日から少しずつAIを使い倒していきましょう。またお会いしましょう！">' +
      '<div class="slide-cover-bar"><div class="slide-cover-tag">有限会社アートソウル AI導入支援事業</div>' +
      '<h1 class="slide-cover-title">ありがとうございました！</h1></div>' +
      '<div class="slide-cover-body"><p class="slide-cover-sub">まずコピペひとつ。今日から始めましょう。</p>' +
      '<div class="slide-cover-meta">uemura@artsoul.jp ｜ 有限会社アートソウル</div></div></section>';
  }

  /* ===================== REGISTER ===================== */

  window.SLIDES = [
    slide01, slide02, slide03, slide04,
    slide05, slide06, slide07, slide08, slide09, slide10,
    slide11, slide12, slide13, slide14,
    slide15, slide16, slide17, slide18, slide19, slide20,
    slide21, slide22, slide23, slide24,
    slide25, slide26, slide27, slide28, slide29, slide30,
    slide31, slide32, slide33, slide34, slide35, slide36, slide37,
    slide38, slide39, slide40, slide41, slide42, slide43,
    slide44, slide45, slide46, slide47, slide48,
    slide49, slide50,
    slide51, slide52, slide53, slide54, slide55, slide56, slide57,
    slide58, slide59, slide60, slide61, slide62, slide63,
    slide64, slide65, slide66, slide67,
    slide68, slide69, slide70, slide71, slide72, slide73,
    slide74, slide75, slide76,
    slide77, slide78, slide79, slide80, slide81, slide82,
    slide83, slide84, slide85, slide86,
    slide87, slide88, slide89, slide90, slide91, slide92,
    slide93, slide94, slide95, slide96, slide97, slide98,
    slide99, slide100
  ];

})();
