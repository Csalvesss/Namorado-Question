// Modo Simulação — Receituário (track: odonto)
//
// A aluna NÃO monta a receita aqui. Ela RECEBE uma receita pronta (como se
// um paciente tivesse chegado ao consultório com ela) e precisa interpretar:
// identificar o esquema, traduzir a posologia, listar instruções-chave,
// sinais de alarme e as armadilhas que o paciente típico cai.
//
// Cobertura: antibioticoterapia (1ª linha, alérgico, profilaxia EI),
// AINE pós-op em horário fixo, analgesia escalonada, corticoide pré-cirúrgico,
// sedação ansiolítica pré-procedimento e clorexidina pós-cirúrgica.

import type { ReceitaSimulacao } from './simulacao-medicina';

export const SIMULACAO_ODONTO: ReceitaSimulacao[] = [
  // 1) Amoxicilina em infecção odontogênica — paciente tomou "como se fosse analgésico"
  {
    id: 'odo-amox-pulpite-irreversivel',
    track: 'odonto',
    especialidade: 'Endodontia',
    patientTag: 'Adulto 36a, pulpite irreversível com periapical agudo',
    patientContext:
      'Sra. Bianca, 36 anos, chega ao retorno trazendo a receita de antibiótico que recebeu há 4 dias. Conta que tomou "uma de manhã, uma à noite" porque achou que era pra dor — e que "como melhorou no terceiro dia, parou". Hoje voltou a inchar.',
    prescritor: {
      nome: 'Dr. Henrique Salazar Pimenta',
      registro: 'CRO/SP 31.408',
      especialidade: 'Endodontia',
      clinica: 'Odontoclínica Sorrir',
      endereco: 'Av. Paulista, 2.073 — Cj. 412, Bela Vista, São Paulo/SP',
      telefone: '(11) 3262-4477',
    },
    pacienteNome: 'Bianca Toledo Vasconcelos',
    pacienteIdade: '36 anos',
    data: '15/05/2026',
    itens: [
      {
        medicamento: 'Amoxil (amoxicilina) 500 mg',
        apresentacao: '21 cápsulas',
        posologia: 'Tomar 1 cápsula, via oral, de 8 em 8 horas, durante 7 dias.',
        observacao: 'Tomar com água, preferencialmente após as refeições.',
      },
      {
        medicamento: 'Novalgina (dipirona sódica) 500 mg',
        apresentacao: '20 comprimidos',
        posologia: 'Tomar 1 a 2 comprimidos, via oral, de 6 em 6 horas, se dor.',
      },
    ],
    observacoesReceita: 'Retorno em 48 horas para abertura coronária e drenagem da câmara pulpar.',
    answerKey: {
      identificacao:
        'Amoxicilina 500 mg (β-lactâmico, aminopenicilina) — antibioticoterapia adjuvante + Dipirona 500 mg (analgésico não opioide) — sintomático.',
      posologiaResumida:
        'Amox: 1 cp VO 8/8h por 7 dias COMPLETOS (3×/dia, ex. 06h–14h–22h). Dipirona: 1–2 cp VO 6/6h apenas se dor (SOS).',
      instrucoesChave: [
        'Antibiótico em INTERVALO RÍGIDO de 8h e por 7 dias COMPLETOS — não parar mesmo que a dor e o inchaço desapareçam',
        'Programar alarme em 3 horários fixos (ex.: 06h–14h–22h); se esquecer, tomar assim que lembrar — salvo se faltar pouco para a próxima',
        'Tomar a amoxicilina após refeição reduz desconforto gástrico; ingerir com copo cheio de água',
        'Dipirona é só para dor — pode ser combinada com a amoxicilina, mas NÃO substitui o antibiótico',
        'O antibiótico contém a infecção sistemicamente, mas a CAUSA precisa ser tratada — comparecer ao retorno em 48h para o acesso endodôntico',
        'Evitar bebida alcoólica enquanto durar o tratamento; manter hidratação',
      ],
      sinaisAlarme: [
        'Urticária, edema labial/periorbitário, prurido difuso ou falta de ar — possível reação alérgica à penicilina, suspender e procurar emergência',
        'Diarreia profusa, com muco ou sangue, durante ou até 4 semanas após o ATB — investigar Clostridioides difficile',
        'Aumento do edema cervical, dificuldade para engolir/respirar, trismo crescente ou febre acima de 38,5 °C — sinal de celulite progressiva, emergência',
      ],
      armadilhas: [
        'Tratar amoxicilina como analgésico ("tomei quando doeu") — perde a janela terapêutica e seleciona resistência',
        'Suspender o antibiótico ao melhorar do 3º dia — recidiva quase garantida e risco de resistência',
        'Achar que o ATB cura a pulpite — antibiótico é adjuvante, sem drenagem/endo o foco persiste',
        'Tomar dipirona em horário fixo a ponto de mascarar piora — usar como SOS e reavaliar se a dor virar contínua',
      ],
    },
    teaching:
      'Infecção odontogênica com sinais sistêmicos / disseminação: 1ª linha amoxicilina 500 mg VO 8/8h por 7 dias, SEMPRE associada ao tratamento da causa (acesso endodôntico, drenagem ou exodontia). O erro clássico do paciente aqui é triplo: confundir ATB com analgésico, perder dose por intervalo elástico e suspender ao melhorar. Reforce a regra: "antibiótico tem hora marcada e tem dia de terminar — quem manda parar é o calendário, não o sintoma". Dipirona entra como sintomático SOS; não cobre o pico inflamatório como um AINE em horário fixo faria, mas é opção quando há contraindicação ao AINE.',
  },

  // 2) Clindamicina em alérgico à penicilina — armadilha gastro + C. difficile
  {
    id: 'odo-clinda-alergico-penicilina',
    track: 'odonto',
    especialidade: 'Cirurgia Oral Menor',
    patientTag: 'Adulto 48a, alérgico à penicilina, pericoronarite aguda',
    patientContext:
      'Sr. Otávio, 48 anos, chega para reavaliação da pericoronarite do 48 com a receita do cirurgião buco-maxilo da semana passada. Diz que "tá tomando direitinho, mas a barriga vive solta e enjoado" e pergunta se pode trocar pela amoxicilina "porque é mais fraca pro estômago". Já registrou alergia à penicilina (urticária generalizada em 2019).',
    prescritor: {
      nome: 'Dra. Larissa Bittencourt Aragão',
      registro: 'CRO/SP 27.992',
      especialidade: 'Cirurgia e Traumatologia Buco-Maxilo-Facial',
      clinica: 'Centro Odontológico Pinheiros',
      endereco: 'Rua dos Pinheiros, 870 — Pinheiros, São Paulo/SP',
      telefone: '(11) 3081-5566',
    },
    pacienteNome: 'Otávio Camargo Linhares',
    pacienteIdade: '48 anos',
    data: '18/05/2026',
    itens: [
      {
        medicamento: 'Clindamicina 300 mg',
        apresentacao: '28 cápsulas',
        posologia: 'Tomar 1 cápsula, via oral, de 6 em 6 horas, durante 7 dias.',
        observacao: 'Engolir inteira com 1 copo cheio de água, em pé ou sentado. Não deitar nos 30 min seguintes.',
      },
      {
        medicamento: 'Ibuprofeno 600 mg',
        apresentacao: '12 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, de 8 em 8 horas, em horário fixo, durante 3 dias.',
      },
    ],
    observacoesReceita:
      'Paciente alérgico à penicilina (urticária generalizada em 2019). Retorno para exodontia do 48 em 5 dias, após resolução do quadro agudo.',
    answerKey: {
      identificacao:
        'Clindamicina 300 mg (lincosamida) — alternativa em alérgico à penicilina + Ibuprofeno 600 mg (AINE) — controle inflamatório.',
      posologiaResumida:
        'Clinda: 1 cp VO 6/6h por 7 dias COMPLETOS (4×/dia, ex. 06h–12h–18h–00h). Ibu: 1 cp VO 8/8h em HORÁRIO FIXO por 3 dias.',
      instrucoesChave: [
        'Clindamicina é um intervalo curto (6/6h) — 4 doses por dia, programar alarme; manter por 7 dias completos',
        'NÃO trocar por amoxicilina — paciente tem alergia documentada à penicilina; clindamicina é a alternativa correta',
        'Engolir a cápsula com COPO CHEIO de água e permanecer em pé/sentado por ~30 min — evita esofagite ulcerativa por clindamicina',
        'Ibuprofeno em horário fixo nos 3 primeiros dias (não SOS) — analgesia preemptiva cobre o pico inflamatório',
        'Tomar o ibuprofeno após refeição; evitar associar a outro AINE',
        'O incômodo gástrico leve é comum, mas diarreia importante exige avaliação imediata (ver sinais de alarme)',
      ],
      sinaisAlarme: [
        'Diarreia aquosa volumosa, com muco/sangue, cólica intensa ou febre — suspeita de colite pseudomembranosa por C. difficile; suspender e procurar emergência',
        'Dor retroesternal/queimação ao engolir após a cápsula — esofagite, reforçar técnica de ingestão e procurar avaliação se persistir',
        'Reação cutânea extensa, lesões em alvo, bolhas ou descamação (suspeita de SSJ/NET) — emergência',
        'Sangramento gastrointestinal, melena, dor epigástrica intensa — toxicidade do AINE',
      ],
      armadilhas: [
        '"Trocar pela amoxicilina porque é mais fraca" — risco de anafilaxia em alérgico documentado; clindamicina é justamente a alternativa',
        'Subestimar diarreia em uso de clindamicina — é o ATB com maior associação a C. difficile na odontologia',
        'Engolir a cápsula sem água suficiente ou deitada — alto risco de esofagite local pela clindamicina',
        'Tomar ibuprofeno "só se doer" — perde a janela preemptiva, o pico inflamatório se instala e a dose SOS já chega atrasada',
      ],
    },
    teaching:
      'Em paciente com alergia documentada à penicilina (sobretudo reação imediata: urticária, angioedema, anafilaxia), a alternativa em infecção odontogênica é clindamicina 300 mg VO 6/6h por 7 dias — não cefalexina, dada a reatividade cruzada potencial em reações IgE-mediadas. A clindamicina tem dois pontos críticos a ensinar: (1) maior risco relativo de colite por C. difficile entre os antibióticos usados em odontologia — orientar a paciente a reportar diarreia precoce e suspender; (2) esofagite por contato — engolir em pé/sentado com bastante água. AINE associado em horário fixo nos primeiros 2–3 dias para cobrir o pico inflamatório; depois pode escalar para SOS conforme dor residual.',
  },

  // 3) Profilaxia de endocardite infecciosa — paciente tomou na véspera, não na hora
  {
    id: 'odo-profilaxia-endocardite',
    track: 'odonto',
    especialidade: 'Cardiopediatria / Odontologia Hospitalar',
    patientTag: 'Adulto 58a, prótese valvar mitral, profilaxia EI',
    patientContext:
      'Sr. Demétrio, 58 anos, portador de prótese valvar mitral mecânica, chega 30 min antes da raspagem subgengival programada trazendo a receita de "antibiótico antes do dentista" que o cardiologista mandou. Comenta orgulhoso que "já tomou os 4 comprimidos ontem à noite, antes de dormir, pra não esquecer hoje".',
    prescritor: {
      nome: 'Dra. Marta Vilanova de Sá',
      registro: 'CRM/SP 142.318',
      especialidade: 'Cardiologia',
      clinica: 'Instituto Cardiológico Higienópolis',
      endereco: 'Rua Maranhão, 540 — Higienópolis, São Paulo/SP',
      telefone: '(11) 3825-9090',
    },
    pacienteNome: 'Demétrio Albuquerque Rosa',
    pacienteIdade: '58 anos',
    data: '20/05/2026',
    itens: [
      {
        medicamento: 'Amoxicilina 500 mg',
        apresentacao: '4 cápsulas',
        posologia:
          'Tomar 4 cápsulas (2 g), via oral, em DOSE ÚNICA, 30 a 60 minutos ANTES do procedimento odontológico.',
        observacao:
          'Profilaxia de endocardite infecciosa — não substituir nem antecipar a dose. Confirmar horário com o cirurgião-dentista.',
      },
    ],
    observacoesReceita:
      'Paciente com prótese valvar mecânica em uso de varfarina (RNI alvo 2,5–3,5). Profilaxia conforme protocolo AHA. Procedimento programado: raspagem subgengival.',
    answerKey: {
      identificacao:
        'Amoxicilina 2 g (4 × 500 mg) — DOSE ÚNICA pré-procedimento para profilaxia de endocardite infecciosa (AHA/SBC).',
      posologiaResumida: '4 cápsulas (2 g) VO em DOSE ÚNICA, 30 a 60 min ANTES da raspagem.',
      instrucoesChave: [
        'A dose precisa ser tomada 30 a 60 MINUTOS ANTES do procedimento — não na véspera, não horas antes',
        'É DOSE ÚNICA: 4 cápsulas de 500 mg juntas (totalizando 2 g), via oral, com água',
        'Tomou em horário errado (>2h antes ou na véspera) = profilaxia INEFICAZ → reagendar ou usar esquema de resgate em até 2h APÓS o procedimento, em situações excepcionais',
        'Indicada porque há prótese valvar — risco alto de EI; procedimento com manipulação de tecido gengival/periapical entra no critério',
        'Avisar imediatamente o cirurgião-dentista o horário exato em que tomou — decisão clínica de adiar ou completar depende disso',
        'Se houver alergia à penicilina: alternativas são clindamicina 600 mg, azitromicina 500 mg ou cefalexina 2 g — também em dose única pré-procedimento',
      ],
      sinaisAlarme: [
        'Após o procedimento: febre persistente, calafrios, mal-estar, novo sopro, manchas em pele/mucosa, dor lombar — suspeita de endocardite, emergência cardiológica',
        'Reação alérgica imediata após a dose (urticária, edema, dispneia, hipotensão) — emergência',
        'Sangramento gengival ou pós-raspagem excessivo (em uso de varfarina) — checar RNI antes do procedimento',
      ],
      armadilhas: [
        'Tomar "na véspera para não esquecer" — janela farmacocinética perdida, profilaxia inválida',
        'Achar que dose única = "uma cápsula" — são 4 cápsulas de 500 mg para totalizar 2 g',
        'Pular a profilaxia "porque a boca está limpa" — a indicação é a condição cardíaca + tipo de procedimento, não o estado da boca',
        'Esquecer da varfarina e do RNI — risco hemorrágico significativo na raspagem subgengival; checar coagulograma na consulta',
      ],
    },
    teaching:
      'Profilaxia de endocardite infecciosa (protocolo AHA 2021 / SBC): amoxicilina 2 g VO em dose única, 30–60 min antes de procedimentos odontológicos que envolvam manipulação da gengiva, da região periapical ou perfuração da mucosa oral. Indicada apenas em cardiopatias de alto risco (prótese valvar incluindo TAVI, EI prévia, cardiopatia congênita cianótica não corrigida ou recém-corrigida, transplantado cardíaco com valvulopatia). Erro do paciente aqui é didático: a janela é estreita (30–60 min). Tomar na véspera = farmacocineticamente nulo no momento da bacteriemia. Se o paciente esquecer e o procedimento já tiver começado, ainda há recomendação de administração em até 2h após o início, mas é resgate, não plano A. Em alérgicos à penicilina: clindamicina 600 mg, azitromicina/claritromicina 500 mg ou cefalexina 2 g. Em pacientes anticoagulados, articular com o cardiologista para RNI no alvo e técnicas hemostáticas locais — evitar interromper varfarina.',
  },

  // 4) AINE pós-cirúrgico em horário fixo — cetorolaco sublingual + analgesia preemptiva
  {
    id: 'odo-cetorolaco-pos-exo',
    track: 'odonto',
    especialidade: 'Cirurgia Oral Menor',
    patientTag: 'Adulto 28a, pós-exodontia 38 incluso',
    patientContext:
      'Sra. Júlia, 28 anos, chega ao retorno de 24h pós-exodontia do 38 incluso queixando-se que "a dor voltou forte ontem à noite". Conta que tomou o cetorolaco "quando começou a doer", "só duas vezes" — e que achou que era pra usar se a dor aparecesse, igual ao remédio do marido.',
    prescritor: {
      nome: 'Dr. Eduardo Pacheco Lemos',
      registro: 'CRO/SP 19.665',
      especialidade: 'Cirurgia e Traumatologia Buco-Maxilo-Facial',
      clinica: 'Clínica Oral Vila Madalena',
      endereco: 'Rua Wisard, 305 — Vila Madalena, São Paulo/SP',
      telefone: '(11) 3032-7821',
    },
    pacienteNome: 'Júlia Andrade Quintela',
    pacienteIdade: '28 anos',
    data: '22/05/2026',
    itens: [
      {
        medicamento: 'Toragesic (cetorolaco trometamina) 10 mg sublingual',
        apresentacao: '8 comprimidos sublinguais',
        posologia:
          'Colocar 1 comprimido SOB a língua e deixar dissolver, de 8 em 8 horas, em HORÁRIO FIXO, durante 2 dias (máximo 3 dias).',
        observacao:
          'Não engolir o comprimido inteiro. Não associar a outro AINE. Tomar com estômago não totalmente vazio.',
      },
      {
        medicamento: 'Paracetamol 750 mg',
        apresentacao: '12 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, de 6 em 6 horas, se dor de resgate.',
      },
    ],
    observacoesReceita:
      'Pós-operatório de exodontia do 38 incluso. Compressa fria nas primeiras 24h, dieta líquida-pastosa fria, repouso relativo. Retorno em 7 dias para remoção de sutura.',
    answerKey: {
      identificacao:
        'Cetorolaco 10 mg sublingual (AINE potente, via sublingual = absorção rápida) — analgesia preemptiva em horário fixo + Paracetamol 750 mg — analgésico de resgate.',
      posologiaResumida:
        'Cetorolaco: 1 cp SL 8/8h em HORÁRIO FIXO por 2 dias (máx. 3). Paracetamol: 1 cp VO 6/6h SOS se dor de resgate.',
      instrucoesChave: [
        'Cetorolaco em HORÁRIO FIXO (ex.: 06h–14h–22h) — não esperar a dor voltar; o objetivo é IMPEDIR o pico inflamatório, não correr atrás dele',
        'Comprimido SOB a língua, deixar dissolver — não morder, não engolir inteiro; via sublingual entrega o efeito em ~10 min',
        'Duração máxima de 3 a 5 dias de uso de cetorolaco — risco gastro e renal aumenta com o tempo',
        'Paracetamol é o resgate quando o intervalo do cetorolaco ainda não chegou — pode ser INTERCALADO em horário fixo se a dor for forte',
        'Não associar dois AINEs juntos (sem ibuprofeno, sem diclofenaco) — somam toxicidade, não somam analgesia',
        'Hidratar bem, evitar bochechos vigorosos nas primeiras 24h, manter cabeceira elevada ao dormir',
      ],
      sinaisAlarme: [
        'Dor que reaparece pulsátil entre o 3º e o 5º dia, com halitose intensa e sabor metálico — suspeita de alveolite seca, retornar',
        'Sangramento ativo persistente após 24h, edema cervical progressivo ou trismo crescente — emergência',
        'Dor epigástrica, melena, hematêmese, edema de membros inferiores ou diminuição do volume urinário — toxicidade gastrorrenal do AINE',
        'Febre acima de 38 °C após 48h — infecção pós-op, avaliar',
      ],
      armadilhas: [
        'Tomar AINE "se doer" — perde a janela preemptiva; o pico inflamatório vence o medicamento',
        'Engolir o comprimido sublingual — derrota o ganho farmacocinético da via sublingual',
        'Prolongar cetorolaco além de 3–5 dias para "garantir" — risco gastro e renal sobe muito',
        'Associar com ibuprofeno/diclofenaco "pra reforçar" — dois AINEs juntos somam toxicidade sem somar analgesia',
      ],
    },
    teaching:
      'Analgesia preemptiva pós-cirúrgica é o pilar do controle da dor odontológica aguda: o AINE deve entrar EM HORÁRIO FIXO nas primeiras 48–72h, idealmente com a primeira dose AINDA antes ou no fim do procedimento. Cetorolaco sublingual é potente e tem início rápido por absorção transmucosa, mas a duração de uso é limitada (até 3–5 dias) pela toxicidade gastro e renal cumulativa. Paracetamol entra como resgate ou intercalado nos vales do AINE — combinação racional, mecanismos diferentes. O erro clássico do paciente, mostrado aqui, é "tomar quando doer": isso desmonta a estratégia preemptiva. Reforce: "horário fixo até o 3º dia, mesmo sem dor; depois escalonar para SOS conforme a evolução".',
  },

  // 5) Analgesia escalonada — dipirona + ibuprofeno intercalados pós-instalação de implante
  {
    id: 'odo-analgesia-escalonada-implante',
    track: 'odonto',
    especialidade: 'Implantodontia',
    patientTag: 'Adulto 44a, pós-instalação de 2 implantes em mandíbula',
    patientContext:
      'Sr. Rodolfo, 44 anos, chega no dia seguinte à instalação de dois implantes em mandíbula. Trouxe a receita e diz que "ficou confuso com tanto remédio" — não entendeu se toma os dois juntos, alternados ou em horários diferentes. Confessa que "tomou os dois ao mesmo tempo, achando que era mais forte".',
    prescritor: {
      nome: 'Dra. Carolina Negrão Brizola',
      registro: 'CRO/SP 22.554',
      especialidade: 'Implantodontia',
      clinica: 'Centro Odontológico Pinheiros',
      endereco: 'Rua dos Pinheiros, 870 — Pinheiros, São Paulo/SP',
      telefone: '(11) 3081-5566',
    },
    pacienteNome: 'Rodolfo Mascarenhas Bueno',
    pacienteIdade: '44 anos',
    data: '23/05/2026',
    itens: [
      {
        medicamento: 'Ibuprofeno 600 mg',
        apresentacao: '12 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, de 8 em 8 horas, em HORÁRIO FIXO, durante 3 dias.',
        observacao: 'Após refeição. Horários sugeridos: 07h, 15h e 23h.',
      },
      {
        medicamento: 'Dipirona 1 g',
        apresentacao: '20 comprimidos',
        posologia:
          'Tomar 1 comprimido, via oral, de 6 em 6 horas, INTERCALADO com o ibuprofeno, durante 3 dias (depois, somente se dor).',
        observacao: 'Horários sugeridos para INTERCALAR: 11h, 19h, 03h.',
      },
      {
        medicamento: 'Periogard (clorexidina 0,12%) sem álcool',
        apresentacao: 'Frasco de 250 mL',
        posologia:
          'Bochechar 15 mL, sem diluir, durante 60 segundos, 2 vezes ao dia (manhã e noite), por 14 dias.',
        observacao: 'Iniciar 24h após a cirurgia. Não escovar nem comer/beber por 30 min após o bochecho.',
      },
    ],
    observacoesReceita:
      'Pós-op de 2 implantes em mandíbula. Compressa fria 20 min, intervalo 20 min, por 24h. Dieta fria/morna nas primeiras 48h. Retorno em 10 dias para retirada de sutura.',
    answerKey: {
      identificacao:
        'Ibuprofeno 600 mg (AINE) + Dipirona 1 g (analgésico não opioide), em esquema ESCALONADO/INTERCALADO + Clorexidina 0,12% (antisséptico tópico).',
      posologiaResumida:
        'Ibu 8/8h em horário fixo (07h–15h–23h) + Dipirona 6/6h INTERCALADA (11h–19h–03h) por 3 dias. Clorexidina 15 mL 2×/dia por 14 dias, iniciando 24h pós-op.',
      instrucoesChave: [
        'Os dois analgésicos são INTERCALADOS, não simultâneos — a ideia é que a cada ~4h o paciente tenha um efeito ativo no organismo',
        'Esquema modelo: Ibu 07h → Dipi 11h → Ibu 15h → Dipi 19h → Ibu 23h → Dipi 03h',
        'Mecanismos diferentes (AINE + analgésico central): somam analgesia, NÃO somam toxicidade — princípio da analgesia balanceada',
        'Tomar tudo em horário fixo nos 3 primeiros dias; depois manter SOS conforme a dor',
        'Clorexidina só começa 24h pós-op — antes disso o coágulo está se formando e o bochecho pode deslocá-lo',
        'Técnica da clorexidina: 15 mL puro, 60 segundos, NÃO diluir, NÃO escovar/comer/beber por 30 min depois — senão neutraliza o efeito',
      ],
      sinaisAlarme: [
        'Dor crescente após o 3º dia, com pus ou febre — peri-implantite aguda, retornar',
        'Edema cervical progressivo, trismo importante ou dificuldade respiratória — emergência',
        'Sangramento gastrointestinal, melena, dor epigástrica intensa — toxicidade do AINE',
        'Reação alérgica à dipirona (rara, mas grave): urticária, edema, hipotensão — emergência',
      ],
      armadilhas: [
        'Tomar ibuprofeno e dipirona JUNTOS, no mesmo horário — perde a vantagem da intercalação (cobertura contínua)',
        'Parar tudo no 2º dia "porque não está doendo" — a melhora é justamente porque o esquema está funcionando; o pico inflamatório ainda vem',
        'Diluir a clorexidina em água "porque arde" — anula o efeito; usar a versão sem álcool resolve o ardor',
        'Escovar imediatamente após o bochecho de clorexidina — a pasta com lauril sulfato neutraliza a clorexidina',
      ],
    },
    teaching:
      'Analgesia multimodal/escalonada é o padrão-ouro no pós-op odontológico: combinar um AINE (ibuprofeno 600 mg 8/8h) com um analgésico não opioide de mecanismo distinto (dipirona 1 g 6/6h) em horários INTERCALADOS produz cobertura contínua sem somar toxicidade. O erro do paciente — tomar os dois ao mesmo tempo — é frequente e custa caro: cria vales sem cobertura entre as doses. Desenhar o esquema na receita ou em papel, com horários explícitos, reduz drasticamente esse erro. A clorexidina pós-op tem 3 armadilhas técnicas que precisam ser ditas em voz alta: (1) só começa 24h depois (proteger o coágulo); (2) usar pura, sem diluir, 60 s; (3) NÃO escovar nem se alimentar por 30 min — o lauril sulfato do creme dental e os taninos dos alimentos inativam a molécula.',
  },

  // 6) Corticoide pré-cirúrgico — dexametasona oral 1h antes
  {
    id: 'odo-dexa-pre-siso',
    track: 'odonto',
    especialidade: 'Cirurgia Oral Menor',
    patientTag: 'Adulto 25a, pré-op exodontia de 38 e 48 inclusos',
    patientContext:
      'Sra. Letícia, 25 anos, vai operar os sisos inferiores amanhã às 14h. Chega à pré-consulta com a receita do corticoide e diz que vai "tomar antes de dormir hoje" porque tem medo de inchar muito. Pergunta se pode também tomar antes do almoço, "pra reforçar".',
    prescritor: {
      nome: 'Dr. Tarso Vinhas Mendonça',
      registro: 'CRO/SP 18.330',
      especialidade: 'Cirurgia e Traumatologia Buco-Maxilo-Facial',
      clinica: 'Clínica Oral Vila Madalena',
      endereco: 'Rua Wisard, 305 — Vila Madalena, São Paulo/SP',
      telefone: '(11) 3032-7821',
    },
    pacienteNome: 'Letícia Falcão Bernardes',
    pacienteIdade: '25 anos',
    data: '24/05/2026',
    itens: [
      {
        medicamento: 'Dexametasona 4 mg',
        apresentacao: '2 comprimidos',
        posologia:
          'Tomar 2 comprimidos (8 mg), via oral, DOSE ÚNICA, 1 hora ANTES do procedimento cirúrgico.',
        observacao:
          'Tomar com pouco alimento (não em jejum absoluto). Não substituir pela via injetável sem nova prescrição.',
      },
      {
        medicamento: 'Amoxicilina 500 mg',
        apresentacao: '3 cápsulas',
        posologia:
          'Tomar 2 cápsulas (1 g), via oral, 1 hora ANTES do procedimento. Após, tomar 1 cápsula 8h depois, conforme orientação no pós-op.',
        observacao: 'Esquema de profilaxia perioperatória — não é tratamento.',
      },
    ],
    observacoesReceita:
      'Exodontia simultânea de 38 e 48 inclusos, agendada para 25/05/2026 às 14h. Jejum não obrigatório (anestesia local); fazer refeição leve 2h antes. Trazer acompanhante.',
    answerKey: {
      identificacao:
        'Dexametasona 8 mg VO (corticoide de longa ação) — dose única pré-operatória para controle do edema + Amoxicilina 1 g VO — profilaxia cirúrgica.',
      posologiaResumida:
        'Dexa: 2 cp (8 mg) VO em DOSE ÚNICA, 1h ANTES da cirurgia. Amox: 2 cp (1 g) VO 1h antes + 1 cp (500 mg) 8h após.',
      instrucoesChave: [
        'A dexametasona é DOSE ÚNICA, exatamente 1 hora antes do procedimento (ex.: cirurgia às 14h → tomar às 13h)',
        'NÃO tomar na véspera nem em dose dividida — o pico plasmático precisa coincidir com o estímulo cirúrgico',
        'Tomar com um lanche leve (pão, fruta) — corticoide em jejum absoluto irrita o estômago',
        'Via ORAL conforme prescrito; não trocar por dexametasona injetável sem orientação — a equivalência exige nova prescrição',
        'Amoxicilina segue o mesmo timing: 1g VO 1h antes; depois 500 mg 8h após a primeira dose, conforme o cirurgião reforçar',
        'Pode comer leve até 2h antes (anestesia local, não geral) e deve vir com acompanhante',
      ],
      sinaisAlarme: [
        'Hiperglicemia em diabético (sede excessiva, poliúria) após a dose — comunicar o cirurgião antes de operar',
        'Reação alérgica imediata (urticária, edema, dispneia) — emergência',
        'Dor epigástrica intensa ou hematêmese — risco gastro do corticoide em estômago vazio',
        'Pós-op: edema cervical progressivo, trismo crescente, febre >38,5 °C — sinal de infecção apesar da profilaxia',
      ],
      armadilhas: [
        'Tomar na véspera "para garantir" — perde o pico plasmático no momento certo; efeito anti-edema fica reduzido',
        'Tomar dose dividida (uma de manhã, uma de tarde) — fragmenta o pico, sem ganho clínico',
        'Pular o lanche leve e tomar em jejum absoluto — náusea, gastrite',
        'Achar que o corticoide substitui o antibiótico (ou vice-versa) — são adjuvantes diferentes do mesmo plano',
      ],
    },
    teaching:
      'Corticoide pré-operatório em cirurgia odontológica de moderado a alto trauma (sisos inclusos, implantes múltiplos, regularização óssea extensa): dexametasona 4–8 mg VO em DOSE ÚNICA, 1 hora antes do procedimento. Objetivo: bloquear a cascata da fosfolipase A2 ANTES do estímulo cirúrgico — analgesia/anti-edema preemptivos. Janela é estreita: o pico plasmático precisa coincidir com a incisão. Tomar na véspera, fragmentar a dose, ou esperar o pós-op para usar perde o ganho clínico. Em diabéticos: cuidado com hiperglicemia transitória, especialmente se mal compensados. Profilaxia antibiótica em exodontia de inclusos é controversa, mas comum em protocolos com osteotomia significativa: amoxicilina 1 g 1h antes ± dose pós-op é o esquema mais usual. Reforçar: dexa e ATB são complementares, não substituíveis.',
  },

  // 7) Sedativo benzodiazepínico — midazolam pré-procedimento em paciente ansiosa
  {
    id: 'odo-midazolam-pre-procedimento',
    track: 'odonto',
    especialidade: 'Odontologia para Pacientes Especiais / Sedação Mínima',
    patientTag: 'Adulto 39a, fobia odontológica intensa, pré-tratamento conservador',
    patientContext:
      'Sra. Patrícia, 39 anos, fóbica odontológica, tem 3 restaurações marcadas para amanhã às 10h. Recebeu a prescrição de midazolam oral para sedação mínima. Pergunta se pode tomar "uma de hoje à noite pra dormir melhor" e "outra de manhã antes da consulta". Veio de carro próprio à pré-consulta.',
    prescritor: {
      nome: 'Dr. Alessandro Quintela Ribas',
      registro: 'CRO/SP 25.870',
      especialidade: 'Odontologia para Pacientes com Necessidades Especiais',
      clinica: 'Odontoclínica Sorrir',
      endereco: 'Av. Paulista, 2.073 — Cj. 412, Bela Vista, São Paulo/SP',
      telefone: '(11) 3262-4477',
    },
    pacienteNome: 'Patrícia Soares do Amaral',
    pacienteIdade: '39 anos',
    data: '24/05/2026',
    itens: [
      {
        medicamento: 'Dormonid (midazolam) 15 mg',
        apresentacao: '1 comprimido',
        posologia:
          'Tomar 1 comprimido, via oral, em DOSE ÚNICA, 45 a 60 minutos ANTES da consulta odontológica.',
        observacao:
          'Uso controlado — Receita B1 (azul). NÃO dirigir, NÃO operar máquinas, NÃO consumir álcool nas 12 horas seguintes. Comparecer com acompanhante adulto responsável.',
      },
    ],
    observacoesReceita:
      'Sedação consciente mínima para tratamento restaurador em paciente ansiosa. Confirmar acompanhante e jejum leve (refeição leve 2h antes). Monitorização clínica durante o procedimento.',
    answerKey: {
      identificacao:
        'Midazolam 15 mg VO (benzodiazepínico de ação curta-intermediária) — DOSE ÚNICA para sedação consciente mínima pré-procedimento. Receita B1 (controle especial).',
      posologiaResumida: '1 cp (15 mg) VO em DOSE ÚNICA, 45–60 min ANTES da consulta. NÃO repetir.',
      instrucoesChave: [
        'DOSE ÚNICA na manhã do procedimento, 45–60 min ANTES (ex.: consulta 10h → tomar entre 09h00 e 09h15)',
        'NÃO tomar no dia anterior, NÃO dividir em duas doses, NÃO repetir se "achar que não fez efeito"',
        'PROIBIDO dirigir, operar máquinas, tomar decisões importantes ou consumir álcool por 12 horas',
        'OBRIGATÓRIO comparecer e voltar para casa com acompanhante adulto responsável — não pode ir e voltar sozinha',
        'Fazer refeição leve 2h antes (evitar estômago totalmente vazio, mas não comer demais — risco de náusea)',
        'Não associar a outros depressores do SNC (álcool, opioides, anti-histamínicos sedantes) sem comunicar o dentista',
      ],
      sinaisAlarme: [
        'Sonolência excessiva, dificuldade para acordar, respiração lenta/superficial — depressão do SNC, emergência',
        'Reação paradoxal: agitação, agressividade, choro intenso, desorientação — comunicar imediatamente',
        'Vômito com diminuição do nível de consciência — risco de broncoaspiração, posicionar em decúbito lateral e procurar emergência',
        'Hipotensão postural com risco de queda — levantar lentamente, apoiar-se',
      ],
      armadilhas: [
        '"Tomar uma à noite pra dormir melhor" — bezno na véspera produz ressaca, prejudica o procedimento e gera tolerância indesejada para a dose do dia',
        '"Tomar duas pra reforçar" — risco de sedação profunda inadvertida, queda do nível de consciência, depressão respiratória',
        'Vir dirigindo o próprio carro — proibição absoluta; reforçar acompanhante na pré-consulta',
        'Combinar com clonazepam, álcool, opioide ou anti-histamínico sedante "que ela usa normalmente" — sinergismo depressor perigoso',
      ],
    },
    teaching:
      'Sedação consciente mínima por via oral em odontologia ambulatorial: midazolam 7,5–15 mg VO em DOSE ÚNICA, 45–60 min antes do procedimento. Faixa de doses depende de peso, idade e comorbidades; em idosos, hepatopatas ou em uso de outros depressores, reduzir. Prescrição é Notificação de Receita B1 (azul, retenção da via). Pontos não-negociáveis a verbalizar com o paciente: (1) DOSE ÚNICA — não há dose extra; (2) acompanhante adulto OBRIGATÓRIO; (3) 12h sem dirigir, sem álcool, sem operar máquinas; (4) não combinar com outros depressores do SNC. Reação paradoxal (agitação) é mais comum em crianças e idosos. Sempre disponibilizar flumazenil no consultório como antídoto, monitorização clínica e oximetria durante o procedimento. Esquema é para sedação MÍNIMA — se o paciente exige sedação moderada/profunda, a indicação muda para anestesista presencial.',
  },

  // 8) Antifúngico em imunocomprometido — nistatina + reforço de técnica
  {
    id: 'odo-nistatina-candidiase-imuno',
    track: 'odonto',
    especialidade: 'Estomatologia',
    patientTag: 'Idosa 68a, candidíase eritematosa, em corticoide inalatório crônico',
    patientContext:
      'Sra. Eunice, 68 anos, em uso crônico de budesonida inalatória para DPOC e prótese total superior, vem ao retorno trazendo a receita de "remédio para o sapinho da boca" prescrita há 5 dias. Diz que "passa direto, três vezes ao dia, no lugar que estava vermelho" — mas a mucosa palatina segue eritematosa. Não retira a prótese para dormir.',
    prescritor: {
      nome: 'Dra. Verônica Castanho Drumond',
      registro: 'CRO/SP 16.244',
      especialidade: 'Estomatologia',
      clinica: 'Centro Odontológico Pinheiros',
      endereco: 'Rua dos Pinheiros, 870 — Pinheiros, São Paulo/SP',
      telefone: '(11) 3081-5566',
    },
    pacienteNome: 'Eunice Pimentel Carvalho',
    pacienteIdade: '68 anos',
    data: '19/05/2026',
    itens: [
      {
        medicamento: 'Nistatina 100.000 UI/mL — suspensão oral',
        apresentacao: 'Frasco de 50 mL',
        posologia:
          'Bochechar 5 mL, mantendo na boca por 1 a 2 minutos, depois ENGOLIR. Repetir 4 vezes ao dia (após cada refeição e antes de dormir), durante 14 dias.',
        observacao:
          'Retirar a prótese antes de bochechar. Não comer nem beber por 30 minutos após o uso. Continuar por pelo menos 48h após o desaparecimento das lesões.',
      },
      {
        medicamento: 'Clorexidina 0,12% (sem álcool) — solução para imersão da prótese',
        apresentacao: 'Frasco de 250 mL',
        posologia: 'Imergir a prótese em 50 mL da solução por 15 minutos, 1 vez ao dia, durante 14 dias.',
        observacao:
          'NÃO usar para bochecho durante o uso da nistatina — antagonismo. Higienizar a prótese mecanicamente antes da imersão.',
      },
    ],
    observacoesReceita:
      'Candidíase eritematosa (estomatite protética) em paciente em corticoide inalatório crônico. Orientar higiene da prótese e bochecho de água após cada uso da budesonida.',
    answerKey: {
      identificacao:
        'Nistatina 100.000 UI/mL suspensão oral (antifúngico poliênico tópico) — bochecho + deglutição + Clorexidina 0,12% (sem álcool) para desinfecção da prótese, em HORÁRIOS SEPARADOS da nistatina.',
      posologiaResumida:
        'Nistatina: bochechar 5 mL por 1–2 min e ENGOLIR, 4×/dia (após refeições + ao deitar), por 14 dias e mais 48h após cura clínica. Clorexidina: imersão da prótese por 15 min, 1×/dia, em horário separado do bochecho.',
      instrucoesChave: [
        '"Passar com cotonete" é INSUFICIENTE — precisa ser BOCHECHO com contato de 1–2 minutos em toda a mucosa, e depois ENGOLIR para tratar o trato digestivo alto',
        'RETIRAR a prótese antes de bochechar — senão a mucosa palatina sob a prótese fica protegida do contato com a medicação',
        'Quatro vezes ao dia: após café, após almoço, após jantar e ANTES DE DORMIR — a dose noturna é a mais importante (saliva diminui à noite)',
        'Não comer nem beber nos 30 min seguintes — preserva o contato da droga com a mucosa',
        'Manter o tratamento por pelo menos 48h APÓS o desaparecimento da lesão — interromper na "melhora" gera recidiva',
        'Após cada uso da budesonida inalatória, BOCHECHAR ÁGUA E CUSPIR — corticoide residual na mucosa é o principal fator predisponente da candidíase',
        'Retirar a prótese à noite, escovar com escova específica + sabão neutro, e imergir em clorexidina 0,12% por 15 min ao dia (em horário separado da nistatina, pois há antagonismo)',
      ],
      sinaisAlarme: [
        'Disfagia importante, odinofagia ou sensação de "comida entalando" — extensão para esôfago, considerar candidíase esofágica e antifúngico sistêmico',
        'Febre, calafrios, mal-estar geral — suspeita de candidemia em imunossuprimido, emergência',
        'Lesões que não regridem em 7–14 dias apesar do uso correto — reavaliar diagnóstico (queilite, líquen, eritroplasia) e considerar fluconazol VO',
        'Reação local intensa ou alteração do paladar persistente — avaliar troca',
      ],
      armadilhas: [
        'Aplicar a nistatina "como pomada", só no ponto vermelho — não cobre todo o reservatório (mucosa, prótese, orofaringe)',
        'Não retirar a prótese antes do bochecho — a mucosa sob a prótese, que é onde mora a Candida, não recebe a droga',
        'Usar clorexidina como bochecho ao mesmo tempo da nistatina — antagonismo farmacodinâmico, neutraliza um ao outro',
        'Não bochechar água após a budesonida — mantém o substrato perpetuando a candidíase, e o tratamento "não responde"',
        'Dormir com a prótese — câmara úmida, anaeróbia e protegida = paraíso para a Candida',
      ],
    },
    teaching:
      'Candidíase oral em paciente imunocomprometido ou em corticoide inalatório crônico (incluindo estomatite protética): 1ª linha tópica é nistatina 100.000 UI/mL suspensão oral, 5 mL, 4×/dia, BOCHECHAR (1–2 min) e ENGOLIR, por 14 dias e mais 48h após resolução. Em casos refratários, extensos, esofágicos ou em imunossuprimidos graves, escalar para fluconazol VO 100–200 mg/dia por 7–14 dias (cuidar interações: varfarina, estatinas, QT longo). O erro pedagógico aqui é riquíssimo: paciente usando "como pomada" no ponto eritematoso, sem retirar a prótese, sem bochechar água após o corticoide inalatório e dormindo com a prótese — recidiva garantida. Sempre ensinar o tripé: (1) ataque medicamentoso correto na mucosa E na prótese, em horários separados (nistatina × clorexidina têm antagonismo); (2) controle do fator predisponente (bochecho de água pós-budesonida, retirada noturna da prótese); (3) manter 48h após cura clínica para prevenir recidiva.',
  },
];
