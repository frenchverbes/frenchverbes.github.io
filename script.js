// API Key für dpaste.com (Wird für den Upload verwendet)
const API_KEY = '99817c306d7e554e'; // BITTE ERSETZEN DURCH IHREN EIGENEN TOKEN

// Standard-Verben (Zurück zur Liste Button)
const AUX_VERBS = ['être', 'avoir']; 

// Tense Map für die Anzeige
const TENSE_MAP = {
    'present': 'Présent (Gegenwart)',
    'passe_compose': 'Passé Composé (Perfekt)',
    'imparfait': 'Imparfait (Vergangenheit)',
    'plus_que_parfait': 'Plus-que-parfait (Vorvergangenheit)'
};

// Pronomen Map
const PRONOUN_MAP = {
    'je': 'je',
    'tu': 'tu',
    'il_elle_on': 'il/elle/on',
    'nous': 'nous',
    'vous': 'vous',
    'ils_elles': 'ils/elles',
};

// UI Zustände
let allVerbes = {};
let verbList = [];
let groupNames = [];
let currentQuiz = {
    questions: [],
    current: 0,
    score: 0,
    settings: null,
    isChecking: false
};

// --- DARK MODE LOGIK ---
const DARK_MODE_KEY = 'frenchverbes_dark_mode';

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem(DARK_MODE_KEY, isDarkMode ? 'enabled' : 'disabled');
    document.getElementById('darkModeToggle').textContent = isDarkMode ? '☀️' : '🌙';
}

function initializeDarkMode() {
    const savedMode = localStorage.getItem(DARK_MODE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedMode === 'enabled' || (savedMode === null && prefersDark)) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').textContent = '☀️';
    } else {
        document.getElementById('darkModeToggle').textContent = '🌙';
    }
}
// -----------------------

async function loadData() {
    initializeDarkMode();
    document.getElementById('resetDataButton').style.display = 'none';

    const urlParams = new URLSearchParams(window.location.search);
    const link = urlParams.get('link') || localStorage.getItem('verbsLink');
    const pathName = window.location.pathname;
    let dataLoaded = false;
    let errorMessage = null;

    if (link) {
        try {
            await loadVerbsFromLink(link);
            dataLoaded = true;
        } catch (e) {
            errorMessage = `Fehler beim Laden der Verben vom Link (${link}): ${e.message}`;
            localStorage.removeItem('verbsLink');
        }
    } else if (pathName.length > 1 && !pathName.includes('index.html')) {
        const id = pathName.substring(1).split('/')[0];
        if (id) {
            try {
                // Link Map wird von der Basis-URL geladen
                const linkMapResponse = await fetch('link_map.json');
                if (!linkMapResponse.ok) {
                    throw new Error(`Konnte link_map.json nicht laden (Status ${linkMapResponse.status}).`);
                }
                const linkMap = await linkMapResponse.json();
                const actualLink = linkMap[id];
                
                if (actualLink) {
                    localStorage.setItem('verbsLink', actualLink);
                    // Weiterleitung, um den Link-Parameter zu verwenden
                    window.location.href = `/?link=${actualLink}`; 
                    return;
                } else {
                    errorMessage = `Die Nummer #${id} ist nicht in der Zuordnungsdatei registriert.`;
                }
            } catch (e) {
                errorMessage = `Fehler bei Kurz-ID (${id}): ${e.message}`;
            }
        }
    }

    if (dataLoaded) {
        setupApp(allVerbes);
        document.getElementById('mainView').style.display = 'block';
        document.getElementById('initialSetupScreen').style.display = 'none';
        document.getElementById('resetDataButton').style.display = 'block';
    } else {
        document.getElementById('mainView').style.display = 'none';
        document.getElementById('initialSetupScreen').style.display = 'block';
        if (!link && !pathName.includes('index.html') && !errorMessage) {
            document.getElementById('loadingStatus').innerHTML = 'Es wurde weder ein Link noch eine Kurz-ID gefunden.';
        } else if (errorMessage) {
            document.getElementById('loadingStatus').innerHTML = `<p class="initial-error-message">Fehler: ${errorMessage}</p>`;
        }
        document.getElementById('loadingStatus').style.display = 'block';
    }
}

