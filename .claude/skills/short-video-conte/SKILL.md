---
name: short-video-conte
description: このスキルは以下の場合に使用する。ユーザーが「/short-video-conte」と入力したとき。「ショート動画の型を抽出」「ショート動画パターン」「リール台本」「縦動画コンテ」「TikTok台本」「Shorts台本」「Reels台本」「動画のコンテプロット」「動画から型を抽出」「動画台本を作りたい」「同じ型で別動画を作りたい」「extract」「browse」「apply <パターン名>」などのショート動画設計・型化・量産に関する発言があったとき。
version: 1.0.0
---

# short-video-conte スキル

**完全な実行手順は `rules/skills/short-video-conte.md` を Read して従う。**

このファイルは Claude Code スキルとして登録するためのエントリーポイント。実体は上記ファイルにある。

## スキルの概要

ショート動画（60〜180秒・縦型）の文字起こし・画像から「コンテのDNA（構造・比率・設計）」を抽出・命名・ライブラリ化し、任意のテーマ・ターゲットで同じ型のショート動画コンテプロットを再現できるパターンライブラリを構築する。

## 3つのモード

| モード | 呼び出し方 | 用途 |
|--------|-----------|------|
| `browse` | `/short-video-conte`（引数なし）または「パターン一覧」「どんな型がある」等 | 蓄積パターンを一覧表示し推薦 |
| `extract` | `/short-video-conte extract <動画パス>` または動画を渡したとき | 動画からDNAを抽出して命名・保存 |
| `apply` | `/short-video-conte apply <パターン名>` または「〇〇型で台本を作って」等 | 保存パターンで新コンテプロットを生成 |

## 実行手順

1. `rules/skills/short-video-conte.md` を Read する
2. ユーザーの発言からモード（browse / extract / apply）を判定する
3. 該当モードの STEP に従って実行する
