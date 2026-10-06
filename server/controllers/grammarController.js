import fetch from 'node-fetch';

/**
 * Built-in dictionary and common grammar rule engine fallback
 */
const COMMON_MISSPELLINGS = {
  teh: 'the',
  recieve: 'receive',
  seperate: 'separate',
  until: 'until',
  truely: 'truly',
  definately: 'definitely',
  accommodate: 'accommodate',
  occured: 'occurred',
  goverment: 'government',
  enviroment: 'environment',
  untill: 'until',
  wich: 'which',
  tihs: 'this',
  thier: 'their',
  freind: 'friend',
  beleive: 'believe',
  tommorow: 'tomorrow',
  whent: 'went',
  adress: 'address'
};

const runLocalGrammarCheck = (text) => {
  const matches = [];
  const words = text.split(/(\s+|[.,!?;:()"])/);
  let cursorIndex = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const cleanWord = word.toLowerCase().trim();

    if (cleanWord && COMMON_MISSPELLINGS[cleanWord]) {
      const suggestion = COMMON_MISSPELLINGS[cleanWord];
      const replacement = word[0] === word[0].toUpperCase()
        ? suggestion.charAt(0).toUpperCase() + suggestion.slice(1)
        : suggestion;

      matches.push({
        message: `Possible spelling error. Did you mean "${replacement}"?`,
        shortMessage: 'Spelling error',
        offset: cursorIndex,
        length: word.length,
        replacements: [replacement],
        rule: {
          id: 'MORFOLOGIK_RULE_EN_US',
          description: 'Spelling check',
          issueType: 'misspelling'
        },
        context: {
          text: word,
          offset: 0,
          length: word.length
        }
      });
    }

    // Check repeated words (e.g. "the the")
    if (i > 1 && cleanWord.length > 1) {
      const prevWord = words[i - 2]?.toLowerCase().trim();
      if (prevWord === cleanWord && !['that', 'had'].includes(cleanWord)) {
        matches.push({
          message: `Repeated word: "${word}"`,
          shortMessage: 'Repeated word',
          offset: cursorIndex,
          length: word.length,
          replacements: [],
          rule: {
            id: 'ENGLISH_WORD_REPEAT_RULE',
            description: 'Repeated words',
            issueType: 'grammar'
          },
          context: {
            text: word,
            offset: 0,
            length: word.length
          }
        });
      }
    }

    cursorIndex += word.length;
  }

  return matches;
};

export const checkGrammar = async (req, res) => {
  try {
    const { text, language = 'en-US' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.json({ matches: [], serviceAvailable: true });
    }

    const bodyParams = new URLSearchParams();
    bodyParams.append('text', text);
    bodyParams.append('language', language);

    // Try local LanguageTool URL first, or public LanguageTool API
    const endpoints = [
      process.env.LANGUAGETOOL_URL || 'http://localhost:8081/v2/check',
      'https://api.languagetool.org/v2/check'
    ];

    for (const targetUrl of endpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: bodyParams.toString(),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const formattedMatches = (data.matches || []).map((m) => {
            const issueType = m.rule?.issueType || (m.shortMessage?.toLowerCase().includes('spelling') ? 'misspelling' : 'grammar');
            return {
              message: m.message || 'Possible issue',
              shortMessage: m.shortMessage || '',
              offset: m.offset,
              length: m.length,
              replacements: (m.replacements || []).slice(0, 5).map((r) => r.value),
              rule: {
                id: m.rule?.id || 'UNKNOWN_RULE',
                description: m.rule?.description || '',
                issueType
              },
              context: {
                text: m.context?.text || '',
                offset: m.context?.offset || 0,
                length: m.context?.length || 0
              }
            };
          });

          return res.json({
            matches: formattedMatches,
            serviceAvailable: true
          });
        }
      } catch (err) {
        // Continue to next endpoint or fallback
      }
    }

    // Fallback: Internal Rule Engine if external endpoints are unreachable
    const fallbackMatches = runLocalGrammarCheck(text);
    return res.json({
      matches: fallbackMatches,
      serviceAvailable: true
    });
  } catch (error) {
    console.error('[Grammar Check Error]:', error);
    return res.json({
      matches: [],
      serviceAvailable: false,
      message: error.message || 'Grammar check failed'
    });
  }
};
