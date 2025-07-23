// main パッケージであることを宣言。Goでは実行可能なプログラムは main パッケージに属する
package main

import (
	// encoding/json: JSONデータのエンコード（Goのデータ構造 -> JSON文字列）とデコード（JSON文字列 -> Goのデータ構造）を行うためのパッケージ
	"encoding/json"
	// fmt: 書式付きで文字列や数値を出力するためのパッケージ
	"fmt"
	// log: ログを出力するためのパッケージ。Fatal関数はログ出力後にプログラムを終了させる
	"log"
	// net/http: HTTPクライアントとサーバーの実装を提供するためのパッケージ
	"net/http"
	// time: 時間を扱うためのパッケージ
	"time"
)

// RequestPayload は、フロントエンド(Rails)から受け取るJSONデータの構造を定義する
// `json:"message"` の部分は「構造体タグ」といい、JSONのキー名とGoのフィールド名を対応付ける
type RequestPayload struct {
	Message string `json:"message"`
}

// ResponsePayload は、フロントエンド(Rails)へ返すJSONデータの構造を定義する
type ResponsePayload struct {
	ProcessedMessage string `json:"processed_message"`
}

// processMessageHandler は、HTTPリクエストを処理する関数（ハンドラ）
// http.ResponseWriter はレスポンスを書き込むためのもの、*http.Request は受信したリクエストの情報を持つ
func processMessageHandler(w http.ResponseWriter, r *http.Request) {
	// r.Method でリクエストのHTTPメソッド（GET, POSTなど）を取得し、POSTでなければエラーを返す
	if r.Method != http.MethodPost {
		// http.Error は、指定したステータスコードとエラーメッセージをクライアントに簡単に返すための便利な関数
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed) // 405 Method Not Allowed
		return // この関数から抜ける
	}

	// リクエストボディのJSONをGoのデータ構造（RequestPayload）に変換（デコード）するための準備
	var reqPayload RequestPayload
	// json.NewDecoder(r.Body)でリクエストボディを読むデコーダを作成し、.Decode(&reqPayload)でデコードを実行
	// &reqPayload のようにポインタを渡すことで、Decode関数がreqPayloadの中身を直接書き換えられる
	if err := json.NewDecoder(r.Body).Decode(&reqPayload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest) // 400 Bad Request
		return
	}

	// fmt.Sprintf は、書式指定子（%sなど）を使ってフォーマットされた文字列を生成する
	processedMsg := fmt.Sprintf(
		"[Goで処理済み] %s (%s)",                   // これがフォーマットのテンプレート
		reqPayload.Message,                      // 1つ目の %s に入る値
		time.Now().Format("2006-01-02 15:04:05"), // 2つ目の %s に入る値 (Goではこの特定の日時がフォーマットの基準)
	)

	// レスポンスとして返すためのGoのデータ構造（ResponsePayload）を作成
	resPayload := ResponsePayload{
		ProcessedMessage: processedMsg,
	}

	// w.Header().Set でレスポンスヘッダを設定。これがないとクライアントはただのテキストとして解釈してしまう
	w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w)でレスポンスを書き込むためのエンコーダを作成し、.Encode(resPayload)でGoのデータ構造をJSONに変換して書き出す
	json.NewEncoder(w).Encode(resPayload)
}

// main関数は、プログラムが実行されたときに最初に呼び出される特別な関数
func main() {
	// http.HandleFunc は、特定のエンドポイント（URLパス）とそれを処理する関数（ハンドラ）を紐付ける
	// 今回は "/process" というパスへのリクエストを processMessageHandler 関数が処理するように設定
	http.HandleFunc("/process", processMessageHandler)

	// サーバーがどのポートで待ち受けているかをターミナルに表示
	fmt.Println("Go service listening on :8081...")

	// http.ListenAndServe でWebサーバーを起動する
	// 第一引数でポート番号を指定（例: ":8081"）。第二引数は通常nilで、上で設定したハンドラを使うことを意味する
	// サーバー起動中にエラーが発生した場合（例: ポートが使用中）、log.Fatalがエラーを記録してプログラムを終了させる
	log.Fatal(http.ListenAndServe(":8081", nil))
}