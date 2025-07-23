# class MessagesController < ApplicationController
#   before_action :set_message, only: %i[ show update destroy ]

#   # GET /messages
#   def index
#     @messages = Message.all

#     render json: @messages
#   end

#   # GET /messages/1
#   def show
#     render json: @message
#   end

#   # POST /messages
#   def create
#     @message = Message.new(message_params)

#     if @message.save
#       render json: @message, status: :created, location: @message
#     else
#       render json: @message.errors, status: :unprocessable_entity
#     end
#   end

#   # PATCH/PUT /messages/1
#   def update
#     if @message.update(message_params)
#       render json: @message
#     else
#       render json: @message.errors, status: :unprocessable_entity
#     end
#   end

#   # DELETE /messages/1
#   def destroy
#     @message.destroy!
#   end

#   private
#     # Use callbacks to share common setup or constraints between actions.
#     def set_message
#       @message = Message.find(params.expect(:id))
#     end

#     # Only allow a list of trusted parameters through.
#     def message_params
#       params.expect(message: [ :content ])
#     end
# end

# Rubyの標準ライブラリを読み込む
require 'net/http' # HTTP通信を行うためのライブラリ
require 'uri'      # URLやURIを扱うためのライブラリ
require 'json'     # JSONデータをパース（解析）したり生成したりするためのライブラリ

# MessagesControllerは、ApplicationControllerを継承して作られるクラス
# scaffoldで自動生成され、Messageモデルに関するリクエストを処理する
class MessagesController < ApplicationController

  # GET /messages のリクエストに対応するアクション
  def index
    # Messageモデル(DBのmessagesテーブル)から全てのレコードを取得し、作成日時の降順（新しいものが先）に並び替える
    @messages = Message.order(created_at: :desc)
    # 取得したデータをJSON形式でクライアント（フロントエンド）に返す
    # Railsは@messagesのようなオブジェクトを自動的にJSONに変換してくれる
    render json: @messages
  end

  # POST /messages のリクエストに対応するアクション
  def create
    # フロントエンドから送られてきたJSONの `message` キーの値を取得する
    original_message = params[:message]

    # --- ここからGoサービス呼び出し処理 ---
    # 呼び出すGoサーバーのURIをパースしてオブジェクトを生成
    uri = URI.parse('http://localhost:8081/process')
    # HTTPセッションを開始するためのオブジェクトを生成
    http = Net::HTTP.new(uri.host, uri.port)
    # POSTリクエストを作成。パスとヘッダー（データ形式がJSONであることを伝える）を指定
    request = Net::HTTP::Post.new(uri.path, {'Content-Type' => 'application/json'})
    # リクエストのボディ（本体）に、Goサーバーへ送るJSONデータをセット
    # Rubyのハッシュを.to_jsonメソッドでJSON文字列に変換している
    request.body = {message: original_message}.to_json

    # 実際にHTTPリクエストを送信し、レスポンスを受け取る
    response = http.request(request)
    # --- Goサービス呼び出し処理ここまで ---

    # Goサーバーから返ってきたJSON文字列のレスポンスボディを、Rubyのハッシュに変換（パース）
    processed_data = JSON.parse(response.body)
    # パースしたデータから 'processed_message' キーの値（Goで加工された文字列）を取り出す
    processed_message = processed_data['processed_message']

    # Messageモデルの新しいインスタンスを作成。contentカラムにGoから受け取った文字列をセット
    @message = Message.new(content: processed_message)

    # @message.save を試みて、データベースへの保存を試みる
    if @message.save
      # 保存が成功した場合
      # 作成されたメッセージデータをJSONとしてクライアントに返す。
      # HTTPステータスは 201 Created（作成成功）とする
      render json: @message, status: :created, location: @message
    else
      # 保存が失敗した場合（バリデーションエラーなど）
      # エラー内容をJSONとしてクライアントに返す
      # HTTPステータスは 422 Unprocessable Entity（処理できないエンティティ）とする
      render json: @message.errors, status: :unprocessable_entity
    end
  end
end