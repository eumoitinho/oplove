/**
 * Documentação dos endpoints: Verification
 */

/**
 * @swagger
 * /api/v1/verification/status:
 *   get:
 *     tags: [Verification]
 *     summary: Status da verificação
 *     description: Retorna o status atual da verificação de identidade do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status da verificação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 is_verified:
 *                   type: boolean
 *                 verification:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, rejected, manual_review]
 *                     submitted_at:
 *                       type: string
 *                       format: date-time
 *                     reviewed_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     rejection_reason:
 *                       type: string
 *                       nullable: true
 *                     verification_score:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                 can_submit:
 *                   type: boolean
 *                   description: Se pode enviar nova verificação
 *                 cooldown_ends_at:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   description: Quando pode tentar novamente (após rejeição)
 */

/**
 * @swagger
 * /api/v1/verification/submit:
 *   post:
 *     tags: [Verification]
 *     summary: Enviar verificação
 *     description: |
 *       Submete documentos e dados para verificação de identidade.
 *       
 *       **Processo de verificação:**
 *       1. Upload de documento (RG, CNH ou Passaporte)
 *       2. Selfie com documento
 *       3. Detecção de vida (liveness)
 *       4. Análise automática em 48h
 *       
 *       **Benefícios da verificação:**
 *       - Badge azul de verificado
 *       - Limites aumentados (mensagens, stories)
 *       - Menor comissão em vendas
 *       - Prioridade no suporte
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - cpf
 *               - birth_date
 *               - document_type
 *               - document_number
 *               - document_front
 *               - selfie_photo
 *               - face_scan_data
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Nome completo como no documento
 *               cpf:
 *                 type: string
 *                 pattern: ^\d{11}$
 *                 description: CPF sem pontuação
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento
 *               document_type:
 *                 type: string
 *                 enum: [rg, cnh, passport]
 *               document_number:
 *                 type: string
 *                 description: Número do documento
 *               document_front:
 *                 type: string
 *                 format: binary
 *                 description: Foto da frente do documento
 *               document_back:
 *                 type: string
 *                 format: binary
 *                 description: Foto do verso (se aplicável)
 *               selfie_photo:
 *                 type: string
 *                 format: binary
 *                 description: Selfie segurando documento
 *               face_scan_data:
 *                 type: string
 *                 description: Dados do FaceScan 3D (JSON)
 *               liveness_video:
 *                 type: string
 *                 format: binary
 *                 description: Vídeo de prova de vida
 *     responses:
 *       201:
 *         description: Verificação submetida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verification_id:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [pending]
 *                 expected_review_time:
 *                   type: string
 *                   example: 48 horas
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos ou documentos ilegíveis
 *       409:
 *         description: Verificação já existe ou em cooldown
 *       413:
 *         description: Arquivos muito grandes
 */

/**
 * @swagger
 * /api/v1/verification/requirements:
 *   get:
 *     tags: [Verification]
 *     summary: Requisitos de verificação
 *     description: Retorna os requisitos e documentos aceitos para verificação
 *     responses:
 *       200:
 *         description: Lista de requisitos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accepted_documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [rg, cnh, passport]
 *                       name:
 *                         type: string
 *                       requires_back:
 *                         type: boolean
 *                       instructions:
 *                         type: array
 *                         items:
 *                           type: string
 *                 file_requirements:
 *                   type: object
 *                   properties:
 *                     max_size_mb:
 *                       type: integer
 *                     accepted_formats:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [jpg, jpeg, png, webp]
 *                     min_resolution:
 *                       type: string
 *                       example: 800x600
 *                 liveness_challenges:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [blink, smile, turn_left, turn_right, nod]
 *                       description:
 *                         type: string
 *                 age_requirement:
 *                   type: integer
 *                   example: 18
 */

/**
 * @swagger
 * /api/v1/verification/{id}/cancel:
 *   post:
 *     tags: [Verification]
 *     summary: Cancelar verificação
 *     description: Cancela uma verificação pendente
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
 *         description: Verificação cancelada
 *       400:
 *         description: Verificação não pode ser cancelada
 *       404:
 *         description: Verificação não encontrada
 */

export {};