/**
 * Ladefunktion mit KORREKTUR für dpaste.com Endungen und JSON-Parsing.
 */
async function loadVerbsFromLink(originalLink) {
    let link = originalLink;

    // Führt immer zu einer .json-Endung für dpaste, um den Rohinhalt zu erzwingen
    if (link.includes('dpaste.com')) {
        if (link.endsWith('/')) link = link.slice(0, -1);
        if (!link.endsWith('.json')) link += '.json';
    }

    const response = await fetch(link);
    if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status} beim Versuch, ${link} zu laden.`);
    }
    
    // 1. VERSUCH: JSON-PARSING
    let json;
    try {
        json = await response.json();
    } catch (e) {
        // Wenn json() fehlschlägt, ist die Datei KEIN GÜLTIGES JSON.
        throw new Error(`Die Datei von ${link} ist kein gültiges JSON. (Details: ${e.message})`);
    }

    // 2. PRÜFUNG: DATENSTRUKTUR (wird nur ausgeführt, wenn 1. erfolgreich war)
    parseVerbes(json);
    
    localStorage.setItem('verbsLink', originalLink);
}

/**
 * Funktion für lokalen Upload oder dpaste-Upload
 * @param {boolean} shouldUpload True, wenn die Datei zu dpaste hochgeladen werden soll.
 */
function handleFileUpload(shouldUpload) {
    const fileInput = document.getElementById('fileUploadInput');
    const file = fileInput.files[0];
    const statusDiv = document.getElementById('loadingStatus');

    if (!file) {
        alert('Bitte wählen Sie eine JSON-Datei aus.');
        return;
    }

    statusDiv.style.display = 'block';
    statusDiv.innerHTML = `Datei wird geprüft...`;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target.result);
            
            if (!json || !json.alle_verben || typeof json.alle_verben !== 'object') {
                throw new Error("JSON-Datei ist leer oder hat das falsche Format ('alle_verben' fehlt).");
            }

            if (shouldUpload) {
                await uploadToDpaste(json, file.name);
            } else {
                // Lokaler Modus
                parseVerbes(json);
                setupApp(allVerbes);
                document.getElementById('mainView').style.display = 'block';
                document.getElementById('initialSetupScreen').style.display = 'none';
                document.getElementById('resetDataButton').style.display = 'block';
                localStorage.removeItem('verbsLink');
                statusDiv.style.display = 'none';
            }
        } catch (error) {
            statusDiv.innerHTML = `<p class="initial-error-message">Fehler beim Parsen der JSON-Datei: ${error.message}</p>`;
        }
    };
    reader.onerror = () => {
        statusDiv.innerHTML = `<p class="initial-error-message">Fehler beim Lesen der hochgeladenen Datei.</p>`;
    };
    reader.readAsText(file);
}

// Versucht, die JSON auf dpaste.com hochzuladen und dann über den Link zu laden
async function uploadToDpaste(json, filename) {
    const statusDiv = document.getElementById('loadingStatus');
    const uploadButton = document.getElementById('uploadToDpasteButton');

    if (!API_KEY || API_KEY === '99817c306d7e554e') {
        alert('Bitte fügen Sie zuerst Ihren dpaste.com API Key in der JavaScript-Datei ein und ersetzen Sie den Platzhalter.');
        return;
    }

    const confirmUpload = confirm('Sind Sie sicher, dass Sie diese Verben-Liste permanent auf dpaste.com hochladen möchten? Sie erhalten danach einen Link, der in Ihrem Browser gespeichert wird.');
    if (!confirmUpload) {
        statusDiv.style.display = 'none';
        return;
    }

    statusDiv.innerHTML = `Lade hoch... (Bitte warten)`;
    uploadButton.disabled = true;

    const content = JSON.stringify(json, null, 2);
    
    const formData = new URLSearchParams();
    formData.append('content', content);
    formData.append('syntax', 'json');
    formData.append('title', filename);
    formData.append('expiry_days', '0'); 
    
    try {
        const response = await fetch('https://dpaste.com/api/v2/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${API_KEY}`, 
                'User-Agent': 'FrenchVerbes-App/1.0',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: formData.toString()
        });

        if (!response.ok) {
            const text = await response.text();
            let errorMsg = `Unbekannter API-Fehler (Status ${response.status})`;
            try {
                const jsonError = JSON.parse(text);
                errorMsg = jsonError.Detail || text.substring(0, 100);
            } catch {
                errorMsg = text.substring(0, 100);
            }
            throw new Error(`Dpaste API-Fehler (${response.status}): ${errorMsg}`);
        }

        const pasteUrl = await response.text(); 
        const linkWithJsonExtension = pasteUrl.trim() + '.json';
        
        localStorage.setItem('verbsLink', pasteUrl.trim()); // Speichert den Basislink ohne .json
        statusDiv.innerHTML = `<strong>Erfolg!</strong> Ihr Link: <a href="${linkWithJsonExtension}" target="_blank">${pasteUrl.trim()}</a>. Die Seite wird neu geladen...`;
        
        setTimeout(() => {
            window.location.reload(); 
        }, 1500);

    } catch (error) {
        statusDiv.innerHTML = `<p class="initial-error-message">Fehler beim Hochladen: ${error.message}</p>`;
        uploadButton.disabled = false;
    }
}

