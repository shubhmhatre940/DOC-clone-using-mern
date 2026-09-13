/**
 * LanguageTool Grammar & Spell-Check Controller
 * Proxies text to a self-hosted LanguageTool server instance (default http://localhost:8081)
 */

export const checkGrammar = async (req, res) => {
  try {
    const { text, language = 'en-US' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.json({ matches: [], serviceAvailable: true });
    }

    // Determine LanguageTool URL from env or fallback to local port 8081
    const ltBaseUrl = process.env.LANGUAGETOOL_URL || 'http://localhost:8081';
    const targetUrl = `${ltBaseUrl.replace(/\/+$/, '')}/v2/check`;

    const bodyParams = new URLSearchParams();
    bodyParams.append('text', text);
    bodyParams.append('language', language);

    // Use AbortController for short 3-second timeout so editor is never held up
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
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

      if (!response.ok) {
        console.warn(`[LanguageTool] Server responded with HTTP ${response.status}`);
        return res.json({
          matches: [],
          serviceAvailable: false,
          status: response.status,
          message: `LanguageTool returned HTTP ${response.status}`
        });
      }

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
    } catch (fetchErr) {
      clearTimeout(timeout);
      // Graceful silent fallback if local LanguageTool server is not running
      const isOffline = fetchErr.name === 'AbortError' || fetchErr.code === 'ECONNREFUSED';
      if (isOffline) {
        console.log(`[LanguageTool] Offline/unreachable at ${targetUrl}. Failing gracefully.`);
      } else {
        console.warn('[LanguageTool] Fetch error:', fetchErr.message);
      }

      return res.json({
        matches: [],
        serviceAvailable: false,
        message: 'LanguageTool server is offline or unreachable. Start it via Docker: docker run -p 8081:8010 erikvl87/languagetool'
      });
    }
  } catch (error) {
    console.error('[LanguageTool Controller Error]:', error);
    return res.json({
      matches: [],
      serviceAvailable: false,
      message: error.message || 'Grammar check failed'
    });
  }
};
