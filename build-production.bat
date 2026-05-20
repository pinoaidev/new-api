@echo off
setlocal

REM 提示用户输入版本号，若直接回车则 version 为空
set /p version="Please enter version number (default: 1.0.1): "

REM 如果用户输入的版本为空，默认设置为 1.0.1
if "%version%"=="" (
    set version=1.0.1
)

echo.
echo ==========================================
echo Using version: %version%
echo ==========================================
echo.

REM --- 第一步：设置基础镜像路径变量，方便维护
set REGISTRY=crpi-aopy9qmuf8c7w71s.cn-shenzhen.personal.cr.aliyuncs.com/pino_ai
REM 设置 tar 包保存目录（当前脚本所在目录下的 docker_images 文件夹）

REM --- 第二步：build并保存 pino-ai-new-api 镜像 ---
echo [2/3] Building and saving pino-ai-new-api image...
docker build -t %REGISTRY%/pino-ai-new-api:%version% -f Dockerfile .
if %errorlevel% neq 0 goto :error

REM --- 第三步：推送镜像
docker push %REGISTRY%/pino-ai-new-api:%version%
if %errorlevel% neq 0 goto :error

echo pino-ai-new-api image built
echo.



echo ==========================================
echo 所有镜像已成功构建并推送到仓库!
echo Version: %version%
echo 脚本将在 3 秒后自动关闭...
echo ==========================================
:: 成功路径：等待 3 秒自动退出，不使用 pause
timeout /t 3 >nul
exit 0

:error
echo.
echo ==========================================
echo !!!!!!!! 发生错误，请检查上方输出详情 !!!!!!!!
echo ==========================================
:: 错误路径：必须按键才关闭，方便查看日志
pause
exit 1