function resetAndShowSetup() {
    const confirmReset = confirm('Möchten Sie die aktuell geladenen Daten verwerfen und zur Daten-Setup-Ansicht zurückkehren?');
    if (confirmReset) {
        localStorage.removeItem('verbsLink');
        window.location.search = ''; 
        window.location.pathname = '/';
        window.location.reload(); 
    }
}

function parseVerbes(data) {
    allVerbes = data.alle_verben;
    verbList = Object.keys(allVerbes).map(infinitiv => ({
        infinitiv,
        ...allVerbes[infinitiv]
    }));

    // Diese Prüfung löst das sekundäre Problem aus.
    // Sie wird nur ausgelöst, wenn das JSON-Parsing ERFOLGREICH war.
    if (!allVerbes['avoir'] || !allVerbes['être']) {
        // Hier wurde der Fehlertext gekürzt und präzisiert, um die Verwechslung zu vermeiden.
        throw new Error("Die Verben 'avoir' und 'être' sind für zusammengesetzte Zeiten erforderlich.");
    }

    groupNames = [...new Set(verbList.map(v => v.gruppe))].sort();
}

// --- SETUP & UI FUNKTIONEN (unverändert) ---

function setupApp(data) {
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
    document.getElementById('listSearchInput').addEventListener('input', debounce(handleListSearch, 300));
    
    generateQuizCheckboxes();

    document.getElementById('initialSetupScreen').style.display = 'none';
    document.getElementById('mainView').style.display = 'block';
    document.getElementById('resetDataButton').style.display = 'block';
    
    displayGroupedVerbList();

    if (!('speechSynthesis' in window)) {
        console.warn("Text-zu-Sprache-Funktion wird von diesem Browser nicht unterstützt.");
    }
}

