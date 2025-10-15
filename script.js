const secretMap = {
    A:"nav", B:"lin", C:"hom", D:"gra", E:"na", F:"ich", G:"mul", H:"an",
    I:"hu", J:"mu", K:"ttu", L:"kal", M:"niyo", N:"re", O:"prk", P:"rim",
    Q:"chun", R:"da", S:"kodh", T:"dra", U:"ve", V:"shom", W:"sop",
    X:"lo", Y:"mya", Z:"bro"
  };

  // Reverse map: secretWord -> letter
  const reverseMap = Object.fromEntries(Object.entries(secretMap).map(([k,v]) => [v, k]));

  // All secret words sorted longest-first (for greedy matching)
  const secretWords = Object.keys(reverseMap).sort((a,b) => b.length - a.length);

  // --- Helper: greedy parse one token of secret into letters; returns array of letters or null if cannot parse fully
  function parseSecretToken(token) {
    token = token.toLowerCase();
    let i = 0;
    const letters = [];
    while (i < token.length) {
      let matched = null;
      for (const w of secretWords) {
        if (token.startsWith(w, i)) {
          matched = w;
          letters.push(reverseMap[w]);
          i += w.length;
          break;
        }
      }
      if (!matched) return null; // failed to segment this token entirely
    }
    return letters; // array of letters like ['V','E','O']
  }

  // Secret -> English
  // If input contains spaces, keep tokens separated (e.g., "shom na prk" -> "V E O")
  // If input is a single token, return concatenated letters with sentence case ("shomnaprk" -> "Veo")
  function secretToEnglish(original) {
    const tokens = original.trim().split(/\s+/);
    const allParsed = [];
    for (const t of tokens) {
      const parsed = parseSecretToken(t);
      if (!parsed) return null; // if any token can't be parsed fully, fail
      allParsed.push(parsed);
    }
    // Format output:
    if (tokens.length === 1) {
      // single token -> join letters and sentence-case (First letter capital, rest lower)
      const letters = allParsed[0].join('');
      return letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase();
    } else {
      // multi-token input -> for each token, output its letters as uppercase (single-letter tokens become single uppercase letters)
      const parts = allParsed.map(parsed => parsed.join('').toUpperCase());
      // If tokens were single-letter secret words, parts will be like ["V","E","O"] -> join with spaces becomes "V E O"
      return parts.join(' ');
    }
  }

  // English -> Secret
  // Preserve spaces between tokens; letters map to secret words and are concatenated per token.
  function englishToSecret(original) {
    const tokens = original.trim().split(/\s+/);
    const parts = tokens.map(token => {
      let out = "";
      for (const ch of token) {
        const up = ch.toUpperCase();
        if (secretMap[up]) {
          out += secretMap[up]; // concatenate secret word (lowercase)
        } else {
          out += ch; // keep punctuation / numbers as-is
        }
      }
      return out.toLowerCase();
    });
    return parts.join(" ");
  }

  // Main convert flow: try secret->english (only if entire input parses). If that fails, do english->secret.
  document.getElementById("convertBtn").addEventListener("click", () => {
    const input = document.getElementById("secretInput").value;
    const outputDiv = document.getElementById("secretOutput");
    if (!input.trim()) { outputDiv.textContent = ""; return; }

    // Try secret->english first (using greedy full-token parsing)
    const secretTry = secretToEnglish(input);
    if (secretTry !== null) {
      outputDiv.textContent = secretTry;
      return;
    }

    // Else treat as English -> secret
    const engToSecret = englishToSecret(input);
    outputDiv.textContent = engToSecret;
  });

  // clear and copy buttons
  document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("secretInput").value = "";
    document.getElementById("secretOutput").textContent = "";
  });

  document.getElementById("copyBtn").addEventListener("click", async () => {
    const txt = document.getElementById("secretOutput").textContent;
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      // small visual feedback
      document.getElementById("copyBtn").textContent = "Copied!";
      setTimeout(()=> document.getElementById("copyBtn").textContent = "Copy Result", 1200);
    } catch (e) {
      alert("Copy failed — you can select and copy the result manually.");
    }
  });