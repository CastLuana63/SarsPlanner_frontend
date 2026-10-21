# SHOWPLANNER25 -> SARSPLANNER
Uma refatoração teste da interface showplanner em Django para React+TypeScript
Um estudo visando usuabilidade do usuário e organização visual.


## Pré config
npm create vite@latest frontend-app -- --template react-ts

# 1. Acesse a pasta da aplicação React dentro do repositório
cd sars-planner

# 2. Instale o Tailwind CSS (plugin oficial Vite), React Router DOM e Lucide Icons
npm install tailwindcss @tailwindcss/vite react-router-dom lucide-react

# 3. Instale a tipagem do Node para uso de Path Alias (@/) no vite.config.ts
npm install -D @types/node

# 4. Remova o arquivo CSS padrão do template do Vite que não será utilizado
rm -f src/App.css

# 5. Crie toda a estrutura de diretórios do projeto e a pasta docs/
mkdir -p docs \
  src/components/ui \
  src/components/layout \
  src/contexts \
  src/mocks \
  src/pages/Login \
  src/pages/Inicio \
  src/pages/EmDesenvolvimento \
  src/routes \
  src/types
  