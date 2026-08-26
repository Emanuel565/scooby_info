--
-- PostgreSQL database dump
--

\restrict kjGDJgKVa3LzUTOZq1dyKEFakfJdybfyMgzkSYjiFb2daViCj56c84TnPJNWbD7

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ItemEstoque; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ItemEstoque" (
    id integer NOT NULL,
    nome text NOT NULL,
    categoria text NOT NULL,
    condicao text DEFAULT 'NOVO'::text NOT NULL,
    quantidade integer DEFAULT 0 NOT NULL,
    estoque_minimo integer DEFAULT 2 NOT NULL,
    preco_custo double precision DEFAULT 0 NOT NULL,
    preco_venda double precision DEFAULT 0 NOT NULL,
    codigo_barras text,
    numero_serie text,
    garantia_meses integer DEFAULT 3 NOT NULL,
    detalhes_condicao text,
    localizacao text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ItemEstoque" OWNER TO postgres;

--
-- Name: ItemEstoque_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ItemEstoque_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ItemEstoque_id_seq" OWNER TO postgres;

--
-- Name: ItemEstoque_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ItemEstoque_id_seq" OWNED BY public."ItemEstoque".id;


--
-- Name: ItemVenda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ItemVenda" (
    id integer NOT NULL,
    venda_id integer NOT NULL,
    estoque_item_id integer,
    nome_produto text NOT NULL,
    condicao text DEFAULT 'NOVO'::text NOT NULL,
    numero_serie text,
    garantia_meses integer DEFAULT 3 NOT NULL,
    quantidade integer DEFAULT 1 NOT NULL,
    preco_custo double precision DEFAULT 0 NOT NULL,
    preco_unitario double precision DEFAULT 0 NOT NULL,
    subtotal double precision DEFAULT 0 NOT NULL,
    lucro_item double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public."ItemVenda" OWNER TO postgres;

--
-- Name: ItemVenda_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ItemVenda_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ItemVenda_id_seq" OWNER TO postgres;

--
-- Name: ItemVenda_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ItemVenda_id_seq" OWNED BY public."ItemVenda".id;


--
-- Name: LogHistorico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LogHistorico" (
    id integer NOT NULL,
    os_id integer NOT NULL,
    usuario_id integer,
    acao text NOT NULL,
    descricao text NOT NULL,
    status_anterior text,
    status_novo text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LogHistorico" OWNER TO postgres;

--
-- Name: LogHistorico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."LogHistorico_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."LogHistorico_id_seq" OWNER TO postgres;

--
-- Name: LogHistorico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."LogHistorico_id_seq" OWNED BY public."LogHistorico".id;


--
-- Name: MensagemChat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MensagemChat" (
    id integer NOT NULL,
    conteudo text NOT NULL,
    tipo text DEFAULT 'TEXTO'::text NOT NULL,
    audio_url text,
    audio_duracao integer,
    canal text DEFAULT 'GERAL'::text NOT NULL,
    remetente_id integer NOT NULL,
    destinatario_id integer,
    os_id integer,
    lida boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MensagemChat" OWNER TO postgres;

--
-- Name: MensagemChat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MensagemChat_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MensagemChat_id_seq" OWNER TO postgres;

--
-- Name: MensagemChat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MensagemChat_id_seq" OWNED BY public."MensagemChat".id;


--
-- Name: Notificacao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notificacao" (
    id integer NOT NULL,
    usuario_id integer,
    titulo text NOT NULL,
    mensagem text NOT NULL,
    tipo text DEFAULT 'INFO'::text NOT NULL,
    os_id integer,
    lida boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notificacao" OWNER TO postgres;

--
-- Name: Notificacao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Notificacao_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Notificacao_id_seq" OWNER TO postgres;

--
-- Name: Notificacao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notificacao_id_seq" OWNED BY public."Notificacao".id;


