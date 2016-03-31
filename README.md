需要安装:
brew install imagemagick
brew install graphicsmagick

#测试post        是否进行缩略图压缩                本地文件路径                       服务器
curl -H "Expect:" -F "thumb=true" -F "data=@/Users/chenjianjun/Desktop/22.png" http://127.0.0.1:8888/
