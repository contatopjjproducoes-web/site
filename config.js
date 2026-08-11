/*
  PJJ PRODUÇÕES — CONFIGURAÇÕES RÁPIDAS
  Este é o arquivo pensado para alterações frequentes.

  ATENÇÃO SOBRE A SENHA:
  GitHub Pages é um site estático. Qualquer senha escrita neste arquivo pode ser
  encontrada por alguém com conhecimento técnico. Ela serve apenas como uma
  barreira simples para não deixar o painel aberto por acidente.
*/
window.PJJ_CONFIG = {
  company: {
    name: "PJJ Produções",
    instagram: "https://www.instagram.com/pjj.producoes/",
    whatsapp: "5519971249232",
    whatsappMessage: "Olá! Encontrei a PJJ Produções pelo site e gostaria de solicitar um orçamento.",
    email: "contato.pjjproducoes@gmail.com",
    location: "São João da Boa Vista - SP",
    cnpj: "67.652.786/0001-00"
  },

  panel: {
    password: "ALTERE-ESTA-SENHA"
  },

  analytics: {
    enabled: false,

    /*
      Para ativar métricas:
      1. Crie um projeto no Supabase.
      2. Rode o arquivo supabase-analytics.sql no SQL Editor.
      3. Cole abaixo a Project URL e a anon public key.
      4. Mude enabled para true.

      O site registra apenas eventos anônimos simples. Não coleta nome, e-mail,
      telefone ou endereço IP por conta própria.
    */
    supabaseUrl: "",
    supabaseAnonKey: ""
  }
};