--
-- Name: OrdemServico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrdemServico" (
    id integer NOT NULL,
    codigo_os text NOT NULL,
    cliente_nome text NOT NULL,
    cliente_telefone text NOT NULL,
    cliente_whatsapp text,
    cliente_documento text,
    cliente_email text,
    tipo_equipamento text NOT NULL,
    marca_modelo text NOT NULL,
    numero_serie text,
    senha_aparelho text,
    acessorios_inclusos text,
    condicoes_visuais text,
    defeito_relatado text NOT NULL,
    laudo_tecnico text,
    pecas_utilizadas text DEFAULT '[]'::text,
    checklist_entrada text DEFAULT '{}'::text,
    checklist_saida text DEFAULT '{}'::text,
    fotos_equipamento text DEFAULT '[]'::text,
    orcamento_valor double precision DEFAULT 0 NOT NULL,
    valor_final double precision DEFAULT 0 NOT NULL,
    custo_pecas double precision DEFAULT 0 NOT NULL,
    lucro_liquido double precision DEFAULT 0 NOT NULL,
    orcamento_enviado_em timestamp(3) without time zone,
    orcamento_enviado_por_id integer,
    status text DEFAULT 'TRIAGEM'::text NOT NULL,
    prioridade text DEFAULT 'MEDIA'::text NOT NULL,
    prazo_entrega timestamp(3) without time zone,
    tempo_bancada_segundos integer DEFAULT 0 NOT NULL,
    tecnico_id integer,
    criado_por_id integer NOT NULL,
    concluido_por_id integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "concluidoEm" timestamp(3) without time zone,
    "entregueEm" timestamp(3) without time zone
);


ALTER TABLE public."OrdemServico" OWNER TO postgres;

--
-- Name: OrdemServico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrdemServico_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrdemServico_id_seq" OWNER TO postgres;

--
-- Name: OrdemServico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrdemServico_id_seq" OWNED BY public."OrdemServico".id;


--
-- Name: Usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Usuario" (
    id integer NOT NULL,
    nome text NOT NULL,
    login text NOT NULL,
    senha_hash text NOT NULL,
    cargo text NOT NULL,
    especialidades text DEFAULT '[]'::text NOT NULL,
    status text DEFAULT 'ONLINE'::text NOT NULL,
    avatar text,
    telefone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Usuario" OWNER TO postgres;

--
-- Name: Usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Usuario_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Usuario_id_seq" OWNER TO postgres;

--
-- Name: Usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Usuario_id_seq" OWNED BY public."Usuario".id;


--
-- Name: Venda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Venda" (
    id integer NOT NULL,
    codigo_venda text NOT NULL,
    cliente_nome text DEFAULT 'Cliente Balc├úo'::text,
    cliente_telefone text,
    cliente_documento text,
    forma_pagamento text DEFAULT 'DINHEIRO'::text NOT NULL,
    valor_total double precision DEFAULT 0 NOT NULL,
    custo_total double precision DEFAULT 0 NOT NULL,
    lucro_total double precision DEFAULT 0 NOT NULL,
    desconto double precision DEFAULT 0 NOT NULL,
    troco_para double precision,
    troco_devolvido double precision,
    observacao text,
    vendedor_id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Venda" OWNER TO postgres;

--
-- Name: Venda_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Venda_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Venda_id_seq" OWNER TO postgres;

--
-- Name: Venda_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Venda_id_seq" OWNED BY public."Venda".id;


--
-- Name: ItemEstoque id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemEstoque" ALTER COLUMN id SET DEFAULT nextval('public."ItemEstoque_id_seq"'::regclass);


--
-- Name: ItemVenda id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemVenda" ALTER COLUMN id SET DEFAULT nextval('public."ItemVenda_id_seq"'::regclass);


--
-- Name: LogHistorico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LogHistorico" ALTER COLUMN id SET DEFAULT nextval('public."LogHistorico_id_seq"'::regclass);


--
-- Name: MensagemChat id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MensagemChat" ALTER COLUMN id SET DEFAULT nextval('public."MensagemChat_id_seq"'::regclass);


--
-- Name: Notificacao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notificacao" ALTER COLUMN id SET DEFAULT nextval('public."Notificacao_id_seq"'::regclass);


--
-- Name: OrdemServico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdemServico" ALTER COLUMN id SET DEFAULT nextval('public."OrdemServico_id_seq"'::regclass);


--
-- Name: Usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Usuario" ALTER COLUMN id SET DEFAULT nextval('public."Usuario_id_seq"'::regclass);


--
-- Name: Venda id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Venda" ALTER COLUMN id SET DEFAULT nextval('public."Venda_id_seq"'::regclass);


