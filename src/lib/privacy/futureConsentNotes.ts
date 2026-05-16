/**
 * Orientação para integrações futuras de analytics, anúncios ou pixels.
 *
 * Hoje a Woody não carrega scripts de marketing/medida no estado atual deste repositório.
 * Se isso mudar:
 * - Carregar apenas após o utilizador dar consentimento explícito (preferência persistida).
 * - Não injetar tags de terceiros no HTML estático até existir esse fluxo.
 * - Encapsular carregamento em um ponto único (ex.: hook ou inicializador) para facilmente ligar/desligar.
 *
 * Não é um CMP nem armazenamento de consentimento — apenas contrato de engenharia para quem for implementar.
 *
 * Regra única: scripts não essenciais (analytics, anúncios, pixels) só após consentimento explícito e preferência persistida.
 */

export {};