// JSON-Vorlage Funktion (Korrigiert um die Hilfsverben hervorzuheben)
function getTemplateJson() {
     return {
        "anmerkungen": "Optionale Notizen für diese Verbliste",
        "alle_verben": {
            "être": {
                "deutsch": "sein",
                "gruppe": "Auxiliaire",
                "hilfsverb": "être",
                "participe_passe": "été",
                "conjugaison": {
                    "present": { "je": "suis", "tu": "es", "il_elle_on": "est", "nous": "sommes", "vous": "êtes", "ils_elles": "sont" },
                    "imparfait": { "je": "étais", "tu": "étais", "il_elle_on": "était", "nous": "étions", "vous": "étiez", "ils_elles": "étaient" }
                    // Fügen Sie hier alle Zeiten ein, die Sie abfragen möchten
                }
            },
            "avoir": {
                "deutsch": "haben",
                "gruppe": "Auxiliaire",
                "hilfsverb": "avoir", 
                "participe_passe": "eu",
                "conjugaison": {
                    "present": { "je": "ai", "tu": "as", "il_elle_on": "a", "nous": "avons", "vous": "avez", "ils_elles": "ont" },
                    "imparfait": { "je": "avais", "tu": "avais", "il_elle_on": "avait", "nous": "avions", "vous": "aviez", "ils_elles": "avaient" }
                }
            },
            "parler": {
                "deutsch": "sprechen",
                "gruppe": "er",
                "hilfsverb": "avoir",
                "participe_passe": "parlé",
                "conjugaison": {
                    "present": { "je": "parle", "tu": "parles", "il_elle_on": "parle", "nous": "parlons", "vous": "parlez", "ils_elles": "parlent" },
                    "imparfait": { "je": "parlais", "tu": "parlais", "il_elle_on": "parlait", "nous": "parlions", "vous": "parliez", "ils_elles": "parlaient" }
                }
            }
        }
    };
}

function downloadTemplate() {
    const template = getTemplateJson();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "verbes_template.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function copyTemplateToClipboard() {
    const template = getTemplateJson();
    const jsonString = JSON.stringify(template, null, 2);

    if (navigator.clipboard) {
        navigator.clipboard.writeText(jsonString).then(() => {
            alert("JSON-Vorlage in die Zwischenablage kopiert!");
        }).catch(err => {
            alert('Kopieren fehlgeschlagen. Bitte manuell kopieren.');
        });
    } else {
        alert('Kopieren fehlgeschlagen. Bitte manuell kopieren.');
    }
}

// --- SUCH-FUNKTIONEN (unverändert) ---

function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    const resultDiv = document.getElementById('verbDetails');
    const initialHint = document.getElementById('initialHint');
    const generalInfo = document.getElementById('generalInfo');

    resultDiv.style.display = 'none';
    initialHint.style.display = 'none';
    generalInfo.style.display = 'none';
    resultDiv.innerHTML = '';

    if (query.length < 2) {
        initialHint.textContent = 'Bitte geben Sie mindestens 2 Buchstaben ein.';
        initialHint.style.display = 'block';
        return;
    }

    const foundVerb = verbList.find(v => 
        v.infinitiv.toLowerCase().includes(query) || 
        v.deutsch.toLowerCase().includes(query)
    );

    if (foundVerb) {
        displayVerbDetails(foundVerb, resultDiv);
        resultDiv.style.display = 'block';
    } else if (query === 'regeln' || query === 'imparfait') {
        generalInfo.style.display = 'block';
    } else {
        initialHint.textContent = 'Verb nicht gefunden. Versuchen Sie es mit Infinitiv oder deutscher Übersetzung.';
        initialHint.style.display = 'block';
    }
}

function handleListSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    displayGroupedVerbList(query);
}

// Debounce-Funktion zur Begrenzung der Suchhäufigkeit
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// --- UI HILFSFUNKTIONEN (unverändert) ---

