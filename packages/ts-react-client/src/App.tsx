// Reactから必要な関数や型をインポートする
// useState: コンポーネントの状態（state）を管理するためのフック
// useEffect: レンダリング後などの副作用（API通信など）を実行するためのフック
// FormEvent: フォームイベント（送信時など）の型
import { useState, useEffect, type FormEvent } from 'react';
// CSSファイルをインポートしてスタイルを適用する
import './App.css';

// TypeScriptの「インターフェース」を使って、Messageオブジェクトの型を定義
// これにより、messageオブジェクトが必ずidとcontentを持つことを保証できる
interface Message {
  id: number;
  content: string;
}

// Rails APIのURLを定数として定義。後で変更しやすくなる
const RAILS_API_URL = 'http://localhost:3000/messages';

// Appコンポーネント本体。Reactの関数コンポーネントは、JSX（HTMLのような記法）を返す関数
function App() {
  // useStateを使って、コンポーネントの状態（state）を宣言
  // messages: メッセージのリストを保持するstate。初期値は空の配列[]
  // setMessages: messagesを更新するための関数
  const [messages, setMessages] = useState<Message[]>([]);
  // newMessage: テキスト入力欄の値を保持するstate。初期値は空文字列''
  // setNewMessage: newMessageを更新するための関数
  const [newMessage, setNewMessage] = useState('');
  // error: エラーメッセージを保持するstate。初期値は空文字列''
  const [error, setError] = useState('');

  // Rails APIからメッセージ一覧を取得する非同期関数
  const fetchMessages = async () => {
    try { // try-catch構文で、API通信中のエラーを捕捉する
      // fetch APIを使ってRails APIにGETリクエストを送信
      const response = await fetch(RAILS_API_URL);
      // レスポンスが正常（200番台）でない場合はエラーを投げる
      if (!response.ok) throw new Error('サーバーとの通信に失敗しました');
      // レスポンスのJSONボディをパースしてJavaScriptのオブジェクト配列に変換
      const data: Message[] = await response.json();
      // 取得したデータでmessages stateを更新 -> 画面が再描画される
      setMessages(data);
    } catch (err) {
      // エラーが発生した場合、error stateにエラーメッセージを設定
      setError(err instanceof Error ? err.message : '不明なエラーです');
    }
  };

  // useEffectフック: 特定のタイミングで副作用（API通信など）を実行する
  // 第二引数の配列[]が空なので、この副作用はコンポーネントが最初にマウント（描画）された時に一度だけ実行される
  useEffect(() => {
    // 最初にメッセージ一覧を読み込む
    fetchMessages();
  }, []);

  // フォームが送信されたときに実行される関数
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // フォーム送信時のデフォルトのページリロードを防ぐ
    if (!newMessage.trim()) return; // 入力欄が空かスペースのみの場合は何もしない

    try {
      // fetch APIを使ってRails APIにPOSTリクエストを送信
      const response = await fetch(RAILS_API_URL, {
        method: 'POST', // HTTPメソッド
        headers: { 'Content-Type': 'application/json' }, // ヘッダーでJSON形式であることを伝える
        body: JSON.stringify({ message: newMessage }), // 送信するデータをJSON文字列に変換
      });
      if (!response.ok) throw new Error('メッセージの投稿に失敗しました');
      
      setNewMessage(''); // 投稿成功後、入力欄をクリアする
      fetchMessages();   // 一覧を再取得して画面を更新する
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーです');
    }
  };

  // このコンポーネントが画面に描画するJSX（HTMLのようなもの）
  return (
    <div className="App">
      <header>
        <h1>一言メッセージアプリ</h1>
      </header>
      <main>
        {/* onSubmitイベントにhandleSubmit関数を紐付け */}
        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            value={newMessage} // inputの値をnewMessage stateと同期
            onChange={(e) => setNewMessage(e.target.value)} // 入力があるたびにnewMessageを更新
            placeholder="メッセージを入力..."
          />
          <button type="submit">投稿</button>
        </form>

        {/* error stateに値がある場合のみ、エラーメッセージを表示 */}
        {error && <p className="error-message">{error}</p>}

        <div className="message-list">
          {/* messages stateの配列をmap関数でループ処理し、各メッセージ要素をdivで描画 */}
          {messages.map((msg) => (
            <div key={msg.id} className="message-item">
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// 他のファイルからこのAppコンポーネントをインポートできるようにする
export default App;