--
-- Data for Name: ItemEstoque; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ItemEstoque" (id, nome, categoria, condicao, quantidade, estoque_minimo, preco_custo, preco_venda, codigo_barras, numero_serie, garantia_meses, detalhes_condicao, localizacao, "createdAt", "updatedAt") FROM stdin;
19	Impress├úo Preto & Branco (A4)	SERVICO_BALCAO	NOVO	99999	0	0.1	1	\N	\N	0	­ƒôä Xerox ou impress├úo monocrom├ítica por folha	\N	2026-08-26 13:55:16.046	2026-08-26 13:55:16.046
20	Impress├úo Colorida (A4 Gr├ífica)	SERVICO_BALCAO	NOVO	99999	0	0.35	2.5	\N	\N	0	­ƒÄ¿ Impress├úo de imagens ou texto colorido em alta resolu├º├úo	\N	2026-08-26 13:55:16.062	2026-08-26 13:55:16.062
21	Elabora├º├úo e Impress├úo de Curr├¡culo	SERVICO_BALCAO	NOVO	99999	0	0.5	20	\N	\N	0	­ƒôØ Digita├º├úo, formata├º├úo profissional e 2 vias impressas	\N	2026-08-26 13:55:16.064	2026-08-26 13:55:16.064
22	Montagem & Edi├º├úo de Fotos / Imagens	SERVICO_BALCAO	NOVO	99999	0	0	15	\N	\N	0	­ƒû╝´©Å Foto 3x4, restaura├º├úo, recorte, ajuste de imagem ou arte	\N	2026-08-26 13:55:16.067	2026-08-26 13:55:16.067
23	Digitaliza├º├úo / Scanner de Documentos	SERVICO_BALCAO	NOVO	99999	0	0	3	\N	\N	0	­ƒôé Escaneamento em PDF e envio por WhatsApp ou E-mail	\N	2026-08-26 13:55:16.069	2026-08-26 13:55:16.069
24	Aplica├º├úo de Pel├¡cula (M├úo de Obra)	SERVICO_BALCAO	NOVO	99999	0	0	10	\N	\N	0	­ƒøí´©Å Instala├º├úo profissional alinhada sem bolhas	\N	2026-08-26 13:55:16.071	2026-08-26 13:55:16.071
25	Backup de Arquivos em Pen Drive	SERVICO_BALCAO	NOVO	99999	0	0	20	\N	\N	0	­ƒÆ¥ C├│pia e organiza├º├úo de fotos, documentos e arquivos	\N	2026-08-26 13:55:16.073	2026-08-26 13:55:16.073
26	Limpeza & Desoxida├º├úo de Conector	SERVICO_BALCAO	NOVO	99999	0	0	35	\N	\N	0	­ƒº╣ Higieniza├º├úo de conector de carga e fones	\N	2026-08-26 13:55:16.075	2026-08-26 13:55:16.075
\.


--
-- Data for Name: ItemVenda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ItemVenda" (id, venda_id, estoque_item_id, nome_produto, condicao, numero_serie, garantia_meses, quantidade, preco_custo, preco_unitario, subtotal, lucro_item) FROM stdin;
\.


--
-- Data for Name: LogHistorico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LogHistorico" (id, os_id, usuario_id, acao, descricao, status_anterior, status_novo, "createdAt") FROM stdin;
\.


--
-- Data for Name: MensagemChat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MensagemChat" (id, conteudo, tipo, audio_url, audio_duracao, canal, remetente_id, destinatario_id, os_id, lida, "createdAt") FROM stdin;
\.


--
-- Data for Name: Notificacao; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notificacao" (id, usuario_id, titulo, mensagem, tipo, os_id, lida, "createdAt") FROM stdin;
\.


--
-- Data for Name: OrdemServico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrdemServico" (id, codigo_os, cliente_nome, cliente_telefone, cliente_whatsapp, cliente_documento, cliente_email, tipo_equipamento, marca_modelo, numero_serie, senha_aparelho, acessorios_inclusos, condicoes_visuais, defeito_relatado, laudo_tecnico, pecas_utilizadas, checklist_entrada, checklist_saida, fotos_equipamento, orcamento_valor, valor_final, custo_pecas, lucro_liquido, orcamento_enviado_em, orcamento_enviado_por_id, status, prioridade, prazo_entrega, tempo_bancada_segundos, tecnico_id, criado_por_id, concluido_por_id, "createdAt", "updatedAt", "concluidoEm", "entregueEm") FROM stdin;
\.


