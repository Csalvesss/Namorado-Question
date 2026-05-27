export const RIGHT_PHRASES_NAMORADO = [
  'Boa, amor, mandou bem demais.',
  'Essa é a minha médica, deitou nessa.',
  'Caramba, vida, você é inteligente mesmo.',
  'Acertou em cheio, doutora linda.',
  'Aí sim, minha doutora favorita.',
  'Sabia que você ia acertar essa.',
  'Genial, amor. Estudou bonito.',
  'Resposta certa, com classe.',
  'Mais uma você levou no peito, vida.',
  'Você impressiona, doutora.',
];

export const WRONG_PHRASES_NAMORADO = [
  'Tudo bem, amor. Respira, lê de novo e a próxima é sua.',
  'Erro também é estudo, vida. Você está aprendendo.',
  'Não desanima, doutora. Olha a explicação com calma.',
  'Você está no caminho certo, vida. Continua firme.',
  'Cada erro hoje é uma questão certa na prova de verdade, amor.',
  'Sem culpa, doutora. Foco na próxima.',
  'Calma, vida. Você é mais forte do que esse deslize.',
  'Essa escapou, mas o conteúdo é seu, amor.',
  'Confio em você, doutora. Esse vai grudar agora.',
  'Te conheço, amor. Você não erra duas vezes a mesma.',
];

export const FINAL_HIGH_NAMORADO = [
  'Você é absurda, amor. Que orgulho ser seu namorado.',
  'Doutora, isso foi de outro nível. Te amo.',
  'Saiu da prova, casou comigo. Você é demais, vida.',
  'Eu sempre soube que você ia mandar bem, amor.',
  'Essa cabeça é minha namorada, vou ter que me esforçar para acompanhar.',
];

export const FINAL_MED_NAMORADO = [
  'Tá indo muito bem, amor. Está quase lá.',
  'Você está construindo isso, vida. Cada questão conta.',
  'Boa, doutora. Próxima rodada você sobe ainda mais.',
  'Olha a evolução, amor. Continua nesse ritmo.',
  'Já está dentro do conteúdo, vida. Vamos polir.',
];

export const FINAL_LOW_NAMORADO = [
  'Calma, amor. Conteúdo difícil exige paciência.',
  'Sem pressão, vida. Vou estar do seu lado em cada rodada.',
  'Volta na explicação e tenta de novo, doutora. Você consegue.',
  'Erro hoje é acerto na prova, amor. Bora de novo.',
  'Você é forte demais, doutora. Esse tema é só uma curva.',
];

export const RIGHT_PHRASES_DOUTORA = [
  'Resposta correta.',
  'Boa, conceito dominado.',
  'Certa. Continue.',
  'Acertou.',
  'Resposta certa.',
  'Correto.',
  'Bom raciocínio.',
  'Acerto consistente.',
];

export const WRONG_PHRASES_DOUTORA = [
  'Resposta incorreta. Veja a explicação.',
  'Errou. Releia o conteúdo.',
  'Resposta errada. Atenção ao detalhe.',
  'Não foi dessa vez. Estude o tópico.',
  'Incorreto. Reveja a alternativa.',
];

export const FINAL_HIGH_DOUTORA = [
  'Excelente desempenho.',
  'Aprovada nesta simulação.',
  'Resultado consistente. Continue.',
];

export const FINAL_MED_DOUTORA = [
  'Bom desempenho. Há espaço para melhorar.',
  'Resultado razoável. Reveja os erros.',
];

export const FINAL_LOW_DOUTORA = [
  'Desempenho abaixo do esperado. Estude o conteúdo.',
  'Resultado precisa melhorar. Reveja os tópicos.',
];

export function getPhrases(displayMode: 'namorado' | 'doutora') {
  if (displayMode === 'doutora') {
    return {
      right: RIGHT_PHRASES_DOUTORA,
      wrong: WRONG_PHRASES_DOUTORA,
      finalHigh: FINAL_HIGH_DOUTORA,
      finalMed: FINAL_MED_DOUTORA,
      finalLow: FINAL_LOW_DOUTORA,
    };
  }
  return {
    right: RIGHT_PHRASES_NAMORADO,
    wrong: WRONG_PHRASES_NAMORADO,
    finalHigh: FINAL_HIGH_NAMORADO,
    finalMed: FINAL_MED_NAMORADO,
    finalLow: FINAL_LOW_NAMORADO,
  };
}
