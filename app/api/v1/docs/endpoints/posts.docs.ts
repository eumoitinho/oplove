/**
 * Documentação dos endpoints: Posts
 */

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     tags: [Posts]
 *     summary: Listar posts do feed
 *     description: Retorna lista paginada de posts baseado no usuário e seus filtros
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Quantidade de posts por página
 *       - in: query
 *         name: feed_type
 *         schema:
 *           type: string
 *           enum: [for-you, following, explore]
 *           default: for-you
 *         description: Tipo de feed a buscar
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /api/v1/posts/create:
 *   post:
 *     tags: [Posts]
 *     summary: Criar novo post
 *     description: |
 *       Cria um novo post no feed do usuário.
 *       
 *       **Restrições por plano:**
 *       - Free: Apenas texto, sem mídia
 *       - Gold: Até 5 imagens por post
 *       - Diamond: Imagens e vídeos ilimitados
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Conteúdo do post
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Arquivos de mídia (imagens/vídeos)
 *               visibility:
 *                 type: string
 *                 enum: [public, followers, private]
 *                 default: public
 *               is_paid:
 *                 type: boolean
 *                 default: false
 *                 description: Se o conteúdo é pago (Diamond+)
 *               price:
 *                 type: number
 *                 minimum: 5
 *                 description: Preço em R$ se is_paid=true
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *                 message:
 *                   type: string
 *                   example: Post criado com sucesso
 *       400:
 *         description: Dados inválidos ou limite de mídia excedido
 *       403:
 *         description: Plano não permite esta ação
 */

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Obter post específico
 *     description: Retorna detalhes completos de um post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do post
 *     responses:
 *       200:
 *         description: Detalhes do post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post não encontrado
 *   delete:
 *     tags: [Posts]
 *     summary: Deletar post
 *     description: Remove um post (apenas o autor pode deletar)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Post deletado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Post não encontrado
 */

/**
 * @swagger
 * /api/v1/posts/{id}/like:
 *   post:
 *     tags: [Posts]
 *     summary: Curtir/descurtir post
 *     description: Alterna o status de curtida em um post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status de curtida alterado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                 likes_count:
 *                   type: integer
 */

/**
 * @swagger
 * /api/v1/posts/{id}/comments:
 *   get:
 *     tags: [Posts]
 *     summary: Listar comentários
 *     description: Retorna comentários paginados de um post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de comentários
 *   post:
 *     tags: [Posts]
 *     summary: Adicionar comentário
 *     description: Adiciona um novo comentário ao post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Comentário criado
 *       400:
 *         description: Dados inválidos
 */

export {};