--
-- Data for Name: Usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Usuario" (id, nome, login, senha_hash, cargo, especialidades, status, avatar, telefone, "createdAt", "updatedAt") FROM stdin;
10	Donizete	donizete	$2b$10$PFQjdnrSL0aYLM3GWEC80.rAPQFnt.a9bOmVel9gOi62TYTKkb96m	ADMIN	["NOTEBOOK","SMARTPHONE","IMPRESSORA","PC_DESKTOP","CONSOLE","TABLET"]	ONLINE	\N	(41) 3565-2008	2026-08-23 18:28:17.279	2026-08-23 18:28:17.279
11	Juciane	juciane	$2b$10$PFQjdnrSL0aYLM3GWEC80.rAPQFnt.a9bOmVel9gOi62TYTKkb96m	ADMIN	["NOTEBOOK","SMARTPHONE","IMPRESSORA","PC_DESKTOP","CONSOLE","TABLET"]	ONLINE	\N	(41) 3565-2008	2026-08-23 18:28:17.282	2026-08-23 18:28:17.282
12	Emanuel Carvalho	emanuel	$2b$10$PFQjdnrSL0aYLM3GWEC80.rAPQFnt.a9bOmVel9gOi62TYTKkb96m	ADMIN	["NOTEBOOK","SMARTPHONE","IMPRESSORA","PC_DESKTOP","CONSOLE","TABLET","MACBOOK"]	ONLINE	\N	(41) 3565-2008	2026-08-23 18:28:17.284	2026-08-23 18:28:17.284
13	Guilherme	guilherme	$2b$10$PFQjdnrSL0aYLM3GWEC80.rAPQFnt.a9bOmVel9gOi62TYTKkb96m	ATENDENTE	[]	ONLINE	\N	(41) 3565-2008	2026-08-23 18:28:17.286	2026-08-23 18:30:40.467
\.


--
-- Data for Name: Venda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Venda" (id, codigo_venda, cliente_nome, cliente_telefone, cliente_documento, forma_pagamento, valor_total, custo_total, lucro_total, desconto, troco_para, troco_devolvido, observacao, vendedor_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: ItemEstoque_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ItemEstoque_id_seq"', 26, true);


--
-- Name: ItemVenda_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ItemVenda_id_seq"', 1, false);


--
-- Name: LogHistorico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."LogHistorico_id_seq"', 1, false);


--
-- Name: MensagemChat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MensagemChat_id_seq"', 1, false);


--
-- Name: Notificacao_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notificacao_id_seq"', 1, false);


--
-- Name: OrdemServico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrdemServico_id_seq"', 1, false);


--
-- Name: Usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Usuario_id_seq"', 13, true);


--
-- Name: Venda_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Venda_id_seq"', 1, false);


--
-- Name: ItemEstoque ItemEstoque_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemEstoque"
    ADD CONSTRAINT "ItemEstoque_pkey" PRIMARY KEY (id);


--
-- Name: ItemVenda ItemVenda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemVenda"
    ADD CONSTRAINT "ItemVenda_pkey" PRIMARY KEY (id);


--
-- Name: LogHistorico LogHistorico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LogHistorico"
    ADD CONSTRAINT "LogHistorico_pkey" PRIMARY KEY (id);


--
-- Name: MensagemChat MensagemChat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MensagemChat"
    ADD CONSTRAINT "MensagemChat_pkey" PRIMARY KEY (id);


--
-- Name: Notificacao Notificacao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notificacao"
    ADD CONSTRAINT "Notificacao_pkey" PRIMARY KEY (id);


--
-- Name: OrdemServico OrdemServico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdemServico"
    ADD CONSTRAINT "OrdemServico_pkey" PRIMARY KEY (id);


--
-- Name: Usuario Usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY (id);


--
-- Name: Venda Venda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Venda"
    ADD CONSTRAINT "Venda_pkey" PRIMARY KEY (id);


--
-- Name: ItemEstoque_categoria_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ItemEstoque_categoria_idx" ON public."ItemEstoque" USING btree (categoria);


--
-- Name: ItemEstoque_condicao_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ItemEstoque_condicao_idx" ON public."ItemEstoque" USING btree (condicao);


--
-- Name: ItemEstoque_nome_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ItemEstoque_nome_idx" ON public."ItemEstoque" USING btree (nome);


--
-- Name: ItemVenda_estoque_item_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ItemVenda_estoque_item_id_idx" ON public."ItemVenda" USING btree (estoque_item_id);


--
-- Name: ItemVenda_venda_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ItemVenda_venda_id_idx" ON public."ItemVenda" USING btree (venda_id);


--
-- Name: LogHistorico_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LogHistorico_createdAt_idx" ON public."LogHistorico" USING btree ("createdAt");


--
-- Name: LogHistorico_os_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LogHistorico_os_id_idx" ON public."LogHistorico" USING btree (os_id);


--
-- Name: MensagemChat_canal_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MensagemChat_canal_idx" ON public."MensagemChat" USING btree (canal);


--
-- Name: MensagemChat_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MensagemChat_createdAt_idx" ON public."MensagemChat" USING btree ("createdAt");