function displayVerbDetails(verb, targetElement) {
    const conjugations = verb.conjugaison || {};
    const tenseKeys = Object.keys(TENSE_MAP);

    let html = `
        <h2>${verb.infinitiv} (${verb.deutsch})</h2>
        <p>| Gruppe: ${verb.gruppe} | Hilfsverb (PC / PQP): <strong>${verb.hilfsverb || 'N/A'}</strong> | Participe Passé: <strong>${verb.participe_passe || 'N/A'}</strong></p>
        <button onclick="speakText('${verb.infinitiv}', 'fr-FR')" title="Aussprache des Infinitivs" style="margin-bottom: 20px;">🔊 Aussprache des Infinitivs</button>
    `;

    for (const tenseKey of tenseKeys) {
        const tenseData = conjugations[tenseKey];
        if (tenseData) {
            html += `
                <h3>${TENSE_MAP[tenseKey]}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Person</th>
                            <th>Konjugation</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            for (const [pronounKey, conjugation] of Object.entries(PRONOUN_MAP)) {
                const conjugatedForm = tenseData[pronounKey] || '-';
                html += `
                    <tr>
                        <td data-label="Person">${conjugation}</td>
                        <td data-label="${TENSE_MAP[tenseKey].split('(')[0].trim()}">${conjugatedForm}</td>
                    </tr>
                `;
            }
            html += `
                    </tbody>
                </table>
            `;
        }
    }

    targetElement.innerHTML = html;
}

function displayGroupedVerbList(filterQuery = '') {
    const listDiv = document.getElementById('modalVerbList');
    listDiv.innerHTML = '';
    
    const filteredVerbs = verbList.filter(v => 
        v.infinitiv.toLowerCase().includes(filterQuery) || 
        v.deutsch.toLowerCase().includes(filterQuery)
    );

    if (filteredVerbs.length === 0) {
        listDiv.innerHTML = `<p style="text-align: center; color: var(--error-color);">Keine Verben gefunden, die dem Filter '${filterQuery}' entsprechen.</p>`;
        return;
    }

    const verbsByGroup = filteredVerbs.reduce((acc, verb) => {
        const group = verb.gruppe || 'Unbekannt';
        if (!acc[group]) acc[group] = [];
        acc[group].push(verb);
        return acc;
    }, {});

    for (const group of Object.keys(verbsByGroup).sort()) {
        let ul = `<ul class="verb-group-list">`;
        verbsByGroup[group].sort((a, b) => a.infinitiv.localeCompare(b.infinitiv)).forEach((verb, index) => {
            ul += `
                <li>
                    <span class="verb-number">${index + 1}.</span> 
                    <a href="#" onclick="showModal('conjugation', '${verb.infinitiv}', event)" title="${verb.deutsch}">${verb.infinitiv}</a>
                </li>
            `;
        });
        ul += `</ul>`;
        listDiv.innerHTML += `<h4>${group} Verben (${verbsByGroup[group].length})</h4>${ul}`;
    }
}

function showModal(view, infinitiv = null, event = null) {
    if (event) event.preventDefault();
    const modal = document.getElementById('verbModal');
    
    document.getElementById('verbListView').style.display = 'none';
    document.getElementById('conjugationView').style.display = 'none';
    document.getElementById('quizSettingsView').style.display = 'none';
    document.getElementById('quizQuestionView').style.display = 'none';
    document.getElementById('quizResultView').style.display = 'none';

    document.getElementById('modalTitle').textContent = '';
    
    switch (view) {
        case 'verbList':
            document.getElementById('modalTitle').textContent = 'Verbliste (Gruppiert)';
            document.getElementById('verbListView').style.display = 'flex';
            displayGroupedVerbList(document.getElementById('listSearchInput').value.toLowerCase());
            break;
        case 'conjugation':
            if (infinitiv) {
                const verb = allVerbes[infinitiv];
                document.getElementById('modalTitle').textContent = `Konjugation: ${infinitiv}`;
                displayVerbDetails(verb, document.getElementById('modalVerbDetails'));
                document.getElementById('conjugationView').style.display = 'block';
            }
            break;
        case 'quizSettings':
            document.getElementById('modalTitle').textContent = 'Quiz Einstellungen';
            document.getElementById('quizSettingsView').style.display = 'block';
            break;
        case 'quizQuestion':
            document.getElementById('modalTitle').textContent = 'Quiz: ' + currentQuiz.settings.selectedGroups.join(', ');
            document.getElementById('quizQuestionView').style.display = 'block';
            break;
        case 'quizResult':
            document.getElementById('modalTitle').textContent = 'Quiz beendet';
            document.getElementById('quizResultView').style.display = 'block';
            break;
    }

    modal.classList.add('visible');
}

function closeModal(event) {
    if (!event || event.target.id === 'verbModal' || event.target.className === 'close-button') {
        document.getElementById('verbModal').classList.remove('visible');
    }
}

function speakText(text, lang = 'fr-FR') {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
    }
}

// --- QUIZ LOGIK (unverändert) ---

function generateQuizCheckboxes() {
    const groupContainer = document.getElementById('verbGroupCheckboxes');
    groupContainer.innerHTML = '';
    
    groupNames.forEach(group => {
        const id = `group-${group}`;
        groupContainer.innerHTML += `
            <label class="quiz-option">
                <input type="checkbox" id="${id}" name="group" value="${group}" checked>
                ${group} Verben
            </label>
        `;
    });

    const tenseContainer = document.getElementById('tenseCheckboxes');
    tenseContainer.innerHTML = '';
    Object.entries(TENSE_MAP).forEach(([key, label]) => {
        const id = `tense-${key}`;
        tenseContainer.innerHTML += `
            <label class="quiz-option">
                <input type="checkbox" id="${id}" name="tense" value="${key}" checked>
                ${label}
            </label>
        `;
    });
    
    const pronounContainer = document.getElementById('pronounCheckboxes');
    pronounContainer.innerHTML = '';
    Object.entries(PRONOUN_MAP).forEach(([key, label]) => {
        const id = `pronoun-${key}`;
        pronounContainer.innerHTML += `
            <label class="quiz-option">
                <input type="checkbox" id="${id}" name="pronoun" value="${key}" checked>
                ${label}
            </label>
        `;
    });
}

function startQuiz() {
    const selectedGroups = Array.from(document.querySelectorAll('#verbGroupCheckboxes input:checked')).map(cb => cb.value);
    const selectedTenses = Array.from(document.querySelectorAll('#tenseCheckboxes input:checked')).map(cb => cb.value);
    const selectedPronouns = Array.from(document.querySelectorAll('#pronounCheckboxes input:checked')).map(cb => cb.value);
    const questionCount = parseInt(document.getElementById('questionCountInput').value) || 20;

    if (selectedGroups.length === 0 || selectedTenses.length === 0 || selectedPronouns.length === 0) {
        alert('Bitte wählen Sie mindestens eine Zeitform, eine Verb-Gruppe und ein Personalpronomen aus.');
        return;
    }
    
    const pool = verbList.filter(v => selectedGroups.includes(v.gruppe) && v.conjugaison);
    
    if (pool.length === 0) {
         alert('Es wurden keine Verben in den ausgewählten Gruppen gefunden.');
        return;
    }
    
    const allPossibleQuestions = [];
    pool.forEach(verb => {
        selectedTenses.forEach(tenseKey => {
            if (verb.conjugaison && verb.conjugaison[tenseKey]) {
                selectedPronouns.forEach(pronounKey => {
                    if (verb.conjugaison[tenseKey][pronounKey]) {
                        allPossibleQuestions.push({
                            infinitiv: verb.infinitiv,
                            deutsch: verb.deutsch,
                            tense: tenseKey,
                            pronounKey: pronounKey,
                            correctAnswer: verb.conjugaison[tenseKey][pronounKey],
                            auxVerb: verb.hilfsverb,
                            participePasse: verb.participe_passe
                        });
                    }
                });
            }
        });
    });

    if (allPossibleQuestions.length === 0) {
        alert('Für die gewählte Kombination konnten keine Fragen generiert werden. Bitte prüfen Sie die Konjugationen in Ihrer JSON-Datei.');
        return;
    }

    const shuffledQuestions = allPossibleQuestions.sort(() => 0.5 - Math.random());
    const finalQuestions = shuffledQuestions.slice(0, questionCount);

    currentQuiz.settings = { selectedGroups, selectedTenses, selectedPronouns, questionCount };
    currentQuiz.questions = finalQuestions;
    currentQuiz.current = 0;
    currentQuiz.score = 0;
    currentQuiz.isChecking = false;

    showModal('quizQuestion');
    loadQuestion(currentQuiz.current);
}

function loadQuestion(index) {
    const question = currentQuiz.questions[index];
    const tenseLabel = TENSE_MAP[question.tense].split('(')[0].trim();
    const pronounDisplay = PRONOUN_MAP[question.pronounKey];
    
    document.getElementById('currentQuestionNumber').textContent = index + 1;
    document.getElementById('totalQuestions').textContent = currentQuiz.questions.length;

    document.getElementById('quizPronoun').textContent = pronounDisplay;
    document.getElementById('quizInfinitiv').innerHTML = `${question.deutsch} <span class="infinitiv">(${question.infinitiv})</span>`;
    document.getElementById('quizInfinitiv').onclick = () => speakText(question.infinitiv);
    document.getElementById('quizTense').textContent = tenseLabel;

    document.getElementById('quizInput').value = '';
    document.getElementById('quizInput').focus();
    document.getElementById('quizFeedback').style.display = 'none';
    document.getElementById('checkButton').style.display = 'block';
    document.getElementById('nextButton').style.display = 'none';
    currentQuiz.isChecking = false;
}

function checkAnswer() {
    if (currentQuiz.isChecking) return;
    currentQuiz.isChecking = true;

    const input = document.getElementById('quizInput');
    const feedbackDiv = document.getElementById('quizFeedback');
    const question = currentQuiz.questions[currentQuiz.current];
    
    const userAnswer = input.value.trim().toLowerCase();
    let correctAnswer = question.correctAnswer.toLowerCase();
    let feedbackMessage = '';
    let isCorrect = false;

    if (question.tense === 'passe_compose' || question.tense === 'plus_que_parfait') {
        const auxVerbTenseKey = (question.tense === 'passe_compose') ? 'present' : 'imparfait';
        
        // Die Konjugation des Hilfsverbs muss aus der allVerbes-Struktur gelesen werden
        const auxConjugation = allVerbes[question.auxVerb].conjugaison[auxVerbTenseKey][question.pronounKey];
        correctAnswer = `${auxConjugation} ${question.participePasse}`.toLowerCase().trim();
        
        const simplifiedUserAnswer = removeAccents(userAnswer);
        const simplifiedCorrectAnswer = removeAccents(correctAnswer);

        if (userAnswer === correctAnswer) {
            isCorrect = true;
            feedbackMessage = 'Korrekt! Volle Punktzahl.';
            currentQuiz.score++;
        } else if (simplifiedUserAnswer === simplifiedCorrectAnswer) {
            feedbackMessage = `<strong>Halb richtig!</strong> Akzente/Schreibweise fehlen. Korrekt wäre: <strong>${correctAnswer}</strong>`;
        } else {
            feedbackMessage = `Falsch! Korrekt ist: <strong>${correctAnswer}</strong>`;
        }
    } else {
         const simplifiedUserAnswer = removeAccents(userAnswer);
        const simplifiedCorrectAnswer = removeAccents(correctAnswer);
        
        if (userAnswer === correctAnswer) {
            isCorrect = true;
            feedbackMessage = 'Korrekt! Volle Punktzahl.';
            currentQuiz.score++;
        } else if (simplifiedUserAnswer === simplifiedCorrectAnswer) {
            feedbackMessage = `<strong>Halb richtig!</strong> Akzente/Schreibweise fehlen. Korrekt wäre: <strong>${correctAnswer}</strong>`;
        } else {
            feedbackMessage = `Falsch! Korrekt ist: <strong>${correctAnswer}</strong>`;
        }
    }

    feedbackDiv.innerHTML = feedbackMessage;
    feedbackDiv.className = `quiz-result ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackDiv.style.display = 'block';

    document.getElementById('checkButton').style.display = 'none';
    document.getElementById('nextButton').style.display = 'block';
}

function nextQuestion() {
    currentQuiz.current++;

    if (currentQuiz.current < currentQuiz.questions.length) {
        loadQuestion(currentQuiz.current);
    } else {
        document.getElementById('quizQuestionView').style.display = 'none';
        showQuizResult();
    }
}

function showQuizResult() {
    const scoreDiv = document.getElementById('finalScore');
    const total = currentQuiz.questions.length;
    const score = currentQuiz.score;
    
    scoreDiv.innerHTML = `Sie haben <strong>${score}</strong> von <strong>${total}</strong> Fragen richtig beantwortet.`;
    showModal('quizResult');
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

document.addEventListener('DOMContentLoaded', loadData);