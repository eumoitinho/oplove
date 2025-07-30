@echo off
echo 🚀 Criando produtos na Stripe...
echo.

REM Lê a chave do .env.local
for /f "tokens=2 delims==" %%a in ('findstr "STRIPE_SECRET_KEY=" .env.local') do set STRIPE_KEY=%%a

echo 🔑 Usando chave Stripe...
echo.

echo 📦 Criando produto Gold...
curl -s https://api.stripe.com/v1/products ^
  -u "%STRIPE_KEY%:" ^
  -d "name=OpenLove Gold" ^
  -d "description=Plano Gold - Recursos premium básicos" > gold_product.json

echo 📦 Criando produto Diamond...  
curl -s https://api.stripe.com/v1/products ^
  -u "%STRIPE_KEY%:" ^
  -d "name=OpenLove Diamond" ^
  -d "description=Plano Diamond - Recursos premium completos" > diamond_product.json

echo 📦 Criando produto Dupla Hot...
curl -s https://api.stripe.com/v1/products ^
  -u "%STRIPE_KEY%:" ^
  -d "name=OpenLove Dupla Hot" ^
  -d "description=Plano Dupla Hot - Para duas contas" > couple_product.json

echo.
echo ✅ Produtos criados! Verifique os arquivos JSON gerados.
echo 💡 Agora você precisa extrair os IDs dos produtos e criar os preços.
echo.
pause