--
-- Name: MensagemChat_destinatario_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MensagemChat_destinatario_id_idx" ON public."MensagemChat" USING btree (destinatario_id);


--
-- Name: MensagemChat_remetente_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MensagemChat_remetente_id_idx" ON public."MensagemChat" USING btree (remetente_id);


--
-- Name: Notificacao_usuario_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notificacao_usuario_id_idx" ON public."Notificacao" USING btree (usuario_id);


--
-- Name: OrdemServico_cliente_nome_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdemServico_cliente_nome_idx" ON public."OrdemServico" USING btree (cliente_nome);


--
-- Name: OrdemServico_codigo_os_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "OrdemServico_codigo_os_key" ON public."OrdemServico" USING btree (codigo_os);


--
-- Name: OrdemServico_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdemServico_createdAt_idx" ON public."OrdemServico" USING btree ("createdAt");


--
-- Name: OrdemServico_criado_por_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdemServico_criado_por_id_idx" ON public."OrdemServico" USING btree (criado_por_id);


--
-- Name: OrdemServico_prazo_entrega_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdemServico_prazo_entrega_idx" ON public."OrdemServico" USING btree (prazo_entrega);


--
-- Name: OrdemServico_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdemServico_status_idx" ON public."OrdemServico" USING btree (status);


--
-- Name: OrdemServico_tecnico_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrdemServico_tecnico_id_idx" ON public."OrdemServico" USING btree (tecnico_id);


--
-- Name: Usuario_login_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Usuario_login_key" ON public."Usuario" USING btree (login);


--
-- Name: Venda_codigo_venda_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Venda_codigo_venda_key" ON public."Venda" USING btree (codigo_venda);


--
-- Name: Venda_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Venda_createdAt_idx" ON public."Venda" USING btree ("createdAt");


--
-- Name: Venda_forma_pagamento_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Venda_forma_pagamento_idx" ON public."Venda" USING btree (forma_pagamento);


--
-- Name: Venda_vendedor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Venda_vendedor_id_idx" ON public."Venda" USING btree (vendedor_id);


--
-- Name: ItemVenda ItemVenda_estoque_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemVenda"
    ADD CONSTRAINT "ItemVenda_estoque_item_id_fkey" FOREIGN KEY (estoque_item_id) REFERENCES public."ItemEstoque"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ItemVenda ItemVenda_venda_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ItemVenda"
    ADD CONSTRAINT "ItemVenda_venda_id_fkey" FOREIGN KEY (venda_id) REFERENCES public."Venda"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LogHistorico LogHistorico_os_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LogHistorico"
    ADD CONSTRAINT "LogHistorico_os_id_fkey" FOREIGN KEY (os_id) REFERENCES public."OrdemServico"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LogHistorico LogHistorico_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LogHistorico"
    ADD CONSTRAINT "LogHistorico_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MensagemChat MensagemChat_destinatario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MensagemChat"
    ADD CONSTRAINT "MensagemChat_destinatario_id_fkey" FOREIGN KEY (destinatario_id) REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MensagemChat MensagemChat_os_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MensagemChat"
    ADD CONSTRAINT "MensagemChat_os_id_fkey" FOREIGN KEY (os_id) REFERENCES public."OrdemServico"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MensagemChat MensagemChat_remetente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MensagemChat"
    ADD CONSTRAINT "MensagemChat_remetente_id_fkey" FOREIGN KEY (remetente_id) REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notificacao Notificacao_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notificacao"
    ADD CONSTRAINT "Notificacao_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrdemServico OrdemServico_concluido_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdemServico"
    ADD CONSTRAINT "OrdemServico_concluido_por_id_fkey" FOREIGN KEY (concluido_por_id) REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrdemServico OrdemServico_criado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdemServico"
    ADD CONSTRAINT "OrdemServico_criado_por_id_fkey" FOREIGN KEY (criado_por_id) REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrdemServico OrdemServico_orcamento_enviado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdemServico"
    ADD CONSTRAINT "OrdemServico_orcamento_enviado_por_id_fkey" FOREIGN KEY (orcamento_enviado_por_id) REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrdemServico OrdemServico_tecnico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrdemServico"
    ADD CONSTRAINT "OrdemServico_tecnico_id_fkey" FOREIGN KEY (tecnico_id) REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Venda Venda_vendedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Venda"
    ADD CONSTRAINT "Venda_vendedor_id_fkey" FOREIGN KEY (vendedor_id) REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict kjGDJgKVa3LzUTOZq1dyKEFakfJdybfyMgzkSYjiFb2daViCj56c84TnPJNWbD7

