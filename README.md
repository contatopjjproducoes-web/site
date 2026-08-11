# PJJ Produções — Site PRO

Esta versão mantém o site público e acrescenta um painel administrativo estático.

## Arquivos principais

- `index.html` — site público
- `style.css` — visual do site
- `script.js` — interações do site
- `config.js` — dados alterados com frequência
- `content.js` — textos e portfólio
- `analytics.js` — registro opcional de visitas/interações
- `assets/portfolio/` — fotos do portfólio
- `painel/` — painel administrativo
- `supabase-analytics.sql` — banco opcional para métricas

## Configurações frequentes

Edite `config.js`.

Ali ficam:
- Instagram
- WhatsApp
- mensagem automática
- e-mail
- localização
- CNPJ
- senha simples do painel
- configuração de analytics

## Senha do painel

A senha inicial é:

`ALTERE-ESTA-SENHA`

Troque em `config.js` antes de publicar.

### Limitação importante

Como GitHub Pages é hospedagem estática, essa senha é uma barreira visual,
não segurança real. O arquivo `config.js` é público e um usuário técnico pode
inspecionar ou contornar o bloqueio.

Para um painel realmente privado, será necessário autenticação externa
(Supabase Auth, Cloudflare Access ou similar).

## Painel

Depois de publicar:

`/painel/`

Exemplo:

`https://SEU-USUARIO.github.io/site/painel/`

O painel permite:
- editar dados frequentes;
- trocar a senha simples;
- adicionar/remover/reordenar projetos;
- adicionar fotos;
- comprimir fotos automaticamente;
- gerar ZIP de atualização;
- visualizar visitas e cliques quando analytics estiver configurado.

## Fotos separadas

As fotos não ficam mais embutidas em JavaScript.

Elas são exportadas para:

`assets/portfolio/`

O `content.js` guarda apenas o caminho da imagem.

## Analytics

GitHub Pages sozinho não consegue persistir contadores.

Esta versão tem integração opcional com Supabase.

1. Crie um projeto Supabase.
2. Abra SQL Editor.
3. Execute `supabase-analytics.sql`.
4. Copie Project URL e anon public key.
5. Preencha `config.js`:
   - `analytics.enabled: true`
   - `supabaseUrl`
   - `supabaseAnonKey`

Eventos registrados:
- `page_view`
- `whatsapp_click`
- `instagram_click`
- `email_click`
- `portfolio_open`

Não há coleta explícita de nome, telefone, e-mail ou IP pelo código do site.

### Privacidade das métricas

O SQL incluído permite leitura das métricas com a chave pública para que o painel
estático consiga exibir os números. Portanto os dados agregados não devem ser
tratados como informação secreta.

## Publicar atualizações pelo painel

No painel, abra **Publicar** e clique em:

`Baixar pacote de atualização`

O ZIP terá:
- `config.js`
- `content.js`
- novas fotos em `assets/portfolio/`

Extraia o ZIP e substitua esses arquivos no GitHub.

## Celular

O site público e o painel possuem layout responsivo para celulares.


## Formulário de contato

O site usa FormSubmit para encaminhar mensagens para o e-mail configurado em `config.js`.

E-mail inicial:
`contato.pjjproducoes@gmail.com`

Na primeira tentativa de envio, o FormSubmit envia uma mensagem de confirmação para esse e-mail.
É necessário confirmar uma vez para o formulário começar a encaminhar normalmente.

O visitante preenche e envia dentro do próprio site; o JavaScript usa o endpoint AJAX do FormSubmit.

## Imagem principal

A imagem grande do topo agora pode ser alterada em:

`Painel > Conteúdo > Imagem principal`

Ela é exportada para:
`assets/site/hero.jpg`

Se nenhuma imagem estiver configurada, o site mostra a composição tipográfica PJJ.
